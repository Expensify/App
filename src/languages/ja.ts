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
        count: 'カウント',
        cancel: 'キャンセル',
        dismiss: '却下する',
        proceed: '進む',
        yes: 'はい',
        no: 'いいえ',
        ok: 'OK',
        notNow: '今は無理',
        noThanks: '結構です',
        learnMore: '詳しくはこちら',
        buttonConfirm: '了解しました。',
        name: '名前',
        attachment: '添付ファイル',
        attachments: '添付ファイル',
        center: 'センター',
        from: 'から',
        to: 'に',
        in: 'で',
        optional: 'オプション',
        new: '新規',
        search: '検索',
        reports: 'レポート',
        find: '検索',
        searchWithThreeDots: '検索...',
        next: '次へ',
        previous: '前へ',
        goBack: '戻る',
        create: '作成',
        add: '追加',
        resend: '再送信',
        save: '保存',
        select: '選択',
        deselect: '選択解除',
        selectMultiple: '複数選択',
        saveChanges: '変更を保存',
        submit: '送信',
        submitted: '送信済み',
        rotate: '回転',
        zoom: 'Zoom',
        password: 'パスワード',
        magicCode: '魔法のコード',
        twoFactorCode: '二要素コード',
        workspaces: 'ワークスペース',
        inbox: '受信トレイ',
        group: 'グループ',
        success: '成功',
        profile: 'プロフィール',
        referral: '紹介',
        payments: '支払い',
        approvals: '承認',
        wallet: 'ウォレット',
        preferences: '設定',
        view: '表示',
        review: (reviewParams?: ReviewParams) => `レビュー${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'いいえ',
        signIn: 'サインイン',
        signInWithGoogle: 'Googleでサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'サインイン方法',
        continue: '続行する',
        firstName: '名',
        lastName: '姓',
        scanning: 'スキャン中',
        addCardTermsOfService: 'Expensify 利用規約',
        perPerson: '1人あたり',
        phone: '電話',
        phoneNumber: '電話番号',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'メール',
        and: 'および',
        or: 'または',
        details: '詳細',
        privacy: 'プライバシー',
        privacyPolicy: 'プライバシーポリシー',
        hidden: '非表示',
        visible: '表示可能',
        delete: '削除',
        archived: 'アーカイブ済み',
        contacts: '連絡先',
        recents: '最近のもの',
        close: '閉じる',
        comment: 'コメント',
        download: 'ダウンロード',
        downloading: 'ダウンロード中',
        uploading: 'アップロード中',
        pin: 'ピン留めする',
        unPin: 'ピン留めを解除',
        back: '戻る',
        saveAndContinue: '保存して続行',
        settings: '設定',
        termsOfService: '利用規約',
        members: 'メンバー',
        invite: '招待する',
        here: 'ここ',
        date: '日付',
        dob: '生年月日',
        currentYear: '今年',
        currentMonth: '今月',
        ssnLast4: 'SSNの下4桁',
        ssnFull9: 'SSNの9桁すべて',
        addressLine: ({lineNumber}: AddressLineParams) => `住所行 ${lineNumber}`,
        personalAddress: '個人住所',
        companyAddress: '会社の住所',
        noPO: '私書箱やメールドロップの住所はご遠慮ください。',
        city: '市',
        state: '状態',
        streetAddress: '住所',
        stateOrProvince: '州 / 県',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: '承諾します',
        acceptTermsAndPrivacy: `承諾します <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a> および <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>`,
        acceptTermsAndConditions: `承諾します <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">利用規約</a>`,
        acceptTermsOfService: `承諾します <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>`,
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        send: '送信',
        na: 'N/A',
        noResultsFound: '結果が見つかりませんでした',
        noResultsFoundMatching: (searchString: string) => `「${searchString}」に一致する結果は見つかりませんでした。`,
        recentDestinations: '最近の目的地',
        timePrefix: 'それは',
        conjunctionFor: 'のために',
        todayAt: '今日',
        tomorrowAt: '明日',
        yesterdayAt: '昨日',
        conjunctionAt: 'で',
        conjunctionTo: 'に',
        genericErrorMessage: 'おっと...何か問題が発生し、リクエストを完了できませんでした。後でもう一度お試しください。',
        percentage: 'パーセンテージ',
        error: {
            invalidAmount: '無効な金額',
            acceptTerms: '続行するには、利用規約に同意する必要があります。',
            phoneNumber: `電話番号を完全に入力してください\n(例: ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'このフィールドは必須です',
            requestModified: 'このリクエストは他のメンバーによって変更されています。',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `文字数制限を超えました（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '今日または将来の日付を選択してください',
            invalidTimeShouldBeFuture: '少なくとも1分以上先の時間を選択してください。',
            invalidCharacter: '無効な文字',
            enterMerchant: '販売者名を入力してください',
            enterAmount: '金額を入力してください',
            missingMerchantName: 'マーチャント名がありません',
            missingAmount: '金額が不足しています',
            missingDate: '日付がありません',
            enterDate: '日付を入力してください',
            invalidTimeRange: '12時間制の形式で時間を入力してください（例：2:30 PM）',
            pleaseCompleteForm: '続行するには、上記のフォームにご記入ください。',
            pleaseSelectOne: '上記のオプションから選択してください',
            invalidRateError: '有効なレートを入力してください',
            lowRateError: 'レートは0より大きくなければなりません',
            email: '有効なメールアドレスを入力してください',
            login: 'ログイン中にエラーが発生しました。もう一度お試しください。',
        },
        comma: 'コンマ',
        semicolon: 'セミコロン',
        please: 'お願いします',
        contactUs: 'お問い合わせ',
        pleaseEnterEmailOrPhoneNumber: 'メールアドレスまたは電話番号を入力してください',
        fixTheErrors: 'エラーを修正してください。',
        inTheFormBeforeContinuing: '続行する前にフォームに入力してください',
        confirm: '確認',
        reset: 'リセット',
        done: '完了',
        more: 'もっと',
        debitCard: 'デビットカード',
        bankAccount: '銀行口座',
        personalBankAccount: '個人銀行口座',
        businessBankAccount: 'ビジネス銀行口座',
        join: '参加する',
        leave: '退出',
        decline: '辞退する',
        reject: '拒否する',
        transferBalance: '残高を移動',
        enterManually: '手動で入力してください。',
        message: 'メッセージ',
        leaveThread: 'スレッドを退出',
        you: 'あなた',
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: 'ヘルプが必要な場合は、Conciergeに連絡してください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を使用するには、インターネット接続が必要です。',
        attachmentWillBeAvailableOnceBackOnline: '添付ファイルはオンラインに戻ると利用可能になります。',
        errorOccurredWhileTryingToPlayVideo: 'このビデオを再生しようとしたときにエラーが発生しました。',
        areYouSure: 'よろしいですか？',
        verify: '確認する',
        yesContinue: 'はい、続けてください。',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        createdBy: '作成者',
        with: 'と',
        shareCode: 'コードを共有',
        share: '共有',
        per: 'あたり',
        mi: 'マイル',
        km: 'キロメートル',
        copied: 'コピーしました！',
        someone: '誰か',
        total: '合計',
        edit: '編集',
        letsDoThis: `やりましょう！`,
        letsStart: `始めましょう`,
        showMore: 'もっと見る',
        merchant: '商人',
        category: 'カテゴリー',
        report: 'レポート',
        billable: 'ビラブル',
        nonBillable: '非請求対象',
        tag: 'タグ',
        receipt: '領収書',
        verified: '確認済み',
        replace: '置換',
        distance: '距離',
        mile: 'マイル',
        miles: 'マイル',
        kilometer: 'キロメートル',
        kilometers: 'キロメートル',
        recent: '最近の',
        all: 'すべて',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: '通貨を選択',
        selectSymbolOrCurrency: 'シンボルまたは通貨を選択',
        card: 'カード',
        whyDoWeAskForThis: 'なぜこれを尋ねるのですか？',
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
        rate: '評価',
        emptyLHN: {
            title: 'やった！すべて完了しました。',
            subtitleText1: '以下を使用してチャットを見つける',
            subtitleText2: '上のボタンを押すか、以下を使用して何かを作成してください',
            subtitleText3: '下のボタン。',
        },
        businessName: 'ビジネス名',
        clear: 'クリア',
        type: 'タイプ',
        action: 'アクション',
        expenses: '経費',
        totalSpend: '総支出',
        tax: '税金',
        shared: '共有',
        drafts: '下書き',
        draft: '下書き',
        finished: '完了',
        upgrade: 'アップグレード',
        downgradeWorkspace: 'ワークスペースをダウングレードする',
        companyID: '会社ID',
        userID: 'ユーザーID',
        disable: '無効にする',
        export: 'エクスポート',
        initialValue: '初期値',
        currentDate: '現在の日付',
        value: '値段',
        downloadFailedTitle: 'ダウンロードに失敗しました',
        downloadFailedDescription: 'ダウンロードを完了できませんでした。後でもう一度お試しください。',
        filterLogs: 'ログをフィルター',
        network: 'ネットワーク',
        reportID: 'レポートID',
        longID: '長いID',
        withdrawalID: '出金ID',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        dropTitle: 'そのままにしておく',
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: '無視する',
        enabled: '有効',
        disabled: '無効',
        import: 'インポート',
        offlinePrompt: '現在、この操作を行うことはできません。',
        outstanding: '未処理',
        chats: 'チャット',
        tasks: 'タスク',
        unread: '未読',
        sent: '送信済み',
        links: 'リンク',
        day: '日',
        days: '日',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'スキップ',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `何か特定のものが必要ですか？アカウントマネージャーの${accountManagerDisplayName}とチャットしてください。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務用メールアドレス',
        destination: '目的地',
        subrate: 'サブレート',
        perDiem: '日当',
        validate: '検証する',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSVとしてダウンロード',
        help: '助けて',
        expenseReport: '経費報告書',
        expenseReports: '経費報告書',
        leaveWorkspace: 'ワークスペースから退出',
        leaveWorkspaceConfirmation: 'このワークスペースを退出すると、このワークスペースに経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを退出すると、そのレポートや設定を閲覧できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースを退出すると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、承認ワークフローでは、ワークスペースのオーナーである${workspaceOwner}があなたの代わりになります。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、あなたは優先エクスポート担当者として、ワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、技術連絡先はワークスペースのオーナーである${workspaceOwner}に引き継がれます。`,
        leaveWorkspaceReimburser:
            'あなたは精算担当者であるため、このワークスペースを退出できません。Workspaces > 支払いを行うまたは追跡する で新しい精算担当者を設定してから、もう一度お試しください。',
        rateOutOfPolicy: 'ポリシー外のレート',
        reimbursable: '払い戻し可能',
        editYourProfile: 'プロフィールを編集',
        comments: 'コメント',
        sharedIn: '共有済み',
        unreported: '未報告',
        explore: '探索',
        todo: 'やることリスト',
        invoice: '請求書',
        expense: '経費',
        chat: 'チャット',
        task: 'タスク',
        trip: '旅行',
        apply: '適用',
        status: 'ステータス',
        on: 'オン',
        before: '前',
        after: '後',
        reschedule: '再スケジュールする',
        general: '一般',
        workspacesTabTitle: 'ワークスペース',
        headsUp: 'ご注意ください！',
        submitTo: '送信先',
        forwardTo: '転送先',
        merge: 'マージ',
        none: 'なし',
        unstableInternetConnection: 'インターネット接続が不安定です。ネットワークを確認してもう一度お試しください。',
        enableGlobalReimbursements: 'グローバル払い戻しを有効にする',
        purchaseAmount: '購入金額',
        frequency: '頻度',
        link: 'リンク',
        pinned: '固定済み',
        read: '既読',
        copyToClipboard: 'クリップボードにコピー',
        thisIsTakingLongerThanExpected: '予想より時間がかかっています...',
        domains: 'ドメイン',
        reportName: 'レポート名',
        showLess: '表示を減らす',
        actionRequired: 'アクションが必要',
    },
    supportalNoAccess: {
        title: 'ちょっと待ってください',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `サポートがログインしているときにこのアクションを実行する権限がありません（コマンド: ${command ?? ''}）。Successがこのアクションを実行できるべきだと思われる場合は、Slackで会話を開始してください。`,
    },
    lockedAccount: {
        title: 'アカウントがロックされました',
        description: 'このアカウントはロックされているため、この操作を完了することはできません。次のステップについては、concierge@expensify.com にお問い合わせください。',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: 'あなたの位置情報を見つけることができませんでした。もう一度お試しいただくか、住所を手動で入力してください。',
        permissionDenied: '位置情報へのアクセスが拒否されたようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可する',
        tryAgain: 'そしてもう一度試してください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: '電話から連絡先をインポートして、お気に入りの人々にいつでも簡単にアクセスできるようにしましょう。',
        importContactsExplanation: 'これで、お気に入りの人々が常にワンタップでアクセスできます。',
        importContactsNativeText: 'あと一歩です！連絡先のインポートを許可してください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する。',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラアクセス',
        expensifyDoesNotHaveAccessToCamera: 'Expensifyはカメラへのアクセスがないと写真を撮ることができません。設定をタップして権限を更新してください。',
        attachmentError: '添付ファイルエラー',
        errorWhileSelectingAttachment: '添付ファイルを選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択中にエラーが発生しました。別のファイルを試してください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが24MBの制限を超えています。',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `添付ファイルのサイズが ${maxUploadSizeInMB} MB の制限を超えています。`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイト以上である必要があります。',
        wrongFileType: '無効なファイルタイプ',
        notAllowedExtension: 'このファイルタイプは許可されていません。別のファイルタイプをお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルを試してください。',
        protectedPDFNotSupported: 'パスワード保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズ変更されています。フル解像度でダウンロードしてください。',
        attachmentImageTooLarge: 'この画像はアップロード前にプレビューするには大きすぎます。',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `一度にアップロードできるファイルは${fileLimit}個までです。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルが ${maxUploadSizeInMB} MB を超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルは${maxUploadSizeInMB}MB未満である必要があります。それより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度に最大30枚の領収書をアップロードできます。超過分はアップロードされません。',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType}ファイルはサポートされていません。サポートされているファイルタイプのみがアップロードされます。`,
        learnMoreAboutSupportedFiles: 'サポートされているフォーマットについて詳しく知る。',
        passwordProtected: 'パスワード保護されたPDFはサポートされていません。サポートされているファイルのみがアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
        addReceipt: '領収書を追加',
        scanReceipts: '領収書をスキャンする',
        replaceReceipt: '領収書を置き換える',
    },
    filePicker: {
        fileError: 'ファイルエラー',
        errorWhileSelectingFile: 'ファイルを選択中にエラーが発生しました。もう一度お試しください。',
    },
    connectionComplete: {
        title: '接続完了',
        supportingText: 'このウィンドウを閉じて、Expensifyアプリに戻ることができます。',
    },
    avatarCropModal: {
        title: '写真を編集',
        description: '画像を好きなようにドラッグ、ズーム、回転してください。',
    },
    composer: {
        noExtensionFoundForMimeType: 'MIMEタイプに対応する拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像の取得に問題が発生しました。',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `コメントの最大長は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `タスクタイトルの最大長は${formattedMaxLength}文字です。`,
    },
    baseUpdateAppModal: {
        updateApp: 'アプリを更新',
        updatePrompt: 'このアプリの新しいバージョンが利用可能です。  \n今すぐ更新するか、後でアプリを再起動して最新の変更をダウンロードしてください。',
    },
    deeplinkWrapper: {
        launching: 'Expensifyを起動中',
        expired: 'セッションの有効期限が切れました。',
        signIn: 'もう一度サインインしてください。',
        redirectedToDesktopApp: 'デスクトップアプリにリダイレクトしました。',
        youCanAlso: 'あなたもできます',
        openLinkInBrowser: 'このリンクをブラウザで開いてください。',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `${email}としてログインしています。このアカウントでデスクトップアプリにログインするには、プロンプトの「リンクを開く」をクリックしてください。`,
        doNotSeePrompt: 'プロンプトが見えませんか？',
        tryAgain: 'もう一度試してください。',
        or: '、または',
        continueInWeb: 'ウェブアプリに進む',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            アブラカダブラ、
            サインイン完了！
        `),
        successfulSignInDescription: '元のタブに戻って続行してください。',
        title: 'こちらがあなたのマジックコードです',
        description: dedent(`
            最初にリクエストしたデバイスで
            表示されたコードを入力してください
        `),
        doNotShare: dedent(`
            コードは誰にも教えないでください。
            Expensify がそれを求めることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここでサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻り、新しいコードをリクエストしてください。',
        successfulNewCodeRequest: 'コードが要求されました。デバイスを確認してください。',
        tfaRequiredTitle: dedent(`
            二要素認証
            必須
        `),
        tfaRequiredDescription: dedent(`
            サインインしようとしている場所で
            二要素認証コードを入力してください。
        `),
        requestOneHere: 'こちらでリクエストしてください。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支払い元',
        whatsItFor: '何のためですか？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '名前、メールアドレス、または電話番号',
        findMember: 'メンバーを見つける',
        searchForSomeone: '誰かを検索',
    },
    customApprovalWorkflow: {
        title: 'カスタム承認ワークフロー',
        description: 'お客様の会社では、このワークスペースにカスタム承認ワークフローがあります。Expensify Classicでこの操作を実行してください',
        goToExpensifyClassic: 'Expensify Classicに切り替える',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を提出し、チームに紹介する',
            subtitleText: 'あなたのチームにもExpensifyを使ってもらいたいですか？経費を提出するだけで、あとは私たちにお任せください。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '通話を予約する',
    },
    hello: 'こんにちは',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '以下を開始してください。',
        anotherLoginPageIsOpen: '別のログインページが開いています。',
        anotherLoginPageIsOpenExplanation: 'ログインページを別のタブで開きました。そのタブからログインしてください。',
        welcome: 'ようこそ！',
        welcomeWithoutExclamation: 'ようこそ',
        phrase2: 'お金は語る。そして、チャットと支払いが一つの場所にある今、それは簡単です。',
        phrase3: 'あなたの支払いは、あなたが要点を伝えるのと同じくらい速く届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}、ここで新しい顔を見るのはいつも嬉しいです！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `${login}に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
    },
    login: {
        hero: {
            header: 'チャットの速度で旅行と経費を管理',
            body: 'コンテキストに基づいたリアルタイムチャットの助けを借りて、旅行と経費がより迅速に進む次世代のExpensifyへようこそ。',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `${email}として既にサインインしています。`,
        goBackMessage: ({provider}: GoBackMessageParams) => `${provider}でサインインしたくないですか？`,
        continueWithMyCurrentSession: '現在のセッションを続ける',
        redirectToDesktopMessage: 'サインインが完了すると、デスクトップアプリにリダイレクトします。',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでログインを続ける：',
        orContinueWithMagicCode: 'マジックコードでサインインすることもできます。',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: '魔法コードを使用する',
        launching: '起動中...',
        oneMoment: '会社のシングルサインオンポータルにリダイレクトするまで少々お待ちください。',
    },
    reportActionCompose: {
        dropToUpload: 'アップロードするにはドロップしてください',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何かを書いてください...',
        blockedFromConcierge: '通信は禁止されています。',
        fileUploadFailed: 'アップロードに失敗しました。ファイルがサポートされていません。',
        localTime: ({user, time}: LocalTimeParams) => `${user}のための${time}です`,
        edited: '(編集済み)',
        emoji: 'Emoji',
        collapse: '折りたたむ',
        expand: '展開する',
    },
    reportActionContextMenu: {
        copyMessage: 'メッセージをコピー',
        copied: 'コピーしました！',
        copyLink: 'リンクをコピー',
        copyURLToClipboard: 'URLをクリップボードにコピー',
        copyEmailToClipboard: 'メールをクリップボードにコピー',
        markAsUnread: '未読としてマーク',
        markAsRead: '既読にする',
        editAction: ({action}: EditActionParams) => `${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '経費' : 'コメント'}を編集`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'コメント';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = '経費';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'レポート';
            }
            return `${type}を削除`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'コメント';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = '経費';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'レポート';
            }
            return `この${type}を削除してもよろしいですか?`;
        },
        onlyVisible: 'にのみ表示',
        replyInThread: 'スレッドで返信',
        joinThread: 'スレッドに参加する',
        leaveThread: 'スレッドを退出',
        copyOnyxData: 'Onyxデータをコピー',
        flagAsOffensive: '攻撃的として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクションしました',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>のパーティーを見逃したのだから、ここには何もない。`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `このチャットは、<strong>${domainRoom}</strong>ドメインのExpensifyメンバー全員とのチャットです。同僚とチャットしたり、ヒントを共有したり、質問したりするのにご利用ください。`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `<strong>${workspaceName}</strong>管理者とのチャットです。ワークスペースのセットアップなどについてチャットしてください。`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `このチャットは<strong>${workspaceName}</strong>のみんなと一緒です。重要なお知らせをするときに使ってください。`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>に関することなら何でもどうぞ。`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `このチャットは、<strong>${invoicePayer}</strong>と<strong>${invoiceReceiver}</strong>間の請求書用です。請求書を送信するには、+ ボタンを使用してください。`,
        beginningOfChatHistory: 'このチャットは',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `ここで<strong>${submitterDisplayName}</strong>が<strong>${workspaceName}</strong>に経費を提出します。+ボタンをクリックしてください。`,
        beginningOfChatHistorySelfDM: 'これはあなたの個人スペースです。メモ、タスク、下書き、リマインダーに使用してください。',
        beginningOfChatHistorySystemDM: 'ようこそ！セットアップを始めましょう。',
        chatWithAccountManager: 'こちらでアカウントマネージャーとチャットしてください',
        sayHello: 'こんにちは！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `${roomName}へようこそ！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => ` + ボタンを使用して経費を${additionalText}します。`,
        askConcierge: '質問をして、24時間365日リアルタイムサポートを受けましょう。',
        conciergeSupport: '24時間年中無休サポート',
        create: '作成する',
        iouTypes: {
            pay: '支払う',
            split: '分割',
            submit: '送信',
            track: '追跡する',
            invoice: '請求書',
        },
    },
    adminOnlyCanPost: 'このルームでは管理者のみがメッセージを送信できます。',
    reportAction: {
        asCopilot: 'のコパイロットとして',
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話の全員に通知する',
    },
    newMessages: '新しいメッセージ',
    latestMessages: '最新のメッセージ',
    youHaveBeenBanned: '注意: このチャンネルでのチャットは禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中...',
        multipleMembers: '複数のメンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `このチャットは${displayName}がアカウントを閉じたため、もうアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `このチャットは、${oldDisplayName}がアカウントを${displayName}と統合したため、もうアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>が${policyName}ワークスペースのメンバーではなくなったため、アクティブではありません。`
                : `このチャットは、${displayName}が${policyName}ワークスペースのメンバーでなくなったため、アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、もうアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、もうアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'この予約はアーカイブされています。',
    },
    writeCapabilityPage: {
        label: '誰が投稿できますか',
        writeCapability: {
            all: 'すべてのメンバー',
            admins: '管理者のみ',
        },
    },
    sidebarScreen: {
        buttonFind: '何かを見つける...',
        buttonMySettings: '私の設定',
        fabNewChat: 'チャットを開始',
        fabNewChatExplained: 'チャットを開始 (フローティングアクション)',
        fabScanReceiptExplained: 'レシートをスキャン（フローティングアクション）',
        chatPinned: 'チャットがピン留めされました',
        draftedMessage: '下書きメッセージ',
        listOfChatMessages: 'チャットメッセージのリスト',
        listOfChats: 'チャットのリスト',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
        redirectToExpensifyClassicModal: {
            title: '近日公開',
            description: '私たちは、あなたの特定のセットアップに対応するためにNew Expensifyのいくつかの部分を微調整しています。その間、Expensify Classicにアクセスしてください。',
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
        manual: 'マニュアル',
        scan: 'スキャン',
        map: '地図',
    },
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        import: 'スプレッドシートをインポート',
        dragAndDrop: '<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、以下のファイルを選択してください。対応フォーマット: .csv, .txt, .xls, および .xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、以下のファイルを選択してください。 <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細</a> をご覧ください。`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされている形式: .csv, .txt, .xls, および .xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。 <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細</a> をご覧ください。`,
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています。',
        column: ({name}: SpreadSheetColumnParams) => `列 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `おっと！必須フィールド（"${fieldName}"）がマッピングされていません。確認して再試行してください。`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `おっと！単一のフィールド（「${fieldName}」）を複数の列にマッピングしています。確認して再試行してください。`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `おっと！フィールド（"${fieldName}"）に1つ以上の空の値が含まれています。確認してもう一度お試しください。`,
        importSuccessfulTitle: 'インポートが成功しました',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} カテゴリーが追加されました。` : '1 カテゴリが追加されました。'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'メンバーが追加または更新されていません。';
            }
            if (added && updated) {
                return `${added} メンバー${added > 1 ? 's' : ''}が追加され、${updated} メンバー${updated > 1 ? 's' : ''}が更新されました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 人のメンバーが更新されました。` : '1名のメンバーが更新されました。';
            }
            return added > 1 ? `${added} 人のメンバーが追加されました。` : '1人のメンバーが追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} タグが追加されました。` : '1 つのタグが追加されました。'),
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} の日当が追加されました。` : '1つの日当料金が追加されました。',
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべてのフィールドが正しく入力されていることを確認し、再試行してください。問題が解決しない場合は、Conciergeに連絡してください。',
        importDescription: '以下のインポートされた列の横にあるドロップダウンをクリックして、スプレッドシートからマップするフィールドを選択してください。',
        sizeNotMet: 'ファイルサイズは0バイトより大きくなければなりません',
        invalidFileMessage:
            'アップロードしたファイルは空であるか、無効なデータが含まれています。ファイルが正しくフォーマットされ、必要な情報が含まれていることを確認してから、再度アップロードしてください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSVをダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードで追加される新しいワークスペースメンバーの詳細を以下で確認してください。既存のメンバーにはロールの更新や招待メッセージは送信されません。`,
            other: (count: number) =>
                `このアップロードで追加される${count}人の新しいワークスペースメンバーの詳細を以下で確認してください。既存のメンバーにはロールの更新や招待メッセージは送信されません。`,
        }),
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `またはここにドラッグ＆ドロップ`,
        desktopSubtitleMultiple: `またはここにドラッグ＆ドロップ`,
        alternativeMethodsTitle: '領収書を追加する別の方法:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>して携帯からスキャン</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を <a href="mailto:${email}">${email}</a> に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">電話番号を追加</a>して ${phoneNumber} にテキスト送信</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>領収書を ${phoneNumber} にテキスト送信（米国の番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: '領収書の写真を撮るためにカメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセスがまだ許可されていません。以下の手順に従ってください。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">これらの手順</a>.`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真を撮る際にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスは、どこに行ってもタイムゾーンと通貨を正確に保つのに役立ちます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスは、どこに行ってもタイムゾーンと通貨を正確に保つのに役立ちます。',
        allowLocationFromSetting: `位置情報へのアクセスは、どこに行ってもタイムゾーンと通貨を正確に保つのに役立ちます。デバイスの権限設定から位置情報へのアクセスを許可してください。`,
        dropTitle: 'そのままにしておく',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'この領収書を削除してもよろしいですか？',
        addReceipt: '領収書を追加',
        scanFailed: '販売者、日付、または金額が不足しているため、レシートをスキャンできませんでした。',
    },
    quickAction: {
        scanReceipt: '領収書をスキャン',
        recordDistance: '距離を追跡する',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: 'レシートを分割',
        splitDistance: '距離を分割',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? '誰か'}`,
        assignTask: 'タスクを割り当てる',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイックアクションの宛先へのアクセス権がなくなりました。以下から新しいものを選んでください。',
        updateDestination: '送信先を更新する',
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
        } = {}) => (formattedAmount ? `${formattedAmount} を承認する` : '承認する'),
        approved: '承認済み',
        cash: '現金',
        card: 'カード',
        original: 'オリジナル',
        split: '分割',
        splitExpense: '経費を分割',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${merchant}から${amount}`,
        addSplit: '分割を追加',
        makeSplitsEven: '分割を均等にする',
        editSplits: '分割を編集',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}多いです。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${merchant}の${amount}を編集`,
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには少なくとも1つ追加してください。',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払済みの経費は編集できません',
        removeSplit: '分割を削除',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'}に支払う`,
        expense: '経費',
        categorize: 'カテゴリー分けする',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '距離を追跡する',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `${expensesNumber}件の経費を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'このレシートを削除しますか？この操作は元に戻せません。',
        addExpense: '経費を追加',
        chooseRecipient: '受取人を選択',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}の経費を作成`,
        confirmDetails: '詳細を確認',
        pay: '支払う',
        cancelPayment: '支払いをキャンセルする',
        cancelPaymentConfirmation: 'この支払いをキャンセルしてもよろしいですか？',
        viewDetails: '詳細を表示',
        pending: '保留中',
        canceled: 'キャンセルされました',
        posted: '投稿済み',
        deleteReceipt: '領収書を削除',
        findExpense: '経費を検索',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `経費を削除しました (${merchant}の${amount})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `費用${reportName ? `${reportName} から` : ''}を移動しました`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `この経費${reportName ? `to <a href="${reportUrl}">${reportName}</a>` : ''}を移動しました`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費をあなたの<a href="${reportUrl}">個人スペース</a>に移動しました。`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `<a href="${newParentReportUrl}">${toPolicyName}</a> ワークスペースにこのレポートを移動しました`;
            }
            return `<a href="${movedReportUrl}">レポート</a> を <a href="${newParentReportUrl}">${toPolicyName}</a> ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: 'カード取引との一致待ちの領収書',
        pendingMatch: '保留中の一致',
        pendingMatchWithCreditCardDescription: '領収書がカード取引と一致待ちです。現金としてマークしてキャンセルしてください。',
        markAsCash: '現金としてマーク',
        routePending: 'ルートを保留中...',
        receiptScanning: () => ({
            one: '領収書をスキャン中...',
            other: '領収書をスキャン中...',
        }),
        scanMultipleReceipts: '複数の領収書をスキャンする',
        scanMultipleReceiptsDescription: 'すべての領収書を一度に撮影し、自分で詳細を確認するか、SmartScanに任せましょう。',
        receiptScanInProgress: '領収書のスキャン中',
        receiptScanInProgressDescription: '領収書のスキャン中です。後で確認するか、今すぐ詳細を入力してください。',
        removeFromReport: '領収書を削除',
        moveToPersonalSpace: '領収書を個人スペースに移動',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? '重複の可能性がある経費が特定されました。提出を有効にするために重複を確認してください。'
                : '重複の可能性がある経費が特定されました。承認を有効にするために重複を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '問題が見つかりました',
        }),
        fieldPending: '保留中...',
        defaultRate: 'デフォルトレート',
        receiptMissingDetails: '領収書に詳細が欠けています',
        missingAmount: '金額が不足しています',
        missingMerchant: '不足している商人',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のレシートはあなただけが見ることができます。後で確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。手動で詳細を入力してください。',
        transactionPendingDescription: '取引は保留中です。反映されるまでに数日かかる場合があります。',
        companyInfo: '会社情報',
        companyInfoDescription: '最初の請求書を送信する前に、もう少し詳細が必要です。',
        yourCompanyName: 'あなたの会社名',
        yourCompanyWebsite: 'あなたの会社のウェブサイト',
        yourCompanyWebsiteNote: 'ウェブサイトをお持ちでない場合は、代わりに会社のLinkedInまたはソーシャルメディアのプロフィールを提供できます。',
        invalidDomainError: '無効なドメインが入力されました。続行するには、有効なドメインを入力してください。',
        publicDomainError: 'パブリックドメインに入りました。続行するには、プライベートドメインを入力してください。',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} スキャン中`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} 件の保留中`);
            }
            return {
                one: statusText.length > 0 ? `1 経費 (${statusText.join(', ')})` : `1 経費`,
                other: (count: number) => (statusText.length > 0 ? `${count} 経費 (${statusText.join(', ')})` : `${count} 経費`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 経費',
                other: (count: number) => `${count} 経費`,
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
        settledExpensify: '支払済み',
        done: '完了',
        settledElsewhere: '他で支払い済み',
        individual: '個人',
        business: 'ビジネス',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensifyで${formattedAmount}を支払う` : `Expensifyで支払う`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount}を個人として支払う` : `個人口座で支払う`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `ウォレットで${formattedAmount}を支払う` : `ウォレットで支払う`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount}を支払う`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount}をビジネスとして支払う` : `ビジネス口座で支払う`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount}を支払い済みにマーク` : `支払い済みにマーク`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount}を個人口座（${last4Digits}）で支払い済み` : `個人口座で支払い済み`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount}をビジネス口座（${last4Digits}）で支払い済み` : `ビジネス口座で支払い済み`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${policyName}経由で${formattedAmount}を支払う` : `${policyName}経由で支払う`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `${amount}を銀行口座（${last4Digits}）で支払い済み` : `を銀行口座（${last4Digits}）で支払い済み`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `${amount}円が銀行口座（下４桁：${last4Digits}）で支払われました <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースのルール</a>による`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `個人口座・${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `ビジネス口座・${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} 請求書を送信`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `${comment} のために` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `提出済み${memo ? `、次のように言って ${memo}` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">送信の遅延</a>を通じて送信されました`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? `${comment} のために` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} を分割`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `${comment} のために` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `あなたの分割額 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} は ${amount}${comment ? `${comment} のために` : ''} を借りています。`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} の借金:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} が支払いました:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer}が${amount}を使いました`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} が使った金額:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} 承認済み:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} が ${amount} を承認しました`,
        payerSettled: ({amount}: PayerSettledParams) => `${amount} を支払いました`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount}を支払いました。支払いを受け取るには銀行口座を追加してください。`,
        automaticallyApproved: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `承認済み ${amount}`,
        approvedMessage: `承認済み`,
        unapproved: `未承認`,
        automaticallyForwarded: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        forwarded: `承認済み`,
        rejectedThisReport: 'このレポートを拒否しました',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `支払いを開始しましたが、${submitterDisplayName}が銀行口座を追加するのを待っています。`,
        adminCanceledRequest: '支払いをキャンセルしました',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `${submitterDisplayName}が30日以内にExpensifyウォレットを有効にしなかったため、${amount}の支払いをキャンセルしました。`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName}が銀行口座を追加しました。${amount}の支払いが行われました。`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}支払い済みにマークされました`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}ウォレットで支払い済み`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}は<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>を通じてExpensifyで支払いました。`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます。',
        changedTheExpense: '経費を変更しました',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `${translatedChangedField}を${newMerchant}に設定し、金額を${newAmountToDisplay}に設定しました。`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（以前は${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName}を${newValueToDisplay}（以前は${oldValueToDisplay}）に`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `${translatedChangedField}を${newMerchant}に変更しました（以前は${oldMerchant}）、これにより金額が${newAmountToDisplay}に更新されました（以前は${oldAmountToDisplay}）。`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースのルール</a>に基づいて` : 'ワークスペースのルールに基づく'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `${comment}用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} 送信済み${comment ? `${comment} のために` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `個人スペースから${workspaceName ?? `${reportName}とチャットする`}に経費を移動しました。`,
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => `支出をより適切に整理するために、${policyTagListName ?? 'aタグ'} を選択してください。`,
        categorySelection: '支出をより整理するためにカテゴリを選択してください。',
        error: {
            invalidCategoryLength: 'カテゴリ名が255文字を超えています。短くするか、別のカテゴリを選んでください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選んでください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidIntegerAmount: '続行する前にドルの金額を入力してください',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税額は${amount}です。`,
            invalidSplit: '分割の合計は総額と等しくなければなりません。',
            invalidSplitParticipants: '少なくとも2人の参加者に対して、ゼロより大きい金額を入力してください。',
            invalidSplitYourself: '分割のためにゼロ以外の金額を入力してください。',
            noParticipantSelected: '参加者を選択してください',
            other: '予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateFailureMessage: 'この経費を提出する際に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留する際に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留を解除する際に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptDeleteFailureError: 'この領収書の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage: `<rbr>領収書のアップロード中にエラーが発生しました。<a href="download">領収書を保存</a>し、<a href="retry">もう一度お試しください</a> 後で。</rbr>`,
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            genericDeleteFailureMessage: 'この経費を削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: 'トランザクションにフィールドが欠けています',
            duplicateWaypointsErrorMessage: '重複するウェイポイントを削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも2つの異なる住所を入力してください。',
            splitExpenseMultipleParticipantsErrorMessage: '経費はワークスペースと他のメンバーの間で分割することはできません。選択を更新してください。',
            invalidMerchant: '有効な商人を入力してください',
            atLeastOneAttendee: '少なくとも1人の参加者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量はゼロより大きくなければなりません',
            invalidSubrateLength: '少なくとも1つのサブレートが必要です',
            invalidRate: 'このワークスペースでは有効なレートではありません。ワークスペースから利用可能なレートを選択してください。',
        },
        dismissReceiptError: 'エラーを無視する',
        dismissReceiptErrorConfirmation: 'ご注意ください！このエラーを無視すると、アップロードした領収書が完全に削除されます。本当に実行しますか？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `精算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留されます。`,
        enableWallet: 'ウォレットを有効にする',
        hold: '保留',
        unhold: '保留を解除',
        holdExpense: () => ({
            one: '経費を保留',
            other: '経費を保留',
        }),
        unholdExpense: '経費の保留を解除',
        heldExpense: 'この経費を保留しました',
        unheldExpense: 'この経費を未保留にする',
        moveUnreportedExpense: '未報告の経費を移動',
        addUnreportedExpense: '未報告の経費を追加',
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1つ選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。以下で新しく作成してみてください。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留にしている理由を説明してください。',
            other: 'これらの経費を保留にしている理由を説明してください。',
        }),
        retracted: '撤回されました',
        retract: '取り消す',
        reopened: '再開されました',
        reopenReport: 'レポートを再開する',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}にエクスポートされています。変更するとデータの不一致が生じる可能性があります。本当にこのレポートを再開しますか？`,
        reason: '理由',
        holdReasonRequired: '保留する際には理由が必要です。',
        expenseWasPutOnHold: '経費は保留されました',
        expenseOnHold: 'この経費は保留されています。次のステップについてはコメントを確認してください。',
        expensesOnHold: 'すべての経費が保留になりました。次のステップについてコメントを確認してください。',
        expenseDuplicate: 'この経費は他のものと類似した詳細があります。続行するには重複を確認してください。',
        someDuplicatesArePaid: 'これらの重複の一部はすでに承認または支払済みです。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて保持',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認します。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払い金額を確認',
        confirmPayAmount: '保留されていないものを支払うか、レポート全体を支払う。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費は保留にしますか？',
        whatIsHoldExplain: '保留とは、経費の提出準備が整うまで「一時停止」する機能です。',
        holdIsLeftBehind: '保留中の経費は、レポート全体を提出しても除外されます。',
        unholdWhenReady: '提出準備が整ったら、経費の保留を解除してください。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースに移動する際に変更される傾向があるこれらの項目を再確認してください。',
            reCategorize: '<strong>ワークスペースのルールに従うように、すべての経費を再分類してください</strong>。',
            workflows: 'このレポートは、別の<strong>承認ワークフロー</strong>の対象になる可能性があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: 'set',
        changed: '変更されました',
        removed: 'removed',
        transactionPending: '取引保留中。',
        chooseARate: 'ワークスペースの払い戻し率をマイルまたはキロメートルごとに選択',
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: '注意！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `このレポートはすでに${accountingIntegration}にエクスポートされています。変更するとデータの不整合が生じる可能性があります。本当にこのレポートの承認を取り消しますか？`,
        reimbursable: '払い戻し可能',
        nonReimbursable: '払い戻し不可',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約はまだ支払いが行われていないため、保留中です。',
        bookingArchived: 'この予約はアーカイブされています',
        bookingArchivedDescription: 'この予約は旅行日が過ぎたためアーカイブされています。必要に応じて最終金額の経費を追加してください。',
        attendees: '参加者',
        whoIsYourAccountant: 'あなたの会計士は誰ですか?',
        paymentComplete: '支払いが完了しました',
        time: '時間',
        startDate: '開始日',
        endDate: '終了日',
        startTime: '開始時間',
        endTime: '終了時間',
        deleteSubrate: 'サブレートを削除',
        deleteSubrateConfirmation: 'このサブレートを削除してもよろしいですか？',
        quantity: '数量',
        subrateSelection: 'サブレートを選択し、数量を入力してください。',
        qty: '数量',
        firstDayText: () => ({
            one: `初日: 1時間`,
            other: (count: number) => `初日: ${count.toFixed(2)}時間`,
        }),
        lastDayText: () => ({
            one: `最終日: 1時間`,
            other: (count: number) => `最終日: ${count.toFixed(2)}時間`,
        }),
        tripLengthText: () => ({
            one: `旅行: 1日間`,
            other: (count: number) => `旅行: ${count}日間`,
        }),
        dates: '日付',
        rates: '料金',
        submitsTo: ({name}: SubmitsToParams) => `${name}に送信`,
        moveExpenses: () => ({one: '経費を移動', other: '経費を移動'}),
        reject: {
            educationalTitle: '保留しますか、それとも却下しますか？',
            educationalText: '経費を承認または支払う準備ができていない場合は、保留または却下できます。',
            holdExpenseTitle: '承認または支払いの前に詳細を確認するため、経費を保留にします。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたまま、他の経費を承認できます。',
            heldExpenseLeftBehindTitle: 'レポート全体を承認すると、保留中の経費は除外されます。',
            rejectExpenseTitle: '承認または支払うつもりのない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を拒否する理由を説明してください。',
            rejectReason: '却下の理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費は却下されました。問題を修正して解決済みとしてマークし、提出を可能にするのをお待ちしています。',
            reportActions: {
                rejectedExpense: 'この経費を却下しました',
                markedAsResolved: '却下理由を解決済みとしてマークしました',
            },
        },
        changeApprover: {
            title: '承認者を変更',
            subtitle: 'このレポートの承認者を変更するオプションを選択してください。',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `<a href="${workflowSettingLink}">ワークフロー設定</a>で、すべてのレポートの承認者を恒久的に変更することもできます。`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `<mention-user accountID="${managerID}"/> に承認者を変更しました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに承認者を追加します。',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '最終承認者として自分自身を割り当て、残りの承認者をスキップします。',
            },
            addApprover: {
                subtitle: '承認ワークフローの残りの部分を経由する前に、このレポートの追加の承認者を選択してください。',
            },
        },
        chooseWorkspace: 'ワークスペースを選択',
    },
    transactionMerge: {
        listPage: {
            header: '経費をマージ',
            noEligibleExpenseFound: 'マージ対象となる経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費とマージできる経費がありません。<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">マージ可能な経費</a>について詳しくはこちら。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">マージ対象の経費</a>を選択してください <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: '領収書を選択',
            pageTitle: '保存する領収書を選んでください：',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保存する詳細を選んでください：',
            noDifferences: 'トランザクション間に差異はありません',
            pleaseSelectError: ({field}: {field: string}) => `${field} を選択してください`,
            pleaseSelectAttendees: '参加者を選択してください',
            selectAllDetailsError: '続行する前にすべての詳細を選択してください。',
        },
        confirmationPage: {
            header: '詳細を確認',
            pageTitle: '保持する詳細を確認してください。保持しない詳細は削除されます。',
            confirmButton: '経費をマージ',
        },
    },
    share: {
        shareToExpensify: 'Expensifyに共有',
        messageInputLabel: 'メッセージ',
    },
    notificationPreferencesPage: {
        header: '通知設定',
        label: '新しいメッセージを通知する',
        notificationPreferences: {
            always: 'すぐに',
            daily: '毎日',
            mute: 'ミュート',
            hidden: '非表示',
        },
    },
    loginField: {
        numberHasNotBeenValidated: '番号が確認されていません。ボタンをクリックして、テキストで確認リンクを再送信してください。',
        emailHasNotBeenValidated: 'メールが確認されていません。ボタンをクリックして、テキストで確認リンクを再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を見る',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: '申し訳ありませんが、ワークスペースのアバターを削除する際に予期しない問題が発生しました。',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択した画像は、最大アップロードサイズの${maxUploadSizeInMB} MBを超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `${minHeightInPx}x${minWidthInPx}ピクセル以上、${maxHeightInPx}x${maxWidthInPx}ピクセル未満の画像をアップロードしてください。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `プロフィール写真は次のタイプのいずれかでなければなりません: ${allowedExtensions.join(', ')}。`,
    },
    modal: {
        backdropLabel: 'モーダルバックドロップ',
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望する代名詞',
        selectYourPronouns: 'あなたの代名詞を選択してください',
        selfSelectYourPronoun: '自分の代名詞を選択',
        emailAddress: 'メールアドレス',
        setMyTimezoneAutomatically: 'タイムゾーンを自動的に設定する',
        timezone: 'タイムゾーン',
        invalidFileMessage: '無効なファイルです。別の画像を試してください。',
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
            title: 'プライベート',
            subtitle: 'これらの詳細は旅行と支払いに使用されます。それらはあなたの公開プロフィールには表示されません。',
        },
    },
    securityPage: {
        title: 'セキュリティオプション',
        subtitle: '二要素認証を有効にして、アカウントを安全に保ちましょう。',
        goToSecurity: 'セキュリティページに戻る',
    },
    shareCodePage: {title: 'あなたのコード', subtitle: '個人用QRコードまたは紹介リンクを共有して、Expensifyにメンバーを招待しましょう。'},
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: 'オプションを表示するために検索',
    },
    contacts: {
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を使用するには、アカウントの確認が必要です。',
        validateAccount: 'アカウントを確認してください',
        helpText: ({email}: {email: string}) =>
            `Expensify にログインしたり領収書を送信したりする方法を追加できます。<br/><br/>領収書を <a href="mailto:${email}">${email}</a> に転送するメールアドレスを追加するか、電話番号を追加して領収書を 47777 にテキスト送信します（米国の番号のみ）。`,
        pleaseVerify: 'この連絡方法を確認してください。',
        getInTouch: 'この方法を使ってご連絡します。',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod}に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在のデフォルトの連絡方法です。削除する前に、別の連絡方法を選択し、「デフォルトに設定」をクリックする必要があります。',
        removeContactMethod: '連絡方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。しばらく待ってからもう一度お試しください。',
            validateSecondaryLogin: '無効または不正なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡方法の削除に失敗しました。サポートが必要な場合はConciergeにお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法を設定できませんでした。サポートが必要な場合はConciergeにお問い合わせください。',
            addContactMethod: 'この連絡方法の追加に失敗しました。サポートが必要な場合は、Conciergeにお問い合わせください。',
            enteredMethodIsAlreadySubmitted: 'この連絡方法はすでに存在します',
            passwordRequired: 'パスワードが必要です。',
            contactMethodRequired: '連絡方法が必要です',
            invalidContactMethod: '無効な連絡方法',
        },
        newContactMethod: '新しい連絡方法',
        goBackContactMethods: '連絡方法に戻る',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '彼 / 彼の / 彼を',
        heHimHisTheyThemTheirs: '彼 / 彼 / 彼の / 彼ら / 彼ら / 彼らの',
        sheHerHers: '彼女 / 彼女の / 彼女のもの',
        sheHerHersTheyThemTheirs: '彼女 / 彼女の / 彼女のもの / 彼ら / 彼らの / 彼らのもの',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'その人 / その人 / その人の',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '私の名前で呼んでください。',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '表示名',
        isShownOnProfile: '表示名はプロフィールに表示されます。',
    },
    timezonePage: {
        timezone: 'タイムゾーン',
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されます。',
        getLocationAutomatically: '自動的にあなたの位置を特定する',
    },
    updateRequiredView: {
        updateRequired: '更新が必要です',
        pleaseInstall: 'New Expensifyの最新バージョンにアップデートしてください。',
        pleaseInstallExpensifyClassic: 'Expensifyの最新バージョンをインストールしてください。',
        toGetLatestChanges: 'モバイルまたはデスクトップの場合、最新バージョンをダウンロードしてインストールしてください。ウェブの場合は、ブラウザをリフレッシュしてください。',
        newAppNotAvailable: '新しいExpensifyアプリはもう利用できません。',
    },
    initialSettingsPage: {
        about: '約',
        aboutPage: {
            description: '新しいExpensifyアプリは、世界中のオープンソース開発者のコミュニティによって構築されています。Expensifyの未来を一緒に築きましょう。',
            appDownloadLinks: 'アプリダウンロードリンク',
            viewKeyboardShortcuts: 'キーボードショートカットを表示',
            viewTheCode: 'コードを表示',
            viewOpenJobs: '求人情報を見る',
            reportABug: 'バグを報告する',
            troubleshoot: 'トラブルシュート',
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
                '<muted-text>Expensifyのトラブルシューティングには以下のツールをご利用ください。問題が発生した場合は、<concierge-link>バグをご報告</concierge-link>ください。</muted-text>',
            confirmResetDescription: '送信されていないすべての下書きメッセージは失われますが、その他のデータは安全です。',
            resetAndRefresh: 'リセットして更新',
            clientSideLogging: 'クライアントサイドのログ記録',
            noLogsToShare: '共有するログはありません',
            useProfiling: 'プロファイリングを使用する',
            profileTrace: 'プロファイルトレース',
            results: '結果',
            releaseOptions: 'リリースオプション',
            testingPreferences: '設定のテスト',
            useStagingServer: 'Stagingサーバーを使用',
            forceOffline: 'オフラインを強制する',
            simulatePoorConnection: 'インターネット接続が不安定です。',
            simulateFailingNetworkRequests: 'ネットワークリクエストの失敗をシミュレートする',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイス認証情報',
            invalidate: '無効にする',
            destroy: '破壊する',
            maskExportOnyxStateData: 'Onyx状態をエクスポートする際に脆弱なメンバーデータをマスクする',
            exportOnyxState: 'Onyxの状態をエクスポート',
            importOnyxState: 'Onyxステートをインポート',
            testCrash: 'クラッシュのテスト',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用しています。ここを押してクリアしてください。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルは無効です。もう一度お試しください。',
            invalidateWithDelay: '遅延で無効にする',
            recordTroubleshootData: 'トラブルシューティングデータの記録',
            softKillTheApp: 'アプリをソフトキル',
            kill: '殺す',
        },
        debugConsole: {
            saveLog: 'ログを保存',
            shareLog: 'ログを共有',
            enterCommand: 'コマンドを入力してください',
            execute: '実行する',
            noLogsAvailable: 'ログは利用できません',
            logSizeTooLarge: ({size}: LogSizeParams) => `ログサイズが${size} MBの制限を超えています。「ログを保存」を使用してログファイルをダウンロードしてください。`,
            logs: 'ログ',
            viewConsole: 'コンソールを表示',
        },
        security: 'セキュリティー',
        signOut: 'サインアウト',
        restoreStashed: '隠されたログインを復元',
        signOutConfirmationText: 'サインアウトすると、オフラインでの変更が失われます。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro><a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>をお読みください。</muted-text-micro>`,
        help: '助けて',
        whatIsNew: '新着情報',
        accountSettings: 'アカウント設定',
        account: 'アカウント',
        general: '一般',
    },
    closeAccountPage: {
        closeAccount: 'アカウントを閉じる',
        reasonForLeavingPrompt: 'お別れするのは残念です！改善のために、理由を教えていただけますか？',
        enterMessageHere: 'メッセージをここに入力してください。',
        closeAccountWarning: 'アカウントの閉鎖は元に戻せません。',
        closeAccountPermanentlyDeleteData: 'アカウントを削除してもよろしいですか？これにより、未処理の経費がすべて永久に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉じることを確認するために、デフォルトの連絡方法を入力してください。あなたのデフォルトの連絡方法は:',
        enterDefaultContact: 'デフォルトの連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法:',
        enterYourDefaultContactMethod: 'アカウントを閉じるために、デフォルトの連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合する',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `マージしたいアカウントを<strong>${login}</strong>に入力する。`,
            notReversibleConsent: 'これは元に戻せないことを理解しています。',
        },
        accountValidate: {
            confirmMerge: 'アカウントをマージしてもよろしいですか？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `アカウントの統合は不可逆的であり、<strong>${login}</strong>の未提出の経費は失われます。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `続行するには、<strong>${login}</strong>に送られたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: '無効または不正なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントが統合されました！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text><strong>${from}</strong>、<strong>${to}</strong> の全データのマージに成功しました。今後、このアカウントにはどちらのログインも使用できます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: '新しいExpensifyではアカウントの統合をまだサポートしていません。この操作はExpensify Classicで行ってください。',
            reachOutForHelp: '<muted-text><centered-text>ご質問は<concierge-link>Conciergeまでお</concierge-link>気軽にどうぞ！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classicに移動',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> は <strong>${email.split('@').at(1) ?? ''}</strong> によって管理されているため、マージできません。<concierge-link>Conciergeにご相談</concierge-link>ください。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>ドメイン管理者がプライマリログインとして設定しているため、<strong>${email}</strong> を他のアカウントに統合することはできません。代わりに他のアカウントをマージしてください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text><strong>${email}</strong>、二要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong>、2FAを無効にして再度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく学ぶ。',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているので、マージできない。<concierge-link>Conciergeにご相談</concierge-link>ください。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text><strong>${email}</strong> がExpensifyアカウントを持っていないため、アカウントを統合できません。代わりに<a href="${contactMethodLink}">連絡先として追加して</a>ください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに他のアカウントを統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>このアカウントは請求済みの請求リレーションシップを所有しているため、<strong>${email}</strong> にアカウントをマージすることはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください。',
            description: 'アカウントの統合を試みる回数が多すぎます。後でもう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '他のアカウントにマージできません。アカウントが検証されていないためです。アカウントを検証して、再度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: 'アカウントをそれ自体にマージすることはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '疑わしい活動を報告',
        lockAccount: 'アカウントをロックする',
        unlockAccount: 'アカウントをアンロック',
        compromisedDescription: 'アカウントに不安を感じましたか？報告すると、すぐにアカウントがロックされ、Expensifyカードの新しい取引が停止され、変更も防止されます。',
        domainAdminsDescription: 'ドメイン管理者へ：これにより、ドメイン全体のExpensifyカード活動と管理操作も一時停止されます。',
        areYouSure: '本当にExpensifyアカウントをロックしますか？',
        onceLocked: 'ロックされると、アカウントはロック解除リクエストとセキュリティレビューが完了するまで制限されます。',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `アカウントをロックできませんでした。この問題を解決するためにConciergeとチャットしてください。`,
        chatWithConcierge: 'Conciergeとチャットする',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'Conciergeとチャットしてセキュリティの懸念を解決し、アカウントのロックを解除してください。',
        chatWithConcierge: 'Conciergeとチャットする',
    },
    passwordPage: {
        changePassword: 'パスワードを変更する',
        changingYourPasswordPrompt: 'パスワードを変更すると、Expensify.com と New Expensify の両方のアカウントのパスワードが更新されます。',
        currentPassword: '現在のパスワード',
        newPassword: '新しいパスワード',
        newPasswordPrompt: '新しいパスワードは、古いパスワードと異なり、8文字以上で、1つの大文字、1つの小文字、および1つの数字を含める必要があります。',
    },
    twoFactorAuth: {
        headerTitle: '二要素認証',
        twoFactorAuthEnabled: '2要素認証が有効になりました',
        whatIsTwoFactorAuth: '二要素認証 (2FA) は、アカウントの安全性を保つのに役立ちます。ログイン時に、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '二要素認証を無効にする',
        explainProcessToRemove: '二要素認証 (2FA) を無効にするには、認証アプリから有効なコードを入力してください。',
        disabled: '二要素認証が無効になりました',
        noAuthenticatorApp: 'Expensifyにログインする際に認証アプリはもう必要ありません。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらのリカバリーコードを安全に保管してください！',
        codesLoseAccess: dedent(`
            認証アプリへのアクセスを失い、これらのコードもない場合、アカウントにアクセスできなくなります。

            注意: 二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーまたはダウンロードしてください。',
        stepVerify: '確認する',
        scanCode: 'QRコードを使用してスキャンしてください',
        authenticatorApp: '認証アプリ',
        addKey: 'または、このシークレットキーを認証アプリに追加してください。',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2要素認証が有効になりました',
        congrats: 'おめでとうございます！これで追加のセキュリティが確保されました。',
        copy: 'コピー',
        disable: '無効にする',
        enableTwoFactorAuth: '2要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '2要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ目的のため、Xeroは統合を接続するために二要素認証を必要とします。',
        twoFactorAuthIsRequiredForAdminsHeader: '二要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '2要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'Xero との会計連携には二要素認証が必要です。Expensify を引き続きご利用いただくには、二要素認証を有効にしてください。',
        twoFactorAuthCannotDisable: '2FAを無効にできません',
        twoFactorAuthRequired: 'Xeroの接続には二要素認証（2FA）が必要であり、無効にすることはできません。',
        explainProcessToRemoveWithRecovery: '二要素認証 (2FA) を無効にするには、有効なリカバリーコードを入力してください。',
        twoFactorAuthIsRequiredCompany: 'あなたの会社では二要素認証の使用が必須です。Expensifyを引き続きご利用いただくには、有効化してください。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'リカバリーコードを入力してください',
            incorrectRecoveryCode: '回復コードが間違っています。もう一度お試しください。',
        },
        useRecoveryCode: 'リカバリーコードを使用',
        recoveryCode: 'リカバリーコード',
        use2fa: '二要素認証コードを使用',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '2要素認証コードを入力してください',
            incorrect2fa: '二要素認証コードが間違っています。もう一度お試しください。',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'パスワードが更新されました！',
        allSet: '準備完了です。新しいパスワードを安全に保管してください。',
    },
    privateNotes: {
        title: 'プライベートメモ',
        personalNoteMessage: 'このチャットに関するメモをここに記録してください。メモを追加、編集、または表示できるのはあなただけです。',
        sharedNoteMessage: 'このチャットに関するメモをここに記録してください。Expensifyの従業員およびteam.expensify.comドメインの他のメンバーはこれらのメモを閲覧できます。',
        composerLabel: 'メモ',
        myNote: '私のメモ',
        error: {
            genericFailureMessage: 'プライベートノートを保存できませんでした。',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '有効なセキュリティコードを入力してください',
        },
        securityCode: 'セキュリティコード',
        changeBillingCurrency: '請求通貨を変更する',
        changePaymentCurrency: '支払い通貨を変更',
        paymentCurrency: '支払い通貨',
        paymentCurrencyDescription: 'すべての個人経費を変換する標準通貨を選択してください',
        note: `注: お支払いの通貨を変更すると、Expensifyのお支払いに影響する場合があります。詳しくは<a href="${CONST.PRICING}">価格ページ</a>をご覧ください。`,
    },
    addDebitCardPage: {
        addADebitCard: 'デビットカードを追加',
        nameOnCard: 'カード名義人',
        debitCardNumber: 'デビットカード番号',
        expiration: '有効期限',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '請求先住所',
        growlMessageOnSave: 'あなたのデビットカードが正常に追加されました',
        expensifyPassword: 'Expensifyパスワード',
        error: {
            invalidName: '名前には文字のみを含めることができます。',
            addressZipCode: '有効な郵便番号を入力してください',
            debitCardNumber: '有効なデビットカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: 'POボックスではない有効な請求先住所を入力してください。',
            addressState: '州を選択してください',
            addressCity: '都市を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensifyのパスワードを入力してください',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '支払いカードを追加',
        nameOnCard: 'カード名義人',
        paymentCardNumber: 'カード番号',
        expiration: '有効期限',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: '請求先住所',
        growlMessageOnSave: 'お支払いカードが正常に追加されました',
        expensifyPassword: 'Expensifyパスワード',
        error: {
            invalidName: '名前には文字のみを含めることができます。',
            addressZipCode: '有効な郵便番号を入力してください',
            paymentCardNumber: '有効なカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: 'POボックスではない有効な請求先住所を入力してください。',
            addressState: '州を選択してください',
            addressCity: '都市を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensifyのパスワードを入力してください',
        },
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払い方法',
        setDefaultConfirmation: 'デフォルトの支払い方法に設定する',
        setDefaultSuccess: 'デフォルトの支払い方法が設定されました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを削除してもよろしいですか？',
        error: {
            notOwnerOfBankAccount: 'この銀行口座をデフォルトの支払い方法として設定中にエラーが発生しました。',
            invalidBankAccount: 'この銀行口座は一時的に停止されています。',
            notOwnerOfFund: 'このカードをデフォルトの支払い方法として設定する際にエラーが発生しました。',
            setDefaultFailure: '問題が発生しました。詳細なサポートが必要な場合は、Conciergeにチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座を追加しようとした際に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: 'より早く支払いを受ける',
        addPaymentMethod: 'アプリ内で直接送受金を行うために支払い方法を追加してください。',
        getPaidBackFaster: 'より早く返金を受け取る',
        secureAccessToYourMoney: 'お金への安全なアクセス',
        receiveMoney: '現地通貨でお金を受け取る',
        expensifyWallet: 'Expensify Wallet（ベータ版）',
        sendAndReceiveMoney: '友達とお金を送受信する。米国の銀行口座のみ。',
        enableWallet: 'ウォレットを有効にする',
        addBankAccountToSendAndReceive: '支払いや受け取りを行うために銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        assignedCards: '割り当てられたカード',
        assignedCardsDescription: 'これらは、会社の支出を管理するためにワークスペース管理者によって割り当てられたカードです。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'お客様の情報を確認中です。数分後に再度ご確認ください！',
        walletActivationFailed: '残念ながら、現在ウォレットを有効にすることができません。さらなるサポートが必要な場合は、Conciergeにチャットしてください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: 'Expensifyに銀行口座を接続して、アプリ内での送金と受け取りをこれまで以上に簡単にしましょう。',
        chooseYourBankAccount: '銀行口座を選択してください',
        chooseAccountBody: '正しいものを選択してください。',
        confirmYourBankAccount: '銀行口座を確認してください',
        personalBankAccounts: '個人銀行口座',
        businessBankAccounts: 'ビジネス銀行口座',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: '残りの制限',
        smartLimit: {
            name: 'スマートリミット',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大${formattedLimit}まで使用でき、提出された経費が承認されると制限がリセットされます。`,
        },
        fixedLimit: {
            name: '固定限度額',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大${formattedLimit}まで利用でき、それ以降は無効になります。`,
        },
        monthlyLimit: {
            name: '月間制限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは、月に最大${formattedLimit}まで使用できます。この制限は、毎月の1日にリセットされます。`,
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: 'トラベルカードCVV',
        physicalCardNumber: '物理カード番号',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカード詐欺を報告する',
        reportTravelFraud: 'トラベルカード詐欺を報告する',
        reviewTransaction: '取引を確認する',
        suspiciousBannerTitle: '不審な取引',
        physicalCardPin: 'PIN',
        suspiciousBannerDescription: 'あなたのカードで不審な取引が検出されました。確認するには下をタップしてください。',
        cardLocked: 'お客様のカードは、当社のチームが貴社のアカウントを確認している間、一時的にロックされています。',
        cardDetails: {
            cardNumber: 'バーチャルカード番号',
            expiration: '有効期限',
            cvv: 'CVV',
            address: '住所',
            revealDetails: '詳細を表示',
            revealCvv: 'CVVを表示',
            copyCardNumber: 'カード番号をコピー',
            updateAddress: '住所を更新',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `${platform}ウォレットに追加されました`,
        cardDetailsLoadingFailure: 'カードの詳細を読み込む際にエラーが発生しました。インターネット接続を確認して、もう一度お試しください。',
        validateCardTitle: 'あなたであることを確認しましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `カードの詳細を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">個人情報を追加</a>してから、もう一度お試しください。`,
        unexpectedError: 'Expensifyカードの詳細を取得しようとしてエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです。',
            reportFraudButtonText: 'いいえ、それは私ではありませんでした。',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審な活動をクリアし、カードx${cardLastFour}を再有効化しました。経費精算を続ける準備が整いました！`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `${cardLastFour}で終わるカードを無効にしました。`,
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
            }) => `カードの末尾が${cardLastFour}のカードで不審な活動が確認されました。この請求を認識していますか？

${date} - ${merchant}に${amount}`,
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認および支払いを含むワークフローを設定します。',
        submissionFrequency: '提出頻度',
        submissionFrequencyDescription: '経費を提出する頻度を選択します。',
        disableApprovalPromptDescription: '承認を無効にすると、既存の承認ワークフローがすべて削除されます。',
        submissionFrequencyDateOfMonth: '月の日付',
        addApprovalsTitle: '承認を追加',
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'このデフォルトのワークフローは、より具体的なワークフローが存在しない限り、すべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に追加の承認が必要です。',
        makeOrTrackPaymentsTitle: '支払いを行うまたは追跡する',
        makeOrTrackPaymentsDescription: 'Expensifyでの支払いのために認可された支払者を追加するか、他の場所で行われた支払いを追跡します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースでは、カスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>コンシェルジュ</concierge-link>にお問い合わせください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースでは、カスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>コンシェルジュ</concierge-link>にお問い合わせください。</muted-text-label>',
        editor: {
            submissionFrequency: 'Expensifyがエラーフリーの支出を共有するまでの待機時間を選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動で行うように設定してください。',
        frequencies: {
            instant: '即座に',
            weekly: '毎週',
            monthly: '毎月',
            twiceAMonth: '月に2回',
            byTrip: '旅行ごとに',
            manually: '手動で',
            daily: '毎日',
            lastDayOfMonth: '月末最終日',
            lastBusinessDayOfMonth: '月の最終営業日',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '最初',
                '2': '2番目',
                '3': '3番目',
                '4': '4番目',
                '5': '5番目',
                '6': '6番目',
                '7': 'セブンス',
                '8': '8番目',
                '9': '9番目',
                '10': '10番目',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに属しています。ここでの更新はそちらにも反映されます。',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。循環ワークフローを避けるために、別の承認者を選んでください。`,
        emptyContent: {
            title: '表示するメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは既存の承認ワークフローにすでに属しています。',
            approverSubtitle: 'すべての承認者は既存のワークフローに属しています。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '提出頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        monthlyOffsetErrorMessage: '月次の頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
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
        deletePrompt: 'この承認ワークフローを削除してもよろしいですか？すべてのメンバーはその後、デフォルトのワークフローに従います。',
    },
    workflowsExpensesFromPage: {
        title: 'からの経費',
        header: '次のメンバーが経費を提出したとき:',
    },
    workflowsApproverPage: {
        genericErrorMessage: '承認者を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        header: 'このメンバーに承認を依頼する:',
    },
    workflowsPayerPage: {
        title: '承認された支払者',
        genericErrorMessage: '承認された支払者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払者',
        paymentAccount: '支払いアカウント',
    },
    reportFraudPage: {
        title: 'バーチャルカード詐欺を報告する',
        description: 'バーチャルカードの詳細が盗まれたり、不正に使用されたりした場合、既存のカードを永久に無効化し、新しいバーチャルカードと番号を提供します。',
        deactivateCard: 'カードを無効化する',
        reportVirtualCardFraud: 'バーチャルカード詐欺を報告する',
    },
    reportFraudConfirmationPage: {
        title: 'カード詐欺が報告されました',
        description: '既存のカードは永久に無効化されました。カードの詳細を確認すると、新しいバーチャルカードが利用可能になっています。',
        buttonText: '了解しました、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化する',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: '物理カードを有効化する',
        error: {
            thatDidNotMatch: 'それはカードの最後の4桁と一致しませんでした。もう一度お試しください。',
            throttled:
                'Expensifyカードの最後の4桁を間違えて入力しました。数字が正しいと確信している場合は、Conciergeに連絡して解決してください。それ以外の場合は、後でもう一度試してください。',
        },
    },
    getPhysicalCard: {
        header: '物理カードを取得',
        nameMessage: 'カードに表示されるため、名前と姓を入力してください。',
        legalName: '法的氏名',
        legalFirstName: '法的な名前',
        legalLastName: '法的な姓',
        phoneMessage: '電話番号を入力してください。',
        phoneNumber: '電話番号',
        address: '住所',
        addressMessage: '配送先住所を入力してください。',
        streetAddress: '住所',
        city: '市',
        state: '状態',
        zipPostcode: '郵便番号',
        country: '国',
        confirmMessage: '以下の詳細を確認してください。',
        estimatedDeliveryMessage: 'あなたの物理カードは2～3営業日で届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'インスタント（デビットカード）',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% 手数料（最低 ${minAmount}）`,
        ach: '1～3営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どのアカウントですか？',
        fee: '料金',
        transferSuccess: '振込が成功しました！',
        transferDetailBankAccount: 'あなたのお金は、次の1～3営業日以内に到着するはずです。',
        transferDetailDebitCard: 'あなたのお金はすぐに届くはずです。',
        failedTransfer: '残高が完全に清算されていません。銀行口座に振り込んでください。',
        notHereSubTitle: 'ウォレットページから残高を移動してください。',
        goToWallet: 'ウォレットに移動',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'アカウントを選択',
    },
    paymentMethodList: {
        addPaymentMethod: 'お支払い方法を追加',
        addNewDebitCard: '新しいデビットカードを追加',
        addNewBankAccount: '新しい銀行口座を追加',
        accountLastFour: '終了',
        cardLastFour: '末尾が',
        addFirstPaymentMethod: 'アプリ内で直接送受金を行うために支払い方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `銀行口座・${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: '設定をテストする',
            subtitle: 'ステージングでアプリをデバッグおよびテストするための設定。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する機能のアップデートやExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensifyからのすべての音をミュートする',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読およびピン留めされたチャットのみを#focusするか、すべてを表示して最新およびピン留めされたチャットを上部に表示するかを選択します。',
        priorityModes: {
            default: {
                label: '最新',
                description: 'すべてのチャットを最新順に表示',
            },
            gsd: {
                label: '#focus',
                description: '未読のみをアルファベット順に表示',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `${policyName} 内`,
        generatingPDF: 'PDFを生成中...',
        waitForPDF: 'PDFを生成するまでお待ちください',
        errorPDF: 'PDFの生成中にエラーが発生しました。',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: '部屋の説明（任意）',
        explainerText: '部屋のカスタム説明を設定します。',
    },
    groupChat: {
        lastMemberTitle: '注意！',
        lastMemberWarning: 'あなたが最後の一人なので、退出するとこのチャットはすべてのメンバーにアクセスできなくなります。本当に退出しますか？',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}のグループチャット`,
    },
    languagePage: {
        language: '言語',
        aiGenerated: 'この言語の翻訳は自動的に生成されており、エラーが含まれている可能性があります。',
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
                label: 'デバイス設定を使用',
            },
        },
        chooseThemeBelowOrSync: '以下のテーマを選択するか、デバイスの設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすることで、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `<muted-text-xs>送金は${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010)の<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">ライセンス</a>に基づき提供される。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: 'リカバリーコードを入力してください',
        requiredWhen2FAEnabled: '2FAが有効になっている場合に必要',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `<a>${timeRemaining}</a>後に新しいコードをリクエストしてください`,
        requestNewCodeAfterErrorOccurred: '新しいコードをリクエストする',
        error: {
            pleaseFillMagicCode: 'マジックコードを入力してください',
            incorrectMagicCode: '無効または不正なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            pleaseFillTwoFactorAuth: '2要素認証コードを入力してください',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'すべてのフィールドに記入してください',
        pleaseFillPassword: 'パスワードを入力してください',
        pleaseFillTwoFactorAuth: '2要素認証コードを入力してください',
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには、二要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2FAが有効になっている場合に必要',
        error: {
            incorrectPassword: 'パスワードが間違っています。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログインまたはパスワードが間違っています。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが間違っています。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントには2FAが有効になっています。メールアドレスまたは電話番号を使用してサインインしてください。',
            invalidLoginOrPassword: 'ログインまたはパスワードが無効です。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。これは、古いパスワードリセットメール内のパスワードリセットリンクが期限切れになっている可能性があります。再試行できるように、新しいリンクをメールでお送りしました。受信トレイと迷惑メールフォルダを確認してください。数分以内に届くはずです。',
            noAccess: 'このアプリケーションへのアクセス権がありません。アクセスを得るためにGitHubのユーザー名を追加してください。',
            accountLocked: '複数回のログイン失敗により、アカウントがロックされました。1時間後に再度お試しください。',
            fallback: '問題が発生しました。後でもう一度お試しください。',
        },
    },
    loginForm: {
        phoneOrEmail: '電話またはメールアドレス',
        error: {
            invalidFormatEmailLogin: '入力されたメールアドレスが無効です。形式を修正してもう一度お試しください。',
        },
        cannotGetAccountDetails: 'アカウントの詳細を取得できませんでした。もう一度サインインしてください。',
        loginForm: 'ログインフォーム',
        notYou: ({user}: NotYouParams) => `${user}ではありませんか？`,
    },
    onboarding: {
        welcome: 'ようこそ！',
        welcomeSignOffTitleManageTeam: '上記のタスクが完了したら、承認ワークフローやルールなどの機能をさらに探求できます！',
        welcomeSignOffTitle: 'お会いできて嬉しいです！',
        explanationModal: {
            title: 'Expensifyへようこそ',
            description: 'チャットのスピードでビジネスと個人の支出を管理するための1つのアプリ。ぜひお試しいただき、ご意見をお聞かせください。もっと多くの機能が登場予定です！',
            secondaryDescription: 'Expensify Classicに戻るには、プロフィール写真をタップして > Expensify Classicに移動します。',
        },
        getStarted: '始めましょう',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: 'あなたが知っている人々はすでにここにいます！メールを確認して参加しましょう。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `${domain} の誰かがすでにワークスペースを作成しています。${email} に送信されたマジックコードを入力してください。`,
        joinAWorkspace: 'ワークスペースに参加する',
        listOfWorkspaces: 'こちらが参加できるワークスペースのリストです。心配しないでください。後で参加することもできます。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 名のメンバー${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'どこで働いていますか？',
        errorSelection: '先に進むためのオプションを選択してください',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: 'セットアップを続行するには「続行」を押してください。',
            errorBackButton: 'アプリの使用を開始するためにセットアップの質問を完了してください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主から払い戻しを受ける',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '私のチームの経費を管理する',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '経費を追跡し、予算を管理する',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '友達とチャットして経費を分割する',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: '何か他のもの',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000人以上の従業員',
        },
        accounting: {
            title: '会計ソフトを使用していますか？',
            none: 'None',
        },
        interestedFeatures: {
            title: 'どの機能に興味がありますか？',
            featuresAlreadyEnabled: 'こちらは最も人気のある機能です：',
            featureYouMayBeInterestedIn: '追加機能を有効にする：',
        },
        error: {
            requiredFirstName: '続行するには、名前を入力してください。',
        },
        workEmail: {
            title: 'あなたの仕事用メールアドレスは何ですか？',
            subtitle: 'Expensifyは、職場のメールを接続すると最適に機能します。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.comに転送してスキャンする',
                descriptionTwo: 'Expensifyを既に利用している同僚に参加しましょう',
                descriptionThree: 'よりカスタマイズされた体験をお楽しみください',
            },
            addWorkEmail: '勤務用メールを追加',
        },
        workEmailValidation: {
            title: '勤務先のメールを確認してください',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `${workEmail} に送信されたマジックコードを入力してください。1、2分で届くはずです。`,
        },
        workEmailValidationError: {
            publicEmail: '有効なプライベートドメインの勤務用メールアドレスを入力してください。例: mitch@company.com',
            offline: 'オフラインのようなので、仕事用メールを追加できませんでした。',
        },
        mergeBlockScreen: {
            title: '勤務用メールを追加できませんでした。',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `${workEmail}を追加できませんでした。後で設定で再試行するか、ガイダンスが必要な場合はConciergeとチャットしてください。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を行う`,
                description: ({testDriveURL}) => `Expensifyが最も安い方法である理由を確かめるために、[クイックプロダクトツアー](${testDriveURL})をします。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を行う`,
                description: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を行い、チームに *3 か月間の Expensify 無料クーポン*を手に入れましょう！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        チームの支出を確認して適切に管理するために、*経費承認を追加*しましょう。

                        手順は次のとおりです:

                        1. *ワークスペース*に移動します。
                        2. 自分のワークスペースを選択します。
                        3. *その他の機能*をクリックします。
                        4. *ワークフロー*を有効にします。
                        5. ワークスペースエディターの*ワークフロー*に移動します。
                        6. *承認を追加*を有効にします。
                        7. あなたが経費の承認者として設定されます。チームを招待した後は、任意の管理者に変更できます。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[ワークスペースの作成](${workspaceConfirmationLink})`,
                description: 'セットアップスペシャリストと共にワークスペースを作成し、設定を構成します！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペースの作成](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        経費の追跡、領収書のスキャン、チャットなどを行うには、*ワークスペースを作成*してください。

                        1. *Workspaces* > *New workspace* をクリックします。

                        *新しいワークスペースの準備ができました！* [確認する](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリーの設定](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *カテゴリを設定*して、チームが簡単にレポートできるよう経費にコードを割り当てましょう。

                        1. *ワークスペース* をクリックします。
                        3. ワークスペースを選択します。
                        4. *カテゴリ* をクリックします。
                        5. 不要なカテゴリを無効にします。
                        6. 右上から独自のカテゴリを追加します。

                        [ワークスペースのカテゴリ設定に移動](${workspaceCategoriesLink}).

                        ![カテゴリを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '経費を提出する',
                description: dedent(`
                    金額を入力するか領収書をスキャンして、*経費を提出* しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. 上司のメールアドレスまたは電話番号を追加します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            adminSubmitExpenseTask: {
                title: '経費を提出する',
                description: dedent(`
                    金額を入力するか、領収書をスキャンして、*経費を申請*します。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. 詳細を確認します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            trackExpenseTask: {
                title: '経費を追跡する',
                description: dedent(`
                    領収書があってもなくても、どの通貨でも*経費を記録*できます。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. 自分の*個人*スペースを選択します。
                    5. *作成* をクリックします。

                    これで完了です！ そう、とても簡単です。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'と'}[${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})と接続する`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : 'まで'} の ${integrationName} を接続して、経費の自動分類と同期で月末締めをスムーズに。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *Accounting* をクリックします。
                        4. ${integrationName} を見つけます。
                        5. *Connect* をクリックします。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[会計に移動](${workspaceAccountingLink}).

                                      ![${integrationName} に接続](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[会計に移動](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[あなたの法人カード](${corporateCardLink})を接続する`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        法人カードを接続して、経費を自動で取り込み・仕訳しましょう。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *Corporate cards* をクリックします。
                        4. 表示される手順に従ってカードを接続します。

                        [法人カードの接続に進む](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[あなたのチーム](${workspaceMembersLink})を招待する`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *チームを招待*して Expensify で今日から経費の記録を始めてもらいましょう。

                        1. *ワークスペース* をクリックします。
                        3. 自分のワークスペースを選択します。
                        4. *メンバー* > *メンバーを招待* をクリックします。
                        5. メールアドレスまたは電話番号を入力します。
                        6. 必要に応じてカスタム招待メッセージを追加します。

                        [ワークスペースのメンバーに移動する](${workspaceMembersLink})。

                        ![チームを招待](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリー](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *カテゴリとタグを設定* すると、チームが経費にコードを付け、簡単にレポートできるようになります。

                        [会計ソフトを連携](${workspaceAccountingLink})して自動的にインポートするか、[ワークスペース設定](${workspaceCategoriesLink})で手動で設定します。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        タグを使用して、プロジェクト、クライアント、所在地、部門などの経費の詳細を追加します。複数レベルのタグが必要な場合は、Control プランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        3. ワークスペースを選択します。
                        4. *More features* をクリックします。
                        5. *Tags* を有効にします。
                        6. ワークスペースエディターの *Tags* に移動します。
                        7. 独自のタグを作成するには *+ Add tag* をクリックします。

                        [その他の機能に移動](${workspaceMoreFeaturesLink}).

                        ![タグを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `あなたの[ 会計士 ](${workspaceMembersLink})を招待`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *会計士を招待*して、ワークスペースで共同作業し、ビジネス経費を管理しましょう。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *Members* をクリックします。
                        4. *Invite member* をクリックします。
                        5. 会計士のメールアドレスを入力します。

                        [今すぐ会計士を招待](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: 'チャットを開始する',
                description: dedent(`
                    メールアドレスまたは電話番号を使って、誰とでも*チャットを開始*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。

                    相手がまだ Expensify を使用していない場合は、自動的に招待されます。

                    すべてのチャットは、相手が直接返信できるメールまたはテキストメッセージにもなります。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割する',
                description: dedent(`
                    1人または複数人と*割り勘*します。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット内の灰色の *+* ボタンをクリックし、*割り勘* を選択します。
                    5. *手動*、*スキャン*、または*距離*を選択して経費を作成します。

                    必要なら詳細を追加しても、そのまま送信してもOKです。返金してもらいましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink})を確認する`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        ワークスペースの設定を確認して更新する手順は次のとおりです:
                        1. 「Workspaces」をクリックします。
                        2. ワークスペースを選択します。
                        3. 設定を確認して更新します。
                        [ワークスペースに移動](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '初めてのレポートを作成する',
                description: dedent(`
                    レポートを作成する方法は次のとおりです：

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *レポートを作成* を選択します。
                    3. *経費を追加* をクリックします。
                    4. 最初の経費を追加します。

                    これで完了です！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[テストドライブ](${testDriveURL})を行う` : 'テストドライブを行う'),
            embeddedDemoIframeTitle: 'テストドライブ',
            employeeFakeReceipt: {
                description: '私のテストドライブの領収書！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '支払いを受け取るのは、メッセージを送るのと同じくらい簡単です。基本を確認しましょう。',
            onboardingPersonalSpendMessage: '数回クリックするだけであなたの支出を追跡する方法は次のとおりです。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        無料トライアルが開始されました！セットアップを進めましょう。
                        👋 こんにちは、私はあなたの Expensify セットアップスペシャリストです。すでに、チームの領収書と経費を管理するためのワークスペースを作成しました。30日間の無料トライアルを最大限に活用するために、以下の残りの設定手順に従ってください！
                    `)
                    : dedent(`
                        # 無料トライアルが始まりました！セットアップを始めましょう。
                        👋 こんにちは、私はExpensifyのセットアップスペシャリストです。ワークスペースを作成したので、以下の手順に従って30日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage:
                '# さあ、セットアップを始めましょう\n👋 こんにちは、私はあなたのExpensifyセットアップスペシャリストです。領収書と経費を管理できるよう、すでにワークスペースを作成しました。30日間の無料トライアルを最大限に活用するために、以下の残りのセットアップ手順に従ってください！',
            onboardingChatSplitMessage: '友達との請求書の分割は、メッセージを送るのと同じくらい簡単です。方法は次のとおりです。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自分の経費を提出する方法を学びましょう。',
            onboardingLookingAroundMessage:
                'Expensifyは経費、出張、法人カード管理で最もよく知られていますが、それ以外にもたくさんのことができます。何に興味があるかお知らせください。お手伝いします。',
            onboardingTestDriveReceiverMessage: '*あなたには3か月が無料で利用できます！以下から開始してください。*',
        },
        workspace: {
            title: 'ワークスペースで整理整頓を保つ',
            subtitle: '経費管理を簡素化するための強力なツールをすべて一か所で利用できます。ワークスペースを使用すると、次のことができます。',
            explanationModal: {
                descriptionOne: '領収書を追跡して整理する',
                descriptionTwo: '経費を分類してタグ付けする',
                descriptionThree: 'レポートを作成して共有する',
            },
            price: '30日間無料でお試しいただけます。その後、<strong>$5/ユーザー/月</strong>でアップグレードしてください。',
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: '領収書を追跡し、経費を精算し、旅行を管理し、レポートを作成するなど、チャットの速度で行えるワークスペースを作成しましょう。',
        },
        inviteMembers: {
            title: 'メンバーを招待する',
            subtitle: '経費を会計士と管理・共有したり、友達と旅行グループを始めたりしましょう。',
        },
    },
    featureTraining: {
        doNotShowAgain: 'これを再び表示しないでください',
    },
    personalDetails: {
        error: {
            containsReservedWord: '名前に「Expensify」または「Concierge」という単語を含めることはできません。',
            hasInvalidCharacter: '名前にコンマやセミコロンを含めることはできません。',
            requiredFirstName: '名は空にできません',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '法的な名前は何ですか？',
        enterDateOfBirth: 'あなたの生年月日はいつですか？',
        enterAddress: '住所は何ですか？',
        enterPhoneNumber: 'あなたの電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は旅行と支払いに使用されます。それらはあなたの公開プロフィールには表示されません。',
        legalName: '法的氏名',
        legalFirstName: '法的な名前',
        legalLastName: '法的な姓',
        address: '住所',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `日付は${dateString}より前でなければなりません。`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `日付は${dateString}以降である必要があります。`,
            hasInvalidCharacter: '名前にはラテン文字のみを含めることができます。',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `無効な郵便番号形式${zipFormat ? `許容される形式: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `電話番号が有効であることを確認してください (例: ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクが再送信されました。',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `${login}にマジックサインインリンクを送信しました。サインインするには${loginType}を確認してください。`,
        resendLink: 'リンクを再送信',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `${secondaryLogin}を確認するには、${primaryLogin}のアカウント設定からマジックコードを再送信してください。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `${primaryLogin}にアクセスできなくなった場合は、アカウントのリンクを解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクが送信されました！',
        successfullyUnlinkedLogin: 'セカンダリーログインのリンク解除に成功しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `私たちのメールプロバイダーは、配信の問題により${login}へのメールを一時的に停止しました。ログインを解除するには、次の手順に従ってください。`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>${login}が正しく綴られており、実際に配信可能なメールアドレスであることを確認してください。</strong>「expenses@domain.com」のようなメールエイリアスは、有効なExpensifyログインとするために、自分のメール受信箱にアクセスできる必要があります。`,
        ensureYourEmailClient: `<strong>メールクライアントがexpensify.comからのメールを許可していることを確認してください。</strong>このステップを完了する方法は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>を参照してください。`,
        onceTheAbove: `上記の手順が完了したら、<a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>までご連絡いただき、ログインブロックを解除してください。`,
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `${login}にSMSメッセージを送信できなかったため、一時的に停止しました。番号を確認してください。`,
        validationSuccess: 'あなたの番号が確認されました！新しいマジックサインインコードを送信するには、以下をクリックしてください。',
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
                return 'もう一度試す前に少々お待ちください。';
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
            return `お待ちください！もう一度番号を確認するには、${timeText}待つ必要があります。`;
        },
    },
    welcomeSignUpForm: {
        join: '参加する',
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
        title: '#focusモードへようこそ！',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `未読のチャットや注意が必要なチャットのみを表示することで、物事を把握しましょう。心配しないでください、これはいつでも<a href="${priorityModePageUrl}">設定</a>で変更できます。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しの支払い詳細が見つかりません。',
        notHere: 'うーん... ここにはないですね。',
        pageNotFound: 'おっと、このページは見つかりません',
        noAccess: 'このチャットまたは経費は削除されたか、アクセス権がありません。\n\nご質問がある場合は、concierge@expensify.com にお問い合わせください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。チャットに戻ってください',
        contactConcierge: 'ご質問がある場合は、concierge@expensify.com にお問い合わせください。',
        goToChatInstead: '代わりにチャットに移動してください。',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `おっと... ${isBreakLine ? '\n' : ''}何かがうまくいきませんでした。`,
        subtitle: 'リクエストを完了できませんでした。後でもう一度お試しください。',
        wrongTypeSubtitle: 'その検索は無効です。検索条件を調整してみてください。',
    },
    setPasswordPage: {
        enterPassword: 'パスワードを入力してください',
        setPassword: 'パスワードを設定',
        newPasswordPrompt: 'パスワードは、少なくとも8文字、1つの大文字、1つの小文字、1つの数字を含める必要があります。',
        passwordFormTitle: '新しいExpensifyへようこそ！パスワードを設定してください。',
        passwordNotSet: '新しいパスワードを設定できませんでした。再試行するための新しいパスワードリンクをお送りしました。',
        setPasswordLinkInvalid: 'このパスワード設定リンクは無効か期限切れです。新しいリンクがメールの受信箱に届いています！',
        validateAccount: 'アカウントを確認する',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '絵文字を追加して、同僚や友人に何が起こっているのかを簡単に知らせましょう。メッセージを追加することもできます！',
        today: '今日',
        clearStatus: 'ステータスをクリア',
        save: '保存',
        message: 'メッセージ',
        timePeriods: {
            never: '決して',
            thirtyMinutes: '30分',
            oneHour: '1時間',
            afterToday: '今日',
            afterWeek: '1週間',
            custom: 'カスタム',
        },
        vacationDelegate: '休暇代理人',
        setVacationDelegate: `不在中にレポートを承認してもらうため、休暇代理人を設定してください。`,
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `${managerName}の休暇代理人として`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `${submittedToName}へ、${vacationDelegateName}の休暇代理人として`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `${nameOrEmail} を休暇代理人として設定しています。まだすべてのワークスペースに参加していません。続行すると、すべてのワークスペース管理者に追加を依頼するメールが送信されます。`,
        untilTomorrow: '明日まで',
        untilTime: ({time}: UntilTimeParams) => `${time}まで`,
        date: '日付',
        time: '時間',
        clearAfter: '後でクリア',
        whenClearStatus: 'いつステータスをクリアすべきですか？',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `ステップ${step}`;
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
        manuallyAdd: '銀行口座を手動で追加する',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        accountEnding: '末尾が',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます。',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '以下のアカウントを選択してください',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログインしてください',
        connectManually: '手動で接続',
        desktopConnection: '注: Chase、Wells Fargo、Capital One、または Bank of America と接続するには、こちらをクリックしてブラウザでこのプロセスを完了してください。',
        yourDataIsSecure: 'あなたのデータは安全です',
        toGetStarted: '銀行口座を追加して、経費を払い戻し、Expensifyカードを発行し、請求書の支払いを受け取り、すべてを一箇所で支払います。',
        plaidBodyCopy: '従業員に会社の経費を支払う、そして払い戻しを受ける、より簡単な方法を提供しましょう。',
        checkHelpLine: '口座の小切手にルーティング番号と口座番号が記載されています。',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `銀行口座を接続するには、お願いします <a href="${contactMethodRoute}">メールをプライマリーログインとして追加する</a> もう一度試してください。電話番号をセカンダリログインとして追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから再試行してください。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `おっと！ワークスペースの通貨がUSDとは異なる通貨に設定されているようです。続行するには、こちらにアクセスしてください。<a href="${workspaceRoute}">ワークスペースの設定</a> USDに設定して、もう一度お試しください。`,
        bbaAdded: 'ビジネス銀行口座が追加されました！',
        bbaAddedDescription: '支払いに使用する準備ができています。',
        error: {
            youNeedToSelectAnOption: 'オプションを選択してください',
            noBankAccountAvailable: '申し訳ありませんが、利用可能な銀行口座がありません。',
            noBankAccountSelected: 'アカウントを選択してください',
            taxID: '有効な税務ID番号を入力してください',
            website: '有効なウェブサイトを入力してください',
            zipCode: `有効な郵便番号を次の形式で入力してください: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '有効な電話番号を入力してください',
            email: '有効なメールアドレスを入力してください',
            companyName: '有効なビジネス名を入力してください',
            addressCity: '有効な都市を入力してください',
            addressStreet: '有効な住所を入力してください',
            addressState: '有効な州を選択してください',
            incorporationDateFuture: '設立日は未来の日付にできません',
            incorporationState: '有効な州を選択してください',
            industryCode: '有効な6桁の業種分類コードを入力してください',
            restrictedBusiness: 'ビジネスが制限されたビジネスのリストに載っていないことを確認してください。',
            routingNumber: '有効なルーティング番号を入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: 'ルーティング番号と口座番号が一致することはできません。',
            companyType: '有効な会社タイプを選択してください',
            tooManyAttempts: 'ログイン試行回数が多いため、このオプションは24時間無効になっています。後でもう一度お試しいただくか、手動で詳細を入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: '有効なSSNの最後の4桁を入力してください。',
            firstName: '有効な名前を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: 'デフォルトの入金口座またはデビットカードを追加してください',
            validationAmounts: '入力された検証金額が正しくありません。銀行の明細をもう一度確認して、再試行してください。',
            fullName: '有効なフルネームを入力してください',
            ownershipPercentage: '有効なパーセンテージの数字を入力してください',
            deletePaymentBankAccount: 'この銀行口座はExpensifyカードの支払いに使用されているため、削除できません。それでもこの口座を削除したい場合は、コンシェルジュにお問い合わせください。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'あなたのアカウント詳細は何ですか？',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: 'あなたの銀行情報は何ですか？',
        accountHolderInformationStepHeader: '口座名義人の詳細は何ですか？',
        howDoWeProtectYourData: 'どのようにしてあなたのデータを保護しますか？',
        currencyHeader: 'あなたの銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '以下の詳細を再確認し、利用規約のボックスをチェックして確認してください。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensifyのパスワードを入力してください',
        alreadyAdded: 'このアカウントはすでに追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人銀行口座が追加されました！',
        successMessage: 'おめでとうございます。銀行口座の設定が完了し、払い戻しを受け取る準備が整いました。',
    },
    attachmentView: {
        unknownFilename: '不明なファイル名',
        passwordRequired: 'パスワードを入力してください',
        passwordIncorrect: 'パスワードが間違っています。もう一度お試しください。',
        failedToLoadPDF: 'PDFファイルの読み込みに失敗しました',
        pdfPasswordForm: {
            title: 'パスワード保護されたPDF',
            infoText: 'このPDFはパスワードで保護されています。',
            beforeLinkText: 'お願いします',
            linkText: 'パスワードを入力してください',
            afterLinkText: '表示するには。',
            formLabel: 'PDFを表示',
        },
        attachmentNotFound: '添付ファイルが見つかりません',
        retry: '再試行',
    },
    messages: {
        errorMessageInvalidPhone: `有効な電話番号を括弧やダッシュなしで入力してください。米国外の場合は、国コードを含めてください（例: ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} のメンバーです`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化リクエストを続行することで、あなたは読んで理解し、受け入れたことを確認します',
        facialScan: 'Onfidoの顔認識ポリシーとリリース',
        tryAgain: 'もう一度試してください。',
        verifyIdentity: '本人確認を行う',
        letsVerifyIdentity: 'あなたの身元を確認しましょう',
        butFirst: `でもまずは退屈なことから。次のステップで法的文書を読んで、準備ができたら「承諾」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラアクセスを有効にする',
        cameraRequestMessage: '銀行口座の確認を完了するためにカメラへのアクセスが必要です。設定 > New Expensify から有効にしてください。',
        microphonePermissionsNotGranted: 'マイクアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の確認を完了するために、マイクへのアクセスが必要です。設定 > New Expensify から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、IDのオリジナル画像をアップロードしてください。',
        documentNeedsBetterQuality: 'あなたのIDは損傷しているか、セキュリティ機能が欠けているようです。損傷していないIDのオリジナル画像を完全に見える形でアップロードしてください。',
        imageNeedsBetterQuality: 'あなたのIDの画像品質に問題があります。ID全体がはっきりと見える新しい画像をアップロードしてください。',
        selfieIssue: 'セルフィー/ビデオに問題があります。ライブセルフィー/ビデオをアップロードしてください。',
        selfieNotMatching: 'あなたのセルフィー/ビデオがIDと一致しません。顔がはっきりと見える新しいセルフィー/ビデオをアップロードしてください。',
        selfieNotLive: 'あなたのセルフィー/ビデオはライブ写真/ビデオではないようです。ライブセルフィー/ビデオをアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'あなたがウォレットから送金および受金を行う前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: 'あなたの身元確認を完了するために、あと少しだけ質問させてください。',
        helpLink: 'なぜこれが必要なのかについて詳しく学びましょう。',
        legalFirstNameLabel: '法的な名前',
        legalMiddleNameLabel: '法的なミドルネーム',
        legalLastNameLabel: '法的な姓',
        selectAnswer: '続行するには応答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'SSNの確認に問題が発生しています。SSNの9桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前にこの情報を修正してください。',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `本人確認ができませんでした。後でもう一度お試しいただくか、<a href="mailto:${conciergeEmail}">${conciergeEmail}</a> にお問い合わせください。ご質問がある場合。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '手数料と条件',
        haveReadAndAgreePlain: '私は、電子情報開示を読み、その受領に同意します。',
        haveReadAndAgree: `私は、<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子情報開示</a>を読み、その受領に同意します。`,
        agreeToThePlain: 'プライバシーとウォレットの規約に同意します。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>と<a href="${walletAgreementUrl}">ウォレット</a>の規約に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越/クレジット機能なし。',
        electronicFundsWithdrawal: '電子資金引き出し',
        standard: '標準',
        reviewTheFees: 'いくつかの料金を確認してください。',
        checkTheBoxes: '以下のボックスをチェックしてください。',
        agreeToTerms: '利用規約に同意すれば、準備完了です！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensifyウォレットは${walletProgram}によって発行されています。`,
            perPurchase: '購入ごとに',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金リロード',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会（ネットワーク内またはネットワーク外）',
            customerService: 'カスタマーサービス（自動またはライブエージェント）',
            inactivityAfterTwelveMonths: '非アクティブ（12か月間取引がない場合）',
            weChargeOneFee: '私たちは他に1種類の手数料を請求します。それは:',
            fdicInsurance: 'あなたの資金はFDIC保険の対象です。',
            generalInfo: `プリペイド口座に関する一般情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a> を参照。`,
            conditionsDetails: `すべての料金およびサービスの詳細と条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> をご覧いただくか、+1 833-400-0904までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き出し（インスタント）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `（最小${amount}）`,
        },
        longTermsForm: {
            listOfAllFees: 'Expensifyウォレット手数料の一覧',
            typeOfFeeHeader: 'すべての料金',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: 'アカウントの開設',
            openingAccountDetails: 'アカウントを開設するのに料金はかかりません。',
            monthlyFeeDetails: '月額料金はありません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス料金はありません。',
            inactivityDetails: '非アクティブ料金はありません。',
            sendingFundsTitle: '別のアカウント保有者に資金を送信する',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使用して他のアカウント保有者に資金を送る際の手数料はありません。',
            electronicFundsStandardDetails: 'Expensify Walletからお客様の銀行口座への送金は、標準オプションで手数料はかかりません。この送金は通常1～3営業日以内に完了します。',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Expensifyウォレットからリンクされたデビットカードに即時送金オプションを使用して資金を送金するには手数料がかかります。' +
                `この送金は通常数分で完了します。手数料は送金額の${percentage}%（最低手数料は${amount}）です。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `お客様の資金はFDIC保険の対象となります。お客様の資金は、FDIC保険に加入している${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}保管されるか、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}に送金されます。` +
                `${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}が破綻した場合、特定の預金保険要件を満たし、お客様のカードが登録されていれば、お客様の資金はFDICにより最高${amount}まで保証されます。` +
                `詳細は${CONST.TERMS.FDIC_PREPAID}を参照してください。`,
            contactExpensifyPayments: `${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}へのお問い合わせは、電話（+1 833-400-0904）、Eメール（${CONST.EMAIL.CONCIERGE}）またはサインイン（${CONST.NEW_EXPENSIFY_URL}）してください。`,
            generalInformation: `プリペイド口座に関する一般情報については、${CONST.TERMS.CFPB_PREPAID}をご覧ください。プリペイド口座について苦情がある場合は、消費者金融保護局（Consumer Financial Protection Bureau）に電話(1-855-411-2372)するか、${CONST.TERMS.CFPB_COMPLAINT}をご覧ください。`,
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動化',
            liveAgent: 'ライブエージェント',
            instant: 'インスタント',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最小 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効化されました！',
        activatedMessage: 'おめでとうございます。ウォレットの設定が完了し、支払いの準備が整いました。',
        checkBackLaterTitle: 'ちょっと待ってください…',
        checkBackLaterMessage: '私たちはまだあなたの情報を確認中です。後でもう一度確認してください。',
        continueToPayment: '支払いに進む',
        continueToTransfer: '転送を続ける',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'もう少しで完了です！セキュリティ上の理由から、いくつかの情報を確認する必要があります。',
        legalBusinessName: '法的事業名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        companyType: '会社の種類',
        incorporationDate: '設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: 'この会社がリストにないことを確認します。',
        listOfRestrictedBusinesses: '制限されているビジネスのリスト',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        industryClassification: 'このビジネスはどの業界に分類されますか？',
        industryClassificationCodePlaceholder: '業種分類コードを検索',
    },
    requestorStep: {
        headerTitle: '個人情報',
        learnMore: '詳細を確認',
        isMyDataSafe: '私のデータは安全ですか？',
    },
    personalInfoStep: {
        personalInfo: '個人情報',
        enterYourLegalFirstAndLast: '法的な名前は何ですか？',
        legalFirstName: '法的な名前',
        legalLastName: '法的な姓',
        legalName: '法的氏名',
        enterYourDateOfBirth: 'あなたの生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁は何ですか？',
        dontWorry: 'ご安心ください、私たちは個人の信用調査を行いません！',
        last4SSN: 'SSNの下4桁',
        enterYourAddress: '住所は何ですか？',
        address: '住所',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、あなたは読んで理解し、受け入れたことを確認します',
        whatsYourLegalName: 'あなたの法的な名前は何ですか？',
        whatsYourDOB: 'あなたの生年月日はいつですか?',
        whatsYourAddress: '住所は何ですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁は何ですか？',
        noPersonalChecks: 'ご安心ください、ここでは個人の信用調査は行いません！',
        whatsYourPhoneNumber: '電話番号は何ですか？',
        weNeedThisToVerify: 'ウォレットを確認するためにこれが必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: 'あなたの会社の名前は何ですか？',
        businessName: '法的会社名',
        enterYourCompanyTaxIdNumber: '御社の税務ID番号は何ですか？',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        enterYourCompanyWebsite: '御社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: 'あなたの会社の住所は何ですか？',
        selectYourCompanyType: 'それはどのような種類の会社ですか？',
        companyType: '会社の種類',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '御社の設立日はいつですか？',
        incorporationDate: '設立日',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'あなたの会社はどの州で法人化されましたか?',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        companyAddress: '会社の住所',
        listOfRestrictedBusinesses: '制限されているビジネスのリスト',
        confirmCompanyIsNot: 'この会社がリストにないことを確認します。',
        businessInfoTitle: 'ビジネス情報',
        legalBusinessName: '法的事業名',
        whatsTheBusinessName: 'ビジネス名は何ですか？',
        whatsTheBusinessAddress: '会社の住所は何ですか？',
        whatsTheBusinessContactInformation: 'ビジネス連絡先情報は何ですか？',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '会社登録番号（CRN）は何ですか?';
                default:
                    return '事業登録番号は何ですか?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '雇用者識別番号（EIN）とは何ですか？';
                case CONST.COUNTRY.CA:
                    return '法人番号（BN）とは何ですか？';
                case CONST.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST.COUNTRY.AU:
                    return 'オーストラリア事業番号（ABN）とは何ですか？';
                default:
                    return 'EUのVAT番号とは何ですか？';
            }
        },
        whatsThisNumber: 'この番号は何ですか？',
        whereWasTheBusinessIncorporated: '事業はどこで法人化されましたか?',
        whatTypeOfBusinessIsIt: 'それはどのような種類のビジネスですか？',
        whatsTheBusinessAnnualPayment: 'ビジネスの年間支払い額はどれくらいですか？',
        whatsYourExpectedAverageReimbursements: 'あなたの期待される平均払い戻し額はいくらですか？',
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
        businessAddress: 'ビジネス住所',
        businessType: '業種',
        incorporation: '法人化',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人の種類',
        businessCategory: 'ビジネスカテゴリ',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `${currencyCode}での年間支払額`,
        averageReimbursementAmount: '平均払い戻し額',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `${currencyCode}での平均払い戻し額`,
        selectIncorporationType: '法人の種類を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払い額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        selectBusinessType: '事業タイプを選択する',
        findIncorporationType: '法人の種類を見つける',
        findBusinessCategory: 'ビジネスカテゴリを見つける',
        findAnnualPaymentVolume: '年間支払い額を見つける',
        findIncorporationState: '設立州を見つける',
        findAverageReimbursement: '平均払い戻し額を見つける',
        findBusinessType: '事業タイプを見つける',
        error: {
            registrationNumber: '有効な登録番号を提供してください。',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効な雇用者識別番号（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な法人番号（BN）を入力してください';
                    case CONST.COUNTRY.GB:
                        return '有効なVAT登録番号（VRN）を入力してください';
                    case CONST.COUNTRY.AU:
                        return '有効なオーストラリア事業番号（ABN）を入力してください';
                    default:
                        return '有効なEU VAT番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `${companyName}の25%以上を所有していますか？`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `${companyName}の25%以上を所有している個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `${companyName}の株式の25%以上を保有する個人は他にいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '規制により、事業の25%以上を所有する個人の身元を確認する必要があります。',
        companyOwner: 'ビジネスオーナー',
        enterLegalFirstAndLastName: '所有者の法的な名前は何ですか？',
        legalFirstName: '法的な名前',
        legalLastName: '法的な姓',
        enterTheDateOfBirthOfTheOwner: 'オーナーの生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁は何ですか?',
        last4SSN: 'SSNの下4桁',
        dontWorry: 'ご安心ください、私たちは個人の信用調査を行いません！',
        enterTheOwnersAddress: 'オーナーの住所は何ですか？',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、あなたは読んで理解し、受け入れたことを確認します',
        owners: '所有者',
    },
    ownershipInfoStep: {
        ownerInfo: '所有者情報',
        businessOwner: 'ビジネスオーナー',
        signerInfo: '署名者情報',
        doYouOwn: ({companyName}: CompanyNameParams) => `${companyName}の25%以上を所有していますか？`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `${companyName}の25%以上を所有している個人はいますか？`,
        regulationsRequire: '規制により、事業の25%以上を所有する個人の身元を確認する必要があります。',
        legalFirstName: '法的な名前',
        legalLastName: '法的な姓',
        whatsTheOwnersName: '所有者の法的な名前は何ですか？',
        whatsYourName: '法的な名前は何ですか？',
        whatPercentage: 'ビジネスの何パーセントがオーナーに属していますか？',
        whatsYoursPercentage: 'あなたはそのビジネスの何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: 'オーナーの生年月日はいつですか？',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        whatsTheOwnersAddress: 'オーナーの住所は何ですか？',
        whatsYourAddress: '住所は何ですか？',
        whatAreTheLast: '所有者の社会保障番号の下4桁は何ですか？',
        whatsYourLast: 'あなたの社会保障番号の最後の4桁は何ですか？',
        whatsYourNationality: 'あなたの市民権の国はどこですか？',
        whatsTheOwnersNationality: '所有者の市民権の国はどこですか？',
        countryOfCitizenship: '市民権の国',
        dontWorry: 'ご安心ください、私たちは個人の信用調査を行いません！',
        last4: 'SSNの下4桁',
        whyDoWeAsk: 'なぜこれを尋ねるのですか？',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '所有権の割合',
        areThereOther: ({companyName}: CompanyNameParams) => `${companyName}の25%以上を所有している他の個人はいますか?`,
        owners: '所有者',
        addCertified: '認定された組織図を追加して、実質的所有者を表示する',
        regulationRequiresChart: '規制により、事業の25%以上を所有するすべての個人または法人を示す所有権チャートの認証済みコピーを収集する必要があります。',
        uploadEntity: 'エンティティ所有権チャートをアップロード',
        noteEntity: '注: エンティティ所有権チャートは、あなたの会計士、法律顧問によって署名されるか、公証されなければなりません。',
        certified: '認定された法人所有権チャート',
        selectCountry: '国を選択',
        findCountry: '国を探す',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加書類をアップロード',
        pleaseUpload: 'ビジネスエンティティの25%以上の直接または間接的な所有者であることを確認するために、追加の書類を以下にアップロードしてください。',
        acceptedFiles: '受け入れ可能なファイル形式: PDF、PNG、JPEG。各セクションのファイルサイズは5 MBを超えることはできません。',
        proofOfBeneficialOwner: '受益所有者の証明',
        proofOfBeneficialOwnerDescription:
            '25%以上のビジネス所有権を確認するために、公認会計士、公証人、または弁護士からの署名入りの証明書と組織図を提供してください。それは過去3ヶ月以内の日付であり、署名者のライセンス番号を含む必要があります。',
        copyOfID: '受益所有者のIDのコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など。',
        proofOfAddress: '受益所有者の住所証明書',
        proofOfAddressDescription: '例: 公共料金の請求書、賃貸契約書など。',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'サイト訪問のビデオまたは署名担当者との録音された通話をアップロードしてください。担当者は次の情報を提供する必要があります：氏名、生年月日、会社名、登録番号、税コード番号、登録住所、事業の性質、アカウントの目的。',
    },
    completeVerificationStep: {
        completeVerification: '認証を完了する',
        confirmAgreements: '以下の合意を確認してください。',
        certifyTrueAndAccurate: '私は提供された情報が真実で正確であることを証明します。',
        certifyTrueAndAccurateError: '情報が真実で正確であることを証明してください。',
        isAuthorizedToUseBankAccount: '私はこのビジネス銀行口座をビジネス支出に使用する権限があります。',
        isAuthorizedToUseBankAccountError: 'ビジネス銀行口座を操作するには、権限を持つ管理責任者でなければなりません。',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を確認してください',
        validateButtonText: '検証する',
        validationInputLabel: '取引',
        maxAttemptsReached: 'この銀行口座の検証は、不正な試行が多すぎるため無効になっています。',
        description: `1～2営業日以内に、「Expensify, Inc. Validation」のような名前からあなたの銀行口座に3つの小額取引を送信します。`,
        descriptionCTA: '以下のフィールドに各取引金額を入力してください。例: 1.51。',
        letsChatText: 'もう少しです！チャットでいくつかの情報を確認するお手伝いをお願いします。準備はいいですか？',
        enable2FATitle: '不正行為を防ぐために、二要素認証（2FA）を有効にしてください。',
        enable2FAText: '私たちはあなたのセキュリティを真剣に考えています。アカウントに追加の保護層を加えるために、今すぐ2FAを設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    countryStep: {
        confirmBusinessBank: 'ビジネス銀行口座の通貨と国を確認してください。',
        confirmCurrency: '通貨と国を確認してください',
        yourBusiness: 'ビジネス銀行口座の通貨は、ワークスペースの通貨と一致している必要があります。',
        youCanChange: 'ワークスペースの通貨は、あなたの中で変更できます。',
        findCountry: '国を探す',
        selectCountry: '国を選択',
    },
    bankInfoStep: {
        whatAreYour: 'あなたのビジネス銀行口座の詳細は何ですか？',
        letsDoubleCheck: 'すべてが問題ないかもう一度確認しましょう。',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます。',
        accountNumber: '口座番号',
        accountHolderNameDescription: '承認署名者の氏名',
    },
    signerInfoStep: {
        signerInfo: '署名者情報',
        areYouDirector: ({companyName}: CompanyNameParams) => `あなたは${companyName}の取締役ですか？`,
        regulationRequiresUs: '規制により、署名者がビジネスを代表してこの行動を取る権限があるかどうかを確認する必要があります。',
        whatsYourName: 'あなたの法的な名前は何ですか',
        fullName: '法的なフルネーム',
        whatsYourJobTitle: 'あなたの職種は何ですか？',
        jobTitle: '職種',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        uploadID: 'IDと住所証明書をアップロード',
        personalAddress: '個人住所の証明（例：公共料金の請求書）',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '個人住所の証明書',
        enterOneEmail: ({companyName}: CompanyNameParams) => `${companyName}の取締役のメールアドレスを入力してください。`,
        regulationRequiresOneMoreDirector: '規制により、署名者として少なくとももう一人の取締役が必要です。',
        hangTight: 'お待ちください…',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `${companyName}の取締役のメールアドレスを2件入力してください。`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: '私たちは、他の人がビジネスの取締役としての身元を確認するのを待っています。',
        id: 'IDのコピー',
        proofOfDirectors: '取締役の証明書',
        proofOfDirectorsDescription: '例: Oncorp Corporate Profile または Business Registration.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: '署名者、認定ユーザー、および実質的所有者のためのCodice Fiscale。',
        PDSandFSG: 'PDS + FSG開示書類',
        PDSandFSGDescription: dedent(`
            Expensify における Global Reimbursements を支えるため、Corpay との提携では API 接続を利用し、同社の幅広い国際銀行パートナー網を活用しています。オーストラリアの規制に基づき、Corpay の Financial Services Guide（FSG）および Product Disclosure Statement（PDS）を提供いたします。

            FSG と PDS には、Corpay が提供する商品およびサービスの詳細および重要な情報が記載されていますので、注意深くお読みください。今後の参照のために保管してください。
        `),
        pleaseUpload: '事業体の取締役としての身元を確認するために、追加の書類を以下にアップロードしてください。',
        enterSignerInfo: '署名者情報を入力してください',
        thisStep: 'このステップは完了しました',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `${currency}のビジネス銀行口座（下4桁：${bankAccountLastFour}）をExpensifyに接続して、従業員に${currency}で支払います。次のステップでは、取締役の署名者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスは異なる必要があります',
        },
    },
    agreementsStep: {
        agreements: '契約書',
        pleaseConfirm: '以下の契約を確認してください',
        regulationRequiresUs: '規制により、事業の25%以上を所有する個人の身元を確認する必要があります。',
        iAmAuthorized: '私はビジネス支出のためにビジネス銀行口座を使用する権限があります。',
        iCertify: '提供された情報が真実で正確であることを証明します。',
        iAcceptTheTermsAndConditions: `<a href="https://cross-border.corpay.com/tc/">利用規約</a>に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約に同意します。',
        accept: '銀行口座を承認して追加',
        iConsentToThePrivacyNotice: '<a href="https://payments.corpay.com/compliance">プライバシーポリシー</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシーポリシーに同意します。',
        error: {
            authorized: 'ビジネス銀行口座を操作するには、権限を持つ管理責任者でなければなりません。',
            certify: '情報が真実で正確であることを証明してください。',
            consent: 'プライバシー通知に同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusignフォーム',
        pleaseComplete: '以下のDocusignリンクからACH認可フォームに記入し、署名済みのコピーをこちらにアップロードしてください。これにより、銀行口座から直接資金を引き落とすことができます。',
        pleaseCompleteTheBusinessAccount: 'ビジネスアカウント申請書および口座振替契約を記入してください。',
        pleaseCompleteTheDirect:
            '以下のDocusignリンクを使用して口座振替契約を記入し、署名済みのコピーをこちらにアップロードしてください。これにより、銀行口座から直接資金を引き落とすことができます。',
        takeMeTo: 'Docusignへ移動',
        uploadAdditional: '追加書類をアップロード',
        pleaseUpload: 'DEFTフォームおよびDocusign署名ページをアップロードしてください。',
        pleaseUploadTheDirect: '口座振替契約およびDocusign署名ページをアップロードしてください。',
    },
    finishStep: {
        letsFinish: 'チャットで終わらせましょう！',
        thanksFor:
            'これらの詳細をありがとうございます。専任のサポートエージェントがあなたの情報を確認します。追加で必要な情報がある場合はご連絡しますが、その間に質問があればお気軽にお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '詐欺を防ぐために二要素認証（2FA）を有効にする',
        weTake: '私たちはあなたのセキュリティを真剣に考えています。アカウントに追加の保護層を加えるために、今すぐ2FAを設定してください。',
        secure: 'アカウントを保護する',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '少々お待ちください',
        explanationLine: 'お客様の情報を確認しています。まもなく次のステップに進むことができます。',
    },
    session: {
        offlineMessageRetry: 'オフラインのようです。接続を確認して、もう一度お試しください。',
    },
    travel: {
        header: '旅行を予約する',
        title: 'スマートに旅行する',
        subtitle: 'Expensify Travelを利用して、最高の旅行オファーを手に入れ、すべてのビジネス経費を一か所で管理しましょう。',
        features: {
            saveMoney: '予約でお金を節約する',
            alerts: 'リアルタイムの更新とアラートを受け取る',
        },
        bookTravel: '旅行を予約する',
        bookDemo: 'デモを予約する',
        bookADemo: 'デモを予約する',
        toLearnMore: '詳細を学ぶために。',
        termsAndConditions: {
            header: '続行する前に...',
            title: '利用規約',
            label: '利用規約に同意します。',
            subtitle: `Expensify Travelの<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります。',
            defaultWorkspaceError:
                'Expensify Travelを有効にするには、デフォルトのワークスペースを設定する必要があります。設定 > ワークスペース > ワークスペースの横にある縦の3つのドットをクリック > デフォルトのワークスペースとして設定し、もう一度お試しください！',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '乗客',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>このフライトの前に<strong>${layover}の乗り継ぎ</strong>があります</muted-text-label>`,
            takeOff: '離陸',
            landing: 'ランディング',
            seat: '席',
            class: 'キャビンクラス',
            recordLocator: 'レコードロケーター',
            cabinClasses: {
                unknown: '不明',
                economy: '経済',
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
            cancellationUntil: 'キャンセル無料期限: まで',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '返金不可',
                freeCancellationUntil: 'キャンセル無料期限: まで',
                partiallyRefundable: '一部返金可能',
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
            cancellationUntil: 'キャンセル無料期限: まで',
            freeCancellation: '無料キャンセル',
            confirmation: '確認番号',
        },
        train: 'Rail',
        trainDetails: {
            passenger: '乗客',
            departs: '出発します',
            arrives: '到着',
            coachNumber: 'コーチ番号',
            seat: '席',
            fareDetails: '運賃の詳細',
            confirmation: '確認番号',
        },
        viewTrip: '旅行を表示',
        modifyTrip: '出張を変更',
        tripSupport: '旅行サポート',
        tripDetails: '旅行の詳細',
        viewTripDetails: '旅行の詳細を表示',
        trip: '旅行',
        trips: '出張',
        tripSummary: '旅行概要',
        departs: '出発します',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>旅行予約のための<a href="${phoneErrorMethodsRoute}">プライマリログインとして、仕事の電子メールを追加して</a>ください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travelのセットアップ用にドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Y<strong>${domain}</strong> ドメインで Expensify Travel を有効にする権限がありません。そのドメインの担当者の方に、代わりに旅行機能を有効にしてもらう必要があります。`,
            accountantInvitation: `会計士の方で、このドメインでの出張を可能にするため、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士プログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travelを始めましょう',
            message: `Expensify Travelでは、個人のメール（例: name@gmail.com）ではなく、勤務先のメール（例: name@company.com）を使用する必要があります。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travelは無効になっています',
            message: `管理者がExpensify Travelをオフにしました。旅行の手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: '今日から旅行を始めましょう！',
            message: `旅行のデモを取得し、御社向けに有効化するには、アカウントマネージャーまたはsalesteam@expensify.comにご連絡ください。`,
            confirmText: '了解しました。',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン: ${domain} のトラベル有効化に失敗しました。このドメインのトラベルを確認して有効にしてください。`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `あなたのフライト ${airlineCode} (${origin} → ${destination}) は ${startDate} に予約されました。確認コード: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) => `${startDate}の${airlineCode}便（${origin} → ${destination}）の航空券は無効になりました。`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）のチケットは払い戻しまたは交換されました。`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `あなたのフライト ${airlineCode} (${origin} → ${destination}) は ${startDate} に航空会社によってキャンセルされました。`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `航空会社はフライト${airlineCode}のスケジュール変更を提案しました。確認を待っています。`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `スケジュール変更が確認されました: フライト ${airlineCode} は ${startDate} に出発します。`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `あなたのフライト ${airlineCode} (${origin} → ${destination}) が ${startDate} に更新されました。`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `フライト${airlineCode}のキャビンクラスが${cabinClass}に更新されました。`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `フライト${airlineCode}の座席指定が確認されました。`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `フライト${airlineCode}の座席指定が変更されました。`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `フライト${airlineCode}の座席指定が削除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `あなたは${id}の${type}予約をキャンセルしました。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `ベンダーがあなたの${type}予約${id}をキャンセルしました。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `あなたの${type}予約が再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `あなたの${type}の予約が更新されました。旅程で新しい詳細を確認してください。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) => `${startDate}の${origin} → ${destination}の鉄道チケットが払い戻されました。クレジットが処理されます。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `${startDate}の${origin} → ${destination}の鉄道チケットが交換されました。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `${origin} → ${destination} の ${startDate} の鉄道チケットが更新されました。`,
            defaultUpdate: ({type}: TravelTypeParams) => `あなたの${type}予約が更新されました。`,
        },
        flightTo: 'フライト',
        trainTo: '電車',
        carRental: '間のレンタカー',
        nightIn: '泊',
        nightsIn: '泊',
    },
    workspace: {
        common: {
            card: 'カード',
            expensifyCard: 'Expensify Card',
            companyCards: '会社カード',
            workflows: 'ワークフロー',
            workspace: 'ワークスペース',
            findWorkspace: 'ワークスペースを探す',
            edit: 'ワークスペースを編集',
            enabled: '有効',
            disabled: '無効',
            everyone: '全員',
            delete: 'ワークスペースを削除',
            settings: '設定',
            reimburse: '払い戻し',
            categories: 'カテゴリ',
            tags: 'タグ',
            customField1: 'カスタムフィールド1',
            customField2: 'カスタムフィールド2',
            customFieldHint: 'このメンバーのすべての支出に適用されるカスタムコーディングを追加します。',
            reports: 'レポート',
            reportFields: 'レポートフィールド',
            reportTitle: 'レポートタイトル',
            reportField: 'レポートフィールド',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            perDiem: 'Per diem',
            travel: '旅行',
            members: 'メンバー',
            accounting: '会計',
            receiptPartners: 'レシートパートナー',
            rules: 'ルール',
            displayedAs: '表示される内容',
            plan: '計画',
            profile: '概要',
            bankAccount: '銀行口座',
            testTransactions: 'トランザクションをテストする',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードを照合する',
            selectAll: 'すべて選択',
            selected: () => ({
                one: '1 件選択済み',
                other: (count: number) => `${count} 件選択済み`,
            }),
            settlementFrequency: '決済頻度',
            setAsDefault: 'デフォルトのワークスペースに設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信された領収書は、このワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？これにより、すべてのカードフィードと割り当てられたカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。新しいメンバーをワークスペースに招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページにアクセスする権限がありません。このワークスペースに参加しようとしている場合は、ワークスペースのオーナーにメンバーとして追加してもらってください。他に何かお困りですか？${CONST.EMAIL.CONCIERGE}にお問い合わせください。`,
            goToWorkspace: 'ワークスペースに移動',
            duplicateWorkspace: 'ワークスペースの複製',
            duplicateWorkspacePrefix: '重複',
            goToWorkspaces: 'ワークスペースに移動',
            clearFilter: 'フィルターをクリア',
            workspaceName: 'ワークスペース名',
            workspaceOwner: 'オーナー',
            workspaceType: 'ワークスペースの種類',
            workspaceAvatar: 'ワークスペースアバター',
            mustBeOnlineToViewMembers: 'このワークスペースのメンバーを表示するには、オンラインである必要があります。',
            moreFeatures: 'さらに多くの機能',
            requested: 'リクエスト済み',
            distanceRates: '距離料金',
            defaultDescription: 'すべての領収書と経費を一か所で管理。',
            descriptionHint: 'このワークスペースに関する情報をすべてのメンバーと共有します。',
            welcomeNote: '領収書の払い戻し申請にはExpensifyを使用してください。ありがとうございます！',
            subscription: 'サブスクリプション',
            markAsEntered: '手動入力としてマーク',
            markAsExported: '輸出マーク',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}にエクスポート`,
            letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
            lineItemLevel: 'ラインアイテムレベル',
            reportLevel: 'レポートレベル',
            topLevel: 'トップレベル',
            appliedOnExport: 'Expensifyにインポートされず、エクスポート時に適用されます。',
            shareNote: {
                header: '他のメンバーとワークスペースを共有する',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `このQRコードを共有するか、以下のリンクをコピーして、メンバーがワークスペースへのアクセスをリクエストしやすくしてください。ワークスペースへの参加リクエストはすべて、<a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> ルームに表示され、ご確認いただけます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用する',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}に接続したことがあるので、既存の接続を再利用するか、新しい接続を作成することができます。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 最終同期日 ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `認証エラーのため、${connectionName} に接続できません。`,
            learnMore: '詳しくはこちら',
            memberAlternateText: 'メンバーはレポートを提出および承認できます。',
            adminAlternateText: '管理者は、すべてのレポートとワークスペース設定に対して完全な編集アクセス権を持っています。',
            auditorAlternateText: '監査人はレポートを閲覧し、コメントを残すことができます。',
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
                trip: '旅行ごとに',
                weekly: '毎週',
                semimonthly: '月に2回',
                monthly: '毎月',
            },
            planType: 'プランタイプ',
            submitExpense: '以下に経費を提出してください:',
            defaultCategory: 'デフォルトカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName}の経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Cardの取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">弊社の統合</a>で作成された 「Expensify Card Liability Account 」に自動的にエクスポートされます。</muted-text-label>`,
        },
        receiptPartners: {
            connect: '今すぐ接続',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `${organizationName}に接続しました` : '組織全体で旅行および食事の配達経費を自動化します。',
                sendInvites: 'メンバーを招待',
                sendInvitesDescription: 'これらのワークスペースメンバーはまだUber for Businessアカウントを持っていません。現在招待したくないメンバーの選択を解除してください。',
                confirmInvite: '招待を確認',
                manageInvites: '招待を管理する',
                confirm: '確認',
                allSet: '設定完了',
                readyToRoll: '準備完了です',
                takeBusinessRideMessage: 'ビジネス利用でUberに乗車すると、レシートがExpensifyに自動的にインポートされます。出発しましょう！',
                all: 'すべて',
                linked: 'リンク済み',
                outstanding: '未処理',
                status: {
                    resend: '再送信',
                    invite: '招待',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'リンク済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '停止中',
                },
                centralBillingAccount: '中央請求アカウント',
                centralBillingDescription: 'Uberの領収書をすべてインポートする場所を選択してください。',
                invitationFailure: 'メンバーを Uber for Business に招待できません。',
                autoInvite: 'Uber for Business に新しいワークスペースメンバーを招待する',
                autoRemove: 'Uber for Business から削除されたワークスペースメンバーを非アクティブ化する',
                bannerTitle: 'Expensify + ビジネス向け Uber',
                bannerDescription: 'Uber for Business を接続すると、組織全体の出張費や食事の配達費を自動化できます。',
                emptyContent: {
                    title: '未処理の招待はありません',
                    subtitle: 'やった！あらゆる場所を探しましたが、未処理の招待は見つかりませんでした。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>日当料金を設定して、従業員の1日の支出を管理します。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳しくはこちら</a>。</muted-text>`,
            amount: '金額',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            deletePerDiemRate: '日当料金を削除',
            findPerDiemRate: '日当料金を見つける',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            emptyList: {
                title: '日当',
                subtitle: '日当の設定を行い、従業員の1日の支出を管理します。スプレッドシートからレートをインポートして始めましょう。',
            },
            importPerDiemRates: '日当料金をインポート',
            editPerDiemRate: '日当料金を編集',
            editPerDiemRates: '日当のレートを編集',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `この宛先を更新すると、すべての${destination}の日当サブレートが変更されます。`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `この通貨を更新すると、すべての${destination}の日当サブレートが変更されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '実費経費がQuickBooks Desktopにエクスポートされる方法を設定します。',
            exportOutOfPocketExpensesCheckToggle: 'チェックを「後で印刷」としてマークする',
            exportDescription: 'ExpensifyデータをQuickBooks Desktopにエクスポートする方法を設定します。',
            date: 'エクスポート日付',
            exportInvoices: '請求書をエクスポート',
            exportExpensifyCard: 'Expensifyカードの取引をエクスポートする',
            account: 'アカウント',
            accountDescription: '仕訳を投稿する場所を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付先を選択してください。',
            creditCardAccount: 'クレジットカードアカウント',
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをQuickBooks Desktopにエクスポートしてください。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日付',
                        description: 'レポートがQuickBooks Desktopにエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            exportCheckDescription: '各Expensifyレポートに対して項目別の小切手を作成し、以下の銀行口座から送信します。',
            exportJournalEntryDescription: '各Expensifyレポートに対して項目別の仕訳を作成し、以下のアカウントに投稿します。',
            exportVendorBillDescription:
                '私たちは、各Expensifyレポートのために項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktopは、仕訳帳エクスポートで税金をサポートしていません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳帳エントリ',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '各Expensifyレポートに対して項目別の小切手を作成し、以下の銀行口座から送信します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」ベンダーを作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '私たちは、各Expensifyレポートに対して最後の経費の日付を含む項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '小切手の送付先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '場所が有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '場所が有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Desktopにアカウントを追加して、接続を再同期してください。',
            qbdSetup: 'QuickBooks Desktop のセットアップ',
            requiredSetupDevice: {
                title: 'このデバイスから接続できません',
                body1: 'QuickBooks Desktopの会社ファイルをホストしているコンピュータからこの接続を設定する必要があります。',
                body2: '接続が完了すると、どこからでも同期とエクスポートが可能になります。',
            },
            setupPage: {
                title: 'このリンクを開いて接続してください。',
                body: 'セットアップを完了するには、QuickBooks Desktop が実行されているコンピューターで次のリンクを開いてください。',
                setupErrorTitle: '問題が発生しました',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>現在、QuickBooks Desktopへの接続ができません。問題が解決しない場合は、後でもう一度お試しいただくか、<a href="${conciergeLink}">Conciergeまでご連絡ください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks DesktopからExpensifyにインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            items: 'アイテム',
            customers: '顧客/プロジェクト',
            exportCompanyCardsDescription: '会社カードの購入をQuickBooks Desktopにエクスポートする方法を設定します。',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            accountsDescription: 'QuickBooks Desktopの勘定科目表は、Expensifyにカテゴリーとしてインポートされます。',
            accountsSwitchTitle: '新しいアカウントを有効または無効なカテゴリとしてインポートすることを選択します。',
            accountsSwitchDescription: '有効になっているカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'ExpensifyでQuickBooks Desktopクラスをどのように処理するか選択してください。',
            tagsDisplayedAsDescription: 'ラインアイテムレベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'ExpensifyでQuickBooks Desktopの顧客/プロジェクトをどのように処理するか選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日QuickBooks Desktopと自動的に同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensifyは、QuickBooks Desktopに既に存在しない場合、自動的にベンダーを作成します。',
            },
            itemsDescription: 'ExpensifyでQuickBooks Desktopの項目をどのように処理するか選択します。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担の経費は最終承認時にエクスポートされます。',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担の経費は支払われたときにエクスポートされます。',
                },
            },
        },
        qbo: {
            connectedTo: '接続済み',
            importDescription: 'QuickBooks OnlineからExpensifyにインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            locations: '場所',
            customers: '顧客/プロジェクト',
            accountsDescription: 'あなたのQuickBooks Onlineの勘定科目表は、Expensifyにカテゴリーとしてインポートされます。',
            accountsSwitchTitle: '新しいアカウントを有効または無効なカテゴリとしてインポートすることを選択します。',
            accountsSwitchDescription: '有効になっているカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'ExpensifyでQuickBooks Onlineクラスの処理方法を選択します。',
            customersDescription: 'ExpensifyでQuickBooks Onlineの顧客/プロジェクトをどのように処理するか選択してください。',
            locationsDescription: 'ExpensifyでQuickBooks Onlineのロケーションをどのように処理するか選択してください。',
            taxesDescription: 'ExpensifyでQuickBooks Onlineの税金をどのように処理するか選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Onlineは、小切手や仕入先請求書の行レベルでの場所をサポートしていません。行レベルで場所を持ちたい場合は、仕訳帳エントリとクレジット/デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Onlineは仕訳帳の税金をサポートしていません。エクスポートオプションを仕入先請求書または小切手に変更してください。',
            exportDescription: 'ExpensifyデータをQuickBooks Onlineにエクスポートする方法を設定します。',
            date: 'エクスポート日付',
            exportInvoices: '請求書をエクスポート',
            exportExpensifyCard: 'Expensifyカードの取引をエクスポートする',
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをQuickBooks Onlineにエクスポートしてください。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日付',
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
            exportInvoicesDescription: 'このアカウントを使用して、請求書を QuickBooks Online にエクスポートします。',
            exportCompanyCardsDescription: '会社カードの購入をQuickBooks Onlineにエクスポートする方法を設定します。',
            vendor: 'ベンダー',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            exportOutOfPocketExpensesDescription: '実費経費がQuickBooks Onlineにエクスポートされる方法を設定します。',
            exportCheckDescription: '各Expensifyレポートに対して項目別の小切手を作成し、以下の銀行口座から送信します。',
            exportJournalEntryDescription: '各Expensifyレポートに対して項目別の仕訳を作成し、以下のアカウントに投稿します。',
            exportVendorBillDescription:
                '私たちは、各Expensifyレポートのために項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
            account: 'アカウント',
            accountDescription: '仕訳を投稿する場所を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付先を選択してください。',
            creditCardAccount: 'クレジットカードアカウント',
            companyCardsLocationEnabledDescription:
                'QuickBooks Onlineは、仕入先請求書のエクスポートでロケーションをサポートしていません。ワークスペースでロケーションが有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Onlineは仕訳帳エクスポートで税金をサポートしていません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日QuickBooks Onlineと自動的に同期します。',
                inviteEmployees: '従業員を招待する',
                inviteEmployeesDescription: 'QuickBooks Onlineの従業員記録をインポートし、従業員をこのワークスペースに招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensifyは、QuickBooks Onlineに既に存在しない場合は自動的にベンダーを作成し、請求書をエクスポートする際に顧客を自動作成します。',
                reimbursedReportsDescription: 'レポートがExpensify ACHを使用して支払われるたびに、対応する請求書支払いが以下のQuickBooks Onlineアカウントに作成されます。',
                qboBillPaymentAccount: 'QuickBooks 請求書支払口座',
                qboInvoiceCollectionAccount: 'QuickBooks 請求書回収アカウント',
                accountSelectDescription: '請求書を支払う場所を選択すると、QuickBooks Onlineで支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の支払いを受け取る場所を選択すると、QuickBooks Onlineで支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳帳エントリ',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    '私たちは、デビットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Debit Card Misc.」ベンダーを作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」ベンダーを作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '私たちは、各Expensifyレポートに対して最後の経費の日付を含む項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    '場所が有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: '場所が有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポートに有効なアカウントを選択してください。',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートのために有効なアカウントを選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手のエクスポート用に有効なアカウントを選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書エクスポートを使用するには、QuickBooks Onlineで買掛金勘定を設定してください。',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Onlineで仕訳アカウントを設定してください。',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェックエクスポートを使用するには、QuickBooks Onlineで銀行口座を設定してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Onlineにアカウントを追加し、接続を再同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担の経費は最終承認時にエクスポートされます。',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担の経費は支払われたときにエクスポートされます。',
                },
            },
        },
        workspaceList: {
            joinNow: '今すぐ参加',
            askToJoin: '参加を依頼する',
        },
        xero: {
            organization: 'Xero組織',
            organizationDescription: 'データをインポートしたいXero組織を選択してください。',
            importDescription: 'XeroからExpensifyにインポートするコーディング設定を選択します。',
            accountsDescription: 'あなたのXero勘定科目表は、Expensifyにカテゴリーとしてインポートされます。',
            accountsSwitchTitle: '新しいアカウントを有効または無効なカテゴリとしてインポートすることを選択します。',
            accountsSwitchDescription: '有効になっているカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリ',
            trackingCategoriesDescription: 'ExpensifyでXeroのトラッキングカテゴリをどのように処理するか選択してください。',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero ${categoryName} をマッピングする`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Xeroにエクスポートする際に${categoryName}をどこにマッピングするか選択してください。`,
            customers: '顧客への再請求',
            customersDescription: 'Expensifyで顧客に再請求するかどうかを選択します。Xeroの顧客連絡先は経費にタグ付けでき、Xeroに売上請求書としてエクスポートされます。',
            taxesDescription: 'ExpensifyでXeroの税金をどのように処理するか選択してください。',
            notImported: 'インポートされていません',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポートフィールド',
            },
            exportDescription: 'ExpensifyデータをXeroにエクスポートする方法を設定します。',
            purchaseBill: '購入請求書',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、以下のXero銀行口座に銀行取引として記録され、取引日付は銀行明細書の日付と一致します。',
            bankTransactions: '銀行取引',
            xeroBankAccount: 'Xero銀行口座',
            xeroBankAccountDescription: '経費を銀行取引として記録する場所を選択してください。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで購入請求書としてエクスポートされます。',
            purchaseBillDate: '購入請求書の日付',
            exportInvoices: '請求書をエクスポート',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '売上請求書には、請求書が送信された日付が常に表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日自動的にXeroと同期します。',
                purchaseBillStatusTitle: '購入請求書のステータス',
                reimbursedReportsDescription: 'レポートがExpensify ACHを使用して支払われるたびに、対応する請求書の支払いが以下のXeroアカウントに作成されます。',
                xeroBillPaymentAccount: 'Xeroの請求書支払いアカウント',
                xeroInvoiceCollectionAccount: 'Xero請求書回収アカウント',
                xeroBillPaymentAccountDescription: '支払い元を選択すると、Xeroで支払いが作成されます。',
                invoiceAccountSelectorDescription: '請求書の支払いを受け取る場所を選択すると、Xeroで支払いを作成します。',
            },
            exportDate: {
                label: '購入請求書の日付',
                description: 'この日付を使用してレポートをXeroにエクスポートしてください。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日付',
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
                description: 'このステータスを使用して、購入請求書をXeroにエクスポートします。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xeroにアカウントを追加し、再度接続を同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担の経費は最終承認時にエクスポートされます。',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担の経費は支払われたときにエクスポートされます。',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをSage Intacctにエクスポートしてください。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日付',
                        description: 'レポートがSage Intacctにエクスポートされた日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            reimbursableExpenses: {
                description: '実費経費がSage Intacctにエクスポートされる方法を設定します。',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '経費報告書',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '仕入先請求書',
                },
            },
            nonReimbursableExpenses: {
                description: '会社カードの購入がSage Intacctにエクスポートされる方法を設定します。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'クレジットカード',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '仕入先請求書',
                },
            },
            creditCardAccount: 'クレジットカードアカウント',
            defaultVendor: 'デフォルトのベンダー',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Sage Intacctで一致するベンダーがない${isReimbursable ? '' : 'non-'}の払い戻し可能な経費に適用されるデフォルトのベンダーを設定します。`,
            exportDescription: 'ExpensifyデータをSage Intacctにエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者で構いませんが、ドメイン設定で個々の会社カードに異なるエクスポートアカウントを設定する場合は、ドメイン管理者である必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントでエクスポート用のレポートを確認できます。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacctにアカウントを追加し、再度接続を同期してください。`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensifyは毎日自動的にSage Intacctと同期します。',
            inviteEmployees: '従業員を招待する',
            inviteEmployeesDescription:
                'Sage Intacctの従業員記録をインポートし、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認となり、メンバーのページでさらに設定できます。',
            syncReimbursedReports: '払い戻されたレポートを同期する',
            syncReimbursedReportsDescription: 'Expensify ACHを使用してレポートが支払われるたびに、対応する請求書の支払いが以下のSage Intacctアカウントに作成されます。',
            paymentAccount: 'Sage Intacct支払いアカウント',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担の経費は最終承認時にエクスポートされます。',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担の経費は支払われたときにエクスポートされます。',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'NetSuiteからデータをインポートしたい子会社を選択してください。',
            exportDescription: 'ExpensifyデータをNetSuiteにエクスポートする方法を設定します。',
            exportInvoices: '請求書をエクスポート',
            journalEntriesTaxPostingAccount: '仕訳税計上口座',
            journalEntriesProvTaxPostingAccount: '仕訳の州税計上口座',
            foreignCurrencyAmount: '外国通貨額をエクスポート',
            exportToNextOpenPeriod: '次のオープン期間にエクスポート',
            nonReimbursableJournalPostingAccount: '非払い戻し仕訳記入アカウント',
            reimbursableJournalPostingAccount: '払い戻し可能な仕訳記帳口座',
            journalPostingPreference: {
                label: '仕訳の投稿設定',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各レポートの単一の項目別エントリ',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各経費の単一エントリ',
                },
            },
            invoiceItem: {
                label: '請求書項目',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '作成してください。',
                        description: 'エクスポート時に（既に存在しない場合は）「Expensify請求書の項目」を作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: 'Expensifyの請求書を以下で選択された項目に結びつけます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをNetSuiteにエクスポートしてください。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日付',
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
                        label: '経費報告書',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カードの経費は、以下で指定されたNetSuiteアカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '仕入先請求書',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カードの経費は、以下で指定されたNetSuiteアカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳帳エントリ',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カードの経費は、以下で指定されたNetSuiteアカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*Settings > Domains > Company Cards* に移動してください。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに変更した場合、NetSuiteベンダーと個別カードの仕訳勘定が無効になります。\n\n心配ありません。後で元に戻したい場合に備えて、以前の選択設定は保存しておきます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日自動的にNetSuiteと同期します。',
                reimbursedReportsDescription: 'レポートがExpensify ACHを使用して支払われるたびに、対応する請求書支払いが以下のNetSuiteアカウントに作成されます。',
                reimbursementsAccount: '払い戻し口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、関連する支払いがNetSuiteで作成されます。',
                collectionsAccount: 'コレクションアカウント',
                collectionsAccountDescription: '請求書がExpensifyで支払済みとしてマークされ、NetSuiteにエクスポートされると、以下のアカウントに表示されます。',
                approvalAccount: 'A/P承認アカウント',
                approvalAccountDescription:
                    'NetSuiteで取引が承認されるアカウントを選択してください。払い戻されたレポートを同期している場合、これは請求書の支払いが作成されるアカウントでもあります。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定する',
                inviteEmployeesDescription:
                    'NetSuiteの従業員記録をインポートし、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認になり、*メンバー* ページでさらに設定できます。',
                autoCreateEntities: '従業員/ベンダーを自動作成',
                enableCategories: '新しくインポートされたカテゴリーを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定された優先トランザクションフォームを使用してエントリを作成します。あるいは、特定のトランザクションフォームを指定して使用することもできます。',
                customFormIDReimbursable: '自己負担経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費報告承認レベル',
                    description: 'Expensifyで経費報告書が承認され、NetSuiteにエクスポートされた後、NetSuiteで投稿する前に追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuiteのデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'スーパーバイザー承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '会計のみ承認済み',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '監督者と会計が承認しました',
                    },
                },
                accountingMethods: {
                    label: 'エクスポートのタイミング',
                    description: '経費をエクスポートするタイミングを選択:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担の経費は最終承認時にエクスポートされます。',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担の経費は支払われたときにエクスポートされます。',
                    },
                },
                exportVendorBillsTo: {
                    label: 'ベンダー請求書承認レベル',
                    description: 'ベンダーの請求書がExpensifyで承認され、NetSuiteにエクスポートされると、NetSuiteで投稿する前に追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuiteのデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '投稿が承認されました',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensifyで仕訳が承認され、NetSuiteにエクスポートされた後、NetSuiteで仕訳を記帳する前に追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuiteのデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '投稿が承認されました',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォームIDを入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuiteでアカウントを追加し、再度接続を同期してください。',
            noVendorsFound: 'ベンダーが見つかりませんでした',
            noVendorsFoundDescription: 'NetSuiteにベンダーを追加し、再度接続を同期してください。',
            noItemsFound: '請求書の項目が見つかりませんでした',
            noItemsFoundDescription: 'NetSuiteで請求書項目を追加し、再度接続を同期してください。',
            noSubsidiariesFound: '子会社が見つかりませんでした',
            noSubsidiariesFoundDescription: 'NetSuiteに子会社を追加し、再度接続を同期してください。',
            tokenInput: {
                title: 'NetSuiteのセットアップ',
                formSteps: {
                    installBundle: {
                        title: 'Expensifyバンドルをインストールする',
                        description: 'NetSuiteで、*Customization > SuiteBundler > Search & Install Bundles* に移動し、「Expensify」を検索してバンドルをインストールします。',
                    },
                    enableTokenAuthentication: {
                        title: 'トークンベースの認証を有効にする',
                        description: 'NetSuiteで、*Setup > Company > Enable Features > SuiteCloud* に移動し、*token-based authentication* を有効にします。',
                    },
                    enableSoapServices: {
                        title: 'SOAPウェブサービスを有効にする',
                        description: 'NetSuiteで、*Setup > Company > Enable Features > SuiteCloud* に移動し、*SOAP Web Services* を有効にします。',
                    },
                    createAccessToken: {
                        title: 'アクセストークンを作成',
                        description:
                            'NetSuiteで、*Setup > Users/Roles > Access Tokens* に移動し、「Expensify」アプリおよび「Expensify Integration」または「Administrator」ロールのアクセストークンを作成します。\n\n*重要:* このステップで *Token ID* と *Token Secret* を必ず保存してください。次のステップで必要になります。',
                    },
                    enterCredentials: {
                        title: 'NetSuiteの認証情報を入力してください',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'トークンID',
                            netSuiteTokenSecret: 'トークンシークレット',
                        },
                        netSuiteAccountIDDescription: 'NetSuiteで、*Setup > Integration > SOAP Web Services Preferences*に移動します。',
                    },
                },
            },
            import: {
                expenseCategories: '経費カテゴリー',
                expenseCategoriesDescription: 'あなたのNetSuite経費カテゴリーは、Expensifyにカテゴリーとしてインポートされます。',
                crossSubsidiaryCustomers: '複数子会社間の顧客/プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'ExpensifyでNetSuiteの*部門*をどのように処理するか選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensifyで*クラス*をどのように処理するか選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensifyで*ロケーション*をどのように処理するか選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客/プロジェクト',
                    subtitle: 'ExpensifyでNetSuiteの「顧客」と「プロジェクト」をどのように処理するか選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuiteから税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下のオプションから選択してください:',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join('と')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `${fieldName}を入力してください`,
                    customSegments: {
                        title: 'カスタムセグメント/レコード',
                        addText: 'カスタムセグメント/レコードを追加',
                        recordTitle: 'カスタムセグメント/レコード',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '詳細な指示を表示',
                        helpText: 'カスタムセグメント/レコードの設定について。',
                        emptyTitle: 'カスタムセグメントまたはカスタムレコードを追加',
                        fields: {
                            segmentName: '名前',
                            internalID: '内部ID',
                            scriptID: 'スクリプトID',
                            customRecordScriptID: 'トランザクション列ID',
                            mapping: '表示される内容',
                        },
                        removeTitle: 'カスタムセグメント/レコードを削除',
                        removePrompt: 'このカスタムセグメント/レコードを削除してもよろしいですか？',
                        addForm: {
                            customSegmentName: 'カスタムセグメント名',
                            customRecordName: 'カスタムレコード名',
                            segmentTitle: 'カスタムセグメント',
                            customSegmentAddTitle: 'カスタムセグメントを追加',
                            customRecordAddTitle: 'カスタムレコードを追加',
                            recordTitle: 'カスタムレコード',
                            segmentRecordType: 'カスタムセグメントまたはカスタムレコードを追加しますか？',
                            customSegmentNameTitle: 'カスタムセグメント名は何ですか？',
                            customRecordNameTitle: 'カスタムレコード名は何ですか？',
                            customSegmentNameFooter: `NetSuiteの*カスタマイズ > リンク、レコード、フィールド > カスタムセグメント*ページでカスタムセグメント名を見つけることができます。\n\n_詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customRecordNameFooter: `NetSuiteでカスタムレコード名を見つけるには、グローバル検索で「Transaction Column Field」を入力します。\n\n_詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customSegmentInternalIDTitle: '内部IDは何ですか？',
                            customSegmentInternalIDFooter: `まず、NetSuiteで内部IDを有効にするには、*Home > Set Preferences > Show Internal ID*に移動してください。\n\nNetSuiteでカスタムセグメントの内部IDを見つけるには、以下の手順に従ってください：\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*に移動します。\n2. カスタムセグメントをクリックします。\n3. *Custom Record Type*の隣にあるハイパーリンクをクリックします。\n4. 下部のテーブルで内部IDを見つけます。\n\n_詳細な手順については、[こちらのヘルプサイト](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})をご覧ください。_`,
                            customRecordInternalIDFooter: `NetSuiteでカスタムレコードの内部IDを見つけるには、次の手順に従います：\n\n1. グローバル検索に「Transaction Line Fields」と入力します。\n2. カスタムレコードをクリックします。\n3. 左側に内部IDを見つけます。\n\n_詳細な手順については、[ヘルプサイト](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})をご覧ください。_`,
                            customSegmentScriptIDTitle: 'スクリプトIDは何ですか？',
                            customSegmentScriptIDFooter: `NetSuiteでカスタムセグメントスクリプトIDを見つけるには、次の手順に従ってください：\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*を選択します。\n2. カスタムセグメントをクリックします。\n3. 画面下部近くの*Application and Sourcing*タブをクリックし、次のいずれかを選択します：\n    a. カスタムセグメントをExpensifyで*タグ*（ラインアイテムレベル）として表示したい場合は、*Transaction Columns*サブタブをクリックし、*Field ID*を使用します。\n    b. カスタムセグメントをExpensifyで*レポートフィールド*（レポートレベル）として表示したい場合は、*Transactions*サブタブをクリックし、*Field ID*を使用します。\n\n_詳細な手順については、[こちらのヘルプサイト](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})をご覧ください。_`,
                            customRecordScriptIDTitle: 'トランザクション列IDは何ですか？',
                            customRecordScriptIDFooter: `NetSuiteでカスタムレコードスクリプトIDを見つけるには、次の手順に従ってください：\n\n1. グローバル検索で「Transaction Line Fields」と入力します。\n2. カスタムレコードをクリックします。\n3. 左側にスクリプトIDを見つけます。\n\n_詳細な手順については、[ヘルプサイト](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})をご覧ください。_`,
                            customSegmentMappingTitle: 'このカスタムセグメントはExpensifyでどのように表示されるべきですか？',
                            customRecordMappingTitle: 'このカスタムレコードはExpensifyでどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `この${fieldName?.toLowerCase()}を持つカスタムセグメント/レコードはすでに存在します`,
                        },
                    },
                    customLists: {
                        title: 'カスタムリスト',
                        addText: 'カスタムリストを追加',
                        recordTitle: 'カスタムリスト',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '詳細な指示を表示',
                        helpText: 'カスタムリストの設定について。',
                        emptyTitle: 'カスタムリストを追加',
                        fields: {
                            listName: '名前',
                            internalID: '内部ID',
                            transactionFieldID: 'トランザクションフィールドID',
                            mapping: '表示される内容',
                        },
                        removeTitle: 'カスタムリストを削除',
                        removePrompt: 'このカスタムリストを削除してもよろしいですか？',
                        addForm: {
                            listNameTitle: 'カスタムリストを選択',
                            transactionFieldIDTitle: '取引フィールドIDは何ですか？',
                            transactionFieldIDFooter: `NetSuiteでトランザクションフィールドIDを見つけるには、次の手順に従ってください：\n\n1. グローバル検索で「Transaction Line Fields」と入力します。\n2. カスタムリストにクリックします。\n3. 左側にトランザクションフィールドIDを見つけます。\n\n_詳細な手順については、[ヘルプサイト](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})をご覧ください。_`,
                            mappingTitle: 'このカスタムリストはExpensifyでどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールドIDを持つカスタムリストは既に存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuiteの従業員デフォルト',
                        description: 'Expensifyにインポートされず、エクスポート時に適用されます。',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `NetSuiteで${importField}を使用する場合、Expense ReportまたはJournal Entryへのエクスポート時に従業員記録に設定されたデフォルトを適用します。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: 'ラインアイテムレベル',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} は、従業員のレポートの各経費に対して選択可能になります。`,
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
            sageIntacctSetup: 'Sage Intacctのセットアップ',
            prerequisitesTitle: '接続する前に...',
            downloadExpensifyPackage: 'Sage Intacct用のExpensifyパッケージをダウンロード',
            followSteps: 'Sage Intacctへの接続方法については、手順に従ってください。',
            enterCredentials: 'Sage Intacctの資格情報を入力してください',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct 従業員デフォルト',
            employeeDefaultDescription: '従業員のデフォルト部門は、Sage Intacct に存在する場合、その経費に適用されます。',
            displayedAsTagDescription: '部門は、従業員のレポートの各経費ごとに選択可能になります。',
            displayedAsReportFieldDescription: '部門の選択は、従業員のレポート上のすべての経費に適用されます。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Sage Intacct <strong>${mappingTitle}</strong>をExpensifyでどのように処理するかを選択します。`,
            expenseTypes: '経費タイプ',
            expenseTypesDescription: 'あなたのSage Intacctの経費タイプは、Expensifyにカテゴリーとしてインポートされます。',
            accountTypesDescription: 'あなたのSage Intacct勘定科目表は、Expensifyにカテゴリとしてインポートされます。',
            importTaxDescription: 'Sage Intacctから購入税率をインポートします。',
            userDefinedDimensions: 'ユーザー定義のディメンション',
            addUserDefinedDimension: 'ユーザー定義のディメンションを追加',
            integrationName: '統合名',
            dimensionExists: 'この名前のディメンションは既に存在します。',
            removeDimension: 'ユーザー定義のディメンションを削除',
            removeDimensionPrompt: 'このユーザー定義ディメンションを削除してもよろしいですか？',
            userDefinedDimension: 'ユーザー定義ディメンション',
            addAUserDefinedDimension: 'ユーザー定義のディメンションを追加',
            detailedInstructionsLink: '詳細な指示を表示',
            detailedInstructionsRestOfSentence: 'ユーザー定義のディメンションを追加する際に。',
            userDimensionsAdded: () => ({
                one: '1 UDDが追加されました',
                other: (count: number) => `${count} UDDsが追加されました`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部門';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'ロケーション';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '顧客';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'プロジェクト（仕事）';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: '無料',
            control: 'コントロール',
            collect: '収集する',
        },
        companyCards: {
            addCards: 'カードを追加',
            selectCards: 'カードを選択',
            addNewCard: {
                other: 'その他',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `あなたのカードプロバイダーは誰ですか？`,
                whoIsYourBankAccount: 'あなたの銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: 'どのように銀行に接続したいですか？',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>の詳細については、こちらをご覧ください。</muted-text>`,
                commercialFeedDetails: '銀行との設定が必要です。これは通常、大企業によって使用され、資格がある場合には最良のオプションであることが多いです。',
                commercialFeedPlaidDetails: `銀行との設定が必要ですが、私たちが案内します。これは通常、大企業に限定されています。`,
                directFeedDetails: '最も簡単な方法です。マスター資格情報を使用してすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `${provider}フィードを有効にする`,
                    heading: '私たちはあなたのカード発行会社と直接統合しており、取引データをExpensifyに迅速かつ正確にインポートできます。\n\n始めるには、次の手順に従ってください:',
                    visa: '私たちはVisaとグローバルな統合をしていますが、適格性は銀行やカードプログラムによって異なります。\n\n始めるには、次のことを行ってください:',
                    mastercard: '私たちはMastercardとのグローバルな統合を持っていますが、適格性は銀行やカードプログラムによって異なります。\n\n始めるには、次の手順に従ってください。',
                    vcf: `1. Visa Commercial Cardsの設定方法についての詳細な手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。\n\n2. あなたのプログラムに商業フィードをサポートしているかを確認するために、[銀行に連絡](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})し、フィードを有効にするよう依頼してください。\n\n3. *フィードが有効になり、その詳細を取得したら、次の画面に進んでください。*`,
                    gl1025: `1. American Expressがあなたのプログラムに商業フィードを有効にできるかどうかを確認するには、[このヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})を訪問してください。\n\n2. フィードが有効になると、Amexはあなたにプロダクションレターを送ります。\n\n3. *フィード情報を取得したら、次の画面に進んでください。*`,
                    cdf: `1. Mastercard Commercial Cardsの設定方法についての詳細な手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。\n\n2. あなたのプログラムに商業フィードをサポートしているかを確認するために、[銀行に連絡](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})し、フィードを有効にするよう依頼してください。\n\n3. *フィードが有効になり、その詳細を取得したら、次の画面に進んでください。*`,
                    stripe: `1. Stripeのダッシュボードにアクセスし、[設定](${CONST.COMPANY_CARDS_STRIPE_HELP})に移動します。\n\n2. 製品統合の下で、Expensifyの横にある有効化をクリックします。\n\n3. フィードが有効になったら、下の送信をクリックすると、追加作業を開始します。`,
                },
                whatBankIssuesCard: 'これらのカードを発行している銀行はどこですか？',
                enterNameOfBank: '銀行名を入力してください',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細は何ですか？',
                        processorLabel: 'プロセッサーID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社ID',
                        helpLabel: 'これらのIDはどこで見つけることができますか？',
                    },
                    gl1025: {
                        title: `Amex配信ファイル名は何ですか？`,
                        fileNameLabel: '配信ファイル名',
                        helpLabel: '配信ファイル名はどこで見つけますか？',
                    },
                    cdf: {
                        title: `Mastercardの配布IDは何ですか？`,
                        distributionLabel: '配信ID',
                        helpLabel: '配布IDはどこで見つけられますか？',
                    },
                },
                amexCorporate: 'カードの表に「Corporate」と書かれている場合はこれを選択してください',
                amexBusiness: 'カードの表面に「Business」と書かれている場合はこれを選択してください。',
                amexPersonal: '個人用のカードの場合はこれを選択してください',
                error: {
                    pleaseSelectProvider: '続行する前にカードプロバイダーを選択してください',
                    pleaseSelectBankAccount: '続行する前に銀行口座を選択してください。',
                    pleaseSelectBank: '続行する前に銀行を選択してください',
                    pleaseSelectCountry: '続行する前に国を選択してください',
                    pleaseSelectFeedType: '続行する前にフィードタイプを選択してください',
                },
                exitModal: {
                    title: 'うまく動作していませんか？',
                    prompt: 'カードの追加を完了していないようです。問題が発生した場合はお知らせください。解決のお手伝いをいたします。',
                    confirmText: '問題を報告する',
                    cancelText: 'スキップ',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '月の最終日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '月の最終営業日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'カスタム月日',
            },
            assignCard: 'カードを割り当てる',
            findCard: 'カードを探す',
            cardNumber: 'カード番号',
            commercialFeed: '商業フィード',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}カード`,
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseCard: 'カードを選んでください',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `<strong>${assignee}</strong>のカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードにはアクティブなカードがありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>あるいは、何かが壊れているかもしれません。いずれにせよ、ご不明な点があれば、<concierge-link>Concierge までお問い合わせ</concierge-link>ください。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択してください',
            startDateDescription: 'この日付以降のすべての取引をインポートします。日付が指定されていない場合は、銀行が許可する限り遡ります。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタムクローズ日',
            letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
            confirmationDescription: 'すぐに取引のインポートを開始します。',
            cardholder: 'カードホルダー',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィードの接続が切れています。どうか <a href="#">銀行にログイン</a> すると、再び接続を確立できます。</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `${assignee}に${link}を割り当てました！インポートされた取引はこのチャットに表示されます。`,
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limitedは、Plaid Financial Ltd.の代理店であり、支払いサービス規則2017に基づいて金融行動監視機構によって規制されている認可支払い機関です（会社参照番号: 804718）。Plaidは、Expensify Limitedをその代理店として通じて、規制されたアカウント情報サービスを提供します。',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensifyカードを発行および管理する',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            verificationInProgress: '確認中...',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensifyカードの発行準備が整ったら、Conciergeがお知らせします。',
            disclaimer:
                'The Expensify Visa® Commercial Cardは、Visa U.S.A. Inc.からのライセンスに基づき、FDICメンバーであるThe Bancorp Bank, N.A.によって発行されており、Visaカードを受け付けるすべての加盟店で使用できるわけではありません。Apple®およびAppleロゴ®は、米国およびその他の国で登録されたApple Inc.の商標です。App StoreはApple Inc.のサービスマークです。Google PlayおよびGoogle Playロゴは、Google LLCの商標です。',
            issueCard: 'カードを発行',
            euUkDisclaimer:
                'EEA居住者に提供されるカードはTransact Payments Malta Limitedによって発行され、英国居住者に提供されるカードはVisa Europe Limitedのライセンスに基づきTransact Payments Limitedによって発行されます。Transact Payments Malta Limitedは、1994年金融機関法に基づき、マルタ金融サービス機構（Malta Financial Services Authority）により金融機関として正式に認可および規制されています。登録番号はC 91879です。Transact Payments Limitedは、ジブラルタル金融サービス委員会（Gibraltar Financial Service Commission）により認可および規制されています。',
            findCard: 'カードを探す',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '最後の4つ',
            limit: '制限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在の残高は、前回の決済日以降に発生したすべてのExpensifyカード取引の合計です。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `残高は${settlementDate}に決済されます。`,
            settleBalance: '残高を清算する',
            cardLimit: 'カード限度額',
            remainingLimit: '残りの制限',
            requestLimitIncrease: 'リクエスト制限の増加を要求する',
            remainingLimitDescription:
                '残りの限度額を計算する際には、いくつかの要因を考慮します。お客様としてのご利用期間、サインアップ時に提供されたビジネス関連情報、そしてビジネス銀行口座の利用可能な現金です。残りの限度額は日々変動する可能性があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース全体での毎月のExpensifyカード利用額に基づいています。',
            issueNewCard: '新しいカードを発行する',
            finishSetup: 'セットアップを完了する',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: 'Expensifyカードの残高を支払うために既存のビジネス銀行口座を選択するか、新しい銀行口座を追加してください。',
            accountEndingIn: '末尾が',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '決済口座',
            settlementAccountDescription: 'Expensifyカードの残高を支払うアカウントを選択してください。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `継続的な照合が正しく機能するように、この口座が<a href="${reconciliationAccountSettingsLink}">照合口座</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '決済頻度',
            settlementFrequencyDescription: 'Expensifyカードの残高をどのくらいの頻度で支払うか選択してください。',
            settlementFrequencyInfo: '月次決済に切り替えたい場合は、Plaidを通じて銀行口座を接続し、90日間のプラス残高履歴が必要です。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カードの詳細',
            cardPending: ({name}: {name: string}) => `${name}のアカウントが確認され次第、カードが発行されます。現在は保留中です。`,
            virtual: 'バーチャル',
            physical: '物理的',
            deactivate: 'カードを無効化する',
            changeCardLimit: 'カード限度額を変更',
            changeLimit: '制限を変更',
            smartLimitWarning: ({limit}: CharacterLimitParams) => `このカードの限度額を${limit}に変更すると、新しい取引はカード上でさらに経費を承認するまで拒否されます。`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `このカードの限度額を${limit}に変更すると、新しい取引は来月まで拒否されます。`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `このカードの限度額を${limit}に変更すると、新しい取引は拒否されます。`,
            changeCardLimitType: 'カード制限タイプを変更する',
            changeLimitType: '制限タイプを変更',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの限度額タイプをスマートリミットに変更すると、${limit} の未承認限度額に既に達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの限度額タイプを月次に変更すると、${limit} の月次限度額にすでに達しているため、新しい取引は拒否されます。`,
            addShippingDetails: '配送詳細を追加',
            issuedCard: ({assignee}: AssigneeParams) => `${assignee}にExpensifyカードを発行しました！カードは2～3営業日で到着します。`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `${assignee} に Expensify Card を発行しました！配送情報が確認され次第、カードは発送されます。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `${assignee}にバーチャル${link}を発行しました！カードはすぐに使用できます。`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} が配送情報を追加しました。Expensify Card は2～3営業日で到着します。`,
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座が確認されました',
            verifyingBankAccount: '銀行口座を確認しています...',
            verifyingBankAccountDescription: 'このアカウントがExpensifyカードを発行できることを確認するまでお待ちください。',
            bankAccountVerified: '銀行口座が確認されました！',
            bankAccountVerifiedDescription: 'ワークスペースメンバーにExpensifyカードを発行できるようになりました。',
            oneMoreStep: 'あと一歩...',
            oneMoreStepDescription: 'お客様の銀行口座を手動で確認する必要があるようです。指示が用意されているConciergeにアクセスしてください。',
            gotIt: '了解しました。',
            goToConcierge: 'Conciergeに行く',
        },
        categories: {
            deleteCategories: 'カテゴリを削除',
            deleteCategoriesPrompt: 'これらのカテゴリを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリを無効にする',
            disableCategory: 'カテゴリを無効にする',
            enableCategories: 'カテゴリを有効にする',
            enableCategory: 'カテゴリを有効にする',
            defaultSpendCategories: 'デフォルト支出カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引やスキャンされた領収書のために、商人の支出がどのように分類されるかをカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください。',
            categoryName: 'カテゴリ名',
            requiresCategory: 'メンバーはすべての経費を分類しなければなりません。',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `すべての経費は、${connectionName}にエクスポートするためにカテゴリ分けされなければなりません。`,
            subtitle: 'お金がどこで使われているかをより良く把握しましょう。デフォルトのカテゴリーを使用するか、自分で追加してください。',
            emptyCategories: {
                title: 'カテゴリが作成されていません',
                subtitle: '支出を整理するためにカテゴリーを追加してください。',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>あなたのカテゴリーは現在、会計接続からインポートされています。<a href="${accountingPageURL}">会計</a>に移動して変更してください。</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリの更新中にエラーが発生しました。もう一度お試しください。',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください。',
            addCategory: 'カテゴリを追加',
            editCategory: 'カテゴリを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを見つける',
            categoryRequiredError: 'カテゴリ名が必要です',
            existingCategoryError: 'この名前のカテゴリーはすでに存在します',
            invalidCategoryName: '無効なカテゴリ名',
            importedFromAccountingSoftware: '以下のカテゴリはあなたのからインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください。',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリーを削除または無効にすることはできません。',
                description: `ワークスペースでカテゴリーが必要なため、少なくとも1つのカテゴリーを有効にしておく必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: '以下のトグルを使用して、成長に応じて機能を有効にしてください。各機能は、さらなるカスタマイズのためにナビゲーションメニューに表示されます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームを拡大するのに役立つ機能を有効にする。',
            },
            manageSection: {
                title: '管理する',
                subtitle: '支出を予算内に抑えるための管理機能を追加します。',
            },
            earnSection: {
                title: '稼ぐ',
                subtitle: '収益を効率化し、より早く支払いを受け取りましょう。',
            },
            organizeSection: {
                title: '整理する',
                subtitle: '支出をグループ化して分析し、支払ったすべての税金を記録します。',
            },
            integrateSection: {
                title: '統合する',
                subtitle: 'Expensifyを人気のある金融製品に接続する。',
            },
            distanceRates: {
                title: '距離料金',
                subtitle: '料金を追加、更新、適用します。',
            },
            perDiem: {
                title: '日当',
                subtitle: '日当料金を設定して、従業員の日々の支出を管理します。',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '支出に関する洞察と管理を得る。',
                disableCardTitle: 'Expensifyカードを無効にする',
                disableCardPrompt: 'Expensifyカードはすでに使用中のため、無効にすることはできません。次のステップについてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeとチャットする',
                feed: {
                    title: 'Expensifyカードを取得する',
                    subTitle: 'ビジネス経費を効率化し、Expensifyの請求書を最大50％節約、さらに：',
                    features: {
                        cashBack: 'アメリカでの購入ごとにキャッシュバック',
                        unlimited: '無制限のバーチャルカード',
                        spend: '支出管理とカスタム制限',
                    },
                    ctaTitle: '新しいカードを発行する',
                },
            },
            companyCards: {
                title: '会社カード',
                subtitle: '既存の会社カードから支出をインポートします。',
                feed: {
                    title: '会社カードをインポート',
                    features: {
                        support: 'すべての主要カードプロバイダーに対応',
                        assignCards: 'チーム全体にカードを割り当てる',
                        automaticImport: '自動取引インポート',
                    },
                },
                bankConnectionError: '銀行接続の問題',
                connectWithPlaid: 'Plaid経由で接続してください',
                connectWithExpensifyCard: 'Expensifyカードをお試しください',
                bankConnectionDescription: 'カードをもう一度追加してみてください。そうでない場合は、',
                disableCardTitle: '会社カードを無効にする',
                disableCardPrompt: 'この機能が使用中のため、会社カードを無効にすることはできません。次のステップについてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeとチャットする',
                cardDetails: 'カードの詳細',
                cardNumber: 'カード番号',
                cardholder: 'カードホルダー',
                cardName: 'カード名',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `取引をエクスポートする${integration}アカウントを選択してください。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `取引をエクスポートする${integration}アカウントを選択してください。利用可能なアカウントを変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択します。`,
                lastUpdated: '最終更新日',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新する',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当て解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、ドラフトレポート上のすべての取引がカード所有者のアカウントから削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: 'カードフィードを他と区別できるようにユニークな名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択します。新しい取引はこれらのルールに従います。',
                cardFeedRestrictDeletingTransaction: '取引の削除を制限する',
                cardFeedAllowDeletingTransaction: '取引の削除を許可',
                removeCardFeed: 'カードフィードを削除',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName} フィードを削除`,
                removeCardFeedDescription: 'このカードフィードを削除してもよろしいですか？これにより、すべてのカードの割り当てが解除されます。',
                error: {
                    feedNameRequired: 'カードフィード名は必須です',
                    statementCloseDateRequired: '明細書の締め日を選択してください。',
                },
                corporate: '取引の削除を制限する',
                personal: '取引の削除を許可',
                setFeedNameDescription: '他のフィードと区別できるように、カードフィードにユニークな名前を付けてください。',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できます。新しい取引はこのルールに従います。',
                emptyAddedFeedTitle: '会社カードを割り当てる',
                emptyAddedFeedDescription: '最初のカードをメンバーに割り当てて始めましょう。',
                pendingFeedTitle: `リクエストを確認しています...`,
                pendingFeedDescription: `現在、フィードの詳細を確認しています。それが完了次第、経由でご連絡いたします。`,
                pendingBankTitle: 'ブラウザウィンドウを確認してください。',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `${bankName}に接続するには、開いたブラウザウィンドウを使用してください。ウィンドウが開かない場合は、`,
                pendingBankLink: 'こちらをクリックしてください',
                giveItNameInstruction: 'カードに他と区別できる名前を付けてください。',
                updating: '更新中...',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `このワークスペースは、複数のカードフィードが接続されているため（Expensifyカードを除く）、ダウングレードできません。どうぞ <a href="#">カードフィードを1つだけ保持</a> 続行する。`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `${connection}にアカウントを追加し、再度接続を同期してください。`,
                expensifyCardBannerTitle: 'Expensifyカードを取得する',
                expensifyCardBannerSubtitle: 'すべての米国での購入でキャッシュバックを楽しみ、Expensifyの請求書が最大50%オフ、無制限のバーチャルカードなど、さらに多くの特典があります。',
                expensifyCardBannerLearnMoreButton: '詳細を確認',
                statementCloseDateTitle: '利用明細書の締め日',
                statementCloseDateDescription: 'カード利用明細書の締め日をお知らせいただければ、Expensifyで一致する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認と支払い方法を設定します。',
                disableApprovalPrompt:
                    'このワークスペースのExpensifyカードは現在、承認に依存してスマートリミットを定義しています。承認を無効にする前に、スマートリミットを持つExpensifyカードの制限タイプを修正してください。',
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
                subtitle: '適格な税金を記録し、取り戻します。',
            },
            reportFields: {
                title: 'レポートフィールド',
                subtitle: '支出のカスタムフィールドを設定する。',
            },
            connections: {
                title: '会計',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: 'レシートパートナー',
                subtitle: 'レシートを自動的にインポート',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計を無効にするには、ワークスペースから会計接続を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uberを切断',
                disconnectText: 'この機能を無効にするには、まずUber for Business統合を切断してください。',
                description: 'この統合を切断してもよろしいですか?',
                confirmText: '了解',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText:
                    'このワークスペースのExpensifyカードは、承認ワークフローに依存してスマートリミットを定義しています。\n\nワークフローを無効にする前に、スマートリミットが設定されているカードのリミットタイプを変更してください。',
                confirmText: 'Expensifyカードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: '領収書の要求、高額支出のフラグ付け、その他。',
            },
        },
        reports: {
            reportsCustomTitleExamples: '例:',
            customReportNamesSubtitle: `<muted-text>当社の<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使用して、レポートのタイトルをカスタマイズできます。</muted-text>`,
            customNameTitle: 'デフォルトのレポートタイトル',
            customNameDescription: `当社の<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使用して、経費報告書のカスタム名を選択してください。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポート開始日: {report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名: {report:workspacename}',
            customNameReportIDExample: 'Report ID: {report:id}',
            customNameTotalExample: '合計: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'メンバーがカスタムレポート名を変更するのを防ぐ',
        },
        reportFields: {
            addField: 'フィールドを追加',
            delete: 'フィールドを削除',
            deleteFields: 'フィールドを削除',
            findReportField: 'レポートフィールドを見つける',
            deleteConfirmation: 'このレポートフィールドを削除してもよろしいですか？',
            deleteFieldsConfirmation: 'これらのレポートフィールドを削除してもよろしいですか？',
            emptyReportFields: {
                title: 'レポートフィールドが作成されていません',
                subtitle: 'レポートに表示されるカスタムフィールド（テキスト、日付、またはドロップダウン）を追加します。',
            },
            subtitle: 'レポートフィールドはすべての支出に適用され、追加情報を求めたいときに役立ちます。',
            disableReportFields: 'レポートフィールドを無効にする',
            disableReportFieldsConfirmation: 'よろしいですか？テキストおよび日付フィールドが削除され、リストが無効になります。',
            importedFromAccountingSoftware: '以下のレポートフィールドはあなたのからインポートされています',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '数式',
            textAlternateText: '自由入力フィールドを追加してください。',
            dateAlternateText: '日付選択用のカレンダーを追加します。',
            dropdownAlternateText: '選択肢のリストを追加してください。',
            formulaAlternateText: '数式フィールドを追加します。',
            nameInputSubtitle: 'レポートフィールドの名前を選択してください。',
            typeInputSubtitle: '使用するレポートフィールドのタイプを選択してください。',
            initialValueInputSubtitle: 'レポートフィールドに表示する開始値を入力してください。',
            listValuesInputSubtitle: 'これらの値は、レポートフィールドのドロップダウンに表示されます。有効な値はメンバーによって選択できます。',
            listInputSubtitle: 'これらの値は、レポートフィールドリストに表示されます。有効な値はメンバーが選択できます。',
            deleteValue: '値を削除',
            deleteValues: '値を削除',
            disableValue: '値を無効にする',
            disableValues: '値を無効にする',
            enableValue: '値を有効にする',
            enableValues: '値を有効にする',
            emptyReportFieldsValues: {
                title: 'リスト値が作成されていません',
                subtitle: 'レポートに表示されるカスタム値を追加します。',
            },
            deleteValuePrompt: 'このリストの値を削除してもよろしいですか？',
            deleteValuesPrompt: 'これらのリスト値を削除してもよろしいですか？',
            listValueRequiredError: 'リスト値の名前を入力してください',
            existingListValueError: 'この名前のリスト値はすでに存在します',
            editValue: '値を編集',
            listValues: '値を一覧表示',
            addValue: '価値を追加',
            existingReportFieldNameError: 'この名前のレポートフィールドは既に存在します',
            reportFieldNameRequiredError: 'レポートフィールド名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドのタイプを選択してください',
            circularReferenceError: 'このフィールドは自身を参照できません。更新してください。',
            reportFieldInitialValueRequiredError: 'レポートフィールドの初期値を選択してください',
            genericFailureMessage: 'レポートフィールドの更新中にエラーが発生しました。もう一度お試しください。',
        },
        tags: {
            tagName: 'タグ名',
            requiresTag: 'メンバーはすべての経費にタグを付けなければなりません。',
            trackBillable: '請求可能な経費を追跡する',
            customTagName: 'カスタムタグ名',
            enableTag: 'タグを有効にする',
            enableTags: 'タグを有効にする',
            requireTag: 'タグが必要',
            requireTags: 'タグを必須にする',
            notRequireTags: '必要としない',
            disableTag: 'タグを無効にする',
            disableTags: 'タグを無効にする',
            addTag: 'タグを追加',
            editTag: 'タグを編集',
            editTags: 'タグを編集',
            findTag: 'タグを見つける',
            subtitle: 'タグは、コストをより詳細に分類する方法を追加します。',
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text><a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">依存タグ</a>を使用しています。<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>してタグを更新できます。</muted-text>`,
            emptyTags: {
                title: 'タグが作成されていません',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'プロジェクト、場所、部門などを追跡するためのタグを追加します。',
                subtitleHTML: `<muted-text><centered-text>スプレッドシートをインポートして、プロジェクト、場所、部署などを追跡するためのタグを追加できます。タグファイルのフォーマットについては<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">こちらをご覧</a>ください。</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>タグは現在、会計接続からインポートされています。<a href="${accountingPageURL}">アカウンティング</a>に移動して変更してください。</centered-text></muted-text>`,
            },
            deleteTag: 'タグを削除',
            deleteTags: 'タグを削除',
            deleteTagConfirmation: 'このタグを削除してもよろしいですか？',
            deleteTagsConfirmation: 'これらのタグを削除してもよろしいですか？',
            deleteFailureMessage: 'タグの削除中にエラーが発生しました。もう一度お試しください。',
            tagRequiredError: 'タグ名が必要です',
            existingTagError: 'この名前のタグはすでに存在します',
            invalidTagNameError: 'タグ名は0にできません。別の値を選んでください。',
            genericFailureMessage: 'タグの更新中にエラーが発生しました。もう一度お試しください。',
            importedFromAccountingSoftware: '以下のタグはあなたのからインポートされます',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            tagRules: 'タグルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費を1種類のタグまたは複数のタグでコード化します。',
            configureMultiLevelTags: 'マルチレベルタグ付けのためのタグリストを設定します。',
            importMultiLevelTagsSupportingText: `こちらがタグのプレビューです。すべて問題なければ、下のボタンをクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列にGLコードがあります。',
            },
            tagLevel: {
                singleLevel: '単一レベルのタグ',
                multiLevel: 'マルチレベルタグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替える',
                prompt1: 'タグレベルを切り替えると、現在のすべてのタグが消去されます。',
                prompt2: '最初にお勧めします',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートすることによって。',
                prompt5: '詳細を確認',
                prompt6: 'タグレベルについて。',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当に大丈夫ですか？',
                prompt2: ' 既存のタグは上書きされますが、あなたは',
                prompt3: ' バックアップをダウンロード',
                prompt4: ' 最初。',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `スプレッドシートで*${columnCounts}列*が見つかりました。タグ名を含む列の横に*名前*を選択してください。また、タグのステータスを設定する列の横に*有効*を選択することもできます。`,
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: `ワークスペースでタグが必要なため、少なくとも1つのタグを有効にしておく必要があります。`,
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグをオプションにすることはできません',
                description: `ワークスペースの設定でタグが必要なため、少なくとも1つのタグを必須にする必要があります。`,
            },
            cannotMakeTagListRequired: {
                title: 'タグリストを必須にすることはできません',
                description: 'ポリシーに複数のタグレベルが設定されている場合のみ、タグリストを必須にできます。',
            },
            tagCount: () => ({
                one: '1日',
                other: (count: number) => `${count} タグ`,
            }),
        },
        taxes: {
            subtitle: '税名、税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペースの通貨デフォルト',
            foreignDefault: '外貨のデフォルト',
            customTaxName: 'カスタム税名',
            value: '値段',
            taxReclaimableOn: '税金の還付可能',
            taxRate: '税率',
            findTaxRate: '税率を見つける',
            error: {
                taxRateAlreadyExists: 'この税名は既に使用されています',
                taxCodeAlreadyExists: 'この税コードはすでに使用されています',
                valuePercentageRange: '0から100の間の有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名が必要です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Conciergeにヘルプを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Conciergeにヘルプを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Conciergeに助けを求めてください。',
                updateTaxClaimableFailureMessage: '返金可能な部分は、距離料金額より少なくなければなりません。',
            },
            deleteTaxConfirmation: 'この税金を削除してもよろしいですか？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `${taxAmount}の税金を削除してもよろしいですか？`,
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
            importedFromAccountingSoftware: '以下の税金はあなたのからインポートされています',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください。',
        },
        duplicateWorkspace: {
            title: '新しいワークスペースに名前を付けてください',
            selectFeatures: 'コピーする機能を選択してください',
            whichFeatures: '新しいワークスペースにコピーする機能はどれですか？',
            confirmDuplicate: '\n\n続行しますか?',
            categories: 'カテゴリと自動分類ルール',
            reimbursementAccount: '払い戻し口座',
            delayedSubmission: '遅延送信',
            welcomeNote: '新しいワークスペースの使用を開始してください',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `${newWorkspaceName ?? ''} を作成し、元のワークスペースの ${totalMembers ?? 0} 人のメンバーと共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースがありません',
            subtitle: '領収書の管理、経費精算、出張管理、請求書の送信などができます。',
            createAWorkspaceCTA: '開始する',
            features: {
                trackAndCollect: '領収書を追跡して収集する',
                reimbursements: '従業員に払い戻す',
                companyCards: '会社カードを管理する',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは、複数の人と話し合い、作業するのに最適な場所です。コラボレーションを始めるには、ワークスペースを作成するか参加してください。',
        },
        new: {
            newWorkspace: '新しいワークスペース',
            getTheExpensifyCardAndMore: 'Expensifyカードを取得して、さらに多くの特典を享受しましょう。',
            confirmWorkspace: 'ワークスペースを確認',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `マイグループワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}のワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'ワークスペースからメンバーを削除する際にエラーが発生しました。もう一度お試しください。',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `${memberName}を削除してもよろしいですか？`,
                other: 'これらのメンバーを削除してもよろしいですか？',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} はこのワークスペースの承認者です。このワークスペースの共有を解除すると、承認ワークフローで ${ownerName} というワークスペースの所有者に置き換えられます。`,
            removeMembersTitle: () => ({
                one: 'メンバーを削除',
                other: 'メンバーを削除',
            }),
            findMember: 'メンバーを探す',
            removeWorkspaceMemberButtonTitle: 'ワークスペースから削除',
            removeGroupMemberButtonTitle: 'グループから削除',
            removeRoomMemberButtonTitle: 'チャットから削除',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `${memberName}を削除してもよろしいですか？`,
            removeMemberTitle: 'メンバーを削除',
            transferOwner: 'オーナーを移行',
            makeMember: 'メンバーにする',
            makeAdmin: '管理者にする',
            makeAuditor: '監査人を作成',
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーを追加する際に問題が発生しました',
                cannotRemove: '自分自身やワークスペースの所有者を削除することはできません。',
                genericRemove: 'そのワークスペースメンバーの削除に問題が発生しました。',
            },
            addedWithPrimary: '一部のメンバーがプライマリーログインで追加されました。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `セカンダリーログイン ${secondaryLogin} によって追加されました。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `ワークスペースのメンバー総数: ${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `このワークスペースから${approver}を削除すると、承認ワークフローではワークスペースのオーナーである${workspaceOwner}に置き換えます。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} には承認すべき未処理の経費レポートがあります。ワークスペースから削除する前に、承認するよう依頼するか、そのレポートの管理を引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除できません。ワークフロー > 支払いの作成または追跡で新しい支払担当者を設定してから、もう一度お試しください。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、優先エクスポーターをワークスペースのオーナーである${workspaceOwner}に置き換えます。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、技術連絡先をワークスペースのオーナーである${workspaceOwner}に変更します。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} には対応が必要な未処理のレポートがあります。ワークスペースから削除する前に、必要な対応を完了するよう依頼してください。`,
        },
        card: {
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            issueCard: 'カードを発行',
            issueNewCard: {
                whoNeedsCard: '誰がカードを必要としていますか？',
                inviteNewMember: '新しいメンバーを招待',
                findMember: 'メンバーを探す',
                chooseCardType: 'カードタイプを選択',
                physicalCard: '物理カード',
                physicalCardDescription: '頻繁に支出する人に最適',
                virtualCard: 'バーチャルカード',
                virtualCardDescription: 'インスタントで柔軟',
                chooseLimitType: '制限タイプを選択',
                smartLimit: 'スマートリミット',
                smartLimitDescription: '承認が必要になる前に、特定の金額まで使用する',
                monthly: '毎月',
                monthlyDescription: '月ごとに一定の金額まで使う',
                fixedAmount: '固定金額',
                fixedAmountDescription: '一度だけ特定の金額まで支出する',
                setLimit: '制限を設定する',
                cardLimitError: '$21,474,836未満の金額を入力してください。',
                giveItName: '名前を付けてください。',
                giveItNameInstruction: '他のカードと区別できるようにユニークにしましょう。具体的な使用例があるとさらに良いです！',
                cardName: 'カード名',
                letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
                willBeReady: 'このカードはすぐに使用可能になります。',
                cardholder: 'カードホルダー',
                cardType: 'カードタイプ',
                limit: '制限',
                limitType: 'タイプを制限',
                name: '名前',
                disabledApprovalForSmartLimitError: 'スマートリミットを設定する前に、<strong>ワークフロー > 承認を追加</strong>で承認を有効にしてください',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化する',
                deactivateConfirmation: 'このカードを無効化すると、今後のすべての取引が拒否され、元に戻すことはできません。',
            },
        },
        accounting: {
            settings: '設定',
            title: '接続',
            subtitle: '会計システムに接続して、勘定科目表で取引をコード化し、支払いを自動マッチングし、財務を同期させましょう。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'セットアップスペシャリストとチャットする。',
            talkYourAccountManager: 'アカウントマネージャーとチャットする。',
            talkToConcierge: 'Conciergeとチャットする。',
            needAnotherAccounting: '別の会計ソフトウェアが必要ですか？',
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
                `Expensify Classicで設定された接続にエラーがあります。[この問題を解決するには、Expensify Classicに移動してください。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '設定を管理するには、Expensify Classicに移動してください。',
            setup: '接続する',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `最終同期日時: ${relativeDate}`,
            notSync: '同期されていません',
            import: 'インポート',
            export: 'エクスポート',
            advanced: '上級',
            other: 'その他',
            syncNow: '今すぐ同期',
            disconnect: '切断する',
            reinstall: 'コネクタを再インストール',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName = connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '統合';
                return `${integrationName}を切断`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '会計統合'} に接続`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Onlineに接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xeroに接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuiteに接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'QuickBooks Desktopに接続できません';
                    default: {
                        return '統合に接続できません';
                    }
                }
            },
            accounts: '勘定科目表',
            taxes: '税金',
            imported: 'インポート済み',
            notImported: 'インポートされていません',
            importAsCategory: 'カテゴリとしてインポートされました',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'タグとしてインポートされました',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'レポートフィールドとしてインポートされました',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuiteの従業員デフォルト',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この統合';
                return `${integrationName}を切断してもよろしいですか？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計統合'}を接続してもよろしいですか？これにより、既存の会計接続がすべて削除されます。`,
            enterCredentials: '資格情報を入力してください',
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
                            return '場所のインポート';
                        case 'quickbooksOnlineImportProcessing':
                            return 'インポートされたデータを処理中';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '払い戻されたレポートと請求書の支払いを同期中';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '税コードのインポート';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online接続を確認中';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Onlineデータのインポート';
                        case 'startingImportXero':
                            return 'Xeroデータのインポート';
                        case 'startingImportQBO':
                            return 'QuickBooks Onlineデータのインポート';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Desktopデータのインポート';
                        case 'quickbooksDesktopImportTitle':
                            return 'インポートタイトル';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '承認証明書のインポート';
                        case 'quickbooksDesktopImportDimensions':
                            return 'ディメンションのインポート';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '保存ポリシーのインポート';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'QuickBooksとのデータを同期中です... Web Connectorが実行中であることを確認してください';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Onlineデータを同期中';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'データを読み込んでいます';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'カテゴリを更新中';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '顧客/プロジェクトの更新';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '人のリストを更新中';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポートフィールドを更新中';
                        case 'jobDone':
                            return 'インポートされたデータの読み込みを待っています';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期中';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期中';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensifyレポートを払い戻し済みとしてマークする';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xeroの請求書と請求書を支払済みとしてマークする';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期中';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座の同期';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期中';
                        case 'xeroCheckConnection':
                            return 'Xero接続を確認中';
                        case 'xeroSyncTitle':
                            return 'Xeroデータを同期中';
                        case 'netSuiteSyncConnection':
                            return 'NetSuiteへの接続を初期化しています';
                        case 'netSuiteSyncCustomers':
                            return '顧客のインポート';
                        case 'netSuiteSyncInitData':
                            return 'NetSuiteからデータを取得中';
                        case 'netSuiteSyncImportTaxes':
                            return '税金のインポート';
                        case 'netSuiteSyncImportItems':
                            return 'アイテムをインポート中';
                        case 'netSuiteSyncData':
                            return 'Expensifyにデータをインポートする';
                        case 'netSuiteSyncAccounts':
                            return 'アカウントを同期中';
                        case 'netSuiteSyncCurrencies':
                            return '通貨を同期中';
                        case 'netSuiteSyncCategories':
                            return 'カテゴリを同期中';
                        case 'netSuiteSyncReportFields':
                            return 'Expensifyレポートフィールドとしてデータをインポート';
                        case 'netSuiteSyncTags':
                            return 'Expensifyタグとしてデータをインポート';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新中';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensifyレポートを払い戻し済みとしてマークする';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuiteの請求書と請求書を支払い済みとしてマークする';
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
                            return 'Sage Intacct接続を確認中';
                        case 'intacctImportDimensions':
                            return 'Sage Intacctのディメンションをインポート中';
                        case 'intacctImportTitle':
                            return 'Sage Intacctデータのインポート';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `ステージの翻訳が見つかりません: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '優先エクスポーター',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者で構いませんが、ドメイン設定で個々の会社カードに異なるエクスポートアカウントを設定する場合は、ドメイン管理者である必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントでエクスポート用のレポートを確認できます。',
            exportAs: 'としてエクスポート',
            exportOutOfPocket: '実費経費をエクスポート',
            exportCompanyCard: '会社カードの経費を次の形式でエクスポート',
            exportDate: 'エクスポート日付',
            defaultVendor: 'デフォルトのベンダー',
            autoSync: '自動同期',
            autoSyncDescription: 'NetSuiteとExpensifyを毎日自動的に同期します。確定したレポートをリアルタイムでエクスポートします。',
            reimbursedReports: '払い戻されたレポートを同期する',
            cardReconciliation: 'カード照合',
            reconciliationAccount: '調整口座',
            continuousReconciliation: '継続的な照合',
            saveHoursOnReconciliation: '各会計期間の調整にかかる時間を節約するために、ExpensifyがExpensify Cardの明細書と決済を継続的に調整します。',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>継続的な照合を有効にするため、${connectionName}の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensifyカードの支払いを照合する銀行口座を選択してください。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `このアカウントがあなたの<a href="${settlementAccountUrl}">Expensifyカード決済口座</a>（${lastFourPAN}で終わる）と一致していることを確認してください。`,
            },
        },
        export: {
            notReadyHeading: 'エクスポートの準備ができていません',
            notReadyDescription: 'ドラフトまたは保留中の経費報告書は会計システムにエクスポートできません。これらの経費をエクスポートする前に承認または支払ってください。',
        },
        invoices: {
            sendInvoice: '請求書を送信',
            sendFrom: '送信元',
            invoicingDetails: '請求書の詳細',
            invoicingDetailsDescription: 'この情報は請求書に表示されます。',
            companyName: '会社名',
            companyWebsite: '会社のウェブサイト',
            paymentMethods: {
                personal: '個人用',
                business: 'ビジネス',
                chooseInvoiceMethod: '以下の支払い方法を選択してください:',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書の残高',
            invoiceBalanceSubtitle: 'これは請求書の支払いを集めた現在の残高です。銀行口座を追加している場合、自動的に銀行口座に振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いや受け取りを行うために銀行口座を追加してください。',
        },
        invite: {
            member: 'メンバーを招待',
            members: 'メンバーを招待する',
            invitePeople: '新しいメンバーを招待する',
            genericFailureMessage: 'メンバーをワークスペースに招待する際にエラーが発生しました。もう一度お試しください。',
            pleaseEnterValidLogin: `メールアドレスまたは電話番号が有効であることを確認してください（例: ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
            user: 'ユーザー',
            users: 'ユーザー',
            invited: '招待されました',
            removed: 'removed',
            to: 'に',
            from: 'から',
        },
        inviteMessage: {
            confirmDetails: '詳細を確認',
            inviteMessagePrompt: '招待状を特別なものにするために、以下にメッセージを追加しましょう！',
            personalMessagePrompt: 'メッセージ',
            genericFailureMessage: 'メンバーをワークスペースに招待する際にエラーが発生しました。もう一度お試しください。',
            inviteNoMembersError: '少なくとも1人のメンバーを選択して招待してください。',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user}が${workspaceName}への参加をリクエストしました。`,
        },
        distanceRates: {
            oopsNotSoFast: 'おっと！ちょっと待って...',
            workspaceNeeds: 'ワークスペースには、少なくとも1つの有効な距離レートが必要です。',
            distance: '距離',
            centrallyManage: '料金を一元管理し、マイルまたはキロメートルで追跡し、デフォルトのカテゴリを設定します。',
            rate: '評価',
            addRate: 'レートを追加',
            findRate: 'レートを見つける',
            trackTax: '税金を追跡する',
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
                '<muted-text>この機能を使用するには、ワークスペースで税金を有効にする必要があります。こちらに移動して <a href="#">さらに多くの機能</a> に行ってその変更を行ってください。</muted-text>',
            deleteDistanceRate: '距離料金を削除',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            errors: {
                rateNameRequired: 'レート名は必須です',
                existingRateName: 'この名前の距離レートはすでに存在します',
            },
        },
        editor: {
            descriptionInputLabel: '説明',
            nameInputLabel: '名前',
            typeInputLabel: 'タイプ',
            initialValueInputLabel: '初期値',
            nameInputHelpText: 'これはワークスペースで表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付ける必要があります',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペースのすべての経費はこの通貨に変換されます。',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) => `このワークスペースは${currency}の銀行口座にリンクされているため、デフォルト通貨を変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travelを有効にするには、ワークスペースの住所が必要です。ビジネスに関連する住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続ける',
            youAreAlmostDone: '銀行口座の設定はほぼ完了です。これにより、法人カードの発行、経費の払い戻し、請求書の回収、請求書の支払いが可能になります。',
            streamlinePayments: '支払いを効率化する',
            connectBankAccountNote: '注意: 個人銀行口座はワークスペースでの支払いには使用できません。',
            oneMoreThing: 'もう一つ！',
            allSet: '準備完了です！',
            accountDescriptionWithCards: 'この銀行口座は、法人カードの発行、経費の払い戻し、請求書の回収、および請求書の支払いに使用されます。',
            letsFinishInChat: 'チャットで終わらせましょう！',
            finishInChat: 'チャットで終了',
            almostDone: 'もう少しで完了です！',
            disconnectBankAccount: '銀行口座の接続を解除',
            startOver: 'やり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、私の銀行口座を切断してください。',
            yesStartOver: 'はい、最初からやり直してください。',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `<strong>${bankName}</strong>銀行口座を切断してください。この口座の未処理の取引は引き続き完了します。`,
            clearProgress: 'やり直すと、これまでの進捗がクリアされます。',
            areYouSure: 'よろしいですか？',
            workspaceCurrency: 'ワークスペース通貨',
            updateCurrencyPrompt: 'お使いのワークスペースは現在、USDとは異なる通貨に設定されているようです。下のボタンをクリックして、通貨をUSDに更新してください。',
            updateToUSD: 'USDに更新',
            updateWorkspaceCurrency: 'ワークスペースの通貨を更新する',
            workspaceCurrencyNotSupported: 'ワークスペース通貨はサポートされていません',
            yourWorkspace: `ご使用のワークスペースは、サポートされていない通貨に設定されています。<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">サポートされている通貨の一覧</a>をご確認ください。`,
            chooseAnExisting: '既存の銀行口座を選択して経費を支払うか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: 'オーナーを移行',
            addPaymentCardTitle: '所有権を移転するために支払いカードを入力してください。',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro><a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>ポリシーに同意してカードを追加してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長インフラストラクチャー',
            addPaymentCardLearnMore: `<muted-text>当社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>について詳しくはこちら。</muted-text>`,
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\nこの残高を清算して、このワークスペースの請求を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を移動',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `このワークスペースのアカウント所有者（${email}）には、前月からの未払い残高があります。\n\nこのワークスペースの請求を引き継ぐために、この金額（${amount}）を振り替えますか？あなたの支払いカードに即座に請求されます。`,
            subscriptionTitle: '年間サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行する',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `このワークスペースを引き継ぐと、年間サブスクリプションが現在のサブスクリプションと統合されます。これにより、サブスクリプションのサイズが${usersCount}人増加し、新しいサブスクリプションのサイズは${finalCount}人になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複サブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行する',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `${email}のワークスペースの請求を引き継ごうとしているようですが、そのためにはまず、すべてのワークスペースで管理者である必要があります。\n\nワークスペース${workspaceName}の請求のみを引き継ぎたい場合は、「続行」をクリックしてください。\n\nサブスクリプション全体の請求を引き継ぎたい場合は、まずすべてのワークスペースに管理者として追加してもらってから、請求を引き継いでください。`,
            hasFailedSettlementsTitle: '所有権を移転できません',
            hasFailedSettlementsButtonText: '了解しました。',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `${email} は未払いの Expensify Card 決済があるため、請求を引き継ぐことができません。問題を解決するために、concierge@expensify.com に連絡するように依頼してください。その後、このワークスペースの請求を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高をクリアできませんでした',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高をクリアできませんでした。後でもう一度お試しください。',
            successTitle: 'やったー！準備完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ちょっと待って...',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権の移転に問題が発生しました。もう一度お試しいただくか、<concierge-link>Concierge までお問い合わせ</concierge-link>ください。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `次のレポートはすでに${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}にエクスポートされています：\n\n${reportName}\n\n本当に再度エクスポートしますか？`,
            confirmText: 'はい、再度エクスポートしてください。',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポートフィールド',
                description: `レポートフィールドでは、個々の項目の経費に関連するタグとは異なり、ヘッダーレベルの詳細を指定できます。これらの詳細には、特定のプロジェクト名、出張情報、場所などが含まれることがあります。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify + NetSuiteの統合により、自動同期を楽しみ、手動入力を削減できます。プロジェクトや顧客のマッピングを含むネイティブおよびカスタムセグメントのサポートで、詳細でリアルタイムの財務インサイトを得ることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>私たちのNetSuite統合は、Controlプランでのみ利用可能です。開始価格は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify + Sage Intacct の統合で、自動同期を楽しみ、手動入力を減らしましょう。ユーザー定義のディメンションによる詳細でリアルタイムな財務インサイトを得るとともに、部門、クラス、場所、顧客、プロジェクト（ジョブ）ごとの経費コード化が可能です。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sage Intacctとの統合は、Controlプランでのみ利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify + QuickBooks Desktop の統合で、自動同期を楽しみ、手動入力を減らしましょう。クラス、アイテム、顧客、プロジェクトごとの経費コード化とリアルタイムの双方向接続で、究極の効率性を実現します。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktopの統合は、Controlプランでのみ利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `追加の承認レイヤーを加えたい場合や、最も大きな経費にもう一つの目を通したい場合でも、私たちがサポートします。高度な承認機能により、あらゆるレベルで適切なチェックを行い、チームの支出を管理することができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認は、Controlプランでのみ利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            categories: {
                title: 'カテゴリ',
                description: 'カテゴリを使用すると、支出を追跡し整理できます。デフォルトのカテゴリを使用するか、独自のカテゴリを追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリは、Collectプランで利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            glCodes: {
                title: 'GLコード',
                description: `GLコードをカテゴリとタグに追加して、会計および給与システムへの経費の簡単なエクスポートを実現しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードは、Controlプランでのみ利用可能です。開始価格は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL & Payroll コード',
                description: `GLコードと給与コードをカテゴリに追加して、経費を会計および給与システムに簡単にエクスポートしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLおよび給与コードは、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `税コードを税金に追加して、経費を会計および給与システムに簡単にエクスポートしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            companyCards: {
                title: '無制限の会社カード',
                description: `さらにカードフィードを追加する必要がありますか？すべての主要なカード発行会社からの取引を同期するために、無制限の会社カードをアンロックしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これは、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで実行され、あなたの支出を管理するので、小さなことを心配する必要はありません。\n\n領収書や説明などの経費詳細を要求し、制限やデフォルトを設定し、承認と支払いを自動化します。すべてを一か所で行えます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールは、Controlプランでのみ利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '日当は、従業員が出張する際に日々の費用を遵守し、予測可能にするための優れた方法です。カスタム料金、デフォルトカテゴリ、目的地やサブレートなどの詳細な機能をお楽しみください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>日当は、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            travel: {
                title: '旅行',
                description: 'Expensify Travelは、メンバーが宿泊施設、フライト、交通機関などを予約できる新しい法人向け旅行予約および管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>旅行は、Collectプランで利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使用すると、経費をグループ化して追跡と整理を簡単にできます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは、Collectプランで利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'マルチレベルタグ',
                description:
                    'マルチレベルタグは、経費をより正確に追跡するのに役立ちます。各項目に部門、クライアント、コストセンターなどの複数のタグを割り当てることで、すべての経費の完全なコンテキストを把握できます。これにより、より詳細なレポート作成、承認ワークフロー、および会計エクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、Controlプランでのみ利用可能です。開始価格は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            distanceRates: {
                title: '距離料金',
                description: '独自の料金を作成および管理し、マイルまたはキロメートルで追跡し、距離経費のデフォルトカテゴリを設定します。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離料金は、Collectプランで利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            auditor: {
                title: '監査人',
                description: '監査人はすべてのレポートに対して読み取り専用アクセスが可能で、完全な可視性とコンプライアンス監視を提供します。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>監査人は Control プランでのみ利用可能で、料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額です。` : `アクティブメンバー1人あたり月額です。`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数の承認レベルは、払い戻しが行われる前に複数の人がレポートを承認する必要がある企業向けのワークフローツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、Controlプランでのみ利用可能です。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり月額。',
                perMember: 'メンバーごとに月額。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>この機能を利用するには、アップグレードするか、当社のプランと価格<a href="${subscriptionLink}">について詳しくご確認</a>ください。</muted-text>`,
            upgradeToUnlock: 'この機能をアンロックする',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>${policyName}をコントロールプランにアップグレードしました！詳細については、<a href="${subscriptionLink}">サブスクリプションをご確認</a>ください。</centered-text>`,
                categorizeMessage: `Collectプランへのアップグレードに成功しました。これで経費を分類することができます！`,
                travelMessage: `Collectプランへのアップグレードが成功しました。これで旅行の予約と管理を開始できます！`,
                distanceRateMessage: `Collectプランへのアップグレードが成功しました。これで距離レートを変更できます！`,
                gotIt: '了解しました、ありがとうございます。',
                createdWorkspace: 'ワークスペースを作成しました！',
            },
            commonFeatures: {
                title: 'Controlプランにアップグレード',
                note: '以下を含む、最も強力な機能をアンロック:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>コントロールプランは、料金が <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごとに月額。` : `アクティブメンバー1人あたり月額。`} <a href="${learnMoreMethodsRoute}">詳細を確認</a> 私たちのプランと価格について。</muted-text>`,
                    benefit1: '高度な会計接続（NetSuite、Sage Intacct、その他）',
                    benefit2: 'スマート経費ルール',
                    benefit3: 'マルチレベル承認ワークフロー',
                    benefit4: '強化されたセキュリティコントロール',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランタイプを変更します',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collectプランにダウングレードする',
                note: 'ダウングレードすると、これらの機能やその他の機能へのアクセスが失われます。',
                benefits: {
                    note: '私たちのプランを完全に比較するには、こちらをご覧ください',
                    pricingPage: '価格ページ',
                    confirm: '設定を削除してダウングレードしてもよろしいですか？',
                    warning: 'これは元に戻せません。',
                    benefit1: '会計接続（QuickBooks Online と Xero を除く）',
                    benefit2: 'スマート経費ルール',
                    benefit3: 'マルチレベル承認ワークフロー',
                    benefit4: '強化されたセキュリティコントロール',
                    headsUp: '注意！',
                    multiWorkspaceNote: '最初の月額支払いの前に、すべてのワークスペースをダウングレードして、Collectレートでのサブスクリプションを開始する必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択 > プランタイプを変更',
                },
            },
            completed: {
                headline: 'ワークスペースがダウングレードされました',
                description: 'Controlプランに他のワークスペースがあります。Collectレートで請求されるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '了解しました、ありがとうございます。',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: '最終支払い',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `このサブスクリプションの最終的な請求額は<strong>${formattedAmount}</strong>です`,
            description2: ({date}: DateParams) => `${date}の内訳を以下に示します：`,
            subscription:
                'ご注意ください！この操作は、Expensifyのサブスクリプションを終了し、このワークスペースを削除し、すべてのワークスペースメンバーを削除します。このワークスペースを保持し、自分だけを削除したい場合は、別の管理者に請求を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限されています',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `${workspaceName} ワークスペースでのアクションは現在制限されています。`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `ワークスペースのオーナーである${workspaceOwnerName}は、新しいワークスペースのアクティビティをアンロックするために、ファイル上の支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを解除するには、ファイル上の支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: '支払いカードを追加してロックを解除！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き使用するには、支払いカードを追加してください。',
            pleaseReachOutToYourWorkspaceAdmin: 'ご質問がある場合は、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者とチャットする',
            chatInAdmins: '#adminsでチャットする',
            addPaymentCard: '支払いカードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>個々の経費に対して支出制限とデフォルト設定を設定できます。また、<a href="${categoriesPageLink}">カテゴリ</a>と<a href="${tagsPageLink}">タグ</a>に関するルールを作成することも可能です。</muted-text>`,
                receiptRequiredAmount: '領収書の必要金額',
                receiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出には領収書が必要です。',
                maxExpenseAmount: '最大経費額',
                maxExpenseAmountDescription: 'カテゴリールールで上書きされない限り、この金額を超える支出にフラグを立てます。',
                maxAge: '最大年齢',
                maxExpenseAge: '最大経費年齢',
                maxExpenseAgeDescription: '特定の日数より古い支出をフラグする。',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count}日間`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費をどのように作成するかを選択します。インポートされた会社カード取引でない場合、経費は現金経費とみなされます。これには手動で作成された経費、領収書、日当、距離、時間経費が含まれます。',
                reimbursableDefault: '精算可能',
                reimbursableDefaultDescription: '経費は通常、従業員に返金されます',
                nonReimbursableDefault: '精算不可',
                nonReimbursableDefaultDescription: '経費は時々従業員に返金されます',
                alwaysReimbursable: '常に精算可能',
                alwaysReimbursableDescription: '経費は常に従業員に返金されます',
                alwaysNonReimbursable: '常に精算不可',
                alwaysNonReimbursableDescription: '経費は従業員に返金されません',
                billableDefault: '請求可能なデフォルト',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>現金とクレジットカードの支出をデフォルトで請求可能にするかどうかを選択します。請求可能な支出は<a href="${tagsPageLink}">タグ</a>で有効または無効に設定されます。</muted-text>`,
                billable: 'ビラブル',
                billableDescription: '経費は多くの場合、クライアントに再請求されます。',
                nonBillable: '非請求対象',
                nonBillableDescription: '経費は時々クライアントに再請求されます。',
                eReceipts: 'eレシート',
                eReceiptsHint: `eレシートは[ほとんどのUSDクレジット取引で](${CONST.DEEP_DIVE_ERECEIPTS})自動作成されます。`,
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費の一人当たりの費用を追跡します。',
                prohibitedDefaultDescription:
                    'アルコール、ギャンブル、その他の制限された項目が含まれる領収書をすべてフラグ付けしてください。これらの項目が含まれる領収書の経費は、手動での確認が必要です。',
                prohibitedExpenses: '禁止された経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル付随費用',
                gambling: 'ギャンブル',
                tobacco: 'タバコ',
                adultEntertainment: 'アダルトエンターテインメント',
            },
            expenseReportRules: {
                title: '経費報告書',
                subtitle: '経費報告のコンプライアンス、承認、支払いを自動化します。',
                preventSelfApprovalsTitle: '自己承認を防ぐ',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分の経費報告書を承認するのを防ぎます。',
                autoApproveCompliantReportsTitle: '準拠したレポートを自動承認する',
                autoApproveCompliantReportsSubtitle: 'どの経費報告書が自動承認の対象となるかを設定します。',
                autoApproveReportsUnderTitle: '以下の金額未満のレポートを自動承認',
                autoApproveReportsUnderDescription: 'この金額以下の完全に準拠した経費報告書は自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートは自動承認の対象であっても、手動承認を必要とするようにします。',
                autoPayApprovedReportsTitle: '自動支払い承認済みレポート',
                autoPayApprovedReportsSubtitle: 'どの経費報告書が自動支払いの対象となるかを設定します。',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `${currency ?? ''}20,000未満の金額を入力してください。`,
                autoPayApprovedReportsLockedSubtitle: 'その他の機能に移動してワークフローを有効にし、その後、支払いを追加してこの機能をアンロックしてください。',
                autoPayReportsUnderTitle: '以下の金額未満のレポートを自動支払い',
                autoPayReportsUnderDescription: 'この金額以下の完全に準拠した経費報告書は自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[さらに多くの機能](${moreFeaturesLink})にアクセスしてワークフローを有効にし、${featureName}を追加してこの機能のロックを解除してください。`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[さらに多くの機能](${moreFeaturesLink})にアクセスし、${featureName}を有効にしてこの機能のロックを解除してください。`,
            },
            categoryRules: {
                title: 'カテゴリールール',
                approver: '承認者',
                requireDescription: '説明が必要です',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `従業員に「${categoryName}」の支出に関する追加情報を提供するようにリマインドしてください。このヒントは経費の説明欄に表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロのヒント: 短ければ短いほど良い！',
                maxAmount: '最大金額',
                flagAmountsOver: '金額が超過している場合はフラグを立てる',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `「${categoryName}」カテゴリに適用されます。`,
                flagAmountsOverSubtitle: 'これはすべての経費の最大金額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリ別に経費金額をフラグします。このルールは、最大経費金額に関する一般的なワークスペースルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費報告書ごとにカテゴリ別の合計支出をフラグ付けします。',
                },
                requireReceiptsOver: 'を超える領収書を必須にする',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: '領収書を要求しない',
                    always: '常に領収書を要求する',
                },
                defaultTaxRate: 'デフォルト税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `「[さらに多くの機能](${moreFeaturesLink})」に移動し、ワークフローを有効にします。その後、承認を追加してこの機能を解除します。`,
            },
            customRules: {
                title: 'カスタムルール',
                cardSubtitle: 'ここにチームの経費ポリシーがあり、何が対象になるのか全員が同じ理解を持てます。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '収集する',
                    description: 'プロセスを自動化したいチーム向け。',
                },
                corporate: {
                    label: 'コントロール',
                    description: '高度な要件を持つ組織向け。',
                },
            },
            description: 'あなたにぴったりのプランを選びましょう。機能と価格の詳細なリストについては、こちらをご覧ください。',
            subscriptionLink: 'プランの種類と料金に関するヘルプページ',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `あなたは、年間サブスクリプションが終了する${annualSubscriptionEndDate}まで、Controlプランの1人のアクティブメンバーにコミットしています。自動更新を無効にすることで、${annualSubscriptionEndDate}から従量課金制のサブスクリプションに切り替え、Collectプランにダウングレードすることができます。`,
                other: `あなたは、年間サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランで${count}人のアクティブメンバーにコミットしています。自動更新を無効にすることで、${annualSubscriptionEndDate}から従量課金制のサブスクリプションに切り替え、Collectプランにダウングレードすることができます。`,
            }),
            subscriptions: 'サブスクリプション',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: '私たちは、あなたの偉大さへの道を切り開くためにここにいます！',
        description: '以下のサポートオプションから選択してください:',
        chatWithConcierge: 'Conciergeとチャットする',
        scheduleSetupCall: 'セットアップコールをスケジュールする',
        scheduleACall: '通話をスケジュールする',
        questionMarkButtonTooltip: '私たちのチームからサポートを受ける',
        exploreHelpDocs: 'ヘルプドキュメントを探索する',
        registerForWebinar: 'ウェビナーに登録する',
        onboardingHelp: 'オンボーディングヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更する',
        headers: {
            frequentlyUsed: 'よく使われる',
            smileysAndEmotion: 'スマイリーと感情',
            peopleAndBody: '人と体',
            animalsAndNature: '動物と自然',
            foodAndDrink: '食べ物と飲み物',
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
        roomName: '部屋の名前',
        visibility: '可視性',
        restrictedDescription: 'ワークスペースの人々はこの部屋を見つけることができます。',
        privateDescription: 'このルームに招待された人は見つけることができます。',
        publicDescription: '誰でもこのルームを見つけることができます',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '誰でもこのルームを見つけることができます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前の部屋はすでに存在します',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName}はすべてのワークスペースでデフォルトのルームです。別の名前を選んでください。`,
        roomNameInvalidError: 'ルーム名には小文字のアルファベット、数字、ハイフンのみを使用できます。',
        pleaseEnterRoomName: '部屋の名前を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}は"${oldName}"から"${newName}"に名前を変更しました` : `${actor}がこのルームの名前を"${oldName}"から"${newName}"に変更しました。`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `部屋の名前が${newName}に変更されました。`,
        social: 'ソーシャル',
        selectAWorkspace: 'ワークスペースを選択',
        growlMessageOnRenameError: 'ワークスペースルームの名前を変更できません。接続を確認して、再試行してください。',
        visibilityOptions: {
            restricted: 'ワークスペース', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'プライベート',
            public: '公開',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'パブリックアナウンス',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '送信して閉じる',
        submitAndApprove: '送信して承認',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${field}「${name}」の承認者として${approverName}（${approverEmail}）を追加しました。`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${field}「${name}」の承認者として${approverName}（${approverEmail}）を削除しました。`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `${field}「${name}」の承認者を${formatApprover(newApproverName, newApproverEmail)}に変更しました（以前は${formatApprover(oldApproverName, oldApproverEmail)}）`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `カテゴリ「${categoryName}」を追加しました`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `カテゴリー「${categoryName}」を削除しました。`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? '無効' : '有効'} カテゴリ "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `給与コード「${newValue}」をカテゴリ「${categoryName}」に追加しました。`;
            }
            if (!newValue && oldValue) {
                return `給与コード「${oldValue}」をカテゴリ「${categoryName}」から削除しました。`;
            }
            return `"${categoryName}" カテゴリの給与コードを「${newValue}」に変更しました（以前は「${oldValue}」）。`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」にGLコード「${newValue}」を追加しました。`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」からGLコード「${oldValue}」を削除しました。`;
            }
            return `「${categoryName}」カテゴリのGLコードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `「${categoryName}」カテゴリの説明を${!oldValue ? '必須' : '不要'}に変更しました（以前は${!oldValue ? '不要' : '必須'}）`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に最大金額${newAmount}を追加しました。`;
            }
            if (oldAmount && !newAmount) {
                return `カテゴリ「${categoryName}」から最大金額${oldAmount}を削除しました。`;
            }
            return `"${categoryName}" カテゴリの最大金額を ${newAmount} に変更しました（以前は ${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に制限タイプ${newValue}を追加しました。`;
            }
            return `"${categoryName}" カテゴリの制限タイプを ${newValue} に変更しました（以前は ${oldValue}）`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」を更新し、Receiptsを${newValue}に変更しました。`;
            }
            return `「${categoryName}」カテゴリを${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `カテゴリ「${oldName}」の名前を「${newName}」に変更しました。`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明ヒント「${oldValue}」を削除しました。`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明のヒント「${newValue}」を追加しました。`
                : `"${categoryName}" カテゴリの説明ヒントを "${newValue}" に変更しました（以前は "${oldValue}"）`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `タグリスト名を"${newName}"に変更しました（以前は"${oldName}"）`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました。`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `タグリスト「${tagListName}」を更新し、タグ「${oldName}」を「${newName}」に変更しました。`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」からタグ「${tagName}」を削除しました。`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」から「${count}」タグを削除しました。`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `タグリスト「${tagListName}」のタグ「${tagName}」を更新し、${updatedField}を「${oldValue}」から「${newValue}」に変更しました。`;
            }
            return `リスト「${tagListName}」のタグ「${tagName}」を更新し、${updatedField}を「${newValue}」に追加しました。`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `${customUnitName}の${updatedField}を"${oldValue}"から"${newValue}"に変更しました。`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `距離レートに関する${newValue ? '有効' : '無効'}の税金追跡`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `新しい「${customUnitName}」レート「${rateName}」を追加しました。`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `${customUnitName}の${updatedField}「${customUnitRateName}」のレートを「${newValue}」（以前は「${oldValue}」）に変更しました。`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `距離レート「${customUnitRateName}」の税率を「${newValue} (${newTaxPercentage})」に変更しました（以前は「${oldValue} (${oldTaxPercentage})」）。`;
            }
            return `距離レート「${customUnitRateName}」に税率「${newValue} (${newTaxPercentage})」を追加しました。`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `距離レート「${customUnitRateName}」の税還付可能部分を「${newValue}」に変更しました（以前は「${oldValue}」）。`;
            }
            return `距離料金「${customUnitRateName}」に税還付可能部分「${newValue}」を追加しました。`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `"${customUnitName}" レート "${rateName}" を削除しました`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} レポートフィールド "${fieldName}" を追加しました`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `レポートフィールド "${fieldName}" のデフォルト値を "${defaultValue}" に設定する`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」にオプション「${optionName}」を追加しました。`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました。`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のオプション「${optionName}」`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド "${fieldName}" のすべてのオプション`;
            }
            return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のオプション「${optionName}」、すべてのオプションを${allEnabled ? '有効' : '無効'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType}レポートフィールド「${fieldName}」を削除しました。`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `"Prevent self-approval" を "${newValue === 'true' ? '有効' : '無効'}" に更新しました（以前は "${oldValue === 'true' ? '有効' : '無効'}"）`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大領収書必要経費額を${oldValue}から${newValue}に変更しました。`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `違反のための最大経費額を${oldValue}から${newValue}に変更しました。`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `"最大経費年齢（日数）"を"${newValue}"に更新しました（以前は"${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}"）`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定する`;
            }
            return `月次報告書の提出日を「${newValue}」（以前は「${oldValue}」）に更新しました。`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `"クライアントへの経費再請求"を"${newValue}"に更新しました（以前は"${oldValue}"）`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「現金経費のデフォルト」を"${newValue}"に更新しました (以前は"${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `"デフォルトのレポートタイトルを強制する" ${value ? 'オン' : 'オフ'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `このワークスペースの名前を「${newName}」（以前は「${oldName}」）に更新しました。`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `このワークスペースの説明を"${newDescription}"に設定してください。` : `このワークスペースの説明を"${oldDescription}"から"${newDescription}"に更新しました。`,
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
                one: `${joinedNames}の承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続き受信トレイで承認可能です。`,
                other: `${joinedNames}の承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続きあなたの受信トレイで承認可能です。`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `${policyName}でのあなたの役割が${oldRole}からユーザーに更新されました。あなた自身のものを除くすべての提出者の経費チャットから削除されました。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `デフォルト通貨を${newCurrency}に更新しました（以前は${oldCurrency}）`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `自動レポートの頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました。`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを"${oldValue}"から"${newValue}"に更新しました。`,
        upgradedWorkspace: 'このワークスペースをコントロールプランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳しくは<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をご覧ください。`,
        downgradedWorkspace: 'このワークスペースをCollectプランにダウングレードしました。',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `レポートが手動承認のためにランダムにルーティングされる割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました。`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `すべての経費の手動承認限度額を${newLimit}に変更しました（以前は${oldLimit}）`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `このワークスペースの${enabled ? '有効' : '無効'}件の払い戻し`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `税 "${taxName}" を追加しました`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `税 "${taxName}" を削除しました`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `税 "${oldValue}" の名前を "${newValue}" に変更しました`;
                }
                case 'code': {
                    return `税 "${taxName}" のコードを "${oldValue}" から "${newValue}" に変更しました`;
                }
                case 'rate': {
                    return `税 "${taxName}" の税率を "${oldValue}" から "${newValue}" に変更しました`;
                }
                case 'enabled': {
                    return `${oldValue ? `税 "${taxName}" を無効にしました` : `税 "${taxName}" を有効にしました`}`;
                }
                default: {
                    return '';
                }
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 参加者の追跡`,
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: `このページにアクセスする権限がありません。このルームに参加しようとしている場合は、ルームメンバーに追加してもらってください。他に何かお困りですか？${CONST.EMAIL.CONCIERGE}にお問い合わせください。`,
        roomArchived: `このルームはアーカイブされました。ご不明な点があれば、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `このルームから${memberName}を削除してもよろしいですか？`,
            other: '選択したメンバーをルームから削除してもよろしいですか？',
        }),
        error: {
            genericAdd: 'このルームメンバーの追加に問題が発生しました',
        },
    },
    newTaskPage: {
        assignTask: 'タスクを割り当てる',
        assignMe: '私に割り当てる',
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
        completed: '完了しました',
        action: '完了',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `${title}のタスク`,
            completed: '完了としてマークされました',
            canceled: '削除されたタスク',
            reopened: '未完了としてマークされました',
            error: '要求された操作を行う権限がありません。',
        },
        markAsComplete: '完了としてマーク',
        markAsIncomplete: '未完了としてマーク',
        assigneeError: 'このタスクの割り当て中にエラーが発生しました。別の担当者を試してください。',
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。後でもう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを削除してもよろしいですか？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} 明細書`,
    },
    keyboardShortcutsPage: {
        title: 'キーボードショートカット',
        subtitle: 'これらの便利なキーボードショートカットで時間を節約しましょう。',
        shortcuts: {
            openShortcutDialog: 'キーボードショートカットダイアログを開く',
            markAllMessagesAsRead: 'すべてのメッセージを既読にする',
            escape: 'ダイアログを閉じる',
            search: '検索ダイアログを開く',
            newChat: '新しいチャット画面',
            copy: 'コメントをコピー',
            openDebug: 'テスト設定ダイアログを開く',
        },
    },
    guides: {
        screenShare: '画面共有',
        screenShareRequest: 'Expensifyがスクリーンシェアに招待しています',
    },
    search: {
        resultsAreLimited: '検索結果は制限されています。',
        viewResults: '結果を表示',
        resetFilters: 'フィルターをリセット',
        searchResults: {
            emptyResults: {
                title: '表示するものがありません',
                subtitle: `検索条件を調整するか、+ボタンで何かを作成してみてください。`,
            },
            emptyExpenseResults: {
                title: 'まだ経費が作成されていません。',
                subtitle: '経費を作成するか、Expensifyの試用版を利用して詳細を学びましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使用して経費を作成してください。',
            },
            emptyReportResults: {
                title: 'まだレポートが作成されていません。',
                subtitle: 'Expensifyのレポートを作成するか、試乗して詳細を学びましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使用してレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    まだ請求書を
                    作成していません
                `),
                subtitle: '請求書を送信するか、Expensifyの試用版を利用して詳細を確認してください。',
                subtitleWithOnlyCreateButton: '以下の緑色のボタンを使用して請求書を送信してください。',
            },
            emptyTripResults: {
                title: '表示する旅行はありません',
                subtitle: '以下で最初の旅行を予約して始めましょう。',
                buttonText: '旅行を予約する',
            },
            emptySubmitResults: {
                title: '提出する経費がありません',
                subtitle: '問題ありません。勝利のラップを取りましょう！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費ゼロ。最大限のリラックス。よくやった！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールラインを越えました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ゆっくりする時間です。お疲れ様でした。',
            },
            emptyStatementsResults: {
                title: '表示する経費がない',
                subtitle: '結果がありません。フィルターを調整してください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費ゼロ。最大限のリラックス。よくやった！',
            },
        },
        statements: 'ステートメント',
        unapprovedCash: '未承認現金',
        unapprovedCard: '未承認のカード',
        reconciliation: '照合',
        saveSearch: '検索を保存',
        deleteSavedSearch: '保存された検索を削除',
        deleteSavedSearchConfirm: 'この検索を削除してもよろしいですか？',
        searchName: '名前を検索',
        savedSearchesMenuItemTitle: '保存済み',
        groupedExpenses: 'グループ化された経費',
        bulkActions: {
            approve: '承認する',
            pay: '支払う',
            delete: '削除',
            hold: '保留',
            unhold: '保留を解除',
            reject: '却下',
            noOptionsAvailable: '選択した経費グループには利用可能なオプションがありません。',
        },
        filtersHeader: 'フィルター',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''}の前に`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '未承認',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '先月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '今月',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最後の声明',
                },
            },
            status: 'ステータス',
            keyword: 'キーワード',
            keywords: 'キーワード',
            currency: '通貨',
            completed: '完了しました',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''}未満`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} より大きい`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `${greaterThan} と ${lessThan} の間`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `等しい ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個別カード',
                closedCards: 'クローズドカード',
                cardFeeds: 'カードフィード',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `すべての${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `すべてのCSVインポートカード${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: '現在',
            past: '過去',
            submitted: '提出',
            approved: '承認',
            paid: '支払',
            exported: 'エクスポート',
            posted: '投稿',
            withdrawn: '取り消し',
            billable: 'ビラブル',
            reimbursable: '払い戻し可能',
            purchaseCurrency: '購入通貨',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'から',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
            },
            feed: 'フィード',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '払い戻し',
            },
            is: '状態',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '送信',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '承認',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '支払う',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'エクスポート',
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name}は${value}です`,
        },
        has: '含む',
        groupBy: 'グループ',
        moneyRequestReport: {
            emptyStateTitle: 'このレポートには経費がありません。',
        },
        noCategory: 'カテゴリなし',
        noTag: 'タグなし',
        expenseType: '経費タイプ',
        withdrawalType: '引き出しの種類',
        recentSearches: '最近の検索',
        recentChats: '最近のチャット',
        searchIn: 'で検索',
        searchPlaceholder: '何かを検索する',
        suggestions: '提案',
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おお、それはたくさんのアイテムですね！まとめて、Conciergeがまもなくファイルを送信します。',
        },
        exportAll: {
            selectAllMatchingItems: 'すべての一致する項目を選択',
            allMatchingItemsSelected: 'すべての一致する項目が選択されました',
        },
    },
    genericErrorPage: {
        title: 'おっと、何かがうまくいきませんでした！',
        body: {
            helpTextMobile: 'アプリを閉じて再度開くか、または切り替えてください。',
            helpTextWeb: 'web.',
            helpTextConcierge: '問題が解決しない場合は、以下にお問い合わせください',
        },
        refresh: '更新',
    },
    fileDownload: {
        success: {
            title: 'ダウンロード完了！',
            message: '添付ファイルが正常にダウンロードされました！',
            qrMessage:
                '写真やダウンロードフォルダにQRコードのコピーがないか確認してください。プロのヒント: プレゼンテーションに追加して、聴衆がスキャンして直接あなたとつながることができるようにしましょう。',
        },
        generalError: {
            title: '添付ファイルエラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージアクセス',
            message: 'Expensifyはストレージアクセスなしでは添付ファイルを保存できません。設定をタップして権限を更新してください。',
        },
    },
    desktopApplicationMenu: {
        mainMenu: '新しいExpensify',
        about: 'New Expensifyについて',
        update: '新しいExpensifyを更新する',
        checkForUpdates: 'アップデートを確認',
        toggleDevTools: '開発者ツールを切り替える',
        viewShortcuts: 'キーボードショートカットを表示',
        services: 'サービス',
        hide: '新しいExpensifyを非表示にする',
        hideOthers: '他の人を非表示',
        showAll: 'すべて表示',
        quit: '新しいExpensifyを終了する',
        fileMenu: 'ファイル',
        closeWindow: 'ウィンドウを閉じる',
        editMenu: '編集',
        undo: '元に戻す',
        redo: 'やり直し',
        cut: '切る',
        copy: 'コピー',
        paste: '貼り付け',
        pasteAndMatchStyle: 'スタイルに合わせて貼り付け',
        pasteAsPlainText: 'プレーンテキストとして貼り付け',
        delete: '削除',
        selectAll: 'すべて選択',
        speechSubmenu: 'スピーチ',
        startSpeaking: '話し始める',
        stopSpeaking: '話すのをやめてください',
        viewMenu: '表示',
        reload: 'リロード',
        forceReload: '強制リロード',
        resetZoom: '実際のサイズ',
        zoomIn: 'ズームイン',
        zoomOut: 'ズームアウト',
        togglefullscreen: '全画面表示を切り替え',
        historyMenu: '履歴',
        back: '戻る',
        forward: '転送',
        windowMenu: 'ウィンドウ',
        minimize: '最小化',
        zoom: 'Zoom',
        front: 'すべてを前面に表示',
        helpMenu: '助けて',
        learnMore: '詳細を確認',
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
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `新しいバージョンはまもなく利用可能になります。${!isSilentUpdating ? '更新の準備が整いましたらお知らせします。' : ''}`,
            soundsGood: '良さそうです',
        },
        notAvailable: {
            title: '更新は利用できません',
            message: '現在利用可能なアップデートはありません。後でもう一度確認してください！',
            okay: 'Okay',
        },
        error: {
            title: '更新の確認に失敗しました',
            message: '更新を確認できませんでした。しばらくしてからもう一度お試しください。',
        },
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化:',
        selectGroupByOption: 'レポート経費のグループ化方法を選択',
        uncategorized: '未分類',
        noTag: 'タグなし',
        selectGroup: ({groupName}: {groupName: string}) => `${groupName}のすべての経費を選択`,
        groupBy: {
            category: 'カテゴリ',
            tag: 'タグ',
        },
    },
    report: {
        newReport: {
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポートのワークスペースを選択してください。',
            emptyReportConfirmationTitle: '空のレポートがすでにあります',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `${workspaceName} で別のレポートを作成しますか？ 空のレポートには次からアクセスできます`,
            emptyReportConfirmationPromptLink: 'レポート',
            genericWorkspaceName: 'このワークスペース',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportFieldFailureMessage: 'フィールドの更新中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポートの名前変更中に予期しないエラーが発生しました。後でもう一度お試しください。',
        noActivityYet: 'まだ活動がありません',
        connectionSettings: '接続設定',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName}を"${newValue}"に変更しました（以前は"${oldValue}"でした）`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName}を"${newValue}"に設定しました`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `ワークスペースを変更しました${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}`;
                    }
                    return `ワークスペースを${toPolicyName}に変更しました${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `${oldType} から ${newType} にタイプを変更しました`,
                exportedToCSV: `CSVにエクスポートされました`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        // The label will always be in English, so we need to translate it
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `${translatedLabel}にエクスポートされました`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `${label} 経由でエクスポートされました`,
                    automaticActionTwo: '会計設定',
                    manual: ({label}: ExportedToIntegrationParams) => `このレポートを手動で${label}にエクスポート済みとしてマークしました。`,
                    automaticActionThree: '正常にレコードを作成しました',
                    reimburseableLink: '自己負担費用',
                    nonReimbursableLink: '会社カード経費',
                    pending: ({label}: ExportedToIntegrationParams) => `このレポートのエクスポートを${label}に開始しました...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `このレポートを${label}にエクスポートできませんでした（"${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `領収書を追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `他の場所で${currency}${amount}を支払いました。`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} を統合経由で支払いました`,
                outdatedBankAccount: `支払者の銀行口座に問題があるため、支払いを処理できませんでした。`,
                reimbursementACHBounce: `銀行口座の問題により、支払いを処理できませんでした。`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払いを処理できませんでした。支払者が銀行口座を変更したためです。`,
                reimbursementDelayed: `支払いは処理されましたが、さらに1～2営業日遅れます。`,
                selectedForRandomAudit: `レビューのためにランダムに選ばれました`,
                selectedForRandomAuditMarkdown: `[ランダムに選択された](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)レビュー用`,
                share: ({to}: ShareParams) => `招待されたメンバー${to}`,
                unshare: ({to}: UnshareParams) => `削除されたメンバー${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${currency}${amount} を支払いました`,
                takeControl: `制御を取りました`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `${label}との同期中に問題が発生しました${errorMessage ? `（"${errorMessage}"）` : ''}。<a href="${workspaceAccountingLink}">ワークスペースの設定</a>で問題を修正してください。`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email}を${role === 'member' ? 'a' : 'an'} ${role}として追加しました`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} の役割を ${newRole} に更新しました（以前は ${currentRole}）`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email}のカスタムフィールド1を削除しました（以前は「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `"${newValue}" を ${email} のカスタムフィールド1に追加しました。`
                        : `${email} のカスタムフィールド1を "${newValue}" に変更しました（以前は "${previousValue}"）`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email}のカスタムフィールド2を削除しました（以前は「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `"${newValue}" を ${email} のカスタムフィールド2に追加しました。`
                        : `${email}のカスタムフィールド2を"${newValue}"に変更しました（以前は"${previousValue}"）`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} への接続を削除しました。`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}に接続しました`,
                leftTheChat: 'チャットを退出しました',
            },
            error: {
                invalidCredentials: '認証情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} は ${date} までの ${dayCount} 日間の ${dayCount === 1 ? '日' : '日'} です。`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date}の${timePeriod}からの${summary}`,
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費報告書',
        companyCreditCard: '法人クレジットカード',
        receiptScanningApp: 'レシートスキャンアプリ',
        billPay: 'ビルペイ',
        invoicing: '請求書作成',
        CPACard: 'CPAカード',
        payroll: '給与計算',
        travel: '旅行',
        resources: 'リソース',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'プレスキット',
        support: 'サポート',
        expensifyHelp: 'ExpensifyHelp',
        terms: '利用規約',
        privacy: 'プライバシー',
        learnMore: '詳細を確認する',
        aboutExpensify: 'Expensifyについて',
        blog: 'ブログ',
        jobs: 'ジョブ',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投資家向け情報',
        getStarted: '開始する',
        createAccount: '新しいアカウントを作成',
        logIn: 'ログイン',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'チャットリストに戻る',
        chatWelcomeMessage: 'チャットのウェルカムメッセージ',
        navigatesToChat: 'チャットに移動します',
        newMessageLineIndicator: '新しいメッセージラインインジケーター',
        chatMessage: 'チャットメッセージ',
        lastChatMessagePreview: '最後のチャットメッセージのプレビュー',
        workspaceName: 'ワークスペース名',
        chatUserDisplayNames: 'チャットメンバー表示名',
        scrollToNewestMessages: '最新のメッセージにスクロール',
        preStyledText: 'Pre-styled text',
        viewAttachment: '添付ファイルを表示',
    },
    parentReportAction: {
        deletedReport: '削除されたレポート',
        deletedMessage: '削除されたメッセージ',
        deletedExpense: '削除された経費',
        reversedTransaction: '返金取引',
        deletedTask: '削除されたタスク',
        hiddenMessage: '隠されたメッセージ',
    },
    threads: {
        thread: 'スレッド',
        replies: '返信',
        reply: '返信',
        from: 'から',
        in: 'に',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `From ${reportName}${workspaceName ? `${workspaceName}内` : ''}`,
    },
    qrCodes: {
        copy: 'URLをコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'すべてのフラグ付きメッセージは、モデレーターに送信されてレビューされます。',
        chooseAReason: '以下からフラグを立てる理由を選択してください:',
        spam: 'スパム',
        spamDescription: '無関係なプロモーション',
        inconsiderate: '配慮に欠ける',
        inconsiderateDescription: '侮辱的または無礼な表現、意図が疑わしい',
        intimidation: '脅迫',
        intimidationDescription: '有効な異議を押し切って積極的に議題を追求する',
        bullying: 'いじめ',
        bullyingDescription: '個人を標的にして従順を得ること',
        harassment: '嫌がらせ',
        harassmentDescription: '人種差別的、女性差別的、またはその他広く差別的な行動',
        assault: '暴行',
        assaultDescription: '害を意図した特定の感情的攻撃',
        flaggedContent: 'このメッセージは、コミュニティルールに違反しているとしてフラグが立てられ、内容が非表示になっています。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告を送信し、メッセージがレビューのために報告されます。',
        levelTwoResult: 'チャンネルからメッセージが非表示になり、匿名の警告が追加され、メッセージがレビューのために報告されました。',
        levelThreeResult: 'チャンネルからメッセージが削除され、匿名の警告が行われ、メッセージがレビューのために報告されました。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '経費の提出に招待する',
        inviteToChat: 'チャットのみ招待',
        nothing: '何もしない',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '承認する',
        decline: '辞退する',
    },
    actionableMentionTrackExpense: {
        submit: '誰かに送信する',
        categorize: 'カテゴリ分けする',
        share: '私の会計士と共有する',
        nothing: '今のところ何もありません。',
    },
    teachersUnitePage: {
        teachersUnite: 'Teachers Unite',
        joinExpensifyOrg: 'Expensify.orgと共に、世界中の不正をなくしましょう。現在の「Teachers Unite」キャンペーンは、必要な学用品の費用を分担することで、世界中の教育者を支援しています。',
        iKnowATeacher: '私は教師を知っています。',
        iAmATeacher: '私は教師です',
        getInTouch: '素晴らしいです！彼らの連絡先情報を共有してください。こちらから連絡を取ります。',
        introSchoolPrincipal: 'あなたの学校の校長への紹介',
        schoolPrincipalVerifyExpense:
            'Expensify.orgは、低所得世帯の学生がより良い学習体験を得られるように、必需品の学用品の費用を分担します。あなたの校長があなたの経費を確認するよう求められます。',
        principalFirstName: '名',
        principalLastName: '姓',
        principalWorkEmail: '主要な勤務先のメールアドレス',
        updateYourEmail: 'メールアドレスを更新してください',
        updateEmail: 'メールアドレスを更新する',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `先に進む前に、学校のメールをデフォルトの連絡方法として設定してください。設定 > プロフィール > <a href="${contactMethodsRoute}">連絡方法</a> で行うことができます。`,
        error: {
            enterPhoneEmail: '有効なメールアドレスまたは電話番号を入力してください',
            enterEmail: 'メールアドレスを入力してください',
            enterValidEmail: '有効なメールアドレスを入力してください',
            tryDifferentEmail: '別のメールアドレスを試してください',
        },
    },
    cardTransactions: {
        notActivated: '未アクティベート',
        outOfPocket: '自己負担の支出',
        companySpend: '会社の支出',
    },
    distance: {
        addStop: '停止を追加',
        deleteWaypoint: 'ウェイポイントを削除',
        deleteWaypointConfirmation: 'このウェイポイントを削除してもよろしいですか？',
        address: '住所',
        waypointDescription: {
            start: '開始',
            stop: '停止',
        },
        mapPending: {
            title: '保留中のマップ',
            subtitle: 'オンラインに戻ると地図が生成されます。',
            onlineSubtitle: '地図を設定する間、少々お待ちください。',
            errorTitle: '地図のエラー',
            errorSubtitle: '地図の読み込み中にエラーが発生しました。もう一度お試しください。',
        },
        error: {
            selectSuggestedAddress: '提案された住所を選択するか、現在地を使用してください',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '成績表が紛失または損傷しました',
        nextButtonLabel: '次へ',
        reasonTitle: 'なぜ新しいカードが必要なのですか？',
        cardDamaged: '私のカードが破損しました',
        cardLostOrStolen: '私のカードが紛失または盗難に遭いました。',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは2～3営業日以内に届きます。現在のカードは、新しいカードを有効化するまで引き続き使用できます。',
        cardLostOrStolenInfo: 'ご注文が完了すると、現在のカードは永久に無効になります。ほとんどのカードは数営業日で届きます。',
        address: '住所',
        deactivateCardButton: 'カードを無効化する',
        shipNewCardButton: '新しいカードを発送する',
        addressError: '住所が必要です',
        reasonError: '理由が必要です',
        successTitle: '新しいカードが発送中です！',
        successDescription: '数営業日で届きます。届いたら有効化する必要があります。それまでは仮想カードを使用できます。',
    },
    eReceipt: {
        guaranteed: '保証付きeレシート',
        transactionDate: '取引日付',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを始める、<success><strong>友達を紹介する</strong></success>。',
            header: 'チャットを開始し、友達を紹介する',
            body: '友達にもExpensifyを使ってほしいですか？ 彼らとチャットを始めるだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を提出し、<success><strong>チームに紹介する</strong></success>。',
            header: '経費を提出し、チームに紹介する',
            body: 'あなたのチームにもExpensifyを使ってもらいたいですか？経費を提出するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友達を紹介する',
            body: 'Expensifyを友達にも使ってもらいたいですか？彼らとチャットしたり、支払ったり、経費を分割したりするだけで、あとは私たちにお任せください。または、招待リンクを共有するだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友達を紹介する',
            header: '友達を紹介する',
            body: 'Expensifyを友達にも使ってもらいたいですか？彼らとチャットしたり、支払ったり、経費を分割したりするだけで、あとは私たちにお任せください。または、招待リンクを共有するだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `セットアップスペシャリストとチャットする <a href="${href}">${adminReportName}</a> ヘルプが必要な場合`,
        default: `メッセージ <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> セットアップのヘルプについて`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必要です。',
        autoReportedRejectedExpense: 'この経費は却下されました。',
        billableExpense: '課金対象は無効になりました',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `${formattedLimit} を超える` : ''}`,
        categoryOutOfPolicy: 'カテゴリが無効になりました。',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% の為替手数料が適用されました。`,
        customUnitOutOfPolicy: 'このワークスペースでは有効なレートではありません。',
        duplicatedTransaction: 'Duplicate',
        fieldRequired: 'レポートフィールドは必須です',
        futureDate: '未来の日付は許可されていません',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `${invoiceMarkup}% 上乗せされました`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `${maxAge}日より古い日付`,
        missingCategory: 'カテゴリがありません',
        missingComment: '選択したカテゴリーの説明が必要です。',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '金額が計算された距離と異なります';
                case 'card':
                    return 'カード取引を超える金額';
                default:
                    if (displayPercentVariance) {
                        return `スキャンされた領収書よりも${displayPercentVariance}%多い金額`;
                    }
                    return 'スキャンされた領収書よりも金額が多い';
            }
        },
        modifiedDate: '日付がスキャンされた領収書と異なります',
        nonExpensiworksExpense: '非Expensiworks経費',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `経費が自動承認限度額の${formattedLimit}を超えています。`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `${formattedLimit}/人のカテゴリ制限を超える金額`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `${formattedLimit}/人の制限を超えた金額`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `${formattedLimit}/回を超える金額`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `${formattedLimit}/人の制限を超えた金額`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `1日あたりのカテゴリ制限${formattedLimit}/人を超える金額`,
        receiptNotSmartScanned: '領収書と経費の詳細を手動で追加しました。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `カテゴリの上限${formattedLimit}を超える場合は領収書が必要`;
            }
            if (formattedLimit) {
                return `${formattedLimit}を超える場合は領収書が必要です`;
            }
            if (category) {
                return `カテゴリ上限超過時は領収書が必要`;
            }
            return '領収書が必要です';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = '禁止された経費:';
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
                        return `ホテル雑費`;
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
            if (types.length === 0) {
                return preMessage;
            }
            return `${preMessage} ${types.map(getProhibitedExpenseTypeText).join(', ')}`;
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'レビューが必要です',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行接続が切れているため、領収書を自動照合できません。';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行接続が切断されています。<a href="${companyCardPageURL}">再接続して領収書を照合してください</a>`
                    : '銀行接続が切断されています。領収書を照合するには管理者に再接続を依頼してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member}に現金としてマークするように依頼するか、7日間待って再試行してください。` : 'カード取引とのマージを待機中。';
            }
            return '';
        },
        brokenConnection530Error: '銀行接続の不具合により領収書が保留中です。',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の問題により領収書が保留されています。<a href="${workspaceCompanyCardRoute}">会社のカード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行接続が壊れているため、領収書が保留中です。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いをリクエストします。',
        smartscanFailed: ({canEdit = true}) => `領収書のスキャンに失敗しました。${canEdit ? '詳細を手動で入力してください。' : ''}`,
        receiptGeneratedWithAI: 'AI生成の領収書の可能性',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'タグ'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} は無効になりました`,
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税金'} は無効になりました`,
        taxRateChanged: '税率が変更されました',
        taxRequired: '税率が見つかりません',
        none: 'None',
        taxCodeToKeep: '保持する税コードを選択してください',
        tagToKeep: 'どのタグを保持するか選択してください',
        isTransactionReimbursable: '取引が払い戻し可能か選択する',
        merchantToKeep: 'どの業者を保持するか選択してください',
        descriptionToKeep: 'どの説明を保持するか選択してください。',
        categoryToKeep: '保持するカテゴリを選択',
        isTransactionBillable: '取引が請求可能か選択',
        keepThisOne: 'このままにしておく',
        confirmDetails: `保持している詳細を確認してください。`,
        confirmDuplicatesInfo: `保持しなかった重複は、提出者が削除できるように保留されます。`,
        hold: 'この経費は保留されました',
        resolvedDuplicates: '重複を解決しました',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName}は必須です`,
    },
    violationDismissal: {
        rter: {
            manual: 'この領収書を現金としてマークしました',
        },
        duplicatedTransaction: {
            manual: '重複を解決しました',
        },
    },
    videoPlayer: {
        play: '再生',
        pause: '一時停止',
        fullscreen: '全画面',
        playbackSpeed: '再生速度',
        expand: '展開する',
        mute: 'ミュート',
        unmute: 'ミュート解除',
        normal: '通常',
    },
    exitSurvey: {
        header: '行く前に',
        reasonPage: {
            title: '退会理由を教えてください',
            subtitle: '行く前に、Expensify Classicに切り替えたい理由を教えてください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classicでのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'New Expensifyの使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensifyの使い方は理解していますが、Expensify Classicの方が好きです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensifyにないどの機能が必要ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしているのですか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜExpensify Classicを好むのですか？',
        },
        responsePlaceholder: 'あなたの返信',
        thankYou: 'フィードバックありがとうございます！',
        thankYouSubtitle: 'あなたの回答は、私たちがより良い製品を作り、物事を成し遂げるのに役立ちます。ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classicに切り替える',
        offlineTitle: 'ここで行き詰まっているようです…',
        offline:
            'オフラインのようです。残念ながら、Expensify Classicはオフラインでは動作しませんが、新しいExpensifyは動作します。Expensify Classicを使用したい場合は、インターネット接続があるときに再試行してください。',
        quickTip: 'ちょっとしたヒント...',
        quickTipSubTitle: 'expensify.comにアクセスして、Expensify Classicに直接移動できます。簡単なショートカットとしてブックマークしてください！',
        bookACall: '通話を予約する',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費やレポートで直接チャットする',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルで全てを行う能力',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードで出張と経費を管理',
        },
        bookACallTextTop: 'Expensify Classicに切り替えると、次のことを逃すことになります：',
        bookACallTextBottom:
            'なぜかを理解するために、あなたとお電話でお話しできることを楽しみにしています。ご要望について話し合うために、私たちのシニアプロダクトマネージャーの一人との通話を予約できます。',
        takeMeToExpensifyClassic: 'Expensify Classicに連れて行ってください。',
    },
    listBoundary: {
        errorMessage: 'メッセージをさらに読み込む際にエラーが発生しました。',
        tryAgain: 'もう一度試してください。',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引に領収書を一致させました',
    },
    subscription: {
        authenticatePaymentCard: '支払いカードを認証する',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションの変更を行うことができません。',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `無料トライアル: 残り${numOfDays} ${numOfDays === 1 ? '日' : '日'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `すべてのお気に入りの機能を引き続き使用するために、${date}までにお支払いカードを更新してください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした。',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `${date}の${purchaseAmountOwed}の請求を処理できませんでした。未払い金額を清算するために支払いカードを追加してください。`
                        : '支払いカードを追加して、未払い金額を清算してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `お支払いが期限を過ぎています。サービスの中断を避けるために、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払いが期限を過ぎています。請求書をお支払いください。',
            },
            billingDisputePending: {
                title: 'カードを請求できませんでした。',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `あなたは、${cardEnding}で終わるカードの${amountOwed}の請求を異議申し立てしました。異議が銀行で解決されるまで、あなたのアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お支払いカードの認証が完了していません。',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `末尾が${cardEnding}の支払いカードを有効にするには、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'カードを請求できませんでした。',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `お支払いカードは残高不足のため拒否されました。再試行するか、新しい支払いカードを追加して、未払い残高${amountOwed}をクリアしてください。`,
            },
            cardExpired: {
                title: 'カードを請求できませんでした。',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `お支払いカードの有効期限が切れました。新しい支払いカードを追加して、未払い残高の${amountOwed}を清算してください。`,
            },
            cardExpireSoon: {
                title: 'あなたのカードはまもなく有効期限が切れます',
                subtitle: 'あなたの支払いカードは今月末に期限切れになります。以下の3点メニューをクリックして更新し、お気に入りの機能を引き続きご利用ください。',
            },
            retryBillingSuccess: {
                title: '成功！',
                subtitle: 'あなたのカードは正常に請求されました。',
            },
            retryBillingError: {
                title: 'カードを請求できませんでした。',
                subtitle: '再試行する前に、Expensifyの請求を承認し、保留を解除するために直接銀行に連絡してください。それ以外の場合は、別の支払いカードを追加してみてください。',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `あなたは、${cardEnding}で終わるカードの${amountOwed}の請求を異議申し立てしました。異議が銀行で解決されるまで、あなたのアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitleStart: '次のステップとして、',
                subtitleLink: 'セットアップチェックリストを完了する',
                subtitleEnd: 'あなたのチームが経費精算を始められるように。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `トライアル: ${numOfDays} ${numOfDays === 1 ? '日' : '日'} 日残り！`,
                subtitle: 'お気に入りの機能を引き続き利用するために、支払いカードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルが終了しました',
                subtitle: 'お気に入りの機能を引き続き利用するために、支払いカードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: 'オファーを請求する',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>最初の1年間は${discountType}%オフ！</strong> 支払いカードを追加して、年間サブスクリプションを開始するだけです。`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `期間限定オファー: 最初の1年間は${discountType}%オフ！`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `${hours}時間 ${minutes}分 ${seconds}秒以内に${days > 0 ? `${days}日 :` : ''}を請求してください`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensifyのサブスクリプションを支払うためのカードを追加してください。',
            addCardButton: '支払いカードを追加',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `次回の支払日は${nextPaymentDate}です。`,
            cardEnding: ({cardNumber}: CardEndingParams) => `${cardNumber}で終わるカード`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `名前: ${name}、有効期限: ${expiration}、通貨: ${currency}`,
            changeCard: '支払いカードを変更',
            changeCurrency: '支払い通貨を変更',
            cardNotFound: '支払いカードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証する',
            requestRefund: '返金をリクエスト',
            requestRefundModal: {
                full: '返金を受けるのは簡単です。次の請求日までにアカウントをダウングレードするだけで、返金されます。<br /> <br /> ご注意: アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合はいつでも新しいワークスペースを作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'あなたのプラン',
            exploreAllPlans: 'すべてのプランを探る',
            customPricing: 'カスタム価格設定',
            asLowAs: ({price}: YourPlanPriceValueParams) => `アクティブメンバー1人あたり月額${price}から`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月${price}`,
            perMemberMonth: 'メンバーごと/月',
            collect: {
                title: '収集する',
                description: '経費、旅行、チャットを提供する小規模ビジネスプラン。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `${lower}/Expensifyカードを持つアクティブメンバーから、${upper}/Expensifyカードを持たないアクティブメンバーまで。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `${lower}/Expensifyカードを持つアクティブメンバーから、${upper}/Expensifyカードを持たないアクティブメンバーまで。`,
                benefit1: '領収書スキャン',
                benefit2: '払い戻し',
                benefit3: '法人カード管理',
                benefit4: '経費と出張の承認',
                benefit5: '旅行の予約とルール',
                benefit6: 'QuickBooks/Xero 統合',
                benefit7: '経費、レポート、ルームでチャットする',
                benefit8: 'AIと人間のサポート',
            },
            control: {
                title: 'コントロール',
                description: '大企業向けの経費、旅行、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `${lower}/Expensifyカードを持つアクティブメンバーから、${upper}/Expensifyカードを持たないアクティブメンバーまで。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `${lower}/Expensifyカードを持つアクティブメンバーから、${upper}/Expensifyカードを持たないアクティブメンバーまで。`,
                benefit1: 'Collectプランのすべて',
                benefit2: 'マルチレベル承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP統合 (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR統合（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタムインサイトとレポート',
                benefit8: '予算編成',
            },
            thisIsYourCurrentPlan: 'これはあなたの現在のプランです',
            downgrade: 'Collectにダウングレード',
            upgrade: 'Controlにアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensifyカードで節約',
            saveWithExpensifyDescription: 'ExpensifyカードのキャッシュバックがExpensifyの請求をどのように削減できるか、節約計算機を使用して確認してください。',
            saveWithExpensifyButton: '詳細を確認',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>必要な機能を解放しましょう。あなたに最適なプランを選択してください。<a href="${CONST.PRICING}">料金ページをご覧いただくか</a>、各プランの機能詳細をご確認ください。</muted-text>`,
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年間サブスクリプション',
            taxExempt: '税免除ステータスを申請する',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '免税ステータス',
            payPerUse: '従量課金',
            subscriptionSize: 'サブスクリプションサイズ',
            headsUp:
                '注意: 今すぐサブスクリプションサイズを設定しない場合、初月のアクティブメンバー数に自動的に設定されます。その後、次の12ヶ月間は少なくともこのメンバー数分の料金を支払うことになります。サブスクリプションサイズはいつでも増やすことができますが、サブスクリプションが終了するまで減らすことはできません。',
            zeroCommitment: '割引された年間サブスクリプション料金でのゼロコミットメント',
        },
        subscriptionSize: {
            title: 'サブスクリプションサイズ',
            yourSize: 'ご利用のサブスクリプションサイズは、特定の月にアクティブなメンバーによって埋められる空席の数です。',
            eachMonth:
                '毎月、あなたのサブスクリプションは上記で設定されたアクティブメンバー数までをカバーします。サブスクリプションのサイズを増やすたびに、その新しいサイズで新たに12ヶ月のサブスクリプションが開始されます。',
            note: '注: アクティブメンバーとは、会社のワークスペースに関連付けられた経費データを作成、編集、提出、承認、払い戻し、またはエクスポートした人を指します。',
            confirmDetails: '新しい年間サブスクリプションの詳細を確認してください:',
            subscriptionSize: 'サブスクリプションサイズ',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} アクティブメンバー/月`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年間サブスクリプション中はダウングレードできません。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `あなたはすでに、${date}まで毎月${size}のアクティブメンバーの年間サブスクリプションサイズにコミットしています。自動更新を無効にすることで、${date}に従量課金制のサブスクリプションに切り替えることができます。`,
            error: {
                size: '有効なサブスクリプションサイズを入力してください',
                sameSize: '現在のサブスクリプションサイズとは異なる番号を入力してください。',
            },
        },
        paymentCard: {
            addPaymentCard: '支払いカードを追加',
            enterPaymentCardDetails: 'お支払いカードの詳細を入力してください',
            security: 'ExpensifyはPCI-DSSに準拠しており、銀行レベルの暗号化を使用し、冗長インフラストラクチャを利用してデータを保護します。',
            learnMoreAboutSecurity: '私たちのセキュリティについて詳しく学ぶ。',
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `サブスクリプションタイプ: ${subscriptionType}, サブスクリプションサイズ: ${subscriptionSize}, 自動更新: ${autoRenew}, 年間シートの自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年次',
            autoRenew: '自動更新',
            autoIncrease: '年間シートの自動増加',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `アクティブメンバー1人あたり、最大${amountWithCurrency}/月を節約`,
            automaticallyIncrease:
                'アクティブメンバーがサブスクリプションのサイズを超えた場合、年間シート数を自動的に増やします。注：これにより、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensifyの改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `${date}に更新されます。`,
            pricingConfiguration: '価格は構成によって異なります。最も安い価格を得るには、年次サブスクリプションを選択し、Expensifyカードを取得してください。',
            learnMore: {
                part1: '詳細については、こちらをご覧ください',
                pricingPage: '価格ページ',
                part2: 'または、お使いの言語で私たちのチームとチャットしてください',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: '見積価格',
            changesBasedOn: 'これは、Expensifyカードの使用状況と以下のサブスクリプションオプションに基づいて変更されます。',
        },
        requestEarlyCancellation: {
            title: '早期キャンセルをリクエストする',
            subtitle: '早期キャンセルをリクエストする主な理由は何ですか？',
            subscriptionCanceled: {
                title: 'サブスクリプションがキャンセルされました',
                subtitle: '年間サブスクリプションがキャンセルされました。',
                info: 'ワークスペースを従量課金制で引き続き使用したい場合は、これで準備完了です。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `今後のアクティビティと請求を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除する</a> ワークスペースを削除すると、現在のカレンダー月に発生した未払いの活動に対して請求されることに注意してください。`,
            },
            requestSubmitted: {
                title: 'リクエストが送信されました',
                subtitle:
                    'ご解約をご希望されていることをお知らせいただき、ありがとうございます。ご要望を確認中で、近日中に<concierge-link>Concierge</concierge-link>のチャットを通じてご連絡いたします。',
            },
            acknowledgement: `早期キャンセルをリクエストすることにより、Expensify が Expensify の下でそのようなリクエストを承認する義務を負わないことを認め、同意します。<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または、私とExpensifyの間の他の適用されるサービス契約に基づき、Expensifyがそのような要求を許可するかどうかについての唯一の裁量権を保持していること。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要です。',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖、縮小、または買収',
        additionalInfoTitle: 'どのソフトウェアに移行する予定ですか、そしてその理由は何ですか？',
        additionalInfoInputLabel: 'あなたの返信',
    },
    roomChangeLog: {
        updateRoomDescription: '部屋の説明を次のように設定します：',
        clearRoomDescription: '部屋の説明をクリアしました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームのアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替える:',
        copilotDelegatedAccess: 'Copilot: 委任されたアクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにする。',
        addCopilot: 'コパイロットを追加',
        membersCanAccessYourAccount: 'これらのメンバーはあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'これらのアカウントには、アカウントスイッチャーを通じてアクセスできます。',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '満杯';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '限定';
                default:
                    return '';
            }
        },
        genericError: 'おっと、何か問題が発生しました。もう一度お試しください。',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `${delegator}に代わって`,
        accessLevel: 'アクセスレベル',
        confirmCopilot: '以下であなたのコパイロットを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。フルアクセスと限定アクセスの両方で、コパイロットはすべての会話と経費を閲覧できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'あなたのアカウントで、他のメンバーがあなたに代わってすべての操作を行うことを許可します。チャット、提出、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '別のメンバーに、承認、支払い、拒否、保留を除く、あなたのアカウントでほとんどの操作を代行させることができます。';
                default:
                    return '';
            }
        },
        removeCopilot: 'コパイロットを削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'あなたであることを確認しましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod}に送信されたマジックコードを入力して、コパイロットを追加してください。1～2分以内に届くはずです。`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `コパイロットを更新するために、${contactMethod}に送信されたマジックコードを入力してください。`,
        notAllowed: 'ちょっと待ってください…',
        noAccessMessage: dedent(`
            コパイロットには、このページへのアクセス権がありません。
            申し訳ありません！
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `${accountOwnerEmail} の<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">副操縦士</a>として、あなたはこの行動を取る許可を持っていません。申し訳ありません！`,
        copilotAccess: 'Copilotアクセス',
    },
    debug: {
        debug: 'デバッグ',
        details: '詳細',
        JSON: 'JSON',
        reportActions: 'アクション',
        reportActionPreview: 'プレビュー',
        nothingToPreview: 'プレビューするものがありません',
        editJson: 'JSONを編集:',
        preview: 'プレビュー:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} が見つかりません`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `無効なプロパティ: ${propertyName} - 期待される型: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `無効な値 - 期待される値: ${expectedValues}`,
        missingValue: '値が不足しています',
        createReportAction: 'レポートアクションを作成',
        reportAction: 'アクションを報告する',
        report: 'レポート',
        transaction: '取引',
        violations: '違反事項',
        transactionViolation: '取引違反',
        hint: 'データの変更はバックエンドに送信されません。',
        textFields: 'テキストフィールド',
        numberFields: '数値フィールド',
        booleanFields: 'ブールフィールド',
        constantFields: '定数フィールド',
        dateTimeFields: 'DateTimeフィールド',
        date: '日付',
        time: '時間',
        none: 'None',
        visibleInLHN: 'LHNに表示',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: '下書きコメントがあります',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: 'メンバーによってピン留めされました',
            hasIOUViolations: 'IOU違反があります',
            hasAddWorkspaceRoomErrors: 'ワークスペースルームの追加エラーがあります',
            isUnread: '未読（フォーカスモード）',
            isArchived: 'アーカイブされています（最新モード）',
            isSelfDM: '自分へのDMです',
            isFocused: '一時的に集中しています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストがあります（管理者ルーム）',
            isUnreadWithMention: '未読（メンションあり）',
            isWaitingForAssigneeToCompleteAction: '担当者がアクションを完了するのを待っています',
            hasChildReportAwaitingAction: '子レポートがアクション待ちです。',
            hasMissingInvoiceBankAccount: '請求書の銀行口座がありません',
            hasUnresolvedCardFraudAlert: '未解決のカード詐欺警告があります',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションデータにエラーがあります',
            hasViolations: '違反があります',
            hasTransactionThreadViolations: 'トランザクションスレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'アクションを待っているレポートがあります',
            theresAReportWithErrors: 'エラーがあるレポートがあります。',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位エラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題がありました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法には確認が必要です',
            theresAProblemWithAPaymentMethod: '支払い方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: '払い戻しアカウントに問題があります。',
            theresABillingProblemWithYourSubscription: 'ご契約のサブスクリプションに請求の問題があります。',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'ご契約の更新が正常に完了しました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました。',
            theresAProblemWithYourWallet: 'あなたのウォレットに問題があります',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: 'New Expensifyへようこそ！',
        subtitle: '従来のエクスペリエンスでお好きだった要素はすべてそのままに、毎日をさらに簡単にする数多くのアップグレードを搭載しています：',
        confirmText: '行きましょう！',
        features: {
            chat: 'どの経費でもチャットして、疑問を素早く解決しましょう',
            search: 'モバイル、Web、デスクトップで、より強力な検索',
            concierge: '内蔵の Concierge AI が経費の自動化を支援します',
        },
        helpText: '2分のデモを試す',
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>ここから<strong>始めましょう！</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>保存した検索に名前を付け直す</strong>にはこちら！</tooltip>',
        accountSwitcher: '<tooltip><strong>コパイロットアカウント</strong>にアクセスするにはこちら</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>テスト用レシートをスキャン</strong>して仕組みを確認しましょう！</tooltip>',
            manager: '<tooltip><strong>テストマネージャー</strong>を選んで試してみましょう！</tooltip>',
            confirmation: '<tooltip>次に、<strong>経費を提出</strong>して魔法を見てみましょう！</tooltip>',
            tryItOut: '試してみる',
        },
        outstandingFilter: '<tooltip><strong>承認が必要な</strong>経費で絞り込みます</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して<strong>テストドライブを完了しましょう！</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: '変更を破棄しますか？',
        body: '変更を破棄してもよろしいですか？',
        confirmText: '変更を破棄',
    },
    scheduledCall: {
        book: {
            title: '通話をスケジュールする',
            description: 'あなたに都合の良い時間を見つけてください。',
            slots: ({date}: {date: string}) => `<muted-text>利用可能な時間 <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: '通話を確認',
            description: '以下の詳細が問題ないことを確認してください。通話を確認すると、詳細情報を含む招待状を送信します。',
            setupSpecialist: 'セットアップスペシャリスト',
            meetingLength: '会議の長さ',
            dateTime: '日付と時刻',
            minutes: '30分',
        },
        callScheduled: '通話が予定されました',
    },
    autoSubmitModal: {
        title: 'すべてクリアし、送信しました！',
        description: 'すべての警告と違反がクリアされたので:',
        submittedExpensesTitle: 'これらの経費は提出されました',
        submittedExpensesDescription: 'これらの経費は承認者に送信されましたが、承認されるまで編集することができます。',
        pendingExpensesTitle: '保留中の経費が移動されました',
        pendingExpensesDescription: '保留中のカード経費は、処理されるまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分間の試用をしてみましょう',
        },
        modal: {
            title: '私たちを試してみてください',
            description: '短いプロダクトツアーで、すぐに使い方を把握しましょう。',
            confirmText: 'テストドライブを開始',
            helpText: 'Skip',
            employee: {
                description: '<muted-text>チームに<strong>Expensifyを3か月無料で提供！</strong> 下に上司のメールアドレスを入力し、テスト経費を送信してください。</muted-text>',
                email: '上司のメールアドレスを入力してください',
                error: 'そのメンバーはワークスペースを所有しています。テストするために新しいメンバーを入力してください。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '現在、Expensifyを試用中です。',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: '始めましょう',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name}がExpensifyの試用にあなたを招待しました\nこんにちは！私はExpensifyを試用するための*3ヶ月無料*を手に入れました。これは、経費を処理する最速の方法です。\n\nこちらがその仕組みを示す*テスト領収書*です：`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: 'すべてのデータ - レポートレベル',
        expenseLevelExport: 'すべてのデータ - 経費レベル',
        exportInProgress: 'エクスポート中',
        conciergeWillSend: 'コンシェルジュがまもなくファイルを送信します。',
    },
    avatarPage: {
        title: 'プロフィール写真を編集',
        upload: 'アップロード',
        uploadPhoto: '写真をアップロード',
        selectAvatar: 'アバターを選択',
        choosePresetAvatar: 'またはカスタムアバターを選択',
    },
    openAppFailureModal: {
        title: '問題が発生しました...',
        subtitle: `すべてのデータを読み込むことができませんでした。通知を受けており、問題を調査しています。この状態が続く場合は、お問い合わせください。`,
        refreshAndTryAgain: '再読み込みして、もう一度お試しください',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待っています。`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `これ以上の操作は必要ありません！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が銀行口座を追加するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta} に` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなたの</strong>経費が自動で提出されるのを待っています${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>の経費が自動的に提出されるのを待っています${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動的に提出されるのを待っています${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が問題を修正するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が問題を修正するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を修正するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費は<strong>あなた</strong>の承認待ちです。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `経費は<strong>${actor}</strong>の承認待ちです。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を承認するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートを<strong>あなた</strong>がエクスポートするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がこのレポートをエクスポートするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がこのレポートをエクスポートするのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を支払うのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `ビジネス用銀行口座の設定を<strong>あなた</strong>が完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>がビジネス用銀行口座のセットアップを完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス用銀行口座の設定を完了するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta}までに` : ` ${eta}`;
                }
                return `支払いの完了を待っています${formattedETA}。`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後で',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月の1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月の最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月の最終日に',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '旅行の終わりに',
        },
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) => `続行する前に、DNS設定を更新して<strong>${domainName}</strong>の所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNSプロバイダーにアクセスし、<strong>${domainName}</strong> のDNS設定を開いてください。`,
            addTXTRecord: '次のTXTレコードを追加してください:',
            saveChanges: '変更を保存して、ここに戻り、ドメインを確認してください。',
            youMayNeedToConsult: `検証を完了するには、組織のIT部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳細はこちら</a>。`,
            warning: '確認が完了すると、貴社のドメインのすべてのExpensifyメンバーに、アカウントが貴社のドメインで管理される旨のメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しください。問題が解決しない場合は Concierge にご連絡ください。',
        },
        domainVerified: {
            title: 'ドメイン確認済み',
            header: 'やった！あなたのドメインが確認されました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン <strong>${domainName}</strong> は正常に検証され、SAML やその他のセキュリティ機能を設定できるようになりました。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーのExpensifyへのログイン方法をより細かく管理できるセキュリティ機能です。有効にするには、権限のある会社の管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、より簡単なログイン',
            moreSecurityAndControl: 'さらなるセキュリティと管理',
            onePasswordForAnything: 'すべてを1つのパスワードで',
        },
        goToDomain: 'ドメインに移動',
        samlLogin: {
            title: 'SAMLログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン（SSO）</a>でメンバーのサインインを設定します。</muted-text>`,
            enableSamlLogin: 'SAML ログインを有効にする',
            allowMembers: 'メンバーが SAML でログインできるようにする。',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしたメンバーは、SAMLを使用して再認証する必要があります。',
            enableError: 'SAMLの有効化設定を更新できませんでした',
            requireError: 'SAML の要件設定を更新できませんでした',
        },
        samlConfigurationDetails: {
            title: 'SAML 設定の詳細',
            subtitle: 'これらの詳細を使用して SAML をセットアップしてください。',
            identityProviderMetaData: 'アイデンティティプロバイダーのメタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: 'Name ID 形式',
            loginUrl: 'ログインURL',
            acsUrl: 'ACS（アサーションコンシューマサービス）URL',
            logoutUrl: 'ログアウトURL',
            sloUrl: 'SLO（シングルログアウト）URL',
            serviceProviderMetaData: 'サービスプロバイダーのメタデータ',
            oktaScimToken: 'Okta SCIM トークン',
            revealToken: 'トークンを表示',
            fetchError: 'SAML 構成の詳細を取得できませんでした',
            setMetadataGenericError: 'SAML メタデータを設定できませんでした',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
