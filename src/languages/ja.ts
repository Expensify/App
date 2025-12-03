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
        count: '合計',
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
        learnMore: '詳しく見る',
        buttonConfirm: '了解',
        name: '名前',
        attachment: '添付ファイル',
        attachments: '添付ファイル',
        center: '中央',
        from: '差出人',
        to: '宛先',
        in: '中',
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
        resend: '再送',
        save: '保存',
        select: '選択',
        deselect: '選択解除',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: '複数選択',
        saveChanges: '変更を保存',
        submit: '送信',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: '提出済み',
        rotate: '回転',
        zoom: 'Zoom',
        password: 'パスワード',
        magicCode: 'マジックコード',
        twoFactorCode: '二要素コード',
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
        review: (reviewParams?: ReviewParams) => `レビュー${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'なし',
        signIn: 'サインイン',
        signInWithGoogle: 'Google でサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'でサインイン',
        continue: 'English\nスペイン語\nドイツ語\nフランス語\nイタリア語\n日本語\nオランダ語\nポーランド語\nポルトガル語（ブラジル）\n中国語（簡体）',
        firstName: '名 (名)',
        lastName: '姓',
        scanning: 'スキャン中',
        addCardTermsOfService: 'Expensify 利用規約',
        perPerson: '1人あたり',
        phone: '電話番号',
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
        recents: '最近の項目',
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
        ssnLast4: 'SSN の下4桁',
        ssnFull9: 'SSN の9桁すべて',
        addressLine: ({lineNumber}: AddressLineParams) => `住所行 ${lineNumber}`,
        personalAddress: '個人住所',
        companyAddress: '会社住所',
        noPO: '私書箱や私設私書箱の住所は使用しないでください。',
        city: '市',
        state: '州',
        streetAddress: '番地住所',
        stateOrProvince: '州 / 県',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: 'に同意します',
        acceptTermsAndPrivacy: `私は <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a> および <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a> に同意します`,
        acceptTermsAndConditions: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">利用規約</a>に同意します`,
        acceptTermsOfService: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a> に同意します`,
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        send: '送信',
        na: '該当なし',
        noResultsFound: '結果が見つかりません',
        noResultsFoundMatching: (searchString: string) => `「${searchString}」に一致する結果は見つかりませんでした`,
        recentDestinations: '最近の行き先',
        timePrefix: 'それは',
        conjunctionFor: '対象',
        todayAt: '本日',
        tomorrowAt: '明日',
        yesterdayAt: '昨日の',
        conjunctionAt: 'で',
        conjunctionTo: '宛先',
        genericErrorMessage: 'おっと…問題が発生したため、リクエストを完了できませんでした。時間をおいてもう一度お試しください。',
        percentage: '割合',
        error: {
            invalidAmount: '無効な金額',
            acceptTerms: '続行するには利用規約に同意する必要があります',
            phoneNumber: `完全な電話番号を入力してください
