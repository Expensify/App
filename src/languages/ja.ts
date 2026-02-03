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
import type {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import ObjectUtils from '@src/types/utils/ObjectUtils';
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
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: '件数',
        cancel: 'キャンセル',
        dismiss: '閉じる',
        proceed: '続行',
        unshare: '共有を解除',
        yes: 'はい',
        no: 'いいえ',
        ok: 'OK',
        notNow: '今はしない',
        noThanks: '結構です',
        learnMore: '詳しく見る',
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
        newFeature: '新機能',
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
        zoom: 'ズーム',
        password: 'パスワード',
        magicCode: 'マジックコード',
        digits: '桁数',
        twoFactorCode: '2要素コード',
        workspaces: 'ワークスペース',
        home: 'ホーム',
        inbox: '受信トレイ',
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
        not: '～以外',
        signIn: 'ログイン',
        signInWithGoogle: 'Googleでサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'でサインイン',
        continue: '続行',
        firstName: '名（ファーストネーム）',
        lastName: '姓',
        scanning: 'スキャン中',
        analyzing: '分析中…',
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
        visible: '表示する',
        delete: '削除',
        archived: 'アーカイブ済み',
        contacts: '連絡先',
        recents: '最近の項目',
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
        invite: '招待',
        here: 'ここ',
        date: '日付',
        dob: '生年月日',
        currentYear: '今年',
        currentMonth: '今月',
        ssnLast4: 'SSNの下4桁',
        ssnFull9: 'SSNの9桁すべて',
        addressLine: (lineNumber: number) => `住所行${lineNumber}`,
        personalAddress: '自宅住所',
        companyAddress: '会社住所',
        noPO: '私書箱や私設私書箱などの郵便受け住所は使用しないでください。',
        city: '市',
        state: '州',
        streetAddress: '番地・丁目',
        stateOrProvince: '州 / 省',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: '私は次の内容に同意します',
        acceptTermsAndPrivacy: `私は、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>に同意します`,
        acceptTermsAndConditions: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">利用規約</a>に同意します`,
        acceptTermsOfService: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>に同意します`,
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        send: '送信',
        na: '該当なし',
        noResultsFound: '結果が見つかりません',
        noResultsFoundMatching: (searchString: string) => `"${searchString}" に一致する結果は見つかりませんでした`,
        recentDestinations: '最近の行き先',
        timePrefix: 'それは',
        conjunctionFor: '…用',
        todayAt: '本日',
        tomorrowAt: '明日の',
        yesterdayAt: '昨日 昨日 の',
        conjunctionAt: 'で',
        conjunctionTo: '宛先',
        genericErrorMessage: 'おっと…問題が発生したため、リクエストを完了できませんでした。しばらくしてからもう一度お試しください。',
        percentage: 'パーセンテージ',
        converted: '変換済み',
        error: {
            invalidAmount: '金額が無効です',
            acceptTerms: '続行するには利用規約に同意する必要があります',
            phoneNumber: `完全な電話番号を入力してください
（例：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: 'この項目は必須です',
            requestModified: 'このリクエストは別のメンバーによって編集中です',
            characterLimitExceedCounter: (length: number, limit: number) => `文字数制限を超えています（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '本日以降の日付を選択してください',
            invalidTimeShouldBeFuture: '1分以上先の時刻を選択してください',
            invalidCharacter: '無効な文字',
            enterMerchant: '店舗名を入力してください',
            enterAmount: '金額を入力してください',
            missingMerchantName: '店舗名がありません',
            missingAmount: '金額が未入力',
            missingDate: '日付がありません',
            enterDate: '日付を入力してください',
            invalidTimeRange: '12時間制の形式で時刻を入力してください（例：2:30 PM）',
            pleaseCompleteForm: '続行するには上のフォームに入力してください',
            pleaseSelectOne: '上からオプションを選択してください',
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
        fixTheErrors: 'エラーを修正してください',
        inTheFormBeforeContinuing: '続行する前にフォームに入力してください',
        confirm: '確認',
        reset: 'リセット',
        done: '完了',
        more: 'その他',
        debitCard: 'デビットカード',
        bankAccount: '銀行口座',
        personalBankAccount: '個人銀行口座',
        businessBankAccount: 'ビジネス用銀行口座',
        join: '参加する',
        leave: '退出',
        decline: '拒否',
        reject: '却下',
        transferBalance: '残高を移動',
        enterManually: '手動で入力する',
        message: 'メッセージ',
        leaveThread: 'スレッドを退出',
        you: 'あなた',
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: '支援が必要な場合は、Concierge までお問い合わせください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を利用するには、インターネットに接続している必要があります。',
        attachmentWillBeAvailableOnceBackOnline: '添付ファイルは、オンラインに戻ると利用できるようになります。',
        errorOccurredWhileTryingToPlayVideo: 'この動画の再生中にエラーが発生しました。',
        areYouSure: '本当によろしいですか？',
        verify: '確認',
        yesContinue: 'はい、続行',
        websiteExample: '例）https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `例）${zipSampleFormat}` : ''),
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        createdBy: '作成者',
        with: '〜付き',
        shareCode: 'コードを共有',
        share: '共有',
        per: 'あたり',
        mi: 'マイル',
        km: 'キロメートル',
        copied: 'コピーしました！',
        someone: '誰か',
        total: '合計',
        edit: '編集',
        letsDoThis: `やってみましょう！`,
        letsStart: `開始する`,
        showMore: 'さらに表示',
        showLess: '表示を減らす',
        merchant: '加盟店',
        change: '変更',
        category: 'カテゴリー',
        report: 'レポート',
        billable: '請求可能',
        nonBillable: '請求対象外',
        tag: 'タグ',
        receipt: 'レシート',
        verified: '確認済み',
        replace: '置換',
        distance: '距離',
        mile: 'マイル',
        miles: 'マイル',
        kilometer: 'キロメートル',
        kilometers: 'キロメートル',
        recent: '最近',
        all: 'すべて',
        am: '午前',
        pm: '午後',
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
        rate: '評価',
        emptyLHN: {
            title: 'やった！すべて確認済みです。',
            subtitleText1: 'チャットを検索するには',
            subtitleText2: '上のボタン、または次を使って何かを作成してください',
            subtitleText3: '下のボタン。',
        },
        businessName: '会社名',
        clear: 'クリア',
        type: '種類',
        reportName: 'レポート名',
        action: 'アクション',
        expenses: '経費',
        totalSpend: '合計支出',
        tax: '税金',
        shared: '共有済み',
        drafts: '下書き',
        draft: '下書き',
        finished: '完了',
        upgrade: 'アップグレード',
        downgradeWorkspace: 'ワークスペースをダウングレード',
        companyID: '会社ID',
        userID: 'ユーザーID',
        disable: '無効化',
        export: 'エクスポート',
        initialValue: '初期値',
        currentDate: '現在の日付',
        value: '値',
        downloadFailedTitle: 'ダウンロードに失敗しました',
        downloadFailedDescription: 'ダウンロードを完了できませんでした。後でもう一度お試しください。',
        filterLogs: 'ログをフィルター',
        network: 'ネットワーク',
        reportID: 'レポートID',
        longReportID: '長いレポートID',
        withdrawalID: '出金ID',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        dropTitle: 'ドロップする',
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: '無視',
        enabled: '有効',
        disabled: '無効',
        import: 'インポート',
        offlinePrompt: '今はこの操作を行うことができません。',
        outstanding: '未処理',
        chats: 'チャット',
        tasks: 'タスク',
        unread: '未読',
        sent: '送信済み',
        links: 'リンク',
        day: '日',
        days: '日数',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: 'ｈ',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: 'スキップ',
        chatWithAccountManager: (accountManagerDisplayName: string) => `特別なご要望がありますか？アカウントマネージャーの ${accountManagerDisplayName} とチャットしましょう。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務先メールアドレス',
        destination: '行き先',
        subrate: 'サブレート',
        perDiem: '日当',
        validate: '検証',
        downloadAsPDF: 'PDFでダウンロード',
        downloadAsCSV: 'CSVとしてダウンロード',
        help: 'ヘルプ',
        expenseReport: '経費レポート',
        expenseReports: '経費精算書',
        rateOutOfPolicy: 'ポリシー対象外のレート',
        leaveWorkspace: 'ワークスペースを退出',
        leaveWorkspaceConfirmation: 'このワークスペースを退出すると、そのワークスペースに経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを離れると、そのレポートや設定を表示できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースから退出すると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、承認ワークフローでは、ワークスペースのオーナーである${workspaceOwner}があなたの代わりを務めます。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、優先エクスポーターとしてのあなたの役割は、ワークスペースオーナーである${workspaceOwner}に引き継がれます。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、技術担当者としてのあなたは、ワークスペースのオーナーである${workspaceOwner}に交代されます。`,
        leaveWorkspaceReimburser:
            '支払担当者のため、このワークスペースから退出することはできません。［ワークスペース］＞［支払いの作成または追跡］で新しい支払担当者を設定してから、もう一度お試しください。',
        reimbursable: '精算対象',
        editYourProfile: 'プロフィールを編集',
        comments: 'コメント',
        sharedIn: '共有先',
        unreported: '未報告',
        explore: '探索',
        insights: 'インサイト',
        todo: 'To-do',
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
        headsUp: 'お知らせです！',
        submitTo: '提出先',
        forwardTo: '転送先',
        merge: 'マージ',
        none: 'なし',
        unstableInternetConnection: 'インターネット接続が不安定です。ネットワークを確認して、もう一度お試しください。',
        enableGlobalReimbursements: 'グローバル償還を有効にする',
        purchaseAmount: '購入金額',
        originalAmount: '元の金額',
        frequency: '頻度',
        link: 'リンク',
        pinned: 'ピン留め済み',
        read: '既読',
        copyToClipboard: 'クリップボードにコピー',
        thisIsTakingLongerThanExpected: '予想より時間がかかっています…',
        domains: 'ドメイン',
        actionRequired: '対応が必要',
        duplicate: '複製',
        duplicated: '複製済み',
        duplicateExpense: '重複した経費',
        exchangeRate: '為替レート',
        reimbursableTotal: '払戻対象合計',
        nonReimbursableTotal: '非払い戻し対象の合計',
        month: '月',
        week: '週',
        year: '年',
        quarter: '四半期',
    },
    supportalNoAccess: {
        title: 'ちょっと待ってください',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) => `サポートログイン中はこの操作を行う権限がありません（コマンド: ${command ?? ''}）。Success がこの操作を行えるべきだと思われる場合は、Slack で会話を開始してください。`,
    },
    lockedAccount: {
        title: 'ロックされたアカウント',
        description: 'このアカウントはロックされているため、この操作を完了することはできません。今後の手順については concierge@expensify.com までご連絡ください。',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: '現在地を特定できませんでした。もう一度お試しいただくか、住所を手動で入力してください。',
        permissionDenied: '位置情報へのアクセスが拒否されているようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可する',
        tryAgain: 'して、もう一度お試しください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: 'よく連絡する相手にすぐアクセスできるように、電話の連絡先をインポートしましょう。',
        importContactsExplanation: 'お気に入りの人たちに、いつでもすぐにタップでつながれます。',
        importContactsNativeText: 'あともう少しです！連絡先をインポートする許可をください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラへのアクセス',
        expensifyDoesNotHaveAccessToCamera: 'カメラへのアクセス権がないと、Expensifyで写真を撮影できません。権限を変更するには「設定」をタップしてください。',
        attachmentError: '添付エラー',
        errorWhileSelectingAttachment: '添付ファイルの選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択したためエラーが発生しました。別のファイルをお試しください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが24MBの上限を超えています',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `添付ファイルのサイズが上限の ${maxUploadSizeInMB} MB を超えています`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイトより大きくする必要があります',
        wrongFileType: '無効なファイル形式',
        notAllowedExtension: 'このファイル形式は許可されていません。別のファイル形式をお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードはできません。別のファイルをお試しください。',
        protectedPDFNotSupported: 'パスワード保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズが変更されています。フル解像度で表示するにはダウンロードしてください。',
        attachmentImageTooLarge: 'この画像は大きすぎるため、アップロード前にプレビューできません。',
        tooManyFiles: (fileLimit: number) => `一度にアップロードできるファイルは最大${fileLimit}件までです。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルが${maxUploadSizeInMB}MBを超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルサイズは${maxUploadSizeInMB}MB未満である必要があります。これより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度にアップロードできるレシートは最大30枚です。超過分はアップロードされません。',
        unsupportedFileType: (fileType: string) => `${fileType} ファイルはサポートされていません。サポートされているファイルタイプのみアップロードされます。`,
        learnMoreAboutSupportedFiles: 'サポートされている形式の詳細を確認する',
        passwordProtected: 'パスワードで保護されたPDFはサポートされていません。サポートされているファイルのみアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
        addReceipt: '領収書を追加',
        scanReceipts: 'レシートをスキャン',
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
        description: '画像をドラッグ、ズーム、回転してお好みの位置に調整してください。',
    },
    composer: {
        noExtensionFoundForMimeType: 'この MIME タイプに対応する拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像を取得する際に問題が発生しました',
        commentExceededMaxLength: (formattedMaxLength: string) => `コメントの最大文字数は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `タスクタイトルの最大文字数は ${formattedMaxLength} 文字です。`,
    },
    baseUpdateAppModal: {
        updateApp: 'アプリを更新',
        updatePrompt: 'このアプリの新しいバージョンが利用可能です。\n今すぐアップデートするか、後でアプリを再起動して最新の変更をダウンロードしてください。',
    },
    deeplinkWrapper: {
        launching: 'Expensify を起動中',
        expired: 'セッションの有効期限が切れました。',
        signIn: 'もう一度サインインしてください。',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: '生体認証テスト',
            authenticationSuccessful: '認証に成功しました',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `${authType} を使って認証が完了しました。`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `生体認証（${registered ? '登録済み' : '未登録'}）`,
            yourAttemptWasUnsuccessful: '認証を試みましたが、成功しませんでした。',
            youCouldNotBeAuthenticated: '認証できませんでした',
            areYouSureToReject: 'よろしいですか？この画面を閉じると、認証の試行は拒否されます。',
            rejectAuthentication: '認証を拒否',
            test: 'テスト',
            biometricsAuthentication: '生体認証',
        },
        pleaseEnableInSystemSettings: {
            start: 'お使いの端末で顔認証／指紋認証を有効にするか、端末のパスコードを設定してください',
            link: 'システム設定',
            end: '.',
        },
        oops: 'おっと、問題が発生しました',
        looksLikeYouRanOutOfTime: '時間切れになったようです。もう一度加盟店でお試しください。',
        youRanOutOfTime: '時間切れです',
        letsVerifyItsYou: '本人確認を行います',
        verifyYourself: {
            biometrics: '顔または指紋で本人確認する',
        },
        enableQuickVerification: {
            biometrics: '顔や指紋を使って、素早く安全に認証できます。パスワードやコードは必要ありません。',
        },
        revoke: {
            remove: '削除',
            title: '顔／指紋 & パスキー',
            explanation:
                '1 台以上のデバイスで顔認証／指紋認証またはパスキー認証が有効になっています。アクセスを取り消すと、次回どのデバイスであっても認証時にマジックコードが必要になります。',
            confirmationPrompt: '本当によろしいですか？今後どのデバイスでも次の認証にはマジックコードが必要になります。',
            cta: 'アクセスを取り消す',
            noDevices: '顔／指紋認証またはパスキー認証用に登録されているデバイスがありません。デバイスを登録すると、ここでそのアクセスを取り消せるようになります。',
            dismiss: '了解しました',
            error: 'リクエストに失敗しました。後でもう一度お試しください。',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            アブラカダブラ、
            サインインしました！
        `),
        successfulSignInDescription: '続行するには、元のタブに戻ってください。',
        title: 'あなたのマジックコードです',
        description: dedent(`
            最初にコードを要求されたデバイスに表示されているコードを入力してください
        `),
        doNotShare: dedent(`
            コードを他人と共有しないでください。  
            Expensify がそのコードをお願いすることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここからサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻って、新しいコードをリクエストしてください',
        successfulNewCodeRequest: 'コードを送信しました。デバイスを確認してください。',
        tfaRequiredTitle: dedent(`
            2 要素認証が必要です
        `),
        tfaRequiredDescription: dedent(`
            サインインしようとしている端末で表示されている
            二要素認証コードを入力してください。
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
        description: 'このワークスペースでは、会社独自の承認ワークフローが設定されています。Expensify Classic でこの操作を行ってください',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を送信し、チームを紹介しましょう',
            subtitleText: 'あなたのチームにもExpensifyを使ってほしいですか？そのチームに経費を提出するだけで、あとはすべてお任せください。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '通話を予約',
    },
    hello: 'こんにちは',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'まずは以下から始めましょう。',
        anotherLoginPageIsOpen: '別のログインページが開かれています。',
        anotherLoginPageIsOpenExplanation: 'ログインページが別のタブで開かれています。そのタブからログインしてください。',
        welcome: 'ようこそ！',
        welcomeWithoutExclamation: 'ようこそ',
        phrase2: 'お金がものを言います。チャットと支払いがひとつにまとまった今、それも簡単です。',
        phrase3: 'あなたが言いたいことを伝えるのと同じくらい速く、支払いがあなたのもとに届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login} さん、ここで新しい顔にお会いできるのはいつでもうれしいです！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `${login} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
    },
    login: {
        hero: {
            header: 'チャットのスピードで進む出張と経費管理',
            body: '次世代のExpensifyへようこそ。コンテキストに応じたリアルタイムチャットにより、出張と経費の処理がこれまで以上にスムーズに進みます。',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでのログインを続行する:',
        orContinueWithMagicCode: 'マジックコードでサインインすることもできます',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: 'マジックコードを使用',
        launching: '起動中...',
        oneMoment: 'お客様の会社のシングルサインオンポータルへリダイレクトしますので、少々お待ちください。',
    },
    reportActionCompose: {
        dropToUpload: 'ドロップしてアップロード',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何か書いてください…',
        blockedFromConcierge: '通信は禁止されています',
        fileUploadFailed: 'アップロードに失敗しました。ファイルは対応していません。',
        localTime: ({user, time}: LocalTimeParams) => `${user} の時間は ${time} です`,
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
        copyEmailToClipboard: 'メールアドレスをクリップボードにコピー',
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
            return `この${type}を本当に削除しますか？`;
        },
        onlyVisible: '閲覧できるのは次のみ',
        explain: '説明する',
        explainMessage: 'これについて説明してください。',
        replyInThread: 'スレッドで返信',
        joinThread: 'スレッドに参加',
        leaveThread: 'スレッドを退出',
        copyOnyxData: 'Onyx データをコピー',
        flagAsOffensive: '不適切な内容として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクション:',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> のパーティーには参加しそこねました。ここには特に何もありません。`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `このチャットは、<strong>${domainRoom}</strong> ドメイン上のすべての Expensify メンバーとのチャットです。同僚との会話、情報共有、質問などに利用してください。`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `このチャットは<strong>${workspaceName}</strong>の管理者とのチャットです。ワークスペースのセットアップなどについて話すために使いましょう。`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `このチャットは<strong>${workspaceName}</strong>の全員とのチャットです。最も重要なお知らせに使用してください。`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> に関するあらゆる内容のためのものです。`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `このチャットは、<strong>${invoicePayer}</strong> と <strong>${invoiceReceiver}</strong> の間の請求書用です。請求書を送信するには + ボタンを使用してください。`,
        beginningOfChatHistory: (users: string) => `このチャットの相手は${users}です。`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `ここは、<strong>${submitterDisplayName}</strong> が <strong>${workspaceName}</strong> に経費を提出する場所です。「＋」ボタンを使用してください。`,
        beginningOfChatHistorySelfDM: 'ここはあなたの個人スペースです。メモやタスク、下書き、リマインダーに活用しましょう。',
        beginningOfChatHistorySystemDM: 'ようこそ！さっそく設定を始めましょう。',
        chatWithAccountManager: 'ここでアカウントマネージャーとチャットする',
        askMeAnything: '何でも聞いてください！',
        sayHello: '挨拶しよう！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `${roomName} へようこそ！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `+ ボタンを使って経費を${additionalText}します。`,
        askConcierge: '質問して、24時間365日リアルタイムのサポートを受けましょう。',
        conciergeSupport: '24時間365日のサポート',
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
        asCopilot: 'の共同操縦者として',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `ご希望の頻度で提出できなかった、<a href="${reportUrl}">${reportName}</a> のすべての経費を保持するためにこのレポートを作成しました`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `<a href="${reportUrl}">${reportName}</a> から保留中の経費をこのレポートに作成しました`,
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話の全員に通知',
    },
    newMessages: '新着メッセージ',
    latestMessages: '最新メッセージ',
    youHaveBeenBanned: '注: あなたはこのチャンネルでのチャットを禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中…',
        multipleMembers: '複数メンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `${displayName} がアカウントを閉鎖したため、このチャットはこれ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `${oldDisplayName} がアカウントを ${displayName} と統合したため、このチャットはこれ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>が${policyName}ワークスペースのメンバーではなくなったため、これ以上利用できません。`
                : `${displayName} さんが ${policyName} ワークスペースのメンバーではなくなったため、このチャットはすでに終了しています。`,
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
        buttonFind: '何かを検索...',
        buttonMySettings: '自分の設定',
        fabNewChat: 'チャットを開始',
        fabNewChatExplained: 'アクションメニューを開く',
        fabScanReceiptExplained: 'レシートをスキャン',
        chatPinned: 'チャットをピン留めしました',
        draftedMessage: '下書きメッセージ',
        listOfChatMessages: 'チャットメッセージ一覧',
        listOfChats: 'チャット一覧',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
        redirectToExpensifyClassicModal: {
            title: '近日公開予定',
            description: 'お客様の特定の設定に対応できるよう、新しい Expensify の細かな部分をさらに調整しています。その間は、Expensify Classic をご利用ください。',
        },
    },
    homePage: {
        forYou: 'あなた向け',
        timeSensitiveSection: {
            title: '時間に敏感',
            cta: 'クレーム',
            offer50off: {
                title: '初年度が50％オフ！',
                subtitle: ({formattedTime}: {formattedTime: string}) => `残り${formattedTime}`,
            },
            offer25off: {
                title: '初年度が25％オフ！',
                subtitle: ({days}: {days: number}) => `残り ${days} ${days === 1 ? '日' : '日数'} 日`,
            },
            addShippingAddress: {
                title: '配送先住所を入力してください',
                subtitle: 'Expensify Card を受け取る住所を入力してください。',
                cta: '住所を追加',
            },
            activateCard: {
                title: 'Expensify Card を有効化',
                subtitle: 'カードを認証して支出を開始しましょう。',
                cta: '有効化',
            },
        },
        announcements: 'お知らせ',
        discoverSection: {
            title: '見つける',
            menuItemTitleNonAdmin: '経費の作成方法とレポートの提出方法を学ぶ',
            menuItemTitleAdmin: 'メンバーの招待方法、承認ワークフローの編集方法、会社カードの照合作業について学びましょう。',
            menuItemDescription: '2分でExpensifyの機能をチェック',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `${count} ${count === 1 ? 'レポート' : 'レポート'} を送信`,
            approve: ({count}: {count: number}) => `${count} ${count === 1 ? 'レポート' : 'レポート'} を承認`,
            pay: ({count}: {count: number}) => `${count === 1 ? 'レポート' : 'レポート'} を ${count} 支払う`,
            export: ({count}: {count: number}) => `${count} 件の ${count === 1 ? 'レポート' : 'レポート'} をエクスポート`,
            begin: '開始',
            emptyStateMessages: {
                nicelyDone: 'よくできました',
                keepAnEyeOut: '次に何が来るか注目してください！',
                allCaughtUp: 'すべて確認済みです',
                upcomingTodos: '今後のTo-doがここに表示されます。',
            },
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
        gps: 'GPS',
        odometer: 'オドometer',
    },
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        import: 'スプレッドシートをインポート',
        dragAndDrop: '<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。対応フォーマット：.csv、.txt、.xls、.xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>ここにスプレッドシートをドラッグ＆ドロップするか、下からファイルを選択してください。サポートされているファイル形式の詳細は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされているファイル形式の<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細はこちら</a>をご覧ください。</muted-link>`,
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています',
        column: (name: string) => `列 ${name}`,
        fieldNotMapped: (fieldName: string) => `おっと！必須フィールド（「${fieldName}」）がマッピングされていません。確認して、もう一度お試しください。`,
        singleFieldMultipleColumns: (fieldName: string) => `おっと！1つの項目（「${fieldName}」）を複数の列にマッピングしています。内容を確認して、もう一度お試しください。`,
        emptyMappedField: (fieldName: string) => `おっと！フィールド（「${fieldName}」）に1つ以上の空の値が含まれています。内容を確認して、もう一度お試しください。`,
        importSuccessfulTitle: 'インポートに成功しました',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} 個のカテゴリを追加しました。` : '1件のカテゴリが追加されました。'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'メンバーは追加も更新もされていません。';
            }
            if (added && updated) {
                return `${added}件のメンバー${added > 1 ? 's' : ''}を追加し、${updated}件のメンバー${updated > 1 ? 's' : ''}を更新しました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated}人のメンバーが更新されました。` : '1人のメンバーが更新されました。';
            }
            return added > 1 ? `${added}名のメンバーを追加しました。` : 'メンバーが1人追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} 個のタグが追加されました。` : 'タグを1件追加しました。'),
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates}件の日当レートが追加されました。` : '1件の日当レートを追加しました。'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} 件の取引がインポートされました。` : '1件の取引がインポートされました。',
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべての項目が正しく入力されていることを確認して、もう一度お試しください。問題が解決しない場合は、Concierge までお問い合わせください。',
        importDescription: 'スプレッドシートからどのフィールドを対応付けるか、下の各インポート済み列の横にあるドロップダウンをクリックして選択してください。',
        sizeNotMet: 'ファイルサイズは0バイトより大きくする必要があります',
        invalidFileMessage:
            'アップロードしたファイルは空であるか、無効なデータが含まれています。再度アップロードする前に、ファイルの形式が正しく、必要な情報が含まれていることを確認してください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSVをダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードで追加される新しいワークスペースメンバーについて、以下の内容を確認してください。既存のメンバーには、ロールの更新や招待メッセージは送信されません。`,
            other: (count: number) =>
                `このアップロードで追加される新しいワークスペースメンバー${count}名の詳細を以下で確認してください。既存メンバーには、ロールの更新や招待メッセージは送信されません。`,
        }),
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `またはここにドラッグ＆ドロップしてください`,
        desktopSubtitleMultiple: `またはここにドラッグ＆ドロップしてください`,
        alternativeMethodsTitle: '領収書を追加するその他の方法:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>してスマートフォンからスキャン</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を<a href="mailto:${email}">${email}</a>に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">電話番号を追加</a>して、${phoneNumber} に領収書をテキスト送信しましょう</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>${phoneNumber} に領収書をテキスト送信（米国の電話番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: 'レシートの写真を撮影するには、カメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセス許可がまだ付与されていません。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">こちらの手順</a>に従ってください。`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真の撮影中にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        allowLocationFromSetting: `位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。端末の権限設定から位置情報アクセスを許可してください。`,
        dropTitle: '手放して',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'この領収書を本当に削除しますか？',
        addReceipt: '領収書を追加',
        scanFailed: 'この領収書は、店舗名、日付、または金額のいずれかが欠けているため、スキャンできませんでした。',
        addAReceipt: {
            phrase1: '領収書を追加',
            phrase2: 'またはここにドラッグ＆ドロップしてください',
        },
    },
    quickAction: {
        scanReceipt: 'レシートをスキャン',
        recordDistance: '走行距離を記録',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: 'レシートを分割',
        splitDistance: '距離を分割',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        assignTask: 'タスクを割り当てる',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイックアクションの送信先にはアクセスできなくなりました。下から新しい送信先を選択してください。',
        updateDestination: '送金先を更新',
        createReport: 'レポートを作成',
    },
    iou: {
        amount: '金額',
        percent: 'パーセント',
        date: '日付',
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
        original: '元の内容',
        split: '分割',
        splitExpense: '経費を分割',
        splitDates: '分割日',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} から ${endDate}（${count} 日間）`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${merchant}からの${amount}`,
        splitByPercentage: 'パーセンテージで分割',
        splitByDate: '日付で分割',
        addSplit: '分割を追加',
        makeSplitsEven: '割り勘にする',
        editSplits: '分割を編集',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費より${amount}多くなっています。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには少なくとも 1 つ追加してください。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${merchant} の ${amount} を編集`,
        removeSplit: '分割を削除',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払済みの経費は編集できません',
        splitExpenseDistanceErrorModalDescription: '距離単価のエラーを修正して、もう一度お試しください。',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        expense: '経費',
        categorize: 'カテゴリ分け',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '走行距離を記録',
        createExpenses: (expensesNumber: number) => `${expensesNumber}件の経費を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'このレシートを削除してもよろしいですか？この操作は取り消せません。',
        addExpense: '経費を追加',
        chooseRecipient: '送金相手を選択',
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
        deletedTransaction: (amount: string, merchant: string) => `経費を削除しました（${merchant} への ${amount}）`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `経費${reportName ? `${reportName}から` : ''}を移動しました`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `を <a href="${reportUrl}">${reportName}</a> に` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `次のレポートから：<a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費をあなたの<a href="${reportUrl}">個人スペース</a>に移動しました`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `このレポートを<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
            }
            return `この<a href="${movedReportUrl}">レポート</a>を<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: 'カード取引との照合待ちのレシート',
        pendingMatch: '一致保留中',
        pendingMatchWithCreditCardDescription: '領収書はカード取引との照合待ちです。取り消すには現金としてマークしてください。',
        markAsCash: '現金としてマーク',
        routePending: '経路を保留中…',
        receiptScanning: () => ({
            one: 'レシートをスキャンしています…',
            other: '領収書をスキャンしています…',
        }),
        scanMultipleReceipts: '複数のレシートをスキャン',
        scanMultipleReceiptsDescription: 'すべてのレシートをまとめて撮影し、内容を自分で確認するか、私たちにお任せください。',
        receiptScanInProgress: 'レシートをスキャンしています',
        receiptScanInProgressDescription: 'レシートのスキャンを実行中です。後でまた確認するか、今すぐ詳細を入力してください。',
        removeFromReport: 'レポートから削除',
        moveToPersonalSpace: '経費を個人スペースに移動',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '重複の可能性がある経費を検出しました。重複を確認して送信を有効にしてください。'
                : '重複の可能性がある経費が見つかりました。承認を有効にするには重複を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '問題が見つかりました',
        }),
        fieldPending: '保留中...',
        defaultRate: '既定レート',
        receiptMissingDetails: '領収書の詳細が不足しています',
        missingAmount: '金額が未入力',
        missingMerchant: '不足している加盟店',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のこのレシートを見られるのはあなただけです。後でまた確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。詳細を手動で入力してください。',
        transactionPendingDescription: '取引は保留中です。記帳されるまで数日かかる場合があります。',
        companyInfo: '会社情報',
        companyInfoDescription: '初めての請求書を送信する前に、あと少し詳細を入力してください。',
        yourCompanyName: '会社名',
        yourCompanyWebsite: '自社のウェブサイト',
        yourCompanyWebsiteNote: 'ウェブサイトをお持ちでない場合は、代わりに会社のLinkedInまたはソーシャルメディアのプロフィールを入力できます。',
        invalidDomainError: '無効なドメインが入力されています。続行するには、有効なドメインを入力してください。',
        publicDomainError: 'パブリックドメインが入力されています。続行するには、プライベートドメインを入力してください。',
        expenseCount: () => {
            return {
                one: '1 件の経費',
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
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify で ${formattedAmount} を支払う` : `Expensifyで支払う`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `個人として${formattedAmount}を支払う` : `個人アカウントで支払う`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `ウォレットで${formattedAmount}を支払う` : `ウォレットで支払う`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} を支払う`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} をビジネスとして支払う` : `ビジネスアカウントで支払う`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} を支払済みにする` : `支払い済みにする`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `個人口座（下4桁 ${last4Digits}）で ${amount} を支払いました` : `個人アカウントで支払い済み`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `ビジネスアカウント ${last4Digits} で ${amount} を支払いました` : `ビジネス口座で支払済み`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${policyName}で${formattedAmount}を支払う` : `${policyName}で支払う`),
        businessBankAccount: (amount?: string, last4Digits?: string) =>
            amount ? `銀行口座（下4桁 ${last4Digits}）で ${amount} を支払いました` : `銀行口座（下4桁 ${last4Digits}）で支払い済み`,
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>を介して、銀行口座 ${last4Digits} で ${amount ? `${amount} ` : ''} を支払いました`,
        invoicePersonalBank: (lastFour: string) => `個人アカウント・${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `ビジネス口座・${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} の請求書を送信`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `${comment} のため` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `送信済み${memo ? `（メモ: ${memo} と記入）` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出の遅延</a>経由で提出されました`,
        queuedToSubmitViaDEW: 'カスタム承認ワークフローで提出待ち',
        queuedToApproveViaDEW: 'カスタム承認ワークフロー経由で承認待ち',
        trackedAmount: (formattedAmount: string, comment?: string) => `追跡中 ${formattedAmount}${comment ? `${comment} のため` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} を分割`,
        didSplitAmount: (formattedAmount: string, comment: string) => `分割 ${formattedAmount}${comment ? `${comment} のため` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `あなたの分担額 ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} の未払い額は ${amount}${comment ? `${comment} のため` : ''} です`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} の負担額:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} が支払いました:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} は ${amount} を使用しました`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} の支出額：`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} が承認しました：`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} が ${amount} を承認しました`,
        payerSettled: (amount: number | string) => `${amount} を支払いました`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount}支払われました。支払いを受け取るには銀行口座を追加してください。`,
        automaticallyApproved: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>により承認済み`,
        approvedAmount: (amount: number | string) => `承認済み ${amount}`,
        approvedMessage: `承認済み`,
        unapproved: `未承認`,
        automaticallyForwarded: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>により承認済み`,
        forwarded: `承認済み`,
        rejectedThisReport: 'このレポートを却下しました',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `支払いを開始しましたが、${submitterDisplayName} が銀行口座を追加するのを待っています。`,
        adminCanceledRequest: '支払いをキャンセルしました',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `${submitterDisplayName} が30日以内に Expensify ウォレットを有効化しなかったため、${amount} の支払いをキャンセルしました`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} が銀行口座を追加しました。${amount} の支払いが実行されました。`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}支払い済みにしました${comment ? `、「${comment}」と言っています` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}はウォレットで支払いました`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}は<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>に従いExpensifyで支払われました`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます',
        changedTheExpense: '経費を変更しました',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant} に設定し、その結果、金額が ${newAmountToDisplay} に設定されました`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（以前は${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} を ${oldValueToDisplay} から ${newValueToDisplay} に`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant}（以前は ${oldMerchant}）に変更し、それにより金額が ${newAmountToDisplay}（以前は ${oldAmountToDisplay}）に更新されました`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースのルール</a>に基づく` : 'ワークスペースルールに基づく'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `${comment} 用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} を送信しました${comment ? `${comment} のため` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `個人スペースから${workspaceName ?? `${reportName} とチャット`}に経費を移動しました`,
        movedToPersonalSpace: '経費をパーソナルスペースに移動しました',
        error: {
            invalidCategoryLength: 'カテゴリ名が255文字を超えています。短くするか、別のカテゴリを選択してください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選択してください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidReadings: '開始値と終了値の両方を入力してください',
            negativeDistanceNotAllowed: '終了値は開始値より大きくなければなりません',
            invalidIntegerAmount: '続行する前にドルの整数金額を入力してください',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税額は${amount}です`,
            invalidSplit: '分割額の合計は合計金額と一致している必要があります',
            invalidSplitParticipants: '少なくとも2人の参加者に対して、0より大きい金額を入力してください',
            invalidSplitYourself: '分割する金額は 0 以外の値を入力してください',
            noParticipantSelected: '参加者を選択してください',
            other: '予期せぬエラーが発生しました。後でもう一度お試しください。',
            genericCreateFailureMessage: 'この経費の送信中に予期しないエラーが発生しました。時間をおいてもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留を解除する際に予期せぬエラーが発生しました。後でもう一度お試しください。',
            receiptDeleteFailureError: 'このレシートの削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage: '<rbr>レシートのアップロード中にエラーが発生しました。後で<a href="download">レシートを保存</a>してから<a href="retry">もう一度お試しください</a>。</rbr>',
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            genericDeleteFailureMessage: 'この経費の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: '取引に不足している項目があります',
            duplicateWaypointsErrorMessage: '重複している経路ポイントを削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも 2 つの異なる住所を入力してください',
            splitExpenseMultipleParticipantsErrorMessage: '経費はワークスペースと他のメンバーの間で分割できません。選択内容を更新してください。',
            invalidMerchant: '有効な加盟店を入力してください',
            atLeastOneAttendee: '少なくとも1人の参加者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量は0より大きくなければなりません',
            invalidSubrateLength: '少なくとも1つのサブレートが必要です',
            invalidRate: 'このワークスペースでは無効なレートです。ワークスペースで利用可能なレートを選択してください。',
            endDateBeforeStartDate: '終了日は開始日より前にはできません',
            endDateSameAsStartDate: '終了日を開始日と同じ日にすることはできません',
            manySplitsProvided: `分割できる最大数は${CONST.IOU.SPLITS_LIMIT}です。`,
            dateRangeExceedsMaxDays: `日付範囲は${CONST.IOU.SPLITS_LIMIT}日を超えることはできません。`,
        },
        dismissReceiptError: 'エラーを閉じる',
        dismissReceiptErrorConfirmation: 'ご注意ください！このエラーを閉じると、アップロードしたレシートが完全に削除されます。本当によろしいですか？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `清算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留中です。`,
        enableWallet: 'ウォレットを有効にする',
        hold: '保留',
        unhold: '保留を解除',
        holdExpense: () => ({
            one: '経費を保留',
            other: '経費を保留',
        }),
        unholdExpense: '保留解除経費',
        heldExpense: 'この経費を保留しました',
        unheldExpense: 'この経費の保留を解除しました',
        moveUnreportedExpense: '未報告の経費を移動',
        addUnreportedExpense: '未報告の経費を追加',
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1つ選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。下から新しく作成してみてください。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留している理由を説明してください。',
            other: 'これらの経費を保留している理由を説明してください。',
        }),
        retracted: '撤回済み',
        retract: '取り消す',
        reopened: '再開済み',
        reopenReport: 'レポートを再開',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。本当にこのレポートを再度開きますか？`,
        reason: '理由',
        holdReasonRequired: '保留する場合は理由が必須です。',
        expenseWasPutOnHold: '経費は保留されました',
        expenseOnHold: 'この経費は保留されています。次のステップについてはコメントを確認してください。',
        expensesOnHold: 'すべての経費が保留になりました。次のステップについてはコメントを確認してください。',
        expenseDuplicate: 'この経費は別の経費と詳細がよく似ています。続行するには重複している項目を確認してください。',
        someDuplicatesArePaid: 'これらの重複の中には、すでに承認済みまたは支払い済みのものがあります。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて保持',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認してください。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払金額を確認',
        confirmPayAmount: '保留中でない金額を支払うか、レポート全体を支払ってください。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費を保留しますか？',
        whatIsHoldExplain: '保留は、提出する準備ができるまで経費を「一時停止」しておくようなイメージです。',
        holdIsLeftBehind: 'レポート全体を提出しても、保留中の経費は提出されず残ります。',
        unholdWhenReady: '提出する準備ができたら、経費の保留を解除してください。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースに移動すると変更されやすい、次の項目を再確認してください。',
            reCategorize: 'ワークスペースのルールに従うように、<strong>経費のカテゴリーを再設定</strong>してください。',
            workflows: 'このレポートには、別の<strong>承認ワークフロー</strong>が適用される可能性があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: '設定',
        changed: '変更済み',
        removed: '削除済み',
        transactionPending: '取引は保留中です。',
        chooseARate: 'ワークスペースでの払い戻し単価を、1マイルまたは1キロメートルあたりで選択してください',
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: 'お知らせです！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `このレポートはすでに${accountingIntegration}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。このレポートの承認を取り消してもよろしいですか？`,
        reimbursable: '精算対象',
        nonReimbursable: '払い戻し対象外',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約はまだ支払われていないため、保留中です。',
        bookingArchived: 'この予約はアーカイブされています',
        bookingArchivedDescription: 'この予約は旅行日が過ぎたためアーカイブされています。必要に応じて最終金額の経費を追加してください。',
        attendees: '参加者',
        whoIsYourAccountant: 'あなたの会計士は誰ですか？',
        paymentComplete: '支払いが完了しました',
        time: '時間',
        startDate: '開始日',
        endDate: '終了日',
        startTime: '開始時刻',
        endTime: '終了時刻',
        deleteSubrate: 'サブレートを削除',
        deleteSubrateConfirmation: 'このサブレートを削除してもよろしいですか？',
        quantity: '数量',
        subrateSelection: '副料金を選択し、数量を入力してください。',
        qty: '数量',
        firstDayText: () => ({
            one: `1日目：1時間`,
            other: (count: number) => `初日：${count.toFixed(2)}時間`,
        }),
        lastDayText: () => ({
            one: `最終日：1時間`,
            other: (count: number) => `最終日：${count.toFixed(2)}時間`,
        }),
        tripLengthText: () => ({
            one: `出張: 1日分`,
            other: (count: number) => `出張：${count} 日間`,
        }),
        dates: '日付',
        rates: '料金',
        submitsTo: ({name}: SubmitsToParams) => `${name}に提出`,
        reject: {
            educationalTitle: '保留しますか、それとも却下しますか？',
            educationalText: '経費を承認または支払う準備がまだできていない場合は、保留にするか却下できます。',
            holdExpenseTitle: '承認や支払いの前に詳細を確認するため、経費を保留にします。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたまま、他の経費を承認できます。',
            heldExpenseLeftBehindTitle: '保留中の経費は、レポート全体を承認してもそのまま残ります。',
            rejectExpenseTitle: '承認や支払いを行う予定のない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を却下する理由を説明してください。',
            rejectReason: '却下理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費は却下されました。問題を修正し、解決済みにしてから提出できるようにしてください。',
            reportActions: {
                rejectedExpense: 'この経費を却下しました',
                markedAsResolved: '却下理由を解決済みにしました',
            },
        },
        moveExpenses: () => ({one: '経費を移動', other: '経費を移動'}),
        moveExpensesError: '日当経費は、ワークスペースごとに日当レートが異なる場合があるため、他のワークスペースのレポートへ移動することはできません。',
        changeApprover: {
            title: '承認者を変更',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `このレポートの承認者を変更する方法を選択してください。（すべてのレポートで承認者を恒久的に変更するには、<a href="${workflowSettingLink}">ワークスペース設定</a>を更新してください。）`,
            changedApproverMessage: (managerID: number) => `承認者を <mention-user accountID="${managerID}"/> に変更しました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに承認者を追加する。',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '自分を最終承認者に指定し、残りの承認者をすべてスキップします。',
            },
            addApprover: {
                subtitle: 'このレポートに追加の承認者を選択してください。その後、残りの承認ワークフローに回付します。',
            },
        },
        chooseWorkspace: 'ワークスペースを選択',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `カスタム承認ワークフローにより、レポートが${to}に回付されました`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? '時間' : '時間'} @ ${rate} / 時間`,
            hrs: '時間',
            hours: '時間',
            ratePreview: (rate: string) => `${rate} / 時間`,
            amountTooLargeError: '合計金額が大きすぎます。時間を減らすか、レートを下げてください。',
        },
        correctDistanceRateError: '距離レートのエラーを修正して、もう一度お試しください。',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>説明</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? '経費を「精算対象」にマークしました' : '経費を「非精算」にマークしました';
                }
                if (key === 'billable') {
                    return value ? '経費を「請求可能」に設定しました' : '経費を「請求不可」としてマークしました';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `税率を「${taxRateName}」に設定します`;
                    }
                    return `税率を「${taxRateName}」に変更`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `${translations.common[key].toLowerCase()} を「${updatedValue}」に設定する`;
                }
                return `${translations.common[key].toLowerCase()} を「${updatedValue}」に`;
            });
            return `${formatList(fragments)}（<a href="${policyRulesRoute}">ワークスペースルール</a>経由）`;
        },
    },
    transactionMerge: {
        listPage: {
            header: '経費をマージ',
            noEligibleExpenseFound: '該当する経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費とまとめられる経費はありません。対象となる経費の詳細は<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">こちら</a>をご覧ください。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `<strong>${reportName}</strong> と統合するために、<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">統合可能な経費</a>を選択してください。`,
        },
        receiptPage: {
            header: '領収書を選択',
            pageTitle: '保持したいレシートを選択してください。',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保持したい詳細を選択してください：',
            noDifferences: '取引間に差異は見つかりませんでした',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '1つの' : 'a';
                return `${article} の${field}を選択してください`;
            },
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
        shareToExpensify: 'Expensify で共有',
        messageInputLabel: 'メッセージ',
    },
    notificationPreferencesPage: {
        header: '通知設定',
        label: '新しいメッセージについて通知する',
        notificationPreferences: {
            always: 'すぐに',
            daily: '毎日',
            mute: 'ミュート',
            hidden: '非表示',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'この番号はまだ確認されていません。ボタンをクリックして、確認リンクをテキストメッセージで再送信してください。',
        emailHasNotBeenValidated: 'メールアドレスが認証されていません。ボタンをクリックして、認証リンクをテキストメッセージで再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を表示',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: 'ワークスペースのアバターを削除中に、予期しない問題が発生しました',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択された画像は、アップロード可能な最大サイズ ${maxUploadSizeInMB} MB を超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `高さ${minHeightInPx}ピクセル×幅${minWidthInPx}ピクセルより大きく、かつ高さ${maxHeightInPx}ピクセル×幅${maxWidthInPx}ピクセルより小さい画像をアップロードしてください。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `プロフィール写真は次のいずれかのタイプである必要があります：${allowedExtensions.join(', ')}。`,
    },
    avatarPage: {
        title: 'プロフィール写真を編集',
        upload: 'アップロード',
        uploadPhoto: '写真をアップロード',
        selectAvatar: 'アバターを選択',
        choosePresetAvatar: 'またはカスタムアバターを選択',
    },
    modal: {
        backdropLabel: 'モーダルバックドロップ',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の追加を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を追加するのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の提出を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が経費を提出するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を送信するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `これ以上の操作は不要です！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `銀行口座の追加を<strong>あなた</strong>が行うのを待機しています。`;
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
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなたの</strong>経費が自動送信されるのを待機しています${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>の経費が自動送信されるのを待っています${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動的に提出されるのを待機中${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `問題を解決してくれるのを<strong>あなた</strong>を待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が問題を修正するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を修正するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の承認を<strong>あなた</strong>が行うのを待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を承認するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を承認するのを待機中です。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートをエクスポートするのを<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `このレポートをエクスポートするのを<strong>${actor}</strong>が待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がこのレポートをエクスポートするのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の支払いを<strong>あなた</strong>が行うのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を支払うのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `ビジネス用銀行口座の設定が完了するのを<strong>あなた</strong>が終えるのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がビジネス銀行口座の設定を完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス銀行口座の設定を完了するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta}までに` : ` ${eta}`;
                }
                return `支払いの完了を待機しています${formattedETA}。`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `おっと！<strong>自分自身</strong>に提出しようとしているようです。自分のレポートを自分で承認することは、あなたのワークスペースでは<strong>禁止</strong>されています。別の相手にこのレポートを提出するか、提出先の変更について管理者に連絡してください。`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後ほど',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月末の最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月末最終日に',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '出張の最後に',
        },
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望する代名詞',
        selectYourPronouns: '代名詞を選択してください',
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
            subtitle: 'これらの詳細はあなたの公開プロフィールに表示されます。誰でも閲覧できます。',
        },
        privateSection: {
            title: '非公開',
            subtitle: 'これらの詳細は、旅行と支払いに利用されます。公開プロフィールに表示されることは一切ありません。',
        },
    },
    securityPage: {
        title: 'セキュリティオプション',
        subtitle: 'アカウントを安全に保つために、二要素認証を有効にしてください。',
        goToSecurity: 'セキュリティページに戻る',
    },
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '自分専用のQRコードや紹介リンクを共有して、メンバーをExpensifyに招待しましょう。',
    },
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: '検索してオプションを表示',
    },
    contacts: {
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を利用するには、アカウントの認証が必要です。',
        validateAccount: 'アカウントを認証する',
        helpText: ({email}: {email: string}) =>
            `Expensify にログインしたり領収書を送信したりする方法をさらに追加しましょう。<br/><br/>領収書を <a href="mailto:${email}">${email}</a> に転送するメールアドレスを追加するか、電話番号を追加して 47777（米国の電話番号のみ）宛てにテキストメッセージで領収書を送信してください。`,
        pleaseVerify: 'この連絡方法を確認してください。',
        getInTouch: '今後のご連絡はこちらの方法で行います。',
        enterMagicCode: (contactMethod: string) => `${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在のデフォルトの連絡方法です。削除する前に、別の連絡方法を選択して「デフォルトに設定」をクリックする必要があります。',
        removeContactMethod: '連絡先方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡先方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。しばらく待ってから、もう一度お試しください。',
            validateSecondaryLogin: 'マジックコードが正しくないか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡方法の削除に失敗しました。サポートが必要な場合はConciergeにお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法の設定に失敗しました。サポートが必要な場合はConciergeにお問い合わせください。',
            addContactMethod: 'この連絡方法を追加できませんでした。サポートが必要な場合はConciergeにお問い合わせください。',
            enteredMethodIsAlreadySubmitted: 'この連絡方法は既に存在しています',
            passwordRequired: 'パスワードが必要です。',
            contactMethodRequired: '連絡方法は必須です',
            invalidContactMethod: '無効な連絡方法',
        },
        newContactMethod: '新しい連絡方法',
        goBackContactMethods: '連絡方法に戻る',
    },
    pronouns: {
        coCos: '会社 / 原価',
        eEyEmEir: 'E／Ey／Em／Eir',
        faeFaer: 'フェイ／フェア',
        heHimHis: 'He / Him / His',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: 'She／Her／Hers',
        sheHerHersTheyThemTheirs: 'She / Her / Hers / They / Them / Theirs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne／Nir／Nirs',
        neeNerNers: 'Nee／Ner／Ners',
        perPers: '1人あたり / 人あたり',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon／Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze／Hir',
        callMeByMyName: '私の名前で呼んでください',
    },
    displayNamePage: {
        headerTitle: '表示名',
        isShownOnProfile: '表示名はあなたのプロフィールに表示されます。',
    },
    timezonePage: {
        timezone: 'タイムゾーン',
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されています。',
        getLocationAutomatically: '現在地を自動的に取得',
    },
    updateRequiredView: {
        updateRequired: '更新が必要です',
        pleaseInstall: 'New Expensify の最新バージョンにアップデートしてください',
        pleaseInstallExpensifyClassic: '最新バージョンの Expensify をインストールしてください',
        toGetLatestChanges: 'モバイルでは最新バージョンをダウンロードしてインストールしてください。Webではブラウザを更新してください。',
        newAppNotAvailable: 'New Expensify アプリは、すでにご利用いただけません。',
    },
    initialSettingsPage: {
        about: '概要',
        aboutPage: {
            description: '新しい Expensify アプリは、世界中のオープンソース開発者コミュニティによって作られています。Expensify の未来を共に築きましょう。',
            appDownloadLinks: 'アプリのダウンロードリンク',
            viewKeyboardShortcuts: 'キーボードショートカットを表示',
            viewTheCode: 'コードを表示',
            viewOpenJobs: '募集中の求人を表示',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'キャッシュをクリアして再起動',
            viewConsole: 'デバッグコンソールを表示',
            debugConsole: 'デバッグコンソール',
            description:
                '<muted-text>以下のツールを使って、Expensify の利用環境をトラブルシューティングしてください。問題が発生した場合は、<concierge-link>バグを報告</concierge-link>してください。</muted-text>',
            confirmResetDescription: '送信されていない下書きメッセージはすべて失われますが、その他のデータは安全です。',
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
            simulatePoorConnection: '不安定なインターネット接続をシミュレート',
            simulateFailingNetworkRequests: 'ネットワークリクエストの失敗をシミュレート',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイスの認証情報',
            invalidate: '無効にする',
            destroy: '削除',
            maskExportOnyxStateData: 'Onyx 状態をエクスポートする際に、機密メンバーデータをマスクする',
            exportOnyxState: 'Onyx の状態をエクスポート',
            importOnyxState: 'Onyxステートをインポート',
            testCrash: 'テストクラッシュ',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用中です。ここを押してクリアしてください。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルが無効です。もう一度お試しください。',
            invalidateWithDelay: '遅延して無効化',
            leftHandNavCache: '左側ナビキャッシュ',
            clearleftHandNavCache: 'クリア',
            recordTroubleshootData: 'トラブルシュートデータを記録',
            softKillTheApp: 'アプリをソフトキルする',
            kill: '強制終了',
            sentryDebug: 'Sentry デバッグ',
            sentryDebugDescription: 'Sentry リクエストをコンソールに記録',
            sentryHighlightedSpanOps: 'ハイライトされたスパン名',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click、navigation、ui.load',
        },
        debugConsole: {
            saveLog: 'ログを保存',
            shareLog: 'ログを共有',
            enterCommand: 'コマンドを入力',
            execute: '実行',
            noLogsAvailable: '利用可能なログはありません',
            logSizeTooLarge: ({size}: LogSizeParams) => `ログサイズが上限の ${size} MB を超えています。「ログを保存」を使用してログファイルをダウンロードしてください。`,
            logs: 'ログ',
            viewConsole: 'コンソールを表示',
        },
        security: 'セキュリティ',
        signOut: 'サインアウト',
        restoreStashed: '一時保存したログイン情報を復元',
        signOutConfirmationText: 'サインアウトすると、オフライン中の変更内容はすべて失われます。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro><a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>をお読みください。</muted-text-micro>`,
        help: 'ヘルプ',
        whatIsNew: '新機能',
        accountSettings: 'アカウント設定',
        account: 'アカウント',
        general: '一般',
    },
    closeAccountPage: {
        closeAccount: 'アカウントを閉じる',
        reasonForLeavingPrompt: '退会されるのはとても残念です。今後改善していくために、よろしければ理由をお聞かせいただけますか？',
        enterMessageHere: 'ここにメッセージを入力',
        closeAccountWarning: 'アカウントを閉鎖すると元に戻せません。',
        closeAccountPermanentlyDeleteData: '本当にアカウントを削除しますか？未処理の経費はすべて完全に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉鎖する意思を確認するため、デフォルトの連絡方法を入力してください。あなたのデフォルトの連絡方法は次のとおりです。',
        enterDefaultContact: 'デフォルトの連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法：',
        enterYourDefaultContactMethod: 'アカウントを閉鎖するため、既定の連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `<strong>${login}</strong> に統合したいアカウントを入力してください。`,
            notReversibleConsent: 'これは元に戻せないことを理解しました',
        },
        accountValidate: {
            confirmMerge: 'アカウントを統合してもよろしいですか？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `アカウントを統合すると元に戻すことはできず、<strong>${login}</strong> の未申請経費はすべて失われます。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `続行するには、<strong>${login}</strong> に送信されたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: 'マジックコードが正しくないか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントを統合しました！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text><strong>${from}</strong> のすべてのデータを <strong>${to}</strong> に正常に統合しました。今後は、このアカウントにはどちらのログイン情報でもサインインできます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: 'New Expensifyではまだアカウントの統合をサポートしていません。代わりに、Expensify Classicでこの操作を行ってください。',
            reachOutForHelp: '<muted-text><centered-text>ご不明な点があれば、いつでも<concierge-link>Concierge にお問い合わせください</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classic に移動',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email.split('@').at(1) ?? ''}</strong> によって管理されているため、<strong>${email}</strong> を統合できません。サポートが必要な場合は、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>ドメイン管理者により <strong>${email}</strong> が主なログインとして設定されているため、他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text><strong>${email}</strong>で2要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong>の2FAを無効にしてから、もう一度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく見る',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているため、マージできません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text><strong>${email}</strong> には Expensify アカウントがないため、アカウントを統合できません。代わりに、<a href="${contactMethodLink}">連絡先方法として追加</a>してください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>このアカウントは請求済みの課金関係を所有しているため、<strong>${email}</strong> にアカウントを統合することはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください',
            description: 'アカウントの統合を試行しすぎました。しばらくしてからもう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '検証が完了していないため、他のアカウントに統合できません。アカウントを検証してから、もう一度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: 'アカウントをそれ自体にマージすることはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '不審なアクティビティを報告',
        lockAccount: 'アカウントをロック',
        unlockAccount: 'アカウントのロック解除',
        compromisedDescription:
            'アカウントに何かおかしな点がありますか？ 報告すると、すぐにアカウントがロックされ、新しい Expensify Card の取引がブロックされ、アカウントの変更もできなくなります。',
        domainAdminsDescription: 'ドメイン管理者向け：これにより、ドメイン全体のすべてのExpensify Cardの利用と管理者による操作も一時停止されます。',
        areYouSure: 'Expensify アカウントをロックしてもよろしいですか？',
        onceLocked: '一度ロックされると、アカウントはロック解除のリクエストとセキュリティ審査が完了するまで制限されます',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `アカウントをロックできませんでした。この問題を解決するには、Conciergeにチャットでお問い合わせください。`,
        chatWithConcierge: 'Conciergeにチャットする',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'セキュリティ上の懸念を解決し、アカウントのロックを解除するには、Conciergeにチャットでお問い合わせください。',
        chatWithConcierge: 'Conciergeにチャットする',
    },
    twoFactorAuth: {
        headerTitle: '2要素認証',
        twoFactorAuthEnabled: '2要素認証が有効になりました',
        whatIsTwoFactorAuth: '2 要素認証（2FA）は、あなたのアカウントを安全に保つのに役立ちます。ログイン時には、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '2 要素認証を無効にする',
        explainProcessToRemove: '2 要素認証（2FA）を無効にするには、認証アプリから有効なコードを入力してください。',
        explainProcessToRemoveWithRecovery: '2 要素認証（2FA）を無効にするには、有効な復旧コードを入力してください。',
        disabled: '2 要素認証は無効になりました',
        noAuthenticatorApp: '今後、Expensify へのログインに認証アプリは不要になります。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらの復元コードを安全に保管してください！',
        codesLoseAccess: dedent(`
            認証アプリへのアクセスを失い、これらのコードも持っていない場合は、アカウントにアクセスできなくなります。

            注: 二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーするかダウンロードしてください',
        stepVerify: '確認',
        scanCode: '次の方法でQRコードをスキャンしてください：',
        authenticatorApp: '認証アプリ',
        addKey: 'または、この秘密キーを認証アプリに追加してください:',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2要素認証が有効になりました',
        congrats: 'おめでとうございます！これで追加のセキュリティが有効になりました。',
        copy: 'コピー',
        disable: '無効化',
        enableTwoFactorAuth: '2要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '二要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ上の理由により、統合を接続するにはXeroで二要素認証が必要です。',
        twoFactorAuthIsRequiredForAdminsHeader: '2 要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '2要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'Xero の会計連携には二要素認証が必要です。',
        twoFactorAuthIsRequiredCompany: 'あなたの会社では、2 要素認証が必須です。',
        twoFactorAuthCannotDisable: '2要素認証を無効にできません',
        twoFactorAuthRequired: 'Xero 連携には二要素認証（2FA）が必要で、無効にすることはできません。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'リカバリーコードを入力してください',
            incorrectRecoveryCode: '復元コードが正しくありません。もう一度お試しください。',
        },
        useRecoveryCode: '復旧コードを使用',
        recoveryCode: 'リカバリーコード',
        use2fa: '2要素認証コードを使用',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'パスワードを更新しました！',
        allSet: 'これで完了です。新しいパスワードは大切に保管してください。',
    },
    privateNotes: {
        title: '非公開メモ',
        personalNoteMessage: 'このチャットに関するメモをここに残せます。メモを追加、編集、閲覧できるのはあなただけです。',
        sharedNoteMessage: 'このチャットに関するメモをここに残せます。Expensify の従業員および team.expensify.com ドメインの他のメンバーがこれらのメモを閲覧できます。',
        composerLabel: 'メモ',
        myNote: '自分のメモ',
        error: {
            genericFailureMessage: '非公開メモを保存できませんでした',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '有効なセキュリティコードを入力してください',
        },
        securityCode: 'セキュリティコード',
        changeBillingCurrency: '請求通貨を変更',
        changePaymentCurrency: '支払通貨を変更',
        paymentCurrency: '支払通貨',
        paymentCurrencyDescription: 'すべての個人経費を換算する標準通貨を選択してください',
        note: `注: 支払い通貨を変更すると、Expensifyのお支払い金額に影響する場合があります。詳しくは<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。`,
    },
    addDebitCardPage: {
        addADebitCard: 'デビットカードを追加',
        nameOnCard: 'カード名義人の名前',
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
            addressStreet: '私書箱以外の有効な請求先住所を入力してください',
            addressState: '州を選択してください',
            addressCity: '都市名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '支払カードを追加',
        nameOnCard: 'カード名義人の名前',
        paymentCardNumber: 'カード番号',
        expiration: '有効期限',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: '請求先住所',
        growlMessageOnSave: 'お支払いカードが正常に追加されました',
        expensifyPassword: 'Expensify パスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            paymentCardNumber: '有効なカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '私書箱以外の有効な請求先住所を入力してください',
            addressState: '州を選択してください',
            addressCity: '都市名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払い方法',
        setDefaultConfirmation: 'デフォルトの支払い方法に設定',
        setDefaultSuccess: '既定の支払い方法を設定しました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを削除してもよろしいですか？',
        deleteCard: 'カードを削除',
        deleteCardConfirmation: '未提出のカード取引（未提出レポート上の取引を含む）はすべて削除されます。このカードを本当に削除しますか？この操作は取り消せません。',
        error: {
            notOwnerOfBankAccount: 'この銀行口座を既定の支払方法に設定する際にエラーが発生しました',
            invalidBankAccount: 'この銀行口座は一時的に利用停止されています',
            notOwnerOfFund: 'このカードを既定の支払い方法に設定する際にエラーが発生しました',
            setDefaultFailure: '問題が発生しました。詳しいサポートについてはConciergeにチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座の追加中に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: 'より早く支払いを受ける',
        addPaymentMethod: 'アプリ内で直接支払いの送受信を行うには、支払方法を追加してください。',
        getPaidBackFaster: 'より早く精算してもらう',
        secureAccessToYourMoney: 'あなたのお金への安全なアクセス',
        receiveMoney: '現地通貨で支払いを受け取る',
        expensifyWallet: 'Expensifyウォレット（ベータ版）',
        sendAndReceiveMoney: '友人とお金を送受信しましょう。対象は米国の銀行口座のみです。',
        enableWallet: 'ウォレットを有効にする',
        addBankAccountToSendAndReceive: '支払いの送金や受け取りのために銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        assignedCards: '割り当てられたカード',
        assignedCardsDescription: 'これらのカードの取引は自動的に同期されます。',
        expensifyCard: 'Expensify カード',
        walletActivationPending: 'お客様の情報を確認しています。数分後にもう一度ご確認ください。',
        walletActivationFailed: '申し訳ありませんが、現在ウォレットを有効にすることができません。サポートが必要な場合は、Conciergeにチャットでお問い合わせください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: 'Expensify に銀行口座を連携して、アプリ内での送金や受け取りをこれまで以上に簡単に行えるようにしましょう。',
        chooseYourBankAccount: '銀行口座を選択',
        chooseAccountBody: '必ず正しいものを選択してください。',
        confirmYourBankAccount: '銀行口座を確認',
        personalBankAccounts: '個人の銀行口座',
        businessBankAccounts: 'ビジネス用銀行口座',
        shareBankAccount: '銀行口座を共有',
        bankAccountShared: '共有された銀行口座',
        shareBankAccountTitle: 'この銀行口座を共有する管理者を選択してください:',
        shareBankAccountSuccess: '銀行口座を共有しました！',
        shareBankAccountSuccessDescription: '選択された管理者は、Concierge から確認メッセージを受け取ります。',
        shareBankAccountFailure: '銀行口座を共有しようとして予期しないエラーが発生しました。もう一度お試しください。',
        shareBankAccountEmptyTitle: '利用可能な管理者がいません',
        shareBankAccountEmptyDescription: 'この銀行口座を共有できるワークスペース管理者がいません。',
        shareBankAccountNoAdminsSelected: '続行する前に管理者を選択してください',
        unshareBankAccount: '銀行口座の共有を解除',
        unshareBankAccountDescription: '以下の全員がこの銀行口座にアクセスできます。アクセス権はいつでも削除できます。進行中の支払いは引き続き完了します。',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} はこのビジネス銀行口座へのアクセス権を失います。進行中の支払いは引き続き完了します。`,
        reachOutForHelp: 'Expensify Card と一緒に使用されています。共有を解除する必要がある場合は、<concierge-link>Concierge にお問い合わせください</concierge-link>。',
        unshareErrorModalTitle: '銀行口座の共有を解除できません',
    },
    cardPage: {
        expensifyCard: 'Expensify カード',
        expensifyTravelCard: 'Expensify トラベルカード',
        availableSpend: '残りの上限',
        smartLimit: {
            name: 'スマート上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大で${formattedLimit}まで利用でき、提出した経費が承認されると、利用可能額はリセットされます。`,
        },
        fixedLimit: {
            name: '固定上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大 ${formattedLimit} まで利用でき、その後は自動的に無効になります。`,
        },
        monthlyLimit: {
            name: '月次上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `このカードでは、1か月あたり最大 ${formattedLimit} まで利用できます。利用限度額は毎月1日（暦月の初日）にリセットされます。`,
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: '出張カードのCVV',
        physicalCardNumber: '物理カード番号',
        physicalCardPin: 'PIN',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカードの不正利用を報告',
        reportTravelFraud: 'トラベルカード不正利用を報告',
        reviewTransaction: '取引を確認',
        suspiciousBannerTitle: '不審な取引',
        suspiciousBannerDescription: 'カードで不審な取引を検知しました。内容を確認するには下をタップしてください。',
        cardLocked: '現在、当社チームがあなたの会社のアカウントを確認している間、カードは一時的にロックされています。',
        markTransactionsAsReimbursable: '取引を立替精算対象としてマークする',
        markTransactionsDescription: '有効にすると、このカードからインポートされた取引はデフォルトで立替精算対象としてマークされます。',
        csvCardDescription: 'CSVインポート',
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
        validateCardTitle: 'ご本人様であることを確認します',
        enterMagicCode: (contactMethod: string) => `カード情報を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">個人情報を追加</a>してから、もう一度お試しください。`,
        unexpectedError: 'Expensifyカードの詳細を取得中にエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです',
            reportFraudButtonText: 'いいえ、私ではありません',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審なアクティビティを解消し、カード x${cardLastFour} を再有効化しました。これで引き続き経費精算できます！`,
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
            }) => `末尾が${cardLastFour}のカードで不審な利用を検出しました。この請求にお心当たりはありますか？

${date}の${merchant}への${amount}`,
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認と支払いまでを含むワークフローを設定しましょう。',
        submissionFrequency: '提出物',
        submissionFrequencyDescription: '経費精算の提出スケジュールをカスタマイズして選択してください。',
        submissionFrequencyDateOfMonth: '月の日付',
        disableApprovalPromptDescription: '承認を無効にすると、既存のすべての承認ワークフローが削除されます。',
        addApprovalsTitle: '承認',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `${members} からの経費で、承認者は ${approvers} です`,
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'より詳細なワークフローが存在する場合を除き、このデフォルトのワークフローがすべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に、追加の承認を必須にする。',
        makeOrTrackPaymentsTitle: '支払い',
        makeOrTrackPaymentsDescription: 'Expensifyで行われた支払いのために承認済み支払人を追加するか、他の場所で行われた支払いを追跡します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更したい場合は、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        editor: {
            submissionFrequency: 'エラーのない支出を共有するまでに、Expensify が待機する時間を選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動提出に設定してください',
        frequencies: {
            instant: '即時に',
            weekly: '毎週',
            monthly: '毎月',
            twiceAMonth: '月2回',
            byTrip: '出張別',
            manually: '手動で',
            daily: '毎日',
            lastDayOfMonth: '月末最終日',
            lastBusinessDayOfMonth: '月末営業日',
            ordinals: {
                one: '番目',
                two: '日経ダウ指数',
                few: 'rd',
                other: '番目',
                '1': '最初',
                '2': '秒',
                '3': '3 番目',
                '4': '4番目',
                '5': '5番目',
                '6': '第六',
                '7': '7番目',
                '8': '8番目',
                '9': '9番目',
                '10': '10番目',
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに所属しています。ここでの更新内容は、そちらにも反映されます。',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。循環したワークフローを避けるため、別の承認者を選択してください。`,
        emptyContent: {
            title: '表示できるメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは、すでに既存の承認ワークフローに属しています。',
            approverSubtitle: 'すべての承認者は既存のワークフローに属しています。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '申請頻度を変更できませんでした。もう一度お試しいただくか、サポートまでご連絡ください。',
        monthlyOffsetErrorMessage: '月次頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
    },
    workflowsCreateApprovalsPage: {
        title: '確認',
        header: '承認者を追加して確定してください。',
        additionalApprover: '追加承認者',
        submitButton: 'ワークフローを追加',
    },
    workflowsEditApprovalsPage: {
        title: '承認ワークフローを編集',
        deleteTitle: '承認ワークフローを削除',
        deletePrompt: 'この承認ワークフローを本当に削除しますか？すべてのメンバーは以後、デフォルトのワークフローに従うようになります。',
    },
    workflowsExpensesFromPage: {
        title: '以下の経費:',
        header: '次のメンバーが経費を提出したとき：',
    },
    workflowsApproverPage: {
        genericErrorMessage: '承認者を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        title: '承認者を設定',
        description: 'この人が経費を承認します。',
    },
    workflowsApprovalLimitPage: {
        title: '承認者',
        header: '（オプション）承認限度額を追加しますか？',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `<strong>${approverName}</strong> が承認者で、レポートが以下の金額を超える場合に別の承認者を追加する:`
                : 'レポート金額が以下の金額を超えた場合に、承認者をもう一人追加する:',
        reportAmountLabel: 'レポート金額',
        additionalApproverLabel: '追加承認者',
        skip: 'スキップ',
        next: '次へ',
        removeLimit: '上限を解除',
        enterAmountError: '有効な金額を入力してください',
        enterApproverError: 'レポート上限を設定する場合は承認者が必要です',
        enterBothError: 'レポート金額と追加承認者を入力してください',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `${approvalLimit} を超えるレポートは ${approverName} に回覧されます`,
    },
    workflowsPayerPage: {
        title: '支払権限者',
        genericErrorMessage: '承認された支払者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払者',
        paymentAccount: '支払口座',
    },
    reportFraudPage: {
        title: 'バーチャルカードの不正利用を報告',
        description: 'バーチャルカードの情報が盗まれた、または不正利用された場合、現在のカードは永久に無効化され、新しいバーチャルカードとカード番号が発行されます。',
        deactivateCard: 'カードを無効化',
        reportVirtualCardFraud: 'バーチャルカードの不正利用を報告',
    },
    reportFraudConfirmationPage: {
        title: 'カード不正利用を報告済み',
        description: '既存のカードは完全に無効化しました。カードの詳細画面に戻ると、新しいバーチャルカードが利用可能になっています。',
        buttonText: '了解しました、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: 'プラスチックカードを有効化',
        error: {
            thatDidNotMatch: 'カードの下4桁と一致しません。もう一度お試しください。',
            throttled:
                'Expensify Cardの下4桁の入力回数が多すぎます。番号が正しいと確信している場合は、問題解決のためConciergeにお問い合わせください。そうでない場合は、時間をおいてから再度お試しください。',
        },
    },
    getPhysicalCard: {
        header: '物理カードを取得',
        nameMessage: 'カードに表示されるため、名と姓を入力してください。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '姓（戸籍上のもの）',
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
        estimatedDeliveryMessage: 'プラスチックカードは2～3営業日で届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `振替${amount ? ` ${amount}` : ''}`,
        instant: '即時（デビットカード）',
        instantSummary: (rate: string, minAmount: string) => `手数料 ${rate}%（最低 ${minAmount}）`,
        ach: '1～3営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どのアカウントですか？',
        fee: '手数料',
        transferSuccess: '振込が完了しました！',
        transferDetailBankAccount: '通常、送金は 1～3 営業日以内に口座へ反映されます。',
        transferDetailDebitCard: '送金はすぐに届くはずです。',
        failedTransfer: '残高がまだ完全に精算されていません。銀行口座へ振替してください。',
        notHereSubTitle: 'ウォレットページから残高を振り替えてください',
        goToWallet: 'ウォレットに移動',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'アカウントを選択',
    },
    paymentMethodList: {
        addPaymentMethod: '支払方法を追加',
        addNewDebitCard: '新しいデビットカードを追加',
        addNewBankAccount: '新しい銀行口座を追加',
        accountLastFour: '末尾番号',
        cardLastFour: '末尾番号が',
        addFirstPaymentMethod: 'アプリ内で直接支払いの送受信を行うには、支払方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: (lastFour: string) => `銀行口座・${lastFour}`,
    },
    expenseRulesPage: {
        title: '経費ルール',
        subtitle: 'これらのルールはあなたの経費に適用されます。ワークスペースに提出する場合、そのワークスペースのルールがこれらより優先されることがあります。',
        findRule: 'ルールを検索',
        emptyRules: {
            title: 'ルールはまだ作成されていません',
            subtitle: '経費精算を自動化するルールを追加する',
        },
        changes: {
            billableUpdate: (value: boolean) => `経費 ${value ? '請求可能' : '請求対象外'} を更新`,
            categoryUpdate: (value: string) => `カテゴリを「${value}」に更新`,
            commentUpdate: (value: string) => `説明を「${value}」に更新する`,
            merchantUpdate: (value: string) => `加盟店を「${value}」に更新`,
            reimbursableUpdate: (value: boolean) => `経費 ${value ? '精算対象' : '払い戻し対象外'} を更新`,
            tagUpdate: (value: string) => `タグを「${value}」に更新`,
            taxUpdate: (value: string) => `税率を「${value}」に更新`,
            billable: (value: boolean) => `経費 ${value ? '請求可能' : '請求対象外'}`,
            category: (value: string) => `カテゴリーを「${value}」に`,
            comment: (value: string) => `説明を「${value}」に変更`,
            merchant: (value: string) => `「${value}」に支払先を変更`,
            reimbursable: (value: boolean) => `経費 ${value ? '精算対象' : '払い戻し対象外'}`,
            tag: (value: string) => `「${value}」をタグ付け`,
            tax: (value: string) => `税率を「${value}」に`,
            report: (value: string) => `"${value}" という名前のレポートに追加`,
        },
        newRule: '新しいルール',
        addRule: {
            title: 'ルールを追加',
            expenseContains: '経費に次を含む場合:',
            applyUpdates: '次に、これらの更新を適用します。',
            merchantHint: '. を入力して、すべての加盟店に適用されるルールを作成します',
            addToReport: '名前が次のレポートに追加',
            createReport: '必要に応じてレポートを作成',
            applyToExistingExpenses: '既存の一致する経費に適用',
            confirmError: '店舗名を入力し、少なくとも1つの更新を適用してください',
            confirmErrorMerchant: '加盟店名を入力してください',
            confirmErrorUpdate: '少なくとも 1 つの更新を適用してください',
            saveRule: 'ルールを保存',
        },
        editRule: {
            title: 'ルールを編集',
        },
        deleteRule: {
            deleteSingle: 'ルールを削除',
            deleteMultiple: 'ルールを削除',
            deleteSinglePrompt: 'このルールを削除してもよろしいですか？',
            deleteMultiplePrompt: 'これらのルールを削除してもよろしいですか？',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: 'テスト設定',
            subtitle: 'ステージング環境でアプリをデバッグおよびテストするための設定です。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する新機能の更新やExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensify からのすべてのサウンドをミュートする',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読とピン留めされたチャットのみを#focusに表示するか、すべてのチャットを表示して最新とピン留めされたチャットを上部に表示するかを選択します。',
        priorityModes: {
            default: {
                label: '最新',
                description: '最新の順に並べてすべてのチャットを表示',
            },
            gsd: {
                label: '#focus',
                description: '未読のみをアルファベット順で表示',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `${policyName} 内`,
        generatingPDF: 'PDF を生成',
        waitForPDF: 'PDF を生成しています。しばらくお待ちください。',
        errorPDF: 'PDF の生成中にエラーが発生しました',
        successPDF: 'PDFが生成されました！自動的にダウンロードされない場合は、下のボタンを使用してください。',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: '部屋の説明（任意）',
        explainerText: 'このルームにカスタムの説明文を設定します。',
    },
    groupChat: {
        lastMemberTitle: 'お知らせです！',
        lastMemberWarning: 'ここに残っているのはあなただけなので、退出するとこのチャットには全メンバーがアクセスできなくなります。本当に退出してもよろしいですか？',
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
        chooseThemeBelowOrSync: '以下からテーマを選択するか、端末の設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすることで、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `<muted-text-xs>資金移動サービスは、その<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">ライセンス</a>に基づき、${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）によって提供されています。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: 'リカバリーコードを入力してください',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `新しいコードをリクエストできます：<a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: '新しいコードをリクエストする',
        error: {
            pleaseFillMagicCode: 'マジックコードを入力してください',
            incorrectMagicCode: 'マジックコードが正しくないか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'すべての項目を入力してください',
        pleaseFillPassword: 'パスワードを入力してください',
        pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには、2 要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        error: {
            incorrectPassword: 'パスワードが正しくありません。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログインまたはパスワードが正しくありません。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントでは二要素認証（2FA）が有効になっています。メールアドレスまたは電話番号を使用してサインインしてください。',
            invalidLoginOrPassword: 'ログインIDまたはパスワードが正しくありません。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。古いパスワードリセットメール内のリンクの有効期限が切れている可能性があります。再度お試しいただけるよう、新しいリンクをメールでお送りしました。数分以内に届きますので、受信トレイと迷惑メールフォルダをご確認ください。',
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
        welcomeSignOffTitleManageTeam: '上記のタスクが完了したら、承認ワークフローやルールなど、さらに多くの機能を一緒に見ていきましょう！',
        welcomeSignOffTitle: 'お会いできてうれしいです！',
        explanationModal: {
            title: 'Expensify へようこそ',
            description: 'チャットの速さでビジネスとプライベートの支出をまとめて管理できるアプリです。ぜひお試しいただき、ご意見をお聞かせください。これからさらに多くの機能が登場します！',
            secondaryDescription: 'Expensify Classic に戻るには、プロフィール写真をタップして「Expensify Classic に移動」を選択してください。',
        },
        getStarted: '始める',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: '知り合いの方がすでに参加しています！参加するにはメールアドレスを確認してください。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `${domain} のメンバーがすでにワークスペースを作成しています。${email} に送信されたマジックコードを入力してください。`,
        joinAWorkspace: 'ワークスペースに参加',
        listOfWorkspaces: '参加できるワークスペースの一覧です。今は参加しなくても、必要になったときにいつでも参加できます。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount}人のメンバー${employeeCount > 1 ? 's' : ''}・${policyOwner}`,
        whereYouWork: '勤務先はどちらですか？',
        errorSelection: '先に進むオプションを選択してください',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: 'セットアップを続行するには「続行」を押してください',
            errorBackButton: 'アプリを使い始めるには、設定の質問にすべて回答してください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主から精算してもらう',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: '自分のチームの経費を管理',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '経費を追跡して予算管理',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '友人とチャットして精算を分け合う',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'その他',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '従業員数1～10人',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11～50人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '従業員数 51～100 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101～1,000人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000人以上の従業員',
        },
        accounting: {
            title: '会計ソフトを利用していますか？',
            none: 'なし',
        },
        interestedFeatures: {
            title: 'どの機能にご興味がありますか？',
            featuresAlreadyEnabled: '当社で最も人気のある機能はこちらです：',
            featureYouMayBeInterestedIn: '追加機能を有効にする：',
        },
        error: {
            requiredFirstName: '続行するには名を入力してください',
        },
        workEmail: {
            title: '勤務先のメールアドレスは何ですか？',
            subtitle: 'Expensify は、仕事用メールアドレスを連携すると最もスムーズにご利用いただけます。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.com に転送してスキャンする',
                descriptionTwo: 'すでにExpensifyを利用している同僚に参加する',
                descriptionThree: 'より自分好みの体験をお楽しみください',
            },
            addWorkEmail: '勤務用メールアドレスを追加',
        },
        workEmailValidation: {
            title: '勤務先メールアドレスを確認',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `${workEmail} に送信されたマジックコードを入力してください。1～2分ほどで届きます。`,
        },
        workEmailValidationError: {
            publicEmail: 'プライベートドメインの有効な勤務用メールアドレスを入力してください（例：mitch@company.com）。',
            offline: 'オフラインのため、勤務先メールアドレスを追加できませんでした',
        },
        mergeBlockScreen: {
            title: '勤務用メールを追加できませんでした',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `${workEmail} を追加できませんでした。後で設定からもう一度お試しいただくか、ガイドについては Concierge にチャットでお問い合わせください。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL}) を試す`,
                description: ({testDriveURL}) => `なぜExpensifyが最速で経費精算できるツールなのか、[製品ツアーで素早く確認する](${testDriveURL})`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL}) を試す`,
                description: ({testDriveURL}) => `[お試しドライブ](${testDriveURL})で、あなたのチームに*Expensifyを3か月間無料*でお試しください！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        チームの支出を確認してコントロールするために、*経費承認* を追加しましょう。

                        手順は次のとおりです：

                        1. *ワークスペース* に移動します。
                        2. 自分のワークスペースを選択します。
                        3. *その他の機能* をクリックします。
                        4. *ワークフロー* を有効にします。
                        5. ワークスペースエディタで *ワークフロー* に移動します。
                        6. *承認* を有効にします。
                        7. あなたが経費の承認者として設定されます。チームを招待した後は、これを任意の管理者に変更できます。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `ワークスペースを[作成](${workspaceConfirmationLink})`,
                description: 'ワークスペースを作成し、セットアップ担当者のサポートを受けながら設定を構成しましょう！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース](${workspaceSettingsLink})を作成`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *ワークスペースを作成して* 経費を管理し、レシートをスキャンし、チャットなどを行いましょう。

                        1. *ワークスペース* をクリックし、*新しいワークスペース* を選択します。

                        *新しいワークスペースの準備ができました！* [こちらから確認](${workspaceSettingsLink})。`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリ](${workspaceCategoriesLink})を設定`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *カテゴリを設定* すると、チームが経費にコードを付けてレポートしやすくなります。

                        1. 「*ワークスペース*」をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. 「*カテゴリ*」をクリックします。
                        4. 不要なカテゴリを無効にします。
                        5. 右上から独自のカテゴリを追加します。

                        [ワークスペースのカテゴリ設定に移動](${workspaceCategoriesLink})。

                        ![カテゴリを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '経費を申請経費を提出',
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
                title: '経費を申請経費を提出',
                description: dedent(`
                    金額を入力するかレシートをスキャンして、*経費を提出*しましょう。

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
                    *領収書の有無にかかわらず*、どの通貨でも経費を記録できます。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. *個人* スペースを選択します。
                    5. *作成* をクリックします。

                    これで完了です！とても簡単です。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `接続${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'から'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : '宛先'} ${integrationName} を接続して、月末決算が簡単になる、自動経費コーディングと同期を利用しましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *会計* をクリックします。
                        4. ${integrationName} を見つけます。
                        5. *接続* をクリックします。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[会計ページへ移動](${workspaceAccountingLink})。

                        ![${integrationName} に接続](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[経理画面へ移動](${workspaceAccountingLink})。`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[法人カード](${corporateCardLink})を連携`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        すでにお持ちのカードを連携して、取引の自動取り込み、領収書の照合、調整を行いましょう。

                        1. 「*ワークスペース*」をクリックします。
                        2. 対象のワークスペースを選択します。
                        3. 「*会社カード*」をクリックします。
                        4. 表示される手順に従ってカードを接続します。

                        [会社カードへ移動](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[チームを招待](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *チームを招待*して、今日から経費管理を始めましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *メンバー* > *メンバーを招待* をクリックします。
                        4. メールアドレスまたは電話番号を入力します。
                        5. 必要に応じてカスタム招待メッセージを追加します。

                        [ワークスペースのメンバーに移動](${workspaceMembersLink})。

                        ![チームを招待](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリー](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        チームが経費を簡単にレポートできるように、*カテゴリとタグを設定*しましょう。

                        [会計ソフトを連携する](${workspaceAccountingLink})ことで自動的にインポートするか、[ワークスペース設定](${workspaceCategoriesLink})から手動で設定できます。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[タグ](${workspaceTagsLink})を設定`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        タグを使って、プロジェクト、クライアント、所在地、部門などの経費情報を追加できます。複数階層のタグが必要な場合は、Control プランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *More features* をクリックします。
                        4. *Tags* を有効にします。
                        5. ワークスペースエディタで *Tags* に移動します。
                        6. *+ Add tag* をクリックして、独自のタグを作成します。

                        [More features に移動](${workspaceMoreFeaturesLink})。

                        ![タグを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `[会計士](${workspaceMembersLink})を招待する`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *会計士を招待して*、ワークスペースで共同作業を行い、ビジネス経費を管理しましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *メンバー* をクリックします。
                        4. *メンバーを招待* をクリックします。
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

                    まだExpensifyを使っていない相手には、自動的に招待が送信されます。

                    すべてのチャットは、相手が直接返信できるメールまたはテキストメッセージにもなります。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割',
                description: dedent(`
                    1人以上の相手と*精算*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット画面のグレーの *+* ボタンをクリックし、*精算* を選びます。
                    5. *手動*、*スキャン*、または *距離* を選んで経費を作成します。

                    必要であれば詳細を追加してもいいですし、そのまま送信してもかまいません。さっそく立て替え分を返金してもらいましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink})を確認する`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        ワークスペース設定を確認・更新する手順:
                        1. 「ワークスペース」をクリックします。
                        2. 対象のワークスペースを選択します。
                        3. 設定を確認して更新します。
                        [ワークスペースに移動](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '最初のレポートを作成',
                description: dedent(`
                    レポートの作成方法は次のとおりです。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *レポートを作成* を選択します。
                    3. *経費を追加* をクリックします。
                    4. 最初の経費を追加します。

                    これで完了です！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[テストドライブ](${testDriveURL}) を試す` : '試してみる'),
            embeddedDemoIframeTitle: '試用版',
            employeeFakeReceipt: {
                description: '私の試乗の領収書！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '立て替えたお金を返してもらうのは、メッセージを送るくらい簡単です。基本を確認しましょう。',
            onboardingPersonalSpendMessage: '数回のクリックで支出を管理する方法をご紹介します。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 無料トライアルが開始されました！セットアップを始めましょう。
                        👋 こんにちは、私はあなたのExpensifyセットアップ担当です。すでに、チームの領収書と経費を管理するためのワークスペースを作成してあります。30日間の無料トライアルを最大限に活用するには、以下の残りのセットアップ手順に従ってください。
                    `)
                    : dedent(`
                        # 無料トライアルが開始されました！さっそく設定を始めましょう。
                        👋 こんにちは、私はあなたのExpensifyの設定スペシャリストです。ワークスペースを作成したので、以下のステップに従って30日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage:
                '# セットアップを始めましょう\n👋 こんにちは、私はあなたのExpensifyセットアップ担当です。すでに領収書や経費を管理するためのワークスペースを作成済みです。30日間の無料トライアルを最大限活用するために、残りのセットアップ手順に沿って進めてください！',
            onboardingChatSplitMessage: '友だちとの割り勘は、メッセージを送るくらい簡単です。やり方をご紹介します。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自分の経費を提出する方法を学びましょう。',
            onboardingLookingAroundMessage:
                'Expensify は経費、出張、法人カードの管理で最もよく知られていますが、それだけではありません。ご興味のあることを教えていただければ、導入のお手伝いをします。',
            onboardingTestDriveReceiverMessage: '*3か月間無料です！まずは下から始めましょう。*',
        },
        workspace: {
            title: 'ワークスペースで整理整頓しよう',
            subtitle: '強力なツールで経費管理をシンプルにし、すべてを1か所で完結できます。ワークスペースを使うと、次のことができます。',
            explanationModal: {
                descriptionOne: '領収書を記録して整理する',
                descriptionTwo: '経費を分類してタグ付けする',
                descriptionThree: 'レポートを作成して共有',
            },
            price: 'まずは30日間無料でお試し、その後は<strong>1ユーザーあたり月額$5</strong>でアップグレードできます。',
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: 'チャットのスピードで、領収書の管理、経費の精算、出張の管理、レポート作成などを行えるワークスペースを作成しましょう。',
        },
        inviteMembers: {
            title: 'メンバーを招待',
            subtitle: 'チームを追加したり、会計士を招待しましょう。人数が多いほど、もっと便利になります！',
        },
    },
    featureTraining: {
        doNotShowAgain: '今後このメッセージを表示しない',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '名前に特殊文字は使用できません',
            containsReservedWord: '名前に「Expensify」または「Concierge」という単語を含めることはできません',
            hasInvalidCharacter: '名前にコンマまたはセミコロンを含めることはできません',
            requiredFirstName: '名は空欄にできません',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '法的氏名は何ですか？',
        enterDateOfBirth: '生年月日はいつですか？',
        enterAddress: 'あなたの住所は何ですか？',
        enterPhoneNumber: '電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は、出張と支払いに利用されます。お客様の公開プロフィールに表示されることは決してありません。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '姓（戸籍上のもの）',
        address: '住所',
        error: {
            dateShouldBeBefore: (dateString: string) => `日付は ${dateString} より前である必要があります`,
            dateShouldBeAfter: (dateString: string) => `日付は${dateString}より後の日付にしてください`,
            hasInvalidCharacter: '名前にはラテン文字のみ使用できます',
            incorrectZipFormat: (zipFormat?: string) => `郵便番号の形式が正しくありません${zipFormat ? `許可されている形式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `電話番号が有効であることを確認してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクを再送しました',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `${login} にマジックサインインリンクを送信しました。サインインするには、${loginType} を確認してください。`,
        resendLink: 'リンクを再送する',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `${secondaryLogin} を認証するには、${primaryLogin} のアカウント設定からマジックコードを再送してください。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `${primaryLogin} にアクセスできなくなった場合は、アカウントのリンクを解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクを送信しました！',
        successfullyUnlinkedLogin: 'セカンダリログインの連携解除に成功しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `メール配信の問題により、メールプロバイダーが一時的に${login}宛てのメール送信を停止しました。ログインのブロックを解除するには、次の手順に従ってください。`,
        confirmThat: (login: string) =>
            `<strong>${login} のつづりが正しく、実在していてメールを受信できるメールアドレスであることを確認してください。</strong> 「expenses@domain.com」のようなメールエイリアスは、有効な Expensify ログインとするために、専用のメール受信トレイへアクセスできなければなりません。`,
        ensureYourEmailClient: `<strong>お使いのメールクライアントで expensify.com からのメールが受信できるようにしてください。</strong> このステップの手順は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>で確認できますが、メール設定の構成には IT 部門の助けが必要な場合があります。`,
        onceTheAbove: `上記の手順が完了したら、ログインのブロック解除のために <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> までご連絡ください。`,
    },
    openAppFailureModal: {
        title: '問題が発生しました…',
        subtitle: `すべてのデータを読み込むことができませんでした。問題は通知されており、現在調査中です。解決しない場合は、次までご連絡ください`,
        refreshAndTryAgain: '再読み込みして、もう一度お試しください',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `${login} に SMS メッセージを送信できなかったため、一時的に利用を停止しました。次の手順で電話番号の確認をお試しください。`,
        validationSuccess: 'あなたの番号は認証されました！下をクリックして、新しいマジックサインインコードを送信してください。',
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
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '日' : '日数'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '時間' : '時間'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '分' : '分 मिनट'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `少々お待ちください！電話番号を再度確認するには、${timeText}お待ちいただく必要があります。`;
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
        title: '#focus モードへようこそ！',
        prompt: (priorityModePageUrl: string) =>
            `未読のチャットや対応が必要なチャットだけを表示して、やるべきことを把握しましょう。いつでも<a href="${priorityModePageUrl}">設定</a>から変更できます。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しのお支払いの詳細が見つかりません。',
        notHere: 'うーん…ここにはありません',
        pageNotFound: 'おっと、このページは見つかりません',
        noAccess: 'このチャットまたは経費は削除されたか、アクセス権がありません。\n\nご不明な点がありましたら concierge@expensify.com までお問い合わせください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。',
        goToChatInstead: '代わりにチャットに移動してください。',
        contactConcierge: 'ご不明な点がありましたら、concierge@expensify.com までお問い合わせください',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `おっと… ${isBreakLine ? '\n' : ''}問題が発生しました`,
        subtitle: 'リクエストを完了できませんでした。時間をおいて、もう一度お試しください。',
        wrongTypeSubtitle: 'その検索は無効です。検索条件を調整してもう一度お試しください。',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '絵文字を追加して、同僚や友だちが状況をひと目で分かるようにしましょう。必要に応じてメッセージを追加することもできます。',
        today: '今日',
        clearStatus: 'ステータスをクリア',
        save: '保存',
        message: 'メッセージ',
        timePeriods: {
            never: '決してない',
            thirtyMinutes: '30分',
            oneHour: '1時間',
            afterToday: '今日',
            afterWeek: '1週間',
            custom: 'カスタム',
        },
        untilTomorrow: 'また明日',
        untilTime: ({time}: UntilTimeParams) => `${time}まで`,
        date: '日付',
        time: '時間',
        clearAfter: '次の期間後に消去',
        whenClearStatus: 'ステータスをいつクリアしますか？',
        vacationDelegate: '休暇代理人',
        setVacationDelegate: `不在時に代わりにレポートを承認してもらえる休暇代理人を設定しましょう。`,
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `${nameOrEmail} さんの休暇代理として`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `${vacationDelegateName} の休暇代理として ${submittedToName} に`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `${nameOrEmail} を休暇中の代理人に指定しようとしています。現在、この人はすべてのワークスペースにまだ参加していません。続行する場合は、ワークスペースの全管理者に、この人を追加するようメールが送信されます。`,
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
        accountEnding: '末尾が〜の口座',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '下のアカウントを選択してください',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログイン',
        connectManually: '手動で接続',
        desktopConnection: '注：Chase、Wells Fargo、Capital One、または Bank of America と連携するには、こちらをクリックしてブラウザでこの手続きを完了してください。',
        yourDataIsSecure: 'お客様のデータは安全です',
        toGetStarted: '銀行口座を追加して、経費の精算、Expensifyカードの発行、請求書の入金回収、請求書支払いをすべて一箇所で行いましょう。',
        plaidBodyCopy: '社員が会社経費を支払うことも精算を受けることも、もっと簡単にできるようにしましょう。',
        checkHelpLine: '口座のルーティング番号と口座番号は、その口座の小切手に記載されています。',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `銀行口座を連携するには、まず<a href="${contactMethodRoute}">メールアドレスを主なログイン方法として追加</a>してから、再度お試しください。電話番号はサブのログイン方法として追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから、もう一度お試しください。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `おっと！ ワークスペースの通貨がUSD以外に設定されているようです。続行するには、<a href="${workspaceRoute}">ワークスペース設定</a>で通貨をUSDに変更してから、もう一度お試しください。`,
        bbaAdded: 'ビジネス銀行口座を追加しました！',
        bbaAddedDescription: '支払いに利用できる状態です。',
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
            addressCity: '有効な都市名を入力してください',
            addressStreet: '有効な番地・住所を入力してください',
            addressState: '有効な州を選択してください',
            incorporationDateFuture: '設立日は未来の日付にはできません',
            incorporationState: '有効な州を選択してください',
            industryCode: '有効な6桁の業種分類コードを入力してください',
            restrictedBusiness: 'ビジネスが制限対象の業種リストに含まれていないことを確認してください',
            routingNumber: '有効なルーティング番号を入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: 'ルーティング番号と口座番号を同じにすることはできません',
            companyType: '有効な会社の種類を選択してください',
            tooManyAttempts: '多数のログイン試行が行われたため、このオプションは24時間無効になっています。後でもう一度お試しいただくか、代わりに詳細を手動で入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: '有効なSSNの下4桁を入力してください',
            firstName: '有効な名を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: '標準の入金先口座またはデビットカードを追加してください',
            validationAmounts: '入力された検証用金額が正しくありません。銀行取引明細をもう一度ご確認のうえ、再度お試しください。',
            fullName: '有効な氏名を入力してください',
            ownershipPercentage: '有効なパーセント値を入力してください',
            deletePaymentBankAccount: 'この銀行口座はExpensify Cardの支払いに利用されているため、削除できません。この口座をどうしても削除したい場合は、Conciergeにお問い合わせください。',
            sameDepositAndWithdrawalAccount: '入金口座と出金口座が同じです。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'アカウントの詳細を教えてください。',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: 'あなたの銀行口座の詳細を教えてください。',
        accountHolderInformationStepHeader: '口座名義人の詳細は何ですか？',
        howDoWeProtectYourData: 'お客様のデータをどのように保護しますか？',
        currencyHeader: '銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '下記の詳細を再確認し、利用規約に同意するチェックボックスをオンにしてください。',
        toGetStarted: '個人の銀行口座を追加して、経費精算の受け取り、請求書の支払い、またはExpensifyウォレットの有効化を行いましょう。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensifyのパスワードを入力',
        alreadyAdded: 'このアカウントはすでに追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人の銀行口座を追加しました！',
        successMessage: 'おめでとうございます。銀行口座の設定が完了し、精算の受け取り準備が整いました。',
    },
    attachmentView: {
        unknownFilename: '不明なファイル名',
        passwordRequired: 'パスワードを入力してください',
        passwordIncorrect: 'パスワードが正しくありません。もう一度お試しください。',
        failedToLoadPDF: 'PDF ファイルの読み込みに失敗しました',
        pdfPasswordForm: {
            title: 'パスワード保護されたPDF',
            infoText: 'このPDFはパスワードで保護されています。',
            beforeLinkText: 'お願いします',
            linkText: 'パスワードを入力してください',
            afterLinkText: '表示する。',
            formLabel: 'PDF を表示',
        },
        attachmentNotFound: '添付ファイルが見つかりません',
        retry: '再試行',
    },
    messages: {
        errorMessageInvalidPhone: `かっこやハイフンを含まない有効な電話番号を入力してください。米国以外にお住まいの場合は、国番号を含めて入力してください（例: ${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} のメンバーです`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} さんはすでに ${name} の管理者です`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化を続行することにより、あなたは以下を読み、理解し、同意したものとみなされます',
        facialScan: 'Onfido 顔スキャン・ポリシーおよび同意書',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidoの顔スキャンポリシーおよび同意書</a>、<a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>プライバシー</a>、および<a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>利用規約</a>。</muted-text-micro>`,
        tryAgain: '再試行する',
        verifyIdentity: '本人確認',
        letsVerifyIdentity: '本人確認を行いましょう',
        butFirst: `その前に、少し退屈な内容です。次のステップで法律関連の文言をよく読んで、準備ができたら「同意する」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラへのアクセスを有効にする',
        cameraRequestMessage: '銀行口座の認証を完了するには、カメラへのアクセス許可が必要です。設定 ＞ New Expensify で有効にしてください。',
        microphonePermissionsNotGranted: 'マイクへのアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の認証を完了するためにマイクへのアクセスが必要です。「設定」＞「New Expensify」から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、本人確認書類の原本を撮影した画像をアップロードしてください。',
        documentNeedsBetterQuality:
            'ご提示の身分証明書は破損しているか、一部のセキュリティ機能が欠けているようです。損傷のない身分証明書が全体で確認できる元の画像をアップロードしてください。',
        imageNeedsBetterQuality: 'ご本人確認書類の画像品質に問題があります。書類全体がはっきりと写っている新しい画像をアップロードしてください。',
        selfieIssue: '自撮り写真／動画に問題があります。ライブ自撮り写真／動画をアップロードしてください。',
        selfieNotMatching: '自撮り写真／動画が本人確認書類と一致しません。顔がはっきりと写った新しい自撮り写真／動画をアップロードしてください。',
        selfieNotLive: '自撮り写真／動画がライブ写真／ライブ動画ではないようです。ライブ自撮り写真／ライブ動画をアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'ウォレットから送金・受け取りを行う前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: '本人確認を完了するために、あといくつか質問にお答えいただく必要があります。',
        helpLink: 'これが必要な理由の詳細を見る',
        legalFirstNameLabel: '法的な名',
        legalMiddleNameLabel: '法的なミドルネーム',
        legalLastNameLabel: '姓（戸籍上のもの）',
        selectAnswer: '続行するには回答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'SSN（社会保障番号）の確認に問題が発生しています。SSN の9桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前にこの情報を修正してください',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `ご本人確認ができませんでした。時間をおいてもう一度お試しいただくか、ご不明な点がある場合は<a href="mailto:${conciergeEmail}">${conciergeEmail}</a>までお問い合わせください。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '手数料と条件',
        haveReadAndAgreePlain: '電子開示を受け取ることを読み理解し、同意します。',
        haveReadAndAgree: `<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子開示</a>を受け取ることを読み、同意します。`,
        agreeToThePlain: 'プライバシーおよびウォレット契約に同意します。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>および<a href="${walletAgreementUrl}">ウォレット規約</a>に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越／クレジット機能はありません。',
        electronicFundsWithdrawal: '電子資金引き出し',
        standard: '標準',
        reviewTheFees: 'いくつかの手数料を確認してください。',
        checkTheBoxes: '以下のボックスにチェックを入れてください。',
        agreeToTerms: '利用規約に同意すると、すぐに始められます！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensifyウォレットは${walletProgram}が発行しています。`,
            perPurchase: '購入ごと',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金リロード',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会（提携ATM・提携外ATM）',
            customerService: 'カスタマーサービス（自動応答またはオペレーター対応）',
            inactivityAfterTwelveMonths: '非アクティブ（12か月間取引がない場合）',
            weChargeOneFee: '別の種類の手数料を1つ請求します。内容は次のとおりです。',
            fdicInsurance: 'お客様の資金はFDIC保険の対象となります。',
            generalInfo: `プリペイド口座に関する一般的な情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>をご覧ください。`,
            conditionsDetails: `すべての手数料およびサービスの詳細・条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> にアクセスするか、+1 833-400-0904 までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き出し（即時）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `（最小 ${amount}）`,
        },
        longTermsForm: {
            listOfAllFees: 'Expensify ウォレット手数料の一覧',
            typeOfFeeHeader: 'すべての手数料',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: '口座開設',
            openingAccountDetails: '口座開設手数料はかかりません。',
            monthlyFeeDetails: '月額料金はかかりません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス手数料はかかりません。',
            inactivityDetails: '非アクティブ料金はかかりません。',
            sendingFundsTitle: '別の口座保有者への送金',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使ってほかのアカウント保有者へ送金しても、手数料はかかりません。',
            electronicFundsStandardDetails:
                '標準オプションを利用してExpensifyウォレットから銀行口座へ資金を振り替える場合、手数料はかかりません。通常、この振込は1〜3営業日以内に完了します。',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                '即時振込オプションを使用してExpensifyウォレットからリンク済みのデビットカードへ資金を振り替える場合、手数料がかかります。この振込は通常、数分以内に完了します。' +
                `手数料は振込金額の${percentage}%（最低手数料は${amount}）です。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `お客様の資金はFDIC保険の対象となります。お客様の資金は、FDIC保険付き金融機関である${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}に保管されるか、同機関へ送金されます。` +
                `そこに移された資金は、特定の預金保険要件を満たし、カードが登録されている場合、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} が破綻した際に FDIC により ${amount} まで保護されます。詳しくは ${CONST.TERMS.FDIC_PREPAID} をご覧ください。`,
            contactExpensifyPayments: `${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} には、+1 833-400-0904 へのお電話、${CONST.EMAIL.CONCIERGE} へのメール、または ${CONST.NEW_EXPENSIFY_URL} へのサインインでお問い合わせください。`,
            generalInformation: `プリペイド口座に関する一般的な情報については、${CONST.TERMS.CFPB_PREPAID} をご覧ください。プリペイド口座に関する苦情がある場合は、消費者金融保護局（Consumer Financial Protection Bureau）に 1-855-411-2372 までお電話いただくか、${CONST.TERMS.CFPB_COMPLAINT} にアクセスしてください。`,
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動化',
            liveAgent: 'ライブ担当者',
            instant: '即時',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最小 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効化されました！',
        activatedMessage: 'おめでとうございます。ウォレットの設定が完了し、支払いの準備が整いました。',
        checkBackLaterTitle: '少々お待ちください…',
        checkBackLaterMessage: 'お客様の情報を引き続き確認しています。後ほどもう一度ご確認ください。',
        continueToPayment: '支払いに進む',
        continueToTransfer: '振込を続ける',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'ほとんど完了しました！セキュリティ保護のため、いくつかの情報を確認する必要があります。',
        legalBusinessName: '正式な事業名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        companyType: '会社種別',
        incorporationDate: '設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: 'この会社が次のリストに含まれていないことを確認します',
        listOfRestrictedBusinesses: '制限対象ビジネスの一覧',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        industryClassification: 'この事業はどの業種に分類されますか？',
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
        legalLastName: '姓（戸籍上のもの）',
        legalName: '法的氏名',
        enterYourDateOfBirth: '生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁を入力してください。',
        dontWorry: 'ご安心ください、個人信用情報の審査は一切行いません！',
        last4SSN: 'SSN の下4桁',
        enterYourAddress: 'あなたの住所は何ですか？',
        address: '住所',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は次の内容を読み、理解し、同意したものとみなされます',
        whatsYourLegalName: '法的な氏名は何ですか？',
        whatsYourDOB: '生年月日を教えてください。',
        whatsYourAddress: '住所はどちらですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁を入力してください。',
        noPersonalChecks: 'ご安心ください。ここでは個人の信用調査は一切行いません！',
        whatsYourPhoneNumber: '電話番号を教えてください。',
        weNeedThisToVerify: 'ウォレットを確認するために必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: '会社名は何ですか？',
        businessName: '法人名',
        enterYourCompanyTaxIdNumber: '御社の納税者番号（Tax ID）は何番ですか？',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        enterYourCompanyWebsite: '御社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: '御社の住所は何ですか？',
        selectYourCompanyType: 'どのような種類の会社ですか？',
        companyType: '会社種別',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '会社の設立日はいつですか？',
        incorporationDate: '設立日',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '御社はどの州で法人登記されましたか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        companyAddress: '会社住所',
        listOfRestrictedBusinesses: '制限対象ビジネスの一覧',
        confirmCompanyIsNot: 'この会社が次のリストに含まれていないことを確認します',
        businessInfoTitle: 'ビジネス情報',
        legalBusinessName: '正式な事業名',
        whatsTheBusinessName: '会社名は何ですか？',
        whatsTheBusinessAddress: '会社の住所は何ですか？',
        whatsTheBusinessContactInformation: '取引先の連絡先情報は何ですか？',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '会社登録番号（CRN）とは何ですか？';
                default:
                    return '法人番号（会社登録番号）は何ですか？';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '雇用主識別番号（EIN）とは何ですか？';
                case CONST.COUNTRY.CA:
                    return 'ビジネスナンバー（BN）とは何ですか？';
                case CONST.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST.COUNTRY.AU:
                    return 'オーストラリア事業番号（ABN）とは何ですか？';
                default:
                    return 'EU VAT番号とは何ですか？';
            }
        },
        whatsThisNumber: 'この番号は何ですか？',
        whereWasTheBusinessIncorporated: 'その会社はどこで法人設立されましたか？',
        whatTypeOfBusinessIsIt: 'どのような種類のビジネスですか？',
        whatsTheBusinessAnnualPayment: 'そのビジネスの年間支払取引額はいくらですか？',
        whatsYourExpectedAverageReimbursements: '想定される平均の払い戻し金額はいくらですか？',
        registrationNumber: '登録番号',
        taxIDEIN: (country: string) => {
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
                    return 'EU付加価値税';
            }
        },
        businessAddress: '会社住所',
        businessType: '事業形態',
        incorporation: '法人設立',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人形態',
        businessCategory: '業種',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `年間支払額（${currencyCode}）`,
        averageReimbursementAmount: '平均精算額',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `${currencyCode}での平均精算額`,
        selectIncorporationType: '法人形態を選択',
        selectBusinessCategory: '事業カテゴリを選択',
        selectAnnualPaymentVolume: '年間支払額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均精算額を選択',
        selectBusinessType: 'ビジネスタイプを選択',
        findIncorporationType: '法人種別を検索',
        findBusinessCategory: 'ビジネスカテゴリを検索',
        findAnnualPaymentVolume: '年間支払額を検索',
        findIncorporationState: '設立州を検索',
        findAverageReimbursement: '平均精算額を確認',
        findBusinessType: '事業形態を検索',
        error: {
            registrationNumber: '有効な登録番号を入力してください',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効な雇用者識別番号（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な事業者番号（BN）を入力してください';
                    case CONST.COUNTRY.GB:
                        return '有効なVAT登録番号（VRN）を入力してください';
                    case CONST.COUNTRY.AU:
                        return '有効なオーストラリア事業番号（ABN）を入力してください';
                    default:
                        return '有効な EU VAT 番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `${companyName}の25％以上を所有していますか？`,
        doAnyIndividualOwn25percent: (companyName: string) => `${companyName} の25％以上を所有する個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `${companyName}の持分を25％以上保有している個人は、ほかにもいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '規制により、事業の持分を25％超保有するすべての個人の本人確認を行う必要があります。',
        companyOwner: 'ビジネスオーナー',
        enterLegalFirstAndLastName: 'オーナーの法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '姓（戸籍上のもの）',
        enterTheDateOfBirthOfTheOwner: 'オーナーの生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁は何ですか？',
        last4SSN: 'SSN の下4桁',
        dontWorry: 'ご安心ください、個人信用情報の審査は一切行いません！',
        enterTheOwnersAddress: '所有者の住所はどこですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は次の内容を読み、理解し、同意したものとみなされます',
        owners: 'オーナー',
    },
    ownershipInfoStep: {
        ownerInfo: '所有者情報',
        businessOwner: 'ビジネスオーナー',
        signerInfo: '署名者情報',
        doYouOwn: (companyName: string) => `${companyName}の25％以上を所有していますか？`,
        doesAnyoneOwn: (companyName: string) => `${companyName} の25％以上を所有する個人はいますか？`,
        regulationsRequire: '規制により、事業の持分を25％超所有しているすべての個人の本人確認を行うことが求められています。',
        legalFirstName: '法的な名',
        legalLastName: '姓（戸籍上のもの）',
        whatsTheOwnersName: 'オーナーの法的氏名は何ですか？',
        whatsYourName: '法的氏名は何ですか？',
        whatPercentage: 'ビジネスのうち、オーナーの持分は何パーセントですか？',
        whatsYoursPercentage: 'あなたは事業の何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: 'オーナーの生年月日はいつですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsTheOwnersAddress: '所有者の住所はどこですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatAreTheLast: '口座名義人の社会保障番号の下4桁を入力してください。',
        whatsYourLast: 'あなたの社会保障番号の下4桁は何ですか？',
        whatsYourNationality: 'あなたの市民権を持つ国はどこですか？',
        whatsTheOwnersNationality: '所有者の国籍はどの国ですか？',
        countryOfCitizenship: '市民権のある国',
        dontWorry: 'ご安心ください、個人信用情報の審査は一切行いません！',
        last4: 'SSN の下4桁',
        whyDoWeAsk: 'なぜこの情報が必要なのですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '持分比率',
        areThereOther: (companyName: string) => `${companyName} の25％以上を所有している他の個人はいますか？`,
        owners: 'オーナー',
        addCertified: '実質的支配者を示す認証済みの組織図を追加',
        regulationRequiresChart: '規制により、事業の25％以上を所有しているすべての個人または法人が分かる所有構成図の認証済みコピーを取得することが求められています。',
        uploadEntity: '法人所有構成図をアップロード',
        noteEntity: '注：事業体の所有構成図には、会計士または法律顧問の署名、もしくは公証が必要です。',
        certified: '認定済み事業体所有構成図',
        selectCountry: '国を選択',
        findCountry: '国を検索',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加書類をアップロード',
        pleaseUpload: 'ビジネス事業体の直接または間接の25％以上の所有者であることを確認するため、以下に追加の書類をアップロードしてください。',
        acceptedFiles: '使用可能なファイル形式：PDF、PNG、JPEG。各セクションの合計ファイルサイズは 5 MB を超えることはできません。',
        proofOfBeneficialOwner: '実質的支配者の証明',
        proofOfBeneficialOwnerDescription:
            '公認会計士、公証人、または弁護士が署名した宣誓供述書と組織図を提出してください。これらの書類には、事業の25％以上の所有権を証明する内容が含まれている必要があります。書類の日付は直近3か月以内のものでなければならず、署名者の免許番号も明記してください。',
        copyOfID: '受益所有者の身分証明書のコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など',
        proofOfAddress: '実質的支配者の住所証明',
        proofOfAddressDescription: '例：公共料金の請求書、賃貸借契約書など',
        codiceFiscale: '税コード／納税者番号',
        codiceFiscaleDescription:
            '署名権限者との現地訪問時の動画、または録音済み通話の動画をアップロードしてください。動画内で署名権限者が以下の情報を提供する必要があります：氏名、生年月日、会社名、登録番号、税番号、登録住所、事業内容、および口座の目的。',
    },
    completeVerificationStep: {
        completeVerification: '認証を完了',
        confirmAgreements: '以下の契約内容を確認してください。',
        certifyTrueAndAccurate: '提供された情報が真実かつ正確であることを証明します',
        certifyTrueAndAccurateError: 'この情報が真実かつ正確であることを証明してください',
        isAuthorizedToUseBankAccount: '私は、このビジネス銀行口座をビジネス支出のために使用する権限があります',
        isAuthorizedToUseBankAccountError: 'あなたは、事業用銀行口座を操作する権限を持つ管理責任者である必要があります',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を認証する',
        validateButtonText: '検証',
        validationInputLabel: '取引',
        maxAttemptsReached: '誤った試行が多すぎたため、この銀行口座の認証は無効化されています。',
        description: `1～2営業日以内に、「Expensify, Inc. Validation」といった名義から、ご利用の銀行口座に3件の少額取引を送金します。`,
        descriptionCTA: '各取引の金額を下のフィールドに入力してください。例：1.51。',
        letsChatText: 'あと少しです！チャットでいくつか最後の情報を確認するお手伝いをお願いします。準備はいいですか？',
        enable2FATitle: '不正防止のため、二要素認証（2FA）を有効にする',
        enable2FAText: 'お客様のセキュリティを重要視しています。アカウントをさらに強固に保護するため、今すぐ2FAを設定してください。',
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
        whatAreYour: 'あなたのビジネス用銀行口座の詳細を教えてください。',
        letsDoubleCheck: 'すべて問題なさそうか、もう一度確認しましょう。',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        accountHolderNameDescription: '署名権限者の氏名（フルネーム）',
    },
    signerInfoStep: {
        signerInfo: '署名者情報',
        areYouDirector: (companyName: string) => `${companyName} の取締役ですか？`,
        regulationRequiresUs: '規制により、署名者がこの事業体を代表してこの操作を行う権限を有しているか確認する必要があります。',
        whatsYourName: '法的氏名は何ですか',
        fullName: '法的な氏名',
        whatsYourJobTitle: 'あなたの職種（役職）は何ですか？',
        jobTitle: '職種タイトル',
        whatsYourDOB: '生年月日はいつですか？',
        uploadID: '身分証明書と住所証明書をアップロード',
        personalAddress: '現住所証明（公共料金の請求書など）',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '現住所証明',
        enterOneEmail: (companyName: string) => `${companyName} の取締役のメールアドレスを入力してください`,
        regulationRequiresOneMoreDirector: '規定により、署名者として少なくとももう1名の取締役が必要です。',
        hangTight: '少々お待ちください…',
        enterTwoEmails: (companyName: string) => `${companyName}の取締役2名のメールアドレスを入力してください`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: '他の取締役が本人確認を完了するのを待っています。',
        id: '身分証明書のコピー',
        proofOfDirectors: '取締役の証明',
        proofOfDirectorsDescription: '例：Oncorp 社団法人プロファイルまたは商業登記',
        codiceFiscale: '納税者番号',
        codiceFiscaleDescription: '署名者、権限のあるユーザー、および実質的支配者のための納税者番号（Codice Fiscale）。',
        PDSandFSG: 'PDS + FSG 開示書類',
        PDSandFSGDescription: dedent(`
            Expensify では、Corpay との提携により API 連携を利用し、Corpay の幅広い国際銀行ネットワークを活用してグローバル払い戻し機能を提供しています。オーストラリアの規制に従い、Corpay の金融サービスガイド（FSG）および金融商品開示文書（PDS）をお渡しします。

            FSG と PDS には、Corpay が提供する商品およびサービスの詳細と重要な情報が記載されていますので、注意してお読みください。今後の参照のため、これらの文書を保管しておいてください。
        `),
        pleaseUpload: 'ビジネスの取締役としてのお客さまの身元を確認するため、以下に追加の書類をアップロードしてください。',
        enterSignerInfo: '署名者情報を入力',
        thisStep: 'このステップは完了しました',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `は、従業員への${currency}での支払いのため、末尾が${bankAccountLastFour}の${currency}建てビジネス銀行口座をExpensifyに接続しています。次のステップでは、取締役の署名権者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスは別のものにしてください',
        },
    },
    agreementsStep: {
        agreements: '契約書',
        pleaseConfirm: '以下の契約内容を確認してください',
        regulationRequiresUs: '規制により、事業の持分を25％超保有するすべての個人の本人確認を行う必要があります。',
        iAmAuthorized: '私は、事業支出のためにこのビジネス銀行口座を利用する権限があります。',
        iCertify: '提供された情報が真実かつ正確であることを証明します。',
        iAcceptTheTermsAndConditions: `私は<a href="https://cross-border.corpay.com/tc/">利用規約および条件</a>に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約に同意します。',
        accept: '承認して銀行口座を追加',
        iConsentToThePrivacyNotice: '<a href="https://payments.corpay.com/compliance">プライバシー通知</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシーに関する通知に同意します。',
        error: {
            authorized: 'あなたは、事業用銀行口座を操作する権限を持つ管理責任者である必要があります',
            certify: 'この情報が真実かつ正確であることを証明してください',
            consent: 'プライバシーに関するお知らせに同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusign フォーム',
        pleaseComplete:
            '以下のDocuSignリンクからACH認証フォームにご記入のうえ署名し、その署名済みコピーをこちらにアップロードしてください。お客様の銀行口座から直接引き落としできるようになります。',
        pleaseCompleteTheBusinessAccount: 'ビジネス口座申込の口座振替（自動引き落とし）手続きを完了してください',
        pleaseCompleteTheDirect:
            '下記のDocusignリンクから口座振替の手続きを完了し、署名済みの書類をこちらにアップロードしてください。これにより、お客様の銀行口座から直接資金を引き落とせるようになります。',
        takeMeTo: 'DocuSign に移動',
        uploadAdditional: '追加書類をアップロード',
        pleaseUpload: 'DEFTフォームとDocuSignの署名ページをアップロードしてください',
        pleaseUploadTheDirect: '口座振替取決め書とDocuSignの署名ページをアップロードしてください',
    },
    finishStep: {
        letsFinish: 'チャットで完了しましょう！',
        thanksFor:
            '詳細をお知らせいただきありがとうございます。担当のサポート担当者が内容を確認します。追加で必要な情報がある場合はこちらからご連絡しますが、その前でもご不明な点があればいつでもお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '不正防止のために二要素認証（2FA）を有効にする',
        weTake: 'お客様のセキュリティを重要視しています。アカウントをさらに強固に保護するため、今すぐ2FAを設定してください。',
        secure: 'アカウントを保護する',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '少々お待ちください',
        explanationLine: 'お客様の情報を確認しています。まもなく次の手続きに進めるようになります。',
    },
    session: {
        offlineMessageRetry: 'オフラインのようです。接続状況を確認して、もう一度お試しください。',
    },
    travel: {
        header: '出張を予約',
        title: 'スマートに旅しよう',
        subtitle: 'Expensify Travel を使って、最適な旅行プランを手に入れ、すべてのビジネス経費を一元管理しましょう。',
        features: {
            saveMoney: '予約で節約する',
            alerts: '旅行プランの変更をリアルタイムで通知します',
        },
        bookTravel: '出張を予約',
        bookDemo: 'デモを予約',
        bookADemo: 'デモを予約',
        toLearnMore: '詳しくはこちら。',
        termsAndConditions: {
            header: '続ける前に…',
            title: '利用規約',
            label: '利用規約に同意します',
            subtitle: `Expensify Travel の<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります',
            defaultWorkspaceError:
                'Expensify Travel を有効にするには、デフォルトのワークスペースを設定する必要があります。[設定] > [ワークスペース] に進み、ワークスペース名の横にある縦三点リーダーをクリックして [デフォルトのワークスペースに設定] を選択し、もう一度お試しください。',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '搭乗者',
            layover: (layover: string) => `<muted-text-label>このフライトの前に<strong>${layover} の乗り継ぎ時間</strong>があります</muted-text-label>`,
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
            cancellationUntil: '無料キャンセル期限：',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '返金不可',
                freeCancellationUntil: '無料キャンセル期限：',
                partiallyRefundable: '一部返金可',
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
            cancellationUntil: '無料キャンセル期限：',
            freeCancellation: '無料キャンセル',
            confirmation: '確認番号',
        },
        train: 'レール',
        trainDetails: {
            passenger: '搭乗者',
            departs: '出発時刻',
            arrives: '到着予定',
            coachNumber: 'コーチ番号',
            seat: '席',
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
        departs: '出発時刻',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>出張を予約するには、<a href="${phoneErrorMethodsRoute}">勤務先のメールアドレスを主なログインとして追加</a>してください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travel のセットアップ用ドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: (domain: string) =>
                `ドメイン<strong>${domain}</strong>でExpensify Travelを有効にする権限がありません。代わりに、そのドメインのユーザーにトラベル機能を有効にしてもらう必要があります。`,
            accountantInvitation: `会計士の方は、このドメインで旅行機能を有効にするために、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士プログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travel を始めましょう',
            message: `Expensify Travel では、個人のメールアドレス（例: name@gmail.com）ではなく、勤務先のメールアドレス（例: name@company.com）を使用する必要があります。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel は無効になっています',
            message: `管理者によってExpensify Travelがオフにされています。出張の手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: 'リクエストを確認しています…',
            message: `Expensify Travel をご利用いただく準備が整っているか確認するため、こちらでいくつかチェックを行っています。まもなくご連絡します！`,
            confirmText: '了解しました',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン ${domain} のトラベル有効化に失敗しました。このドメインのトラベル設定を確認して有効にしてください。`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）の予約が完了しました。確認コード：${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）の航空券は無効になりました。`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}発のフライト ${airlineCode}（${origin} → ${destination}）のチケットは、払い戻しまたは交換されました。`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `ご利用予定のフライト ${airlineCode}（${origin} → ${destination}、${startDate}}）は航空会社により欠航となりました。`,
            flightScheduleChangePending: (airlineCode: string) => `航空会社が便名${airlineCode}のスケジュール変更を提案しました。現在、確認待ちです。`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `スケジュール変更が確定しました：フライト${airlineCode}は${startDate}に出発します。`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) => `${startDate}の${airlineCode}便（${origin} → ${destination}）が更新されました。`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `フライト${airlineCode}の客室クラスが${cabinClass}に更新されました。`,
            flightSeatConfirmed: (airlineCode: string) => `${airlineCode}便の座席指定が確定しました。`,
            flightSeatChanged: (airlineCode: string) => `${airlineCode}便の座席指定が変更されました。`,
            flightSeatCancelled: (airlineCode: string) => `フライト ${airlineCode} の座席指定が削除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `${type}の予約（${id}）をキャンセルしました。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `業者があなたの${type}予約（${id}）をキャンセルしました。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `${type}の予約が再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `${type}の予約が更新されました。旅程で新しい詳細を確認してください。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `${origin} 発 → ${destination} 行き、${startDate} の鉄道チケットは払い戻しされました。クレジットが処理されます。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行き鉄道チケットは交換されました。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行きの鉄道チケットが更新されました。`,
            defaultUpdate: ({type}: TravelTypeParams) => `${type}の予約が更新されました。`,
        },
        flightTo: 'フライト（行き先）',
        trainTo: '電車で行く',
        carRental: 'レンタカー',
        nightIn: '宿泊',
        nightsIn: '宿泊（滞在先）',
    },
    workspace: {
        common: {
            card: 'カード',
            expensifyCard: 'Expensify カード',
            companyCards: '会社カード',
            workflows: 'ワークフロー',
            workspace: 'ワークスペース',
            findWorkspace: 'ワークスペースを検索',
            edit: 'ワークスペースを編集',
            enabled: '有効',
            disabled: '無効',
            everyone: '全員',
            delete: 'ワークスペースを削除',
            settings: '設定',
            reimburse: '償還',
            categories: 'カテゴリ',
            tags: 'タグ',
            customField1: 'カスタムフィールド 1',
            customField2: 'カスタムフィールド 2',
            customFieldHint: 'このメンバーのすべての支出に適用されるカスタムコードを追加します。',
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
            displayedAs: '表示名',
            plan: 'プラン',
            profile: '概要',
            bankAccount: '銀行口座',
            testTransactions: 'テスト取引',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードを照合',
            selectAll: 'すべて選択',
            selected: () => ({
                one: '1 件選択済み',
                other: (count: number) => `${count} 件選択中`,
            }),
            settlementFrequency: '清算頻度',
            setAsDefault: 'デフォルトのワークスペースに設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信された領収書はこのワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？すべてのカードフィードと割り当てられているカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。ワークスペースに新しいメンバーを招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページへのアクセス権がありません。このワークスペースに参加しようとしている場合は、ワークスペースのオーナーにメンバーとして追加してもらってください。別のご用件ですか？${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
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
            defaultDescription: 'すべての領収書と経費をひとまとめに。',
            descriptionHint: 'このワークスペースに関する情報を、すべてのメンバーと共有します。',
            welcomeNote: '返金を受けるために、領収書の提出はExpensifyをご利用ください。ありがとうございます！',
            subscription: 'サブスクリプション',
            markAsEntered: '手入力としてマーク',
            markAsExported: 'エクスポート済みにする',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポート`,
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            lineItemLevel: '明細行レベル',
            reportLevel: 'レポートレベル',
            topLevel: 'トップレベル',
            appliedOnExport: 'Expensify にはインポートされず、エクスポート時に適用されます',
            shareNote: {
                header: 'ワークスペースを他のメンバーと共有する',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `このQRコードを共有するか、下のリンクをコピーして、メンバーがあなたのワークスペースへのアクセスをリクエストしやすいようにしましょう。ワークスペースへの参加リクエストはすべて、確認用に<a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>ルームに表示されます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続しているため、既存の接続を再利用するか、新しい接続を作成できます。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 最終同期日 ${formattedDate}`,
            authenticationError: (connectionName: string) => `認証エラーのため、${connectionName} に接続できません。`,
            learnMore: '詳しく見る',
            memberAlternateText: 'レポートを提出して承認します。',
            adminAlternateText: 'レポートとワークスペース設定を管理する。',
            auditorAlternateText: 'レポートを表示してコメントします。',
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
                trip: '出張別',
                weekly: '毎週',
                semimonthly: '月2回',
                monthly: '毎月',
            },
            planType: 'プランの種類',
            youCantDowngradeInvoicing:
                '請求書払いのサブスクリプションでは、プランをダウングレードすることはできません。サブスクリプションのご相談や変更をご希望の場合は、アカウントマネージャーまたはConciergeまでお問い合わせください。',
            defaultCategory: 'デフォルトカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} の経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card の取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">当社の連携機能</a>によって作成される「Expensify Card 負債勘定」に自動的にエクスポートされます。</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `${organizationName} に接続済み` : '組織全体の出張費とフードデリバリー経費を自動化しましょう。',
                sendInvites: '招待を送信',
                sendInvitesDescription: 'これらのワークスペースメンバーはまだ Uber for Business アカウントを持っていません。今回は招待しないメンバーがいれば選択を解除してください。',
                confirmInvite: '招待を確定',
                manageInvites: '招待を管理',
                confirm: '確認',
                allSet: '準備完了',
                readyToRoll: '準備完了です',
                takeBusinessRideMessage: 'ビジネスでUberに乗ると、領収書がExpensifyに自動取込されます。ひとっ走りしよう！',
                all: 'すべて',
                linked: 'リンク済み',
                outstanding: '未払い',
                status: {
                    resend: '再送信',
                    invite: '招待',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'リンク済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '一時停止中',
                },
                centralBillingAccount: '中央請求アカウント',
                centralBillingDescription: 'すべてのUberのレシートをどこに取り込むか選択してください。',
                invitationFailure: 'Uber for Business へのメンバー招待に失敗しました',
                autoInvite: 'Uber for Business に新しいワークスペースメンバーを招待',
                autoRemove: 'Uber for Business から削除されたワークスペースメンバーを無効化する',
                emptyContent: {
                    title: '未処理の招待はありません',
                    subtitle: 'やった！あちこち探しましたが、未処理の招待は見つかりませんでした。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>日当額を設定して、従業員の1日あたりの支出を管理しましょう。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳細はこちら</a>。</muted-text>`,
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
                subtitle: '日当額を設定して、従業員の1日あたりの支出を管理しましょう。スプレッドシートからレートをインポートして開始します。',
            },
            importPerDiemRates: '日当レートをインポート',
            editPerDiemRate: '日当率を編集',
            editPerDiemRates: '日当額を編集',
            editDestinationSubtitle: (destination: string) => `この行き先を更新すると、すべての ${destination} の日当サブレートに反映されます。`,
            editCurrencySubtitle: (destination: string) => `この通貨を更新すると、すべての${destination}の日当サブレートで変更が反映されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '自己負担経費を QuickBooks Desktop へどのようにエクスポートするかを設定します。',
            exportOutOfPocketExpensesCheckToggle: '小切手を「後で印刷」にマーク',
            exportDescription: 'Expensify のデータを QuickBooks Desktop へどのようにエクスポートするかを設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書を書き出し先',
            exportExpensifyCard: 'Expensify Card取引を次の形式でエクスポート',
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
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付き仕訳を作成し、以下の勘定科目に記帳します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop は仕訳のエクスポートで税をサポートしていません。ワークスペースで税が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は使用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の対応する仕入先と照合します。仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付で明細付きのベンダー請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する取引先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '小切手の送付元を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'ロケーションが有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '税金が有効になっている場合、仕訳は使用できません。別のエクスポートオプションを選択してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Desktop にアカウントを追加して、接続をもう一度同期してください',
            qbdSetup: 'QuickBooks Desktop のセットアップ',
            requiredSetupDevice: {
                title: 'このデバイスから接続できません',
                body1: 'QuickBooks Desktop の会社ファイルが保存されているコンピューターから、この接続を設定する必要があります。',
                body2: '一度接続すれば、どこからでも同期してエクスポートできるようになります。',
            },
            setupPage: {
                title: '接続するにはこのリンクを開いてください',
                body: 'セットアップを完了するには、QuickBooks Desktop を実行しているコンピューターで次のリンクを開いてください。',
                setupErrorTitle: '問題が発生しました',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>現在、QuickBooks Desktop との接続が機能していません。しばらくしてからもう一度お試しいただくか、問題が解決しない場合は<a href="${conciergeLink}">Concierge にお問い合わせください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks Desktop から Expensify にインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            items: '項目',
            customers: '顧客／プロジェクト',
            exportCompanyCardsDescription: '会社カードでの購入を QuickBooks Desktop へどのようにエクスポートするかを設定します。',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトの取引先を設定します。',
            accountsDescription: 'QuickBooks Desktop の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい口座を、有効または無効なカテゴリとして取り込むか選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Desktop のクラスをどのように扱うかを選択してください。',
            tagsDisplayedAsDescription: '明細行レベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'Expensify で QuickBooks Desktop の顧客／プロジェクトをどのように処理するかを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日 QuickBooks Desktop と自動的に同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、存在しない取引先を QuickBooks Desktop に自動で作成します。',
            },
            itemsDescription: 'Expensify で QuickBooks Desktop の品目をどのように処理するか選択してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をいつエクスポートするか選択してください：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払い時にエクスポートされます',
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
            accountsSwitchTitle: '新しい口座を、有効または無効なカテゴリとして取り込むか選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Online のクラスをどのように処理するかを選択してください。',
            customersDescription: 'Expensify で QuickBooks Online の顧客／プロジェクトをどのように処理するかを選択してください。',
            locationsDescription: 'Expensify で QuickBooks Online のロケーションをどのように処理するかを選択してください。',
            taxesDescription: 'QuickBooks Online の税金を Expensify でどのように処理するか選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online では、小切手または仕入先請求書の明細行レベルでロケーションをサポートしていません。明細行レベルでロケーションを使用したい場合は、仕訳伝票とクレジット／デビットカード経費を利用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online は仕訳への税金の適用をサポートしていません。エクスポートオプションをベンダー請求書または小切手に変更してください。',
            exportDescription: 'Expensify のデータを QuickBooks Online へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書を書き出し先',
            exportExpensifyCard: 'Expensify Card取引を次の形式でエクスポート',
            exportDate: {
                label: 'エクスポート日',
                description: 'QuickBooks Online にレポートをエクスポートするときは、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
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
            receivable: '売掛金',
            archive: '売掛金アーカイブ',
            exportInvoicesDescription: '請求書をQuickBooks Onlineにエクスポートするときは、この勘定科目を使用します。',
            exportCompanyCardsDescription: '会社カードでの購入を QuickBooks Online にどのようにエクスポートするかを設定します。',
            vendor: '仕入先',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトの取引先を設定します。',
            exportOutOfPocketExpensesDescription: '立替経費を QuickBooks Online へどのようにエクスポートするかを設定します。',
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付き仕訳を作成し、以下の勘定科目に記帳します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
            account: 'アカウント',
            accountDescription: '仕訳の記帳先を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付元を選択してください。',
            creditCardAccount: 'クレジットカード口座',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online は仕入先請求書のエクスポートでロケーションをサポートしていません。ワークスペースでロケーションを有効にしているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online では仕訳エクスポートで税をサポートしていません。ワークスペースで税が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は使用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に QuickBooks Online と同期します。',
                inviteEmployees: '従業員を招待',
                inviteEmployeesDescription: 'QuickBooks Online の従業員レコードをインポートし、従業員をこのワークスペースに招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Online にまだ存在しない取引先を自動的に作成し、請求書をエクスポートする際に顧客も自動作成します。',
                reimbursedReportsDescription: 'Expensify ACH でレポートが支払われるたびに、対応する支払伝票が下記の QuickBooks Online アカウントに作成されます。',
                qboBillPaymentAccount: 'QuickBooksの請求支払い口座',
                qboInvoiceCollectionAccount: 'QuickBooks 請求書回収勘定',
                accountSelectDescription: '請求書の支払元を選択すると、QuickBooks Online に支払取引を作成します。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、QuickBooks Online にその支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'デビットカード取引の加盟店名を、QuickBooks 内の対応する仕入先に自動的に照合します。仕入先が存在しない場合は、関連付け用に「Debit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の対応する仕入先と照合します。仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付で明細付きのベンダー請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する取引先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'ロケーションが有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合、仕訳は使用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書のエクスポート用に有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポート用に有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手のエクスポートに有効な口座を選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書エクスポートを使用するには、QuickBooks Online で買掛金勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Online で仕訳勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手エクスポートを使用するには、QuickBooks Online で銀行口座を設定してください',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Online に口座を追加して、接続をもう一度同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をいつエクスポートするか選択してください：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払い時にエクスポートされます',
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
            importDescription: 'Xero から Expensify にインポートするコード設定を選択してください。',
            accountsDescription: 'Xeroの勘定科目表は、Expensifyにカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい口座を、有効または無効なカテゴリとして取り込むか選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリ',
            trackingCategoriesDescription: 'Expensify で Xero のトラッキングカテゴリをどのように扱うかを選択してください。',
            mapTrackingCategoryTo: (categoryName: string) => `Xero の ${categoryName} をマップ先:`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Xero へエクスポートする際に、${categoryName} をどこにマッピングするか選択してください。`,
            customers: '顧客に再請求',
            customersDescription: 'Expensify で顧客への再請求を行うかどうかを選択します。Xero の顧客連絡先を経費にタグ付けでき、Xero へは売上請求書としてエクスポートされます。',
            taxesDescription: 'Expensify での Xero の税金の扱い方法を選択してください。',
            notImported: 'インポートされていません',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポートフィールド',
            },
            exportDescription: 'Expensify のデータを Xero へエクスポートする方法を設定する。',
            purchaseBill: '仕入請求書',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、以下の Xero 銀行口座に銀行取引として記帳され、取引日付は銀行取引明細書上の日付と一致します。',
            bankTransactions: '銀行取引',
            xeroBankAccount: 'Xero 銀行口座',
            xeroBankAccountDescription: '経費が銀行取引として記帳される勘定科目を選択してください。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで仕入請求書としてエクスポートされます。',
            purchaseBillDate: '仕入請求書の日付',
            exportInvoices: '請求書を次の形式でエクスポート',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '売上請求書には、請求書を送信した日付が常に表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に Xero と同期します。',
                purchaseBillStatusTitle: '仕入請求書のステータス',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が下記の Xero アカウントに作成されます。',
                xeroBillPaymentAccount: 'Xero請求支払口座',
                xeroInvoiceCollectionAccount: 'Xero請求書回収勘定',
                xeroBillPaymentAccountDescription: '請求書の支払元を選択すると、Xero 内に支払いが作成されます。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、Xero 内に支払いを作成します。',
            },
            exportDate: {
                label: '仕入請求書の日付',
                description: 'レポートをXeroにエクスポートするときは、この日付を使用します。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の経費の日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'Xero へレポートをエクスポートした日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            invoiceStatus: {
                label: '仕入請求書のステータス',
                description: '購入請求書をXeroにエクスポートするときにこのステータスを使用します。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xero に口座を追加して、もう一度接続を同期してください',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をいつエクスポートするか選択してください：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払い時にエクスポートされます',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを Sage Intacct にエクスポートする際は、この日付を使用します。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
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
            defaultVendor: 'デフォルトの仕入先',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Sage Intacct でベンダーが一致しない ${isReimbursable ? '' : '非'}精算対象経費に適用するデフォルトのベンダーを設定します。`,
            exportDescription: 'Expensify のデータを Sage Intacct へエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先されるエクスポート担当者は任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート用口座を設定している場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターのアカウントにエクスポート対象のレポートが表示されます。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacct に口座を追加して、もう一度接続を同期してください`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensify は毎日自動的に Sage Intacct と同期します。',
            inviteEmployees: '従業員を招待',
            inviteEmployeesDescription:
                'Sage Intacct の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認となり、メンバー ページでさらに設定できます。',
            syncReimbursedReports: '精算済みレポートを同期',
            syncReimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が以下の Sage Intacct アカウントに作成されます。',
            paymentAccount: 'Sage Intacct 支払口座',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をいつエクスポートするか選択してください：',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払い時にエクスポートされます',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'NetSuite からデータをインポートしたい子会社を選択してください。',
            exportDescription: 'Expensify のデータを NetSuite へどのようにエクスポートするかを設定します。',
            exportInvoices: '請求書を書き出し先',
            journalEntriesTaxPostingAccount: '仕訳の税金計上勘定',
            journalEntriesProvTaxPostingAccount: '仕訳入力 州税計上勘定',
            foreignCurrencyAmount: '外貨金額をエクスポート',
            exportToNextOpenPeriod: '次の未締め期間にエクスポート',
            nonReimbursableJournalPostingAccount: '非精算仕訳計上勘定',
            reimbursableJournalPostingAccount: '立替精算用仕訳計上勘定',
            journalPostingPreference: {
                label: '仕訳記帳の設定優先度',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各レポートにつき 1 件の個別明細エントリ',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各経費につき 1 件の仕訳',
                },
            },
            invoiceItem: {
                label: '請求書アイテム',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '1つ作成してください',
                        description: 'エクスポート時に（まだ存在しない場合は）「Expensify 請求書明細項目」を作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: 'Expensify からの請求書を、以下で選択された項目に紐付けます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートをNetSuiteにエクスポートするときは、この日付を使用します。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
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
                            立替経費は、下記で指定した NetSuite 取引先に支払うべき請求書としてエクスポートされます。

                            各カードごとに特定の取引先を設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、以下で指定された NetSuite ベンダーへの支払請求としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳伝票',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定した NetSuite 勘定科目へ仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、以下で指定した NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に進んでください。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに切り替えると、個別カード用のNetSuiteベンダーおよび記帳勘定は無効になります。\n\nご安心ください。あとで元の設定に戻したくなった場合に備えて、これまでの選択内容は引き続き保存されます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に NetSuite と同期します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が以下の NetSuite アカウント内に作成されます。',
                reimbursementsAccount: '精算用口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、対応する支払いを NetSuite 内に作成します。',
                collectionsAccount: '回収勘定',
                collectionsAccountDescription: 'Expensifyで請求書が支払済みとしてマークされ、NetSuiteにエクスポートされると、以下の勘定科目に反映されます。',
                approvalAccount: '買掛金承認勘定',
                approvalAccountDescription: 'NetSuiteで取引の承認先となる勘定科目を選択してください。精算済みレポートを同期する場合は、請求書支払が計上される勘定科目にもなります。',
                defaultApprovalAccount: 'NetSuite のデフォルト',
                inviteEmployees: '従業員を招待して承認を設定',
                inviteEmployeesDescription:
                    'NetSuite の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認となり、*メンバー* ページでさらに設定できます。',
                autoCreateEntities: '従業員／取引先を自動作成',
                enableCategories: '新しくインポートしたカテゴリーを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定されている優先トランザクションフォームを使用して仕訳を作成します。別途、使用する特定のトランザクションフォームを指定することもできます。',
                customFormIDReimbursable: '立替経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費精算書の承認レベル',
                    description: '経費レポートがExpensifyで承認されてNetSuiteにエクスポートされた後、仕訳を記帳する前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '上長承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '経理のみ承認済み',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '上長と経理が承認済み',
                    },
                },
                accountingMethods: {
                    label: 'エクスポートのタイミング',
                    description: '経費をいつエクスポートするか選択してください：',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '自己負担経費は最終承認時にエクスポートされます',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払い時にエクスポートされます',
                    },
                },
                exportVendorBillsTo: {
                    label: 'ベンダー請求書の承認レベル',
                    description: 'ベンダー請求書がExpensifyで承認されNetSuiteへエクスポートされると、仕訳を記帳する前に、NetSuite側で追加の承認段階を設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '記帳承認済み',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensifyで仕訳が承認されてNetSuiteにエクスポートされた後、仕訳を記帳する前に、NetSuite側でさらに追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '記帳承認済み',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォームIDを入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuite にアカウントを追加して、接続を再同期してください',
            noVendorsFound: 'ベンダーが見つかりません',
            noVendorsFoundDescription: 'NetSuite にベンダーを追加して、接続をもう一度同期してください',
            noItemsFound: '請求書アイテムが見つかりません',
            noItemsFoundDescription: 'NetSuiteで請求書アイテムを追加して、もう一度同期してください',
            noSubsidiariesFound: '子会社が見つかりません',
            noSubsidiariesFoundDescription: 'NetSuite に子会社を追加して、もう一度同期してください',
            tokenInput: {
                title: 'NetSuite の設定',
                formSteps: {
                    installBundle: {
                        title: 'Expensifyバンドルをインストール',
                        description: 'NetSuite で、*Customization > SuiteBundler > Search & Install Bundles* に進み、「Expensify」を検索してバンドルをインストールします。',
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
                            'NetSuite で、*Setup > Users/Roles > Access Tokens* に進み、「Expensify」アプリと「Expensify Integration」ロールまたは「Administrator」ロールのいずれかに対するアクセス・トークンを作成します。\n\n*重要:* この手順で表示される *Token ID* と *Token Secret* を必ず保存してください。次の手順で必要になります。',
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
                expenseCategoriesDescription: 'NetSuiteの経費カテゴリは、Expensifyにカテゴリとしてインポートされます。',
                crossSubsidiaryCustomers: '子会社間共通の顧客／プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'Expensify で NetSuite の *部門* をどのように扱うか選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensify で *クラス* をどのように扱うか選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensify で「所在地」をどのように扱うかを選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客／プロジェクト',
                    subtitle: 'Expensify で NetSuite の *顧客* と *プロジェクト* をどのように処理するか選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: (importFields: string[], importType: string) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite から税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下からオプションを選択してください:',
                    label: (importedTypes: string[]) => `${importedTypes.join('と')} としてインポート済み`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `${fieldName}を入力してください`,
                    customSegments: {
                        title: 'カスタムセグメント／レコード',
                        addText: 'カスタムセグメント／レコードを追加',
                        recordTitle: 'カスタムセグメント／レコード',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '詳しい手順を表示',
                        helpText: 'カスタムセグメント／レコードの設定について。',
                        emptyTitle: 'カスタムセグメントまたはカスタムレコードを追加',
                        fields: {
                            segmentName: '名前',
                            internalID: '内部 ID',
                            scriptID: 'スクリプト ID',
                            customRecordScriptID: '取引列ID',
                            mapping: '表示名',
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
                            customSegmentNameFooter: `NetSuite では、*Customizations > Links, Records & Fields > Custom Segments* ページでカスタムセグメント名を確認できます。

_さらに詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customRecordNameFooter: `グローバル検索で「Transaction Column Field」と入力すると、NetSuite 内でカスタムレコード名を見つけることができます。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentInternalIDTitle: '内部IDは何ですか？',
                            customSegmentInternalIDFooter: `まず、NetSuite で内部 ID が有効になっていることを確認してください（*Home > Set Preferences > Show Internal ID*）。

カスタムセグメントの内部 ID は、NetSuite の次の場所で確認できます。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックします。
3. *Custom Record Type* の横にあるハイパーリンクをクリックします。
4. 画面下部のテーブルで内部 ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordInternalIDFooter: `次の手順で、NetSuite でカスタムレコードの内部 ID を確認できます。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されている内部 ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentScriptIDTitle: 'スクリプト ID は何ですか？',
                            customSegmentScriptIDFooter: `NetSuite でカスタムセグメントのスクリプト ID を確認するには、次の手順に従ってください。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックします。
3. 画面下部付近の *Application and Sourcing* タブをクリックし、次のいずれかを行います。
    a. カスタムセグメントを Expensify 上で（明細行レベルの）*タグ*として表示したい場合は、*Transaction Columns* サブタブをクリックし、*Field ID* を使用します。
    b. カスタムセグメントを Expensify 上で（レポートレベルの）*レポートフィールド*として表示したい場合は、*Transactions* サブタブをクリックし、*Field ID* を使用します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordScriptIDTitle: '取引列IDは何ですか？',
                            customRecordScriptIDFooter: `NetSuite でカスタムレコードのスクリプト ID を確認するには、次の手順に従います。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側でスクリプト ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentMappingTitle: 'このカスタムセグメントをExpensifyではどのように表示しますか？',
                            customRecordMappingTitle: 'このカスタムレコードを Expensify でどのように表示しますか？',
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
                        helpLinkText: '詳しい手順を表示',
                        helpText: 'カスタムリストの設定方法について。',
                        emptyTitle: 'カスタムリストを追加',
                        fields: {
                            listName: '名前',
                            internalID: '内部 ID',
                            transactionFieldID: '取引フィールドID',
                            mapping: '表示名',
                        },
                        removeTitle: 'カスタムリストを削除',
                        removePrompt: 'このカスタムリストを削除してもよろしいですか？',
                        addForm: {
                            listNameTitle: 'カスタムリストを選択',
                            transactionFieldIDTitle: '取引フィールドIDは何ですか？',
                            transactionFieldIDFooter: `次の手順で、NetSuite で取引フィールド ID を確認できます。

1. グローバル検索に「Transaction Line Fields」と入力します。
2. カスタムリストをクリックして開きます。
3. 左側に表示される取引フィールド ID を確認します。

_より詳しい手順は、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            mappingTitle: 'このカスタムリストは、Expensify でどのように表示しますか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールドIDを使用するカスタムリストはすでに存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 従業員のデフォルト',
                        description: 'Expensify にはインポートされず、エクスポート時に適用されます',
                        footerContent: (importField: string) =>
                            `NetSuiteで${importField}を使用している場合、Expense ReportまたはJournal Entryにエクスポートするときに、従業員レコードに設定されているデフォルトを適用します。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: '明細行レベル',
                        footerContent: (importField: string) => `${startCase(importField)} は、従業員の各経費レポート内の個々の経費ごとに選択できるようになります。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'レポートフィールド',
                        description: 'レポートレベル',
                        footerContent: (importField: string) => `${startCase(importField)} の選択は、従業員のレポート上のすべての経費に適用されます。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct のセットアップ',
            prerequisitesTitle: '接続する前に…',
            downloadExpensifyPackage: 'Sage Intacct 用の Expensify パッケージをダウンロード',
            followSteps: '「操作手順：Sage Intacct に接続する」を参照して、手順に従ってください',
            enterCredentials: 'Sage Intacct の認証情報を入力してください',
            entity: 'エンティティ',
            employeeDefault: 'Sage Intacct 従業員デフォルト',
            employeeDefaultDescription: '従業員にデフォルトの部門が設定されている場合、その部門が Sage Intacct の経費に適用されます。',
            displayedAsTagDescription: '従業員のレポート内の各経費ごとに部署を選択できるようになります。',
            displayedAsReportFieldDescription: '部門の選択は、従業員のレポート内のすべての経費に適用されます。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Expensify で Sage Intacct の <strong>${mappingTitle}</strong> をどのように処理するかを選択してください。`,
            expenseTypes: '経費タイプ',
            expenseTypesDescription: 'Sage Intacct の経費タイプは、Expensify にカテゴリとしてインポートされます。',
            accountTypesDescription: 'Sage Intacctの勘定科目表は、カテゴリとしてExpensifyにインポートされます。',
            importTaxDescription: 'Sage Intacct から仕入税率をインポートします。',
            userDefinedDimensions: 'ユーザー定義ディメンション',
            addUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            integrationName: '連携名',
            dimensionExists: 'この名前のディメンションはすでに存在します。',
            removeDimension: 'ユーザー定義ディメンションを削除',
            removeDimensionPrompt: 'このユーザー定義ディメンションを削除してもよろしいですか？',
            userDefinedDimension: 'ユーザー定義ディメンション',
            addAUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            detailedInstructionsLink: '詳しい手順を表示',
            detailedInstructionsRestOfSentence: 'ユーザー定義ディメンションの追加時に。',
            userDimensionsAdded: () => ({
                one: 'UDD を 1 つ追加しました',
                other: (count: number) => `${count} 件のUDDを追加しました`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部門';
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
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'カードフィードを読み込めませんでした',
                workspaceFeedsCouldNotBeLoadedMessage: 'ワークスペースカードフィードの読み込み中にエラーが発生しました。もう一度お試しいただくか、管理者に連絡してください。',
                feedCouldNotBeLoadedTitle: 'このフィードを読み込めませんでした',
                feedCouldNotBeLoadedMessage: 'このフィードの読み込み中にエラーが発生しました。もう一度お試しいただくか、管理者に連絡してください。',
                tryAgain: '再試行する',
            },
            addNewCard: {
                other: 'その他',
                cardProviders: {
                    gl1025: 'American Express コーポレートカード',
                    cdf: 'Mastercard法人カード',
                    vcf: 'Visaコマーシャルカード',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `カードの発行会社はどこですか？`,
                whoIsYourBankAccount: 'ご利用の銀行はどちらですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: '銀行への接続方法を選択してください',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>について詳しく見る。</muted-text>`,
                commercialFeedDetails: '銀行での設定が必要です。通常は大企業で利用され、条件を満たす場合は最適な選択肢となることが多い方法です。',
                commercialFeedPlaidDetails: `銀行での設定が必要ですが、こちらで順を追って案内します。通常は大企業のみが対象です。`,
                directFeedDetails: '最もシンプルな方法です。マスター認証情報を使ってすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: (provider: string) => `${provider}フィードを有効にする`,
                    heading: 'あなたのカード発行会社と直接連携しているため、取引データを素早く正確にExpensifyへ取り込むことができます。\n\n開始するには、次の手順に従ってください。',
                    visa: 'Visa とグローバルな統合連携を行っていますが、利用資格は銀行およびカードプログラムによって異なります。\n\n利用を開始するには、次の手順に従ってください。',
                    mastercard: 'Mastercard とのグローバル連携がありますが、利用条件は銀行やカードプログラムによって異なります。\n\n開始するには、次のステップに従ってください。',
                    vcf: `1. Visa商用カードの設定方法についての詳細な手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。

2. プログラムで商用フィードに対応しているかを確認し、有効化してもらうために、[銀行に連絡](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})してください。

3. *フィードが有効になり、その詳細がわかったら、次の画面に進んでください。*`,
                    gl1025: `1. American Express があなたのプログラム向けに商用フィードを有効化できるかどうか確認するには、[このヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) をご覧ください。

2. フィードが有効化されると、Amex から本番レターが送付されます。

3. *フィード情報を入手したら、次の画面に進んでください。*`,
                    cdf: `1. Mastercard Commercial Cards のセットアップ手順の詳細については、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。

2. お使いのプログラムでコマーシャルフィードがサポートされているかを確認し、有効化してもらうために、[銀行に連絡](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})してください。

3. *フィードが有効になり、その詳細がわかったら、次の画面に進んでください。*`,
                    stripe: `1. Stripe のダッシュボードにアクセスし、[設定](${CONST.COMPANY_CARDS_STRIPE_HELP}) に移動します。

2. 「Product Integrations」の下で、Expensify の横にある「有効化」をクリックします。

3. フィードが有効になったら、下の「送信」をクリックしてください。追加作業を進めます。`,
                },
                whatBankIssuesCard: 'これらのカードはどの銀行が発行していますか？',
                enterNameOfBank: '銀行名を入力',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細は何ですか？',
                        processorLabel: 'プロセッサー ID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社ID',
                        helpLabel: 'これらのIDはどこで確認できますか？',
                    },
                    gl1025: {
                        title: `Amex配信用ファイル名は何ですか？`,
                        fileNameLabel: '配信用ファイル名',
                        helpLabel: '配信ファイル名はどこで確認できますか？',
                    },
                    cdf: {
                        title: `Mastercard 配布 ID は何ですか？`,
                        distributionLabel: '配布 ID',
                        helpLabel: '配布 ID はどこで確認できますか？',
                    },
                },
                amexCorporate: 'カードの表面に「Corporate」と書かれている場合は、これを選択してください',
                amexBusiness: 'カードの表面に「Business」と書かれている場合は、こちらを選択してください',
                amexPersonal: 'カードが個人用の場合はこれを選択',
                error: {
                    pleaseSelectProvider: '続行する前にカードの提供元を選択してください',
                    pleaseSelectBankAccount: '続行する前に銀行口座を選択してください',
                    pleaseSelectBank: '続行する前に銀行を選択してください',
                    pleaseSelectCountry: '続行する前に国を選択してください',
                    pleaseSelectFeedType: '続行する前にフィードタイプを選択してください',
                },
                exitModal: {
                    title: 'うまくいきませんか？',
                    prompt: 'カードの追加が完了していないようです。問題がありましたらお知らせください。解決してスムーズに進められるようお手伝いします。',
                    confirmText: '問題を報告',
                    cancelText: 'スキップ',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '月末最終日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '月末営業日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'カスタム月日',
            },
            assign: '割り当て',
            assignCard: 'カードを割り当てる',
            findCard: 'カードを探す',
            cardNumber: 'カード番号',
            commercialFeed: '商用フィード',
            feedName: (feedName: string) => `${feedName}カード`,
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseTheCardholder: 'カード名義人を選択',
            chooseCard: 'カードを選択',
            chooseCardFor: (assignee: string) =>
                `<strong>${assignee}</strong> に使うカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードには有効なカードがありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>または、何かが壊れているのかもしれません。いずれにしても、ご不明な点があればいつでも<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択',
            startDateDescription: 'インポート開始日を選択してください。この日付以降のすべての取引を同期します。',
            editStartDateDescription: '新しい取引の開始日を選択してください。その日以降のすべての取引を、すでに取り込んだものを除いて同期します。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタム締め日',
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            confirmationDescription: 'すぐに取引のインポートを開始します。',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィードの接続が切断されています。再度接続を確立するため、<a href="#">銀行にログイン</a>してください。</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} に ${link} を割り当てました！インポートされた取引はこのチャットに表示されます。`,
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limited は、Payment Services Regulations 2017（企業参照番号：804718）に基づき Financial Conduct Authority により規制されている認可決済機関である Plaid Financial Ltd. の代理人です。Plaid は、その代理人である Expensify Limited を通じて、お客様に規制対象の口座情報サービスを提供します。',
            assignCardFailedError: 'カードの割り当てに失敗しました。',
            unassignCardFailedError: 'カードの割り当て解除に失敗しました。',
            cardAlreadyAssignedError: 'このカードはすでに別のワークスペースのユーザーに割り当てられています。',
            importTransactions: {
                title: 'ファイルから取引をインポート',
                description: 'インポート時に適用されるように、ファイルの設定を調整してください。',
                cardDisplayName: 'カード表示名',
                currency: '通貨',
                transactionsAreReimbursable: '取引は精算対象です',
                flipAmountSign: '金額の符号を反転',
                importButton: '取引をインポート',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Expensifyカードの発行と管理',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して、利用を開始しましょう。',
            verificationInProgress: '検証を進行中...',
            verifyingTheDetails: 'いくつかの詳細情報を確認しています。Expensify Card を発行できる準備ができたら、Concierge からお知らせします。',
            disclaimer:
                'Expensify Visa® コマーシャルカードは、Visa U.S.A. Inc. からのライセンスに基づき、FDIC 加盟銀行である The Bancorp Bank, N.A. によって発行されています。また、Visa カードを受け付けるすべての加盟店で使用できるとは限りません。Apple® および Apple ロゴ® は、米国およびその他の国における Apple Inc. の登録商標です。App Store は Apple Inc. のサービスマークです。Google Play および Google Play ロゴは、Google LLC の商標です。',
            euUkDisclaimer:
                'EEA居住者に提供されるカードはTransact Payments Malta Limitedにより、英国居住者に提供されるカードはTransact Payments Limitedにより、Visa Europe Limitedのライセンスに基づき発行されます。Transact Payments Malta Limitedは、1994年金融機関法に基づき金融機関としてマルタ金融サービス庁の正式な認可および規制を受けています。登録番号C 91879。Transact Payments Limitedはジブラルタル金融サービス委員会の認可および規制を受けています。',
            issueCard: 'カードを発行',
            findCard: 'カードを探す',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '下4桁',
            limit: '上限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在残高は、前回の清算日以降に記録されたすべてのExpensifyカード取引の合計です。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `残高は${settlementDate}に清算されます`,
            settleBalance: '残高を清算',
            cardLimit: 'カード限度額',
            remainingLimit: '残りの上限',
            requestLimitIncrease: 'リクエスト上限の引き上げ',
            remainingLimitDescription:
                'ご利用可能枠を算出する際には、お客様としてのご利用期間、サインアップ時にご入力いただいた事業関連情報、そして事業用銀行口座の利用可能残高など、複数の要素を考慮します。ご利用可能枠は日々変動する場合があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース内で決済済みの月間Expensify Card利用額に基づいています。',
            issueNewCard: '新しいカードを発行',
            finishSetup: 'セットアップを完了',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: '既存のビジネス銀行口座を選んでExpensifyカードの残高を支払うか、新しい銀行口座を追加してください',
            accountEndingIn: '末尾が〜の口座',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '決済口座',
            settlementAccountDescription: 'Expensifyカードの残高を支払う口座を選択してください。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `この口座が、継続照合が正しく動作するように、あなたの<a href="${reconciliationAccountSettingsLink}">照合口座</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '清算頻度',
            settlementFrequencyDescription: 'Expensifyカードの利用残高をどのくらいの頻度で支払うか選択してください。',
            settlementFrequencyInfo: '月次精算に切り替えるには、Plaid を通じて銀行口座を連携し、過去90日間の残高履歴がプラスである必要があります。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カードの詳細',
            cardPending: ({name}: {name: string}) => `カードは現在保留中で、${name} さんのアカウントが認証され次第、発行されます。`,
            virtual: 'バーチャル',
            physical: '物理',
            deactivate: 'カードを無効化',
            changeCardLimit: 'カード限度額を変更',
            changeLimit: '上限を変更',
            smartLimitWarning: (limit: number | string) => `このカードの利用限度額を${limit}に変更すると、カードでの新規取引は、カード上の経費をさらに承認するまで拒否されます。`,
            monthlyLimitWarning: (limit: number | string) => `このカードの利用限度額を${limit}に変更すると、来月まで新しい取引は拒否されます。`,
            fixedLimitWarning: (limit: number | string) => `このカードの上限額を${limit}に変更すると、新しい取引は承認されません。`,
            changeCardLimitType: 'カードの限度額タイプを変更',
            changeLimitType: '上限タイプを変更',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `このカードの限度額タイプをスマート限度額に変更すると、未承認の限度額 ${limit} にすでに達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `このカードの上限タイプを月次に変更すると、すでに月次上限額 ${limit} に達しているため、新しい取引は承認されません。`,
            addShippingDetails: '配送先の詳細を追加',
            issuedCard: (assignee: string) => `${assignee} にExpensifyカードを発行しました！カードは2〜3営業日以内に到着します。`,
            issuedCardNoShippingDetails: (assignee: string) => `${assignee} に Expensify Card を発行しました！配送先の詳細が確認され次第、カードが発送されます。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `${assignee} にバーチャル Expensify カードを発行しました！${link} はすぐに利用できます。`,
            addedShippingDetails: (assignee: string) => `${assignee} が配送先情報を追加しました。Expensify Card は 2〜3 営業日で届きます。`,
            replacedCard: (assignee: string) => `${assignee} はExpensify Cardを再発行しました。新しいカードは2〜3営業日以内に届きます。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} さんがバーチャル Expensify カードを再発行しました！${link} はすぐにご利用いただけます。`,
            card: 'カード',
            replacementCard: '再発行カード',
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座が確認されました',
            verifyingBankAccount: '銀行口座を確認しています…',
            verifyingBankAccountDescription: 'このアカウントでExpensifyカードを発行できるか確認しています。しばらくお待ちください。',
            bankAccountVerified: '銀行口座が確認されました！',
            bankAccountVerifiedDescription: 'ワークスペースのメンバーに Expensify カードを発行できるようになりました。',
            oneMoreStep: 'あともう少しです…',
            oneMoreStepDescription: '銀行口座を手動で確認する必要があるようです。指示が用意されていますので、Concierge 画面を開いて確認してください。',
            gotIt: '了解しました',
            goToConcierge: 'Concierge に移動',
        },
        categories: {
            deleteCategories: 'カテゴリーを削除',
            deleteCategoriesPrompt: 'これらのカテゴリを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリーを無効にする',
            disableCategory: 'カテゴリを無効化',
            enableCategories: 'カテゴリを有効化',
            enableCategory: 'カテゴリを有効化',
            defaultSpendCategories: 'デフォルトの支出カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引とスキャンしたレシートで、加盟店の支出区分をカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください',
            categoryName: 'カテゴリー名',
            requiresCategory: 'メンバーはすべての経費を分類する必要があります',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `${connectionName} にエクスポートするには、すべての経費にカテゴリを設定する必要があります。`,
            subtitle: 'お金がどこで使われているかをより明確に把握しましょう。デフォルトのカテゴリを使うか、自分用のカテゴリを追加できます。',
            emptyCategories: {
                title: 'カテゴリーはまだ作成されていません',
                subtitle: '支出を整理するカテゴリを追加しましょう。',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>現在、カテゴリは会計連携からインポートされています。変更するには<a href="${accountingPageURL}">会計</a>に移動してください。</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリの更新中にエラーが発生しました。もう一度お試しください',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください。',
            addCategory: 'カテゴリーを追加',
            editCategory: 'カテゴリを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを検索',
            categoryRequiredError: 'カテゴリ名は必須です',
            existingCategoryError: 'この名前のカテゴリは既に存在します',
            invalidCategoryName: '無効なカテゴリ名',
            importedFromAccountingSoftware: '以下のカテゴリーは、あなたのからインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください。',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリを削除または無効にすることはできません',
                description: `ワークスペースでカテゴリが必須のため、少なくとも1つのカテゴリは有効のままにしておく必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: 'ビジネスの成長に合わせて、以下のトグルを使って機能を有効化してください。各機能は、さらにカスタマイズできるようナビゲーションメニューに表示されます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームの拡大を支援する機能を有効にする',
            },
            manageSection: {
                title: '管理',
                subtitle: '支出を予算内に収めるための管理機能を追加します。',
            },
            earnSection: {
                title: '獲得',
                subtitle: '収益管理を効率化して、入金スピードを加速しましょう。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '支出をグループ化・分析し、支払ったすべての税金を記録します。',
            },
            integrateSection: {
                title: '統合する',
                subtitle: 'Expensify を人気の金融プロダクトと連携しましょう。',
            },
            distanceRates: {
                title: '距離レート',
                subtitle: 'レートを追加、更新し、適用します。',
            },
            perDiem: {
                title: '日当',
                subtitle: '日当額を設定して、従業員の1日あたりの支出を管理しましょう。',
            },
            travel: {
                title: '出張',
                subtitle: 'すべての出張を予約・管理し、精算しましょう。',
                getStarted: {
                    title: 'Expensify Travel を始めましょう',
                    subtitle: 'ビジネスについてあと少しだけ情報を入力すれば、準備完了です。',
                    ctaText: '始めよう',
                },
                reviewingRequest: {
                    title: '荷物をまとめてください、ご依頼をお預かりしました…',
                    subtitle: '現在、Expensify Travel の有効化リクエストを審査しています。準備が整い次第、お知らせしますのでご安心ください。',
                    ctaText: 'リクエストを送信しました',
                },
                bookOrManageYourTrip: {
                    title: '出張を予約または管理',
                    subtitle: 'Expensify Travel を使って、最適な旅行プランを入手し、すべての経費を一か所で管理しましょう。',
                    ctaText: '予約・管理',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '出張予約',
                        subtitle: 'おめでとうございます！このワークスペースで旅行の予約と管理を行う準備が整いました。',
                        manageTravelLabel: '出張を管理',
                    },
                    centralInvoicingSection: {
                        title: '一括請求',
                        subtitle: '旅行費を購入時に支払うのではなく、毎月の請求書に集約して管理できます。',
                        learnHow: '詳しく見る',
                        subsections: {
                            currentTravelSpendLabel: '現在の出張費',
                            currentTravelSpendCta: '残高を支払う',
                            currentTravelLimitLabel: '現在の出張上限額',
                            settlementAccountLabel: '決済口座',
                            settlementFrequencyLabel: '清算頻度',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify カード',
                subtitle: '支出を把握し、管理できるようにしましょう。',
                disableCardTitle: 'Expensify カードを無効にする',
                disableCardPrompt: 'Expensify Cardはすでに使用中のため、無効にすることはできません。今後の対応についてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeにチャットする',
                feed: {
                    title: 'Expensify カードを入手',
                    subTitle: '経費精算を効率化してExpensifyの請求額を最大50％節約し、さらに：',
                    features: {
                        cashBack: '米国内でのすべての購入でキャッシュバック',
                        unlimited: '無制限のバーチャルカード',
                        spend: '支出管理とカスタム上限',
                    },
                    ctaTitle: '新しいカードを発行',
                },
            },
            companyCards: {
                title: '会社カード',
                subtitle: 'すでにお持ちのカードを連携しましょう。',
                feed: {
                    title: 'お持ちのカードを利用（BYOC）',
                    subtitle: '自動取引インポート、レシート照合、消込のために、すでにお持ちのカードを連携しましょう。',
                    features: {
                        support: '10,000以上の銀行のカードを連携',
                        assignCards: 'チームの既存カードを連携する',
                        automaticImport: '取引を自動的に取り込みます',
                    },
                },
                bankConnectionError: '銀行接続の問題',
                connectWithPlaid: 'Plaid で接続',
                connectWithExpensifyCard: 'Expensify Card をお試しください。',
                bankConnectionDescription: `もう一度カードの追加をお試しください。それでも解決しない場合は、次のいずれかを行ってください。`,
                disableCardTitle: '会社カードを無効化',
                disableCardPrompt: 'この機能は現在使用されているため、法人カードを無効にすることはできません。次の手順についてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeにチャットする',
                cardDetails: 'カードの詳細',
                cardNumber: 'カード番号',
                cardholder: 'カード名義人',
                cardName: 'カード名',
                allCards: 'すべてのカード',
                assignedCards: '割り当て済み',
                unassignedCards: '未割り当て',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `取引をエクスポートする${integration}口座を選択してください。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `取引をエクスポートする対象の${integration}口座を選択してください。利用可能な口座を変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択してください。`,
                lastUpdated: '最終更新日',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当て解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、ドラフトレポート上のすべての取引がカード保有者のアカウントから削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: 'このカードフィードをほかと見分けられるように、一意の名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択してください。新しい取引にはこれらのルールが適用されます。',
                cardFeedRestrictDeletingTransaction: '取引の削除を制限',
                cardFeedAllowDeletingTransaction: '取引の削除を許可',
                removeCardFeed: 'カードフィードを削除',
                removeCardFeedTitle: (feedName: string) => `${feedName}フィードを削除`,
                removeCardFeedDescription: 'このカードフィードを削除してもよろしいですか？すべてのカードの割り当てが解除されます。',
                error: {
                    feedNameRequired: 'カードフィード名は必須です',
                    statementCloseDateRequired: '明細書の締め日を選択してください。',
                },
                corporate: '取引の削除を制限',
                personal: '取引の削除を許可',
                setFeedNameDescription: '他のカードフィードと区別できるように、一意の名前を付けてください',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できるようになります。新しい取引はこのルールに従います。',
                emptyAddedFeedTitle: 'このフィードにはカードがありません',
                emptyAddedFeedDescription: '銀行のカードフィードにカードがあることを確認してください。',
                pendingFeedTitle: `リクエストを確認しています…`,
                pendingFeedDescription: `現在、お客様のフィードの詳細を確認しています。確認が完了し次第、次の方法でご連絡いたします：`,
                pendingBankTitle: 'ブラウザウィンドウを確認してください',
                pendingBankDescription: (bankName: string) => `今開いたブラウザーウィンドウで${bankName}に接続してください。ウィンドウが開かなかった場合は、`,
                pendingBankLink: 'ここをクリックしてください',
                giveItNameInstruction: '他のカードと区別できる名前を付けてください。',
                updating: '更新中...',
                neverUpdated: '決してない',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `このワークスペースには複数のカードフィード（Expensify Card を除く）が接続されているため、ダウングレードできません。続行するには、<a href="#">カードフィードを1つのみにしてください</a>。`,
                noAccountsFoundDescription: (connection: string) => `${connection}でアカウントを追加して、もう一度同期してください`,
                expensifyCardBannerTitle: 'Expensify カードを入手',
                expensifyCardBannerSubtitle:
                    '米国内でのすべての購入にキャッシュバック、Expensifyの請求額が最大50％オフ、無制限のバーチャルカードなど、さまざまな特典をお楽しみいただけます。',
                expensifyCardBannerLearnMoreButton: '詳しく見る',
                statementCloseDateTitle: '明細書の締め日',
                statementCloseDateDescription: 'クレジットカードの利用明細の締め日を教えていただくと、Expensify 内に対応する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認方法と支払い方法を設定します。',
                disableApprovalPrompt:
                    'このワークスペースの Expensify カードは現在、承認によってスマート限度額が設定されています。承認を無効にする前に、スマート限度額が設定されている Expensify カードの限度額タイプを変更してください。',
            },
            invoices: {
                title: '請求書',
                subtitle: '請求書の送受信',
            },
            categories: {
                title: 'カテゴリ',
                subtitle: '支出を記録して整理。',
            },
            tags: {
                title: 'タグ',
                subtitle: 'コストを分類し、請求可能な経費を追跡しましょう。',
            },
            taxes: {
                title: '税金',
                subtitle: '対象となる税金を記録して還付申請しましょう。',
            },
            reportFields: {
                title: 'レポートフィールド',
                subtitle: '支出用のカスタムフィールドを設定する',
            },
            connections: {
                title: '会計',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: 'レシートパートナー',
                subtitle: 'レシートを自動で取り込みます。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'まだ早いですよ…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計機能を無効にするには、ワークスペースから会計連携を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber との連携を解除',
                disconnectText: 'この機能を無効にするには、先に Uber for Business との連携を解除してください。',
                description: 'この連携を本当に切断してもよろしいですか？',
                confirmText: '了解しました',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'まだ早いですよ…',
                featureEnabledText:
                    'このワークスペース内の Expensify Card の Smart Limit は、承認ワークフローに基づいて設定されています。\n\nワークフローを無効にする前に、Smart Limit が設定されているカードの上限タイプを変更してください。',
                confirmText: 'Expensifyカードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: '領収書の提出を必須にし、高額支出にフラグを付けるなどができます。',
            },
            timeTracking: {
                title: '時間',
                subtitle: 'タイムトラッキング用の請求可能な時給レートを設定します。',
                defaultHourlyRate: 'デフォルトの時間単価',
            },
        },
        reports: {
            reportsCustomTitleExamples: '例：',
            customReportNamesSubtitle: `<muted-text>当社の<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使ってレポートタイトルをカスタマイズできます。</muted-text>`,
            customNameTitle: 'デフォルトレポート名',
            customNameDescription: `<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">高度な数式</a>を使って、経費レポートに好きな名前を付けましょう。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポートの開始日: {report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名：{report:workspacename}',
            customNameReportIDExample: 'レポート ID：{report:id}',
            customNameTotalExample: '合計：{report:total}。',
            preventMembersFromChangingCustomNamesTitle: 'メンバーによるカスタムレポートタイトルの変更を禁止する',
        },
        reportFields: {
            addField: '項目を追加',
            delete: 'フィールドを削除',
            deleteFields: 'フィールドを削除',
            findReportField: 'レポート項目を検索',
            deleteConfirmation: 'このレポート項目を削除してもよろしいですか？',
            deleteFieldsConfirmation: 'これらのレポートフィールドを削除してもよろしいですか？',
            emptyReportFields: {
                title: 'レポート項目がまだ作成されていません',
                subtitle: 'レポートに表示されるカスタムフィールド（テキスト、日付、またはドロップダウン）を追加します。',
            },
            subtitle: 'レポートフィールドはすべての支出に適用され、追加情報の入力を促したい場合に役立ちます。',
            disableReportFields: 'レポート項目を無効にする',
            disableReportFieldsConfirmation: 'よろしいですか？テキストフィールドと日付フィールドは削除され、リストは無効になります。',
            importedFromAccountingSoftware: '以下のレポートフィールドは、次からインポートされます',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '計算式',
            textAlternateText: '自由入力用のフィールドを追加する。',
            dateAlternateText: '日付選択用のカレンダーを追加する',
            dropdownAlternateText: '選択肢のリストを追加してください。',
            formulaAlternateText: '数式フィールドを追加する',
            nameInputSubtitle: 'レポートフィールドの名前を選択してください。',
            typeInputSubtitle: '使用するレポートフィールドの種類を選択してください。',
            initialValueInputSubtitle: 'レポートフィールドに表示する開始値を入力してください。',
            listValuesInputSubtitle: 'これらの値はレポートフィールドのドロップダウンに表示されます。有効化された値はメンバーが選択できます。',
            listInputSubtitle: 'これらの値はレポートのフィールド一覧に表示されます。有効化された値はメンバーが選択できます。',
            deleteValue: '値を削除',
            deleteValues: '値を削除',
            disableValue: '値を無効にする',
            disableValues: '値を無効化',
            enableValue: '値を有効にする',
            enableValues: '値を有効にする',
            emptyReportFieldsValues: {
                title: 'リスト値がまだ作成されていません',
                subtitle: 'レポートに表示するカスタム値を追加します。',
            },
            deleteValuePrompt: 'このリストの値を削除してもよろしいですか？',
            deleteValuesPrompt: 'これらのリスト値を削除してもよろしいですか？',
            listValueRequiredError: 'リスト値の名前を入力してください',
            existingListValueError: 'この名前のリスト値はすでに存在します',
            editValue: '値を編集',
            listValues: '値の一覧',
            addValue: '価値を追加',
            existingReportFieldNameError: 'この名前のレポートフィールドはすでに存在します',
            reportFieldNameRequiredError: 'レポート項目名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドの種類を選択してください',
            circularReferenceError: 'このフィールドを自分自身に参照することはできません。更新してください。',
            reportFieldInitialValueRequiredError: 'レポートフィールドの初期値を選択してください',
            genericFailureMessage: 'レポートフィールドの更新中にエラーが発生しました。もう一度お試しください。',
        },
        tags: {
            tagName: 'タグ名',
            requiresTag: 'メンバーはすべての経費にタグを付ける必要があります',
            trackBillable: '請求可能な経費を追跡',
            customTagName: 'カスタムタグ名',
            enableTag: 'タグを有効にする',
            enableTags: 'タグを有効にする',
            requireTag: '必須タグ',
            requireTags: 'タグを必須にする',
            notRequireTags: '必須にしない',
            disableTag: 'タグを無効化',
            disableTags: 'タグを無効にする',
            addTag: 'タグを追加',
            editTag: 'タグを編集',
            editTags: 'タグを編集',
            findTag: 'タグを検索',
            subtitle: 'タグを使うと、コストをより詳しく分類できます。',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text><a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">従属タグ</a>を使用しています。タグを更新するには、<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>できます。</muted-text>`,
            emptyTags: {
                title: 'タグがまだ作成されていません',
                subtitle: 'タグを追加して、プロジェクト、拠点、部署などを追跡しましょう。',
                subtitleHTML: `<muted-text><centered-text>タグを追加して、プロジェクト、所在地、部門などを管理しましょう。インポート用のタグファイルの書式設定については、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">詳しくはこちら</a>をご覧ください。</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>タグは現在、会計連携からインポートされています。変更するには<a href="${accountingPageURL}">会計</a>ページに移動してください。</centered-text></muted-text>`,
            },
            deleteTag: 'タグを削除',
            deleteTags: 'タグを削除',
            deleteTagConfirmation: 'このタグを削除してもよろしいですか？',
            deleteTagsConfirmation: 'これらのタグを削除してもよろしいですか？',
            deleteFailureMessage: 'タグの削除中にエラーが発生しました。もう一度お試しください',
            tagRequiredError: 'タグ名は必須です',
            existingTagError: 'この名前のタグはすでに存在します',
            invalidTagNameError: 'タグ名を 0 にすることはできません。別の値を選択してください。',
            genericFailureMessage: 'タグの更新中にエラーが発生しました。もう一度お試しください。',
            importedFromAccountingSoftware: 'タグは次で管理されています:',
            employeesSeeTagsAs: '従業員にはタグが次のように表示されます:',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください',
            tagRules: 'タグルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費に 1 種類のタグまたは複数のタグを付けて分類できます。',
            configureMultiLevelTags: '複数レベルのタグ付け用に、タグの一覧を設定します。',
            importMultiLevelTagsSupportingText: `タグのプレビューです。問題なければ、下をクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列にGLコードがあります',
            },
            tagLevel: {
                singleLevel: 'タグは 1 階層のみ',
                multiLevel: '多層タグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替え',
                prompt1: 'タグレベルを変更すると、現在のすべてのタグが消去されます。',
                prompt2: '最初に行っていただきたいのは次のとおりです',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートすることで。',
                prompt5: '詳しく見る',
                prompt6: 'タグレベルについて。',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当によろしいですか？',
                prompt2: '既存のタグは上書きされますが、あなたは',
                prompt3: 'バックアップをダウンロード',
                prompt4: '最初に。',
            },
            importedTagsMessage: (columnCounts: number) =>
                `スプレッドシート内に *${columnCounts} 列* 見つかりました。タグ名が含まれている列の横にある *Name* を選択してください。タグのステータスを設定する列の横にある *Enabled* を選択することもできます。`,
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: `ワークスペースでタグが必須のため、少なくとも1つのタグは有効のままにする必要があります。`,
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグを任意にはできません',
                description: `ワークスペースの設定でタグが必須となっているため、少なくとも 1 つのタグは必須のままにする必要があります。`,
            },
            cannotMakeTagListRequired: {
                title: 'タグリストを必須にすることはできません',
                description: 'タグリストを必須にできるのは、ポリシーで複数のタグレベルが設定されている場合のみです。',
            },
            tagCount: () => ({
                one: '1日',
                other: (count: number) => `${count} 個のタグ`,
            }),
        },
        taxes: {
            subtitle: '税名と税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペースの通貨のデフォルト',
            foreignDefault: '外貨のデフォルト設定',
            customTaxName: 'カスタム税名',
            value: '値',
            taxReclaimableOn: '還付可能な税金額',
            taxRate: '税率',
            findTaxRate: '税率を検索',
            error: {
                taxRateAlreadyExists: 'この税金名はすでに使用されています',
                taxCodeAlreadyExists: 'この税コードはすでに使用されています',
                valuePercentageRange: '0〜100の間の有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名は必須です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Concierge にサポートを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Conciergeにサポートを依頼してください。',
                updateTaxClaimableFailureMessage: '払い戻し可能な金額は、距離単価金額より少なくなければなりません',
            },
            deleteTaxConfirmation: 'この税を削除してもよろしいですか？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `${taxAmount} 件の税金を削除してもよろしいですか？`,
            actions: {
                delete: 'レートを削除',
                deleteMultiple: 'レートを削除',
                enable: 'レートを有効にする',
                disable: 'レートを無効にする',
                enableTaxRates: () => ({
                    one: 'レートを有効にする',
                    other: '料金を有効にする',
                }),
                disableTaxRates: () => ({
                    one: 'レートを無効にする',
                    other: 'レートを無効にする',
                }),
            },
            importedFromAccountingSoftware: '以下の税金は、あなたの からインポートされています',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください',
        },
        duplicateWorkspace: {
            title: '新しいワークスペースに名前を付ける',
            selectFeatures: 'コピーする機能を選択',
            whichFeatures: '新しいワークスペースにどの機能をコピーしますか？',
            confirmDuplicate: '続行しますか？',
            categories: 'カテゴリと自動分類ルール',
            reimbursementAccount: '精算口座',
            welcomeNote: '私の新しいワークスペースを使い始めてください',
            delayedSubmission: '提出の遅延',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `元のワークスペースから${totalMembers ?? 0}人のメンバーと一緒に${newWorkspaceName ?? ''}を作成して共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースはありません',
            subtitle: '領収書の管理、経費精算、出張管理、請求書送付など、さまざまなことができます。',
            createAWorkspaceCTA: 'はじめる',
            features: {
                trackAndCollect: '領収書を追跡して回収',
                reimbursements: '従業員に精算する',
                companyCards: '会社カードを管理',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは複数の人と議論し、一緒に作業するのに最適な場所です。共同作業を始めるには、ワークスペースを作成するか参加してください',
        },
        new: {
            newWorkspace: '新しいワークスペース',
            getTheExpensifyCardAndMore: 'Expensify Card などを利用する',
            confirmWorkspace: 'ワークスペースを確認',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `自分のグループワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName} のワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'ワークスペースからメンバーを削除する際にエラーが発生しました。もう一度お試しください',
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
            transferOwner: '所有者を変更',
            makeMember: () => ({
                one: 'メンバーにする',
                other: 'メンバーにする',
            }),
            makeAdmin: () => ({
                one: '管理者にする',
                other: '管理者にする',
            }),
            makeAuditor: () => ({
                one: '監査人にする',
                other: '監査担当者を作成',
            }),
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーを追加する際に問題が発生しました',
                cannotRemove: '自分自身またはワークスペースのオーナーは削除できません',
                genericRemove: 'そのワークスペースメンバーを削除する際に問題が発生しました',
            },
            addedWithPrimary: '一部のメンバーは、プライマリーログインを使用して追加されました。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `セカンダリログイン ${secondaryLogin} によって追加されました。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `ワークスペースのメンバー合計：${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `このワークスペースから${approver}を削除すると、承認ワークフローではワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} には、承認待ちの経費レポートがあります。ワークスペースから削除する前に、承認するよう依頼するか、そのレポートの管理を引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除することはできません。ワークフロー > 支払の作成または追跡 で新しい払い戻し担当者を設定してから、もう一度お試しください。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、優先エクスポーターはワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、技術連絡先はワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} は、対応が必要な未処理のレポートがあります。ワークスペースから削除する前に、必要な対応を完了するよう依頼してください。`,
        },
        card: {
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して、利用を開始しましょう。',
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
                chooseLimitType: '上限の種類を選択',
                smartLimit: 'スマート上限',
                smartLimitDescription: '承認が必要になる前に、一定額まで支出できる',
                monthly: '毎月',
                monthlyDescription: '月ごとに一定額まで利用する',
                fixedAmount: '固定金額',
                fixedAmountDescription: '一度だけ上限金額まで利用する',
                setLimit: '上限を設定',
                cardLimitError: '21,474,836ドル未満の金額を入力してください',
                giveItName: '名前を付けてください',
                giveItNameInstruction: '他のカードと見分けがつくように、十分にユニークな名前にしてください。具体的な用途を書いておくと、さらに分かりやすくなります。',
                cardName: 'カード名',
                letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
                willBeReadyToUse: 'このカードはすぐにご利用いただけます。',
                willBeReadyToShip: 'このカードはすぐに発送できる状態になります。',
                cardholder: 'カード名義人',
                cardType: 'カード種別',
                limit: '上限',
                limitType: '制限タイプ',
                disabledApprovalForSmartLimitError: 'スマート上限を設定する前に、<strong>[ワークフロー] &gt; [承認を追加]</strong> で承認を有効にしてください',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化',
                deactivateConfirmation: 'このカードを無効にすると、今後のすべての取引が拒否され、元に戻すことはできません。',
            },
        },
        accounting: {
            settings: '設定',
            title: '接続',
            subtitle: '会計システムに接続して勘定科目で取引をコード化し、支払いを自動照合して、財務情報を常に同期させましょう。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'セットアップ担当者とチャットする',
            talkYourAccountManager: 'アカウントマネージャーとチャットする。',
            talkToConcierge: 'Concierge とチャットする',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Expensify Classic で設定された接続にエラーが発生しています。[この問題を解決するには Expensify Classic を開いてください。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '設定を管理するには、Expensify Classic に移動してください。',
            setup: '接続',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `最終同期日時：${relativeDate}`,
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
            notImported: 'インポートされていません',
            importAsCategory: 'カテゴリとしてインポート済み',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'タグとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'インポートされていません',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'レポートフィールドとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 従業員のデフォルト',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この連携';
                return `${integrationName} の接続を本当に解除しますか？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計連携'} を接続してもよろしいですか？この操作により、既存の会計連携はすべて削除されます。`,
            enterCredentials: '認証情報を入力してください',
            claimOffer: {
                badgeText: 'ご利用可能な特典があります！',
                xero: {
                    headline: 'Xero を6か月間無料で利用しましょう！',
                    description:
                        '<muted-text><centered-text>Xero を初めてご利用ですか？Expensify 顧客は 6 か月間無料でご利用いただけます。以下から特典をお受け取りください。</centered-text></muted-text>',
                    connectButton: 'Xero に接続',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Uber の乗車料金が5%オフ',
                    description: `<muted-text><centered-text>Expensify 経由で Uber for Business を有効化すると、6 月までのすべてのビジネス乗車が 5% 割引になります。<a href="${CONST.UBER_TERMS_LINK}">適用条件はこちら。</a></centered-text></muted-text>`,
                    connectButton: 'Uber for Business に接続',
                },
            },
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
                            return '従業員をインポート中';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '口座のインポート';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'クラスのインポート';
                        case 'quickbooksOnlineImportLocations':
                            return '所在地をインポート中';
                        case 'quickbooksOnlineImportProcessing':
                            return 'インポートしたデータを処理しています';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '精算済みレポートと支払済み請求書の同期';
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
                            return 'QuickBooks とデータを同期中です… Web Connector が実行中であることを確認してください';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online データを同期中';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'データを読み込み中';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'カテゴリを更新しています';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '顧客／プロジェクトの更新';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'メンバー一覧を更新しています';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポート項目を更新中';
                        case 'jobDone':
                            return 'インポートしたデータの読み込みを待機しています';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期中';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期しています';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensifyレポートに「精算済み」のマークを付ける';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xeroの請求書とインボイスに支払済みマークを付ける';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期中';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座を同期中';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期しています';
                        case 'xeroCheckConnection':
                            return 'Xero との接続を確認しています';
                        case 'xeroSyncTitle':
                            return 'Xero データを同期しています';
                        case 'netSuiteSyncConnection':
                            return 'NetSuite への接続を初期化しています';
                        case 'netSuiteSyncCustomers':
                            return '顧客のインポート';
                        case 'netSuiteSyncInitData':
                            return 'NetSuite からデータを取得中';
                        case 'netSuiteSyncImportTaxes':
                            return '税金のインポート';
                        case 'netSuiteSyncImportItems':
                            return '項目のインポート中';
                        case 'netSuiteSyncData':
                            return 'Expensify へのデータインポート';
                        case 'netSuiteSyncAccounts':
                            return 'アカウントを同期しています';
                        case 'netSuiteSyncCurrencies':
                            return '通貨を同期中';
                        case 'netSuiteSyncCategories':
                            return 'カテゴリを同期しています';
                        case 'netSuiteSyncReportFields':
                            return 'データをExpensifyのレポート項目としてインポートする';
                        case 'netSuiteSyncTags':
                            return 'Expensifyタグとしてデータをインポート中';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新中';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensifyレポートに「精算済み」のマークを付ける';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuiteの請求書とインボイスを支払済みにマークする';
                        case 'netSuiteImportVendorsTitle':
                            return '仕入先のインポート';
                        case 'netSuiteImportCustomListsTitle':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportCustomLists':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '子会社のインポート';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '仕入先のインポート';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct 接続を確認しています';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct ディメンションのインポート';
                        case 'intacctImportTitle':
                            return 'Sage Intacctデータのインポート';
                        default: {
                            return `ステージの翻訳が見つかりません: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '優先エクスポーター',
            exportPreferredExporterNote:
                '優先されるエクスポート担当者は任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート用口座を設定している場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターのアカウントにエクスポート対象のレポートが表示されます。',
            exportAs: 'エクスポート形式',
            exportOutOfPocket: '立替経費の書き出し形式',
            exportCompanyCard: '会社カード経費を次の形式でエクスポート',
            exportDate: 'エクスポート日',
            defaultVendor: 'デフォルトの仕入先',
            autoSync: '自動同期',
            autoSyncDescription: 'NetSuite と Expensify を毎日自動で同期。確定したレポートをリアルタイムでエクスポート',
            reimbursedReports: '精算済みレポートを同期',
            cardReconciliation: 'カード照合',
            reconciliationAccount: '調整勘定',
            continuousReconciliation: '継続的な消し込み',
            saveHoursOnReconciliation: 'ExpensifyがExpensify Cardの利用明細と精算を自動的かつ継続的に照合することで、各会計期間の消込作業にかかる時間を大幅に短縮できます。',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>継続照合を有効にするには、${connectionName} の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card の支払いを照合する銀行口座を選択してください。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Continuous Reconciliation が正しく動作するように、この口座が、末尾が ${lastFourPAN} の <a href="${settlementAccountUrl}">Expensify カード精算口座</a> と一致していることを確認してください。`,
            },
        },
        export: {
            notReadyHeading: 'エクスポートの準備ができていません',
            notReadyDescription: '下書きまたは保留中の経費精算書は会計システムへエクスポートできません。エクスポートする前に、これらの経費を承認または支払ってください。',
        },
        invoices: {
            sendInvoice: '請求書を送信',
            sendFrom: '送信元',
            invoicingDetails: '請求書の詳細',
            invoicingDetailsDescription: 'この情報はあなたの請求書に表示されます。',
            companyName: '会社名',
            companyWebsite: '会社のウェブサイト',
            paymentMethods: {
                personal: '個人',
                business: 'ビジネス',
                chooseInvoiceMethod: '下から支払い方法を選択してください:',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書の残高',
            invoiceBalanceSubtitle: 'これは、請求書の支払いを回収して得た現在の残高です。銀行口座を追加済みであれば、自動的にその口座へ振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いの送金と受け取りのために、銀行口座を追加してください。',
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
            from: '差出人',
        },
        inviteMessage: {
            confirmDetails: '詳細を確認',
            inviteMessagePrompt: '招待をさらに特別なものにするために、下にメッセージを追加しましょう！',
            personalMessagePrompt: 'メッセージ',
            genericFailureMessage: 'ワークスペースにメンバーを招待する際にエラーが発生しました。もう一度お試しください。',
            inviteNoMembersError: '招待するメンバーを少なくとも1人選択してください',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} が ${workspaceName} への参加をリクエストしました`,
        },
        distanceRates: {
            oopsNotSoFast: 'おっと！ちょっと待ってください…',
            workspaceNeeds: 'ワークスペースには、有効な距離レートが少なくとも1つ必要です。',
            distance: '距離',
            centrallyManage: 'レートを一元管理し、マイルまたはキロメートルで走行距離を追跡し、デフォルトのカテゴリを設定できます。',
            rate: '評価',
            addRate: 'レートを追加',
            findRate: 'レートを検索',
            trackTax: '税金を追跡',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            enableRates: () => ({
                one: 'レートを有効にする',
                other: '料金を有効にする',
            }),
            disableRates: () => ({
                one: 'レートを無効にする',
                other: 'レートを無効にする',
            }),
            enableRate: 'レートを有効にする',
            status: 'ステータス',
            unit: '単位',
            taxFeatureNotEnabledMessage:
                '<muted-text>この機能を利用するには、ワークスペースで税金機能を有効にする必要があります。変更するには、<a href="#">その他の機能</a>に移動してください。</muted-text>',
            deleteDistanceRate: '距離単価を削除',
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
            typeInputLabel: '種類',
            initialValueInputLabel: '初期値',
            nameInputHelpText: 'これはワークスペース上に表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付けてください',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペース上のすべての経費は、この通貨に換算されます。',
            currencyInputDisabledText: (currency: string) => `このワークスペースは${currency}の銀行口座にリンクされているため、デフォルト通貨は変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travel を有効にするには、ワークスペース住所が必要です。ビジネスに関連付けられている住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続行',
            youAreAlmostDone: '銀行口座の設定はほぼ完了です。設定が完了すると、コーポレートカードの発行、経費精算、請求書の回収、支払いの実行ができるようになります。',
            streamlinePayments: '支払いを効率化',
            connectBankAccountNote: '注: ワークスペースでの支払いには、個人の銀行口座は使用できません。',
            oneMoreThing: 'もうひとつ！',
            allSet: '準備が整いました！',
            accountDescriptionWithCards: 'この銀行口座は、法人カードの発行、経費の精算、請求書の回収、および支払いに使用されます。',
            letsFinishInChat: 'チャットで完了しましょう！',
            finishInChat: 'チャットで完了',
            almostDone: 'ほとんど完了しました！',
            disconnectBankAccount: '銀行口座の連携を解除',
            startOver: '最初からやり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、銀行口座を連携解除します',
            yesStartOver: 'はい、最初からやり直す',
            disconnectYourBankAccount: (bankName: string) => `<strong>${bankName}</strong> 銀行口座の連携を解除します。この口座の未処理取引は引き続き完了します。`,
            clearProgress: '最初からやり直すと、これまでの進行状況がすべて消去されます。',
            areYouSure: '本当によろしいですか？',
            workspaceCurrency: 'ワークスペースの通貨',
            updateCurrencyPrompt: '現在ご利用のワークスペースは、USD 以外の通貨に設定されているようです。下のボタンをクリックして、通貨を USD に更新してください。',
            updateToUSD: 'USD に更新',
            updateWorkspaceCurrency: 'ワークスペースの通貨を更新',
            workspaceCurrencyNotSupported: 'ワークスペースの通貨はサポートされていません',
            yourWorkspace: `ご利用のワークスペースで未対応の通貨が設定されています。<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">対応通貨の一覧</a>を表示します。`,
            chooseAnExisting: '既存の銀行口座を選択して経費を支払うか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: '所有者を変更',
            addPaymentCardTitle: '所有権を移転するには、お支払いカードを入力してください',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>カードを追加するには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>を読み、同意してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長化インフラ',
            addPaymentCardLearnMore: `<muted-text>当社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>について詳しく見る。</muted-text>`,
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには、前月からの未払い残高があります。\n\n残高を清算して、このワークスペースの請求管理を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を移動',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `このワークスペースの所有アカウント（${email}）には、前月からの未払い残高があります。

このワークスペースの請求を引き継ぐために、この金額（${amount}）を振り替えますか？お支払いカードには直ちに請求されます。`,
            subscriptionTitle: '年額サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移管',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `このワークスペースを引き継ぐと、その年額サブスクリプションは現在のサブスクリプションと統合されます。これにより、サブスクリプションの人数は${usersCount}人分増え、新しいサブスクリプションの合計人数は${finalCount}人になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複したサブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `${email} さんのワークスペースの支払い管理を引き継ごうとしているようですが、そのためには、まずその方のすべてのワークスペースで管理者になる必要があります。

ワークスペース ${workspaceName} の支払い管理だけを引き継ぐ場合は、「続行」をクリックしてください。

サブスクリプション全体の支払い管理を引き継ぎたい場合は、支払い管理を引き継ぐ前に、すべてのワークスペースであなたを管理者として追加してもらってください。`,
            hasFailedSettlementsTitle: '所有者を譲渡できません',
            hasFailedSettlementsButtonText: '了解しました',
            hasFailedSettlementsText: (email: string) =>
                `${email} に未払いの Expensify Card 決済があるため、請求の引き継ぎはできません。問題を解決するため、concierge@expensify.com まで連絡するよう依頼してください。その後、このワークスペースの請求を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高をクリアできませんでした',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高を消去できませんでした。後でもう一度お試しください。',
            successTitle: 'やった！これで完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ちょっと待ってください…',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権の移譲中に問題が発生しました。もう一度お試しいただくか、サポートが必要な場合は<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `以下のレポートはすでに ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポートされています。

${reportName}

本当にもう一度エクスポートしますか？`,
            confirmText: 'はい、再エクスポートします',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポートフィールド',
                description: `レポートフィールドを使用すると、各明細行の経費に関連するタグとは異なる、レポートのヘッダーレベルの詳細を指定できます。これらの詳細には、特定のプロジェクト名、出張情報、場所などを含めることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのControlプランでのみ利用できます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify と NetSuite の連携により、自動同期を活用して手入力を削減しましょう。プロジェクトや顧客のマッピングを含むネイティブおよびカスタムセグメントに対応し、詳細かつリアルタイムな財務インサイトを得ることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>NetSuite 連携は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からです。</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify と Sage Intacct の連携により、自動同期を活用して手動入力を削減しましょう。ユーザー定義ディメンションに加え、部門、クラス、拠点、顧客、プロジェクト（ジョブ）別の経費コーディングにより、詳細でリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sage Intacct 連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify と QuickBooks Desktop の連携により、自動同期を活用して手入力を削減しましょう。リアルタイムの双方向接続と、クラス、品目、顧客、プロジェクト別の経費コード設定で、究極の効率性を実現できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktop 連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみご利用いただけます。</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `承認フローにさらに段階を追加したい場合や、高額な経費だけは必ず別の担当者にも確認してほしい場合でも、心配はいりません。高度な承認機能を使えば、あらゆるレベルで適切なチェック体制を整え、チームの支出をしっかり管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認機能は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からです。</muted-text>`,
            },
            categories: {
                title: 'カテゴリ',
                description: 'カテゴリを使うと、支出を追跡して整理できます。デフォルトのカテゴリを使うか、自分でカテゴリを追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリは、${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}<strong>${formattedPrice}</strong>からのCollectプランで利用できます</muted-text>`,
            },
            glCodes: {
                title: '総勘定元帳コード',
                description: `会計および給与システムへ経費を簡単にエクスポートできるよう、カテゴリとタグにGLコードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのControlプランでのみ利用できます</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '総勘定元帳コードと給与コード',
                description: `経費を会計システムや給与システムへ簡単にエクスポートできるよう、カテゴリに総勘定元帳コードと給与コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL コードと給与コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `経費を会計システムや給与システムへ簡単にエクスポートできるように、税金に税コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのControlプランでのみ利用できます</muted-text>`,
            },
            companyCards: {
                title: '無制限の会社カード',
                description: `カードフィードをさらに追加する必要がありますか？すべての主要なカード発行会社から取引を同期できる、無制限の法人カードを有効にしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これは Control プランでのみ利用可能で、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からご利用いただけます</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで動作し、細かな点を気にしなくても支出をきちんと管理できるようにします。

領収書や説明などの経費の詳細を必須にしたり、上限やデフォルトを設定したり、承認と支払いを自動化したりと、すべてを一箇所で行えます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみ利用できます</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '日当は、従業員が出張する際の1日あたりの費用を、コンプライアンスに準拠させつつ予測しやすく管理するための最適な方法です。カスタムレートやデフォルトカテゴリーのほか、渡航先やサブラテといった、より詳細な設定機能もご利用いただけます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>日当は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみ利用できます</muted-text>`,
            },
            travel: {
                title: '出張',
                description: 'Expensify Travel は、メンバーが宿泊施設、フライト、交通手段などを予約できる、新しい法人向け出張予約・管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>トラベルは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのCollectプランで利用できます</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使用すると、経費をグループ化して、追跡と整理をしやすくできます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのCollectプランで利用できます</muted-text>`,
            },
            multiLevelTags: {
                title: '多層タグ',
                description:
                    'マルチレベルタグを使うと、経費をより正確に管理できます。各明細行に複数のタグ（部門、クライアント、コストセンターなど）を割り当てることで、あらゆる経費の背景情報を網羅的に記録できます。これにより、より詳細なレポート作成、承認ワークフロー、会計エクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`} からの Control プランでのみ利用できます</muted-text>`,
            },
            distanceRates: {
                title: '距離レート',
                description: '自分用のレートを作成・管理し、マイルまたはキロメートルで距離を記録し、距離精算用のデフォルトカテゴリを設定できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離レートは、Collect プラン（<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}から）で利用できます</muted-text>`,
            },
            auditor: {
                title: '監査人',
                description: '監査担当者は、可視性の確保とコンプライアンス監視のため、すべてのレポートへの読み取り専用アクセス権を付与されます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>監査担当者は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのControlプランでのみ利用可能です</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数承認レベルは、精算前にレポートを複数人で承認する必要がある企業向けのワークフローツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}からのControlプランでのみ利用できます</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり／月',
                perMember: 'メンバー1人あたり月額',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>この機能を利用するにはアップグレードするか、プランと料金について<a href="${subscriptionLink}">詳しく見る</a>。</muted-text>`,
            upgradeToUnlock: 'この機能を有効化',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>${policyName} のプランを Control プランにアップグレードしました！詳しくは <a href="${subscriptionLink}">サブスクリプションを表示</a> してください。</centered-text>`,
                categorizeMessage: `Collectプランへのアップグレードが完了しました。これで経費をカテゴリ分けできるようになりました！`,
                travelMessage: `Collectプランへのアップグレードが完了しました。これで旅行の予約と管理を開始できます！`,
                distanceRateMessage: `Collectプランへのアップグレードが完了しました。これで距離単価を変更できるようになりました！`,
                gotIt: '承知しました。ありがとうございます。',
                createdWorkspace: `ワークスペースを作成しました！`,
            },
            commonFeatures: {
                title: 'Controlプランにアップグレード',
                note: '以下のような、最も強力な機能を利用できます。',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Controlプランは<strong>${formattedPrice}</strong>からです ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり／月`}<a href="${learnMoreMethodsRoute}">詳細</a>でプランと料金についてご確認ください。</muted-text>`,
                    benefit1: '高度な会計連携（NetSuite、Sage Intacct など）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランの種類を次のものに変更してください',
                },
                upgradeWorkspaceWarning: `ワークスペースをアップグレードできません`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '所属会社ではワークスペースの作成が制限されています。管理者に連絡してサポートを受けてください。',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collectプランにダウングレード',
                note: 'ダウングレードすると、これらをはじめとする機能へのアクセスができなくなります。',
                benefits: {
                    note: '各プランの詳細な比較については、こちらをご覧ください',
                    pricingPage: '料金ページ',
                    confirm: '本当にダウングレードして設定を削除しますか？',
                    warning: 'この操作は元に戻せません。',
                    benefit1: '会計連携（QuickBooks Online と Xero を除く）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    headsUp: 'お知らせです！',
                    multiWorkspaceNote: 'Collect レートでのサブスクリプションを開始するには、初回の月額支払い前に、すべてのワークスペースをダウングレードする必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択する > プランの種類を次に変更する',
                },
            },
            completed: {
                headline: 'ワークスペースがダウングレードされました',
                description: 'Control プランのワークスペースが他にもあります。Collect レートで請求されるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '承知しました。ありがとうございます。',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: '最終のお支払い',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `このサブスクリプションの最終請求額は<strong>${formattedAmount}</strong>です`,
            description2: (date: string) => `${date} の内訳は以下のとおりです：`,
            subscription:
                '注意：この操作を行うと、Expensify のサブスクリプションが終了し、このワークスペースが削除され、すべてのワークスペースメンバーが削除されます。このワークスペースを残したまま自分だけを外したい場合は、先に他の管理者に請求管理を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限中',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `現在、${workspaceName} ワークスペースでの操作は制限されています`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `ワークスペースのオーナーである${workspaceOwnerName}が、ワークスペースの新しいアクティビティを有効にするために、保存されている支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを有効にするには、登録されている支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: 'ロック解除するには支払いカードを追加してください。',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き利用するには支払いカードを追加してください',
            pleaseReachOutToYourWorkspaceAdmin: 'ご不明な点がある場合は、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者にチャットで問い合わせる',
            chatInAdmins: '#adminsでチャット',
            addPaymentCard: '支払カードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>個々の経費に対する支出コントロールとデフォルトを設定します。<a href="${categoriesPageLink}">カテゴリ</a>や<a href="${tagsPageLink}">タグ</a>に対するルールを作成することもできます。</muted-text>`,
                receiptRequiredAmount: '領収書が必要な金額',
                receiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出には領収書を必須にする。',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `金額は、明細付き領収書で求められている金額（${amount}）を超えることはできません`,
                itemizedReceiptRequiredAmount: '明細付き領収書が必要な金額',
                itemizedReceiptRequiredAmountDescription: '支出がこの金額を超える場合、カテゴリールールで上書きされていない限り、項目別のレシートを必須にする。',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `金額は、通常の領収書に必要な金額（${amount}）より少なくすることはできません`,
                maxExpenseAmount: '最大経費金額',
                maxExpenseAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出にフラグを付けます。',
                maxAge: '最長年齢',
                maxExpenseAge: '経費の最大経過日数',
                maxExpenseAgeDescription: '指定した日数より前の支出にフラグを付ける。',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count}日`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費をどのように作成するかを選択してください。会社カード取引としてインポートされていない経費は現金経費とみなされます。これには、手動で作成された経費、領収書、日当、距離、および時間に基づく経費が含まれます。',
                reimbursableDefault: '精算対象',
                reimbursableDefaultDescription: '経費は多くの場合、従業員に払い戻されます',
                nonReimbursableDefault: '精算対象外',
                nonReimbursableDefaultDescription: '従業員に経費が返金されることが時々あります',
                alwaysReimbursable: '常に精算可能',
                alwaysReimbursableDescription: '経費は常に従業員へ精算されます',
                alwaysNonReimbursable: '常に立替精算しない',
                alwaysNonReimbursableDescription: '経費は従業員に一切払い戻されません',
                billableDefault: '請求可能のデフォルト',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>現金およびクレジットカード経費をデフォルトで請求可能にするかどうかを選択してください。請求可能な経費は、<a href="${tagsPageLink}">タグ</a>で有効または無効にできます。</muted-text>`,
                billable: '請求可能',
                billableDescription: '経費は、ほとんどの場合クライアントに再請求されます',
                nonBillable: '請求対象外',
                nonBillableDescription: '経費がクライアントに再請求されることがある',
                eReceipts: '電子レシート',
                eReceiptsHint: `eReceipts は[ほとんどの USD クレジット取引に対して自動作成されます](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費について、1人あたりの費用を記録します。',
                prohibitedDefaultDescription:
                    'アルコール、ギャンブル、その他の制限対象品目が含まれている領収書にはフラグを付けてください。これらの明細項目が含まれる領収書の経費は、手動での確認が必要になります。',
                prohibitedExpenses: '禁止されている経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル付帯費用',
                gambling: 'ギャンブル',
                tobacco: 'たばこ',
                adultEntertainment: 'アダルトエンターテインメント',
                requireCompanyCard: 'すべての支払いに会社カードを必須にする',
                requireCompanyCardDescription: 'マイレージや日当経費を含む、すべての現金支出にフラグを付ける。',
            },
            expenseReportRules: {
                title: '詳細設定',
                subtitle: '経費精算のコンプライアンス、承認、支払いを自動化します。',
                preventSelfApprovalsTitle: '自分での承認を禁止',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分の経費レポートを承認できないようにする。',
                autoApproveCompliantReportsTitle: '準拠したレポートを自動承認',
                autoApproveCompliantReportsSubtitle: '自動承認の対象とする経費レポートを設定します。',
                autoApproveReportsUnderTitle: '以下の金額未満のレポートを自動承認',
                autoApproveReportsUnderDescription: 'この金額以下で要件をすべて満たしている経費精算書は、自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートは、自動承認の対象であっても手動承認を必須にする',
                autoPayApprovedReportsTitle: '自動支払いが承認されたレポート',
                autoPayApprovedReportsSubtitle: '自動支払いの対象となる経費精算レポートを設定します。',
                autoPayApprovedReportsLimitError: (currency?: string) => `${currency ?? ''}20,000 未満の金額を入力してください`,
                autoPayApprovedReportsLockedSubtitle: 'その他の機能に移動してワークフローを有効にし、その後、支払いを追加してこの機能を有効化してください。',
                autoPayReportsUnderTitle:
                    '自動支払いレポートの対象I realized my initial translation might be slightly off for a UI label that’s likely followed by something (e.g., “Auto-pay reports under $50”). A more neutral, structurally compatible translation would be:\n\n自動支払いするレポートの条件\n\nThis better supports being followed by another value or phrase while staying concise and UI-appropriate.',
                autoPayReportsUnderDescription: 'この金額以下の完全準拠の経費精算書は自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `この機能を利用するには、${featureName} を追加してください。`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[その他の機能](${moreFeaturesLink})に移動し、${featureName} を有効にしてこの機能を利用できるようにしてください。`,
            },
            merchantRules: {
                title: '加盟店',
                subtitle: '経費が正しくコード化され、後処理が最小限で済むように、加盟店ルールを設定しましょう。',
                addRule: '加盟店ルールを追加',
                addRuleTitle: 'ルールを追加',
                editRuleTitle: 'ルールを編集',
                expensesWith: '対象の経費条件:',
                expensesExactlyMatching: '完全に一致する経費に対して:',
                applyUpdates: 'これらの更新を適用する',
                saveRule: 'ルールを保存',
                previewMatches: '一致候補をプレビュー',
                confirmError: '店舗名を入力し、少なくとも1つの更新を適用してください',
                confirmErrorMerchant: '加盟店名を入力してください',
                confirmErrorUpdate: '少なくとも 1 つの更新を適用してください',
                previewMatchesEmptyStateTitle: '表示するものはありません',
                previewMatchesEmptyStateSubtitle: 'このルールに一致する未提出の経費はありません。',
                deleteRule: 'ルールを削除',
                deleteRuleConfirmation: 'このルールを削除してもよろしいですか？',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `もし加盟店 ${isExactMatch ? '完全一致' : '含む'}「${merchantName}」が`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `支払先を「${merchantName}」に名前変更`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} を「${fieldValue}」に更新`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `「${reimbursable ? '精算対象' : '払い戻し対象外'}」としてマーク`,
                ruleSummarySubtitleBillable: (billable: boolean) => `"${billable ? '請求可能' : '請求対象外'}" としてマーク`,
                matchType: '一致タイプ',
                matchTypeContains: '含む',
                matchTypeExact: '完全一致',
                duplicateRuleTitle: '同様のマーチャントルールがすでに存在します',
                duplicateRulePrompt: (merchantName: string) => `既に既存のルールがありますが、「${merchantName}」用の新しいルールを保存しますか？`,
                saveAnyway: 'とにかく保存',
                applyToExistingUnsubmittedExpenses: '既存の未提出経費に適用',
            },
            categoryRules: {
                title: 'カテゴリルール',
                approver: '承認者',
                requireDescription: '説明が必要です',
                requireFields: '必須項目',
                requiredFieldsTitle: '必須項目',
                requiredFieldsDescription: (categoryName: string) => `これは、<strong>${categoryName}</strong> に分類されたすべての経費に適用されます。`,
                requireAttendees: '参加者を必須にする',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: (categoryName: string) => `従業員に「${categoryName}」での支出について追加情報の入力を促します。このヒントは経費の説明欄に表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロのヒント：短ければ短いほど良いです！',
                maxAmount: '最大金額',
                flagAmountsOver: '一定額以上をフラグする',
                flagAmountsOverDescription: (categoryName: string) => `カテゴリ「${categoryName}」に適用されます。`,
                flagAmountsOverSubtitle: 'これは、すべての経費の最大金額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリごとに経費金額にフラグを付けます。このルールは、経費金額の上限に関するワークスペース全体の一般ルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費レポートごとに、カテゴリ別の1日あたり合計支出額をフラグ設定する。',
                },
                requireReceiptsOver: '領収書の必須条件（以上）',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: '領収書を一切必須にしない',
                    always: '常に領収書を必須にする',
                },
                requireItemizedReceiptsOver: '明細付きの領収書を必須にする期間',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: '明細付きレシートを要求しない',
                    always: '常に明細付きの領収書を必須にする',
                },
                defaultTaxRate: 'デフォルト税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動してワークフローを有効にし、承認を追加してこの機能を有効化してください。`,
            },
            customRules: {
                title: '経費ポリシー',
                cardSubtitle: 'ここではチームの経費ポリシーを管理し、何が対象かをメンバー全員で共通認識にできます。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '回収',
                    description: '業務プロセスを自動化したいチーム向け。',
                },
                corporate: {
                    label: 'コントロール',
                    description: '高度な要件を持つ組織向け。',
                },
            },
            description: '自分に合ったプランをお選びください。機能と料金の詳しい一覧は、こちらのページをご覧ください',
            subscriptionLink: 'プランの種類と料金に関するヘルプページ',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `${annualSubscriptionEndDate} まで、Control プランでアクティブメンバー 1 名にコミットしています。${annualSubscriptionEndDate} 以降は、自動更新を無効にすることで、従量課金制サブスクリプションに切り替え、Collect プランへダウングレードできます。`,
                other: `年額サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランでアクティブメンバー${count}人分にコミットしています。${annualSubscriptionEndDate}以降は、自動更新をオフにすることで、従量課金サブスクリプションに切り替え、Collectプランへダウングレードできます。`,
            }),
            subscriptions: 'サブスクリプション',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: 'あなたの偉大な活躍への道を切り開くお手伝いをします！',
        description: '以下のサポートオプションから選択してください。',
        chatWithConcierge: 'Conciergeにチャットする',
        scheduleSetupCall: 'セットアップ通話を予約',
        scheduleACall: '通話を予約',
        questionMarkButtonTooltip: '弊社チームにサポートを依頼する',
        exploreHelpDocs: 'ヘルプドキュメントを閲覧',
        registerForWebinar: 'ウェビナーに登録',
        onboardingHelp: 'オンボーディングヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更',
        headers: {
            frequentlyUsed: 'よく使う',
            smileysAndEmotion: 'スマイリーと感情',
            peopleAndBody: '人と体',
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
        visibility: '表示設定',
        restrictedDescription: 'ワークスペース内のメンバーがこのルームを見つけられます',
        privateDescription: 'このルームに招待された人は、このルームを見つけることができます',
        publicDescription: '誰でもこのルームを見つけることができます',
        public_announceDescription: '誰でもこのルームを見つけることができます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前のルームはすでに存在します',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} はすべてのワークスペースで使用されるデフォルトのルーム名です。別の名前を選択してください。`,
        roomNameInvalidError: 'ルーム名に使用できるのは、小文字の英字、数字、ハイフンのみです',
        pleaseEnterRoomName: 'ルーム名を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}は「${newName}」（以前は「${oldName}」）に名前を変更しました` : `${actor}がこのルーム名を「${newName}」（以前は「${oldName}」）に変更しました`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `ルーム名を${newName}に変更しました`,
        social: 'ソーシャル',
        selectAWorkspace: 'ワークスペースを選択',
        growlMessageOnRenameError: 'ワークスペースルームの名前を変更できません。接続状況を確認して、もう一度お試しください。',
        visibilityOptions: {
            restricted: 'ワークスペース',
            private: '非公開',
            public: '公開',
            public_announce: '公開アナウンス',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '送信して閉じる',
        submitAndApprove: '送信して承認',
        advanced: '詳細設定',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `デフォルトのビジネス銀行口座を「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」に設定する`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `既定のビジネス銀行口座「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」を削除しました`,
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
            `既定のビジネス銀行口座を「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」（以前は「${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}」）に変更しました`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `会社住所を「${newAddress}」（以前は「${previousAddress}」）に変更しました` : `会社住所を「${newAddress}」に設定する`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `${field}「${name}」の承認者として${approverName}（${approverEmail}）を追加しました`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
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
            return `「${categoryName}」カテゴリの給与コードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」にGLコード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」からGLコード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリのGLコードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `「${categoryName}」カテゴリの説明を${!oldValue ? '必須' : '必須ではありません'}に変更しました（以前は${!oldValue ? '必須ではありません' : '必須'}）。`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に上限額${newAmount}を追加しました`;
            }
            if (oldAmount && !newAmount) {
                return `カテゴリ「${categoryName}」から最大金額 ${oldAmount} を削除しました`;
            }
            return `「${categoryName}」カテゴリーの上限金額を${newAmount}に変更しました（以前は${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に上限タイプ ${newValue} を追加しました`;
            }
            return `「${categoryName}」カテゴリの上限タイプを${newValue}（以前は${oldValue}）に変更しました`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `領収書を${newValue}に変更してカテゴリ「${categoryName}」を更新しました`;
            }
            return `「${categoryName}」カテゴリを${newValue}に変更しました（以前は${oldValue}）`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `明細付きレシートを${newValue}に変更してカテゴリ「${categoryName}」を更新しました`;
            }
            return `「${categoryName}」カテゴリの項目別レシートを${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `カテゴリ名を「${oldName}」から「${newName}」に変更しました`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明のヒント「${oldValue}」を削除しました`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明ヒント「${newValue}」を追加しました`
                : `「${categoryName}」カテゴリの説明ヒントを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `タグリスト名を「${newName}」に変更しました（以前は「${oldName}」）`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `タグリスト「${tagListName}」でタグ「${oldName}」を「${newName}」に変更しました`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」からタグ「${tagName}」を削除しました`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」からタグ「${count}」件を削除しました`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `${updatedField} を「${oldValue}」から「${newValue}」に変更して、リスト「${tagListName}」のタグ「${tagName}」を更新しました`;
            }
            return `タグリスト「${tagListName}」のタグ「${tagName}」に「${newValue}」という${updatedField}を追加して更新しました`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `${customUnitName} の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '有効' : '無効'} 距離レートの税金追跡`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `新しい「${customUnitName}」レート「${rateName}」を追加しました`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `${customUnitName} の ${updatedField} 「${customUnitRateName}」のレートを「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `距離レート「${customUnitRateName}」の税率を「${oldValue} (${oldTaxPercentage})」から「${newValue} (${newTaxPercentage})」に変更しました`;
            }
            return `距離レート「${customUnitRateName}」に税率「${newValue}（${newTaxPercentage}）」を追加しました`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `距離レート「${customUnitRateName}」の税還付可能部分を「${newValue}」（以前は「${oldValue}」）に変更しました`;
            }
            return `距離単価「${customUnitRateName}」に税金還付対象額「${newValue}」を追加しました`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? '有効' : '無効'} の ${customUnitName} レート「${customUnitRateName}」`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `「${customUnitName}」レート「${rateName}」を削除しました`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType} レポートフィールド「${fieldName}」を追加しました`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `レポートフィールド「${fieldName}」の既定値を「${defaultValue}」に設定`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポート項目「${fieldName}」にオプション「${optionName}」を追加しました`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `レポート項目「${fieldName}」のオプション「${optionName}」${optionEnabled ? '有効' : '無効'}`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のすべてのオプション`;
            }
            return `レポートフィールド「${fieldName}」のオプション「${optionName}」を${allEnabled ? '有効' : '無効'}し、すべてのオプションを${allEnabled ? '有効' : '無効'}にしました`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType}レポートフィールド「${fieldName}」を削除しました`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `「自分で承認を防止」を「${newValue === 'true' ? '有効' : '無効'}」（以前は「${oldValue === 'true' ? '有効' : '無効'}」）に更新しました`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定する`;
            }
            return `月次レポートの提出日を「${newValue}」（以前は「${oldValue}」）に更新しました`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `「経費のクライアントへの再請求」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「現金経費のデフォルト」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `「デフォルトのレポートタイトルを適用」を有効にしました ${value ? 'オン' : 'オフ'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `カスタムレポート名の数式を「${newValue}」に変更しました（以前は「${oldValue}」）`,
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
                one: `${joinedNames} さんの承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続き受信トレイで承認可能な状態のまま残ります。`,
                other: `${joinedNames}さんの承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続きあなたの受信トレイで承認可能な状態のままです。`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `${policyName} でのあなたのロールを ${oldRole} からユーザーに更新しました。あなた自身のものを除き、すべての申請者経費チャットから削除されました。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `デフォルト通貨を${newCurrency}（以前は${oldCurrency}）に更新しました`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `自動レポート頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを「${newValue}」（以前は「${oldValue}」）に更新しました`,
        upgradedWorkspace: 'このワークスペースを Control プランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳細は<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をクリックしてください。`,
        downgradedWorkspace: 'このワークスペースをCollectプランにダウングレードしました',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `手動承認にランダムに回付されるレポートの割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `すべての経費の手動承認上限を${newLimit}（以前は${oldLimit}）に変更しました`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? '有効' : '無効'} 件のカテゴリ`;
                case 'tags':
                    return `${enabled ? '有効' : '無効'} 個のタグ`;
                case 'workflows':
                    return `${enabled ? '有効' : '無効'} 件のワークフロー`;
                case 'distance rates':
                    return `${enabled ? '有効' : '無効'} 距離レート`;
                case 'accounting':
                    return `${enabled ? '有効' : '無効'} 会計`;
                case 'Expensify Cards':
                    return `${enabled ? '有効' : '無効'} Expensifyカード`;
                case 'company cards':
                    return `${enabled ? '有効' : '無効'} 件の法人カード`;
                case 'invoicing':
                    return `${enabled ? '有効' : '無効'} の請求書作成`;
                case 'per diem':
                    return `${enabled ? '有効' : '無効'} 日当`;
                case 'receipt partners':
                    return `${enabled ? '有効' : '無効'} 件の領収書パートナー`;
                case 'rules':
                    return `${enabled ? '有効' : '無効'} 件のルール`;
                case 'tax tracking':
                    return `${enabled ? '有効' : '無効'} 税金の追跡`;
                default:
                    return `${enabled ? '有効' : '無効'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 出席者の追跡`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 件の自動支払い承認済みレポート`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `自動支払い承認レポートのしきい値を「${newLimit}」に設定する`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `自動支払承認レポートのしきい値を「${newLimit}」（以前は「${oldLimit}」）に変更しました`,
        removedAutoPayApprovedReportsLimit: '自動支払い承認レポートのしきい値を削除しました',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `デフォルトの承認者を${newApprover}に変更しました（以前は${previousApprover}）` : `デフォルトの承認者を${newApprover}に変更しました`,
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
            let text = `${members} の精算書の承認ワークフローを変更し、${approver} に提出するようにしました`;
            if (wasDefaultApprover && previousApprover) {
                text += `（以前のデフォルト承認者 ${previousApprover}）`;
            } else if (wasDefaultApprover) {
                text += '（以前のデフォルト承認者）';
            } else if (previousApprover) {
                text += `（以前は${previousApprover}）`;
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
                ? `${members} の承認ワークフローを変更し、レポートをデフォルト承認者の ${approver} に提出するようにしました`
                : `${members} の承認ワークフローを変更し、レポートをデフォルト承認者に提出するようにしました`;
            if (wasDefaultApprover && previousApprover) {
                text += `（以前のデフォルト承認者 ${previousApprover}）`;
            } else if (wasDefaultApprover) {
                text += '（以前のデフォルト承認者）';
            } else if (previousApprover) {
                text += `（以前は${previousApprover}）`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `${approver} の承認ワークフローを変更し、承認済みレポートを ${forwardsTo} に回付するようにしました（以前は ${previousForwardsTo} に回付）`
                : `${approver} の承認ワークフローを変更し、承認済みレポートを（以前は最終承認済みレポートを）${forwardsTo} に回付するようにしました`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `${approver} の承認ワークフローを変更し、承認済みレポートの転送を停止しました（以前は ${previousForwardsTo} に転送されていました）`
                : `${approver} の承認ワークフローを変更し、承認済みレポートを転送しないようにしました`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書の会社名を「${newValue}」（以前は「${oldValue}」）に変更しました` : `請求書の会社名を「${newValue}」に設定します`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書の会社のウェブサイトを「${newValue}」（以前は「${oldValue}」）に変更しました` : `請求書の会社のウェブサイトを「${newValue}」に設定しました`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `承認済み支払者を「${newReimburser}」（以前は「${previousReimburser}」）に変更しました` : `承認済み支払者を「${newReimburser}」に変更しました`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? '有効' : '無効'} 件の精算`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `「${taxName}」税を追加しました`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `税「${taxName}」を削除しました`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `税「${oldValue}」の名前を「${newValue}」に変更しました`;
                }
                case 'code': {
                    return `「${taxName}」の税コードを「${oldValue}」から「${newValue}」に変更しました`;
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
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `レシート必須金額を「${newValue}」に設定`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `領収書必須額を「${newValue}」に変更しました（以前は「${oldValue}」）`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `必要な領収書金額を削除しました（以前の値は「${oldValue}」）`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費金額を「${newValue}」に設定`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費額を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費金額を削除しました（以前の値：「${oldValue}」）`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費日数を「${newValue}」日に設定`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費期限を「${newValue}」日に変更しました（以前は「${oldValue}」日）`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費期限を削除しました（以前は「${oldValue}」日）`,
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: `このページへのアクセス権がありません。このルームに参加しようとしている場合は、ルームのメンバーに追加を依頼してください。その他のお問い合わせは、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        roomArchived: `このルームはアーカイブされたようです。ご不明な点があれば、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `本当に${memberName}をこのルームから削除しますか？`,
            other: '選択したメンバーをこのルームから削除してもよろしいですか？',
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
            created: ({title}: TaskCreatedActionParams) => `${title}のタスク`,
            completed: '完了としてマーク済み',
            canceled: '削除されたタスク',
            reopened: '未完了としてマーク済み',
            error: 'リクエストされた操作を行う権限がありません',
        },
        markAsComplete: '完了としてマーク',
        markAsIncomplete: '未完了にする',
        assigneeError: 'このタスクの割り当て中にエラーが発生しました。別の担当者をお試しください。',
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。後でもう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを本当に削除しますか？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${year}年${monthName}の明細書`,
    },
    keyboardShortcutsPage: {
        title: 'キーボードショートカット',
        subtitle: '便利なキーボードショートカットで時間を節約しましょう:',
        shortcuts: {
            openShortcutDialog: 'キーボードショートカットのダイアログを開く',
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
        screenShareRequest: 'Expensify が画面共有に招待しています',
    },
    search: {
        resultsAreLimited: '検索結果は制限されています。',
        viewResults: '結果を表示',
        resetFilters: 'フィルターをリセット',
        searchResults: {
            emptyResults: {
                title: '表示するものはありません',
                subtitle: `検索条件を調整するか、+ ボタンで新しく作成してください。`,
            },
            emptyExpenseResults: {
                title: 'まだ経費が作成されていません',
                subtitle: '経費を作成するか、Expensify を試用して詳しく知りましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使って経費を作成してください。',
            },
            emptyReportResults: {
                title: 'まだレポートを作成していません',
                subtitle: 'レポートを作成するか、Expensify を試して詳しく知ろう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使ってレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    まだ請求書を作成していません
                `),
                subtitle: 'Expensify についてもっと知るには、請求書を送信するか、お試し利用をしてみてください。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使って請求書を送信してください。',
            },
            emptyTripResults: {
                title: '表示する出張はありません',
                subtitle: 'まずは、下から最初の出張を予約しましょう。',
                buttonText: '出張を予約',
            },
            emptySubmitResults: {
                title: '提出する経費はありません',
                subtitle: 'すべて完了しました。勝利の周回をどうぞ！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックス度は最大。お見事です！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールしました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ひと息つく時間です。よく頑張りました。',
            },
            emptyStatementsResults: {
                title: '表示できる経費がありません',
                subtitle: '結果が見つかりません。フィルターを調整して再試行してください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックス度は最大。お見事です！',
            },
        },
        columns: '列',
        resetColumns: '列をリセット',
        groupColumns: '列をグループ化',
        expenseColumns: '経費列',
        statements: 'ステートメント',
        unapprovedCash: '未承認の現金',
        unapprovedCard: '未承認のカード',
        reconciliation: '消込',
        topSpenders: '上位支出者',
        saveSearch: '検索を保存',
        deleteSavedSearch: '保存済み検索を削除',
        deleteSavedSearchConfirm: 'この検索を削除してもよろしいですか？',
        searchName: '名前を検索',
        savedSearchesMenuItemTitle: '保存しました',
        topCategories: '人気のカテゴリ',
        topMerchants: '人気の店舗',
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
                before: (date?: string) => `${date ?? ''} より前`,
                after: (date?: string) => `${date ?? ''} の後`,
                on: (date?: string) => `${date ?? ''} に対して`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '決してない',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '先月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '今月',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '年初来累計',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最新の明細書',
                },
            },
            status: 'ステータス',
            keyword: 'キーワード',
            keywords: 'キーワード',
            limit: '上限',
            limitDescription: '検索結果の上限を設定します。',
            currency: '通貨',
            completed: '完了',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} 未満`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} より大きい`,
                between: (greaterThan: string, lessThan: string) => `${greaterThan} 以上 ${lessThan} 未満`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} に等しい`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個別カード',
                closedCards: '解約済みカード',
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
            reimbursable: '精算対象',
            purchaseCurrency: '購入通貨',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'カテゴリー',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: '加盟店',
                [CONST.SEARCH.GROUP_BY.TAG]: 'タグ',
                [CONST.SEARCH.GROUP_BY.MONTH]: '月',
                [CONST.SEARCH.GROUP_BY.WEEK]: '週',
                [CONST.SEARCH.GROUP_BY.YEAR]: '年',
                [CONST.SEARCH.GROUP_BY.QUARTER]: '四半期',
            },
            feed: 'フィード',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify カード',
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
        has: '持っています',
        groupBy: 'グループ化 기준',
        view: {
            label: '表示',
            table: 'テーブル',
            bar: 'バー',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
            [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'エクスポート',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'カテゴリ',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '加盟店',
            [CONST.SEARCH.GROUP_BY.TAG]: 'タグ',
            [CONST.SEARCH.GROUP_BY.MONTH]: '月数',
            [CONST.SEARCH.GROUP_BY.WEEK]: '週',
            [CONST.SEARCH.GROUP_BY.YEAR]: '年数',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '四半期',
        },
        moneyRequestReport: {
            emptyStateTitle: 'このレポートには経費がありません。',
            accessPlaceHolder: '詳細を開く',
        },
        noCategory: 'カテゴリなし',
        noMerchant: '店舗なし',
        noTag: 'タグなし',
        expenseType: '経費タイプ',
        withdrawalType: '出金の種類',
        recentSearches: '最近の検索',
        recentChats: '最近のチャット',
        searchIn: '検索対象',
        searchPlaceholder: '何かを検索',
        suggestions: '提案',
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おっと、アイテムがたくさんありますね！まとめて整理して、まもなくConciergeからファイルをお送りします。',
        },
        exportedTo: 'エクスポート先',
        exportAll: {
            selectAllMatchingItems: '一致する項目をすべて選択',
            allMatchingItemsSelected: '一致する項目をすべて選択済み',
        },
    },
    genericErrorPage: {
        title: 'おっと、問題が発生しました！',
        body: {
            helpTextMobile: 'アプリを一度閉じて再度開くか、または次へ切り替えてください',
            helpTextWeb: 'ウェブ。',
            helpTextConcierge: '問題が解決しない場合は、次に連絡してください:',
        },
        refresh: '再読み込み',
    },
    fileDownload: {
        success: {
            title: 'ダウンロード完了！',
            message: '添付ファイルを正常にダウンロードしました！',
            qrMessage:
                'QRコードのコピーが、写真またはダウンロードフォルダに保存されていないか確認してください。プロのコツ：プレゼンテーションにQRコードを追加して、聴衆がスキャンしてあなたと直接つながれるようにしましょう。',
        },
        generalError: {
            title: '添付エラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージへのアクセス',
            message: 'Expensifyはストレージへのアクセスがないと添付ファイルを保存できません。[設定]をタップして権限を更新してください。',
        },
    },
    settlement: {
        status: {
            pending: '保留中',
            cleared: '決済済み',
            failed: '失敗しました',
        },
        failedError: ({link}: {link: string}) => `<a href="${link}">アカウントのロックを解除</a>すると、この清算を再試行します。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date}・出金ID：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化基準:',
        selectGroupByOption: 'レポート経費のグループ化方法を選択',
        uncategorized: '未分類',
        noTag: 'タグなし',
        selectGroup: ({groupName}: {groupName: string}) => `${groupName} 内のすべての経費を選択`,
        groupBy: {
            category: 'カテゴリー',
            tag: 'タグ',
        },
    },
    report: {
        newReport: {
            createExpense: '経費を作成',
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポート用のワークスペースを選択してください。',
            emptyReportConfirmationTitle: 'すでに空のレポートがあります',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `${workspaceName} で別のレポートを作成してもよろしいですか？ 空のレポートには次からアクセスできます`,
            emptyReportConfirmationPromptLink: 'レポート',
            emptyReportConfirmationDontShowAgain: '今後このメッセージを表示しない',
            genericWorkspaceName: 'このワークスペース',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後で再試行してください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。時間をおいて再試行してください。',
        genericUpdateReportFieldFailureMessage: 'フィールドの更新中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポート名の変更中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
        noActivityYet: 'まだアクティビティがありません',
        connectionSettings: '接続設定',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」（以前は「${oldValue}」）に変更しました`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」に設定`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `ワークスペース${fromPolicyName ? `（以前の名称：${fromPolicyName}）` : ''}を変更しました`;
                    }
                    return `ワークスペースを${toPolicyName}${fromPolicyName ? `（以前の名称：${fromPolicyName}）` : ''}に変更しました`;
                },
                changeType: (oldType: string, newType: string) => `種類を${oldType}から${newType}に変更しました`,
                exportedToCSV: `CSV にエクスポートしました`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `${translatedLabel} にエクスポートしました`;
                    },
                    automaticActionOne: (label: string) => `${label} にエクスポート済み（経由:）`,
                    automaticActionTwo: '会計設定',
                    manual: (label: string) => `このレポートを${label}へ手動でエクスポート済みとしてマークしました。`,
                    automaticActionThree: 'および、次のレコードを正常に作成しました',
                    reimburseableLink: '立替経費',
                    nonReimbursableLink: '会社カード経費',
                    pending: (label: string) => `このレポートの${label}へのエクスポートを開始しました...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `このレポートを${label}にエクスポートできませんでした（「${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}」）`,
                managerAttachReceipt: `領収書を追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `他の場所で${currency}${amount}を支払いました`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `統合機能を通じて${currency}${amount}を支払いました`,
                outdatedBankAccount: `支払者の銀行口座に問題があるため、支払いを処理できませんでした`,
                reimbursementACHBounce: `銀行口座の問題により支払いを処理できませんでした`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払者が銀行口座を変更したため、支払いを処理できませんでした`,
                reimbursementDelayed: `支払いは処理されましたが、さらに1～2営業日遅れています`,
                selectedForRandomAudit: `ランダムに選ばれて審査対象になりました`,
                selectedForRandomAuditMarkdown: `レビュー用に[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)`,
                share: ({to}: ShareParams) => `${to} をメンバーとして招待しました`,
                unshare: ({to}: UnshareParams) => `メンバー ${to} を削除しました`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${currency}${amount} を支払いました`,
                takeControl: `管理権を取得しました`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `${label}${errorMessage ? ` ("${errorMessage}")` : ''}との同期中に問題が発生しました。<a href="${workspaceAccountingLink}">ワークスペース設定</a>で問題を解決してください。`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `${feedName} 接続が中断されています。カードの取り込みを再開するには、<a href='${workspaceCompanyCardRoute}'>銀行にログイン</a>してください。`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `ビジネス銀行口座へのPlaid接続が切れています。Expensifyカードを引き続きご利用いただくために、<a href='${walletRoute}'>銀行口座 ${maskedAccountNumber} を再接続</a>してください。`,
                addEmployee: (email: string, role: string) => `${email} を ${role === 'member' ? 'a' : '1つの'} ${role} として追加しました`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} のロールを ${currentRole} から ${newRole} に更新しました`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド1（以前の値「${previousValue}」）を削除しました`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド1に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド1を「${newValue}」に変更しました（以前は「${previousValue}」でした）`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド 2（以前の値「${previousValue}」）を削除しました`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド2に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド2を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: (email: string, role: string) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} への接続を削除しました`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続しました`,
                leftTheChat: 'チャットを退出しました',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `ビジネス銀行口座 ${maskedBankAccountNumber} は、払い戻しか Expensify カードの精算のいずれかに問題が発生したため、自動的にロックされました。問題を解決するには、<a href="${linkURL}">ワークスペース設定</a>で修正してください。`,
            },
            error: {
                invalidCredentials: '認証情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${date} までの ${dayCount} ${dayCount === 1 ? '日' : '日数'} の${summary}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date}の${timePeriod}の${summary}`,
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費精算書',
        companyCreditCard: '法人クレジットカード',
        receiptScanningApp: '領収書スキャンアプリ',
        billPay: '請求支払い',
        invoicing: '請求書作成',
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
        getStarted: 'はじめる',
        createAccount: '新しいアカウントを作成',
        logIn: 'ログイン',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'チャット一覧に戻る',
        chatWelcomeMessage: 'チャットの歓迎メッセージ',
        navigatesToChat: 'チャットに移動します',
        newMessageLineIndicator: '新着メッセージ行インジケーター',
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
        deletedExpense: '削除された経費',
        reversedTransaction: '取消済み取引',
        deletedTask: '削除されたタスク',
        hiddenMessage: '非表示メッセージ',
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
        copy: 'URL をコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'フラグが付けられたすべてのメッセージは、モデレーターに送信されて確認されます。',
        chooseAReason: 'フラグを付ける理由を以下から選択してください：',
        spam: 'スパム',
        spamDescription: '関係のない迷惑な宣伝',
        inconsiderate: '思いやりがない',
        inconsiderateDescription: '侮辱的または無礼な表現であり、意図に疑わしい点がある',
        intimidation: '脅し',
        intimidationDescription: '妥当な異議があるにもかかわらず、強引に自分の議題を推し進めること',
        bullying: 'いじめ',
        bullyingDescription: '服従を得るために個人を標的にすること',
        harassment: '嫌がらせ',
        harassmentDescription: '人種差別的、女性蔑視的、またはその他の広範な差別的な行為',
        assault: '暴行',
        assaultDescription: '害意を持って行われる、特定の相手を狙った感情的な攻撃',
        flaggedContent: 'このメッセージはコミュニティ規約違反としてフラグが立てられたため、内容が非表示になっています。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告が送信され、このメッセージは審査のために報告されます。',
        levelTwoResult: 'メッセージはチャンネルから非表示になり、匿名の警告が送信され、メッセージはレビューのために報告されます。',
        levelThreeResult: 'メッセージはチャンネルから削除され、匿名の警告が送信され、メッセージはレビュー対象として報告されます。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '経費の提出を依頼',
        inviteToChat: 'チャットの招待のみ',
        nothing: '何もしない',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '承認',
        decline: '拒否',
    },
    actionableMentionTrackExpense: {
        submit: '誰かに提出する',
        categorize: '仕分けする',
        share: '私の会計士と共有する',
        nothing: '今のところ何もありません',
    },
    teachersUnitePage: {
        teachersUnite: '教師団結',
        joinExpensifyOrg:
            'Expensify.org に参加して、世界中の不公平をなくしましょう。現在実施中の「Teachers Unite（教師団結）」キャンペーンでは、必要不可欠な学用品の費用を分担することで、あらゆる地域の教育者を支援しています。',
        iKnowATeacher: '私は先生を知っています',
        iAmATeacher: '私は教師です',
        getInTouch: '素晴らしいですね！その方々の情報を共有していただければ、こちらからご連絡いたします。',
        introSchoolPrincipal: 'あなたの校長先生の紹介',
        schoolPrincipalVerifyExpense:
            'Expensify.org は、低所得世帯の生徒がより良い学習体験を得られるよう、必需の学用品にかかる費用を分担します。あなたの経費は、校長に確認してもらう必要があります。',
        principalFirstName: '代表者の名',
        principalLastName: '代表者の姓',
        principalWorkEmail: '主な勤務先メールアドレス',
        updateYourEmail: 'メールアドレスを更新',
        updateEmail: 'メールアドレスを更新',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `先に進む前に、学校のメールアドレスを既定の連絡方法として設定してください。設定 ＞ プロフィール ＞ <a href="${contactMethodsRoute}">連絡方法</a> から行えます。`,
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
        addStop: '停留所を追加',
        deleteWaypoint: 'ウェイポイントを削除',
        deleteWaypointConfirmation: 'このウェイポイントを削除してもよろしいですか？',
        address: '住所',
        waypointDescription: {
            start: '開始',
            stop: '停止',
        },
        mapPending: {
            title: 'マッピング保留中',
            subtitle: 'オンラインに戻ると地図が生成されます',
            onlineSubtitle: '地図を設定しています。少々お待ちください',
            errorTitle: '地図エラー',
            errorSubtitle: '地図の読み込み中にエラーが発生しました。もう一度お試しください。',
        },
        error: {
            selectSuggestedAddress: '候補の住所を選択するか、現在地を使用してください',
        },
        odometer: {
            startReading: '読み始める',
            endReading: '読み終える',
            saveForLater: '後で保存',
            totalDistance: '総走行距離',
        },
    },
    gps: {
        disclaimer: 'GPSを使って移動履歴から経費を作成します。追跡を開始するには、下の「開始」をタップしてください。',
        error: {
            failedToStart: '位置情報の追跡を開始できませんでした。',
            failedToGetPermissions: '必要な位置情報の権限を取得できませんでした。',
        },
        trackingDistance: '距離を計測しています…',
        stopped: '停止済み',
        start: '開始',
        stop: '停止',
        discard: '破棄',
        stopGpsTrackingModal: {
            title: 'GPS追跡を停止',
            prompt: 'よろしいですか？現在の操作が終了します。',
            cancel: '追跡を再開',
            confirm: 'GPS追跡を停止',
        },
        discardDistanceTrackingModal: {
            title: '距離の追跡を破棄',
            prompt: 'よろしいですか？現在の行程は破棄され、元に戻すことはできません。',
            confirm: '距離の追跡を破棄',
        },
        zeroDistanceTripModal: {
            title: '経費を作成できません',
            prompt: '開始地点と終了地点が同じ経費は作成できません。',
        },
        locationRequiredModal: {
            title: '位置情報へのアクセスが必要です',
            prompt: 'GPSで距離の追跡を開始するには、デバイスの設定で位置情報へのアクセスを許可してください。',
            allow: '許可',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'バックグラウンド位置情報へのアクセスが必要です',
            prompt: 'GPS の距離計測を開始するには、端末の設定でバックグラウンド位置情報アクセス（「常に許可」オプション）を有効にしてください。',
        },
        preciseLocationRequiredModal: {
            title: '正確な位置情報が必要です',
            prompt: 'GPSで距離を追跡するには、端末の設定で「正確な位置情報」を有効にしてください。',
        },
        desktop: {
            title: '携帯電話で距離を記録',
            subtitle: 'GPSでマイルまたはキロメートルを自動記録し、移動をすぐに経費に変換できます。',
            button: 'アプリをダウンロード',
        },
        notification: {
            title: 'GPS追跡を実行中',
            body: 'アプリに移動して完了する',
        },
        continueGpsTripModal: {
            title: 'GPSによる移動記録を続けますか？',
            prompt: '前回のGPS走行中にアプリが終了したようです。その走行の記録を再開しますか？',
            confirm: '旅行を続ける',
            cancel: '出張を表示',
        },
        signOutWarningTripInProgress: {
            title: 'GPS追跡を実行中',
            prompt: '旅程を破棄してサインアウトしてもよろしいですか？',
            confirm: '破棄してサインアウト',
        },
        locationServicesRequiredModal: {
            title: '位置情報へのアクセスが必要です',
            confirm: '設定を開く',
            prompt: 'GPSで距離の追跡を開始するには、デバイスの設定で位置情報へのアクセスを許可してください。',
        },
        fabGpsTripExplained: 'GPS画面へ移動（フローティングアクション）',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'レポートカードの紛失または破損',
        nextButtonLabel: '次へ',
        reasonTitle: '新しいカードが必要な理由を教えてください。',
        cardDamaged: 'カードが破損しました',
        cardLostOrStolen: 'カードを紛失した、または盗まれた',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは2～3営業日以内に到着します。現在お使いのカードは、新しいカードを有効化するまで引き続きご利用いただけます。',
        cardLostOrStolenInfo: '現在お使いのカードは、ご注文が確定するとすぐに永久的に無効化されます。ほとんどのカードは、数営業日以内に届きます。',
        address: '住所',
        deactivateCardButton: 'カードを無効化',
        shipNewCardButton: '新しいカードを発送',
        addressError: '住所は必須です',
        reasonError: '理由は必須です',
        successTitle: '新しいカードをお届け中です！',
        successDescription: '数営業日でカードが届いたら、有効化する必要があります。その間はバーチャルカードをご利用いただけます。',
    },
    eReceipt: {
        guaranteed: '保証付き電子レシート',
        transactionDate: '取引日',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを開始し、<success><strong>友達を紹介</strong></success>しましょう。',
            header: 'チャットを開始、友達を紹介',
            body: '友だちにもExpensifyを使ってほしいですか？チャットを始めるだけで、あとはおまかせください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を提出し、<success><strong>チームを紹介しましょう</strong></success>。',
            header: '経費を送信し、チームを紹介しましょう',
            body: 'あなたのチームにもExpensifyを使ってほしいですか？そのチームに経費を提出するだけで、あとはすべてお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友達を紹介',
            body: '友だちにもExpensifyを使ってもらいませんか？チャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてお任せください。招待リンクをシェアするだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友達を紹介',
            header: '友達を紹介',
            body: '友だちにもExpensifyを使ってもらいませんか？チャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてお任せください。招待リンクをシェアするだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `ヘルプが必要な場合は、<a href="${href}">${adminReportName}</a> でセットアップ担当者とチャットしましょう`,
        default: `セットアップについては、<concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> にメッセージを送信してサポートを受けてください`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必須です',
        autoReportedRejectedExpense: 'この経費は却下されました。',
        billableExpense: '請求可能の状態は無効になりました',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        categoryOutOfPolicy: 'カテゴリが無効になりました',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% の為替手数料を適用しました`,
        customUnitOutOfPolicy: 'このワークスペースでは有効でないレートです',
        duplicatedTransaction: '重複の可能性',
        fieldRequired: 'レポートの項目は必須です',
        futureDate: '未来の日付は使用できません',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `マークアップ率：${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `日付が${maxAge}日より前です`,
        missingCategory: 'カテゴリがありません',
        missingComment: '選択したカテゴリには説明が必要です',
        missingAttendees: 'このカテゴリには複数の参加者が必要です',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'タグ'} が見つかりません`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '金額が計算された距離と一致しません';
                case 'card':
                    return '金額がカード取引額を超えています';
                default:
                    if (displayPercentVariance) {
                        return `金額がスキャンしたレシートより${displayPercentVariance}%多くなっています`;
                    }
                    return 'スキャンした領収書の金額を上回っています';
            }
        },
        modifiedDate: '日付がスキャンされたレシートと異なります',
        nonExpensiworksExpense: 'Expensiworks 以外の経費',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `経費が自動承認上限額 ${formattedLimit} を超えています`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `1人あたりカテゴリ上限 ${formattedLimit} を超過した金額`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限 ${formattedLimit} を超えた金額`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `${formattedLimit}/出張あたりの上限超過額`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限 ${formattedLimit} を超えた金額`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `1人あたりの1日上限${formattedLimit}を超過したカテゴリ金額`,
        receiptNotSmartScanned: '領収書と経費の詳細が手動で追加されました。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `領収書が必要です（カテゴリ上限 ${formattedLimit} 超過）`;
            }
            if (formattedLimit) {
                return `${formattedLimit}を超える金額には領収書が必要です`;
            }
            if (category) {
                return `カテゴリ上限超過のため領収書が必要`;
            }
            return 'レシートが必要です';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `明細付き領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = '禁止経費：';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `アルコール`;
                    case 'gambling':
                        return `ギャンブル`;
                    case 'tobacco':
                        return `たばこ`;
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
                return '銀行連携の問題により、領収書を自動照合できません';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行接続が切断されました。<a href="${companyCardPageURL}">レシートと照合するために再接続</a>`
                    : '銀行接続が切れています。管理者に依頼して再接続し、領収書と照合してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member} に現金としてマークするよう依頼するか、7日待ってからもう一度お試しください` : 'カード取引との統合待ちです。';
            }
            return '';
        },
        brokenConnection530Error: '銀行連携の不具合により領収書が保留されています',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の不具合により領収書が保留されています。<a href="${workspaceCompanyCardRoute}">法人カード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行連携の不具合により、領収書が保留されています。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いを依頼します。',
        smartscanFailed: ({canEdit = true}) => `レシートのスキャンに失敗しました。${canEdit ? '詳細を手動で入力してください。' : ''}`,
        receiptGeneratedWithAI: 'AIが生成した可能性のあるレシート',
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
        descriptionToKeep: '保持する説明を選択してください',
        categoryToKeep: '残すカテゴリを選択',
        isTransactionBillable: '取引が請求可能かどうかを選択',
        keepThisOne: 'これは残す',
        confirmDetails: `保持する詳細を確認してください`,
        confirmDuplicatesInfo: `保持しない重複分は、提出者が削除できるように保留されます。`,
        hold: 'この経費は保留されています',
        resolvedDuplicates: '重複を解消しました',
        companyCardRequired: '会社カードでの支払いが必須です',
        noRoute: '有効な住所を選択してください',
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
            manual: '重複を解消しました',
        },
    },
    videoPlayer: {
        play: '再生',
        pause: '一時停止',
        fullscreen: '全画面表示',
        playbackSpeed: '再生速度',
        expand: '展開',
        mute: 'ミュート',
        unmute: 'ミュート解除',
        normal: '標準',
    },
    exitSurvey: {
        header: 'ご利用の前に',
        reasonPage: {
            title: '退会理由をお聞かせください',
            subtitle: 'その前に、Expensify Classic へ切り替えたい理由を教えてください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic でのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'New Expensify の使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensify の使い方は理解していますが、Expensify Classic のほうが好みです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensify にまだない、必要な機能は何ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしていますか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜExpensify Classicを好むのですか？',
        },
        responsePlaceholder: 'あなたの回答',
        thankYou: 'フィードバックをありがとうございます！',
        thankYouSubtitle: 'いただいたご回答は、より仕事がはかどるプロダクトづくりに役立てます。ご協力いただきありがとうございます。',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
        offlineTitle: 'ここで行き詰まってしまったようです…',
        offline:
            'オフラインのようです。残念ながら、Expensify Classic はオフラインでは動作しませんが、新しい Expensify はオフラインでもご利用いただけます。Expensify Classic を利用したい場合は、インターネットに接続してから再度お試しください。',
        quickTip: 'クイックヒント…',
        quickTipSubTitle: 'expensify.com にアクセスすると、直接 Expensify Classic を利用できます。簡単に開けるようにブックマークしておきましょう！',
        bookACall: '通話を予約',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費やレポートでのダイレクトチャット',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルであらゆる操作が可能',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードで出張と経費精算',
        },
        bookACallTextTop: 'Expensify Classic に切り替えると、次の点が利用できなくなります。',
        bookACallTextBottom: 'ぜひお電話で理由をお伺いしたいと思っています。お客様のご要望についてご相談いただけるよう、上級プロダクトマネージャーとの通話を予約できます。',
        takeMeToExpensifyClassic: 'Expensify Classic に移動',
    },
    listBoundary: {
        errorMessage: 'さらにメッセージを読み込む際にエラーが発生しました',
        tryAgain: '再試行する',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引に領収書を照合しました',
    },
    subscription: {
        authenticatePaymentCard: '支払カードを認証する',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションを変更できません。',
        badge: {
            freeTrial: (numOfDays: number) => `無料トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 日`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `お気に入りの機能をすべて引き続き利用するには、${date} までにお支払いカードを更新してください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `${date} の ${purchaseAmountOwed} の請求は処理できませんでした。未払い金額を清算するために支払いカードを追加してください。`
                        : '未払い金額を精算するために、支払いカードを追加してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `お支払いの期日を過ぎています。サービス中断を防ぐため、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払いの期限が過ぎています。請求書をお支払いください。',
            },
            billingDisputePending: {
                title: 'カードを請求できませんでした',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `カード番号末尾が${cardEnding}のカードに対する${amountOwed}の請求に異議が申し立てられました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お支払いカードが完全に認証されていません。',
                subtitle: (cardEnding: string) => `末尾が${cardEnding}の支払いカードを有効化するには、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'カードを請求できませんでした',
                subtitle: (amountOwed: number) =>
                    `残高不足のため、お支払いカードが承認されませんでした。${amountOwed} の未払い残高を清算するには、再度お試しいただくか、新しいお支払いカードを追加してください。`,
            },
            cardExpired: {
                title: 'カードを請求できませんでした',
                subtitle: (amountOwed: number) => `お支払いカードの有効期限が切れました。未払い残高 ${amountOwed} を清算するため、新しいお支払いカードを追加してください。`,
            },
            cardExpireSoon: {
                title: 'カードの有効期限がまもなく切れます',
                subtitle: 'ご利用の支払いカードは今月末で有効期限が切れます。下の三点リーダーメニューをクリックしてカード情報を更新し、お気に入りの機能を引き続きご利用ください。',
            },
            retryBillingSuccess: {
                title: '成功しました！',
                subtitle: 'カードへの請求が正常に完了しました。',
            },
            retryBillingError: {
                title: 'カードを請求できませんでした',
                subtitle: '再試行する前に、Expensifyからの請求を承認し、保留を解除するよう銀行に直接連絡してください。難しい場合は、別の支払いカードを追加してみてください。',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `カード番号末尾が${cardEnding}のカードに対する${amountOwed}の請求に異議が申し立てられました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitle: '次のステップとして、チームが経費精算を開始できるように、<a href="#">セットアップチェックリストを完了してください</a>。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 日！`,
                subtitle: 'お気に入りの機能をすべて使い続けるには、支払い用カードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルは終了しました',
                subtitle: 'お気に入りの機能をすべて使い続けるには、支払い用カードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: '特典を受け取る',
                subscriptionPageTitle: (discountType: number) => `<strong>初年度${discountType}%割引！</strong> 支払いカードを追加して、年額サブスクリプションを開始しましょう。`,
                onboardingChatTitle: (discountType: number) => `期間限定オファー：初年度が${discountType}%オフ！`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `${days > 0 ? `${days}日：` : ''}${hours}時間以内に請求：${minutes}分：${seconds}秒`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensify サブスクリプションのお支払い用カードを追加してください。',
            addCardButton: '支払カードを追加',
            cardInfo: (name: string, expiration: string, currency: string) => `名前: ${name}, 有効期限: ${expiration}, 通貨: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `次回のお支払い日は${nextPaymentDate}です。`,
            cardEnding: (cardNumber: string) => `末尾が${cardNumber}のカード`,
            changeCard: '支払カードを変更',
            changeCurrency: '支払通貨を変更',
            cardNotFound: '支払いカードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証',
            requestRefund: '返金をリクエスト',
            requestRefundModal: {
                full: '払い戻しは簡単です。次回の請求日の前にアカウントをダウングレードすれば、払い戻しを受け取ることができます。<br /> <br /> 注意：アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合はいつでも新しいワークスペースを作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'ご利用のプラン',
            exploreAllPlans: 'すべてのプランを表示',
            customPricing: 'カスタム料金',
            asLowAs: ({price}: YourPlanPriceValueParams) => `アクティブメンバー1人あたり月額${price}〜`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `月額メンバー1人あたり${price}`,
            perMemberMonth: 'メンバー1人あたり／月',
            collect: {
                title: '回収',
                description: '経費、出張、チャットをすべて備えたスモールビジネス向けプラン。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                benefit1: 'レシートのスキャン',
                benefit2: '償還',
                benefit3: '法人カード管理',
                benefit4: '経費および出張の承認',
                benefit5: '出張予約と規定',
                benefit6: 'QuickBooks/Xero 連携',
                benefit7: '経費、レポート、ルームでチャット',
                benefit8: 'AI と人によるサポート',
            },
            control: {
                title: 'コントロール',
                description: '大規模な企業向けの経費、出張、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Cardありのアクティブメンバーは${lower}から、Expensify Cardなしのアクティブメンバーは${upper}から。`,
                benefit1: 'Collect プランのすべての内容',
                benefit2: '多段階承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP統合（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人事システム連携（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタムインサイトとレポート作成',
                benefit8: '予算管理',
            },
            thisIsYourCurrentPlan: 'これは現在ご利用中のプランです',
            downgrade: 'Collect へダウングレード',
            upgrade: 'Control にアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensify Card で節約',
            saveWithExpensifyDescription: 'Expensify CardのキャッシュバックがExpensifyの請求額をどれだけ削減できるか、当社の節約額計算ツールで確認しましょう。',
            saveWithExpensifyButton: '詳しく見る',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>あなたに最適なプランで、必要な機能を利用しましょう。各プランの機能比較については、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。</muted-text>`,
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年額サブスクリプション',
            taxExempt: '非課税ステータスを申請',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '非課税ステータス',
            payPerUse: '従量課金',
            subscriptionSize: 'サブスクリプションのサイズ',
            headsUp:
                'お知らせ：今すぐサブスクリプションの人数を設定しない場合、初月のアクティブメンバー数に自動的に設定されます。その場合、今後12か月間は少なくともその人数分のメンバー料金のお支払いが必要になります。サブスクリプションの人数はいつでも増やせますが、サブスクリプション期間が終了するまで減らすことはできません。',
            zeroCommitment: '割引された年額サブスクリプション料金でも契約の縛りは一切なし',
        },
        subscriptionSize: {
            title: 'サブスクリプションのサイズ',
            yourSize: 'サブスクリプションの規模は、ある月に有効なメンバーが利用できる空き席の数を指します。',
            eachMonth:
                '毎月、ご契約のサブスクリプションは、上で設定された人数分までのアクティブメンバーを対象とします。サブスクリプションの人数枠を増やすと、その新しい人数で新たに12か月間のサブスクリプションが開始されます。',
            note: '注意：アクティブメンバーとは、あなたの会社のワークスペースに紐づく経費データを作成、編集、提出、承認、精算、またはエクスポートしたことのある人を指します。',
            confirmDetails: '新しい年間サブスクリプションの詳細を確認してください：',
            subscriptionSize: 'サブスクリプションのサイズ',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} アクティブメンバー/月`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年額サブスクリプションの期間中はダウングレードできません。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `すでに、${date} までの間、月あたり ${size} 名のアクティブメンバーという年間サブスクリプションにコミットしています。自動更新を無効にすると、${date} から従量課金制のサブスクリプションに切り替えることができます。`,
            error: {
                size: '有効なサブスクリプション規模を入力してください',
                sameSize: '現在のサブスクリプション数とは異なる数字を入力してください',
            },
        },
        paymentCard: {
            addPaymentCard: '支払カードを追加',
            enterPaymentCardDetails: '支払いカードの詳細を入力してください',
            security: 'Expensify は PCI-DSS に準拠しており、銀行レベルの暗号化を使用し、冗長構成のインフラストラクチャでお客様のデータを保護します。',
            learnMoreAboutSecurity: '当社のセキュリティについて詳しく見る',
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `サブスクリプションの種類: ${subscriptionType}, サブスクリプションの規模: ${subscriptionSize}, 自動更新: ${autoRenew}, 年間席数の自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年額',
            autoRenew: '自動更新',
            autoIncrease: '年間シート数を自動増加',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `アクティブメンバー1人あたり月最大${amountWithCurrency}節約`,
            automaticallyIncrease:
                'アクティブメンバー数が現在の契約席数を超えた場合に、年間席数を自動的に増やします。注：この設定を有効にすると、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensify の改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `更新日：${date}`,
            pricingConfiguration: '料金は構成によって異なります。最も安くご利用いただくには、年額サブスクリプションを選択し、Expensify Card を取得してください。',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>詳しくは<a href="${CONST.PRICING}">料金ページ</a>をご覧いただくか、${hasAdminsRoom ? `<a href="adminsRoom">#admins ルーム。</a>` : '#admins ルーム'}で弊社チームにチャットでお問い合わせください</muted-text>`,
            estimatedPrice: '見積価格',
            changesBasedOn: 'これは、Expensify Card の利用状況と、以下のサブスクリプションオプションによって変わります。',
        },
        requestEarlyCancellation: {
            title: '早期解約を申請',
            subtitle: '早期解約をリクエストしている主な理由を教えてください。',
            subscriptionCanceled: {
                title: 'サブスクリプションを解約しました',
                subtitle: '年間サブスクリプションは解約されました。',
                info: 'ご利用中のワークスペースを従量課金制で使い続けたい場合は、このままで問題ありません。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `今後のアクティビティや請求を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除</a>する必要があります。ワークスペースを削除すると、その月の暦月内に発生した未精算のアクティビティについて請求される点にご注意ください。`,
            },
            requestSubmitted: {
                title: 'リクエストを送信しました',
                subtitle:
                    'サブスクリプションの解約をご希望とのことをお知らせいただきありがとうございます。現在ご依頼内容を確認しており、まもなく<concierge-link>Concierge</concierge-link>とのチャットを通じてご連絡いたします。',
            },
            acknowledgement: `早期解約をリクエストすることにより、私は、Expensify は Expensify の<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または Expensify と私との間のその他の適用されるサービス契約に基づき、そのようなリクエストに応じる義務を負わず、またそのようなリクエストに応じるかどうかについて Expensify が単独の裁量権を有することを認識し、これに同意します。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖・縮小・買収',
        additionalInfoTitle: 'どのソフトウェアへ移行予定ですか？また、その理由を教えてください。',
        additionalInfoInputLabel: 'あなたの回答',
    },
    roomChangeLog: {
        updateRoomDescription: '部屋の説明を次の内容に設定:',
        clearRoomDescription: '部屋の説明を削除しました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームのアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替える:',
        copilotDelegatedAccess: 'Copilot：代理アクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにする',
        addCopilot: 'コパイロットを追加',
        membersCanAccessYourAccount: '次のメンバーはあなたのアカウントにアクセスできます。',
        youCanAccessTheseAccounts: 'アカウント切り替え機能から、これらのアカウントにアクセスできます。',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'フル';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '制限あり';
                default:
                    return '';
            }
        },
        genericError: 'おっと、問題が発生しました。もう一度お試しください。',
        onBehalfOfMessage: (delegator: string) => `${delegator} の代理として`,
        accessLevel: 'アクセス権限レベル',
        confirmCopilot: '以下でコパイロットを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。フルアクセスと制限付きアクセスのどちらも、コパイロットがすべての会話と経費を閲覧できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '他のメンバーがあなたに代わってアカウント内のすべての操作を行えるようにします。チャット、送信、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'あなたのアカウントで、あなたに代わってほとんどの操作を行うことを、他のメンバーに許可します。ただし、承認、支払い、却下、保留は除きます。';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot を削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'ご本人様であることを確認します',
        enterMagicCode: (contactMethod: string) => `副操縦者を追加するには、${contactMethod} に送信されたマジックコードを入力してください。1〜2分以内に届きます。`,
        enterMagicCodeUpdate: (contactMethod: string) => `コパイロットを更新するために、${contactMethod} に送信されたマジックコードを入力してください。`,
        notAllowed: 'まだ早いですよ…',
        noAccessMessage: dedent(`
            副操縦士としては、このページにアクセスできません。申し訳ありません。
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `${accountOwnerEmail} の<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">コパイロット</a>として、この操作を行う権限がありません。申し訳ありません。`,
        copilotAccess: 'Copilot へのアクセス',
    },
    debug: {
        debug: 'デバッグ',
        details: '詳細',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: 'プレビュー',
        nothingToPreview: 'プレビューするものがありません',
        editJson: 'JSON を編集:',
        preview: 'プレビュー:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} がありません`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `無効なプロパティ: ${propertyName} - 期待される型: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `無効な値です - 期待される値: ${expectedValues}`,
        missingValue: '値がありません',
        createReportAction: 'レポート作成アクション',
        reportAction: 'レポートアクション',
        report: 'レポート',
        transaction: '取引',
        violations: '違反事項',
        transactionViolation: '取引違反',
        hint: 'データの変更はバックエンドに送信されません',
        textFields: 'テキストフィールド',
        numberFields: '数値フィールド',
        booleanFields: 'ブール型フィールド',
        constantFields: '定数フィールド',
        dateTimeFields: 'DateTime フィールド',
        date: '日付',
        time: '時間',
        none: 'なし',
        visibleInLHN: 'LHN に表示',
        GBR: 'GBR',
        RBR: 'RBR',
        true: '真',
        false: 'false',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: '下書きコメントあり',
            hasGBR: 'GBR あり',
            hasRBR: 'RBR あり',
            pinnedByUser: 'メンバーにピン留めされました',
            hasIOUViolations: '立替精算の違反があります',
            hasAddWorkspaceRoomErrors: 'ワークスペースルームの追加エラーがあります',
            isUnread: '未読（集中モード）',
            isArchived: 'アーカイブ済み（最新モード）',
            isSelfDM: '自分へのDM',
            isFocused: '一時的にフォーカスされています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストあり（管理者用ルーム）',
            isUnreadWithMention: '未読（メンションあり）',
            isWaitingForAssigneeToCompleteAction: '担当者のアクション完了を待機しています',
            hasChildReportAwaitingAction: '対応待ちの子レポートがあります',
            hasMissingInvoiceBankAccount: '請求書の銀行口座が未設定',
            hasUnresolvedCardFraudAlert: '未解決のカード不正利用アラートあり',
            hasDEWApproveFailed: 'DEW の承認が失敗しました',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションのデータにエラーがあります',
            hasViolations: '違反があります',
            hasTransactionThreadViolations: '取引スレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '対応が必要なレポートがあります',
            theresAReportWithErrors: 'エラーがあるレポートがあります',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位のエラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題が発生しました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法の確認が必要です',
            theresAProblemWithAPaymentMethod: '支払い方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: '返金口座に問題があります',
            theresABillingProblemWithYourSubscription: 'ご利用中のサブスクリプションに請求上の問題があります',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'サブスクリプションは正常に更新されました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました',
            theresAProblemWithYourWallet: 'ウォレットに問題があります',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: 'New Expensifyへようこそ！',
        subtitle: '従来の使い慣れたエクスペリエンスはそのままに、あなたの生活をさらに楽にする数多くのアップグレードを加えました。',
        confirmText: 'さあ、行こう！',
        helpText: '2分間デモを試す',
        features: {
            search: 'モバイル、ウェブ、デスクトップでさらに強力な検索',
            concierge: '経費処理を自動化するための内蔵Concierge AI',
            chat: 'あらゆる経費でチャットして、疑問をすばやく解決しましょう',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>まずは<strong>こちらから！</strong></tooltip>',
        saveSearchTooltip: '<tooltip>ここで<strong>保存済み検索をリネーム</strong>できます！</tooltip>',
        accountSwitcher: '<tooltip>ここから<strong>Copilotアカウント</strong>にアクセスできます</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>テスト用のレシートをスキャン</strong>して、どのように動作するかを確認しましょう！</tooltip>',
            manager: '<tooltip>お試しには、<strong>テストマネージャー</strong>をお選びください！</tooltip>',
            confirmation: '<tooltip>さあ、<strong>経費を提出</strong>して、魔法が起きるのを見てみましょう！</tooltip>',
            tryItOut: '試してみる',
        },
        outstandingFilter: '<tooltip><strong>承認が必要</strong>な経費を絞り込む</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して\n<strong>試用を完了しましょう！</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS追跡を実行中です！完了したら、下のボタンで追跡を停止してください。</tooltip>',
    },
    discardChangesConfirmation: {
        title: '変更を破棄しますか？',
        body: '行った変更を破棄してもよろしいですか？',
        confirmText: '変更を破棄',
    },
    scheduledCall: {
        book: {
            title: '通話を予約',
            description: 'ご都合のよい時間を見つけてください。',
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> の利用可能な時間</muted-text>`,
        },
        confirmation: {
            title: '通話を確認',
            description: '以下の詳細をご確認ください。通話を確定すると、詳しい情報を記載した招待状をお送りします。',
            setupSpecialist: 'お客様のセットアップ担当',
            meetingLength: '会議の長さ',
            dateTime: '日付と時刻',
            minutes: '30分',
        },
        callScheduled: '通話を予定しました',
    },
    autoSubmitModal: {
        title: 'すべて問題なく送信されました！',
        description: 'すべての警告と違反がクリアされたので、',
        submittedExpensesTitle: 'これらの経費は提出されました',
        submittedExpensesDescription: 'これらの経費は承認者に送信済みですが、承認されるまでは引き続き編集できます。',
        pendingExpensesTitle: '保留中の経費が移動されました',
        pendingExpensesDescription: '保留中のカード経費は、計上されるまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分でお試し運転',
        },
        modal: {
            title: 'お試しで使ってみる',
            description: 'さっとプロダクトツアーを行って、すぐに使いこなせるようになりましょう。',
            confirmText: '試用を開始',
            helpText: 'スキップ',
            employee: {
                description: '<muted-text>チームで<strong>Expensifyを3か月間無料</strong>で使いましょう！以下に上司のメールアドレスを入力して、テスト経費を送信してください。</muted-text>',
                email: '上司のメールアドレスを入力してください',
                error: 'そのメンバーはワークスペースの所有者です。テストする別のメンバーを入力してください。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Expensify を現在お試し利用中です',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: '始める',
        },
        employeeInviteMessage: (name: string) => `# ${name} さんがExpensifyのお試しにあなたを招待しました
やあ！経費精算を最速で行えるExpensifyを*3か月間無料*でお試しできるようにしておいたよ。

仕組みをお見せするための*テスト領収書*はこちらです。`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: 'すべてのデータ - レポートレベル',
        expenseLevelExport: 'すべてのデータ - 経費レベル',
        exportInProgress: 'エクスポートを実行中',
        conciergeWillSend: 'まもなくConciergeからファイルが送信されます。',
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) => `続行する前に、DNS 設定を更新して、<strong>${domainName}</strong> の所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNS プロバイダーにアクセスし、<strong>${domainName}</strong> の DNS 設定を開いてください。`,
            addTXTRecord: '次のTXTレコードを追加してください:',
            saveChanges: '変更を保存し、この画面に戻ってドメインを確認してください。',
            youMayNeedToConsult: `確認を完了するには、組織のIT部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳細はこちら</a>。`,
            warning: '確認が完了すると、あなたのドメイン上のすべての Expensify メンバーに、そのアカウントがあなたのドメイン管理下になることを知らせるメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しいただき、問題が解決しない場合はConciergeまでお問い合わせください。',
        },
        domainVerified: {
            title: 'ドメインを確認済み',
            header: 'やった！ドメインの確認が完了しました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン <strong>${domainName}</strong> は正常に確認されました。これで、SAML やその他のセキュリティ機能を設定できます。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン（SSO）',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーが Expensify にログインする方法を、より細かく管理できるセキュリティ機能です。有効にするには、自分が認証済みの会社管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、簡単にログイン',
            moreSecurityAndControl: 'さらなるセキュリティと管理',
            onePasswordForAnything: 'すべてを一つのパスワードで',
        },
        goToDomain: 'ドメインへ移動',
        samlLogin: {
            title: 'SAMLログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン (SSO)</a> を使用してメンバーのサインインを設定します。</muted-text>`,
            enableSamlLogin: 'SAML ログインを有効にする',
            allowMembers: 'メンバーが SAML でログインできるようにする。',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしているメンバーは、SAML を使用して再認証する必要があります。',
            enableError: 'SAML 有効化設定を更新できませんでした',
            requireError: 'SAML 要件設定を更新できませんでした',
            disableSamlRequired: '必須なSAMLを無効にする',
            oktaWarningPrompt: '本当に実行しますか？Okta SCIM も無効になります。',
            requireWithEmptyMetadataError: '有効にするには、以下にアイデンティティプロバイダーのメタデータを追加してください',
        },
        samlConfigurationDetails: {
            title: 'SAML 設定の詳細',
            subtitle: 'これらの詳細情報を使用して SAML を設定してください。',
            identityProviderMetadata: 'IDプロバイダーのメタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: 'Name ID 形式',
            loginUrl: 'ログインURL',
            acsUrl: 'ACS（Assertion Consumer Service）URL',
            logoutUrl: 'ログアウトURL',
            sloUrl: 'SLO（シングルログアウト）URL',
            serviceProviderMetaData: 'サービスプロバイダーのメタデータ',
            oktaScimToken: 'Okta SCIM トークン',
            revealToken: 'トークンを表示',
            fetchError: 'SAML 設定の詳細を取得できませんでした',
            setMetadataGenericError: 'SAMLメタデータを設定できませんでした',
        },
        accessRestricted: {
            title: 'アクセスが制限されています',
            subtitle: (domainName: string) => `以下の管理を行う必要がある場合は、<strong>${domainName}</strong> の承認済み会社管理者としてご本人確認を行ってください。`,
            companyCardManagement: '会社カード管理',
            accountCreationAndDeletion: 'アカウントの作成と削除',
            workspaceCreation: 'ワークスペースの作成',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'ドメインを追加',
            subtitle: 'アクセスしたいプライベートドメイン名を入力してください（例: expensify.com）。',
            domainName: 'ドメイン名',
            newDomain: '新しいドメイン',
        },
        domainAdded: {
            title: 'ドメインを追加しました',
            description: '次に、ドメインの所有権を確認し、セキュリティ設定を調整する必要があります。',
            configure: '設定',
        },
        enhancedSecurity: {
            title: '強化されたセキュリティ',
            subtitle: '自社ドメインのメンバーにシングルサインオンでのログインを必須にし、ワークスペースの作成を制限するなどの管理ができます。',
            enable: '有効にする',
        },
        domainAdmins: 'ドメイン管理者',
        admins: {
            title: '管理者',
            findAdmin: '管理者を探す',
            primaryContact: '主担当者',
            addPrimaryContact: '主要連絡先を追加',
            setPrimaryContactError: '主要連絡先を設定できません。後でもう一度お試しください。',
            settings: '設定',
            consolidatedDomainBilling: '統合ドメイン請求',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>有効にすると、主な連絡先が<strong>${domainName}</strong>メンバーが所有するすべてのワークスペースの支払いを行い、すべての請求書領収書を受け取ります。</muted-text-label></comment>`,
            consolidatedDomainBillingError: '統合ドメイン請求を変更できませんでした。後でもう一度お試しください。',
            addAdmin: '管理者を追加',
            addAdminError: 'このメンバーを管理者として追加できませんでした。もう一度お試しください。',
            revokeAdminAccess: '管理者アクセスを取り消す',
            cantRevokeAdminAccess: '技術連絡先から管理者アクセス権を取り消すことはできません',
            error: {
                removeAdmin: 'このユーザーを管理者から削除できませんでした。もう一度お試しください。',
                removeDomain: 'このドメインを削除できません。もう一度お試しください。',
                removeDomainNameInvalid: 'リセットするドメイン名を入力してください。',
            },
            resetDomain: 'ドメインをリセット',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `ドメインのリセットを確認するため、<strong>${domainName}</strong> と入力してください。`,
            enterDomainName: 'ここに自分のドメイン名を入力してください',
            resetDomainInfo: `この操作は<strong>完全に削除され、元に戻せません</strong>。次のデータが削除されます：<br/> <ul><li>会社カードの接続および、そのカードからの未報告経費</li> <li>SAML およびグループ設定</li> </ul> すべてのアカウント、ワークスペース、レポート、経費、その他のデータは引き続き保持されます。<br/><br/>注：関連付けられているメールアドレスを<a href="#">連絡方法</a>から削除することで、このドメインをドメイン一覧から消去できます。`,
        },
        members: {
            title: 'メンバー',
            findMember: 'メンバーを検索',
            addMember: 'メンバーを追加',
            email: 'メールアドレス',
            errors: {
                addMember: 'このメンバーを追加できません。もう一度お試しください。',
            },
        },
    },
};
export default translations;