（例：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: 'このフィールドは必須です',
            requestModified: 'このリクエストは別のメンバーによって変更されています',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `文字数制限を超えています（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '本日以降の日付を選択してください',
            invalidTimeShouldBeFuture: '1分以上先の時間を選択してください',
            invalidCharacter: '無効な文字',
            enterMerchant: '加盟店名を入力',
            enterAmount: '金額を入力',
            missingMerchantName: '支払先名が未入力です',
            missingAmount: '金額が未入力',
            missingDate: '日付がありません',
            enterDate: '日付を入力',
            invalidTimeRange: '12時間制の時刻を入力してください（例：2:30 PM）',
            pleaseCompleteForm: '続行するには上記のフォームに入力してください',
            pleaseSelectOne: '上からオプションを選択してください',
            invalidRateError: '有効なレートを入力してください',
            lowRateError: 'レートは0より大きくなければなりません',
            email: '有効なメールアドレスを入力してください',
            login: 'ログイン中にエラーが発生しました。もう一度お試しください。',
        },
        comma: 'カンマ',
        semicolon: 'セミコロン',
        please: 'お願いします',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'お問い合わせ',
        pleaseEnterEmailOrPhoneNumber: 'メールアドレスまたは電話番号を入力してください',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'エラーを修正してください',
        inTheFormBeforeContinuing: '続行する前にフォームに入力してください',
        confirm: '確認',
        reset: 'リセット',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: '完了',
        more: 'その他',
        debitCard: 'デビットカード',
        bankAccount: '銀行口座',
        personalBankAccount: '個人の銀行口座',
        businessBankAccount: 'ビジネス銀行口座',
        join: '参加',
        leave: '退出',
        decline: '拒否',
        reject: '却下',
        transferBalance: '残高を振替',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: '手動で入力する',
        message: 'メッセージ',
        leaveThread: 'スレッドを退出',
        you: 'あなた',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: 'ヘルプが必要な場合は、Concierge までお問い合わせください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を利用するには、インターネットに接続されている必要があります。',
        attachmentWillBeAvailableOnceBackOnline: 'オンラインに戻ると、添付ファイルを利用できるようになります。',
        errorOccurredWhileTryingToPlayVideo: 'この動画の再生中にエラーが発生しました。',
        areYouSure: '本当によろしいですか？',
        verify: '確認',
        yesContinue: 'はい、続行',
        // @context Provides an example format for a website URL.
        websiteExample: '例：https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `例：${zipSampleFormat}` : ''),
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        createdBy: '作成者',
        with: 'と一緒に',
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
        receipt: '領収書',
        verified: '確認済み',
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
        pm: 'プライベートメッセージ',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: '未定',
        selectCurrency: '通貨を選択',
        selectSymbolOrCurrency: '記号または通貨を選択',
        card: 'カード',
        whyDoWeAskForThis: 'なぜこの情報を求めるのですか？',
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
            title: 'やった！すべて片付きました。',
            subtitleText1: '検索を使用してチャットを見つける',
            subtitleText2: '上のボタンを使用するか、次を使って何かを作成します',
            subtitleText3: '下のボタン',
        },
        businessName: '会社名',
        clear: 'クリア',
        type: 'タイプ',
        reportName: 'レポート名',
        action: 'アクション',
        expenses: '経費',
        totalSpend: '合計支出',
        tax: '税金',
        shared: '共有',
        drafts: '下書き',
        // @context as a noun, not a verb
        draft: '下書き',
        finished: '完了',
        upgrade: 'アップグレード',
        downgradeWorkspace: 'ワークスペースをダウングレード',
        companyID: '会社 ID',
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
        reportID: 'レポートID',
        longID: '長い ID',
        withdrawalID: '出金ID',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'ドロップしてください',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: '無視',
        enabled: '有効',
        disabled: '無効',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'インポート',
        offlinePrompt: '今はこの操作を実行できません。',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: '未処理',
        chats: 'チャット',
        tasks: 'タスク',
        unread: '未読',
        sent: '送信済み',
        links: 'リンク',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: '日',
        days: '日数',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'スキップ',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `何か特定のご要望がありますか？アカウントマネージャーの ${accountManagerDisplayName} とチャットしましょう。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務先メールアドレス',
        destination: '宛先',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: '副レート',
        perDiem: '日当',
        validate: '検証',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSV としてダウンロード',
        help: 'ヘルプ',
        expenseReport: '経費レポート',
        expenseReports: '経費レポート',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'ポリシー外レート',
        leaveWorkspace: 'ワークスペースを退出',
        leaveWorkspaceConfirmation: 'このワークスペースを退出すると、そのワークスペースに経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを離れると、そのレポートや設定を表示できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースを退出すると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、あなたは承認ワークフローでワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、優先エクスポーターとしてのあなたの役割は、ワークスペースのオーナーである${workspaceOwner}に引き継がれます。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、あなたは技術連絡担当者として、ワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
        leaveWorkspaceReimburser:
            'あなたはこのワークスペースの精算担当者のため、退出することはできません。Workspaces > Make or track payments で新しい精算担当者を設定してから、もう一度お試しください。',
        reimbursable: '精算対象',
        editYourProfile: 'プロフィールを編集',
        comments: 'コメント',
        sharedIn: '共有先',
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
        after: '以降',
        reschedule: '再予定設定',
        general: '一般',
        workspacesTabTitle: 'ワークスペース',
        headsUp: '注意！',
        submitTo: '送信先',
        forwardTo: '転送先',
        merge: 'マージ',
        none: 'なし',
        unstableInternetConnection: 'インターネット接続が不安定です。ネットワークを確認して、もう一度お試しください。',
        enableGlobalReimbursements: 'グローバル払い戻しを有効にする',
        purchaseAmount: '購入金額',
        frequency: '頻度',
        link: 'リンク',
        pinned: 'ピン留め',
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
            `サポートでログインしている場合、この操作を行う権限がありません（コマンド: ${command ?? ''}）。Success がこの操作を実行できるべきだと思われる場合は、Slack で会話を開始してください。`,
    },
    lockedAccount: {
        title: 'ロックされたアカウント',
        description: 'このアカウントはロックされているため、この操作を行うことはできません。今後の手順については concierge@expensify.com までご連絡ください。',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: '現在地を特定できませんでした。もう一度お試しいただくか、住所を手動で入力してください。',
        permissionDenied: '位置情報へのアクセスが拒否されているようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可してください',
        tryAgain: 'もう一度お試しください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: 'お気に入りの人たちといつでもすぐにつながれるように、電話から連絡先をインポートしましょう。',
        importContactsExplanation: 'お気に入りの人たちに、いつでもタップひとつでアクセスできます。',
        importContactsNativeText: 'あと一歩です！連絡先をインポートする許可をください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラへのアクセス',
        expensifyDoesNotHaveAccessToCamera: 'カメラへのアクセスが許可されていないため、Expensifyで写真を撮影できません。設定をタップして権限を更新してください。',
        attachmentError: '添付ファイルエラー',
        errorWhileSelectingAttachment: '添付ファイルを選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択中にエラーが発生しました。別のファイルをお試しください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが 24 MB の上限を超えています',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `添付ファイルのサイズが上限の ${maxUploadSizeInMB} MB を超えています`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイトより大きくする必要があります',
        wrongFileType: '無効なファイル形式',
        notAllowedExtension: 'このファイル形式は許可されていません。別のファイル形式をお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルをお試しください。',
        protectedPDFNotSupported: 'パスワードで保護されたPDFには対応していません',
        attachmentImageResized: 'この画像はプレビュー用にサイズが変更されています。フル解像度で表示するにはダウンロードしてください。',
        attachmentImageTooLarge: 'この画像は大きすぎるため、アップロード前にプレビューできません。',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `一度にアップロードできるファイルは${fileLimit}件までです。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルが ${maxUploadSizeInMB} MB を超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルは ${maxUploadSizeInMB} MB 未満である必要があります。これより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度にアップロードできるレシートは最大30枚です。それを超えた分はアップロードされません。',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType} ファイルはサポートされていません。サポートされているファイルタイプのみアップロードされます。`,
        learnMoreAboutSupportedFiles: 'サポートされている形式の詳細を見る',
        passwordProtected: 'パスワード保護されたPDFはサポートされていません。サポートされているファイルのみがアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
        addReceipt: '領収書を追加',
        scanReceipts: 'レシートをスキャン',
        replaceReceipt: '領収書を差し替える',
    },
    filePicker: {
        fileError: 'ファイルエラー',
        errorWhileSelectingFile: 'ファイルの選択中にエラーが発生しました。もう一度お試しください。',
    },
    connectionComplete: {
        title: '接続が完了しました',
        supportingText: 'このウィンドウを閉じて、Expensify アプリに戻ってください。',
    },
    avatarCropModal: {
        title: '写真を編集',
        description: '画像をドラッグ、ズーム、回転してお好みの位置と向きに調整してください。',
    },
    composer: {
        noExtensionFoundForMimeType: '指定された MIME タイプに対応する拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像を取得する際に問題が発生しました',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `コメントの最大文字数は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `タスクタイトルの最大文字数は${formattedMaxLength}文字です。`,
    },
    baseUpdateAppModal: {
        updateApp: 'アプリを更新',
        updatePrompt: 'このアプリの新しいバージョンが利用可能です。  \n今すぐアップデートするか、後でアプリを再起動して最新の変更をダウンロードしてください。',
    },
    deeplinkWrapper: {
        launching: 'Expensify を起動中',
        expired: 'セッションの有効期限が切れました。',
        signIn: 'もう一度サインインしてください。',
        redirectedToDesktopApp: 'デスクトップアプリにリダイレクトしました。',
        youCanAlso: 'また、～することもできます',
        openLinkInBrowser: 'このリンクをブラウザで開いてください',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `${email} としてログインしています。このアカウントでデスクトップアプリにログインするには、プロンプトで「リンクを開く」をクリックしてください。`,
        doNotSeePrompt: 'プロンプトが表示されませんか？',
        tryAgain: '再試行',
        or: '、または',
        continueInWeb: 'Webアプリへ進む',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            アブラカダブラ、
            サインイン完了です！
        `),
        successfulSignInDescription: '続行するには元のタブに戻ってください。',
        title: 'あなたのマジックコードはこちらです',
        description: dedent(`
            元のデバイスで表示されたコードを入力してください
        `),
        doNotShare: dedent(`
            あなたのコードを誰にも共有しないでください。
            Expensify がそのコードを求めることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここからサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻り、新しいコードをリクエストしてください',
        successfulNewCodeRequest: 'コードが要求されました。お使いのデバイスを確認してください。',
        tfaRequiredTitle: dedent(`
            2 要素認証  
            必須
        `),
        tfaRequiredDescription: dedent(`
            ログインしようとしている端末に表示されている  
            2 要素認証コードを入力してください。
        `),
        requestOneHere: 'ここでリクエストしてください。',
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
        description: 'このワークスペースには、御社独自の承認ワークフローが設定されています。Expensify Classic でこの操作を行ってください。',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を提出して、チームを紹介しましょう',
            subtitleText: 'あなたのチームにもExpensifyを使ってほしいですか？そのチーム宛てに経費を提出していただければ、あとはすべてお任せください。',
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
        phrase2: 'お金がすべてを物語ります。チャットと支払いがひとつにまとまった今、そのやり取りも簡単です。',
        phrase3: 'あなたの主張を伝える速さと同じ速さで、支払いもあなたのもとに届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login} さん、ここで新しい顔を見るのはいつだってうれしいです！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `${login} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
    },
    login: {
        hero: {
            header: 'チャットのスピードで進む出張と経費管理',
            body: 'コンテキストに応じたリアルタイムチャットの助けにより、出張と経費精算がこれまで以上にスムーズに進む、次世代の Expensify へようこそ。',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `すでに ${email} としてサインインしています。`,
        goBackMessage: ({provider}: GoBackMessageParams) => `${provider}でサインインしたくありませんか？`,
        continueWithMyCurrentSession: '現在のセッションを続行',
        redirectToDesktopMessage: 'サインインが完了すると、デスクトップアプリにリダイレクトします。',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでログインを続行:',
        orContinueWithMagicCode: 'マジックコードでサインインすることもできます',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: 'マジックコードを使用',
        launching: '起動中...',
        oneMoment: 'お待ちください。会社のシングルサインオンポータルへリダイレクトしています。',
    },
    reportActionCompose: {
        dropToUpload: 'ドロップしてアップロード',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何か入力してください...',
        blockedFromConcierge: '連絡は禁止されています',
        fileUploadFailed: 'アップロードに失敗しました。ファイルはサポートされていません。',
        localTime: ({user, time}: LocalTimeParams) => `${user}の${time}です`,
        edited: '(編集済み)',
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
        onlyVisible: '表示されるユーザーのみ',
        replyInThread: 'スレッドで返信',
        joinThread: 'スレッドに参加',
        leaveThread: 'スレッドを退出',
        copyOnyxData: 'Onyx データをコピー',
        flagAsOffensive: '攻撃的な内容として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクション：',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> のパーティーを逃してしまいました。ここには何もありません。`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `このチャットは、<strong>${domainRoom}</strong> ドメインのすべての Expensify メンバーとのチャットです。 同僚と会話したり、ヒントを共有したり、質問したりするために使ってください。`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `このチャットは<strong>${workspaceName}</strong>管理者とのチャットです。ワークスペースの設定などについて話すために使用してください。`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `このチャットは<strong>${workspaceName}</strong>内の全員とのものです。最も重要なお知らせに利用してください。`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> に関するあらゆる内容のためのものです。`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `このチャットは、<strong>${invoicePayer}</strong> と <strong>${invoiceReceiver}</strong> の間の請求書用です。＋ボタンを使って請求書を送信してください。`,
        beginningOfChatHistory: 'このチャットの相手は',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `ここは、<strong>${submitterDisplayName}</strong> が <strong>${workspaceName}</strong> に経費を提出する場所です。「＋」ボタンを使用してください。`,
        beginningOfChatHistorySelfDM: 'これはあなたの個人スペースです。メモ、タスク、下書き、リマインダーに使用してください。',
        beginningOfChatHistorySystemDM: 'ようこそ！設定を始めましょう。',
        chatWithAccountManager: 'ここでアカウントマネージャーとチャットする',
        sayHello: '挨拶しましょう！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `${roomName} へようこそ！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `+ ボタンを使用して経費を${additionalText}します。`,
        askConcierge: '質問をして、24時間365日リアルタイムのサポートを受けましょう。',
        conciergeSupport: '24時間365日サポート',
        create: '作成',
        iouTypes: {
            pay: '支払う',
            split: '分割',
            submit: '送信',
            track: '追跡',
            invoice: '請求書',
        },
    },
    adminOnlyCanPost: 'このルームでは、管理者のみがメッセージを送信できます。',
    reportAction: {
        asCopilot: 'の Copilot として',
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話の全員に通知',
    },
    newMessages: '新しいメッセージ',
    latestMessages: '最新メッセージ',
    youHaveBeenBanned: '注意: あなたはこのチャネルでのチャットを禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中...',
        multipleMembers: '複数メンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName} がアカウントを閉鎖したため、このチャットはすでに無効です。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `このチャットは、${oldDisplayName} がアカウントを ${displayName} と統合したため、現在はアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>が${policyName}ワークスペースのメンバーではなくなったため、これ以上アクティブではありません。`
                : `このチャットは、${displayName} が ${policyName} ワークスペースのメンバーではなくなったため、これ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、現在は利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、現在は利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'この予約はアーカイブされています。',
    },
    writeCapabilityPage: {
        label: '投稿できる人',
        writeCapability: {
            all: 'すべてのメンバー',
            admins: '管理者のみ',
        },
    },
    sidebarScreen: {
        buttonFind: '何かを検索…',
        buttonMySettings: '自分の設定',
        fabNewChat: 'チャットを開始',
        fabNewChatExplained: 'チャットを開始 (フローティングアクション)',
        fabScanReceiptExplained: '領収書をスキャン',
        chatPinned: 'チャットをピン留めしました',
        draftedMessage: '下書きメッセージ',
        listOfChatMessages: 'チャットメッセージ一覧',
        listOfChats: 'チャット一覧',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
        redirectToExpensifyClassicModal: {
            title: '近日公開予定',
            description: 'お客様の設定に合わせて New Expensify の細かな部分をもう少し調整しているところです。その間は、Expensify Classic をご利用ください。',
        },
    },
    allSettingsScreen: {
        subscription: 'サブスクリプション',
        domains: 'ドメイン',
    },
    tabSelector: {
        chat: 'チャット',
        room: 'ルーム',
        distance: '距離',
        manual: '手動',
        scan: 'スキャン',
        map: '地図',
    },
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        import: 'スプレッドシートをインポート',
        dragAndDrop: '<muted-link>ここにスプレッドシートをドラッグ＆ドロップするか、下からファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。対応しているファイル形式の詳細は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされている形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされているファイル形式の<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細はこちら</a>をご覧ください。</muted-link>`,
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています',
        column: ({name}: SpreadSheetColumnParams) => `列 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `必須フィールド（「${fieldName}」）がマッピングされていません。内容を確認して、もう一度お試しください。`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `おっと！1つのフィールド（「${fieldName}」）を複数の列にマッピングしています。見直してから、もう一度お試しください。`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `おっと！フィールド（「${fieldName}」）には 1 つ以上の空の値が含まれています。確認してから、もう一度お試しください。`,
        importSuccessfulTitle: 'インポートに成功しました',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `${categories} 個のカテゴリーを追加しました。` : '1件のカテゴリーが追加されました。',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'メンバーは追加または更新されていません。';
            }
            if (added && updated) {
                return `${added} 人のメンバー${added > 1 ? 's' : ''}を追加、${updated} 人のメンバー${updated > 1 ? 's' : ''}を更新しました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 名のメンバーを更新しました。` : '1名のメンバーが更新されました。';
            }
            return added > 1 ? `${added}人のメンバーが追加されました。` : 'メンバーが1人追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} 個のタグを追加しました。` : '1 個のタグが追加されました。'),
        importMultiLevelTagsSuccessfulDescription: '多階層タグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} 件の日当レートが追加されました。` : '1つの日当レートが追加されました。',
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべての項目が正しく入力されていることを確認して、もう一度お試しください。問題が解決しない場合は、Concierge までお問い合わせください。',
        importDescription: '下のインポートされた各列の横にあるドロップダウンをクリックして、スプレッドシートからマッピングするフィールドを選択してください。',
        sizeNotMet: 'ファイルサイズは 0 バイトより大きくなければなりません',
        invalidFileMessage:
            'アップロードされたファイルは空であるか、無効なデータが含まれています。ファイルが正しい形式で、必要な情報が含まれていることを確認してから、もう一度アップロードしてください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSVをダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードで追加される、新しいワークスペースメンバーの詳細を以下で確認してください。既存のメンバーには、役割の更新や招待メッセージは送信されません。`,
            other: (count: number) =>
                `このアップロードで追加される新しいワークスペースメンバー ${count} 名の詳細を以下で確認してください。既存のメンバーには、ロールの更新や招待メッセージは送信されません。`,
        }),
    },
    receipt: {
        upload: 'レシートをアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `またはここにドラッグ＆ドロップしてください`,
        desktopSubtitleMultiple: `またはここにドラッグ＆ドロップします`,
        alternativeMethodsTitle: '領収書を追加するその他の方法:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>して、携帯電話からスキャンしましょう</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を <a href="mailto:${email}">${email}</a> に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">あなたの番号を追加</a>して、領収書を${phoneNumber}にテキスト送信します</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>${phoneNumber} にレシートをテキスト送信（米国の番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: '領収書の写真を撮影するには、カメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセスがまだ許可されていません。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">こちらの手順</a>に従ってください。`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真の撮影中にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        allowLocationFromSetting: `位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保つことができます。デバイスの権限設定から位置情報アクセスを許可してください。`,
        dropTitle: '放っておく',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'このレシートを削除してもよろしいですか？',
        addReceipt: '領収書を追加',
        scanFailed: 'このレシートは、店舗名・日付・金額のいずれかが欠けているため、スキャンできませんでした。',
    },
    quickAction: {
        scanReceipt: 'レシートをスキャン',
        recordDistance: '移動距離を記録',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: 'レシートを分割',
        splitDistance: '距離の分割',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支払う ${name ?? '誰か'}`,
        assignTask: 'タスクを割り当て',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイックアクションの送信先には、もうアクセスできません。下から新しい送信先を選択してください。',
        updateDestination: '送付先を更新',
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
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには、少なくとも 1 つ追加してください。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${merchant} の ${amount} を編集`,
        removeSplit: '分割を削除',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払済みの経費は編集できません',
        paySomeone: ({name}: PaySomeoneParams = {}) => `支払う ${name ?? '誰か'}`,
        expense: '経費',
        categorize: '分類',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '移動距離を記録',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `${expensesNumber}件の経費精算を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'このレシートを削除してもよろしいですか？この操作は元に戻せません。',
        addExpense: '経費を追加',
        chooseRecipient: '受取人を選択',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}件の経費を作成`,
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
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `この経費${reportName ? `<a href="${reportUrl}">${reportName}</a> から` : ''}を移動しました`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費はあなたの<a href="${reportUrl}">個人スペース</a>から移動しました`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費をあなたの<a href="${reportUrl}">パーソナルスペース</a>に移動しました`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `このレポートを<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
            }
            return `この<a href="${movedReportUrl}">レポート</a>を<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: 'カード取引との照合保留中',
        pendingMatch: '保留中の照合',
        pendingMatchWithCreditCardDescription: '領収書はカード取引との照合待ちです。キャンセルするには現金としてマークしてください。',
        markAsCash: '現金としてマーク',
        routePending: 'ルート保留中…',
        receiptScanning: () => ({
            one: '領収書をスキャン中…',
            other: '領収書をスキャン中…',
        }),
        scanMultipleReceipts: '複数のレシートをスキャン',
        scanMultipleReceiptsDescription: 'すべてのレシートを一度に撮影し、内容を自分で確認するか、私たちにお任せください。',
        receiptScanInProgress: '領収書のスキャンを実行中',
        receiptScanInProgressDescription: 'レシートのスキャンを処理中です。後で確認するか、今すぐ詳細を入力してください。',
        removeFromReport: 'レポートから削除',
        moveToPersonalSpace: '経費をあなたの個人スペースに移動',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? '重複の可能性がある経費が検出されました。申請を有効にするには、重複を確認してください。'
                : '重複の可能性がある経費が検出されました。承認を可能にするには、重複を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '見つかった問題',
        }),
        fieldPending: '保留中…',
        defaultRate: 'デフォルトレート',
        receiptMissingDetails: '領収書に詳細がありません',
        missingAmount: '金額が未入力',
        missingMerchant: '加盟店がありません',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のレシートはあなただけが見ることができます。あとで確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。詳細を手動で入力してください。',
        transactionPendingDescription: '取引は保留中です。反映されるまで数日かかる場合があります。',
        companyInfo: '会社情報',
        companyInfoDescription: '初めての請求書を送信する前に、もう少し詳細が必要です。',
        yourCompanyName: '会社名',
        yourCompanyWebsite: '御社の会社ウェブサイト',
        yourCompanyWebsiteNote: 'ウェブサイトをお持ちでない場合は、代わりに会社のLinkedInまたはソーシャルメディアのプロフィールを入力できます。',
        invalidDomainError: '無効なドメインが入力されています。続行するには、有効なドメインを入力してください。',
        publicDomainError: 'パブリックドメインが入力されています。続行するには、プライベートドメインを入力してください。',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} 件の領収書をスキャン中`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} 件が保留中`);
            }
            return {
                one: statusText.length > 0 ? `1 件の経費（${statusText.join(', ')}）` : `1件の経費`,
                other: (count: number) => (statusText.length > 0 ? `${count}件の経費（${statusText.join(', ')}）` : `${count}件の経費`),
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
            one: 'この経費を本当に削除しますか？',
            other: 'これらの経費を削除してもよろしいですか？',
        }),
        deleteReport: 'レポートを削除',
        deleteReportConfirmation: 'このレポートを削除してもよろしいですか？',
        settledExpensify: '支払い済み',
        done: '完了',
        settledElsewhere: '他の方法で支払済み',
        individual: '個人',
        business: 'ビジネス',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify で ${formattedAmount} を支払う` : `Expensify で支払う`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `個人として ${formattedAmount} を支払う` : `個人アカウントで支払う`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `ウォレットで ${formattedAmount} を支払う` : `ウォレットで支払う`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} を支払う`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} をビジネスとして支払う` : `ビジネスアカウントで支払う`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} を支払い済みにする` : `支払い済みにする`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `個人アカウント（末尾 ${last4Digits}）で ${amount} を支払いました` : `個人アカウントで支払い済み`,
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `ビジネスアカウント ${last4Digits} で ${amount} を支払いました` : `ビジネスアカウントで支払い済み`,
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${policyName} で ${formattedAmount} を支払う` : `${policyName}で支払う`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `銀行口座（下4桁${last4Digits}）で${amount}を支払いました` : `銀行口座（下4桁 ${last4Digits}）で支払い済み`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>に従い、銀行口座（下4桁 ${last4Digits}）で${amount ? `${amount} ` : ''}を支払いました`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `個人アカウント • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `ビジネスアカウント • ${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} の請求書を送信`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `${comment} のため` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `送信済み${memo ? `、${memo} と言って` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出の遅延</a>から送信されました`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `${comment} のため` : ''} を追跡中`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} を分割`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `分割 ${formattedAmount}${comment ? `${comment} のため` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `あなたの分担額 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} は ${amount}${comment ? `${comment} のため` : ''} を支払う必要があります`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} の負担額:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} が支払いました:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} は ${amount} を支払いました`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} の支出：`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} が承認しました:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} が ${amount} を承認しました`,
        payerSettled: ({amount}: PayerSettledParams) => `${amount} を支払いました`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount}が支払われました。支払いを受け取るには銀行口座を追加してください。`,
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
            `${submitterDisplayName} が銀行口座を追加しました。${amount} の支払いが行われました。`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}支払い済みにマークしました`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}ウォレットで支払い済み`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}は<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>経由でExpensifyを使って支払われました`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます',
        changedTheExpense: '経費を変更しました',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant} に設定し、それにより金額が ${newAmountToDisplay} に設定されました`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（以前は ${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} を ${newValueToDisplay} に変更（以前は ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant}（以前は ${oldMerchant}）に変更しました。それに伴い、金額が ${newAmountToDisplay}（以前は ${oldAmountToDisplay}）に更新されました`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースのルール</a>に基づく` : 'ワークスペースルールに基づく'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `${comment}用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} 送信済み${comment ? `${comment} のため` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `経費を個人スペースから${workspaceName ?? `${reportName}とチャット`}に移動しました`,
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? '1つの' : 'a';
            const tag = policyTagListName ?? 'タグ';
            return `支出をより適切に整理するために、${article} ${tag} を選択してください。`;
        },
        categorySelection: '支出をより整理しやすくするために、カテゴリを選択してください。',
        error: {
            invalidCategoryLength: 'カテゴリー名が255文字を超えています。短くするか、別のカテゴリーを選択してください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選択してください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidIntegerAmount: '続行する前にドルの整数金額を入力してください',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税額は${amount}です`,
            invalidSplit: '分割の合計は合計金額と一致している必要があります',
            invalidSplitParticipants: '少なくとも 2 人の参加者に対して、0 より大きい金額を入力してください',
            invalidSplitYourself: '分割する金額には 0 以外の金額を入力してください',
            noParticipantSelected: '参加者を選択してください',
            other: '予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateFailureMessage: 'この経費の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留解除中に予期せぬエラーが発生しました。後でもう一度お試しください。',
            receiptDeleteFailureError: 'この領収書の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage: '<rbr>領収書のアップロード中にエラーが発生しました。後で<a href="download">領収書を保存</a>してから、<a href="retry">再試行</a>してください。</rbr>',
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            genericDeleteFailureMessage: 'この経費の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: '取引に不足している項目があります',
            duplicateWaypointsErrorMessage: '重複しているウェイポイントを削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも 2 つの異なる住所を入力してください',
            splitExpenseMultipleParticipantsErrorMessage: '経費はワークスペースと他のメンバー間で分割できません。選択内容を更新してください。',
            invalidMerchant: '有効な支払先名を入力してください',
            atLeastOneAttendee: '少なくとも 1 人の出席者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量は0より大きくなければなりません',
            invalidSubrateLength: 'サブレートが少なくとも 1 つ必要です',
            invalidRate: 'このワークスペースでは無効なレートです。ワークスペースから利用可能なレートを選択してください。',
        },
        dismissReceiptError: 'エラーを閉じる',
        dismissReceiptErrorConfirmation: '注意！このエラーを閉じると、アップロードした領収書は完全に削除されます。本当に続行しますか？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `清算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留されます。`,
        enableWallet: 'ウォレットを有効にする',
        hold: '保留',
        unhold: '保留を解除',
        holdExpense: () => ({
            one: '経費を保留',
            other: '経費を保留',
        }),
        unholdExpense: '経費の保留を解除',
        heldExpense: 'この経費を保留しました',
        unheldExpense: 'この経費の保留を解除しました',
        moveUnreportedExpense: '未報告の経費を移動',
        addUnreportedExpense: '未報告の経費を追加',
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1件選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。下から新しい経費を作成してみてください。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留している理由を説明してください。',
            other: 'これらの経費を保留している理由を説明してください。',
        }),
        retracted: '撤回済み',
        retract: '取り消す',
        reopened: '再開済み',
        reopenReport: 'レポートを再公開',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。本当にこのレポートを再度開きますか？`,
        reason: '理由',
        holdReasonRequired: '保留する場合は理由が必要です。',
        expenseWasPutOnHold: '経費が保留されました',
        expenseOnHold: 'この経費は保留中です。今後の対応についてはコメントをご確認ください。',
        expensesOnHold: '全ての経費が保留になりました。次のステップについてはコメントを確認してください。',
        expenseDuplicate: 'この経費は、ほかの経費と詳細が似ています。続行するには、重複しているものを確認してください。',
        someDuplicatesArePaid: 'これらの重複の中には、すでに承認済みまたは支払済みのものがあります。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて保持',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認します。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費精算は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払金額の確認',
        confirmPayAmount: '保留中ではない項目を支払うか、レポート全体を支払ってください。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費を保留しますか？',
        whatIsHoldExplain: '保留は、経費の提出準備ができるまで、その経費に「一時停止」をかけるようなものです。',
        holdIsLeftBehind: 'レポート全体を提出しても、保留中の経費は残されたままになります。',
        unholdWhenReady: '送信する準備ができたら、経費の保留を解除してください。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースへ移動すると変更されることが多い、次の項目を再確認してください。',
            reCategorize: 'ワークスペースのルールに準拠するように、<strong>任意の経費のカテゴリを再分類</strong>してください。',
            workflows: 'このレポートには、別の<strong>承認ワークフロー</strong>が適用される可能性があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: '設定',
        changed: '変更済み',
        removed: '削除済み',
        transactionPending: '取引保留中',
        chooseARate: 'ワークスペースの払戻しレートを、1マイルまたは1キロメートルあたりで選択してください',
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: '注意！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `このレポートはすでに${accountingIntegration}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。本当にこのレポートの承認を取り消してもよろしいですか？`,
        reimbursable: '精算対象',
        nonReimbursable: '非精算',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約はまだ支払いが行われていないため、保留中です。',
        bookingArchived: 'この予約はアーカイブされています',
        bookingArchivedDescription: 'この予約は、旅行日を過ぎたためアーカイブされています。必要に応じて、最終金額の経費を追加してください。',
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
            other: (count: number) => `最終日：${count.toFixed(2)}時間`,
        }),
        tripLengthText: () => ({
            one: `旅程：1日間`,
            other: (count: number) => `旅行：${count} 日間（全日）`,
        }),
        dates: '日付',
        rates: 'レート',
        submitsTo: ({name}: SubmitsToParams) => `${name} に提出`,
        reject: {
            educationalTitle: '保留すべきですか、それとも却下すべきですか？',
            educationalText: '経費の承認や支払いの準備がまだできていない場合は、その経費を保留または却下できます。',
            holdExpenseTitle: '承認または支払いの前に、詳細を確認するために経費を保留します。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたままにしつつ、他の経費を承認します。',
            heldExpenseLeftBehindTitle: 'レポート全体を承認すると、保留中の経費は残されたままになります。',
            rejectExpenseTitle: '承認または支払う予定のない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を却下する理由を説明してください。',
            rejectReason: '却下理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費は却下されました。問題を修正し、「解決済み」としてマークしてから再提出できるようにしてください。',
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
                `<a href="${workflowSettingLink}">ワークフロー設定</a>で、すべてのレポートの承認者を今後も有効な形で変更することもできます。`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `承認者を <mention-user accountID="${managerID}"/> に変更しました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに承認者を追加する',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '自分を最終承認者として設定し、残りの承認者をすべてスキップします。',
            },
            addApprover: {
                subtitle: 'このレポートを残りの承認ワークフローに回付する前に、追加の承認者を選択してください。',
            },
        },
        chooseWorkspace: 'ワークスペースを選択',
    },
    transactionMerge: {
        listPage: {
            header: '経費をマージ',
            noEligibleExpenseFound: '対象となる経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費と統合できる経費はありません。対象となる経費の詳細は、<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">こちら</a>をご覧ください。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '領収書を選択',
            pageTitle: '保持したいレシートを選択してください：',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保持したい詳細を選択してください:',
            noDifferences: '取引間に差異は見つかりませんでした',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '1つの' : 'a';
                return `${article} ${field} を選択してください`;
            },
            pleaseSelectAttendees: '参加者を選択してください',
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
        numberHasNotBeenValidated: 'この番号はまだ認証されていません。ボタンをクリックして、テキストメッセージで認証リンクを再送してください。',
        emailHasNotBeenValidated: 'メールが認証されていません。ボタンをクリックして、テキストメッセージで認証リンクを再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を表示',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: '申し訳ありません。ワークスペースのアバター削除中に予期しない問題が発生しました',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択された画像は、最大アップロードサイズの ${maxUploadSizeInMB} MB を超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `${minHeightInPx}x${minWidthInPx} ピクセルより大きく、${maxHeightInPx}x${maxWidthInPx} ピクセルより小さい画像をアップロードしてください。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `プロフィール写真は次のいずれかのタイプである必要があります: ${allowedExtensions.join(', ')}。`,
    },
    avatarPage: {
        title: 'プロフィール写真を編集',
        upload: 'アップロード',
        uploadPhoto: '写真をアップロード',
        selectAvatar: 'アバターを選択',
        choosePresetAvatar: 'またはカスタムアバターを選択',
    },
    modal: {
        backdropLabel: 'モーダルの背景',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が経費を追加するのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待っています。`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `これ以上の対応は不要です！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の銀行口座の追加待ちです。`;
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
                        return `<strong>あなた</strong>の経費が自動送信されるのを待機中${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> の経費が自動送信されるのを待機中${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動的に提出されるのを待機中${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `問題の修正を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が問題を修正するのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を修正するのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の経費承認待ちです。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> の経費承認待ち。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を承認するのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートをエクスポートするのを<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がこのレポートをエクスポートするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `このレポートをエクスポートする管理者を待機中です。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の経費精算の支払い待ちです。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費の支払いを行うのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `ビジネス銀行口座の設定が完了するのを<strong>あなた</strong>が終えるのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がビジネス用銀行口座の設定を完了するのを待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス銀行口座の設定を完了するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta} までに` : ` ${eta}`;
                }
                return `支払いの完了を待機しています${formattedETA}。`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後ほど',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月末最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月末最終日',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '旅行の終わりに',
        },
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望の代名詞',
        selectYourPronouns: '代名詞を選択',
        selfSelectYourPronoun: '自身の代名詞を選択',
        emailAddress: 'メールアドレス',
        setMyTimezoneAutomatically: 'タイムゾーンを自動的に設定する',
        timezone: 'タイムゾーン',
        invalidFileMessage: '無効なファイルです。別の画像をお試しください。',
        avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
        online: 'オンライン',
        offline: 'オフライン',
        syncing: '同期中',
        profileAvatar: 'プロフィールアバター',
        publicSection: {
            title: '公開',
            subtitle: 'これらの詳細はあなたの公開プロフィールに表示され、誰でも見ることができます。',
        },
        privateSection: {
            title: '非公開',
            subtitle: 'これらの詳細は、旅行および支払いのために使用されます。あなたの公開プロフィールに表示されることは決してありません。',
        },
    },
    securityPage: {
        title: 'セキュリティオプション',
        subtitle: '2 要素認証を有効にして、アカウントを安全に保ちましょう。',
        goToSecurity: 'セキュリティページに戻る',
    },
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '個人用QRコードまたは紹介リンクを共有して、メンバーをExpensifyに招待しましょう。',
    },
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: 'オプションを表示するには検索してください',
    },
    contacts: {
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を利用するには、アカウントの確認が必要です。',
        validateAccount: 'アカウントを確認してください',
        helpText: ({email}: {email: string}) =>
            `Expensify にログインしたり、領収書を送信したりする方法をさらに追加しましょう。<br/><br/>領収書を転送するメールアドレスとして <a href="mailto:${email}">${email}</a> を追加するか、電話番号を追加して、領収書を 47777（米国の電話番号のみ）にテキスト送信できるようにします。`,
        pleaseVerify: 'この連絡方法を確認してください。',
        getInTouch: 'この方法でご連絡します。',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod} に送信されたマジックコードを入力してください。1〜2分以内に届きます。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在のデフォルト連絡方法です。削除する前に、別の連絡方法を選択して「デフォルトに設定」をクリックする必要があります。',
        removeContactMethod: '連絡方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡先方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。少し待ってから、もう一度お試しください。',
            validateSecondaryLogin: '不正または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡方法の削除に失敗しました。サポートが必要な場合はConciergeまでお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法を設定できませんでした。サポートが必要な場合は Concierge までお問い合わせください。',
            addContactMethod: 'この連絡方法を追加できませんでした。サポートが必要な場合は Concierge にお問い合わせください。',
            enteredMethodIsAlreadySubmitted: 'この連絡方法はすでに存在します',
            passwordRequired: 'パスワードが必要です。',
            contactMethodRequired: '連絡方法は必須です',
            invalidContactMethod: '無効な連絡方法',
        },
        newContactMethod: '新しい連絡方法',
        goBackContactMethods: '連絡先に戻る',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '彼／彼／彼の',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: 'She／Her／Hers',
        sheHerHersTheyThemTheirs: 'She（彼女） / Her（彼女を） / Hers（彼女のもの） / They（彼ら） / Them（彼らを） / Theirs（彼らのもの）',
        merMers: 'Mer / Mers',
        neNirNirs: 'ネー / ニアー / ニアズ',
        neeNerNers: 'ニー / ニア / ニアズ',
        perPers: '人あたり / 人数',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'トン / トン',
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
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されます。',
        getLocationAutomatically: '現在地を自動的に取得',
    },
    updateRequiredView: {
        updateRequired: '更新が必要です',
        pleaseInstall: '最新バージョンの New Expensify に更新してください',
        pleaseInstallExpensifyClassic: '最新バージョンの Expensify をインストールしてください',
        toGetLatestChanges: 'モバイルまたはデスクトップの場合は、最新バージョンをダウンロードしてインストールしてください。Web の場合は、ブラウザを更新してください。',
        newAppNotAvailable: '新しい Expensify アプリは、もう利用できません。',
    },
    initialSettingsPage: {
        about: '概要',
        aboutPage: {
            description: '新しい Expensify アプリは、世界中のオープンソース開発者コミュニティによって作られています。Expensify の未来を一緒に作りましょう。',
            appDownloadLinks: 'アプリのダウンロードリンク',
            viewKeyboardShortcuts: 'キーボードショートカットを表示',
            viewTheCode: 'コードを表示',
            viewOpenJobs: '未完了のジョブを表示',
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
            clearCacheAndRestart: 'キャッシュを消去して再起動',
            viewConsole: 'デバッグコンソールを表示',
            debugConsole: 'デバッグコンソール',
            description:
                '<muted-text>以下のツールを使用して、Expensify の利用体験に関する問題をトラブルシュートできます。問題が発生した場合は、<concierge-link>バグを報告</concierge-link>してください。</muted-text>',
            confirmResetDescription: '未送信の下書きメッセージはすべて失われますが、それ以外のデータは安全です。',
            resetAndRefresh: 'リセットして再読み込み',
            clientSideLogging: 'クライアント側ログ',
            noLogsToShare: '共有できるログはありません',
            useProfiling: 'プロファイリングを使用',
            profileTrace: 'プロファイルトレース',
            results: '結果',
            releaseOptions: 'リリースオプション',
            testingPreferences: 'テスト設定',
            useStagingServer: 'ステージングサーバーを使用',
            forceOffline: 'オフラインを強制',
            simulatePoorConnection: 'インターネット接続不良をシミュレート',
            simulateFailingNetworkRequests: 'ネットワークリクエストの失敗をシミュレート',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイス認証情報',
            invalidate: '無効化',
            destroy: '削除',
            maskExportOnyxStateData: 'Onyx の状態をエクスポートする際に、壊れやすいメンバー データをマスクする',
            exportOnyxState: 'Onyx ステートをエクスポート',
            importOnyxState: 'Onyx ステートをインポート',
            testCrash: 'クラッシュをテスト',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用しています。ここを押してクリアします。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルは有効ではありません。もう一度お試しください。',
            invalidateWithDelay: '遅延して無効化',
            recordTroubleshootData: 'トラブルシューティングデータを記録',
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
        readTheTermsAndPrivacy: `<muted-text-micro><a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>をお読みください。</muted-text-micro>`,
        help: 'ヘルプ',
        whatIsNew: '新着情報',
        accountSettings: 'アカウント設定',
        account: 'アカウント',
        general: '一般',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'アカウントを閉じる',
        reasonForLeavingPrompt: '退会されるのは残念です。改善のために、よろしければ理由を教えていただけますか？',
        enterMessageHere: 'ここにメッセージを入力',
        closeAccountWarning: 'アカウントを閉鎖すると、元に戻すことはできません。',
        closeAccountPermanentlyDeleteData: 'アカウントを本当に削除しますか？未処理の経費はすべて完全に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉鎖する意思を確認するため、デフォルトの連絡方法を入力してください。あなたのデフォルトの連絡方法は：',
        enterDefaultContact: 'デフォルトの連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法:',
        enterYourDefaultContactMethod: 'アカウントを閉鎖するには、デフォルトの連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `<strong>${login}</strong> に統合したいアカウントを入力してください。`,
            notReversibleConsent: 'これは取り消せないことを理解しています',
        },
        accountValidate: {
            confirmMerge: 'アカウントを統合してもよろしいですか？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `アカウントの統合は元に戻すことができず、<strong>${login}</strong> の未提出の経費はすべて失われます。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `続行するには、<strong>${login}</strong> に送信されたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: '不正または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントを統合しました！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text><strong>${from}</strong> のすべてのデータを <strong>${to}</strong> に正常にマージしました。今後、このアカウントにはどちらのログイン情報も使用できます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '現在対応中です',
            limitedSupport: 'New Expensify では、まだアカウントの統合をサポートしていません。代わりに Expensify Classic でこの操作を行ってください。',
            reachOutForHelp: '<muted-text><centered-text>ご不明な点がありましたら、いつでも<concierge-link>Concierge にお問い合わせください</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classic に移動',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> は <strong>${email.split('@').at(1) ?? ''}</strong> によって管理されているため、統合できません。サポートが必要な場合は、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>ドメイン管理者によってこのメールアドレスがあなたの主なログインとして設定されているため、<strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text><strong>${email}</strong> には二要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong> の2FAを無効にしてから、もう一度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく見る',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているため、マージできません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はExpensifyアカウントを持っていないため、アカウントを統合できません。代わりに、<a href="${contactMethodLink}">連絡先として追加</a>してください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>このアカウントが請求済みの請求関係を所有しているため、<strong>${email}</strong> にアカウントを統合することはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください',
            description: 'アカウントを統合しようとした回数が多すぎます。しばらくしてから、もう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '他のアカウントにマージできません。アカウントが認証されていないためです。アカウントを認証してから、もう一度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: '自分自身のアカウントに統合することはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '不審な行為を報告',
        lockAccount: 'アカウントをロック',
        unlockAccount: 'アカウントのロック解除',
        compromisedDescription:
            'アカウントに何かおかしな点がありますか？報告すると、すぐにアカウントがロックされ、新しい Expensify Card の取引がブロックされ、アカウントの変更ができなくなります。',
        domainAdminsDescription: 'ドメイン管理者向け：これにより、ドメイン全体のすべての Expensify Card のアクティビティと管理者の操作も一時停止されます。',
        areYouSure: 'Expensifyアカウントをロックしてもよろしいですか？',
        onceLocked: '一度ロックされると、アカウントはロック解除リクエストとセキュリティ審査が完了するまで制限されます',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `お客様のアカウントをロックできませんでした。この問題を解決するには、Concierge にチャットでお問い合わせください。`,
        chatWithConcierge: 'Concierge とチャット',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'セキュリティ上の懸念を解決し、アカウントのロックを解除するには、Concierge とチャットしてください。',
        chatWithConcierge: 'Concierge とチャット',
    },
    passwordPage: {
        changePassword: 'パスワードを変更',
        changingYourPasswordPrompt: 'パスワードを変更すると、Expensify.com アカウントと New Expensify アカウントの両方のパスワードが更新されます。',
        currentPassword: '現在のパスワード',
        newPassword: '新しいパスワード',
        newPasswordPrompt: '新しいパスワードは、古いパスワードと異なり、8文字以上で、少なくとも1つの大文字、1つの小文字、1つの数字を含める必要があります。',
    },
    twoFactorAuth: {
        headerTitle: '2 要素認証',
        twoFactorAuthEnabled: '2 要素認証が有効になりました',
        whatIsTwoFactorAuth: '2要素認証（2FA）は、アカウントを安全に保つのに役立ちます。ログインする際、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '2 要素認証を無効にする',
        explainProcessToRemove: '2 要素認証（2FA）を無効にするには、認証アプリから有効なコードを入力してください。',
        explainProcessToRemoveWithRecovery: '2要素認証（2FA）を無効にするには、有効な復旧コードを入力してください。',
        disabled: '2 要素認証は無効になりました',
        noAuthenticatorApp: 'Expensify へのログインに認証アプリは不要になります。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらの復旧コードを安全に保管してください！',
        codesLoseAccess: dedent(`
            認証アプリへのアクセスを失い、これらのコードも持っていない場合、アカウントへのアクセスを失うことになります。

            注: 二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーまたはダウンロードしてください',
        stepVerify: '確認',
        scanCode: 'あなたの…でQRコードをスキャンしてください',
        authenticatorApp: '認証アプリ',
        addKey: 'または、この秘密キーを認証アプリに追加してください:',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2 要素認証が有効になりました',
        congrats: 'おめでとうございます！これで追加のセキュリティが有効になりました。',
        copy: 'コピー',
        disable: '無効にする',
        enableTwoFactorAuth: '2 要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '二要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ上の理由により、統合を接続するには、Xero で二要素認証が必要です。',
        twoFactorAuthIsRequiredForAdminsHeader: '2 要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '2要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'お使いの Xero 会計連携には、2 要素認証の利用が必要です。引き続き Expensify をご利用いただくには、2 要素認証を有効にしてください。',
        twoFactorAuthIsRequiredCompany: 'ご利用の会社では、二要素認証の使用が必須です。Expensify を引き続きご利用いただくには、二要素認証を有効にしてください。',
        twoFactorAuthCannotDisable: '2 要素認証を無効にできません',
        twoFactorAuthRequired: 'Xero 連携には二要素認証（2FA）が必須であり、無効にすることはできません。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'リカバリーコードを入力してください',
            incorrectRecoveryCode: 'リカバリーコードが正しくありません。もう一度お試しください。',
        },
        useRecoveryCode: 'リカバリーコードを使用',
        recoveryCode: 'リカバリーコード',
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
        allSet: 'これで完了です。新しいパスワードを安全に保管してください。',
    },
    privateNotes: {
        title: '非公開メモ',
        personalNoteMessage: 'このチャットに関するメモをここに保存します。あなた以外の誰も、これらのメモを追加、編集、または閲覧することはできません。',
        sharedNoteMessage: 'このチャットに関するメモをここに記入してください。Expensify の従業員および team.expensify.com ドメインの他のメンバーがこれらのメモを閲覧できます。',
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
        changePaymentCurrency: '支払通貨を変更',
        paymentCurrency: '支払い通貨',
        paymentCurrencyDescription: 'すべての個人経費を換算する標準通貨を選択してください',
        note: `注: 支払い通貨を変更すると、Expensify に支払う金額が変わる可能性があります。詳細については、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。`,
    },
    addDebitCardPage: {
        addADebitCard: 'デビットカードを追加',
        nameOnCard: 'カード名義人',
        debitCardNumber: 'デビットカード番号',
        expiration: '有効期限日',
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
            addressStreet: '有効な請求先住所を入力してください（私書箱は使用できません）',
            addressState: '州を選択してください',
            addressCity: '市区町村名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '支払いカードを追加',
        nameOnCard: 'カード名義人',
        paymentCardNumber: 'カード番号',
        expiration: '有効期限日',
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
            addressStreet: '有効な請求先住所を入力してください（私書箱は使用できません）',
            addressState: '州を選択してください',
            addressCity: '市区町村名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払方法',
        setDefaultConfirmation: 'デフォルトの支払方法に設定',
        setDefaultSuccess: 'デフォルトの支払い方法を設定しました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを削除してもよろしいですか？',
        error: {
            notOwnerOfBankAccount: 'この銀行口座を既定の支払方法として設定する際にエラーが発生しました',
            invalidBankAccount: 'この銀行口座は一時的に停止されています',
            notOwnerOfFund: 'このカードをデフォルトの支払い方法として設定する際にエラーが発生しました',
            setDefaultFailure: '問題が発生しました。詳しいサポートについては Concierge にチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座の追加中に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: 'より早く支払いを受ける',
        addPaymentMethod: 'アプリ内で直接支払いや受取りができるように、支払い方法を追加してください。',
        getPaidBackFaster: 'より早く精算してもらいましょう',
        secureAccessToYourMoney: 'お金への安全なアクセス',
        receiveMoney: '現地通貨で送金を受け取る',
        expensifyWallet: 'Expensify ウォレット（ベータ版）',
        sendAndReceiveMoney: '友だちとお金の送受信ができます。米国の銀行口座のみ対応しています。',
        enableWallet: 'ウォレットを有効にする',
        addBankAccountToSendAndReceive: '支払いや入金を行うには、銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        assignedCards: '割り当てられたカード',
        assignedCardsDescription: 'これらは、ワークスペース管理者が会社の支出を管理するために割り当てたカードです。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'お客様の情報を確認しています。数分後にもう一度ご確認ください。',
        walletActivationFailed: '残念ながら、現在ウォレットを有効化できません。詳細については、Concierge にチャットでお問い合わせください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: 'アプリ内でこれまで以上に簡単に支払いの送受信ができるよう、銀行口座を Expensify に連携しましょう。',
        chooseYourBankAccount: '銀行口座を選択',
        chooseAccountBody: '正しいものを選択してください。',
        confirmYourBankAccount: '銀行口座を確認',
        personalBankAccounts: '個人用銀行口座',
        businessBankAccounts: 'ビジネス用銀行口座',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify トラベルカード',
        availableSpend: '残りの上限',
        smartLimit: {
            name: 'スマートリミット',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大で${formattedLimit}まで利用でき、提出された経費が承認されると利用限度額はリセットされます。`,
        },
        fixedLimit: {
            name: '固定上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大で${formattedLimit}まで利用でき、その後は無効化されます。`,
        },
        monthlyLimit: {
            name: '月間上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `このカードでは、1か月あたり最大 ${formattedLimit} まで利用できます。利用可能額は毎月1日（カレンダー月の初日）にリセットされます。`,
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: 'トラベルカードのCVV',
        physicalCardNumber: '物理カード番号',
        physicalCardPin: 'PIN',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカードの不正利用を報告',
        reportTravelFraud: 'トラベルカードの不正利用を報告',
        reviewTransaction: '取引を確認',
        suspiciousBannerTitle: '不審な取引',
        suspiciousBannerDescription: 'お客様のカードで不審な取引を検知しました。確認するには下をタップしてください。',
        cardLocked: 'あなたのカードは、弊社チームがあなたの会社のアカウントを確認している間、一時的にロックされています。',
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
        validateCardTitle: 'ご本人確認をしましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `カード情報を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">個人情報を追加</a>してから、もう一度お試しください。`,
        unexpectedError: 'Expensify カードの詳細を取得中にエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです',
            reportFraudButtonText: 'いいえ、私ではありません',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審なアクティビティを解消し、カード x${cardLastFour} を再有効化しました。これで経費精算を続ける準備が整いました！`,
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
            }) => `末尾が${cardLastFour}のカードで不審な利用を検知しました。この請求にお心当たりはありますか？

${amount}（${merchant} - ${date}）`,
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認および支払いまでを含むワークフローを構成します。',
        submissionFrequency: '送信頻度',
        submissionFrequencyDescription: '経費を提出するカスタムスケジュールを選択してください。',
        submissionFrequencyDateOfMonth: '月の日付',
        disableApprovalPromptDescription: '承認を無効にすると、既存の承認ワークフローはすべて削除されます。',
        addApprovalsTitle: '承認を追加',
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'より詳細なワークフローが存在しない限り、このデフォルトのワークフローがすべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に、追加の承認を必要とする',
        makeOrTrackPaymentsTitle: '支払いの作成または追跡',
        makeOrTrackPaymentsDescription: 'Expensify で行われた支払いのために支払許可済みユーザーを追加するか、他で行われた支払いを記録します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>Concierge</concierge-link>にお問い合わせください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        editor: {
            submissionFrequency: 'Expensify がエラーのない経費を共有するまで、どのくらい待機するかを選択してください。',
        },
        frequencyDescription: '経費を自動送信する頻度を選択するか、手動送信に設定してください',
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
                one: 'st',
                two: '番目',
                few: '番目',
                other: 'タイ語',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '最初',
                '2': '秒',
                '3': '三番目',
                '4': '4番目',
                '5': '5 番目',
                '6': '6番目',
                '7': '第七',
                '8': '8番目',
                '9': '9番目',
                '10': '10番目',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに所属しています。ここでの更新内容は、そちらにも反映されます。',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。ワークフローが循環しないよう、別の承認者を選択してください。`,
        emptyContent: {
            title: '表示するメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは、すでに既存の承認ワークフローに所属しています。',
            approverSubtitle: 'すべての承認者は既存のワークフローに属しています。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '送信頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        monthlyOffsetErrorMessage: '月次頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
    },
    workflowsCreateApprovalsPage: {
        title: '確認',
        header: '承認者を追加して確認してください。',
        additionalApprover: '追加承認者',
        submitButton: 'ワークフローを追加',
    },
    workflowsEditApprovalsPage: {
        title: '承認ワークフローを編集',
        deleteTitle: '承認ワークフローを削除',
        deletePrompt: 'この承認ワークフローを削除してもよろしいですか？  \n削除すると、すべてのメンバーはデフォルトのワークフローに従うようになります。',
    },
    workflowsExpensesFromPage: {
        title: 'からの経費',
        header: '次のメンバーが経費を提出したとき:',
    },
    workflowsApproverPage: {
        genericErrorMessage: '承認者を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        header: 'このメンバーに承認のため送信する:',
    },
    workflowsPayerPage: {
        title: '承認済み支払者',
        genericErrorMessage: '承認された支払者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払者',
        paymentAccount: '支払口座',
    },
    reportFraudPage: {
        title: 'バーチャルカードの不正利用を報告',
        description: 'バーチャルカードの情報が盗まれたり不正利用された疑いがある場合は、既存のカードを完全に無効化し、新しいバーチャルカードとカード番号を発行します。',
        deactivateCard: 'カードを無効化',
        reportVirtualCardFraud: 'バーチャルカードの不正利用を報告',
    },
    reportFraudConfirmationPage: {
        title: 'カードの不正利用が報告されました',
        description: '既存のカードは永久に無効化しました。カードの詳細画面に戻ると、新しいバーチャルカードが利用できるようになります。',
        buttonText: '了解です、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: '物理カードを有効化',
        error: {
            thatDidNotMatch: 'カードの下4桁と一致しませんでした。もう一度お試しください。',
            throttled:
                'Expensify Card の下4桁の入力ミスが多すぎます。数字が正しいと確信できる場合は、問題解決のため Concierge までご連絡ください。そうでなければ、しばらくしてからもう一度お試しください。',
        },
    },
    getPhysicalCard: {
        header: '物理カードを取得',
        nameMessage: 'カードに表示されるため、名と姓を入力してください。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '戸籍上の姓',
        phoneMessage: '電話番号を入力してください。',
        phoneNumber: '電話番号',
        address: '住所',
        addressMessage: '配送先住所を入力してください。',
        streetAddress: '番地・丁目',
        city: '市',
        state: '州',
        zipPostcode: '郵便番号',
        country: '国',
        confirmMessage: '以下の内容をご確認ください。',
        estimatedDeliveryMessage: '物理カードは、2～3営業日以内に届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: '即時（デビットカード）',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `手数料 ${rate}%（最低 ${minAmount}）`,
        ach: '1～3営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どのアカウントですか？',
        fee: '手数料',
        transferSuccess: '振込が完了しました！',
        transferDetailBankAccount: '資金は今後1～3営業日以内に到着する予定です。',
        transferDetailDebitCard: 'あなたのお金はすぐに到着するはずです。',
        failedTransfer: '残高が完全に清算されていません。銀行口座へ振り込んでください。',
        notHereSubTitle: 'ウォレットページから残高を振り替えてください',
        goToWallet: 'ウォレットへ移動',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'アカウントを選択',
    },
    paymentMethodList: {
        addPaymentMethod: '支払方法を追加',
        addNewDebitCard: '新しいデビットカードを追加',
        addNewBankAccount: '新しい銀行口座を追加',
        accountLastFour: '末尾',
        cardLastFour: '末尾が',
        addFirstPaymentMethod: 'アプリ内で直接支払いや受取りができるように、支払い方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `銀行口座 • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: 'テスト設定',
            subtitle: 'ステージング環境でアプリをデバッグおよびテストするための設定。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する機能アップデートやExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensify からのすべてのサウンドをミュート',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読とピン留めされたチャットのみを#focusするか、すべてのチャットを表示して、最新とピン留めされたチャットを上部に表示するかを選択してください。',
        priorityModes: {
            default: {
                label: '最新',
                description: '最新順ですべてのチャットを表示',
            },
            gsd: {
                label: '#集中',
                description: '未読のみをアルファベット順で表示',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `${policyName} 内`,
        generatingPDF: 'PDF を生成しています…',
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
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName} のグループチャット`,
    },
    languagePage: {
        language: '言語',
        aiGenerated: 'この言語の翻訳は自動生成されたものであり、誤りを含む場合があります。',
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
                label: '端末の設定を使用',
            },
        },
        chooseThemeBelowOrSync: '下からテーマを選択するか、デバイスの設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすると、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `<muted-text-xs>送金サービスは、その<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">ライセンス</a>に基づき、${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）によって提供されています。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: 'リカバリーコードを入力してください',
        requiredWhen2FAEnabled: '2FA が有効な場合は必須',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `<a>${timeRemaining}</a>に新しいコードをリクエスト`,
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
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには二要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2FA が有効な場合は必須',
        error: {
            incorrectPassword: 'パスワードが正しくありません。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログイン名またはパスワードが正しくありません。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントでは2要素認証（2FA）が有効になっています。メールアドレスまたは電話番号を使ってサインインしてください。',
            invalidLoginOrPassword: 'ログインIDまたはパスワードが正しくありません。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。これは、古いパスワードリセットメール内のパスワードリセットリンクの有効期限が切れていることが原因と思われます。再試行できるよう、新しいリンクをメールで送信しました。受信トレイと迷惑メールフォルダを確認してください。数分以内に届くはずです。',
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
        welcomeSignOffTitleManageTeam: '上記の作業が完了したら、承認ワークフローやルールなど、さらに多くの機能を確認できます！',
        welcomeSignOffTitle: 'お会いできてうれしいです！',
        explanationModal: {
            title: 'Expensify へようこそ',
            description:
                'チャットのスピードで、ビジネスとプライベートの支出をまとめて管理できるアプリです。ぜひお試しのうえ、ご意見をお聞かせください。今後もさらに多くの機能を追加予定です！',
            secondaryDescription: 'Expensify Classic に戻るには、プロフィール写真をタップし、「Expensify Classic に移動」を選択してください。',
        },
        getStarted: '開始する',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: 'あなたの知り合いがすでに参加しています！一緒に参加するには、メールアドレスを確認してください。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `${domain} の誰かがすでにワークスペースを作成しています。${email} に送信されたマジックコードを入力してください。`,
        joinAWorkspace: 'ワークスペースに参加',
        listOfWorkspaces: '参加できるワークスペースの一覧です。後から参加することもできるので、心配しないでください。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 人のメンバー${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'どこで働いていますか？',
        errorSelection: '先に進むオプションを選択してください',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: 'セットアップを続行するには「続行」を押してください',
            errorBackButton: 'アプリを使い始めるには、セットアップの質問に最後までお答えください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主から立替金を精算してもらう',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'チームの経費を管理',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '経費の追跡と予算管理',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '友だちとチャットして精算を分け合う',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'その他',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1～10人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '従業員 11～50 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '従業員数 51～100 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '従業員数 101～1,000 人',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '従業員数 1,000人超',
        },
        accounting: {
            title: '会計ソフトを利用していますか？',
            none: 'なし',
        },
        interestedFeatures: {
            title: 'どの機能にご興味がありますか？',
            featuresAlreadyEnabled: 'こちらは当社で最も人気のある機能です。',
            featureYouMayBeInterestedIn: '追加機能を有効にする',
        },
        error: {
            requiredFirstName: '続行するには名を入力してください',
        },
        workEmail: {
            title: 'あなたの業務用メールアドレスは何ですか？',
            subtitle: 'Expensify は、勤務先のメールアドレスを連携すると最適に機能します。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.com に転送してスキャン',
                descriptionTwo: 'すでにExpensifyを利用している同僚に参加しましょう',
                descriptionThree: 'さらにカスタマイズされたエクスペリエンスをお楽しみください',
            },
            addWorkEmail: '勤務先メールアドレスを追加',
        },
        workEmailValidation: {
            title: '勤務先メールアドレスを確認',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `${workEmail} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        },
        workEmailValidationError: {
            publicEmail: 'プライベートドメインの有効な勤務用メールアドレスを入力してください（例：mitch@company.com）',
            offline: 'オフラインのようなので、勤務先メールアドレスを追加できませんでした',
        },
        mergeBlockScreen: {
            title: '勤務用メールアドレスを追加できませんでした',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `${workEmail} を追加できませんでした。後で設定からもう一度お試しいただくか、ガイダンスについては Concierge にチャットでお問い合わせください。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `[クイックプロダクトツアーを試す](${testDriveURL}) と、Expensify が経費精算を最速で行える理由をご覧ください。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `[試乗](${testDriveURL})して、あなたのチームに*Expensify を3か月間無料*でお試しいただけます！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        チームの支出を確認して管理するために、*経費承認を追加* しましょう。

                        手順は次のとおりです：

                        1. *Workspaces* に移動します。
                        2. 自分のワークスペースを選択します。
                        3. *More features* をクリックします。
                        4. *Workflows* を有効にします。
                        5. ワークスペースエディタで *Workflows* に移動します。
                        6. *Add approvals* を有効にします。
                        7. あなたが経費承認者として設定されます。チームを招待した後は、任意の管理者に変更できます。

                        [More features へ移動する](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `ワークスペースを[作成](${workspaceConfirmationLink})`,
                description: 'ワークスペースを作成し、セットアップ担当スペシャリストと一緒に設定を構成しましょう！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース](${workspaceSettingsLink})を作成`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *ワークスペースを作成*して、経費の管理、領収書のスキャン、チャットなどを行いましょう。

                        1. *ワークスペース* をクリックし、*新しいワークスペース* を選択します。

                        *新しいワークスペースの準備ができました！* [確認する](${workspaceSettingsLink})。`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリ](${workspaceCategoriesLink})を設定`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        経費をチームが簡単にレポートできるようにするために、*カテゴリを設定* しましょう。

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
                    金額を入力するか、領収書をスキャンして、*経費を申請*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. 上司のメールアドレスまたは電話番号を追加します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            adminSubmitExpenseTask: {
                title: '経費を提出',
                description: dedent(`
                    金額を入力するかレシートをスキャンして、*経費精算を提出*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するかレシートをスキャンします。
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
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. *個人*スペースを選択します。
                    5. *作成*をクリックします。

                    以上です！とても簡単です。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `接続${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '宛先'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        自動経費コード化と同期で月次決算を驚くほど簡単にするために、${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : '宛先'} ${integrationName} を連携しましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *会計* をクリックします。
                        4. ${integrationName} を探します。
                        5. *接続* をクリックします。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[会計に移動](${workspaceAccountingLink}).

                                      ![${integrationName} に接続](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[会計画面に移動](${workspaceAccountingLink})`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[会社のカード](${corporateCardLink})を連携する`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        企業カードを連携して、経費を自動で取り込み・コード化しましょう。

                        1. 「Workspaces」をクリックします。
                        2. ワークスペースを選択します。
                        3. 「Corporate cards」をクリックします。
                        4. 画面の指示に従ってカードを連携します。

                        [企業カードの連携画面へ移動](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[チーム](${workspaceMembersLink})を招待`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        チームを Expensify に招待して、今日から経費の記録を始めましょう。

                        1. *Workspaces* をクリックします。
                        3. 自分のワークスペースを選択します。
                        4. *Members* > *Invite member* をクリックします。
                        5. メールアドレスまたは電話番号を入力します。
                        6. 必要に応じて、招待メッセージを追加します。

                        [ワークスペースのメンバー画面へ移動](${workspaceMembersLink})。

                        ![チームを招待](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリ](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        チームが経費にコードを割り当てて、レポートを簡単に作成できるように、*カテゴリーとタグを設定*しましょう。

                        [会計ソフトウェアを連携](${workspaceAccountingLink})して自動的にインポートするか、[ワークスペース設定](${workspaceCategoriesLink})で手動で設定できます。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[タグ](${workspaceTagsLink})を設定`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        プロジェクト、クライアント、所在地、部門などの詳細を、タグを使って経費に追加できます。複数レベルのタグが必要な場合は、Control プランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        3. ワークスペースを選択します。
                        4. *More features* をクリックします。
                        5. *Tags* を有効にします。
                        6. ワークスペースエディタで *Tags* に移動します。
                        7. 独自のタグを作成するには *+ Add tag* をクリックします。

                        [もっと多くの機能へ移動](${workspaceMoreFeaturesLink})。

                        ![タグの設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `あなたの[会計士](${workspaceMembersLink})を招待する`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *会計士を招待*してワークスペースで共同作業し、ビジネス経費を管理しましょう。

                        1. *ワークスペース*をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. *メンバー*をクリックします。
                        4. *メンバーを招待*をクリックします。
                        5. 会計士のメールアドレスを入力します。

                        [今すぐ会計士を招待](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: 'チャットを開始',
                description: dedent(`
                    メールアドレスまたは電話番号を使って、誰とでも*チャットを開始*できます。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。

                    相手がまだ Expensify を使っていない場合は、自動的に招待が送信されます。

                    すべてのチャットは、相手が直接返信できるメールまたはテキストメッセージにもなります。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割',
                description: dedent(`
                    1人または複数人と*経費を分割*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット内のグレーの *+* ボタンをクリックし、*経費を分割* を選択します。
                    5. *手動入力*、*スキャン*、または *距離* を選択して経費を作成します。

                    必要に応じて詳細を追加しても、そのまま送信しても構いません。返金をスムーズに受け取りましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink})を確認する`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        ワークスペース設定を確認および更新する方法は次のとおりです：
                        1. 「Workspaces」をクリックします。
                        2. 対象のワークスペースを選択します。
                        3. 設定内容を確認し、必要に応じて更新します。
                        [自分のワークスペースへ移動](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '最初のレポートを作成',
                description: dedent(`
                    レポートの作成方法：

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. 「レポートを作成」を選択します。
                    3. 「経費を追加」をクリックします。
                    4. 最初の経費を追加します。

                    これで完了です！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[テストドライブ](${testDriveURL})を試す` : '試してみる'),
            embeddedDemoIframeTitle: '試用ドライブ',
            employeeFakeReceipt: {
                description: '私の試乗レシート！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '返金を受けるのは、メッセージを送るくらい簡単です。基本を確認しましょう。',
            onboardingPersonalSpendMessage: '数回のクリックで支出を管理する方法をご紹介します。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 無料トライアルが開始されました！初期設定を済ませましょう。
                        👋 こんにちは、私はあなたの Expensify 設定スペシャリストです。すでに、チームの領収書と経費を管理するためのワークスペースを作成してあります。30 日間の無料トライアルを最大限に活用するために、下の残りの設定ステップに従って進めてください！
                    `)
                    : dedent(`
                        # 無料トライアルが開始されました！セットアップを進めましょう。
                        👋 こんにちは、私はあなたの Expensify セットアップ専任担当です。ワークスペースを作成したので、以下の手順に従って 30 日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage:
                '# 初期設定を始めましょう\n👋 こんにちは。私はあなたの Expensify セットアップ担当です。すでに領収書と経費を管理するためのワークスペースを作成しました。30 日間の無料トライアルを最大限に活用するには、以下の残りの設定手順に従ってください！',
            onboardingChatSplitMessage: '友だちとの割り勘は、メッセージを送るくらい簡単です。やり方はこちら。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自分自身の経費を申請する方法を学びましょう。',
            onboardingLookingAroundMessage:
                'Expensify は経費、出張、コーポレートカードの管理でよく知られていますが、それだけではありません。ご興味のある内容を教えていただければ、開始できるようお手伝いします。',
            onboardingTestDriveReceiverMessage: '3か月間無料です！以下から始めましょう。',
        },
        workspace: {
            title: 'ワークスペースで整理整頓しましょう',
            subtitle: '経費管理をシンプルにする強力なツールを、すべて1か所で利用できます。ワークスペースを使うと、次のことができます：',
            explanationModal: {
                descriptionOne: '領収書を追跡して整理',
                descriptionTwo: '経費の分類とタグ付け',
                descriptionThree: 'レポートを作成して共有',
            },
            price: '30日間無料でお試しいただき、その後はわずか<strong>$5/ユーザー/月</strong>でアップグレードできます。',
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: '領収書の管理、経費精算、出張管理、レポート作成などを、チャットのスピードで行えるワークスペースを作成しましょう。',
        },
        inviteMembers: {
            title: 'メンバーを招待',
            subtitle: 'チームメンバーを追加するか、会計士を招待しましょう。多いほど、もっと楽しくなります！',
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
        enterLegalName: '法的氏名は何ですか？',
        enterDateOfBirth: 'あなたの生年月日はいつですか？',
        enterAddress: '住所はどちらですか？',
        enterPhoneNumber: '電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は、旅行と支払いに使用されます。あなたの公開プロフィールに表示されることは決してありません。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '戸籍上の姓',
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
        linkHasBeenResent: 'リンクを再送しました',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `${login} にマジックサインインリンクを送信しました。サインインするには、${loginType} を確認してください。`,
        resendLink: 'リンクを再送',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `${secondaryLogin} を認証するには、${primaryLogin} のアカウント設定からマジックコードを再送してください。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `${primaryLogin} にアクセスできなくなった場合は、アカウントの連携を解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクを送信しました！',
        successfullyUnlinkedLogin: 'セカンダリーログインのリンクを正常に解除しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `配信の問題により、メールプロバイダが一時的に ${login} へのメール送信を停止しました。ログインを解除するには、次の手順に従ってください。`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>${login} のつづりが正しく、実在し配信可能なメールアドレスであることを確認してください。</strong> 「expenses@domain.com」のようなメールエイリアスは、有効な Expensify ログインとするために、そのエイリアス専用のメール受信ボックスへアクセスできなければなりません。`,
        ensureYourEmailClient: `<strong>ご利用のメールクライアントで expensify.com からのメールを受信できるように設定してください。</strong> この手順の詳しい方法は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>でご確認いただけますが、メール設定の構成については、IT 部門のサポートが必要になる場合があります。`,
        onceTheAbove: `上記の手順が完了したら、ログインのブロック解除のために <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> までご連絡ください。`,
    },
    openAppFailureModal: {
        title: '問題が発生しました…',
        subtitle: `すべてのデータを読み込むことができませんでした。こちらで問題を検知しており、現在調査中です。問題が解決しない場合は、次の窓口までご連絡ください`,
        refreshAndTryAgain: '更新して、もう一度お試しください',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `${login} に SMS メッセージを送信できなかったため、一時的に停止しました。番号の認証をお試しください。`,
        validationSuccess: 'あなたの電話番号は認証されました！新しいマジックサインインコードを送信するには、下をクリックしてください。',
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
                return '再度お試しになる前に、しばらくお待ちください。';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '日' : '日数'}`);
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
            return `少々お待ちください！電話番号を再度認証するまで、${timeText} 待つ必要があります。`;
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
            `未読のチャットや、あなたの対応が必要なチャットだけを表示して、見落としを防ぎましょう。心配はいりません。<a href="${priorityModePageUrl}">設定</a>からいつでも変更できます。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから抜け出したい',
        iouReportNotFound: 'お探しの支払い詳細が見つかりません。',
        notHere: 'うーん…ここにはありません',
        pageNotFound: 'おっと、このページが見つかりません',
        noAccess: 'このチャットまたは経費は削除されたか、アクセス権がありません。\n\nご不明な点がございましたら、concierge@expensify.com までお問い合わせください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。',
        goToChatInstead: '代わりにチャットに移動してください。',
        contactConcierge: 'ご不明な点がありましたら、concierge@expensify.com までお問い合わせください。',
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
        passwordFormTitle: 'New Expensify へお戻りいただきありがとうございます！パスワードを設定してください。',
        passwordNotSet: '新しいパスワードを設定できませんでした。再試行用の新しいパスワードリンクをお送りしました。',
        setPasswordLinkInvalid: 'このパスワード設定用リンクは無効か、有効期限が切れています。新しいリンクがお使いのメール受信箱に届いています。',
        validateAccount: 'アカウントを確認',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '絵文字を追加して、同僚や友だちが状況をひと目でわかるようにしましょう。必要に応じてメッセージを追加することもできます。',
        today: '今日',
        clearStatus: 'ステータスをクリア',
        save: '保存',
        message: 'メッセージ',
        timePeriods: {
            never: 'しない',
            thirtyMinutes: '30分',
            oneHour: '1時間',
            afterToday: '今日',
            afterWeek: '1週間',
            custom: 'カスタム',
        },
        untilTomorrow: '明日まで',
        untilTime: ({time}: UntilTimeParams) => `${time} まで`,
        date: '日付',
        time: '時間',
        clearAfter: 'クリアまでの時間',
        whenClearStatus: 'いつステータスをクリアしますか？',
        vacationDelegate: '休暇代理人',
        setVacationDelegate: `休暇中に不在の間、代理承認者を設定してレポートを代わりに承認してもらいましょう。`,
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `${nameOrEmail} の休暇代理として`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `${vacationDelegateName} の休暇代理として ${submittedToName} に`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `${nameOrEmail} を休暇中の代理担当者として割り当てようとしています。このユーザーは、まだあなたのすべてのワークスペースに参加していません。続行すると、ワークスペースのすべての管理者に、このユーザーを追加するよう依頼するメールが送信されます。`,
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
        confirmBankInfo: '銀行情報を確認',
        manuallyAdd: '銀行口座を手動で追加',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        accountEnding: '末尾が … のアカウント',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '以下のアカウントを選択してください',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログイン',
        connectManually: '手動で接続',
        desktopConnection: '注意：Chase、Wells Fargo、Capital One、または Bank of America と接続するには、こちらをクリックしてブラウザでこの手続きを完了してください。',
        yourDataIsSecure: 'お客様のデータは安全です',
        toGetStarted: '1か所から、経費の返金、Expensify Card の発行、請求書の支払い受け取り、請求書支払いを行えるように、銀行口座を追加しましょう。',
        plaidBodyCopy: '従業員が会社の経費を支払うとき、そして精算を受けるときの負担を、もっと簡単にしましょう。',
        checkHelpLine: '口座のルーティング番号と口座番号は、その口座の小切手に記載されています。',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `銀行口座を連携するには、<a href="${contactMethodRoute}">メールアドレスをプライマリログインとして追加</a>してから、もう一度お試しください。電話番号はセカンダリログインとして追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから、もう一度お試しください。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `おっと！現在、このワークスペースの通貨がUSD以外に設定されているようです。続行するには、<a href="${workspaceRoute}">ワークスペース設定</a>に移動して通貨をUSDに変更し、もう一度お試しください。`,
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
            incorporationDateFuture: '設立日は未来の日付にはできません',
            incorporationState: '有効な州を選択してください',
            industryCode: '有効な6桁の業種分類コードを入力してください',
            restrictedBusiness: 'ビジネスが制限対象の事業リストに含まれていないことを確認してください',
            routingNumber: '有効なルーティングナンバーを入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: '経路番号と口座番号を同じにすることはできません',
            companyType: '有効な会社の種別を選択してください',
            tooManyAttempts: 'ログイン試行回数が多すぎるため、このオプションは24時間無効になっています。後でもう一度お試しいただくか、代わりに詳細を手動で入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: '有効なSSNの下4桁を入力してください',
            firstName: '有効な名を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: 'デフォルトの入金先口座またはデビットカードを追加してください',
            validationAmounts: '入力した検証金額が正しくありません。銀行の取引明細書をもう一度ご確認のうえ、再度お試しください。',
            fullName: '有効な氏名を入力してください',
            ownershipPercentage: '有効なパーセンテージの数値を入力してください',
            deletePaymentBankAccount: 'この銀行口座は、Expensify Card の支払いに使用されているため削除できません。この口座をそれでも削除したい場合は、Concierge までご連絡ください。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'あなたの銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'あなたのアカウント詳細は何ですか？',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: 'あなたの銀行口座の詳細は何ですか？',
        accountHolderInformationStepHeader: '口座名義人の詳細とは何ですか？',
        howDoWeProtectYourData: 'お客様のデータをどのように保護していますか？',
        currencyHeader: '銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '以下の詳細を再確認し、利用規約のボックスにチェックを入れて確定してください。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify のパスワードを入力',
        alreadyAdded: 'このアカウントは既に追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人銀行口座を追加しました！',
        successMessage: 'おめでとうございます。銀行口座の設定が完了し、返金を受け取る準備が整いました。',
    },
    attachmentView: {
        unknownFilename: '不明なファイル名',
        passwordRequired: 'パスワードを入力してください',
        passwordIncorrect: 'パスワードが正しくありません。もう一度お試しください。',
        failedToLoadPDF: 'PDFファイルの読み込みに失敗しました',
        pdfPasswordForm: {
            title: 'パスワード保護されたPDF',
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
        errorMessageInvalidPhone: `かっこやハイフンを含まない有効な電話番号を入力してください。米国外にいる場合は、国番号を含めて入力してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} のメンバーです`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化リクエストを続行することにより、あなたは以下を読み、理解し、同意したものとみなされます',
        facialScan: 'Onfido の顔認証スキャンに関するポリシーおよび同意書',
        tryAgain: '再試行',
        verifyIdentity: '本人確認',
        letsVerifyIdentity: 'あなたの本人確認をしましょう',
        butFirst: `でもまずは、つまらない作業からです。次のステップで法的な文言をよく読んで、準備ができたら「同意する」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラへのアクセスを有効にする',
        cameraRequestMessage: '銀行口座の認証を完了するために、カメラへのアクセス許可が必要です。設定 > New Expensify から有効にしてください。',
        microphonePermissionsNotGranted: 'マイクへのアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の認証を完了するため、マイクへのアクセス許可が必要です。「設定」>「New Expensify」から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、ご本人の身分証明書のオリジナル画像をアップロードしてください。',
        documentNeedsBetterQuality:
            'お客様の身分証明書は、損傷しているか、必要なセキュリティ要素が欠けているようです。損傷がなく、全体がはっきりと写った元の身分証明書の画像をアップロードしてください。',
        imageNeedsBetterQuality: 'ご提示いただいた本人確認書類の画像に画質の問題があります。ID全体がはっきり確認できる新しい画像をアップロードしてください。',
        selfieIssue: '自撮り写真／動画に問題があります。ライブの自撮り写真／動画をアップロードしてください。',
        selfieNotMatching: '自撮り写真／ビデオが身分証明書と一致しません。顔がはっきりと見える新しい自撮り写真／ビデオをアップロードしてください。',
        selfieNotLive: 'あなたの自撮り／動画はライブ写真／動画ではないようです。ライブの自撮り／動画をアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'ウォレットから送金および受け取りを行う前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: 'あなたの本人確認を完了するために、あと数個だけ質問にお答えいただく必要があります。',
        helpLink: 'これが必要な理由の詳細はこちらをご覧ください。',
        legalFirstNameLabel: '法的な名',
        legalMiddleNameLabel: '法的ミドルネーム',
        legalLastNameLabel: '戸籍上の姓',
        selectAnswer: '続行するには応答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'SSN の確認に問題が発生しています。SSN の 9 桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前にこの情報を修正してください',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `ご本人確認ができませんでした。時間をおいてもう一度お試しいただくか、ご不明な点がありましたら<a href="mailto:${conciergeEmail}">${conciergeEmail}</a>までご連絡ください。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '手数料と利用規約',
        haveReadAndAgreePlain: '電子開示を受け取ることに同意し、内容を確認しました。',
        haveReadAndAgree: `<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子開示書面</a>を受け取ることを読み、同意しました。`,
        agreeToThePlain: 'プライバシーおよびウォレット規約に同意します。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>および<a href="${walletAgreementUrl}">ウォレット契約</a>に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越／クレジット機能はありません。',
        electronicFundsWithdrawal: '電子資金引き落とし',
        standard: '標準',
        reviewTheFees: 'いくつかの手数料を見てみましょう。',
        checkTheBoxes: '以下のチェックボックスを選択してください。',
        agreeToTerms: '利用規約に同意すると、すぐに始められます！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify Wallet は ${walletProgram} によって発行されています。`,
            perPurchase: '購入ごと',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金リロード',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会（提携内・提携外）',
            customerService: 'カスタマーサービス（自動応答またはオペレーター）',
            inactivityAfterTwelveMonths: '非アクティブ（12か月間取引がない場合）',
            weChargeOneFee: '他に1種類の手数料を請求します。内容は次のとおりです。',
            fdicInsurance: 'あなたの資金はFDIC保険の対象です。',
            generalInfo: `プリペイド口座に関する一般的な情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>をご覧ください。`,
            conditionsDetails: `すべての手数料およびサービスの詳細と条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> にアクセスするか、+1 833-400-0904 までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き出し（即時）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(最小 ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'すべての Expensify Wallet 手数料の一覧',
            typeOfFeeHeader: 'すべての手数料',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: 'アカウントの開設',
            openingAccountDetails: '口座開設に手数料はかかりません。',
            monthlyFeeDetails: '月額料金はありません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス料金は一切かかりません。',
            inactivityDetails: '非アクティブ料金はありません。',
            sendingFundsTitle: '他の口座保有者への送金',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使用して他のアカウント保有者に送金する場合、手数料はかかりません。',
            electronicFundsStandardDetails:
                '標準オプションを使用してExpensifyウォレットから銀行口座へ資金を振り替える場合、手数料はかかりません。通常、この振替は1〜3営業日以内に完了します。',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Expensify ウォレットからリンク済みのデビットカードへ即時振込オプションを使って資金を振り替える場合、手数料が発生します。この振込は通常、数分以内に完了します。' +
                `手数料は振込金額の${percentage}%（最低手数料は${amount}）です。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `あなたの資金はFDIC保険の対象です。あなたの資金は、FDIC保険付き金融機関である ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} に預け入れられるか、または同機関へ送金されます。` +
                `そこでは、特定の預金保険の要件を満たし、カードが登録されている場合、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} が破綻しても、あなたの資金は FDIC により最大 ${amount} まで保険の対象となります。詳細は ${CONST.TERMS.FDIC_PREPAID} をご覧ください。`,
            contactExpensifyPayments: `${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} には、+1 833-400-0904 へ電話するか、${CONST.EMAIL.CONCIERGE} へメールするか、${CONST.NEW_EXPENSIFY_URL} にサインインしてお問い合わせください。`,
            generalInformation: `プリペイド口座に関する一般的な情報については、${CONST.TERMS.CFPB_PREPAID}をご覧ください。プリペイド口座に関する苦情がある場合は、1-855-411-2372 に電話して消費者金融保護局（Consumer Financial Protection Bureau）に連絡するか、${CONST.TERMS.CFPB_COMPLAINT}にアクセスしてください。`,
            printerFriendlyView: '印刷に適した表示を開く',
            automated: '自動',
            liveAgent: 'ライブエージェント',
            instant: 'インスタント',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最小 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効化されました！',
        activatedMessage: 'おめでとうございます。ウォレットの設定が完了し、支払いの準備ができました。',
        checkBackLaterTitle: '少々お待ちください…',
        checkBackLaterMessage: 'お客様の情報を引き続き確認しています。後ほどもう一度ご確認ください。',
        continueToPayment: '支払いに進む',
        continueToTransfer: '振込を続行',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'ほとんど完了しました！セキュリティ保護のため、いくつかの情報を確認する必要があります。',
        legalBusinessName: '法人名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '税務識別番号',
        taxIDNumberPlaceholder: '9桁',
        companyType: '会社の種類',
        incorporationDate: '法人設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: 'この会社が～に含まれていないことを確認します',
        listOfRestrictedBusinesses: '制限対象事業の一覧',
        incorporationDatePlaceholder: '開始日（yyyy-mm-dd）',
        incorporationTypes: {
            LLC: 'LLC（合同会社）',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協力的',
            SOLE_PROPRIETORSHIP: '個人事業',
            OTHER: 'その他',
        },
        industryClassification: 'このビジネスはどの業種に分類されますか？',
        industryClassificationCodePlaceholder: '業種分類コードを検索',
    },
    requestorStep: {
        headerTitle: '個人情報',
        learnMore: '詳しく見る',
        isMyDataSafe: '私のデータは安全ですか？',
    },
    personalInfoStep: {
        personalInfo: '個人情報',
        enterYourLegalFirstAndLast: '法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '戸籍上の姓',
        legalName: '法的氏名',
        enterYourDateOfBirth: 'あなたの生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁は何ですか？',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        last4SSN: 'SSN の下4桁',
        enterYourAddress: '住所はどちらですか？',
        address: '住所',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は次の内容を読み、理解し、承諾したものとみなされます',
        whatsYourLegalName: '法的な氏名は何ですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁は何ですか？',
        noPersonalChecks: 'ご安心ください。ここでは個人の信用調査は一切行いません！',
        whatsYourPhoneNumber: '電話番号は何ですか？',
        weNeedThisToVerify: 'ウォレットを確認するために、こちらが必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: 'あなたの会社名は何ですか？',
        businessName: '会社の正式名称',
        enterYourCompanyTaxIdNumber: '御社の納税者番号（Tax ID）は何ですか？',
        taxIDNumber: '税務識別番号',
        taxIDNumberPlaceholder: '9桁',
        enterYourCompanyWebsite: '御社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: '御社の住所はどこですか？',
        selectYourCompanyType: 'どのような種類の会社ですか？',
        companyType: '会社の種類',
        incorporationType: {
            LLC: 'LLC（合同会社）',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協力的',
            SOLE_PROPRIETORSHIP: '個人事業',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '御社の法人設立日はいつですか？',
        incorporationDate: '法人設立日',
        incorporationDatePlaceholder: '開始日（yyyy-mm-dd）',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '御社はどの州で法人登記されていますか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        companyAddress: '会社住所',
        listOfRestrictedBusinesses: '制限対象事業の一覧',
        confirmCompanyIsNot: 'この会社が～に含まれていないことを確認します',
        businessInfoTitle: '会社情報',
        legalBusinessName: '法人名',
        whatsTheBusinessName: 'ビジネス名は何ですか？',
        whatsTheBusinessAddress: '会社住所はどこですか？',
        whatsTheBusinessContactInformation: 'ビジネスの連絡先情報は何ですか？',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '会社登録番号（CRN）とは何ですか？';
                default:
                    return '法人登録番号とは何ですか？';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '雇用主識別番号（EIN）とは何ですか？';
                case CONST.COUNTRY.CA:
                    return '法人番号（Business Number：BN）とは何ですか？';
                case CONST.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST.COUNTRY.AU:
                    return 'オーストラリア事業番号（ABN）とは何ですか？';
                default:
                    return 'EU VAT番号とは何ですか？';
            }
        },
        whatsThisNumber: 'この番号は何ですか？',
        whereWasTheBusinessIncorporated: '会社はどこで法人化（設立登記）されましたか？',
        whatTypeOfBusinessIsIt: 'どのような種類のビジネスですか？',
        whatsTheBusinessAnnualPayment: 'ビジネスの年間支払額はいくらですか？',
        whatsYourExpectedAverageReimbursements: '想定される平均払い戻し金額はいくらですか？',
        registrationNumber: '登録番号',
        taxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'ベンガル語';
                case CONST.COUNTRY.GB:
                    return 'VRN';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU付加価値税';
            }
        },
        businessAddress: '会社住所',
        businessType: '業種',
        incorporation: '法人設立',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人形態',
        businessCategory: 'ビジネスカテゴリ',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `年間支払い額（${currencyCode}）`,
        averageReimbursementAmount: '平均払い戻し額',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `${currencyCode}での平均払い戻し額`,
        selectIncorporationType: '法人形態を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        selectBusinessType: '事業形態を選択',
        findIncorporationType: '法人種別を検索',
        findBusinessCategory: 'ビジネスカテゴリーを検索',
        findAnnualPaymentVolume: '年間支払額を検索',
        findIncorporationState: '設立州を検索',
        findAverageReimbursement: '平均払い戻し額を見つける',
        findBusinessType: 'ビジネスタイプを検索',
        error: {
            registrationNumber: '有効な登録番号を入力してください',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効なEmployer Identification Number（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な事業者番号（BN）を入力してください';
                    case CONST.COUNTRY.GB:
                        return '有効な VAT 登録番号（VRN）を入力してください';
                    case CONST.COUNTRY.AU:
                        return '有効なオーストラリア事業番号（ABN）を入力してください';
                    default:
                        return '有効なEU VAT番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `あなたは${companyName}の25％以上を所有していますか？`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `${companyName} の持分を25%以上所有している個人は、他にもいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '規制により、事業の25％を超えて所有する個人の本人確認を行うことが求められています。',
        companyOwner: '事業主',
        enterLegalFirstAndLastName: 'オーナーの法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '戸籍上の姓',
        enterTheDateOfBirthOfTheOwner: 'オーナーの生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁を入力してください。',
        last4SSN: 'SSN の下4桁',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        enterTheOwnersAddress: 'オーナーの住所は何ですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は次の内容を読み、理解し、承諾したものとみなされます',
        owners: 'オーナー',
    },
    ownershipInfoStep: {
        ownerInfo: 'オーナー情報',
        businessOwner: '事業主',
        signerInfo: '署名者情報',
        doYouOwn: ({companyName}: CompanyNameParams) => `あなたは${companyName}の25％以上を所有していますか？`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している個人はいますか？`,
        regulationsRequire: '規制により、事業の25％を超える持分を所有するすべての個人の本人確認を行うことが求められています。',
        legalFirstName: '法的な名',
        legalLastName: '戸籍上の姓',
        whatsTheOwnersName: 'オーナーの法的氏名は何ですか？',
        whatsYourName: '法的氏名は何ですか？',
        whatPercentage: 'ビジネスのうち、オーナーの持分は何パーセントですか？',
        whatsYoursPercentage: 'あなたは事業の何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: 'オーナーの生年月日はいつですか？',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        whatsTheOwnersAddress: 'オーナーの住所は何ですか？',
        whatsYourAddress: '住所はどちらですか？',
        whatAreTheLast: 'オーナーの社会保障番号（Social Security Number）の下4桁は何ですか？',
        whatsYourLast: 'あなたの社会保障番号の下4桁は何ですか？',
        whatsYourNationality: 'あなたの市民権を持っている国はどこですか？',
        whatsTheOwnersNationality: 'オーナーの国籍はどこですか？',
        countryOfCitizenship: '国籍',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        last4: 'SSN の下4桁',
        whyDoWeAsk: 'なぜこの情報を求めるのですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '持分比率',
        areThereOther: ({companyName}: CompanyNameParams) => `${companyName}の25％以上を所有している他の個人はいますか？`,
        owners: 'オーナー',
        addCertified: '実質的支配者を示す認定済みの組織図を追加する',
        regulationRequiresChart: '規制により、事業の25％以上を所有しているすべての個人または法人を示す所有構成図の認証済みコピーを収集する必要があります。',
        uploadEntity: '法人の所有構成図をアップロード',
        noteEntity: '注：企業所有権チャートは、会計士、法律顧問の署名、または公証が必要です。',
        certified: '認定済み法人所有構成図',
        selectCountry: '国を選択',
        findCountry: '国を検索',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加の書類をアップロード',
        pleaseUpload: 'ビジネス事業体の直接または間接の所有者として、持分が25%以上であることを確認するため、追加の証明書類を下からアップロードしてください。',
        acceptedFiles: '受け付け可能なファイル形式：PDF、PNG、JPEG。各セクションごとの合計ファイルサイズは 5 MB を超えることはできません。',
        proofOfBeneficialOwner: '実質的支配者の証明',
        proofOfBeneficialOwnerDescription:
            '事業の25％以上の所有権を証明する、公認会計士、公証人、または弁護士による署名入りの証明書および組織図を提出してください。発行日は過去3か月以内である必要があり、署名者の免許番号が含まれていなければなりません。',
        copyOfID: '実質所有者の身分証明書の写し',
        copyOfIDDescription: '例：パスポート、運転免許証など',
        proofOfAddress: '実質的支配者の住所証明',
        proofOfAddressDescription: '例：公共料金の請求書、賃貸契約書など。',
        codiceFiscale: '税コード／納税者番号',
        codiceFiscaleDescription:
            '署名担当者との現地訪問の様子、または録音された通話の動画をアップロードしてください。担当者は以下の情報を提供する必要があります：氏名、生年月日、会社名、登録番号、税コード番号、登記住所、事業内容、および口座の目的。',
    },
    completeVerificationStep: {
        completeVerification: '本人確認を完了',
        confirmAgreements: '以下の同意事項を確認してください。',
        certifyTrueAndAccurate: '提供された情報が真実かつ正確であることを証明します',
        certifyTrueAndAccurateError: '情報が真実かつ正確であることを証明してください',
        isAuthorizedToUseBankAccount: '私は、このビジネス銀行口座をビジネス支出に利用する権限があります。',
        isAuthorizedToUseBankAccountError: 'ビジネス銀行口座を操作する権限を持つ管理責任者である必要があります',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を確認する',
        validateButtonText: '検証',
        validationInputLabel: '取引',
        maxAttemptsReached: '誤った試行が多すぎたため、この銀行口座の認証は無効化されています。',
        description: `1～2 営業日以内に、「Expensify, Inc. Validation」のような名義から、お客様の銀行口座宛てに少額の取引を3件送金します。`,
        descriptionCTA: '各トランザクションの金額を下のフィールドに入力してください。例：1.51。',
        letsChatText: 'あと少しです！最後にいくつかの情報をチャットで確認するお手伝いをお願いします。準備はいいですか？',
        enable2FATitle: '不正利用を防ぐため、二要素認証（2FA）を有効にする',
        enable2FAText: 'お客様のセキュリティを重視しています。アカウントにさらに強力な保護を追加するため、今すぐ2要素認証（2FA）を設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    countryStep: {
        confirmBusinessBank: 'ビジネス用銀行口座の通貨と国を確認',
        confirmCurrency: '通貨と国を確認',
        yourBusiness: 'ビジネス用銀行口座の通貨は、ワークスペースの通貨と一致している必要があります。',
        youCanChange: 'ワークスペースの通貨は、次の場所で変更できます：',
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
        regulationRequiresUs: '規制により、署名者が事業を代表してこの操作を行う権限を有しているか確認する必要があります。',
        whatsYourName: '法的氏名を教えてください',
        fullName: '法的氏名',
        whatsYourJobTitle: 'あなたの職種（役職）は何ですか？',
        jobTitle: '役職',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        uploadID: '本人確認書類と住所証明書をアップロード',
        personalAddress: '個人住所の証明（例：公共料金の請求書など）',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '本人住所の証明',
        enterOneEmail: ({companyName}: CompanyNameParams) => `${companyName} の取締役のメールアドレスを入力してください`,
        regulationRequiresOneMoreDirector: '規定により、署名者としてさらに1人以上の取締役が必要です。',
        hangTight: '少々お待ちください…',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `${companyName} の取締役2名のメールアドレスを入力してください`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: '現在、他の方がこのビジネスの取締役として本人確認を完了するのを待っています。',
        id: '身分証明書のコピー',
        proofOfDirectors: '取締役の証明',
        proofOfDirectorsDescription: '例：Oncorp 企業プロフィールまたは会社登録。',
        codiceFiscale: '納税者番号',
        codiceFiscaleDescription: '署名者、権限保有ユーザーおよび実質的支配者のための Codice Fiscale。',
        PDSandFSG: 'PDS + FSG 開示書類',
        PDSandFSGDescription: dedent(`
            Expensifyのグローバル払い戻し機能は、Corpayが保有する広範な国際銀行パートナーネットワークを活用するために、API接続を用いたCorpayとの提携によって提供されています。オーストラリアの規制に基づき、Corpayの金融サービスガイド（FSG）および金融商品開示文書（PDS）を提供します。

            Corpayが提供する商品およびサービスの詳細と重要な情報が記載されていますので、FSGおよびPDSをよくお読みください。将来の参照のため、これらの文書は大切に保管してください。
        `),
        pleaseUpload: 'ビジネスの取締役としての本人確認を行うため、追加の書類を下からアップロードしてください。',
        enterSignerInfo: '署名者情報を入力',
        thisStep: 'このステップは完了しました',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `は、従業員への${currency}での支払いのため、末尾が${bankAccountLastFour}の${currency}建てビジネス銀行口座をExpensifyに接続しています。次のステップでは、取締役の署名者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスが重複しています',
        },
    },
    agreementsStep: {
        agreements: '契約',
        pleaseConfirm: '以下の合意事項を確認してください',
        regulationRequiresUs: '規制により、事業の25％を超えて所有する個人の本人確認を行うことが求められています。',
        iAmAuthorized: '私は、ビジネス支出のためにビジネス用銀行口座を利用する権限があります。',
        iCertify: '提供された情報が真実かつ正確であることを証明します。',
        iAcceptTheTermsAndConditions: `<a href="https://cross-border.corpay.com/tc/">利用規約</a>に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約と条件に同意します。',
        accept: '銀行口座を承認して追加',
        iConsentToThePrivacyNotice: '私は<a href="https://payments.corpay.com/compliance">プライバシー通知</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシーに関する通知に同意します。',
        error: {
            authorized: 'ビジネス銀行口座を操作する権限を持つ管理責任者である必要があります',
            certify: '情報が真実かつ正確であることを証明してください',
            consent: 'プライバシーに関する通知に同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusign フォーム',
        pleaseComplete:
            '下記の DocuSign リンクから ACH 承認フォームにご記入いただき、署名済みのコピーをこちらにアップロードしてください。お客様の銀行口座から直接資金を引き落としできるようにいたします。',
        pleaseCompleteTheBusinessAccount: 'ビジネスアカウント申込用の口座振替契約書にご記入ください',
        pleaseCompleteTheDirect:
            '以下のDocusignリンクから口座振替契約を完了し、署名済みのコピーをこちらにアップロードしてください。お客様の銀行口座から直接資金を引き落としできるようにするためです。',
        takeMeTo: 'DocuSign に移動',
        uploadAdditional: '追加の書類をアップロード',
        pleaseUpload: 'DEFT フォームと Docusign の署名ページをアップロードしてください',
        pleaseUploadTheDirect: '口座振替の取り決め書とDocuSignの署名ページをアップロードしてください',
    },
    finishStep: {
        letsFinish: 'チャットで完了しましょう！',
        thanksFor:
            '詳細をご提供いただきありがとうございます。専任のサポート担当者が、ただ今よりお客様の情報を確認いたします。追加で必要な情報がある場合は、改めてご連絡いたしますが、その前でもご不明点があればいつでもお気軽にお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '不正利用を防ぐために二要素認証（2FA）を有効にする',
        weTake: 'お客様のセキュリティを重視しています。アカウントにさらに強力な保護を追加するため、今すぐ2要素認証（2FA）を設定してください。',
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
        header: '出張の予約',
        title: 'スマートに旅する',
        subtitle: 'Expensify Travel を使って、最高の旅行プランを入手し、すべての経費精算を 1 か所で管理しましょう。',
        features: {
            saveMoney: '予約でお得に節約しましょう',
            alerts: 'リアルタイムの更新とアラートを受け取る',
        },
        bookTravel: '出張の予約',
        bookDemo: 'デモを予約',
        bookADemo: 'デモを予約',
        toLearnMore: '詳細はこちらをご覧ください。',
        termsAndConditions: {
            header: '続ける前に…',
            title: '利用規約',
            label: '利用規約に同意します',
            subtitle: `Expensify Travelの<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります',
            defaultWorkspaceError:
                'Expensify Travelを有効にするには、デフォルトのワークスペースを設定する必要があります。［設定］>［ワークスペース］> ワークスペース横の縦三点アイコンをクリック >［デフォルトのワークスペースとして設定］の順に選択してから、再度お試しください。',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '乗客',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>このフライトの前に<strong>${layover} の乗り継ぎ時間</strong>があります</muted-text-label>`,
            takeOff: '離陸',
            landing: 'ランディング',
            seat: 'シート',
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
            cancellationUntil: 'いつまでなら無料でキャンセル可能',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '返金不可',
                freeCancellationUntil: 'いつまでなら無料でキャンセル可能',
                partiallyRefundable: '一部返金可',
            },
        },
        car: '車',
        carDetails: {
            rentalCar: 'レンタカー',
            pickUp: 'ピックアップ',
            dropOff: 'ドロップオフ',
            driver: 'ドライバー',
            carType: '車種',
            cancellation: 'キャンセルポリシー',
            cancellationUntil: 'いつまでなら無料でキャンセル可能',
            freeCancellation: '無料キャンセル',
            confirmation: '確認番号',
        },
        train: '鉄道',
        trainDetails: {
            passenger: '乗客',
            departs: '出発',
            arrives: '到着',
            coachNumber: 'コーチ番号',
            seat: 'シート',
            fareDetails: '運賃の詳細',
            confirmation: '確認番号',
        },
        viewTrip: '出張を表示',
        modifyTrip: '出張を変更',
        tripSupport: '出張サポート',
        tripDetails: '出張の詳細',
        viewTripDetails: '出張の詳細を表示',
        trip: '出張',
        trips: '出張',
        tripSummary: '出張サマリー',
        departs: '出発',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>出張を予約するには、<a href="${phoneErrorMethodsRoute}">勤務先のメールアドレスを主なログインに追加</a>してください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travel のセットアップ用ドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `ドメイン <strong>${domain}</strong> に対して Expensify Travel を有効にする権限がありません。代わりに、そのドメインのメンバーに Travel を有効にしてもらう必要があります。`,
            accountantInvitation: `あなたが会計士であれば、このドメインで出張を有効にするために、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士プログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travel を使い始める',
            message: `Expensify Travel では、個人用メール（例：name@gmail.com）ではなく、勤務先のメール（例：name@company.com）を使用する必要があります。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel は無効になっています',
            message: `管理者がExpensify Travelをオフにしました。出張手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: 'お客様のリクエストを確認しています…',
            message: `Expensify Travel をご利用いただく準備が整っているかどうかを確認するため、現在こちらでいくつかのチェックを行っています。まもなくご連絡いたします！`,
            confirmText: '了解',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン ${domain} の出張機能の有効化に失敗しました。このドメインの出張機能を確認して有効にしてください。`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）の予約が完了しました。確認コード：${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）のチケットは無効になりました。`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）のチケットは、払い戻しまたは交換されました。`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）は、航空会社によってキャンセルされました。`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `航空会社がフライト ${airlineCode} のスケジュール変更を提案しました。現在、確認待ちです。`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `スケジュール変更が確定しました：フライト ${airlineCode} の新しい出発時刻は ${startDate} です。`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）が更新されました。`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `ご利用の客室クラスは、${airlineCode}便で${cabinClass}に更新されました。`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定が確定しました。`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定が変更されました。`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定は削除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `あなたは${type}予約 ${id}をキャンセルしました。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `ベンダーがあなたの${type}予約${id}をキャンセルしました。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `あなたの${type}予約は再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `${type}の予約が更新されました。旅程表で新しい詳細を確認してください。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `${origin} から ${destination} への ${startDate} の鉄道チケットは払い戻しされました。クレジットが処理されます。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行き鉄道チケットは交換されました。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行きの鉄道チケットが更新されました。`,
            defaultUpdate: ({type}: TravelTypeParams) => `あなたの${type}予約が更新されました。`,
        },
        flightTo: '行きのフライト',
        trainTo: '〜行き列車',
        carRental: 'レンタカー',
        nightIn: '夜',
        nightsIn: '泊数',
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
            reimburse: '払戻し',
            categories: 'カテゴリ',
            tags: 'タグ',
            customField1: 'カスタムフィールド 1',
            customField2: 'カスタムフィールド 2',
            customFieldHint: 'このメンバーのすべての支出に適用されるカスタムコーディングを追加します。',
            reports: 'レポート',
            reportFields: 'レポート項目',
            reportTitle: 'レポートタイトル',
            reportField: 'レポート項目',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            perDiem: '日当',
            travel: '旅行',
            members: 'メンバー',
            accounting: '経理',
            receiptPartners: '領収書パートナー',
            rules: 'ルール',
            displayedAs: '表示:',
            plan: 'プラン',
            profile: '概要',
            bankAccount: '銀行口座',
            testTransactions: 'テスト取引',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードの照合',
            selectAll: 'すべて選択',
            selected: () => ({
                one: '1 件選択済み',
                other: (count: number) => `${count}件選択済み`,
            }),
            settlementFrequency: '決済頻度',
            setAsDefault: 'デフォルトのワークスペースとして設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信された領収書は、このワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？すべてのカードフィードと割り当てられているカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。ワークスペースに新しいメンバーを招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページへのアクセス権がありません。このワークスペースへの参加を希望する場合は、ワークスペースのオーナーにメンバーとして追加してもらうよう依頼してください。その他のお問い合わせは、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
            goToWorkspace: 'ワークスペースに移動',
            duplicateWorkspace: 'ワークスペースを複製',
            duplicateWorkspacePrefix: '複製',
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
            defaultDescription: 'すべての領収書と経費を一か所で管理。',
            descriptionHint: 'このワークスペースに関する情報をすべてのメンバーと共有します。',
            welcomeNote: '精算のため、領収書の提出には Expensify をご利用ください。ありがとうございます。',
            subscription: 'サブスクリプション',
            markAsEntered: '手入力としてマーク',
            markAsExported: 'エクスポート済みにする',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポート`,
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            lineItemLevel: '明細行レベル',
            reportLevel: 'レポートレベル',
            topLevel: 'トップレベル',
            appliedOnExport: 'Expensify にインポートされず、エクスポート時に適用されます',
            shareNote: {
                header: '他のメンバーとワークスペースを共有する',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `このQRコードを共有するか、以下のリンクをコピーして、メンバーがあなたのワークスペースへのアクセスを簡単にリクエストできるようにしましょう。ワークスペースへの参加リクエストはすべて、あなたが確認できるように<a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>ルームに表示されます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続したことがあるため、既存の接続を再利用するか、新しい接続を作成するかを選択できます。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 最終同期日 ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `認証エラーのため、${connectionName} に接続できません。`,
            learnMore: '詳しく見る',
            memberAlternateText: 'メンバーはレポートを提出および承認できます。',
            adminAlternateText: '管理者は、すべてのレポートとワークスペース設定をフル編集アクセスで操作できます。',
            auditorAlternateText: '監査者はレポートを閲覧し、コメントできます。',
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
                instant: 'インスタント',
                immediate: '毎日',
                trip: '出張ごと',
                weekly: '毎週',
                semimonthly: '月に2回',
                monthly: '毎月',
            },
            planType: 'プランの種類',
            submitExpense: '経費を以下から提出してください:',
            defaultCategory: 'デフォルトカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} の経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card の取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">当社の統合機能</a>によって作成された「Expensify Card Liability Account」に自動的にエクスポートされます。</muted-text-label>`,
        },
        receiptPartners: {
            connect: '今すぐ接続',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `${organizationName} に接続済み` : '組織全体の出張費や飲食デリバリー経費を自動化しましょう。',
                sendInvites: '招待を送信',
                sendInvitesDescription: 'これらのワークスペースメンバーは、まだ Uber for Business アカウントを持っていません。今回は招待したくないメンバーの選択を解除してください。',
                confirmInvite: '招待を確認',
                manageInvites: '招待を管理',
                confirm: '確認',
                allSet: '準備完了',
                readyToRoll: '準備完了です',
                takeBusinessRideMessage: 'ビジネス用に乗車すると、Uber の領収書が Expensify に自動取り込みされます。さあ、急いで！',
                all: 'すべて',
                linked: 'リンク済み',
                outstanding: '未払い',
                status: {
                    resend: '再送',
                    invite: '招待',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'リンク済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '一時停止中',
                },
                centralBillingAccount: '中央請求アカウント',
                centralBillingDescription: 'すべての Uber 領収書をどこにインポートするかを選択してください。',
                invitationFailure: 'Uber for Business へのメンバー招待に失敗しました',
                autoInvite: 'Uber for Business に新しいワークスペースメンバーを招待',
                autoRemove: 'Uber for Business から削除されたワークスペースメンバーを無効化する',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: '組織全体の出張および食事配達経費を自動化するために、Uber for Business を連携しましょう。',
                emptyContent: {
                    title: '未対応の招待はありません',
                    subtitle: 'やった！あちこち探しましたが、未処理の招待は見つかりませんでした。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>出張日当を設定して、従業員の日々の経費を管理しましょう。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳細はこちら</a>。</muted-text>`,
            amount: '金額',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            deletePerDiemRate: '日当料金を削除',
            findPerDiemRate: '日当額を検索',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらの料金を削除してもよろしいですか？',
            }),
            emptyList: {
                title: '日当',
                subtitle: '日当レートを設定して、従業員の1日あたりの支出を管理しましょう。スプレッドシートからレートをインポートして開始できます。',
            },
            importPerDiemRates: '日当レートをインポート',
            editPerDiemRate: '出張日当レートを編集',
            editPerDiemRates: '日当レートを編集',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `この行き先を更新すると、すべての ${destination} の日当サブレートが変更されます。`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `この通貨を更新すると、すべての${destination}の日当サブレートが変更されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '自己負担経費を QuickBooks Desktop へエクスポートする方法を設定します。',
            exportOutOfPocketExpensesCheckToggle: '「後で印刷」チェックをマーク',
            exportDescription: 'Expensify データを QuickBooks Desktop へエクスポートする方法を設定する',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensifyカードの取引を次の形式でエクスポート',
            account: 'アカウント',
            accountDescription: '仕訳をどこに投稿するかを選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '売掛金の作成場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: 'どこから小切手を送信するかを選択してください。',
            creditCardAccount: 'クレジットカード口座',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを QuickBooks Desktop にエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
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
            exportCheckDescription: '以下の銀行口座から、各Expensifyレポートに対して明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に転記します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きのベンダー請求書を作成し、以下のアカウントに追加します。この期間がクローズされている場合は、次のオープン期間の1日付で計上します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop は仕訳のエクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '確認',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    '以下の銀行口座から、各Expensifyレポートに対して明細付きの小切手を作成し、送金します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の対応する仕入先と照合します。該当する仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートについて、最後の経費の日付を使用して明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で記帳します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'どこから小切手を送信するかを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '所在地を有効にしている場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Desktop にアカウントを追加して、もう一度接続を同期してください',
            qbdSetup: 'QuickBooks Desktop のセットアップ',
            requiredSetupDevice: {
                title: 'このデバイスから接続できません',
                body1: 'QuickBooks Desktop の会社ファイルを保存しているコンピューターから、この接続を設定する必要があります。',
                body2: '接続が完了すると、どこからでも同期やエクスポートができるようになります。',
            },
            setupPage: {
                title: 'このリンクを開いて接続してください',
                body: '設定を完了するには、QuickBooks Desktop が実行されているコンピューターで次のリンクを開いてください。',
                setupErrorTitle: '問題が発生しました',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>現在、QuickBooks Desktop との接続が機能していません。後でもう一度お試しいただくか、問題が解決しない場合は<a href="${conciergeLink}">Concierge までお問い合わせください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks Desktop から Expensify にインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            items: 'アイテム',
            customers: '顧客／プロジェクト',
            exportCompanyCardsDescription: '会社カードでの購入を QuickBooks Desktop へどのようにエクスポートするかを設定します。',
            defaultVendorDescription: 'エクスポート時に、すべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            accountsDescription: 'QuickBooks Desktop の勘定科目表は、Expensify ではカテゴリーとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、有効または無効のカテゴリとしてインポートするように選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Desktop のクラスをどのように処理するかを選択してください。',
            tagsDisplayedAsDescription: '明細行レベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'Expensify で QuickBooks Desktop の顧客／プロジェクトをどのように処理するかを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に QuickBooks Desktop と同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Desktop に既存のベンダーが存在しない場合、自動的にベンダーを作成します。',
            },
            itemsDescription: 'Expensify で QuickBooks Desktop の品目をどのように処理するかを選択してください。',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費をいつエクスポートするかを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は支払われた時点でエクスポートされます',
                },
            },
        },
        qbo: {
            connectedTo: '接続先',
            importDescription: 'QuickBooks Online から Expensify にインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            locations: '場所',
            customers: '顧客／プロジェクト',
            accountsDescription: 'QuickBooks Online の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、有効または無効のカテゴリとしてインポートするように選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Online のクラスをどのように処理するかを選択してください。',
            customersDescription: 'Expensify で QuickBooks Online の顧客／プロジェクトをどのように処理するかを選択してください。',
            locationsDescription: 'Expensify で QuickBooks Online の所在地をどのように処理するかを選択してください。',
            taxesDescription: 'Expensify で QuickBooks Online の税金をどのように処理するかを選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online は、小切手または仕入先請求書に対して、明細行レベルでのロケーションをサポートしていません。明細行レベルでロケーションを利用したい場合は、仕訳とクレジット／デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online は仕訳入力での税金に対応していません。エクスポートのオプションを、仕入先請求書または小切手に変更してください。',
            exportDescription: 'Expensify のデータを QuickBooks Online へどのようにエクスポートするかを設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensifyカードの取引を次の形式でエクスポート',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを QuickBooks Online にエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Online にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            receivable: '売掛金', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '売掛金アーカイブ', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'QuickBooks Online に請求書をエクスポートする際にこのアカウントを使用します。',
            exportCompanyCardsDescription: '会社カードでの購入を QuickBooks Online へどのようにエクスポートするかを設定します。',
            vendor: 'ベンダー',
            defaultVendorDescription: 'エクスポート時に、すべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            exportOutOfPocketExpensesDescription: '立替経費を QuickBooks Online へどのようにエクスポートするかを設定します。',
            exportCheckDescription: '以下の銀行口座から、各Expensifyレポートに対して明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に転記します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きのベンダー請求書を作成し、以下のアカウントに追加します。この期間がクローズされている場合は、次のオープン期間の1日付で計上します。',
            account: 'アカウント',
            accountDescription: '仕訳をどこに投稿するかを選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '売掛金の作成場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: 'どこから小切手を送信するかを選択してください。',
            creditCardAccount: 'クレジットカード口座',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online は、仕入先請求書のエクスポートでロケーションに対応していません。現在ワークスペースでロケーションが有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online は仕訳のエクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に QuickBooks Online と同期します。',
                inviteEmployees: '従業員を招待',
                inviteEmployeesDescription: 'QuickBooks Online の従業員レコードをインポートし、このワークスペースに従業員を招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Online にまだ存在しない場合はベンダーを自動的に作成し、請求書をエクスポートする際には顧客も自動作成します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートの支払いが行われるたびに、対応する請求支払いが下記の QuickBooks Online アカウントに作成されます。',
                qboBillPaymentAccount: 'QuickBooks の請求支払口座',
                qboInvoiceCollectionAccount: 'QuickBooks の請求書徴収口座',
                accountSelectDescription: '支払元の口座を選択すると、QuickBooks Online 内に支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の支払いの入金先を選択すると、QuickBooks Online に支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '確認',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'デビットカードの取引にある加盟店名を、自動的に QuickBooks 内の対応するベンダー名と照合します。該当するベンダーが存在しない場合は、関連付けのために「Debit Card Misc.」というベンダーを作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の対応する仕入先と照合します。該当する仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートについて、最後の経費の日付を使用して明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で記帳します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '所在地を有効にしている場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポート用に有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポート用の有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手の書き出し用に有効な口座を選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書のエクスポートを利用するには、QuickBooks Online で買掛金勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Online で仕訳勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェックのエクスポートを使用するには、QuickBooks Online で銀行口座を設定してください',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Online にアカウントを追加して、もう一度接続を同期してください。',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費をいつエクスポートするかを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は支払われた時点でエクスポートされます',
                },
            },
        },
        workspaceList: {
            joinNow: '今すぐ参加',
            askToJoin: '参加をリクエスト',
        },
        xero: {
            organization: 'Xero 組織',
            organizationDescription: 'データをインポートしたい Xero 組織を選択してください。',
            importDescription: 'Xero から Expensify へインポートするコーディング設定を選択してください。',
            accountsDescription: 'お客様のXeroの勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、有効または無効のカテゴリとしてインポートするように選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリ',
            trackingCategoriesDescription: 'ExpensifyでXeroのトラッキングカテゴリをどのように処理するかを選択してください。',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero の ${categoryName} をマッピング先`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Xero にエクスポートする際に、${categoryName} をどこにマッピングするかを選択してください。`,
            customers: '顧客への再請求',
            customersDescription: 'Expensify で顧客への再請求を行うかどうかを選択します。Xero の顧客コンタクトを経費にタグ付けでき、Xero へは売上請求書としてエクスポートされます。',
            taxesDescription: 'Expensify で Xero の税金をどのように処理するかを選択してください。',
            notImported: 'インポートされていません',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポート項目',
            },
            exportDescription: 'Expensify データを Xero へエクスポートする方法を設定します。',
            purchaseBill: '購入請求書',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、下記の Xero 銀行口座に銀行取引として計上され、取引日付は銀行取引明細書の日付と一致します。',
            bankTransactions: '銀行取引',
            xeroBankAccount: 'Xero 銀行口座',
            xeroBankAccountDescription: '経費を銀行取引として記録する場所を選択します。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで仕入請求書としてエクスポートされます。',
            purchaseBillDate: '購入請求書日',
            exportInvoices: '請求書を次の形式でエクスポート',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '売上請求書には、常に請求書を送信した日付が表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に Xero と同期します。',
                purchaseBillStatusTitle: '購入請求書ステータス',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が以下の Xero アカウント内に作成されます。',
                xeroBillPaymentAccount: 'Xero 請求書支払口座',
                xeroInvoiceCollectionAccount: 'Xero 請求書回収勘定',
                xeroBillPaymentAccountDescription: '請求書の支払元を選択すると、Xero 内に支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の支払いを受け取る場所を選択すると、Xero で支払いを作成します。',
            },
            exportDate: {
                label: '購入請求書日',
                description: 'レポートをXeroにエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
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
                label: '購入請求書ステータス',
                description: 'Xero に購入請求書をエクスポートする際に、このステータスを使用します。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xero にアカウントを追加して、もう一度接続を同期してください',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費をいつエクスポートするかを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は支払われた時点でエクスポートされます',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日',
                description: 'Sage Intacct へのレポートエクスポート時に、この日付を使用します。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
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
                description: '自己負担経費を Sage Intacct へどのようにエクスポートするかを設定します。',
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
            defaultVendor: '既定のベンダー',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Sage Intacct でベンダーが一致しない${isReimbursable ? '' : '非'}償還対象経費に適用されるデフォルトのベンダーを設定します。`,
            exportDescription: 'Expensify データを Sage Intacct へエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先エクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート用アカウントを設定している場合は、そのユーザーがドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先送信先の担当者は、自分のアカウントでエクスポート対象のレポートを確認できるようになります。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacct にアカウントを追加して、接続を再同期してください`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensify は毎日自動的に Sage Intacct と同期します。',
            inviteEmployees: '従業員を招待',
            inviteEmployeesDescription:
                'Sage Intacct の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認となり、「メンバー」ページでさらに設定できます。',
            syncReimbursedReports: '精算済みレポートを同期',
            syncReimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が下記の Sage Intacct アカウントに作成されます。',
            paymentAccount: 'Sage Intacct 支払口座',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費をいつエクスポートするかを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は支払われた時点でエクスポートされます',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'NetSuite でデータをインポートしたい子会社を選択してください。',
            exportDescription: 'Expensify データを NetSuite へエクスポートする方法を設定します。',
            exportInvoices: '請求書のエクスポート先',
            journalEntriesTaxPostingAccount: '仕訳の税金計上勘定',
            journalEntriesProvTaxPostingAccount: '仕訳伝票 州税計上勘定',
            foreignCurrencyAmount: '外貨金額をエクスポート',
            exportToNextOpenPeriod: '次の未締め期間にエクスポート',
            nonReimbursableJournalPostingAccount: '非精算仕訳計上勘定',
            reimbursableJournalPostingAccount: '経費精算対象仕訳計上勘定',
            journalPostingPreference: {
                label: '仕訳の記帳設定',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各レポートごとの単一の項目別エントリ',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各経費につき 1 件の入力',
                },
            },
            invoiceItem: {
                label: '請求書項目',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '作成してください',
                        description: 'エクスポート時に（まだ存在しない場合は）「Expensify invoice line item」を作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: '以下で選択されたアイテムに、Expensify からの請求書を紐付けます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日',
                description: 'NetSuite へレポートをエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがNetSuiteにエクスポートされた日付。',
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
                        reimbursableDescription: '立替経費は、経費レポートとして NetSuite にエクスポートされます。',
                        nonReimbursableDescription: '会社カード経費は、経費レポートとして NetSuite にエクスポートされます。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '仕入先請求書',
                        reimbursableDescription: dedent(`
                            立替経費は、下で指定された NetSuite のベンダー宛の支払請求書（Bill）としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、下記で指定された NetSuite ベンダー宛て支払の請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳伝票',
                        reimbursableDescription: dedent(`
                            立替経費は、下記で指定された NetSuite 勘定に仕訳としてエクスポートされます。

                            各カードごとに特定の仕入先を設定したい場合は、*設定 > ドメイン > Company Cards* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カードの経費は、以下で指定した NetSuite アカウントへ仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定する場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに切り替えると、個々のカードに対する NetSuite のベンダーおよび仕訳勘定は無効になります。\n\nご安心ください。後で元に戻したくなった場合に備えて、以前の選択内容は引き続き保存されます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に NetSuite と同期します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する請求支払が以下の NetSuite アカウント内に作成されます。',
                reimbursementsAccount: '払い戻し用口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、対応する支払いが NetSuite 内に作成されます。',
                collectionsAccount: '回収アカウント',
                collectionsAccountDescription: '請求書がExpensifyで支払済みとしてマークされ、NetSuiteにエクスポートされると、下記の勘定科目に紐づいて表示されます。',
                approvalAccount: '買掛金承認アカウント',
                approvalAccountDescription:
                    'NetSuite で取引の承認先となる勘定科目を選択してください。払い戻し済みレポートを同期する場合は、請求書支払いが計上される勘定科目としても使用されます。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定する',
                inviteEmployeesDescription:
                    'NetSuite の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認になり、詳細は「メンバー」ページでさらに設定できます。',
                autoCreateEntities: '従業員／ベンダーを自動作成',
                enableCategories: '新しくインポートされたカテゴリを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定されている優先取引フォームを使用して仕訳を作成します。必要に応じて、使用する特定の取引フォームを指定することもできます。',
                customFormIDReimbursable: '立替経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費精算書の承認レベル',
                    description: 'Expensify で経費精算書が承認され NetSuite にエクスポートされると、仕訳を記帳する前に、NetSuite 側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '上司承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '会計のみ承認済み',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '上長および経理が承認済み',
                    },
                },
                accountingMethods: {
                    label: 'エクスポートするタイミング',
                    description: '経費をいつエクスポートするかを選択してください:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は支払われた時点でエクスポートされます',
                    },
                },
                exportVendorBillsTo: {
                    label: '仕入先請求書の承認レベル',
                    description: 'ベンダー請求書がExpensifyで承認され、NetSuiteにエクスポートされると、仕訳を記帳する前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '投稿が承認されました',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensifyで仕訳が承認されてNetSuiteにエクスポートされた後、仕訳を記帳する前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '投稿が承認されました',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォームIDを入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuite にアカウントを追加して、接続をもう一度同期してください',
            noVendorsFound: 'ベンダーが見つかりません',
            noVendorsFoundDescription: 'NetSuite にベンダーを追加してから、接続を再同期してください',
            noItemsFound: '請求書アイテムが見つかりません',
            noItemsFoundDescription: 'NetSuite で請求書アイテムを追加し、接続をもう一度同期してください',
            noSubsidiariesFound: '子会社が見つかりません',
            noSubsidiariesFoundDescription: 'NetSuite で子会社を追加して、接続をもう一度同期してください',
            tokenInput: {
                title: 'NetSuite の設定',
                formSteps: {
                    installBundle: {
                        title: 'Expensify バンドルをインストール',
                        description: 'NetSuite で、*Customization > SuiteBundler > Search & Install Bundles* に移動し、「Expensify」と検索してバンドルをインストールします。',
                    },
                    enableTokenAuthentication: {
                        title: 'トークンベース認証を有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に進み、*token-based authentication* を有効にします。',
                    },
                    enableSoapServices: {
                        title: 'SOAP Webサービスを有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に移動し、*SOAP Web Services* を有効にします。',
                    },
                    createAccessToken: {
                        title: 'アクセストークンを作成',
                        description:
                            'NetSuite で、*Setup > Users/Roles > Access Tokens* に移動し、「Expensify」アプリおよび「Expensify Integration」ロールまたは「Administrator」ロールのアクセス・トークンを作成します。\n\n*重要：* このステップで表示される *Token ID* と *Token Secret* を必ず保存してください。次のステップで必要になります。',
                    },
                    enterCredentials: {
                        title: 'NetSuite の認証情報を入力してください',
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
                expenseCategories: '経費カテゴリ',
                expenseCategoriesDescription: 'NetSuite の経費カテゴリは、Expensify にカテゴリとしてインポートされます。',
                crossSubsidiaryCustomers: '複数子会社間の顧客／プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'Expensify で NetSuite の *departments* をどのように処理するかを選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensify で *クラス* をどのように扱うかを選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensifyで「所在地」をどのように扱うかを選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客／プロジェクト',
                    subtitle: 'NetSuite の *customers* と *projects* を Expensify でどのように処理するかを選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite から税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下のオプションから選択してください:',
                    label: ({importedTypes}: ImportedTypesParams) => `${importedTypes.join('と')} としてインポートされました`,
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
                            customRecordScriptID: '取引列ID',
                            mapping: '表示:',
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
                            customSegmentNameFooter: `NetSuite の「Customizations > Links, Records & Fields > Custom Segments」ページで、カスタムセグメント名を確認できます。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customRecordNameFooter: `NetSuite でカスタムレコード名を見つけるには、グローバル検索で「Transaction Column Field」と入力してください。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customSegmentInternalIDTitle: '内部IDとは何ですか？',
                            customSegmentInternalIDFooter: `まず、NetSuite で「*Home > Set Preferences > Show Internal ID*」に進み、内部 ID を有効にしてください。

カスタムセグメントの内部 ID は、NetSuite で以下の手順に従って確認できます。

1. 「*Customization > Lists, Records, & Fields > Custom Segments*」に移動します。
2. 対象のカスタムセグメントをクリックします。
3. *Custom Record Type* の横にあるハイパーリンクをクリックします。
4. 下部のテーブルから内部 ID を見つけます。

_より詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordInternalIDFooter: `NetSuite でカスタムレコードの内部 ID を見つけるには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックします。
3. 左側に表示されている内部 ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentScriptIDTitle: 'スクリプト ID は何ですか？',
                            customSegmentScriptIDFooter: `NetSuite でカスタムセグメントのスクリプト ID を確認するには、次の手順に従ってください。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックします。
3. 画面下部付近にある *Application and Sourcing* タブをクリックし、次のいずれかを行います。
    a. カスタムセグメントを Expensify の *タグ*（明細行レベル）として表示したい場合は、*Transaction Columns* サブタブをクリックし、*Field ID* を使用します。
    b. カスタムセグメントを Expensify の *レポートフィールド*（レポートレベル）として表示したい場合は、*Transactions* サブタブをクリックし、*Field ID* を使用します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordScriptIDTitle: 'トランザクション列IDは何ですか？',
                            customRecordScriptIDFooter: `NetSuite でカスタムレコードのスクリプト ID を見つけるには、次の手順に従ってください：

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックします。
3. 左側に表示されているスクリプト ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentMappingTitle: 'このカスタムセグメントは、Expensify 内でどのように表示されるべきですか？',
                            customRecordMappingTitle: 'このカスタムレコードは Expensify でどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `この${fieldName?.toLowerCase()}を持つカスタムセグメント／レコードはすでに存在します`,
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
                            transactionFieldID: '取引フィールド ID',
                            mapping: '表示:',
                        },
                        removeTitle: 'カスタムリストを削除',
                        removePrompt: 'このカスタムリストを削除してもよろしいですか？',
                        addForm: {
                            listNameTitle: 'カスタムリストを選択',
                            transactionFieldIDTitle: '取引フィールドIDは何ですか？',
                            transactionFieldIDFooter: `NetSuite でトランザクションフィールド ID を確認するには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムリストをクリックして開きます。
3. 左側に表示されているトランザクションフィールド ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            mappingTitle: 'このカスタムリストは Expensify でどのように表示されますか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールド ID を使用したカスタムリストはすでに存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 従業員デフォルト',
                        description: 'Expensify にインポートされず、エクスポート時に適用されます',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `NetSuite で ${importField} を使用すると、Expense Report または Journal Entry へエクスポートする際に、従業員レコードで設定されているデフォルトが適用されます。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: '明細行レベル',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} は、従業員のレポート内の各経費ごとに選択できるようになります。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'レポート項目',
                        description: 'レポートレベル',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} の選択は、従業員のレポート上のすべての経費に適用されます。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct のセットアップ',
            prerequisitesTitle: '接続する前に…',
            downloadExpensifyPackage: 'Sage Intacct 用の Expensify パッケージをダウンロード',
            followSteps: '「操作方法：Sage Intacct に接続する」の手順に従ってください',
            enterCredentials: 'Sage Intacct の認証情報を入力してください',
            entity: 'エンティティ',
            employeeDefault: 'Sage Intacct 従業員デフォルト',
            employeeDefaultDescription: '従業員に既定の部門が設定されている場合、その部門が Sage Intacct での経費に適用されます。',
            displayedAsTagDescription: '従業員のレポート内の各経費ごとに、部門を個別に選択できるようになります。',
            displayedAsReportFieldDescription: '部門の選択は、従業員のレポート内のすべての経費に適用されます。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Expensify で Sage Intacct の <strong>${mappingTitle}</strong> をどのように処理するかを選択してください。`,
            expenseTypes: '経費タイプ',
            expenseTypesDescription: 'Sage Intacct の経費タイプは、Expensify では「カテゴリ」としてインポートされます。',
            accountTypesDescription: 'Sage Intacct の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            importTaxDescription: 'Sage Intacct から購入税率をインポートします。',
            userDefinedDimensions: 'ユーザー定義ディメンション',
            addUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            integrationName: '連携名',
            dimensionExists: 'この名前のディメンションはすでに存在します。',
            removeDimension: 'ユーザー定義ディメンションを削除',
            removeDimensionPrompt: 'このユーザー定義ディメンションを削除してもよろしいですか？',
            userDefinedDimension: 'ユーザー定義ディメンション',
            addAUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            detailedInstructionsLink: '詳細な手順を表示',
            detailedInstructionsRestOfSentence: 'ユーザー定義ディメンションの追加時に。',
            userDimensionsAdded: () => ({
                one: '1 件のUDDを追加しました',
                other: (count: number) => `${count} 個のUDDを追加しました`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部門';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'クラス';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'ロケーション';
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
            control: '管理',
            collect: '回収',
        },
        companyCards: {
            addCards: 'カードを追加',
            selectCards: 'カードを選択',
            addNewCard: {
                other: 'その他',
                cardProviders: {
                    gl1025: 'American Express コーポレートカード',
                    cdf: 'Mastercard コマーシャルカード',
                    vcf: 'Visaコマーシャルカード',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `カードの発行会社はどこですか？`,
                whoIsYourBankAccount: 'あなたの銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: '銀行への接続方法を選択してください',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>の詳細を見る。</muted-text>`,
                commercialFeedDetails: '銀行との設定が必要です。これは通常、大企業で利用され、条件を満たす場合には最適なオプションとなることが多いです。',
                commercialFeedPlaidDetails: `ご利用の銀行での設定が必要ですが、手順は当社がご案内します。通常は大企業向けに限定されています。`,
                directFeedDetails: '最もシンプルな方法です。マスター認証情報を使用してすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `${provider}フィードを有効にする`,
                    heading: 'お使いのカード発行会社と直接連携しているため、取引データを迅速かつ正確に Expensify に取り込むことができます。\n\n開始するには、次の手順に従ってください。',
                    visa: '私たちはVisaとグローバル統合を行っていますが、利用資格は銀行やカードプログラムによって異なります。\n\n開始するには、次の手順に従ってください。',
                    mastercard: 'Mastercard とのグローバル連携がありますが、利用資格は銀行およびカードプログラムによって異なります。\n\n開始するには、次の手順に従ってください。',
                    vcf: `1. Visa Commercial Card の設定方法についての詳細な手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。

2. ご利用のプログラムでコマーシャルフィードをサポートしているか確認し、有効化を依頼するために、[銀行に連絡](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})してください。

3. *フィードが有効化され、その詳細がわかったら、次の画面に進んでください。*`,
                    gl1025: `1. お使いのプログラムで American Express が商用フィードを有効にできるかどうかを確認するには、[このヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) をご覧ください。

2. フィードが有効になると、Amex から本番レターが送付されます。

3. *フィード情報を入手したら、次の画面に進んでください。*`,
                    cdf: `1. Mastercard Commercial Cards のセットアップ方法についての詳細な手順は、[このヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。

2. プログラムで商用フィードがサポートされているか確認し、有効化を依頼するために、[銀行に連絡する](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) してください。

3. *フィードが有効化され、その詳細がわかったら、次の画面に進んでください。*`,
                    stripe: `1. Stripe のダッシュボードを開き、[Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}) に移動します。

2. 「Product Integrations」の下で、Expensify の横にある「Enable」をクリックします。

3. フィードが有効になったら、下の「Submit」をクリックしてください。こちらで追加作業を進めます。`,
                },
                whatBankIssuesCard: 'これらのカードを発行している銀行はどこですか？',
                enterNameOfBank: '銀行名を入力',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細は何ですか？',
                        processorLabel: 'プロセッサー ID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社 ID',
                        helpLabel: 'これらのIDはどこで見つけられますか？',
                    },
                    gl1025: {
                        title: `Amex の配信ファイル名は何ですか？`,
                        fileNameLabel: '配送ファイル名',
                        helpLabel: '配信ファイル名はどこで確認できますか？',
                    },
                    cdf: {
                        title: `Mastercard 配布 ID とは何ですか？`,
                        distributionLabel: '配布 ID',
                        helpLabel: 'ディストリビューションIDはどこで見つけられますか？',
                    },
                },
                amexCorporate: 'カードの表面に「Corporate」と表示されている場合は、これを選択してください',
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
                    prompt: 'カードの追加が完了していないようです。問題が見つかった場合はお知らせください。解決してスムーズに進められるようお手伝いします。',
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
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}カード`,
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseCard: 'カードを選択',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `<strong>${assignee}</strong> にカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードにはアクティブなカードがありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>または、何かが壊れている可能性があります。いずれにしても、ご不明な点があれば、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択',
            startDateDescription: 'この日付以降のすべての取引をインポートします。日付が指定されていない場合は、利用中の銀行が許可する最も過去の日付までさかのぼります。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタム締め日',
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            confirmationDescription: 'すぐに取引のインポートを開始します。',
            cardholder: 'カード保有者',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィード接続が切断されています。接続を再確立するために、<a href="#">銀行にログイン</a>してください。</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `${assignee} に ${link} を割り当てました！インポートされた取引はこのチャットに表示されます。`,
            companyCard: '法人カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limited は、Plaid Financial Ltd. の代理人であり、Payment Services Regulations 2017 の下で金融行為監督機構（Financial Conduct Authority）の規制を受けている認可決済機関です（会社参照番号：804718）。Plaid は、その代理人である Expensify Limited を通じて、規制対象の口座情報サービスをお客様に提供します。',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Card を発行および管理',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            verificationInProgress: '検証を進行中…',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensify Card を発行できる準備が整いましたら、Concierge からお知らせします。',
            disclaimer:
                'Expensify Visa® Commercial Card は Visa U.S.A. Inc. からのライセンスに基づき、The Bancorp Bank, N.A., Member FDIC によって発行されており、Visa カードを受け付けるすべての加盟店で使用できるとは限りません。Apple® および Apple ロゴ® は、米国およびその他の国において登録された Apple Inc. の商標です。App Store は Apple Inc. のサービスマークです。Google Play および Google Play ロゴは、Google LLC の商標です。',
            euUkDisclaimer:
                'EEA 在住者向けに提供されるカードは Transact Payments Malta Limited により発行され、英国在住者向けに提供されるカードは Visa Europe Limited のライセンスに基づき Transact Payments Limited により発行されます。Transact Payments Malta Limited は、1994 年金融機関法に基づきマルタ金融サービス庁により正式に認可・監督された金融機関です。登録番号 C 91879。Transact Payments Limited はジブラルタル金融サービス委員会により認可・監督されています。',
            issueCard: 'カードを発行',
            findCard: 'カードを検索',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '下4桁',
            limit: '制限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在残高は、直近の清算日以降に発生した、すべての記帳済み Expensify Card 取引の合計です。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `残高は${settlementDate}に精算されます`,
            settleBalance: '残高を精算',
            cardLimit: 'カード上限',
            remainingLimit: '残りの上限',
            requestLimitIncrease: 'リクエスト上限の引き上げ',
            remainingLimitDescription:
                'ご利用可能額を算出する際には、いくつかの要素を考慮します。たとえば、お客様としてのご利用期間、ご登録時にご提供いただいた事業関連情報、そして事業用銀行口座の利用可能残高などです。ご利用可能額は日々変動する場合があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース全体での毎月の清算済み Expensify Card 利用額に基づいています。',
            issueNewCard: '新しいカードを発行',
            finishSetup: 'セットアップを完了',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: '既存のビジネス銀行口座を選択してExpensifyカードの残高を支払うか、新しい銀行口座を追加してください',
            accountEndingIn: '末尾が … のアカウント',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '決済口座',
            settlementAccountDescription: 'Expensifyカードの残高を支払う口座を選択してください。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Continuous Reconciliation が正しく機能するように、この口座が、<a href="${reconciliationAccountSettingsLink}">照合口座</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '決済頻度',
            settlementFrequencyDescription: 'Expensify Card の残高を支払う頻度を選択してください。',
            settlementFrequencyInfo: '月次精算に切り替えるには、Plaid を通じて銀行口座を連携し、過去90日間の残高履歴がプラスである必要があります。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カード情報',
            cardPending: ({name}: {name: string}) => `カードは現在保留中で、${name} さんのアカウントが承認され次第、発行されます。`,
            virtual: 'バーチャル',
            physical: '物理',
            deactivate: 'カードを無効化',
            changeCardLimit: 'カード上限を変更',
            changeLimit: '上限を変更',
            smartLimitWarning: ({limit}: CharacterLimitParams) => `このカードの上限額を${limit}に変更すると、カード上のより多くの経費を承認するまで、新しい取引は拒否されます。`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `このカードの利用限度額を${limit}に変更すると、来月まで新しい取引は拒否されます。`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `このカードの利用限度額を${limit}に変更すると、新しい取引は承認されません。`,
            changeCardLimitType: 'カードの上限タイプを変更',
            changeLimitType: '制限タイプを変更',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの限度額タイプをスマート限度額に変更すると、未承認の限度額 ${limit} にすでに達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの上限タイプを「月次」に変更すると、${limit} の月次上限にすでに達しているため、新しい取引は却下されます。`,
            addShippingDetails: '配送先情報を追加',
            issuedCard: ({assignee}: AssigneeParams) => `${assignee} に Expensify Card を発行しました！カードは 2～3 営業日以内に到着します。`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `${assignee} に Expensify Card を発行しました！配送先の詳細が確認され次第、カードは発送されます。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `${assignee} にバーチャル Expensify Card を発行しました！${link} はすぐに使用できます。`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} が配送先情報を追加しました。Expensify Card は2～3営業日で到着します。`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} は自分の Expensify Card を再発行しました。新しいカードは2～3営業日で届きます。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} がバーチャル Expensify Card を再発行しました！${link} はすぐに利用できます。`,
            card: 'カード',
            replacementCard: '再発行カード',
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座が確認されました',
            verifyingBankAccount: '銀行口座を確認しています…',
            verifyingBankAccountDescription: 'このアカウントで Expensify カードを発行できることを確認しています。しばらくお待ちください。',
            bankAccountVerified: '銀行口座が確認されました！',
            bankAccountVerifiedDescription: 'これで、ワークスペースのメンバーに Expensify Card を発行できるようになりました。',
            oneMoreStep: 'あと一歩です…',
            oneMoreStepDescription: '銀行口座の手動確認が必要なようです。手順が記載されていますので、Concierge に移動してご確認ください。',
            gotIt: '了解',
            goToConcierge: 'Concierge へ移動',
        },
        categories: {
            deleteCategories: 'カテゴリーを削除',
            deleteCategoriesPrompt: 'これらのカテゴリーを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリーを無効にする',
            disableCategory: 'カテゴリを無効にする',
            enableCategories: 'カテゴリを有効にする',
            enableCategory: 'カテゴリを有効にする',
            defaultSpendCategories: 'デフォルトの支出カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引やスキャンしたレシートにおける支出先（マーチャント）の分類方法をカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください。',
            categoryName: 'カテゴリ名',
            requiresCategory: 'メンバーはすべての経費をカテゴリー分けする必要があります',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `すべての経費は、${connectionName} へエクスポートするためにカテゴリ分けする必要があります。`,
            subtitle: 'お金がどこで使われているかを、より明確に把握しましょう。デフォルトのカテゴリを使うか、自分専用のカテゴリを追加できます。',
            emptyCategories: {
                title: 'カテゴリがまだ作成されていません',
                subtitle: '支出を整理するためにカテゴリを追加してください。',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>現在、お使いのカテゴリは会計連携からインポートされています。変更を行うには、<a href="${accountingPageURL}">会計</a>ページに移動してください。</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリーの更新中にエラーが発生しました。もう一度お試しください。',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください。',
            addCategory: 'カテゴリーを追加',
            editCategory: 'カテゴリを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを検索',
            categoryRequiredError: 'カテゴリ名は必須です',
            existingCategoryError: 'この名前のカテゴリはすでに存在します',
            invalidCategoryName: '無効なカテゴリ名',
            importedFromAccountingSoftware: '以下のカテゴリーは、あなたの…からインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください。',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリを削除または無効にすることはできません',
                description: `このワークスペースではカテゴリが必須のため、少なくとも 1 つのカテゴリを有効のままにしておく必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: '成長に合わせて、以下のトグルを使用してより多くの機能を有効にしましょう。各機能は、さらなるカスタマイズのためにナビゲーションメニューに表示されます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームを拡大するための機能を有効にする',
            },
            manageSection: {
                title: '管理',
                subtitle: '予算内に支出を抑えられるようにする管理機能を追加しましょう。',
            },
            earnSection: {
                title: '獲得する',
                subtitle: '収益管理を効率化して、より早く入金を受け取りましょう。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '支出をグループ化・分析し、支払った税金をすべて記録しましょう。',
            },
            integrateSection: {
                title: '連携',
                subtitle: 'Expensify を人気のある金融プロダクトに接続します。',
            },
            distanceRates: {
                title: '距離レート',
                subtitle: 'レートを追加、更新し、適用します。',
            },
            perDiem: {
                title: '日当',
                subtitle: '出張日当を設定して、従業員の1日あたりの支出を管理します。',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '支出を把握し、管理しましょう。',
                disableCardTitle: 'Expensify Card を無効化',
                disableCardPrompt: 'Expensify Cardはすでに利用中のため、無効にすることはできません。今後の手順についてはConciergeにお問い合わせください。',
                disableCardButton: 'Concierge とチャット',
                feed: {
                    title: 'Expensify Card を取得',
                    subTitle: 'ビジネス経費を効率化し、Expensify の請求額を最大 50％ 削減しましょう。さらに：',
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
                subtitle: '既存の会社カードから経費をインポートする',
                feed: {
                    title: '会社カードをインポート',
                    features: {
                        support: '主要なすべてのカードプロバイダーに対応',
                        assignCards: 'カードをチーム全体に割り当てる',
                        automaticImport: '自動取引インポート',
                    },
                },
                bankConnectionError: '銀行連携の問題',
                connectWithPlaid: 'Plaid 経由で接続',
                connectWithExpensifyCard: 'Expensify Card をお試しください。',
                bankConnectionDescription: `もう一度カードの追加をお試しください。それでもだめな場合は、`,
                disableCardTitle: '会社カードを無効にする',
                disableCardPrompt: 'この機能は現在使用中のため、法人カードを無効にすることはできません。次の手順については Concierge にお問い合わせください。',
                disableCardButton: 'Concierge とチャット',
                cardDetails: 'カード情報',
                cardNumber: 'カード番号',
                cardholder: 'カード保有者',
                cardName: 'カード名',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `取引をエクスポートする${integration}アカウントを選択してください。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `取引をエクスポートする先の${integration}アカウントを選択してください。利用可能なアカウントを変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択してください。`,
                lastUpdated: '最終更新日時',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当て解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、ドラフトレポート上のすべての取引がカード保有者のアカウントから削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: 'カードフィードを他と区別できるように、一意の名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択してください。新しい取引にはこれらのルールが適用されます。',
                cardFeedRestrictDeletingTransaction: '取引の削除を制限',
                cardFeedAllowDeletingTransaction: '取引の削除を許可',
                removeCardFeed: 'カードフィードを削除',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName} フィードを削除`,
                removeCardFeedDescription: 'このカードフィードを本当に削除しますか？すべてのカードの割り当てが解除されます。',
                error: {
                    feedNameRequired: 'カードフィード名は必須です',
                    statementCloseDateRequired: 'ステートメントの締め日を選択してください。',
                },
                corporate: '取引の削除を制限',
                personal: '取引の削除を許可',
                setFeedNameDescription: '他のフィードと区別できるように、このカードフィードに一意の名前を付けてください',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できるようになります。新しい取引はこのルールに従います。',
                emptyAddedFeedTitle: '会社カードを割り当てる',
                emptyAddedFeedDescription: 'まずはカードをメンバーに割り当てて始めましょう。',
                pendingFeedTitle: `お客様のリクエストを確認しています…`,
                pendingFeedDescription: `現在、お客様の取引明細フィードの詳細を確認しています。完了次第、次の方法でご連絡いたします：`,
                pendingBankTitle: 'ブラウザウィンドウを確認してください',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `今開いたブラウザーウィンドウから${bankName}に接続してください。もしウィンドウが開かなかった場合は、`,
                pendingBankLink: 'ここをクリックしてください',
                giveItNameInstruction: 'ほかのカードと区別できる名前を付けてください。',
                updating: '更新中...',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `このワークスペースには複数のカードフィード（Expensify Cards を除く）が接続されているため、ダウングレードできません。続行するには、<a href="#">カードフィードを 1 つのみにしてください</a>。`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `${connection} にアカウントを追加して、接続をもう一度同期してください`,
                expensifyCardBannerTitle: 'Expensify Card を取得',
                expensifyCardBannerSubtitle:
                    'すべての米国内での購入でキャッシュバックを獲得し、Expensifyの請求額が最大50％オフ、無制限のバーチャルカードなど、さらに多くの特典をお楽しみください。',
                expensifyCardBannerLearnMoreButton: '詳しく見る',
                statementCloseDateTitle: '締め日',
                statementCloseDateDescription: 'カード明細の締め日をお知らせいただければ、Expensify 内に対応する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認および支払い方法を設定する',
                disableApprovalPrompt:
                    'このワークスペースの Expensify カードは現在、承認をもとにスマートリミットが設定されています。承認を無効にする前に、スマートリミットを使用しているすべての Expensify カードの上限タイプを変更してください。',
            },
            invoices: {
                title: '請求書',
                subtitle: '請求書の送受信。',
            },
            categories: {
                title: 'カテゴリ',
                subtitle: '支出を追跡して整理する。',
            },
            tags: {
                title: 'タグ',
                subtitle: 'コストを分類し、請求可能な経費を追跡します。',
            },
            taxes: {
                title: '税金',
                subtitle: '対象となる税金を記録し、還付を申請しましょう。',
            },
            reportFields: {
                title: 'レポート項目',
                subtitle: '支出用のカスタムフィールドを設定する',
            },
            connections: {
                title: '経理',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: '領収書パートナー',
                subtitle: '領収書を自動的に取り込む',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'そんなに急がないでください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計機能を無効にするには、ワークスペースから会計連携を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber の接続を解除',
                disconnectText: 'この機能を無効にするには、まず Uber for Business 連携を切断してください。',
                description: 'この連携を本当に切断してもよろしいですか？',
                confirmText: '了解',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'そんなに急がないでください…',
                featureEnabledText:
                    'このワークスペースの Expensify カードは、承認ワークフローによって Smart Limit を定義しています。\n\nワークフローを無効にする前に、Smart Limit が設定されているカードの限度額タイプを変更してください。',
                confirmText: 'Expensify カードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: '領収書の必須設定や高額支出のフラグ付けなどが行えます。',
            },
        },
        reports: {
            reportsCustomTitleExamples: '例：',
            customReportNamesSubtitle: `<muted-text><a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使って、レポートタイトルをカスタマイズできます。</muted-text>`,
            customNameTitle: 'デフォルトレポートタイトル',
            customNameDescription: `<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使って、経費レポートにカスタム名を付けましょう。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポート開始日：{report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名: {report:workspacename}',
            customNameReportIDExample: 'レポート ID：{report:id}',
            customNameTotalExample: '合計: {report:total}',
            preventMembersFromChangingCustomNamesTitle: 'メンバーによるカスタムレポートタイトルの変更を禁止する',
        },
        reportFields: {
            addField: 'フィールドを追加',
            delete: 'フィールドを削除',
            deleteFields: 'フィールドを削除',
            findReportField: 'レポートフィールドを検索',
            deleteConfirmation: 'このレポートフィールドを削除してもよろしいですか？',
            deleteFieldsConfirmation: 'これらのレポートフィールドを削除してもよろしいですか？',
            emptyReportFields: {
                title: 'レポート項目がまだ作成されていません',
                subtitle: 'レポートに表示されるカスタムフィールド（テキスト、日付、またはドロップダウン）を追加します。',
            },
            subtitle: 'レポートフィールドはすべての支出に適用され、追加情報の入力を促したい場合に役立ちます。',
            disableReportFields: 'レポート項目を無効にする',
            disableReportFieldsConfirmation: '本当に実行しますか？テキストフィールドと日付フィールドは削除され、リストは無効になります。',
            importedFromAccountingSoftware: '以下のレポートフィールドは、あなたの からインポートされています',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '数式',
            textAlternateText: '自由入力用のフィールドを追加します。',
            dateAlternateText: '日付選択用のカレンダーを追加します。',
            dropdownAlternateText: '選択できるオプションのリストを追加してください。',
            formulaAlternateText: '数式フィールドを追加',
            nameInputSubtitle: 'レポート項目の名前を選択してください。',
            typeInputSubtitle: '使用するレポートフィールドの種類を選択してください。',
            initialValueInputSubtitle: 'レポートフィールドに表示する開始値を入力してください。',
            listValuesInputSubtitle: 'これらの値は、レポートフィールドのドロップダウンに表示されます。有効化された値は、メンバーが選択できます。',
            listInputSubtitle: 'これらの値はレポートのフィールド一覧に表示されます。有効にされた値はメンバーが選択できます。',
            deleteValue: '値を削除',
            deleteValues: '値を削除',
            disableValue: '値を無効にする',
            disableValues: '値を無効化',
            enableValue: '有効値',
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
            listValues: '値を一覧表示',
            addValue: '値を追加',
            existingReportFieldNameError: 'この名前のレポートフィールドはすでに存在します',
            reportFieldNameRequiredError: 'レポートフィールド名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドの種類を選択してください',
            circularReferenceError: 'このフィールドを自分自身に参照することはできません。更新してください。',
            reportFieldInitialValueRequiredError: 'レポート項目の初期値を選択してください',
            genericFailureMessage: 'レポートフィールドの更新中にエラーが発生しました。もう一度お試しください。',
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
            subtitle: 'タグを使うと、経費をより詳細な方法で分類できます。',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>現在、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">従属タグ</a>を使用しています。タグを更新するには、<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>できます。</muted-text>`,
            emptyTags: {
                title: 'タグがまだ作成されていません',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'タグを追加して、プロジェクト、勤務地、部門などを追跡します。',
                subtitleHTML: `<muted-text><centered-text>スプレッドシートをインポートして、プロジェクト、所在地、部門などを追跡するタグを追加します。タグファイルの書式設定については、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">こちらをご覧ください</a>。</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>現在、タグは会計連携からインポートされています。変更を行うには、<a href="${accountingPageURL}">会計</a>ページに移動してください。</centered-text></muted-text>`,
            },
            deleteTag: 'タグを削除',
            deleteTags: 'タグを削除',
            deleteTagConfirmation: 'このタグを削除してもよろしいですか？',
            deleteTagsConfirmation: 'これらのタグを削除してもよろしいですか？',
            deleteFailureMessage: 'タグの削除中にエラーが発生しました。もう一度お試しください。',
            tagRequiredError: 'タグ名は必須です',
            existingTagError: 'この名前のタグはすでに存在します',
            invalidTagNameError: 'タグ名を0にすることはできません。別の値を選択してください。',
            genericFailureMessage: 'タグの更新中にエラーが発生しました。もう一度お試しください。',
            importedFromAccountingSoftware: '以下のタグは、あなたの からインポートされています',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            tagRules: 'タグルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費に、1種類のタグでも複数のタグでも付けて分類できます。',
            configureMultiLevelTags: 'マルチレベルタグ付けのために、使用するタグのリストを設定します。',
            importMultiLevelTagsSupportingText: `タグのプレビューはこちらです。問題なければ、下のボタンをクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は、各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列にGLコードがあります',
            },
            tagLevel: {
                singleLevel: '単一レベルのタグ',
                multiLevel: '多階層タグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替え',
                prompt1: 'タグレベルを切り替えると、現在のすべてのタグが消去されます。',
                prompt2: 'まずはじめに、次を行うことをおすすめします',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートすることで。',
                prompt5: '詳細はこちら',
                prompt6: 'タグレベルについて。',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当によろしいですか？',
                prompt2: '既存のタグは上書きされますが、次のことができます',
                prompt3: 'バックアップをダウンロード',
                prompt4: '最初',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `スプレッドシート内に *${columnCounts} 列* 見つかりました。タグ名が含まれている列の横で *Name* を選択してください。タグのステータスを設定する列の横で *Enabled* を選択することもできます。`,
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: `ワークスペースでタグが必須のため、少なくとも 1 つのタグを有効のままにする必要があります。`,
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグを任意にはできません',
                description: `ワークスペースの設定でタグが必須となっているため、少なくとも 1 つのタグは必須のままにする必要があります。`,
            },
            cannotMakeTagListRequired: {
                title: 'タグ一覧を必須にできません',
                description: 'ポリシーで複数のタグレベルが設定されている場合にのみ、タグリストを必須にできます。',
            },
            tagCount: () => ({
                one: '1日',
                other: (count: number) => `${count}件のタグ`,
            }),
        },
        taxes: {
            subtitle: '税名と税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペース通貨のデフォルト',
            foreignDefault: '外貨のデフォルト',
            customTaxName: 'カスタム税名',
            value: '値',
            taxReclaimableOn: '対象税額',
            taxRate: '税率',
            findTaxRate: '税率を検索',
            error: {
                taxRateAlreadyExists: 'この税名は既に使用されています',
                taxCodeAlreadyExists: 'この税コードはすでに使用されています',
                valuePercentageRange: '0 から 100 の間の有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名は必須です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Concierge にサポートを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateTaxClaimableFailureMessage: '回収可能な金額は、距離レート額より少なくなければなりません',
            },
            deleteTaxConfirmation: 'この税区分を削除してもよろしいですか？',
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
            importedFromAccountingSoftware: '以下の税金は、あなたの…からインポートされています',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください',
        },
        duplicateWorkspace: {
            title: '新しいワークスペースに名前を付ける',
            selectFeatures: 'コピーする機能を選択',
            whichFeatures: '新しいワークスペースにどの機能をコピーしますか？',
            confirmDuplicate: '続行しますか？',
            categories: 'カテゴリと自動カテゴリ設定ルール',
            reimbursementAccount: '精算口座',
            welcomeNote: '新しいワークスペースの使用を開始してください',
            delayedSubmission: '提出の遅延',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `元のワークスペースのメンバー ${totalMembers ?? 0} 人とともに、${newWorkspaceName ?? ''} を作成して共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースがありません',
            subtitle: '領収書の追跡、経費の精算、出張の管理、請求書の送信などができます。',
            createAWorkspaceCTA: 'はじめに',
            features: {
                trackAndCollect: '領収書の追跡と収集',
                reimbursements: '従業員に精算する',
                companyCards: '会社カードを管理',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは、複数の人と議論したり一緒に作業したりするのに最適な場所です。共同作業を始めるには、ワークスペースを作成するか参加してください',
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
            transferOwner: 'オーナーを譲渡',
            makeMember: 'メンバーにする',
            makeAdmin: '管理者にする',
            makeAuditor: '監査担当にする',
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーの追加中に問題が発生しました',
                cannotRemove: '自分自身またはワークスペースのオーナーは削除できません',
                genericRemove: 'そのワークスペースメンバーを削除する際に問題が発生しました',
            },
            addedWithPrimary: '一部のメンバーは、プライマリログインで追加されました。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `セカンダリログイン ${secondaryLogin} によって追加されました。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `ワークスペースメンバー合計：${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `このワークスペースから${approver}を削除すると、承認ワークフローではワークスペースのオーナーである${workspaceOwner}に差し替えられます。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} には承認待ちの経費レポートがあります。ワークスペースから削除する前に、承認するよう依頼するか、そのレポートを引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除することはできません。Workflows > Make or track paymentsで新しい精算担当者を設定してから、もう一度お試しください。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、優先エクスポーターはワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、技術担当者はワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} には、対応が必要な未処理のレポートがあります。ワークスペースから削除する前に、必要な対応を完了するよう依頼してください。`,
        },
        card: {
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            issueCard: 'カードを発行',
            issueNewCard: {
                whoNeedsCard: '誰がカードを必要としていますか？',
                inviteNewMember: '新しいメンバーを招待',
                findMember: 'メンバーを検索',
                chooseCardType: 'カードタイプを選択',
                physicalCard: '物理カード',
                physicalCardDescription: '頻繁に支出する人に最適',
                virtualCard: 'バーチャルカード',
                virtualCardDescription: '即時かつ柔軟',
                chooseLimitType: '制限タイプを選択',
                smartLimit: 'スマートリミット',
                smartLimitDescription: '承認が必要になる前に、一定額までの支出を許可',
                monthly: '毎月',
                monthlyDescription: '毎月一定額まで使用する',
                fixedAmount: '固定金額',
                fixedAmountDescription: '1 回限りで一定額まで支出',
                setLimit: '上限を設定',
                cardLimitError: '$21,474,836 未満の金額を入力してください',
                giveItName: '名前を付けてください',
                giveItNameInstruction: '他のカードと見分けがつくように、十分ユニークな名前を付けてください。具体的な利用シーンが含まれているとなお良いです！',
                cardName: 'カード名',
                letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
                willBeReady: 'このカードはすぐにご利用いただけます。',
                cardholder: 'カード保有者',
                cardType: 'カード種別',
                limit: '制限',
                limitType: '制限タイプ',
                name: '名前',
                disabledApprovalForSmartLimitError: 'スマートリミットを設定する前に、<strong>ワークフロー > 承認を追加</strong> で承認を有効にしてください',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化',
                deactivateConfirmation: 'このカードを無効にすると、今後のすべての取引が承認されなくなり、この操作は元に戻せません。',
            },
        },
        accounting: {
            settings: '設定',
            title: '接続',
            subtitle: '会計システムに接続して勘定科目表で取引にコードを付け、自動で支払いを照合し、財務情報を常に同期させましょう。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'セットアップ担当者とチャットする',
            talkYourAccountManager: 'アカウントマネージャーとチャットする',
            talkToConcierge: 'Conciergeとチャットする',
            needAnotherAccounting: '他の会計ソフトが必要ですか？',
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
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `最終同期日時: ${relativeDate}`,
            notSync: '未同期',
            import: 'インポート',
            export: 'エクスポート',
            advanced: '詳細',
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
            notImported: 'インポートされていません',
            importAsCategory: 'カテゴリとしてインポート済み',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'タグとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'レポートフィールドとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 従業員デフォルト',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この連携';
                return `${integrationName} の接続を本当に解除しますか？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計連携'} に接続してもよろしいですか？既存の会計連携はすべて削除されます。`,
            enterCredentials: '認証情報を入力してください',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '顧客のインポート';
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
                            return 'インポートしたデータを処理しています';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '払い済みレポートと請求支払いの同期';
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
                            return 'タイトルをインポート中';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '承認証明書をインポート中';
                        case 'quickbooksDesktopImportDimensions':
                            return 'ディメンションをインポート中';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '保存ポリシーをインポート中';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'QuickBooksとデータを同期中です… Web Connector が実行されていることを確認してください';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online データを同期中';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'データを読み込んでいます';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'カテゴリーを更新中';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '顧客／プロジェクトを更新中';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'メンバー一覧を更新しています';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポートフィールドを更新中';
                        case 'jobDone':
                            return 'インポートしたデータの読み込みを待機しています';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期しています';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期中';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensifyレポートを精算済みとしてマークする';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero の請求書とインボイスを支払済みにする';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期中';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座を同期しています';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期しています';
                        case 'xeroCheckConnection':
                            return 'Xero 接続を確認しています';
                        case 'xeroSyncTitle':
                            return 'Xero データを同期中';
                        case 'netSuiteSyncConnection':
                            return 'NetSuite への接続を初期化中';
                        case 'netSuiteSyncCustomers':
                            return '顧客のインポート';
                        case 'netSuiteSyncInitData':
                            return 'NetSuite からデータを取得しています';
                        case 'netSuiteSyncImportTaxes':
                            return '税金のインポート';
                        case 'netSuiteSyncImportItems':
                            return '項目をインポート中';
                        case 'netSuiteSyncData':
                            return 'Expensify へのデータのインポート';
                        case 'netSuiteSyncAccounts':
                            return 'アカウントを同期中';
                        case 'netSuiteSyncCurrencies':
                            return '通貨を同期中';
                        case 'netSuiteSyncCategories':
                            return 'カテゴリを同期中';
                        case 'netSuiteSyncReportFields':
                            return 'Expensify レポートフィールドとしてデータをインポート';
                        case 'netSuiteSyncTags':
                            return 'Expensifyタグとしてデータをインポート中';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新しています';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensifyレポートを精算済みとしてマークする';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite の請求書およびインボイスを支払済みにマークする';
                        case 'netSuiteImportVendorsTitle':
                            return 'ベンダーのインポート';
                        case 'netSuiteImportCustomListsTitle':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportCustomLists':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '子会社のインポート';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'ベンダーのインポート';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct 接続を確認しています';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct ディメンションのインポート';
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
                '優先エクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート用アカウントを設定している場合は、そのユーザーがドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先送信先の担当者は、自分のアカウントでエクスポート対象のレポートを確認できるようになります。',
            exportAs: 'エクスポート形式',
            exportOutOfPocket: '実費経費をエクスポート形式：',
            exportCompanyCard: 'としてエクスポート',
            exportDate: 'エクスポート日',
            defaultVendor: '既定のベンダー',
            autoSync: '自動同期',
            autoSyncDescription: 'NetSuite と Expensify を毎日自動で同期します。確定したレポートをリアルタイムでエクスポートします',
            reimbursedReports: '精算済みレポートを同期',
            cardReconciliation: 'カード照合',
            reconciliationAccount: '調整勘定',
            continuousReconciliation: '継続的な照合',
            saveHoursOnReconciliation: '各会計期間ごとの照合作業を、Expensify が Expensify Card の明細および清算を継続的に自動照合することで、数時間分節約できます。',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>継続的な照合作業を有効にするには、${connectionName} の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card の支払いを照合する対象となる銀行口座を選択してください。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `この口座が、継続的な照合作業が正しく行われるように、<a href="${settlementAccountUrl}">Expensify Cardの清算口座</a>（末尾が${lastFourPAN}）と一致していることを確認してください。`,
            },
        },
        export: {
            notReadyHeading: 'エクスポートの準備ができていません',
            notReadyDescription: 'ドラフトまたは承認待ちの経費精算書は会計システムへエクスポートできません。エクスポートする前に、これらの経費を承認するか支払ってください。',
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
                chooseInvoiceMethod: '下記から支払い方法を選択してください：',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書残高',
            invoiceBalanceSubtitle: 'これは、請求書の支払いを回収して得た現在の残高です。銀行口座を追加していれば、自動的にその口座へ振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いや受け取りを行うために、銀行口座を追加してください。',
        },
        invite: {
            member: 'メンバーを招待',
            members: 'メンバーを招待',
            invitePeople: '新しいメンバーを招待',
            genericFailureMessage: 'ワークスペースにメンバーを招待する際にエラーが発生しました。もう一度お試しください。',
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
            inviteMessagePrompt: '下のメッセージを追加して、招待をさらに特別なものにしましょう！',
            personalMessagePrompt: 'メッセージ',
            genericFailureMessage: 'ワークスペースにメンバーを招待する際にエラーが発生しました。もう一度お試しください。',
            inviteNoMembersError: '招待するメンバーを少なくとも1人選択してください',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} が ${workspaceName} への参加をリクエストしました`,
        },
        distanceRates: {
            oopsNotSoFast: 'おっと！まだ早いですよ…',
            workspaceNeeds: 'ワークスペースには、少なくとも 1 つの有効な距離レートが必要です。',
            distance: '距離',
            centrallyManage: 'レートを一元管理し、マイルまたはキロメートルで追跡し、デフォルトカテゴリを設定します。',
            rate: 'レート',
            addRate: 'レートを追加',
            findRate: '料金を検索',
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
                '<muted-text>この機能を使用するには、ワークスペースで税金を有効にする必要があります。変更するには、<a href="#">その他の機能</a>に移動してください。</muted-text>',
            deleteDistanceRate: '距離レートを削除',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらの料金を削除してもよろしいですか？',
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
            nameInputHelpText: 'これは、ワークスペース上に表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付ける必要があります',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペースのすべての経費は、この通貨に変換されます。',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) => `このワークスペースは${currency}の銀行口座にリンクされているため、デフォルト通貨は変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travel を有効にするには、ワークスペース住所が必要です。お客様のビジネスに関連する住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続行',
            youAreAlmostDone: '企業カードの発行、経費の精算、請求書の回収、支払いができる銀行口座の設定は、ほぼ完了しています。',
            streamlinePayments: '支払いを効率化',
            connectBankAccountNote: '注：ワークスペースでの支払いには、個人の銀行口座は使用できません。',
            oneMoreThing: 'もう一つだけ！',
            allSet: 'これで準備完了です！',
            accountDescriptionWithCards: 'この銀行口座は、コーポレートカードの発行、経費の払い戻し、請求書の回収、および支払いに使用されます。',
            letsFinishInChat: 'チャットで完了しましょう！',
            finishInChat: 'チャットで完了',
            almostDone: 'ほぼ完了です！',
            disconnectBankAccount: '銀行口座の連携を解除',
            startOver: '最初からやり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、銀行口座との連携を解除します',
            yesStartOver: 'はい、最初からやり直す',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `<strong>${bankName}</strong> の銀行口座を連携解除します。この口座に対する未処理の取引は、引き続き処理されます。`,
            clearProgress: '最初からやり直すと、これまでの進捗がすべて消去されます。',
            areYouSure: '本当によろしいですか？',
            workspaceCurrency: 'ワークスペース通貨',
            updateCurrencyPrompt: '現在、お使いのワークスペースはUSDとは異なる通貨に設定されているようです。下のボタンをクリックして、通貨を今すぐUSDに更新してください。',
            updateToUSD: 'USD に更新',
            updateWorkspaceCurrency: 'ワークスペースの通貨を更新',
            workspaceCurrencyNotSupported: 'ワークスペースの通貨はサポートされていません',
            yourWorkspace: `ワークスペースで未対応の通貨が設定されています。<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">対応している通貨の一覧</a>をご覧ください。`,
            chooseAnExisting: '既存の銀行口座を選んで経費を支払うか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: 'オーナーを譲渡',
            addPaymentCardTitle: '所有権を移転するには支払いカードを入力してください',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>カードを追加するには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>をお読みいただき、同意してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長なインフラストラクチャ',
            addPaymentCardLearnMore: `<muted-text>当社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>について詳しく見る。</muted-text>`,
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: '- 英語\n- スペイン語\n- ドイツ語\n- フランス語\n- イタリア語\n- 日本語\n- オランダ語\n- ポーランド語\n- ポルトガル語 (BR)\n- 中国語 (簡体字)',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\n残高を精算して、このワークスペースの課金を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を振替',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `このワークスペースの所有アカウント（${email}）には、前月からの未払い残高があります。

このワークスペースの請求を引き継ぐために、この金額（${amount}）を振り替えますか？お支払いカードには直ちに請求が行われます。`,
            subscriptionTitle: '年間サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `このワークスペースを引き継ぐと、このワークスペースの年額サブスクリプションが現在のサブスクリプションに統合されます。これにより、サブスクリプションの人数が${usersCount}人追加され、新しいサブスクリプションの人数は${finalCount}人になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複したサブスクリプションの警告',
            duplicateSubscriptionButtonText: 'English\nスペイン語\nドイツ語\nフランス語\nイタリア語\n日本語\nオランダ語\nポーランド語\nポルトガル語（ブラジル）\n中国語（簡体）',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `${email} さんのワークスペースの請求を引き継ごうとしているようですが、そのためには、まずその方のすべてのワークスペースで管理者である必要があります。

ワークスペース ${workspaceName} の請求だけを引き継ぎたい場合は、「Continue」をクリックしてください。

サブスクリプション全体の請求を引き継ぎたい場合は、請求を引き継ぐ前に、すべてのワークスペースであなたを管理者として追加してもらってください。`,
            hasFailedSettlementsTitle: 'オーナー権限を移譲できません',
            hasFailedSettlementsButtonText: '了解',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `${email} に未払いの Expensify Card 清算があるため、請求の引き継ぎはできません。問題を解決するために、concierge@expensify.com まで連絡するよう依頼してください。その後、このワークスペースの請求を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高の消去に失敗しました',
            failedToClearBalanceButtonText: '- 英語\n- スペイン語\n- ドイツ語\n- フランス語\n- イタリア語\n- 日本語\n- オランダ語\n- ポーランド語\n- ポルトガル語 (BR)\n- 中国語 (簡体字)',
            failedToClearBalanceText: '残高をクリアできませんでした。後でもう一度お試しください。',
            successTitle: 'やった！これで完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！まだ早いですよ…',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権の譲渡中に問題が発生しました。もう一度お試しいただくか、サポートが必要な場合は<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `次のレポートはすでに ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポートされています。

${reportName}

もう一度エクスポートしてもよろしいですか？`,
            confirmText: 'はい、再度エクスポートします',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポート項目',
                description: `レポートフィールドを使用すると、個々の明細項目の経費に関連するタグとは異なる、ヘッダー レベルの詳細を指定できます。これらの詳細には、特定のプロジェクト名、出張情報、場所などを含めることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用可能です</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify と NetSuite の連携により、自動同期を活用して手入力を削減できます。プロジェクトや顧客のマッピングを含むネイティブおよびカスタムセグメントのサポートにより、詳細でリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>NetSuite との連携機能は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からとなります</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify と Sage Intacct のインテグレーションで、自動同期を活用して手動入力を削減しましょう。ユーザー定義ディメンションに加え、部門、クラス、ロケーション、顧客、プロジェクト（ジョブ）ごとの経費コードにより、詳細かつリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>当社の Sage Intacct 連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify と QuickBooks Desktop の連携で、自動同期を活用し、手入力を削減しましょう。リアルタイムの双方向接続と、クラス・品目・顧客・プロジェクトごとの経費コード設定により、究極の効率性を実現できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktop 連携機能は、Control プラン（<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} から）でのみご利用いただけます</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `承認の段階をさらに増やしたい場合や、高額な経費を必ず別の担当者にも確認させたい場合でも、ご安心ください。高度な承認機能を使えば、あらゆるレベルで適切なチェック体制を整え、チームの支出をしっかり管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からご利用いただけるControlプランでのみ使用できます</muted-text>`,
            },
            categories: {
                title: 'カテゴリ',
                description: 'カテゴリを使用すると、支出を追跡して整理できます。既定のカテゴリを使用するか、ご自身で追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリは Collect プランで利用できます。料金は<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からです</muted-text>`,
            },
            glCodes: {
                title: 'GLコード',
                description: `経理・給与システムへ経費を簡単にエクスポートできるよう、カテゴリやタグにGLコードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードはControlプランでのみご利用いただけます（<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}から）</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL と給与コード',
                description: `勘定科目に総勘定元帳（GL）コードと給与コードを追加して、経費を会計システムや給与システムへ簡単にエクスポートできるようにしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL &amp; 給与コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用可能です</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `会計システムや給与システムへ経費を簡単にエクスポートできるよう、税金に税コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用できます</muted-text>`,
            },
            companyCards: {
                title: '無制限の会社カード',
                description: `カードフィードをさらに追加する必要がありますか？主要なカード発行会社のすべてから取引を同期できる、無制限の法人カードを有効にしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これは Control プランでのみ利用可能です。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで動作し、細かいことを気にしなくても支出を適切に管理できるようにします。

領収書や説明などの経費詳細を必須にしたり、上限やデフォルトを設定したり、承認と支払いを自動化したりと、すべてを 1 か所で行えます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '出張時の従業員の毎日の費用を、規程どおりかつ予測しやすく管理するには、日当が最適です。カスタムレート、デフォルトカテゴリ、行き先やサブラートといったより詳細な設定などの機能を利用できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>出張日当は、Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
            },
            travel: {
                title: '旅行',
                description: 'Expensify Travel は、メンバーが宿泊先、航空券、交通手段などを予約できる、新しい法人向け出張予約・管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel は Collect プランでご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使用すると、経費をまとめて、より簡単に追跡および整理できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは Collect プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用可能です</muted-text>`,
            },
            multiLevelTags: {
                title: '多階層タグ',
                description:
                    'マルチレベルタグを使用すると、経費をより正確に管理できます。部門、クライアント、コストセンターなど、各明細項目に複数のタグを割り当てることで、すべての経費の背景情報を詳細に記録できます。これにより、よりきめ細かなレポート、承認ワークフロー、および会計データのエクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただける Control プランでのみ利用可能です</muted-text>`,
            },
            distanceRates: {
                title: '距離レート',
                description: '自分専用のレートを作成・管理し、マイルまたはキロメートルで距離を記録し、距離経費のデフォルトカテゴリーを設定できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離料金は Collect プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用可能です</muted-text>`,
            },
            auditor: {
                title: '監査人',
                description: '監査担当者は、全てのレポートを閲覧専用で確認でき、完全な可視性とコンプライアンスの監視を行えます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>監査担当者は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用できます</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数承認レベルは、精算前にレポートを複数人で承認する必要がある企業向けのワークフローツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、Control プランでのみ利用可能です。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり月額',
                perMember: 'メンバー1人あたり月額',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>この機能にアクセスするにはアップグレードするか、プランと料金の詳細は<a href="${subscriptionLink}">こちら</a>をご覧ください。</muted-text>`,
            upgradeToUnlock: 'この機能をアンロックする',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>${policyName} を Control プランにアップグレードしました！ 詳細については、<a href="${subscriptionLink}">サブスクリプションを表示</a>してください。</centered-text>`,
                categorizeMessage: `Collect プランへのアップグレードが完了しました。これで経費をカテゴリ分けできるようになりました！`,
                travelMessage: `Collectプランへのアップグレードが完了しました。これで、出張の予約と管理を開始できます！`,
                distanceRateMessage: `Collectプランへのアップグレードが完了しました。これで距離単価を変更できるようになりました！`,
                gotIt: '了解しました、ありがとうございます',
                createdWorkspace: `ワークスペースを作成しました！`,
            },
            commonFeatures: {
                title: 'Control プランにアップグレード',
                note: '以下を含む、最も強力な機能をアンロックしましょう：',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control プランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。プランと料金の詳細は <a href="${learnMoreMethodsRoute}">こちら</a> をご覧ください。</muted-text>`,
                    benefit1: '高度な会計連携（NetSuite、Sage Intacct など）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランの種類を次のものに変更してください',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collectプランにダウングレード',
                note: 'ダウングレードすると、次の機能などへのアクセスができなくなります。',
                benefits: {
                    note: '当社のプランを完全に比較するには、こちらをご覧ください',
                    pricingPage: '料金ページ',
                    confirm: '構成を削除してダウングレードします。よろしいですか？',
                    warning: 'これは元に戻せません。',
                    benefit1: '会計連携（QuickBooks Online と Xero を除く）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    headsUp: '注意！',
                    multiWorkspaceNote: 'Collect レートでのサブスクリプションを開始するには、最初の月額支払いの前に、すべてのワークスペースをダウングレードする必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択 > プランタイプを次に変更',
                },
            },
            completed: {
                headline: 'ワークスペースがダウングレードされました',
                description: 'Controlプランのほかのワークスペースがあります。Collectレートで課金されるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '了解しました、ありがとうございます',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: '最終支払い',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `このサブスクリプションの最終請求額は <strong>${formattedAmount}</strong> です`,
            description2: ({date}: DateParams) => `${date} の内訳をご確認ください:`,
            subscription:
                '注意！この操作を行うと、Expensify のサブスクリプションが終了し、このワークスペースが削除され、すべてのワークスペースメンバーが削除されます。  \nこのワークスペースを残したまま自分だけを削除したい場合は、先に別の管理者に請求管理を引き継いでもらってください。',
            genericFailureMessage: '請求書のお支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `現在、${workspaceName}ワークスペースでの操作は制限されています`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `ワークスペースのオーナーである ${workspaceOwnerName} が、新しいワークスペースのアクティビティを有効にするために、登録されている支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを有効にするには、ファイル上の支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: 'ロック解除するには支払いカードを追加してください！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き利用するには支払いカードを追加してください',
            pleaseReachOutToYourWorkspaceAdmin: 'ご不明な点がありましたら、ワークスペース管理者までお問い合わせください。',
            chatWithYourAdmin: '管理者とチャット',
            chatInAdmins: '#admins でチャット',
            addPaymentCard: '支払いカードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>個々の経費に対する支出コントロールとデフォルトを設定します。<a href="${categoriesPageLink}">カテゴリ</a>や<a href="${tagsPageLink}">タグ</a>のルールを作成することもできます。</muted-text>`,
                receiptRequiredAmount: '領収書が必要な金額',
                receiptRequiredAmountDescription: '金額がこの額を超える場合、カテゴリーのルールで上書きされない限り、領収書を必須にします。',
                maxExpenseAmount: '最大経費額',
                maxExpenseAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出にフラグを付けます。',
                maxAge: '最長年齢',
                maxExpenseAge: '経費の最大経過日数',
                maxExpenseAgeDescription: '特定の日数より前の支出にフラグを付ける',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count}日`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費をどのように作成するかを選択してください。会社カード取引としてインポートされていない経費は、現金経費とみなされます。これには、手動で作成された経費、領収書、日当、距離、および時間に基づく経費が含まれます。',
                reimbursableDefault: '精算対象',
                reimbursableDefaultDescription: '経費は、ほとんどの場合、従業員に返金されます',
                nonReimbursableDefault: '個人立替対象外',
                nonReimbursableDefaultDescription: '経費は時折、従業員に払い戻されます',
                alwaysReimbursable: '常に精算対象',
                alwaysReimbursableDescription: '経費は常に従業員へ払い戻されます',
                alwaysNonReimbursable: '常に個人立替精算なし',
                alwaysNonReimbursableDescription: '経費は従業員に一切精算されません',
                billableDefault: '請求可能のデフォルト',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>現金およびクレジットカードの経費を、デフォルトで請求可能にするかどうかを選択してください。請求可能な経費は、<a href="${tagsPageLink}">タグ</a>で有効または無効にできます。</muted-text>`,
                billable: '請求可能',
                billableDescription: '経費は多くの場合、クライアントに再請求されます',
                nonBillable: '請求対象外',
                nonBillableDescription: '経費がクライアントに再請求されることがあります',
                eReceipts: '電子レシート',
                eReceiptsHint: `eReceipts は、[ほとんどの米ドル建てクレジット取引に対して自動作成されます](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費について、1人あたりのコストを記録します。',
                prohibitedDefaultDescription:
                    'アルコール、ギャンブル、その他の制限対象品目が含まれる領収書にフラグを付けます。これらの明細項目が含まれる領収書の経費は手動での確認が必要になります。',
                prohibitedExpenses: '禁止されている経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル諸費用',
                gambling: 'ギャンブル',
                tobacco: 'タバコ',
                adultEntertainment: 'アダルトエンターテインメント',
            },
            expenseReportRules: {
                title: '経費精算書',
                subtitle: '経費精算レポートのコンプライアンス、承認、および支払いを自動化。',
                preventSelfApprovalsTitle: '自己承認を防止',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分自身の経費レポートを承認できないようにします。',
                autoApproveCompliantReportsTitle: '準拠しているレポートを自動承認',
                autoApproveCompliantReportsSubtitle: '自動承認の対象となる経費レポートを設定します。',
                autoApproveReportsUnderTitle: '以下の条件未満のレポートを自動承認',
                autoApproveReportsUnderDescription: 'この金額以下で完全準拠している経費精算書は、自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートについては、自動承認の対象であっても手動承認を必須にする。',
                autoPayApprovedReportsTitle: '自動支払が承認されたレポート',
                autoPayApprovedReportsSubtitle: '自動支払いの対象となる経費レポートを設定します。',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `${currency ?? ''}20,000 未満の金額を入力してください`,
                autoPayApprovedReportsLockedSubtitle: '[その他の機能] に移動して [ワークフロー] を有効にし、その後 [支払い] を追加してこの機能をアンロックしてください。',
                autoPayReportsUnderTitle: '次の金額未満のレポートを自動支払い',
                autoPayReportsUnderDescription: 'この金額以下で完全準拠している経費精算書は、自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動してワークフローを有効にし、この機能を有効化するには${featureName}を追加してください。`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動し、${featureName}を有効にしてこの機能を利用できるようにしてください。`,
            },
            categoryRules: {
                title: 'カテゴリルール',
                approver: '承認者',
                requireDescription: '説明を必須にする',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `従業員に「${categoryName}」での支出について追加情報を入力するよう促します。このヒントは経費の説明欄に表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロのコツ：短ければ短いほど良いです！',
                maxAmount: '最大金額',
                flagAmountsOver: '金額が～を超えた場合にフラグを立てる',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `カテゴリ「${categoryName}」に適用されます。`,
                flagAmountsOverSubtitle: 'これは、すべての経費に対する最大金額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリごとに経費金額にフラグを付けます。このルールは、経費金額の上限に関するワークスペース全体の一般ルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費レポートごとにカテゴリ別合計支出にフラグを付ける。',
                },
                requireReceiptsOver: '領収書の提出を必須にする',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} 既定`,
                    never: 'レシートを常に不要にする',
                    always: '常にレシートを必須にする',
                },
                defaultTaxRate: 'デフォルト税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `[その他の機能](${moreFeaturesLink}) に移動してワークフローを有効にし、その後、承認を追加してこの機能を有効化してください。`,
            },
            customRules: {
                title: '経費ポリシー',
                cardSubtitle: 'ここにチームの経費ポリシーが保存されます。これにより、何が対象かについて全員が同じ認識を持つことができます。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '回収',
                    description: 'プロセスの自動化を求めるチーム向け。',
                },
                corporate: {
                    label: '管理',
                    description: '高度な要件を持つ組織向け。',
                },
            },
            description: 'あなたに最適なプランをお選びください。機能と料金の詳細な一覧については、こちらをご覧ください',
            subscriptionLink: 'プランの種類と料金に関するヘルプページ',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `あなたは、年額サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランのアクティブメンバー1名分にコミットしています。${annualSubscriptionEndDate}以降は、自動更新をオフにすることで、従量課金制サブスクリプションに切り替え、Collectプランへダウングレードできます。`,
                other: `あなたは年間サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランで${count}人のアクティブメンバーを利用することにコミットしています。${annualSubscriptionEndDate}以降は、自動更新を無効にすることで、従量課金サブスクリプションに切り替え、Collectプランへダウングレードできます`,
            }),
            subscriptions: 'サブスクリプション',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: 'あなたの偉業への道を切り開くお手伝いをします！',
        description: '以下のサポートオプションから選択してください：',
        chatWithConcierge: 'Concierge とチャット',
        scheduleSetupCall: 'セットアップ通話を予約する',
        scheduleACall: '通話を予約',
        questionMarkButtonTooltip: '当社チームにサポートを依頼する',
        exploreHelpDocs: 'ヘルプドキュメントを表示',
        registerForWebinar: 'ウェビナーに登録',
        onboardingHelp: 'オンボーディングのヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更',
        headers: {
            frequentlyUsed: 'よく使う',
            smileysAndEmotion: 'スマイリー＆感情',
            peopleAndBody: '人とからだ',
            animalsAndNature: '動物 & 自然',
            foodAndDrink: '飲食',
            travelAndPlaces: '旅行と場所',
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
        visibility: '表示',
        restrictedDescription: 'ワークスペース内のメンバーはこのルームを見つけることができます',
        privateDescription: 'このルームに招待された人は、このルームを見つけることができます',
        publicDescription: '誰でもこのルームを見つけることができます',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '誰でもこのルームを見つけることができます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前のルームはすでに存在します',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} は、すべてのワークスペースで使われるデフォルトのルーム名です。別の名前を選択してください。`,
        roomNameInvalidError: 'ルーム名には半角小文字の英字、数字、ハイフンのみ使用できます',
        pleaseEnterRoomName: 'ルーム名を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}が「${newName}」に名前を変更しました（以前は「${oldName}」）` : `${actor}がこのルーム名を「${newName}」（以前は「${oldName}」）に変更しました`;
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
            public_announce: '公開アナウンス',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '送信して閉じる',
        submitAndApprove: '提出して承認',
        advanced: '詳細',
        dynamicExternal: '動的（外部）',
        smartReport: 'スマートレポート',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) => `${field}「${name}」の承認者として${approverName}（${approverEmail}）を追加しました`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${field}「${name}」の承認者として${approverName}（${approverEmail}）を削除しました`,
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
            return `「${categoryName}」カテゴリの給与コードを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `GLコード「${newValue}」をカテゴリ「${categoryName}」に追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」から GL コード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリのGLコードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `「${categoryName}」カテゴリの説明を${!oldValue ? '必須' : '必須ではありません'}（以前は${!oldValue ? '必須ではありません' : '必須'}）に変更しました`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に上限額 ${newAmount} を追加しました`;
            }
            if (oldAmount && !newAmount) {
                return `カテゴリ「${categoryName}」から最大金額 ${oldAmount} を削除しました`;
            }
            return `「${categoryName}」カテゴリの上限金額を${newAmount}に変更しました（以前は${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に上限タイプ ${newValue} を追加しました`;
            }
            return `「${categoryName}」カテゴリの上限タイプを${newValue}に変更しました（以前は${oldValue}）。`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」の領収書を${newValue}に変更して更新しました`;
            }
            return `「${categoryName}」カテゴリーを${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `カテゴリ名を「${oldName}」から「${newName}」に変更しました`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明ヒント「${oldValue}」を削除しました`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明のヒント「${newValue}」を追加しました`
                : `「${categoryName}」カテゴリの説明のヒントを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `タグリスト名を「${newName}」（以前は「${oldName}」）に変更しました`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `タグリスト「${tagListName}」のタグ「${oldName}」を「${newName}」に変更して更新しました`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」から削除しました`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」から「${count}」タグを削除しました`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `リスト「${tagListName}」のタグ「${tagName}」を更新し、${updatedField} を「${oldValue}」から「${newValue}」に変更しました`;
            }
            return `リスト「${tagListName}」のタグ「${tagName}」を更新し、${updatedField} に「${newValue}」を追加しました`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `${customUnitName} の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `距離料金での${newValue ? '有効' : '無効'}税金追跡`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `新しい「${customUnitName}」レート「${rateName}」を追加しました`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `${customUnitName}の${updatedField}「${customUnitRateName}」のレートを「${oldValue}」から「${newValue}」に変更しました`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `距離単価「${customUnitRateName}」の税率を「${oldValue} (${oldTaxPercentage})」から「${newValue} (${newTaxPercentage})」に変更しました`;
            }
            return `距離レート「${customUnitRateName}」に税率「${newValue}（${newTaxPercentage}）」を追加しました`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `距離レート「${customUnitRateName}」の還付可能税額部分を「${newValue}」（以前は「${oldValue}」）に変更しました`;
            }
            return `「${newValue}」の税金還付可能な部分を距離レート「${customUnitRateName}」に追加しました`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `「${customUnitName}」レート「${rateName}」を削除しました`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} レポートフィールド「${fieldName}」を追加しました`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `レポートフィールド「${fieldName}」のデフォルト値を「${defaultValue}」に設定する`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」にオプション「${optionName}」を追加しました`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のオプション「${optionName}」`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のすべてのオプション`;
            }
            return `${allEnabled ? '有効' : '無効'}レポートフィールド「${fieldName}」のオプション「${optionName}」を選択し、すべてのオプションを${allEnabled ? '有効' : '無効'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} レポートフィールド「${fieldName}」を削除しました`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `「自分での承認を禁止」を「${newValue === 'true' ? '有効' : '無効'}」（以前は「${oldValue === 'true' ? '有効' : '無効'}」）に更新しました`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大領収書必須経費金額を${newValue}に変更しました（以前は${oldValue}）`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `違反の対象となる経費の上限額を${newValue}に変更しました（以前は${oldValue}）`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `「最大経費の経過日数（日）」を「${newValue}」（以前は「${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}」）に更新しました`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定`;
            }
            return `月次レポートの提出日を「${newValue}」（以前は「${oldValue}」）に更新しました`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `「Re-bill expenses to clients」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「現金経費のデフォルト」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `「デフォルトのレポートタイトルを強制適用」をオンにしました ${value ? 'オン' : 'オフ'}`,
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
                one: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。これまでに提出されたレポートは、引き続き受信トレイで承認可能な状態で表示されます。`,
                other: `${joinedNames} さんの承認ワークフローおよび経費チャットからあなたを削除しました。これまでに提出されたレポートは、引き続きあなたの受信トレイで承認可能です。`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `${policyName} におけるあなたのロールが ${oldRole} からユーザーに更新されました。あなたは自分自身の経費チャットを除くすべての申請者の経費チャットから削除されました。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `デフォルト通貨を${newCurrency}（以前は${oldCurrency}）に更新しました`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `自動レポート頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを「${newValue}」に更新しました（以前は「${oldValue}」でした）`,
        upgradedWorkspace: 'このワークスペースを Control プランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳しくは<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をクリックしてください。`,
        downgradedWorkspace: 'このワークスペースを Collect プランにダウングレードしました',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `手動承認にランダムに回されるレポートの割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `すべての経費の手動承認限度額を${newLimit}に変更しました（以前は${oldLimit}）`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? '有効' : '無効'} 件のカテゴリ`;
                case 'tags':
                    return `${enabled ? '有効' : '無効'} 個のタグ`;
                case 'workflows':
                    return `${enabled ? '有効' : '無効'} ワークフロー`;
                case 'distance rates':
                    return `${enabled ? '有効' : '無効'} 距離レート`;
                case 'accounting':
                    return `${enabled ? '有効' : '無効'} 会計`;
                case 'Expensify Cards':
                    return `${enabled ? '有効' : '無効'} Expensifyカード`;
                case 'company cards':
                    return `${enabled ? '有効' : '無効'} 社用カード`;
                case 'invoicing':
                    return `${enabled ? '有効' : '無効'} 請求書作成`;
                case 'per diem':
                    return `日当 ${enabled ? '有効' : '無効'}`;
                case 'receipt partners':
                    return `${enabled ? '有効' : '無効'} 領収書パートナー`;
                case 'rules':
                    return `${enabled ? '有効' : '無効'}件のルール`;
                case 'tax tracking':
                    return `${enabled ? '有効' : '無効'} 税金追跡`;
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
                    return `税金名を「${oldValue}」から「${newValue}」に変更しました`;
                }
                case 'code': {
                    return `税コード「${taxName}」を「${oldValue}」から「${newValue}」に変更しました`;
                }
                case 'rate': {
                    return `「${taxName}」の税率を「${oldValue}」から「${newValue}」に変更しました`;
                }
                case 'enabled': {
                    return `${oldValue ? '無効' : '有効'} 税「${taxName}」`;
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
        notAuthorized: `このページへアクセスする権限がありません。このルームに参加しようとしている場合は、ルームメンバーに追加してもらうよう依頼してください。ほかにお困りですか？${CONST.EMAIL.CONCIERGE} までお問い合わせください。`,
        roomArchived: `このルームはアーカイブされたようです。ご不明な点があれば、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `${memberName} をルームから削除してもよろしいですか？`,
            other: '選択したメンバーをこのルームから削除してもよろしいですか？',
        }),
        error: {
            genericAdd: 'このルームメンバーの追加中に問題が発生しました',
        },
    },
    newTaskPage: {
        assignTask: 'タスクを割り当て',
        assignMe: '自分に割り当てる',
        confirmTask: 'タスクを確認',
        confirmError: 'タイトルを入力し、共有先を選択してください',
        descriptionOptional: '説明（任意）',
        pleaseEnterTaskName: 'タイトルを入力してください',
        pleaseEnterTaskDestination: 'このタスクを共有する場所を選択してください',
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
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。しばらくしてから、もう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを削除してもよろしいですか？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} の明細`,
    },
    keyboardShortcutsPage: {
        title: 'キーボードショートカット',
        subtitle: 'これらの便利なキーボードショートカットで時間を節約しましょう：',
        shortcuts: {
            openShortcutDialog: 'キーボードショートカットダイアログを開く',
            markAllMessagesAsRead: 'すべてのメッセージを既読にする',
            escape: 'ダイアログのエスケープ',
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
                title: '表示するものがありません',
                subtitle: `検索条件を調整するか、「+」ボタンで新しく作成してみてください。`,
            },
            emptyExpenseResults: {
                title: 'まだ経費が作成されていません',
                subtitle: 'Expensify についてもっと知るには、経費を作成するか、テストドライブをお試しください。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使用して経費を作成してください。',
            },
            emptyReportResults: {
                title: 'まだレポートを作成していません',
                subtitle: 'Expensify のレポートを作成するか、テストドライブを行って詳しく知りましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使ってレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    まだ請求書を作成していません
                `),
                subtitle: 'Expensify の請求書を送信するか、テストドライブをして詳細を確認しましょう。',
                subtitleWithOnlyCreateButton: '請求書を送信するには、下の緑色のボタンを使用してください。',
            },
            emptyTripResults: {
                title: '表示できる出張はありません',
                subtitle: 'まずは、下から最初の出張を予約しましょう。',
                buttonText: '旅行を予約',
            },
            emptySubmitResults: {
                title: '送信する経費はありません',
                subtitle: 'すべて問題ありません。胸を張って勝利の周回をしましょう！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックスはマックス。お見事です！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールに到達しました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ゆっくり休む時間です。よくやりました。',
            },
            emptyStatementsResults: {
                title: '表示する経費がありません',
                subtitle: '結果がありません。フィルターを調整してもう一度お試しください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックスはマックス。お見事です！',
            },
        },
        statements: 'ステートメント',
        unapprovedCash: '未承認の現金',
        unapprovedCard: '未承認のカード',
        reconciliation: '照合',
        saveSearch: '検索を保存',
        deleteSavedSearch: '保存された検索を削除',
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
            noOptionsAvailable: '選択された経費グループには利用可能なオプションがありません。',
        },
        filtersHeader: 'フィルター',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} より前`,
                after: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} 以降`,
                on: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} 上`,
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
                closedCards: '終了したカード',
                cardFeeds: 'カードフィード',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `すべて ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `すべてのCSVインポート済みカード${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} は ${value} です`,
            current: '現在',
            past: '過去',
            submitted: '提出済み',
            approved: '承認済み',
            paid: '支払い済み',
            exported: 'エクスポート済み',
            posted: '記帳済み',
            withdrawn: '取り下げ済み',
            billable: '請求可能',
            reimbursable: '精算対象',
            purchaseCurrency: '購入通貨',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
            },
            feed: 'フィード',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '払戻し',
            },
            is: 'である',
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
        searchIn: '検索内',
        searchPlaceholder: '何かを検索',
        suggestions: '提案',
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おっと、アイテムがたくさんありますね！まとめて整理して、まもなくConciergeからファイルをお送りします。',
        },
        exportAll: {
            selectAllMatchingItems: '一致する項目をすべて選択',
            allMatchingItemsSelected: '一致するすべての項目が選択されました',
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
                '写真フォルダーまたはダウンロードフォルダーに、あなたのQRコードのコピーがないか確認してください。プロチップ：プレゼンテーションに追加しておくと、聴衆がスキャンしてあなたと直接つながることができます。',
        },
        generalError: {
            title: '添付ファイルエラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージアクセス',
            message: 'Expensifyは、ストレージへのアクセスなしでは添付ファイルを保存できません。権限を更新するには「設定」をタップしてください。',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'New Expensify',
        about: '新しい Expensify について',
        update: '新しい Expensify を更新',
        checkForUpdates: 'アップデートを確認',
        toggleDevTools: '開発者ツールを切り替え',
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
        redo: 'やり直し',
        cut: '切り取り',
        copy: 'コピー',
        paste: '貼り付け',
        pasteAndMatchStyle: 'ペーストしてスタイルを合わせる',
        pasteAsPlainText: 'プレーンテキストとして貼り付け',
        delete: '削除',
        selectAll: 'すべて選択',
        speechSubmenu: '音声',
        startSpeaking: '話し始める',
        stopSpeaking: '話すのをやめる',
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
        front: 'すべてを手前に移動',
        helpMenu: 'ヘルプ',
        learnMore: '詳しく見る',
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
            title: 'アップデートがあります',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) => `新しいバージョンはまもなく利用可能になります。${!isSilentUpdating ? '更新の準備ができたらお知らせします。' : ''}`,
            soundsGood: '了解です',
        },
        notAvailable: {
            title: 'アップデートは利用できません',
            message: '現在利用可能なアップデートはありません。後でまた確認してください。',
            okay: 'OK',
        },
        error: {
            title: '更新の確認に失敗しました',
            message: 'アップデートを確認できませんでした。しばらくしてからもう一度お試しください。',
        },
    },
    settlement: {
        status: {
            pending: '保留中',
            cleared: '決済済み',
            failed: '失敗',
        },
        failedError: ({link}: {link: string}) => `<a href="${link}">アカウントのロックを解除</a>すると、この清算を再試行します。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • 出金 ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化：',
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
                `${workspaceName} で別のレポートを作成してもよろしいですか？空のレポートには 次の場所 からアクセスできます`,
            emptyReportConfirmationPromptLink: 'レポート',
            genericWorkspaceName: 'このワークスペース',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportFieldFailureMessage: 'フィールドの更新中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポート名の変更中に予期しないエラーが発生しました。後でもう一度お試しください。',
        noActivityYet: 'まだアクティビティがありません',
        connectionSettings: '接続設定',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」（以前は「${oldValue}」）に変更しました`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」に設定`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `ワークスペース${fromPolicyName ? `（以前の${fromPolicyName}）` : ''}を変更しました`;
                    }
                    return `ワークスペースを${toPolicyName}${fromPolicyName ? `（以前の${fromPolicyName}）` : ''}に変更しました`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `${oldType} から ${newType} にタイプを変更しました`,
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
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `${label} にエクスポート済み（経由）`,
                    automaticActionTwo: '会計設定',
                    manual: ({label}: ExportedToIntegrationParams) => `このレポートを ${label} に手動エクスポート済みとしてマークしました。`,
                    automaticActionThree: 'そして、次のレコードを正常に作成しました',
                    reimburseableLink: '自己負担経費',
                    nonReimbursableLink: '会社カード経費',
                    pending: ({label}: ExportedToIntegrationParams) => `このレポートの ${label} へのエクスポートを開始しました…`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `このレポートを${label}へエクスポートできませんでした（"${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `領収書を追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `他の場所で${currency}${amount}を支払いました`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `連携機能を通じて ${currency}${amount} を支払いました`,
                outdatedBankAccount: `支払元の銀行口座に問題があるため、支払いを処理できませんでした`,
                reimbursementACHBounce: `銀行口座の問題により支払いを処理できませんでした`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払者が銀行口座を変更したため、支払いを処理できませんでした`,
                reimbursementDelayed: `支払いは処理されましたが、あと1～2営業日ほど遅れています`,
                selectedForRandomAudit: `無作為に選ばれてレビュー対象になりました`,
                selectedForRandomAuditMarkdown: `レビューのために[ランダムに選択](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)されました`,
                share: ({to}: ShareParams) => `招待されたメンバー ${to}`,
                unshare: ({to}: UnshareParams) => `削除されたメンバー ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${currency}${amount} を支払いました`,
                takeControl: `操作を引き継ぎました`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `${label}${errorMessage ? ` ("${errorMessage}")` : ''}との同期中に問題が発生しました。<a href="${workspaceAccountingLink}">ワークスペース設定</a>で問題を解決してください。`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email} を ${role === 'member' ? 'a' : '1つの'} ${role} として追加しました`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} のロールを ${currentRole} から ${newRole} に更新しました`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド1を削除しました（以前の値: 「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド1に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド1を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド2を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `「${newValue}」を ${email} のカスタムフィールド2に追加しました`
                        : `${email} のカスタムフィールド2を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} への接続を削除しました`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続済み`,
                leftTheChat: 'チャットを退出しました',
            },
            error: {
                invalidCredentials: '資格情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${date} まであと ${dayCount} ${dayCount === 1 ? '日' : '日数'} の${summary}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date}の${timePeriod}の${summary}`,
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費レポート',
        companyCreditCard: '法人クレジットカード',
        receiptScanningApp: '領収書スキャンアプリ',
        billPay: '請求書支払',
        invoicing: '請求書作成',
        CPACard: 'CPAカード',
        payroll: '給与',
        travel: '旅行',
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
        jobs: 'ジョブ',
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
        chatWelcomeMessage: 'チャットの歓迎メッセージ',
        navigatesToChat: 'チャットに移動',
        newMessageLineIndicator: '新しいメッセージ行インジケーター',
        chatMessage: 'チャットメッセージ',
        lastChatMessagePreview: '最後のチャットメッセージのプレビュー',
        workspaceName: 'ワークスペース名',
        chatUserDisplayNames: 'チャットメンバーの表示名',
        scrollToNewestMessages: '最新メッセージまでスクロール',
        preStyledText: 'スタイル済みテキスト',
        viewAttachment: '添付ファイルを表示',
    },
    parentReportAction: {
        deletedReport: '削除されたレポート',
        deletedMessage: '削除されたメッセージ',
        deletedExpense: '削除済み経費',
        reversedTransaction: '返金取引',
        deletedTask: '削除されたタスク',
        hiddenMessage: '非表示メッセージ',
    },
    threads: {
        thread: 'スレッド',
        replies: '返信',
        reply: '返信',
        from: '差出人',
        in: '内で',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `差出人 ${reportName}${workspaceName ? `${workspaceName} 内` : ''}`,
    },
    qrCodes: {
        copy: 'URL をコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'すべてのフラグ付きメッセージは、モデレーターによる確認のために送信されます。',
        chooseAReason: 'フラグを付ける理由を以下から選択してください：',
        spam: 'スパム',
        spamDescription: '頼まれていない無関係な宣伝',
        inconsiderate: '無神経',
        inconsiderateDescription: '侮辱的または無礼な言い回しで、意図に疑いがあるもの',
        intimidation: '威圧',
        intimidationDescription: '正当な異議があるにもかかわらず、強引に議題を押し進める',
        bullying: 'いじめ',
        bullyingDescription: '服従を得るために個人を標的にする',
        harassment: 'ハラスメント',
        harassmentDescription: '人種差別的、女性差別的、またはその他の広く差別的な行為',
        assault: '暴行',
        assaultDescription: '害意を持って行われる、特定の相手を狙った感情的な攻撃',
        flaggedContent: 'このメッセージはコミュニティルールに違反していると判断され、内容が非表示になりました。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告を送信し、メッセージは審査のために報告されます。',
        levelTwoResult: 'チャネルからメッセージが非表示になり、匿名の警告が追加され、そのメッセージはレビュー用に報告されました。',
        levelThreeResult: 'チャンネルからメッセージを削除し、匿名の警告を送信し、メッセージを審査のために報告しました。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '経費の提出を依頼',
        inviteToChat: 'チャットのみ招待',
        nothing: '何もしない',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '承認',
        decline: '拒否',
    },
    actionableMentionTrackExpense: {
        submit: '誰かに送信する',
        categorize: 'カテゴリ分けする',
        share: '会計士と共有する',
        nothing: '今のところ何もありません',
    },
    teachersUnitePage: {
        teachersUnite: '教師団結',
        joinExpensifyOrg:
            '世界中の不公正をなくすために、Expensify.org に参加しましょう。現在進行中の「Teachers Unite」キャンペーンでは、必需の学用品の費用を分担することで、あらゆる場所の教育者を支援しています。',
        iKnowATeacher: '知っている先生がいます',
        iAmATeacher: '私は教師です',
        getInTouch: '素晴らしいですね！その方の連絡先情報を共有していただければ、こちらからご連絡いたします。',
        introSchoolPrincipal: '学校長紹介',
        schoolPrincipalVerifyExpense:
            'Expensify.org は、必需の学用品の費用を分担することで、低所得世帯の生徒がより良い学習体験を得られるようにします。あなたの経費は、校長先生に確認していただきます。',
        principalFirstName: '主要担当者の名',
        principalLastName: '代表者の姓',
        principalWorkEmail: '主な仕事用メール',
        updateYourEmail: 'メールアドレスを更新',
        updateEmail: 'メールアドレスを更新',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `先に進む前に、学校のメールアドレスを既定の連絡方法として設定してください。設定 ＞ プロフィール ＞ <a href="${contactMethodsRoute}">連絡方法</a> で設定できます。`,
        error: {
            enterPhoneEmail: '有効なメールアドレスまたは電話番号を入力してください',
            enterEmail: 'メールアドレスを入力',
            enterValidEmail: '有効なメールアドレスを入力してください',
            tryDifferentEmail: '別のメールアドレスをお試しください',
        },
    },
    cardTransactions: {
        notActivated: '未アクティベート',
        outOfPocket: '自己負担の支出',
        companySpend: '会社の支出',
    },
    distance: {
        addStop: '経由地を追加',
        deleteWaypoint: '経由地を削除',
        deleteWaypointConfirmation: 'この経由地を削除してもよろしいですか？',
        address: '住所',
        waypointDescription: {
            start: '開始',
            stop: '停止',
        },
        mapPending: {
            title: 'マッピング保留中',
            subtitle: 'オンラインに戻るとマップが生成されます',
            onlineSubtitle: '地図を設定しています。少々お待ちください',
            errorTitle: '地図エラー',
            errorSubtitle: '地図の読み込み中にエラーが発生しました。もう一度お試しください。',
        },
        error: {
            selectSuggestedAddress: '候補の住所を選択するか、現在地を使用してください',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '成績表を紛失または破損した',
        nextButtonLabel: '次へ',
        reasonTitle: 'なぜ新しいカードが必要ですか？',
        cardDamaged: '私のカードが破損しました',
        cardLostOrStolen: 'カードを紛失した／盗難にあった',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは2～3営業日以内に届きます。現在お使いのカードは、新しいカードを有効化するまで引き続きご利用いただけます。',
        cardLostOrStolenInfo: '現在お使いのカードは、新しいカードの注文が完了するとすぐに永久に無効化されます。ほとんどのカードは、通常数営業日以内に到着します。',
        address: '住所',
        deactivateCardButton: 'カードを無効化',
        shipNewCardButton: '新しいカードを発送',
        addressError: '住所は必須です',
        reasonError: '理由は必須です',
        successTitle: '新しいカードを発送しました！',
        successDescription: '数営業日で届いたら、有効化する必要があります。それまでの間は、バーチャルカードをご利用いただけます。',
    },
    eReceipt: {
        guaranteed: '保証付きeレシート',
        transactionDate: '取引日',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを開始して、<success><strong>友達を紹介</strong></success>しましょう。',
            header: 'チャットを開始、友だちを紹介',
            body: '友だちにも Expensify を使ってほしいですか？その人とのチャットを開始するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を申請し、<success><strong>チームを紹介しましょう</strong></success>。',
            header: '経費を提出して、チームを紹介しましょう',
            body: 'あなたのチームにもExpensifyを使ってほしいですか？そのチーム宛てに経費を提出していただければ、あとはすべてお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友達を紹介する',
            body: '友だちにもExpensifyを使ってほしいですか？チャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてお任せください。招待リンクを共有するだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友達を紹介する',
            header: '友達を紹介する',
            body: '友だちにもExpensifyを使ってほしいですか？チャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてお任せください。招待リンクを共有するだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `<a href="${href}">${adminReportName}</a> でセットアップ専任担当者とチャットしてサポートを受ける`,
        default: `セットアップについては、<concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> にメッセージを送信してください`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必須です',
        autoReportedRejectedExpense: 'この経費は却下されました。',
        billableExpense: '請求対象は無効です',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        categoryOutOfPolicy: 'カテゴリが無効になりました',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% の為替手数料を適用`,
        customUnitOutOfPolicy: 'このワークスペースでは有効なレートではありません',
        duplicatedTransaction: '重複の可能性',
        fieldRequired: 'レポートフィールドは必須です',
        futureDate: '未来の日付は使用できません',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `${invoiceMarkup}% 増額済み`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `${maxAge}日より前の日付`,
        missingCategory: 'カテゴリがありません',
        missingComment: '選択したカテゴリには説明が必要です',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `不足している ${tagName ?? 'タグ'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '計算された距離と金額が一致しません';
                case 'card':
                    return 'カード取引額を超えています';
                default:
                    if (displayPercentVariance) {
                        return `スキャンした領収書より${displayPercentVariance}%多い金額`;
                    }
                    return 'スキャンした領収書の金額を超えています';
            }
        },
        modifiedDate: 'スキャンしたレシートの日付と異なります',
        nonExpensiworksExpense: '非-Expensiworks経費',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `経費が自動承認上限額 ${formattedLimit} を超えています`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `${formattedLimit}／人のカテゴリ上限額を超えています`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限額 ${formattedLimit} を超過した金額`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `${formattedLimit}/出張あたりの上限額を超えた金額`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限額 ${formattedLimit} を超過した金額`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `1人あたりの日次カテゴリ上限額 ${formattedLimit} を超過した金額`,
        receiptNotSmartScanned: 'レシートと経費の詳細が手動で追加されました。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `領収書が必要です（カテゴリの上限 ${formattedLimit} を超えています）`;
            }
            if (formattedLimit) {
                return `${formattedLimit} を超える場合は領収書が必要です`;
            }
            if (category) {
                return `カテゴリ上限を超えているため領収書が必要です`;
            }
            return '領収書が必要です';
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
                        return `たばこ`;
                    case 'adultEntertainment':
                        return `大人向け娯楽`;
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
        reviewRequired: '要確認',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行接続の不具合により、領収書を自動照合できません';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行接続が切断されています。<a href="${companyCardPageURL}">レシートを照合するために再接続</a>`
                    : '銀行接続が切断されています。領収書を照合するには、管理者に再接続を依頼してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member} に現金としてマークするよう依頼するか、7日待ってから再度お試しください` : 'カード取引との統合待ち。';
            }
            return '';
        },
        brokenConnection530Error: '銀行連携の不具合により領収書が保留されています',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の不具合により、領収書が保留されています。<a href="${workspaceCompanyCardRoute}">会社カード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行連携の不具合により、領収書が保留されています。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '無視して支払いをリクエストするために現金としてマークします。',
        smartscanFailed: ({canEdit = true}) => `レシートのスキャンに失敗しました。${canEdit ? '詳細を手動で入力' : ''}`,
        receiptGeneratedWithAI: 'AI生成の可能性がある領収書',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} が見つかりません`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} は無効になりました`,
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税金'} は無効になりました`,
        taxRateChanged: '税率が変更されました',
        taxRequired: '税率が未設定です',
        none: 'なし',
        taxCodeToKeep: '保持する税コードを選択',
        tagToKeep: '保持するタグを選択',
        isTransactionReimbursable: '取引が精算対象かどうかを選択',
        merchantToKeep: '保持する加盟店を選択',
        descriptionToKeep: '保持する説明を選択',
        categoryToKeep: '保持するカテゴリを選択',
        isTransactionBillable: '取引が請求可能かどうかを選択',
        keepThisOne: 'これを残す',
        confirmDetails: `保持する詳細を確認`,
        confirmDuplicatesInfo: `保持しない重複分は、提出者が削除できるよう保留されます。`,
        hold: 'この経費は保留中です',
        resolvedDuplicates: '重複を解決しました',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName}は必須です`,
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
            subtitle: '移行する前に、Expensify Classic に切り替えたい理由をお聞かせください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic でのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'New Expensify の使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensify の使い方は理解していますが、Expensify Classic のほうが好みです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensify にまだない、必要としている機能は何ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしていますか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜExpensify Classicを選択するのですか？',
        },
        responsePlaceholder: 'あなたの回答',
        thankYou: 'フィードバックをありがとうございます！',
        thankYouSubtitle: 'ご回答は、私たちが「やるべきことを片付ける」ためのより良いプロダクトを作るうえで役立ちます。ご協力ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
        offlineTitle: 'ここで行き詰まってしまったようです…',
        offline:
            'オフラインのようです。残念ながら、Expensify Classic はオフラインでは動作しませんが、新しい Expensify はオフラインでも利用できます。Expensify Classic を使用したい場合は、インターネット接続があるときにもう一度お試しください。',
        quickTip: 'ちょっとしたヒント…',
        quickTipSubTitle: 'expensify.com にアクセスすると、すぐに Expensify Classic を利用できます。ブックマークしておくと、簡単にショートカットとして使えます！',
        bookACall: '通話を予約',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費やレポート上での直接チャット',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルであらゆる操作が可能',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードで行う出張と経費処理',
        },
        bookACallTextTop: 'Expensify Classic に切り替えると、次の機能が利用できなくなります。',
        bookACallTextBottom: 'ぜひお電話で理由をお聞きしたいです。お客様のニーズについて話し合うため、シニアプロダクトマネージャーとの通話をご予約いただけます。',
        takeMeToExpensifyClassic: 'Expensify Classic に移動',
    },
    listBoundary: {
        errorMessage: 'さらにメッセージを読み込む際にエラーが発生しました',
        tryAgain: '再試行',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引に領収書を一致させました',
    },
    subscription: {
        authenticatePaymentCard: '支払いカードを認証',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションの変更はできません。',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `無料トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 日`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `${date}までにお支払いカードを更新して、お気に入りのすべての機能を引き続きご利用ください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `${date}の${purchaseAmountOwed}の請求を処理できませんでした。未払い金額を清算するために支払いカードを追加してください。`
                        : '支払い残高を精算するには、支払いカードを追加してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `お支払い期限を過ぎています。サービスの中断を防ぐため、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払い期限を過ぎています。請求書のお支払いをお願いいたします。',
            },
            billingDisputePending: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `末尾が${cardEnding}のカードで${amountOwed}の請求に異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お支払いカードが完全に認証されていません。',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `お支払いカード（末尾が${cardEnding}のカード）を有効化するため、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `残高不足のため、お支払い用カードが承認されませんでした。もう一度お試しいただくか、新しいお支払い用カードを追加して、未払い残高 ${amountOwed} を清算してください。`,
            },
            cardExpired: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `お支払いカードの有効期限が切れています。未払い残高 ${amountOwed} を清算するために、新しいお支払いカードを追加してください。`,
            },
            cardExpireSoon: {
                title: 'あなたのカードはまもなく有効期限が切れます',
                subtitle: 'お使いの支払いカードは今月末で有効期限が切れます。引き続きお好きな機能をすべてご利用いただくために、下の三点メニューをクリックしてカード情報を更新してください。',
            },
            retryBillingSuccess: {
                title: '成功しました！',
                subtitle: 'カードの請求が正常に完了しました。',
            },
            retryBillingError: {
                title: 'カードに請求できませんでした',
                subtitle: '再試行する前に、お使いの銀行へ直接連絡し、Expensify への請求を承認して保留を解除してください。もしくは、別の支払いカードを追加してみてください。',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `末尾が${cardEnding}のカードで${amountOwed}の請求に異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitle: '次のステップとして、チームが経費精算を開始できるように、<a href="#">セットアップチェックリストを完了</a>してください。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `トライアル：${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 残り！`,
                subtitle: 'すべてのお気に入り機能を引き続き利用するには、支払いカードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルは終了しました',
                subtitle: 'すべてのお気に入り機能を引き続き利用するには、支払いカードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: 'オファーを利用',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>最初の1年間は${discountType}%オフ！</strong> 支払いカードを追加して、年間サブスクリプションを開始しましょう。`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `期間限定オファー：初年度が${discountType}%オフ！`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) =>
                    `${days > 0 ? `${days}日 :` : ''}${hours}時間以内にクレームしてください：${minutes}分：${seconds}秒`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensify のサブスクリプション支払い用のカードを追加してください。',
            addCardButton: '支払いカードを追加',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `次回のお支払い日は ${nextPaymentDate} です。`,
            cardEnding: ({cardNumber}: CardEndingParams) => `末尾が${cardNumber}のカード`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `名前: ${name}, 有効期限: ${expiration}, 通貨: ${currency}`,
            changeCard: '支払いカードを変更',
            changeCurrency: '支払通貨を変更',
            cardNotFound: '支払いカードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証',
            requestRefund: '返金をリクエスト',
            requestRefundModal: {
                full: '返金を受けるのは簡単です。次回の請求日より前にアカウントをダウングレードするだけで、返金されます。<br /> <br /> ご注意：アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合は新しいワークスペースをいつでも作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'あなたのプラン',
            exploreAllPlans: 'すべてのプランを表示',
            customPricing: 'カスタム価格設定',
            asLowAs: ({price}: YourPlanPriceValueParams) => `アクティブメンバー1人あたり月額${price}から`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額${price}`,
            perMemberMonth: 'メンバーあたり／月',
            collect: {
                title: '回収',
                description: '経費、出張、チャットをすべて備えたスモールビジネス向けプラン。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                benefit1: 'レシートスキャン',
                benefit2: '払戻し',
                benefit3: '法人カード管理',
                benefit4: '経費および出張の承認',
                benefit5: '出張予約とルール',
                benefit6: 'QuickBooks/Xero 連携',
                benefit7: '経費、レポート、ルームでチャット',
                benefit8: 'AI と人間によるサポート',
            },
            control: {
                title: '管理',
                description: '大企業向けの経費管理、出張管理、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                benefit1: 'Collect プランのすべて',
                benefit2: '多段階承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP連携（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人事統合機能（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタムインサイトとレポート',
                benefit8: '予算管理',
            },
            thisIsYourCurrentPlan: 'これは現在のプランです',
            downgrade: 'Collect へダウングレード',
            upgrade: 'Control にアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensify Cardで節約する',
            saveWithExpensifyDescription: 'Expensify カードのキャッシュバックが Expensify の請求額をどれだけ削減できるか、貯蓄計算ツールで確認しましょう。',
            saveWithExpensifyButton: '詳しく見る',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>あなたに最適なプランで、必要な機能を使い始めましょう。<a href="${CONST.PRICING}">料金ページを表示</a>して、各プランの機能を詳しくご確認ください。</muted-text>`,
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年次サブスクリプション',
            taxExempt: '非課税ステータスを申請',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '非課税ステータス',
            payPerUse: '従量課金制',
            subscriptionSize: 'サブスクリプションのサイズ',
            headsUp:
                'お知らせ：今すぐご利用人数（サブスクリプション規模）を設定しない場合、初月のアクティブメンバー数を基準に自動設定されます。その場合、今後12か月間は少なくともその人数分のメンバー料金をお支払いいただくことになります。ご利用人数はいつでも増やすことができますが、現在のサブスクリプション期間が終了するまでは減らすことができません。',
            zeroCommitment: '割引された年額サブスクリプション料金でもコミットメントは一切不要',
        },
        subscriptionSize: {
            title: 'サブスクリプションのサイズ',
            yourSize: 'サブスクリプションの規模とは、ある月にアクティブメンバーが利用できる空席の数を指します。',
            eachMonth:
                '毎月、ご利用のサブスクリプションは、上で設定された人数分までのアクティブメンバーを対象とします。サブスクリプションの規模を増やすと、その時点の新しい人数で新たに 12 か月のサブスクリプションが開始されます。',
            note: '注：アクティブメンバーとは、あなたの会社のワークスペースに紐づく経費データを作成、編集、提出、承認、精算、またはエクスポートしたことのある人を指します。',
            confirmDetails: '新しい年間サブスクリプションの詳細を確認してください:',
            subscriptionSize: 'サブスクリプションのサイズ',
            activeMembers: ({size}: SubscriptionSizeParams) => `月あたり有効メンバー数：${size}`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年額サブスクリプションの期間中はダウングレードできません。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `すでに、${date}まで毎月アクティブメンバー${size}人分の年間サブスクリプションにお申し込み済みです。自動更新を無効にすると、${date}から従量課金制のサブスクリプションに切り替えることができます。`,
            error: {
                size: '有効なサブスクリプションのサイズを入力してください',
                sameSize: '現在のサブスクリプションのサイズとは異なる数字を入力してください',
            },
        },
        paymentCard: {
            addPaymentCard: '支払いカードを追加',
            enterPaymentCardDetails: '支払いカードの詳細を入力してください',
            security: 'Expensify は PCI-DSS に準拠しており、銀行レベルの暗号化を使用し、冗長構成のインフラストラクチャを利用してお客様のデータを保護します。',
            learnMoreAboutSecurity: '当社のセキュリティについて詳しく見る',
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `サブスクリプションの種類: ${subscriptionType}, サブスクリプションの規模: ${subscriptionSize}, 自動更新: ${autoRenew}, 年間シート数の自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年額',
            autoRenew: '自動更新',
            autoIncrease: '年次シート数を自動増加',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `アクティブメンバー1人あたり、月額最大${amountWithCurrency}節約できます`,
            automaticallyIncrease: 'アクティブメンバーがご契約の席数を超えた場合に備えて、年間席数を自動的に増やします。注：この操作により、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensify の改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `${date}に更新されます。`,
            pricingConfiguration: '料金は構成内容によって異なります。最もお得にご利用いただくには、年額サブスクリプションを選択し、Expensify Card をご利用ください。',
            learnMore: {
                part1: '詳しくは当社のページをご覧ください',
                pricingPage: '料金ページ',
                part2: 'または、お使いの言語で当社チームとチャットする',
                adminsRoom: '#admins ルーム',
            },
            estimatedPrice: '推定価格',
            changesBasedOn: 'これは、お客様のExpensify Cardの利用状況と、以下のサブスクリプションオプションに基づいて変動します。',
        },
        requestEarlyCancellation: {
            title: '早期解約をリクエスト',
            subtitle: '早期解約をリクエストされる主な理由は何ですか？',
            subscriptionCanceled: {
                title: 'サブスクリプションをキャンセルしました',
                subtitle: '年間サブスクリプションはキャンセルされました。',
                info: 'ワークスペースを従量課金制で引き続き利用したい場合は、これで準備完了です。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `今後のアクティビティや請求を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除</a>する必要があります。ワークスペースを削除すると、その月のカレンダー月内に発生した未精算のアクティビティについて請求されることにご注意ください。`,
            },
            requestSubmitted: {
                title: 'リクエストを送信しました',
                subtitle:
                    'ご利用中のサブスクリプションの解約にご関心をお寄せいただきありがとうございます。お客様のリクエストを確認中です。まもなく、<concierge-link>Concierge</concierge-link> とのチャットを通じてご連絡いたします。',
            },
            acknowledgement: `早期解約をリクエストすることにより、私は、Expensify が Expensify の<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または私と Expensify との間で適用されるその他のサービス契約に基づき、そのようなリクエストに応じる義務を負わないこと、ならびにそのようなリクエストに応じるかどうかについて Expensify が単独の裁量権を有することを認識し、これに同意します。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖、縮小、または買収',
        additionalInfoTitle: 'どのソフトウェアへ移行しますか？また、その理由は何ですか？',
        additionalInfoInputLabel: 'あなたの回答',
    },
    roomChangeLog: {
        updateRoomDescription: 'ルームの説明を次の内容に設定:',
        clearRoomDescription: '部屋の説明をクリアしました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームのアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替える',
        copilotDelegatedAccess: 'Copilot：委任アクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにします。',
        addCopilot: 'コパイロットを追加',
        membersCanAccessYourAccount: '以下のメンバーがあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'アカウントスイッチャーからこれらのアカウントにアクセスできます。',
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
        confirmCopilot: '以下でCopilotを確認してください。',
        accessLevelDescription: '下からアクセスレベルを選択してください。フルアクセスと制限付きアクセスのどちらを選んでも、コパイロットはすべてのチャットと経費を閲覧できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'あなたの代わりに、ほかのメンバーがあなたのアカウントであらゆる操作を行えるようにします。チャット、申請、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '別のメンバーがあなたに代わってあなたのアカウントでほとんどの操作を行えるようにします。承認、支払い、却下、および保留は除きます。';
                default:
                    return '';
            }
        },
        removeCopilot: 'コパイロットを削除',
        removeCopilotConfirmation: 'このCopilotを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'ご本人確認をしましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `コパイロットを追加するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `コパイロットを更新するため、${contactMethod} に送信されたマジックコードを入力してください。`,
        notAllowed: 'そんなに急がないでください…',
        noAccessMessage: dedent(`
            コパイロットとしては、このページにアクセスできません。申し訳ありません。
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `${accountOwnerEmail} の<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">コパイロット</a>として、この操作を行う権限がありません。申し訳ありません。`,
        copilotAccess: 'Copilot アクセス',
    },
    debug: {
        debug: 'デバッグ',
        details: '詳細',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: 'プレビュー',
        nothingToPreview: 'プレビューするものがありません',
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
        hint: 'データの変更はバックエンドへ送信されません',
        textFields: 'テキストフィールド',
        numberFields: '数値フィールド',
        booleanFields: 'ブール値フィールド',
        constantFields: '定数フィールド',
        dateTimeFields: '日付と時刻フィールド',
        date: '日付',
        time: '時間',
        none: 'なし',
        visibleInLHN: 'LHN に表示',
        GBR: 'GBR',
        RBR: 'RBR',
        true: '真',
        false: '偽',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: 'ドラフトコメントあり',
            hasGBR: 'GBR あり',
            hasRBR: 'RBR あり',
            pinnedByUser: 'メンバーによってピン留め済み',
            hasIOUViolations: 'IOU 違反あり',
            hasAddWorkspaceRoomErrors: 'ワークスペースルームの追加エラーがあります',
            isUnread: '未読（集中モード）',
            isArchived: 'アーカイブ済み（最新モード）',
            isSelfDM: '自分へのDM',
            isFocused: '一時的にフォーカスされています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストあり（管理者ルーム）',
            isUnreadWithMention: '未読（メンションあり）',
            isWaitingForAssigneeToCompleteAction: '担当者がアクションを完了するのを待っています',
            hasChildReportAwaitingAction: '対応待ちの子レポートがあります',
            hasMissingInvoiceBankAccount: '請求書の銀行口座が不足しています',
            hasUnresolvedCardFraudAlert: '未解決のカード不正使用アラートがあります',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションのデータにエラーがあります',
            hasViolations: '違反あり',
            hasTransactionThreadViolations: 'トランザクションスレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '対応が必要なレポートがあります',
            theresAReportWithErrors: 'エラーのあるレポートがあります',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位エラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題がありました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法には確認が必要です',
            theresAProblemWithAPaymentMethod: '支払い方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: 'あなたの払い戻し口座に問題があります',
            theresABillingProblemWithYourSubscription: 'サブスクリプションの請求に問題があります',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'サブスクリプションが正常に更新されました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました',
            theresAProblemWithYourWallet: 'ウォレットに問題が発生しました',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: '新しい Expensify へようこそ！',
        subtitle: '従来のエクスペリエンスで気に入っていただいているすべてに、生活をもっと便利にするたくさんのアップグレードを加えました：',
        confirmText: '始めましょう！',
        helpText: '2分デモを試す',
        features: {
            search: 'モバイル、Web、デスクトップで、より強力な検索',
            concierge: '経費の自動化を支援する内蔵Concierge AI',
            chat: '不明点は、経費ごとにチャットで素早く解決しましょう',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip><strong>ここから</strong>始めましょう！</tooltip>',
        saveSearchTooltip: '<tooltip><strong>保存済み検索の名前を変更</strong>できます！</tooltip>',
        accountSwitcher: '<tooltip>ここから<strong>Copilot アカウント</strong>にアクセスできます</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>テスト用のレシートをスキャン</strong>して、どのように動作するかを確認しましょう！</tooltip>',
            manager: '<tooltip>お試しには<strong>テストマネージャー</strong>を選択してください！</tooltip>',
            confirmation: '<tooltip>では、<strong>経費を提出</strong>して、どんな魔法が起きるか見てみましょう！</tooltip>',
            tryItOut: '試してみる',
        },
        outstandingFilter: '<tooltip><strong>承認が必要</strong>な経費をフィルター</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して\n<strong>試用を完了しましょう！</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: '変更を破棄しますか？',
        body: '変更内容を破棄してもよろしいですか？',
        confirmText: '変更を破棄',
    },
    scheduledCall: {
        book: {
            title: '通話を予約',
            description: 'ご都合のよい時間をお選びください。',
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> の利用可能な時間</muted-text>`,
        },
        confirmation: {
            title: '通話を確認',
            description: '以下の詳細をご確認ください。通話を確定すると、詳細情報を記載した招待をお送りします。',
            setupSpecialist: 'あなたのセットアップ担当者',
            meetingLength: '会議の長さ',
            dateTime: '日付と時刻',
            minutes: '30分',
        },
        callScheduled: '通話を予約しました',
    },
    autoSubmitModal: {
        title: 'すべて問題なく送信されました！',
        description: 'すべての警告と違反が解除されたので：',
        submittedExpensesTitle: 'これらの経費は提出済みです',
        submittedExpensesDescription: 'これらの経費は承認者に送信されていますが、承認されるまでは編集できます。',
        pendingExpensesTitle: '保留中の経費は移動されました',
        pendingExpensesDescription: '未処理のカード経費は、確定するまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分でお試しください',
        },
        modal: {
            title: '試しに使ってみる',
            description: '短時間で概要をつかむために、製品ツアーをさっと見てみましょう。',
            confirmText: 'テストドライブを開始',
            helpText: 'スキップ',
            employee: {
                description:
                    '<muted-text>あなたのチームに<strong>Expensify を3か月間無料</strong>で提供しましょう！以下に上司のメールアドレスを入力して、テスト経費を送信してください。</muted-text>',
                email: '上司のメールアドレスを入力してください',
                error: 'そのメンバーはワークスペースを所有しています。テストする別のメンバーを入力してください。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '現在、Expensify を試用中です',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: '開始する',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} さんが、Expensify のお試しにあなたを招待しました
やあ！経費精算を最速でこなせる Expensify を、お試しで *3 か月間無料* で使えるようにしておいたよ。

仕組みをお見せするための *テストレシート* がこちらです:`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: 'すべてのデータ - レポートレベル',
        expenseLevelExport: 'すべてのデータ - 経費レベル',
        exportInProgress: 'エクスポートを処理中',
        conciergeWillSend: 'Concierge がまもなくファイルを送信します。',
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `続行する前に、<strong>${domainName}</strong> のDNS設定を更新して、あなたがそのドメインの所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNS プロバイダーにアクセスし、<strong>${domainName}</strong> の DNS 設定を開いてください。`,
            addTXTRecord: '次のTXTレコードを追加してください:',
            saveChanges: '変更を保存して、ここに戻り、ドメインを確認してください。',
            youMayNeedToConsult: `本人確認を完了するには、組織の IT 部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳しくはこちら</a>。`,
            warning: '確認が完了すると、あなたのドメイン上のすべての Expensify メンバーに、そのアカウントがあなたのドメインの管理下になることを通知するメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しいただき、問題が解決しない場合はConciergeまでお問い合わせください。',
        },
        domainVerified: {
            title: 'ドメインが確認されました',
            header: 'やった！ドメインが確認されました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン <strong>${domainName}</strong> は正常に認証されました。これで、SAML やその他のセキュリティ機能を設定できるようになりました。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーが Expensify にログインする方法を、より細かく制御できるセキュリティ機能です。有効にするには、権限を持つ会社管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、簡単にログイン',
            moreSecurityAndControl: 'より優れたセキュリティと管理',
            onePasswordForAnything: 'すべてをひとつのパスワードで',
        },
        goToDomain: 'ドメインへ移動',
        samlLogin: {
            title: 'SAML ログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン (SSO)</a> でメンバーのサインインを設定します。</muted-text>`,
            enableSamlLogin: 'SAML ログインを有効にする',
            allowMembers: 'メンバーが SAML を使用してログインできるようにする',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしているメンバーは、SAML を使用して再認証する必要があります。',
            enableError: 'SAML 有効化設定を更新できませんでした',
            requireError: 'SAML 必須設定を更新できませんでした',
        },
        samlConfigurationDetails: {
            title: 'SAML構成の詳細',
            subtitle: 'SAML を設定するために、これらの詳細を使用してください。',
            identityProviderMetaData: 'IDプロバイダー・メタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: '名前ID形式',
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
