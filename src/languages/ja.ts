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
        count: '件数',
        cancel: 'キャンセル',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: '閉じる',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: '続行',
        unshare: '共有解除',
        yes: 'はい',
        no: 'いいえ',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: '今はしない',
        noThanks: '結構です',
        learnMore: '詳細はこちら',
        buttonConfirm: '了解しました',
        name: '名前',
        attachment: '添付',
        attachments: '添付ファイル',
        center: '中央揃え',
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
        digits: '桁',
        twoFactorCode: '2要素コード',
        workspaces: 'ワークスペース',
        inbox: '受信トレイ',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: '成功',
        group: 'グループ',
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
        signInWithGoogle: 'Google でサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'でサインイン',
        continue: '続行',
        firstName: '名',
        lastName: '姓',
        scanning: 'スキャン中',
        analyzing: '分析中...',
        addCardTermsOfService: 'Expensify 利用規約',
        perPerson: '1人あたり',
        phone: '電話番号',
        phoneNumber: '電話番号',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'メール',
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
        currentYear: '現在の年',
        currentMonth: '今月',
        ssnLast4: 'SSN の下4桁',
        ssnFull9: 'SSN の9桁すべて',
        addressLine: (lineNumber: number) => `住所行 ${lineNumber}`,
        personalAddress: '個人住所',
        companyAddress: '会社住所',
        noPO: '私書箱や私設私書箱などの住所は使用しないでください。',
        city: '市',
        state: '状態',
        streetAddress: '番地・丁目',
        stateOrProvince: '州 / 県',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: '同意します',
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
        timePrefix: 'これは',
        conjunctionFor: 'のため',
        todayAt: '今日の',
        tomorrowAt: '明日の',
        yesterdayAt: '昨日の',
        conjunctionAt: 'で',
        conjunctionTo: '宛先',
        genericErrorMessage: 'おっと…問題が発生したため、リクエストを完了できませんでした。後でもう一度お試しください。',
        percentage: 'パーセンテージ',
        converted: '変換済み',
        error: {
            invalidAmount: '金額が無効です',
            acceptTerms: '続行するには利用規約に同意する必要があります',
            phoneNumber: `完全な電話番号を入力してください
（例：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: 'このフィールドは必須です',
            requestModified: 'このリクエストは別のメンバーによって変更されています',
            characterLimitExceedCounter: (length: number, limit: number) => `文字数制限を超えています（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '今日以降の日付を選択してください',
            invalidTimeShouldBeFuture: '少なくとも1分後の時刻を選択してください',
            invalidCharacter: '無効な文字',
            enterMerchant: '店舗名を入力してください',
            enterAmount: '金額を入力',
            missingMerchantName: '支払先名がありません',
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
        comma: 'コンマ',
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
        personalBankAccount: '個人銀行口座',
        businessBankAccount: 'ビジネス銀行口座',
        join: '参加',
        leave: '退出',
        decline: '拒否',
        reject: '却下',
        transferBalance: '残高を振替',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: '手動で入力する',
        message: 'メッセージ',
        leaveThread: 'スレッドから退出',
        you: 'あなた',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: 'サポートが必要な場合は、Concierge までお問い合わせください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を利用するには、インターネットに接続している必要があります。',
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
        letsStart: `開始しましょう`,
        showMore: 'さらに表示',
        showLess: '表示を減らす',
        merchant: '加盟店',
        change: '変更',
        category: 'カテゴリ',
        report: 'レポート',
        billable: '請求可能',
        nonBillable: '請求不可',
        tag: 'タグ',
        receipt: '領収書',
        verified: '確認済み',
        replace: '置き換え',
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
        whyDoWeAskForThis: 'なぜこの情報を求めるのですか？',
        required: '必須',
        showing: '表示中',
        of: 'の',
        default: 'デフォルト',
        update: '更新',
        member: 'メンバー',
        auditor: '監査担当者',
        role: '役割',
        currency: '通貨',
        groupCurrency: 'グループ通貨',
        rate: 'レート',
        emptyLHN: {
            title: 'やった！すべて完了しました。',
            subtitleText1: '「～を使ってチャットを検索」',
            subtitleText2: '上のボタンを使用するか、次を使って何かを作成します',
            subtitleText3: '下のボタン',
        },
        businessName: '会社名',
        clear: 'クリア',
        type: '種類',
        reportName: 'レポート名',
        action: 'アクション',
        expenses: '経費',
        totalSpend: '合計支出',
        tax: '税',
        shared: '共有',
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
        longReportID: '長いレポート ID',
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
        import: 'インポートする',
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
        days: '日',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: '時間',
        minuteAbbreviation: 'm',
        skip: 'スキップ',
        chatWithAccountManager: (accountManagerDisplayName: string) => `何か特定のご要望がありますか？アカウントマネージャーの${accountManagerDisplayName}とチャットしましょう。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務用メール',
        destination: '行き先',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: '副レート',
        perDiem: '日当',
        validate: '検証',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSV をダウンロード',
        help: 'ヘルプ',
        expenseReport: '経費精算書',
        expenseReports: '経費精算書',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'ポリシー外レート',
        leaveWorkspace: 'ワークスペースを退出',
        leaveWorkspaceConfirmation: 'このワークスペースを離れると、このワークスペースに経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを離れると、そのレポートや設定を表示できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースを退出すると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、承認ワークフローでは、ワークスペースのオーナーである${workspaceOwner}があなたの代わりを務めます。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、優先エクスポーターとしてのあなたの役割は、ワークスペースのオーナーである ${workspaceOwner} に引き継がれます。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを離れると、技術連絡先としてのあなたの役割は、ワークスペースのオーナーである ${workspaceOwner} に引き継がれます。`,
        leaveWorkspaceReimburser: 'このワークスペースでは払い戻し担当者のため、退出できません。Workspaces ＞ 支払の作成または追跡 で新しい払い戻し担当者を設定し、もう一度お試しください。',
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
        after: '後',
        reschedule: '再スケジュール',
        general: '一般',
        workspacesTabTitle: 'ワークスペース',
        headsUp: 'ご注意ください！',
        submitTo: '送信先',
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
        duplicate: '複製',
        duplicated: '重複',
        exchangeRate: '為替レート',
        reimbursableTotal: '経費精算対象の合計',
        nonReimbursableTotal: '非払い戻し合計',
        originalAmount: '元の金額',
        insights: 'インサイト',
        duplicateExpense: '重複した経費',
        newFeature: '新機能',
    },
    supportalNoAccess: {
        title: 'ちょっと待ってください',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `サポートとしてログインしている場合、この操作を行う権限がありません（コマンド: ${command ?? ''}）。Success がこの操作を行えるべきだと思われる場合は、Slack で会話を開始してください。`,
    },
    lockedAccount: {
        title: 'ロックされたアカウント',
        description: 'このアカウントはロックされているため、この操作を行うことはできません。次の手順については concierge@expensify.com までご連絡ください。',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: '現在地を検出できませんでした。もう一度お試しいただくか、住所を手動で入力してください。',
        permissionDenied: '位置情報へのアクセスが拒否されているようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可',
        tryAgain: 'もう一度お試しください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: 'お気に入りの人たちにいつでもすぐ連絡できるように、電話から連絡先をインポートしましょう。',
        importContactsExplanation: 'お気に入りの人たちに、いつでもワンタップでアクセスできます。',
        importContactsNativeText: 'あと一歩です！連絡先をインポートする許可をしてください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラへのアクセス',
        expensifyDoesNotHaveAccessToCamera: 'カメラへのアクセス権がないと、Expensify は写真を撮影できません。権限を更新するには「設定」をタップしてください。',
        attachmentError: '添付ファイルエラー',
        errorWhileSelectingAttachment: '添付ファイルの選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択中にエラーが発生しました。別のファイルをお試しください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルのサイズが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが 24 MB の上限を超えています',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `添付ファイルのサイズが ${maxUploadSizeInMB} MB の上限を超えています`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイトより大きくなければなりません',
        wrongFileType: '無効なファイル形式',
        notAllowedExtension: 'このファイル形式は許可されていません。別のファイル形式をお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルをお試しください。',
        protectedPDFNotSupported: 'パスワードで保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズが変更されています。フル解像度で表示するにはダウンロードしてください。',
        attachmentImageTooLarge: 'この画像はアップロード前にプレビューするには大きすぎます。',
        tooManyFiles: (fileLimit: number) => `一度にアップロードできるファイルは${fileLimit}件までです。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルが ${maxUploadSizeInMB} MB を超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルは${maxUploadSizeInMB}MB未満である必要があります。これより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度にアップロードできる領収書は最大30枚です。それを超えた分はアップロードされません。',
        unsupportedFileType: (fileType: string) => `${fileType} ファイルはサポートされていません。サポートされているファイル形式のみアップロードされます。`,
        learnMoreAboutSupportedFiles: 'サポートされている形式の詳細はこちらをご覧ください。',
        passwordProtected: 'パスワード保護されたPDFはサポートされていません。サポートされているファイルのみがアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
        addReceipt: '領収書を追加',
        scanReceipts: '領収書をスキャン',
        replaceReceipt: '領収書を置き換える',
    },
    filePicker: {
        fileError: 'ファイルエラー',
        errorWhileSelectingFile: 'ファイルを選択する際にエラーが発生しました。もう一度お試しください。',
    },
    connectionComplete: {
        title: '接続が完了しました',
        supportingText: 'このウィンドウを閉じて、Expensify アプリに戻ってください。',
    },
    avatarCropModal: {
        title: '写真を編集',
        description: '画像をドラッグ、ズーム、回転して、お好みのように調整してください。',
    },
    composer: {
        noExtensionFoundForMimeType: 'この MIME タイプに対応する拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像の取得中に問題が発生しました',
        commentExceededMaxLength: (formattedMaxLength: string) => `コメントの最大文字数は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `タスクタイトルの最大長は${formattedMaxLength}文字です。`,
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
            authenticationSuccessful: '認証成功',
            successfullyAuthenticatedUsing: ({authType}) => `${authType}を使用して正常に認証されました。`,
            troubleshootBiometricsStatus: ({registered}) => `生体認証（${registered ? '登録済み' : '未登録'}）`,
            yourAttemptWasUnsuccessful: '認証試みが失敗しました。',
            youCouldNotBeAuthenticated: '認証できませんでした',
            areYouSureToReject: '本当に拒否しますか？この画面を閉じると認証試みが拒否されます。',
            rejectAuthentication: '認証拒否',
            test: 'テスト',
            biometricsAuthentication: '生体認証',
        },
        pleaseEnableInSystemSettings: {
            start: '',
            link: 'システム設定',
            end: 'で顔/指紋認証を有効にするか、デバイスのパスコードを設定してください。',
        },
        oops: 'おっと、何か問題が発生しました',
        looksLikeYouRanOutOfTime: '時間切れのようです！ 商人で再試行してください。',
        youRanOutOfTime: '時間切れでした',
        letsVerifyItsYou: '本人確認をしましょう',
        verifyYourself: {
            biometrics: '顔または指紋で本人確認をしてください',
        },
        enableQuickVerification: {
            biometrics: '顔または指紋を使用して、パスワードやコード不要の迅速かつ安全な認証を有効にしてください。',
        },
        revoke: {
            revoke: '取り消す',
            title: '顔認証／指紋認証 & パスキー',
            explanation: '1 台以上のデバイスで、顔認証／指紋認証またはパスキー認証が有効になっています。アクセスを取り消すと、次回以降どのデバイスでも認証時にマジックコードが必要になります',
            confirmationPrompt: '本当に実行してもよろしいですか？今後、どのデバイスでの認証にもマジックコードが必要になります',
            cta: 'アクセスを取り消す',
            noDevices: '顔／指紋認証またはパスキー認証用に登録されたデバイスがありません。デバイスを登録すると、そのアクセスをここで取り消せるようになります。',
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
        title: 'こちらがあなたのマジックコードです',
        description: dedent(`
            最初にコードが要求されたデバイスに表示されているコードを入力してください
        `),
        doNotShare: dedent(`
            あなたのコードを誰とも共有しないでください。
            Expensify がそれを求めることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここからサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻り、新しいコードをリクエストしてください',
        successfulNewCodeRequest: 'コードを送信しました。お使いのデバイスを確認してください。',
        tfaRequiredTitle: dedent(`
            2 要素認証
            必須
        `),
        tfaRequiredDescription: dedent(`
            サインインしようとしている端末の
            2 要素認証コードを入力してください。
        `),
        requestOneHere: 'ここからリクエストしてください。',
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
        description: 'このワークスペースでは、あなたの会社がカスタム承認ワークフローを利用しています。この操作は Expensify Classic で行ってください。',
        goToExpensifyClassic: 'Expensify Classic に切り替え',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を提出し、チームを紹介する',
            subtitleText: 'あなたのチームにもExpensifyを使ってほしいですか？そのチームに経費を提出するだけで、あとは私たちにお任せください。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '通話を予約',
    },
    hello: 'こんにちは',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '以下から開始します。',
        anotherLoginPageIsOpen: '別のログインページが開いています。',
        anotherLoginPageIsOpenExplanation: 'ログインページを別のタブで開いています。そのタブからログインしてください。',
        welcome: 'ようこそ！',
        welcomeWithoutExclamation: 'ようこそ',
        phrase2: 'お金がものを言う。そして今、チャットと支払いがひとつの場所にまとまったことで、それも簡単になりました。',
        phrase3: 'あなたの主張を伝える速さと同じくらい、支払いもすぐに届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login} さん、ここで新しいお顔を拝見できてとてもうれしいです！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `${login} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
    },
    login: {
        hero: {
            header: 'チャットのスピードで進む出張と経費管理',
            body: '次世代のExpensifyへようこそ。コンテキストに応じたリアルタイムチャットの力で、出張や経費精算がこれまで以上にスピーディーに進みます。',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでログインを続行:',
        orContinueWithMagicCode: 'マジックコードを使ってサインインすることもできます',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: 'マジックコードを使用',
        launching: '起動中...',
        oneMoment: 'お待ちください。あなたの会社のシングルサインオンポータルにリダイレクトしています。',
    },
    reportActionCompose: {
        dropToUpload: 'ドロップしてアップロード',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何かを書いてください...',
        blockedFromConcierge: '通信は禁止されています',
        fileUploadFailed: 'アップロードに失敗しました。ファイルはサポートされていません。',
        localTime: ({user, time}: LocalTimeParams) => `${user} の${time}`,
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
        onlyVisible: 'にのみ表示',
        explain: '説明する',
        explainMessage: 'これを説明してください。',
        replyInThread: 'スレッドに返信',
        joinThread: 'スレッドに参加',
        leaveThread: 'スレッドから退出',
        copyOnyxData: 'Onyx データをコピー',
        flagAsOffensive: '不適切として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクション:',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> のパーティーに参加し損ねました。ここには何もありません。`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `このチャットは、<strong>${domainRoom}</strong> ドメイン上のすべての Expensify メンバーとのチャットです。 同僚との会話、ヒントの共有、質問に利用してください。`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `このチャットは<strong>${workspaceName}</strong>の管理者とのチャットです。ワークスペースの設定などについて話し合うために使用してください。`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `このチャットは、<strong>${workspaceName}</strong> 内の全員とのチャットです。最も重要なお知らせに使用してください。`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> に関するあらゆる内容のためのものです。`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `このチャットは<strong>${invoicePayer}</strong>と<strong>${invoiceReceiver}</strong>の間の請求書用です。+ ボタンを使って請求書を送信してください。`,
        beginningOfChatHistory: (users: string) => `このチャットは${users}とのチャットです。`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `ここは、<strong>${submitterDisplayName}</strong> が <strong>${workspaceName}</strong> に経費を提出する場所です。+ ボタンを使用してください。`,
        beginningOfChatHistorySelfDM: 'これはあなたの個人スペースです。メモ、タスク、下書き、リマインダーとして使用してください。',
        beginningOfChatHistorySystemDM: 'ようこそ！さっそく設定を始めましょう。',
        chatWithAccountManager: 'ここでアカウントマネージャーとチャットする',
        sayHello: 'こんにちはと言ってください！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `${roomName} へようこそ！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `「＋」ボタンを使って経費を${additionalText}してください。`,
        askConcierge: '質問して、24時間365日リアルタイムのサポートを受けましょう。',
        conciergeSupport: '24時間年中無休サポート',
        create: '作成',
        iouTypes: {
            pay: '支払う',
            split: '分割',
            submit: '提出',
            track: '追跡',
            invoice: '請求書',
        },
    },
    adminOnlyCanPost: 'このルームでメッセージを送信できるのは管理者のみです。',
    reportAction: {
        asCopilot: 'のコパイロットとして',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `選択した頻度では提出できなかった <a href="${reportUrl}">${reportName}</a> のすべての経費をまとめるためにこのレポートを作成しました`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `<a href="${reportUrl}">${reportName}</a> から保留中の経費のためにこのレポートを作成しました`,
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話の全員に通知',
    },
    newMessages: '新しいメッセージ',
    latestMessages: '最新のメッセージ',
    youHaveBeenBanned: '注意：あなたはこのチャンネルでのチャットを禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中...',
        multipleMembers: '複数メンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `${displayName} がアカウントを閉鎖したため、このチャットはこれ以上利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `このチャットは、${oldDisplayName} がアカウントを ${displayName} と統合したため、現在はアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>が${policyName}ワークスペースのメンバーではなくなったため、もう利用できません。`
                : `このチャットは、${displayName} が ${policyName} ワークスペースのメンバーではなくなったため、これ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `${policyName} が有効なワークスペースではなくなったため、このチャットはこれ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `${policyName} が有効なワークスペースではなくなったため、このチャットはこれ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'この予約はアーカイブされています。',
    },
    writeCapabilityPage: {
        label: '投稿できる人',
        writeCapability: {
            all: 'すべてのメンバー',
            admins: '管理者専用',
        },
    },
    sidebarScreen: {
        buttonFind: '何かを検索…',
        buttonMySettings: 'マイ設定',
        fabNewChat: 'チャットを開始',
        fabNewChatExplained: 'アクションメニューを開く',
        fabScanReceiptExplained: '領収書をスキャン',
        chatPinned: 'ピン留めされたチャット',
        draftedMessage: '下書きメッセージ',
        listOfChatMessages: 'チャットメッセージ一覧',
        listOfChats: 'チャット一覧',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
        redirectToExpensifyClassicModal: {
            title: '近日公開予定',
            description: 'お客様の設定に合わせて New Expensify のいくつかの細かな部分を最終調整しているところです。その間は、Expensify Classic をご利用ください。',
        },
    },
    allSettingsScreen: {
        subscription: 'サブスクリプション',
        domains: 'ドメイン',
    },
    tabSelector: {chat: 'チャット', room: '部屋', distance: '距離', manual: '手動', scan: 'スキャン', map: '地図', gps: 'GPS', odometer: 'オドメーター'},
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        import: 'スプレッドシートをインポート',
        dragAndDrop: '<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>ここにスプレッドシートをドラッグ＆ドロップするか、下からファイルを選択してください。サポートされているファイル形式の<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細はこちら</a>をご覧ください。</muted-link>`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされているファイル形式の詳細は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています',
        column: (name: string) => `列 ${name}`,
        fieldNotMapped: (fieldName: string) => `おっと！必須フィールド（「${fieldName}」）がマッピングされていません。確認して、もう一度お試しください。`,
        singleFieldMultipleColumns: (fieldName: string) => `おっと！1 つのフィールド（「${fieldName}」）が複数の列に割り当てられています。内容を確認して、もう一度お試しください。`,
        emptyMappedField: (fieldName: string) => `おっと！フィールド（「${fieldName}」）に 1 つ以上の空の値が含まれています。確認して、もう一度お試しください。`,
        importSuccessfulTitle: 'インポートに成功しました',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories}件のカテゴリーが追加されました。` : 'カテゴリを1件追加しました。'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'メンバーは追加または更新されていません。';
            }
            if (added && updated) {
                return `${added}人のメンバー${added > 1 ? '秒' : ''}を追加、${updated}人のメンバー${updated > 1 ? '秒' : ''}を更新しました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 名のメンバーが更新されました。` : '1人のメンバーが更新されました。';
            }
            return added > 1 ? `${added} 名のメンバーが追加されました。` : '1名のメンバーが追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} 個のタグを追加しました。` : 'タグが 1 件追加されました。'),
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates}件の日当レートが追加されました。` : '1件の日当レートが追加されました。'),
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべての項目が正しく入力されていることを確認して、もう一度お試しください。問題が解決しない場合は、Concierge までお問い合わせください。',
        importDescription: '下のインポートされた各列の横にあるドロップダウンをクリックして、スプレッドシートからマッピングするフィールドを選択してください。',
        sizeNotMet: 'ファイルサイズは 0 バイトより大きくなければなりません',
        invalidFileMessage:
            'アップロードされたファイルは空であるか、無効なデータが含まれています。再度アップロードする前に、ファイルの形式が正しいことと、必要な情報が含まれていることを確認してください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSV をダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードの一部として追加される新しいワークスペースメンバーの詳細を以下で確認してください。既存のメンバーは、ロールの更新や招待メッセージを受け取りません。`,
            other: (count: number) =>
                `このアップロードで追加される新しいワークスペースメンバー${count}人分の詳細を、以下で確認してください。既存のメンバーには、ロールの更新や招待メッセージは送信されません。`,
        }),
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `または、ここにドラッグ＆ドロップしてください`,
        desktopSubtitleMultiple: `またはここにドラッグ＆ドロップしてください`,
        alternativeMethodsTitle: '領収書を追加するその他の方法：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>して、携帯電話からスキャンしてください</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を <a href="mailto:${email}">${email}</a> に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">番号を追加</a>して、レシートを ${phoneNumber} にテキスト送信します</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>${phoneNumber} に領収書のテキストを送信（米国の番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: 'レシートの写真を撮影するには、カメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセスはまだ許可されていません。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">こちらの手順</a>に従ってください。`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真の撮影中にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        allowLocationFromSetting: `位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保つことができます。お使いのデバイスの権限設定から位置情報アクセスを許可してください。`,
        dropTitle: 'このままにする',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'この領収書を削除してもよろしいですか？',
        addReceipt: '領収書を追加',
        scanFailed: 'この領収書は、店舗名、日付、または金額が欠けているためスキャンできませんでした。',
        addAReceipt: {
            phrase1: '領収書を追加',
            phrase2: 'またはここにドラッグ＆ドロップしてください',
        },
    },
    quickAction: {
        scanReceipt: 'レシートをスキャン',
        recordDistance: '距離を記録',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: 'レシートを分割',
        splitDistance: '距離を分割',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        assignTask: 'タスクを割り当てる',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイックアクションの送信先にはアクセスできなくなりました。下から新しい送信先を選択してください。',
        updateDestination: '送信先を更新',
        createReport: 'レポートを作成',
    },
    iou: {
        amount: '金額',
        percent: 'パーセント',
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
        original: '元の',
        split: '分割',
        splitExpense: '経費を分割',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${merchant} からの ${amount}`,
        splitByPercentage: '割合で分割',
        addSplit: '分割を追加',
        makeSplitsEven: '分割を均等にする',
        editSplits: '分割を編集',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費より${amount}多くなっています。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには少なくとも 1 件追加してください。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${merchant} の ${amount} を編集`,
        removeSplit: '分割を削除',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払済みの経費は編集できません',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        expense: '経費',
        categorize: 'カテゴリ分け',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '距離を記録',
        createExpenses: (expensesNumber: number) => `${expensesNumber} 件の経費精算を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'この領収書を削除してもよろしいですか？この操作は元に戻せません。',
        addExpense: '経費を追加',
        chooseRecipient: '受信者を選択',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}件の経費を作成`,
        confirmDetails: '詳細を確認',
        pay: '支払う',
        cancelPayment: '支払いをキャンセル',
        cancelPaymentConfirmation: 'この支払いをキャンセルしてもよろしいですか？',
        viewDetails: '詳細を表示',
        pending: '保留中',
        canceled: 'キャンセル済み',
        posted: '投稿済み',
        deleteReceipt: '領収書を削除',
        findExpense: '経費を検索',
        deletedTransaction: (amount: string, merchant: string) => `経費を削除しました（${merchant} への ${amount}）`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `経費を移動しました${reportName ? `${reportName} から` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `<a href="${reportUrl}">${reportName}</a> へ` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `<a href="${reportUrl}">${reportName}</a> から` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費はあなたの<a href="${reportUrl}">パーソナルスペース</a>に移動されました`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `このレポートを<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
            }
            return `この<a href="${movedReportUrl}">レポート</a>を<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: 'カード取引との照合保留中',
        pendingMatch: '保留中の照合',
        pendingMatchWithCreditCardDescription: 'レシートはカード取引との照合待ちです。現金としてマークしてキャンセルしてください。',
        markAsCash: '現金としてマーク',
        routePending: 'ルートを処理中…',
        receiptScanning: () => ({
            one: 'レシートをスキャンしています…',
            other: 'レシートをスキャンしています…',
        }),
        scanMultipleReceipts: '複数のレシートをスキャン',
        scanMultipleReceiptsDescription: 'すべてのレシートを一度に撮影し、内容を自分で確認するか、私たちにお任せください。',
        receiptScanInProgress: 'レシートのスキャンを実行中',
        receiptScanInProgressDescription: '領収書のスキャンを実行中です。後で確認するか、今すぐ詳細を入力してください。',
        removeFromReport: 'レポートから削除',
        moveToPersonalSpace: '経費をあなたの個人スペースに移動',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '重複の可能性がある経費が検出されました。提出できるように重複を確認してください。'
                : '重複の可能性がある経費が検出されました。承認を有効にするには、重複項目を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '検出された問題',
        }),
        fieldPending: '保留中...',
        defaultRate: 'デフォルトレート',
        receiptMissingDetails: '領収書の詳細が不足しています',
        missingAmount: '金額が未入力',
        missingMerchant: '取引先が未入力',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のレシートはあなただけに表示されます。後で確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。詳細を手入力してください。',
        transactionPendingDescription: '取引は保留中です。記帳されるまで数日かかる場合があります。',
        companyInfo: '会社情報',
        companyInfoDescription: '最初の請求書を送信する前に、もう少し詳細が必要です。',
        yourCompanyName: '会社名',
        yourCompanyWebsite: '御社の会社ウェブサイト',
        yourCompanyWebsiteNote: 'ウェブサイトをお持ちでない場合は、代わりに会社のLinkedInやソーシャルメディアのプロフィールをご提供いただけます。',
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
        settledExpensify: '支払済み',
        done: '完了',
        settledElsewhere: '他で支払済み',
        individual: '個人',
        business: 'ビジネス',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify で ${formattedAmount} を支払う` : `Expensify で支払う`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `個人として ${formattedAmount} を支払う` : `個人アカウントで支払う`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `ウォレットで${formattedAmount}を支払う` : `ウォレットで支払う`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} を支払う`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} をビジネスとして支払う` : `ビジネスアカウントで支払う`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} を支払済みにする` : `支払い済みにする`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `個人アカウント ${last4Digits} で ${amount} を支払いました` : `個人アカウントで支払い済み`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `ビジネスアカウント ${last4Digits} で ${amount} を支払いました` : `ビジネスアカウントで支払い済み`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${policyName} で ${formattedAmount} を支払う` : `${policyName}で支払う`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `銀行口座 ${last4Digits} で ${amount} を支払いました` : `銀行口座（下4桁 ${last4Digits}）で支払い済み`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `銀行口座 ${last4Digits} から <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a> により ${amount ? `${amount} ` : ''} を支払いました`,
        invoicePersonalBank: (lastFour: string) => `個人アカウント • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `ビジネスアカウント • ${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} の請求書を送信`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `${comment} 用` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `送信済み${memo ? `、メモ「${memo}」と述べています` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出を遅らせる</a>を通じて送信されました`,
        queuedToSubmitViaDEW: 'カスタム承認ワークフローを介して送信待ちキューに入れられました',
        trackedAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `${comment} 用` : ''} を追跡中`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} を分割`,
        didSplitAmount: (formattedAmount: string, comment: string) => `分割 ${formattedAmount}${comment ? `${comment} 用` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `あなたの分担額 ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} の未払い金額は ${amount}${comment ? `${comment} 用` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} の負担額:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} が支払いました:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} は ${amount} を使いました`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} の支出:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} が承認しました:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} が ${amount} を承認しました`,
        payerSettled: (amount: number | string) => `支払い済み ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount}を支払いました。支払いを受け取るには銀行口座を追加してください。`,
        automaticallyApproved: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        approvedAmount: (amount: number | string) => `承認済み ${amount}`,
        approvedMessage: `承認済み`,
        unapproved: `未承認`,
        automaticallyForwarded: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        forwarded: `承認済み`,
        rejectedThisReport: 'このレポートを却下しました',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `支払いを開始しましたが、${submitterDisplayName} が銀行口座を追加するのを待っています。`,
        adminCanceledRequest: '支払いをキャンセルしました',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `${submitterDisplayName} が30日以内に Expensify Wallet を有効化しなかったため、${amount} の支払いはキャンセルされました`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} が銀行口座を追加しました。${amount} の支払いが行われました。`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}は支払済みにマークされました${comment ? `、「${comment}」と言っています` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}はウォレットで支払い済み`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}は<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>を通じてExpensifyで支払われました`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます',
        changedTheExpense: '経費を変更しました',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant} に設定したため、金額が ${newAmountToDisplay} に設定されました`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（以前は ${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} を ${newValueToDisplay} に（以前は ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant}（以前は ${oldMerchant}）に変更し、それにより金額が ${newAmountToDisplay}（以前は ${oldAmountToDisplay}）に更新されました`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースのルール</a>に基づく` : 'ワークスペースルールに基づく'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `${comment} 用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} を送信済み${comment ? `${comment} 用` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `経費を個人スペースから${workspaceName ?? `${reportName} とチャット`}に移動しました`,
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        error: {
            invalidCategoryLength: 'カテゴリ名が255文字を超えています。短くするか、別のカテゴリを選択してください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選択してください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidIntegerAmount: '続行する前に、ドルの整数金額を入力してください',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税額は${amount}です`,
            invalidSplit: '分割の合計は合計金額と一致している必要があります',
            invalidSplitParticipants: '少なくとも 2 人の参加者に対して、0 より大きい金額を入力してください',
            invalidSplitYourself: 'スプリットには 0 以外の金額を入力してください',
            noParticipantSelected: '参加者を選択してください',
            other: '予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateFailureMessage: 'この経費の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留解除中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
            receiptDeleteFailureError: 'この領収書の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage: '<rbr>領収書のアップロード中にエラーが発生しました。後で<a href="download">領収書を保存</a>して、<a href="retry">もう一度お試しください</a>。</rbr>',
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            genericDeleteFailureMessage: 'この経費の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: '取引に不足している項目があります',
            duplicateWaypointsErrorMessage: '重複する経路ポイントを削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも 2 つの異なる住所を入力してください',
            splitExpenseMultipleParticipantsErrorMessage: '経費はワークスペースと他のメンバーで分割できません。選択内容を更新してください。',
            invalidMerchant: '有効な加盟店名を入力してください',
            atLeastOneAttendee: '少なくとも 1 人の参加者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量は0より大きくなければなりません',
            invalidSubrateLength: '少なくとも 1 つのサブレートが必要です',
            invalidRate: 'このワークスペースでは無効なレートです。ワークスペースから利用可能なレートを選択してください。',
            endDateBeforeStartDate: '終了日は開始日より前にはできません',
            endDateSameAsStartDate: '終了日は開始日と同じにはできません',
            manySplitsProvided: `許可される最大分割数は${CONST.IOU.SPLITS_LIMIT}です。`,
            dateRangeExceedsMaxDays: `期間は${CONST.IOU.SPLITS_LIMIT}日を超えることはできません。`,
            invalidReadings: '開始と終了の両方の読みを入力してください',
            negativeDistanceNotAllowed: '終了値は開始値より大きくなければなりません',
        },
        dismissReceiptError: 'エラーを閉じる',
        dismissReceiptErrorConfirmation: '注意！このエラーを無視すると、アップロードした領収書が完全に削除されます。本当に実行しますか？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `清算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留されています。`,
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
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1件選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。下から新しい経費を作成してみましょう。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留にしている理由を説明してください。',
            other: 'これらの経費を保留している理由を説明してください。',
        }),
        retracted: '撤回済み',
        retract: '撤回',
        reopened: '再開済み',
        reopenReport: 'レポートを再開',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。このレポートを再度開いてもよろしいですか？`,
        reason: '理由',
        holdReasonRequired: '保留する場合は理由が必要です。',
        expenseWasPutOnHold: '経費は保留中です',
        expenseOnHold: 'この経費は保留されています。次のステップについてはコメントを確認してください。',
        expensesOnHold: 'すべての経費が保留になりました。次のステップについてはコメントを確認してください。',
        expenseDuplicate: 'この経費は、他の経費と詳細がよく似ています。続行するには重複している項目を確認してください。',
        someDuplicatesArePaid: 'これらの重複の一部は、すでに承認または支払済みです。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて保持',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認します。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払い金額を確認',
        confirmPayAmount: '保留されていないものを支払うか、レポート全体を支払ってください。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費を保留しますか？',
        whatIsHoldExplain: '「保留」は、経費の提出準備ができるまで、その経費に「一時停止」をかけるようなものです。',
        holdIsLeftBehind: '保留中の経費は、レポート全体を提出しても残ったままになります。',
        unholdWhenReady: '提出の準備ができたら、保留中の経費を解除してください。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースに移動すると変更されがちな、次の項目を再確認してください。',
            reCategorize: '<strong>ワークスペースのルールに従うように、すべての経費のカテゴリを再設定</strong>してください。',
            workflows: 'このレポートには、現在は別の<strong>承認ワークフロー</strong>が適用される可能性があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: '設定',
        changed: '変更済み',
        removed: '削除済み',
        transactionPending: '取引が保留中です。',
        chooseARate: 'ワークスペースの払い戻しレートを、1マイルまたは1キロメートルあたりで選択してください',
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: 'ご注意ください！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `このレポートはすでに${accountingIntegration}へエクスポートされています。変更するとデータの不整合が生じる可能性があります。このレポートの承認を取り消してもよろしいですか？`,
        reimbursable: '精算対象',
        nonReimbursable: '個人立替精算対象外',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約はまだ支払いが行われていないため、保留中です。',
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
            one: `最終日: 1時間`,
            other: (count: number) => `最終日：${count.toFixed(2)}時間`,
        }),
        tripLengthText: () => ({
            one: `旅行: 1日間`,
            other: (count: number) => `出張：全${count}日`,
        }),
        dates: '日付',
        rates: 'レート',
        submitsTo: ({name}: SubmitsToParams) => `${name} に提出`,
        reject: {
            educationalTitle: 'ホールドしますか、それとも却下しますか？',
            educationalText: '経費を承認または支払う準備がまだできていない場合は、保留するか却下できます。',
            holdExpenseTitle: '承認や支払いの前に、詳細を確認するために経費を保留する。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたままにして、ほかの経費を承認します。',
            heldExpenseLeftBehindTitle: 'レポート全体を承認すると、保留中の経費はそのまま残されます。',
            rejectExpenseTitle: '承認または支払う予定のない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を却下する理由を説明してください。',
            rejectReason: '却下理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費精算は却下されました。問題を修正し、「解決済み」にして提出できる状態にするのをお待ちしています。',
            reportActions: {
                rejectedExpense: 'この経費を却下しました',
                markedAsResolved: '却下理由を解決済みとしてマークしました',
            },
        },
        moveExpenses: () => ({one: '経費を移動', other: '経費を移動'}),
        moveExpensesError: '日当経費は他のワークスペースのレポートに移動できません。ワークスペース間で日当レートが異なる可能性があるためです。',
        changeApprover: {
            title: '承認者を変更',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `このレポートの承認者を変更するには、オプションを選択してください。（すべてのレポートに対して恒久的に変更するには、<a href="${workflowSettingLink}">ワークスペース設定</a>を更新してください。）`,
            changedApproverMessage: (managerID: number) => `承認者を <mention-user accountID="${managerID}"/> に変更しました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに追加の承認者を追加してください。',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '自分を最終承認者として設定し、残りの承認者をスキップします。',
            },
            addApprover: {
                subtitle: 'このレポートを残りの承認ワークフローに回付する前に、追加の承認者を選択してください。',
            },
        },
        chooseWorkspace: 'ワークスペースを選択',
        date: '日付',
        splitDates: '日付を分割',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} から ${endDate} まで（${count} 日間）`,
        splitByDate: '日付で分割',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `カスタム承認ワークフローにより、${to} 宛にルーティングされたレポート`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours}  ${hours === 1 ? '時間' : '時間'} @ ${rate} / 時間`,
            hrs: '時間',
            hours: '時間',
            ratePreview: (rate: string) => `${rate} / 時間`,
            amountTooLargeError: '合計金額が大きすぎます。時間を減らすか、レートを下げてください。',
        },
        correctDistanceRateError: '距離レートのエラーを修正して、もう一度お試しください。',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>説明する</strong></a> &#x2728;`,
    },
    transactionMerge: {
        listPage: {
            header: '経費を統合',
            noEligibleExpenseFound: '対象となる経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費と統合できる経費はありません。対象となる経費については<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">こちら</a>をご覧ください。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">対象となる経費</a>を選択して、<strong>${reportName}</strong> と統合します。`,
        },
        receiptPage: {
            header: '領収書を選択',
            pageTitle: '保持したいレシートを選択してください：',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保持したい詳細を選択してください:',
            noDifferences: '取引間の差異は見つかりませんでした',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '1つの' : 'a';
                return `${article} ${field}を選択してください`;
            },
            pleaseSelectAttendees: '出席者を選択してください',
            selectAllDetailsError: '続行する前にすべての詳細を選択してください。',
        },
        confirmationPage: {
            header: '詳細を確認',
            pageTitle: '保持する詳細を確認してください。保持しない詳細は削除されます。',
            confirmButton: '経費を統合',
        },
    },
    share: {
        shareToExpensify: 'Expensify で共有',
        messageInputLabel: 'メッセージ',
    },
    notificationPreferencesPage: {
        header: '通知設定',
        label: '新しいメッセージの通知',
        notificationPreferences: {
            always: '今すぐ',
            daily: '毎日',
            mute: 'ミュート',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: '非表示',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'この番号はまだ認証されていません。ボタンをクリックして、認証リンクをテキストメッセージで再送信してください。',
        emailHasNotBeenValidated: 'メールが認証されていません。ボタンをクリックして、テキストメッセージで認証リンクを再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を表示',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: '申し訳ありません。ワークスペースのアバターを削除する際に予期しない問題が発生しました',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択された画像は、最大アップロードサイズである ${maxUploadSizeInMB} MB を超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `${minHeightInPx}x${minWidthInPx} ピクセルより大きく、${maxHeightInPx}x${maxWidthInPx} ピクセルより小さい画像をアップロードしてください。`,
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
        backdropLabel: 'モーダル背景',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が経費を追加するのを待機中。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の提出を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を提出するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を提出するのを待機中。`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `これ以上の対応は不要です！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が銀行口座を追加するのを待機中です。`;
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
                        return `<strong>あなたの</strong>経費が自動的に提出されるのを待機中${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> さんの経費が ${formattedETA} に自動送信されるまで待機中。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動送信されるのを待機中${formattedETA}`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `問題を修正するのを<strong>あなた</strong>が行うのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が問題を修正するのを待機中。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を修正するのを待機中です。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の経費承認待ち。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を承認するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を承認するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートをエクスポートするのを<strong>あなた</strong>が待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `このレポートのエクスポートを<strong>${actor}</strong>が行うのを待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がこのレポートをエクスポートするのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の経費支払い待ち`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を支払うのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `ビジネス用銀行口座の設定完了を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST /* eslint-disable max-len */.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がビジネス銀行口座の設定を完了するのを待っています。`;
                    case // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
                    CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス銀行口座の設定を完了するのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta} まで` : ` ${eta}`;
                }
                return `支払いの完了を待機中${formattedETA}。`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `おっと！<strong>ご自身</strong>に提出しようとしているようです。自分のレポートを承認することは、ワークスペースで<strong>禁止</strong>されています。このレポートは別のメンバーに提出するか、管理者に連絡して提出先の担当者を変更してください。`,
            // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        }, // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後ほど',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月末の最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月末最終日に',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '旅行の終わりに',
        },
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望の代名詞',
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
            subtitle: 'これらの詳細は、出張および支払いに利用されます。あなたの公開プロフィールに表示されることは決してありません。',
        },
    },
    securityPage: {
        title: 'セキュリティオプション',
        subtitle: 'アカウントを安全に保つために、二要素認証を有効にしてください。',
        goToSecurity: 'セキュリティページに戻る',
    },
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '個人のQRコードまたは紹介リンクを共有して、メンバーをExpensifyに招待しましょう。',
    },
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: 'オプションを表示するには検索',
    },
    contacts: {
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を利用するには、アカウントの認証が必要です。',
        validateAccount: 'アカウントを認証する',
        helpText: ({email}: {email: string}) =>
            `Expensify にログインしたり、領収書を送信したりする方法をさらに追加しましょう。<br/><br/><a href="mailto:${email}">${email}</a> に領収書を転送するメールアドレスを追加するか、電話番号を追加して領収書を 47777 にテキスト送信してください（米国の電話番号のみ）。`,
        pleaseVerify: 'この連絡方法を確認してください。',
        getInTouch: '今後のご連絡はこの方法で行います。',
        enterMagicCode: (contactMethod: string) => `${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在の既定の連絡方法です。削除する前に、別の連絡方法を選択して「既定として設定」をクリックする必要があります。',
        removeContactMethod: '連絡方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡先方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。少し待ってから、もう一度お試しください。',
            validateSecondaryLogin: '不正確または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡方法の削除に失敗しました。サポートが必要な場合はConciergeまでお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法を設定できませんでした。ヘルプが必要な場合は Concierge にお問い合わせください。',
            addContactMethod: 'この連絡先方法を追加できませんでした。サポートが必要な場合は Concierge にお問い合わせください。',
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
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '彼／彼／彼の',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: 'She／Her／Hers',
        sheHerHersTheyThemTheirs: '彼女 / 彼女 / 彼女の / 彼ら / 彼ら / 彼らの',
        merMers: '海 / 海（複数形）',
        neNirNirs: 'Ne／Nir／Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: '1人あたり / 人数',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'ソン / ソンズ',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'ジー / ジム / ジア',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '私の名前で呼んでください',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '表示名',
        isShownOnProfile: '表示名はあなたのプロフィールに表示されます。',
    },
    timezonePage: {
        timezone: 'タイムゾーン',
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されています。',
        getLocationAutomatically: '現在地を自動的に判定',
    },
    updateRequiredView: {
        updateRequired: '更新が必要です',
        pleaseInstall: '最新バージョンの New Expensify にアップデートしてください',
        pleaseInstallExpensifyClassic: '最新バージョンの Expensify をインストールしてください',
        toGetLatestChanges: 'モバイルまの場合は、最新バージョンをダウンロードしてインストールしてください。Web の場合は、ブラウザを更新（再読み込み）してください。',
        newAppNotAvailable: 'The New Expensify アプリは、もう利用できません。',
    },
    initialSettingsPage: {
        about: '概要',
        aboutPage: {
            description: '新しい Expensify アプリは、世界中のオープンソース開発者コミュニティによって構築されています。Expensify の未来を共に創りましょう。',
            appDownloadLinks: 'アプリのダウンロードリンク',
            viewKeyboardShortcuts: 'キーボードショートカットを表示',
            viewTheCode: 'コードを表示',
            viewOpenJobs: '進行中の求人を表示',
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
                '<muted-text>以下のツールを使用して、Expensify の使用体験に関する問題をトラブルシューティングしてください。問題が発生した場合は、<concierge-link>バグを報告</concierge-link>してください。</muted-text>',
            confirmResetDescription: '送信されていない下書きメッセージはすべて失われますが、その他のデータは安全です。',
            resetAndRefresh: 'リセットして更新',
            clientSideLogging: 'クライアント側ログ記録',
            noLogsToShare: '共有できるログはありません',
            useProfiling: 'プロファイリングを使用',
            profileTrace: 'プロファイルトレース',
            results: '結果',
            releaseOptions: 'リリースオプション',
            testingPreferences: 'テスト設定',
            useStagingServer: 'ステージングサーバーを使用',
            forceOffline: '強制オフライン',
            simulatePoorConnection: 'インターネット接続不良をシミュレート',
            simulateFailingNetworkRequests: 'ネットワークリクエストの失敗をシミュレート',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイス認証情報',
            invalidate: '無効にする',
            destroy: '破棄',
            maskExportOnyxStateData: 'Onyx の状態をエクスポートする際に、機密メンバー データをマスクする',
            exportOnyxState: 'Onyx の状態をエクスポート',
            importOnyxState: 'Onyx の状態をインポート',
            testCrash: 'クラッシュをテスト',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用しています。ここを押してクリアしてください。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルは無効です。もう一度お試しください。',
            invalidateWithDelay: '遅延して無効化',
            recordTroubleshootData: 'トラブルシュートデータを記録',
            softKillTheApp: 'アプリをソフト終了する',
            kill: '強制終了',
            sentryDebug: 'Sentryデバッグ',
            sentryDebugDescription: 'Sentryリクエストをコンソールに記録',
            sentryHighlightedSpanOps: 'ハイライト表示するspan名',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: '左側ナビキャッシュ',
            clearleftHandNavCache: 'クリア',
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
        restoreStashed: '保存されたログイン情報を復元',
        signOutConfirmationText: 'サインアウトすると、オフラインで行った変更はすべて失われます。',
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
        reasonForLeavingPrompt: 'お別れするのはとても残念です。今後の改善のため、よろしければ理由を教えていただけますか？',
        enterMessageHere: 'ここにメッセージを入力',
        closeAccountWarning: 'アカウントを閉鎖すると、元に戻すことはできません。',
        closeAccountPermanentlyDeleteData: 'アカウントを削除してもよろしいですか？これにより、未処理の経費はすべて完全に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉じることを希望する場合は、デフォルトの連絡方法を入力してください。あなたのデフォルトの連絡方法は次のとおりです：',
        enterDefaultContact: '既定の連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法',
        enterYourDefaultContactMethod: 'アカウントを閉鎖するには、デフォルトの連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `統合したいアカウントを<strong>${login}</strong>に入力してください。`,
            notReversibleConsent: 'これは元に戻せないことを理解しています',
        },
        accountValidate: {
            confirmMerge: 'アカウントを統合してもよろしいですか？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `アカウントの統合は元に戻せず、<strong>${login}</strong> に対する未提出の経費はすべて失われます。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `続行するには、<strong>${login}</strong> に送信されたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: '不正確または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントを統合しました！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text><strong>${from}</strong> から <strong>${to}</strong> へのすべてのデータ統合が完了しました。今後は、このアカウントに対してどちらのログイン情報も使用できます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: 'New Expensify では、まだアカウントの統合をサポートしていません。代わりに Expensify Classic でこの操作を行ってください。',
            reachOutForHelp: '<muted-text><centered-text>ご不明な点がありましたら、遠慮なく<concierge-link>Concierge にお問い合わせください</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classic に移動',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email.split('@').at(1) ?? ''}</strong> が管理しているため、<strong>${email}</strong> をマージできません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>ドメイン管理者によってプライマリログインとして設定されているため、<strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text><strong>${email}</strong> には二要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong> の2FAを無効にしてから、もう一度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく見る',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているため、マージできません。サポートが必要な場合は、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はExpensifyアカウントを持っていないため、アカウントを統合できません。代わりに<a href="${contactMethodLink}">連絡先方法として追加</a>してください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>このアカウントは請求済みの請求関係を所有しているため、<strong>${email}</strong> にアカウントを統合することはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください',
            description: 'アカウントを統合しようとする試行が多すぎました。後でもう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '検証されていないため、他のアカウントに統合できません。アカウントを検証してから、もう一度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: 'アカウントを自分自身に統合することはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '不審なアクティビティを報告',
        lockAccount: 'アカウントをロック',
        unlockAccount: 'アカウントのロック解除',
        compromisedDescription:
            'アカウントにおかしな点がありますか？報告すると、すぐにアカウントがロックされ、新しい Expensify Card の取引がブロックされ、アカウントの変更も行えなくなります。',
        domainAdminsDescription: 'ドメイン管理者向け：これにより、ドメイン内のすべての Expensify Card のアクティビティと管理者による操作も一時停止されます。',
        areYouSure: 'Expensify アカウントをロックしてもよろしいですか？',
        onceLocked: '一度ロックされると、アカウントはロック解除リクエストとセキュリティ審査が完了するまで制限されます',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `お客様のアカウントをロックできませんでした。この問題を解決するには、Concierge にチャットでお問い合わせください。`,
        chatWithConcierge: 'Conciergeとチャット',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'セキュリティ上の懸念を解決し、アカウントのロックを解除するためにConciergeとチャットしましょう。',
        chatWithConcierge: 'Conciergeとチャット',
    },
    twoFactorAuth: {
        headerTitle: '二要素認証',
        twoFactorAuthEnabled: '2 要素認証が有効になりました',
        whatIsTwoFactorAuth: '2 要素認証（2FA）は、アカウントを安全に保つのに役立ちます。ログイン時には、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '2 要素認証を無効にする',
        explainProcessToRemove: '2 要素認証（2FA）を無効にするには、認証アプリから有効なコードを入力してください。',
        explainProcessToRemoveWithRecovery: '2 要素認証（2FA）を無効にするには、有効なリカバリーコードを入力してください。',
        disabled: '2 要素認証は無効になりました',
        noAuthenticatorApp: 'Expensify にログインする際、認証アプリはもう必要ありません。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらの復旧コードを安全に保管してください！',
        codesLoseAccess: dedent(`
            認証アプリへのアクセスを失い、これらのコードも持っていない場合は、アカウントへのアクセスを失うことになります。

            注: 二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーまたはダウンロードしてください',
        stepVerify: '確認',
        scanCode: 'お使いの端末でQRコードをスキャンしてください',
        authenticatorApp: '認証アプリ',
        addKey: 'または、この秘密鍵を認証アプリに追加してください。',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2 要素認証が有効になりました',
        congrats: 'おめでとうございます！これで追加のセキュリティが有効になりました。',
        copy: 'コピー',
        disable: '無効にする',
        enableTwoFactorAuth: '2 要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '二要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ上の理由により、Xero の連携を接続するには二要素認証が必要です。',
        twoFactorAuthIsRequiredForAdminsHeader: '2 要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '二要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'Xero の会計連携には、二要素認証が必要です。',
        twoFactorAuthIsRequiredCompany: 'あなたの会社では、二要素認証が必須です。',
        twoFactorAuthCannotDisable: '2要素認証を無効にできません',
        twoFactorAuthRequired: 'Xero 連携には二要素認証（2FA）が必須であり、無効にすることはできません。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '復旧コードを入力してください',
            incorrectRecoveryCode: '復旧コードが正しくありません。もう一度お試しください。',
        },
        useRecoveryCode: '復旧コードを使用',
        recoveryCode: '復旧コード',
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
        allSet: '準備完了です。新しいパスワードを安全に保管してください。',
    },
    privateNotes: {
        title: '非公開メモ',
        personalNoteMessage: 'このチャットに関するメモをここに保存できます。メモを追加、編集、閲覧できるのはあなただけです。',
        sharedNoteMessage: 'このチャットに関するメモをここに保存してください。team.expensify.com ドメインの Expensify 従業員および他のメンバーがこれらのメモを閲覧できます。',
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
        paymentCurrency: '支払通貨',
        paymentCurrencyDescription: 'すべての個人経費を換算する標準通貨を選択してください',
        note: `注意: 支払い通貨を変更すると、Expensify に支払う金額に影響する場合があります。詳しくは、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。`,
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
            addressCity: '都市を入力してください',
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
        growlMessageOnSave: 'お支払いカードが正常に追加されました',
        expensifyPassword: 'Expensify パスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            paymentCardNumber: '有効なカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '私書箱ではない有効な請求先住所を入力してください',
            addressState: '州を選択してください',
            addressCity: '都市を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払方法',
        setDefaultConfirmation: 'デフォルトの支払い方法に設定',
        setDefaultSuccess: 'デフォルトの支払い方法を設定しました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを削除してもよろしいですか？',
        error: {
            notOwnerOfBankAccount: 'この銀行口座を既定の支払い方法として設定中にエラーが発生しました',
            invalidBankAccount: 'この銀行口座は一時的に停止されています',
            notOwnerOfFund: 'このカードをデフォルトの支払い方法として設定する際にエラーが発生しました',
            setDefaultFailure: '問題が発生しました。詳しいサポートについては、Conciergeにチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座の追加中に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: 'より早く支払いを受け取る',
        addPaymentMethod: 'アプリ内で直接支払いを送受信するには、支払方法を追加してください。',
        getPaidBackFaster: 'より早く精算してもらいましょう',
        secureAccessToYourMoney: 'あなたのお金への安全なアクセス',
        receiveMoney: '現地通貨で送金を受け取る',
        expensifyWallet: 'Expensifyウォレット（ベータ版）',
        sendAndReceiveMoney: '友人とお金を送受信しましょう。米国の銀行口座のみ利用可能です。',
        enableWallet: 'ウォレットを有効にする',
        addBankAccountToSendAndReceive: '支払いや入金を行うために銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        assignedCards: '割り当てられたカード',
        assignedCardsDescription: 'これらは、ワークスペース管理者が会社の支出を管理するために割り当てたカードです。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'お客様の情報を確認しています。数分後にもう一度ご確認ください。',
        walletActivationFailed: '残念ながら、現在はウォレットを有効にできません。詳しいサポートについては、Concierge にチャットでお問い合わせください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: 'Expensify に銀行口座を連携して、アプリ内で支払いや受け取りをこれまで以上に簡単に直接行えるようにしましょう。',
        chooseYourBankAccount: '銀行口座を選択',
        chooseAccountBody: '必ず正しいものを選択してください。',
        confirmYourBankAccount: '銀行口座を確認',
        personalBankAccounts: '個人銀行口座',
        businessBankAccounts: 'ビジネス銀行口座',
        shareBankAccount: '銀行口座を共有',
        bankAccountShared: '銀行口座を共有しました',
        shareBankAccountTitle: 'この銀行口座を共有する管理者を選択してください',
        shareBankAccountSuccess: '銀行口座を共有しました！',
        shareBankAccountSuccessDescription: '選択した管理者にはコンシェルジュから確認メッセージが届きます',
        shareBankAccountFailure: '銀行口座の共有中に予期しないエラーが発生しました。もう一度お試しください。',
        shareBankAccountEmptyTitle: '管理者がいません',
        shareBankAccountEmptyDescription: 'この銀行口座を共有できるワークスペース管理者がいません',
        shareBankAccountNoAdminsSelected: '続行する前に管理者を選択してください',
        unshareBankAccount: '銀行口座の共有を解除してください',
        unshareBankAccountDescription: '以下の全員がこの銀行口座にアクセスできます。いつでもアクセスを削除できます。処理中のお支払いは引き続き完了します。',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} はこのビジネス銀行口座にアクセスできなくなります。処理中のお支払いは引き続き完了します。`,
        reachOutForHelp: 'この口座は Expensify カードで使用されています。共有を解除する必要がある場合は、<concierge-link>コンシェルジュまでお問い合わせください</concierge-link>。',
        unshareErrorModalTitle: '銀行口座の共有を解除できません',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensifyトラベルカード',
        availableSpend: '残りの上限',
        smartLimit: {
            name: 'スマート上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大で${formattedLimit}まで利用できます。提出済みの経費が承認されると、その限度額はリセットされます。`,
        },
        fixedLimit: {
            name: '固定制限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは上限として${formattedLimit}まで利用でき、その後自動的に無効化されます。`,
        },
        monthlyLimit: {
            name: '月間上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは、1か月あたり最大 ${formattedLimit} まで利用できます。上限額は各月の1日目にリセットされます。`,
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
        cardLocked: '弊社チームがあなたの会社のアカウントを確認している間、カードは一時的にロックされています。',
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
        enterMagicCode: (contactMethod: string) => `カード情報を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">個人情報を追加</a>してから、もう一度お試しください。`,
        unexpectedError: 'Expensifyカードの詳細を取得中にエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです',
            reportFraudButtonText: 'いいえ、私ではありません',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審なアクティビティを解消し、カード x${cardLastFour} を再有効化しました。これで引き続き経費精算が行えます！`,
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
            }) => `${cardLastFour} で終わるカードに不審な利用を検知しました。この請求に心当たりはありますか？

${merchant} への ${amount}（${date}）`,
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認と支払いまでを含めたワークフローを構成します。',
        submissionFrequency: '提出物',
        submissionFrequencyDescription: '経費を提出するカスタムスケジュールを選択してください。',
        submissionFrequencyDateOfMonth: '月の日付',
        disableApprovalPromptDescription: '承認を無効にすると、既存のすべての承認ワークフローが削除されます。',
        addApprovalsTitle: '承認',
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'より詳細なワークフローが存在しない限り、このデフォルトのワークフローはすべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に、追加の承認を要求する。',
        makeOrTrackPaymentsTitle: '支払い',
        makeOrTrackPaymentsDescription: 'Expensify で行われる支払い用の承認済み支払者を追加するか、他で行われた支払いを追跡します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>Concierge</concierge-link> までお問い合わせください。</muted-text-label>',
        editor: {
            submissionFrequency: 'Expensify がエラーのない支出を共有するまで、どれくらい待つかを選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動提出に設定してください',
        frequencies: {
            instant: '即座に',
            weekly: '毎週',
            monthly: '毎月',
            twiceAMonth: '月2回',
            byTrip: '出張ごと',
            manually: '手動で',
            daily: '毎日',
            lastDayOfMonth: '月末最終日',
            lastBusinessDayOfMonth: '月末最終営業日',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: '日',
                other: '日',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '最初',
                '2': '秒',
                '3': '3番目',
                '4': '4番目',
                '5': '5番目',
                '6': '6番目',
                '7': '7番目',
                '8': '8番目',
                '9': '9 番目',
                '10': '第10',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに所属しています。ここでの更新内容は、そちらにも反映されます。',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。ワークフローの循環を避けるため、別の承認者を選択してください。`,
        emptyContent: {
            title: '表示するメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは、すでに既存の承認ワークフローに属しています。',
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
        deletePrompt: 'この承認ワークフローを削除してもよろしいですか？削除すると、すべてのメンバーはデフォルトのワークフローに従うようになります。',
    },
    workflowsExpensesFromPage: {
        title: '経費（発生日）',
        header: '次のメンバーが経費を提出したとき:',
    },
    workflowsApproverPage: {
        genericErrorMessage: '承認者を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        title: 'このメンバーに承認用として送信:',
        description: 'この人が経費を承認します。',
    },
    workflowsApprovalLimitPage: {
        title: '承認者',
        header: '（オプション）承認限度額を追加しますか？',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `<strong>${approverName}</strong>が承認者で、レポートが以下の金額を超える場合に別の承認者を追加します：`
                : 'レポートが以下の金額を超える場合に別の承認者を追加します：',
        reportAmountLabel: 'レポート金額',
        additionalApproverLabel: '追加の承認者',
        skip: 'スキップ',
        next: '次へ',
        removeLimit: '制限を削除',
        enterAmountError: '有効な金額を入力してください',
        enterApproverError: 'レポート制限を設定する場合は承認者が必要です',
        enterBothError: 'レポート金額と追加の承認者を入力してください',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `${approvalLimit}を超えるレポートは${approverName}に転送されます`,
    },
    workflowsPayerPage: {
        title: '認可された支払担当者',
        genericErrorMessage: '支払権限者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払者',
        paymentAccount: '支払い口座',
    },
    reportFraudPage: {
        title: 'バーチャルカードの不正利用を報告',
        description: 'バーチャルカードの情報が盗まれた、または不正利用された場合、現在お使いのカードは恒久的に無効化され、新しいバーチャルカードと番号が発行されます。',
        deactivateCard: 'カードを無効化',
        reportVirtualCardFraud: 'バーチャルカードの不正利用を報告',
    },
    reportFraudConfirmationPage: {
        title: 'カード不正利用が報告されました',
        description: 'お客様の既存のカードは永続的に無効化されました。カード詳細の画面に戻ると、新しいバーチャルカードが利用できるようになっています。',
        buttonText: '了解しました、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: 'プラスチックカードを有効化',
        error: {
            thatDidNotMatch: 'カードの下4桁と一致しませんでした。もう一度お試しください。',
            throttled:
                'Expensify Card の下4桁の入力ミスが多すぎます。番号が正しいと確信している場合は、問題解決のため Concierge にお問い合わせください。正しくない可能性がある場合は、しばらく時間をおいてから再試行してください。',
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
        streetAddress: '住所（番地）',
        city: '市',
        state: '状態',
        zipPostcode: '郵便番号',
        country: '国',
        confirmMessage: '以下の内容をご確認ください。',
        estimatedDeliveryMessage: '物理カードは 2～3 営業日以内に届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `振替${amount ? ` ${amount}` : ''}`,
        instant: '即時（デビットカード）',
        instantSummary: (rate: string, minAmount: string) => `${rate}% の手数料（最低 ${minAmount}）`,
        ach: '1～3 営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どのアカウントですか？',
        fee: '手数料',
        transferSuccess: '振替が完了しました！',
        transferDetailBankAccount: 'あなたの資金は、今後1～3営業日以内に到着する予定です。',
        transferDetailDebitCard: 'あなたのお金はすぐに到着するはずです。',
        failedTransfer: '残高が完全に精算されていません。銀行口座に振込してください。',
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
        cardLastFour:
            '**Innovating the Future: A Glimpse into the Year 2050**\n\nAs we look ahead to the year 2050, the landscape of technology, society, and the environment will likely be transformed in ways that are both exciting and challenging. Here are some key areas where we can expect significant changes:\n\n---\n\n### 🌍 1. Sustainable Living and the Environment\n\nBy 2050, the effects of climate change will have forced humanity to adopt more sustainable practices:\n\n- **Renewable Energy Dominance**: Solar, wind, and other renewable sources will likely be our primary energy providers, greatly reducing reliance on fossil fuels.\n- **Smart Cities**: Urban areas will incorporate green architecture, efficient public transport, and AI-powered infrastructure to reduce pollution and improve quality of life.\n- **Circular Economy**: Recycling and reusing materials will become standard, with waste minimized at every stage of production and consumption.\n\n---\n\n### 🤖 2. Advancements in Artificial Intelligence and Automation\n\nAI will be deeply embedded in everyday life:\n\n- **Personal AI Assistants**: Far more advanced than today’s versions, they’ll manage schedules, health, finances, and even offer emotional support.\n- **Automation of Work**: Many repetitive and dangerous jobs will be handled by robots, reshaping the job market and requiring new skills.\n- **Ethics and Governance**: As AI capabilities grow, society will need robust laws and ethical frameworks to ensure fairness, privacy, and safety.\n\n---\n\n### 🧬 3. Healthcare and Biotechnology\n\nMedical technology in 2050 could dramatically improve human health and longevity:\n\n- **Personalized Medicine**: Treatments tailored to individual genetic profiles will improve outcomes and reduce side effects.\n- **Disease Prevention**: Early detection tools, wearable health monitors, and AI diagnostics will help prevent many diseases before they become severe.\n- **Regenerative Medicine**: Advances in stem cells and tissue engineering could allow damaged organs to be repaired or replaced.\n\n---\n\n### 🚀 4. Space Exploration and Colonization\n\nHumanity’s reach into space will likely expand:\n\n- **Moon and Mars Bases**: Permanent or semi-permanent habitats on the Moon and Mars could support research and possibly mining activities.\n- **Commercial Space Travel**: Space tourism might be accessible to more people, not just the ultra-wealthy.\n- **Asteroid Mining**: Extracting valuable minerals from asteroids could become a new frontier for resources.\n\n---\n\n### 🧠 5. Education, Work, and Society\n\nHow we learn and work will be very different:\n\n- **Lifelong Learning**: With rapid technological change, continuous education will be essential. Online and immersive learning environments (like VR/AR) will be the norm.\n- **Remote and Hybrid Work**: Offices will exist, but many jobs will be location-independent, allowing people greater flexibility in where they live.\n- **Global Connectivity**: Faster and more ubiquitous internet will connect even remote regions, fostering global collaboration and cultural exchange.\n\n---\n\n### ⚖️ 6. Challenges and Considerations\n\nDespite all the opportunities, 2050 will bring serious challenges:\n\n- **Inequality**: Access to advanced technology, education, and healthcare may remain unequal across regions and social groups.\n- **Privacy and Security**: With more data collected about everyone, protecting privacy and preventing abuse will be critical.\n- **Cultural and Psychological Impact**: Rapid change can create stress, identity challenges, and generational divides.\n\n---\n\n### 🔮 Conclusion\n\nThe world in 2050 will likely be more interconnected, technologically advanced, and environmentally conscious than today—but it will also require thoughtful decisions to ensure that progress benefits everyone. The choices we make now, in areas like sustainability, ethics, and equity, will shape whether 2050 becomes a thriving future for all or a time marked by deeper divides.\n\nThe future isn’t predetermined; it’s something we build—step by step—starting today.',
        addFirstPaymentMethod: 'アプリ内で直接支払いを送受信するには、支払方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: (lastFour: string) => `銀行口座 • ${lastFour}`,
    },
    expenseRulesPage: {
        title: '経費ルール',
        subtitle: 'これらのルールはあなたの経費に適用されます。ワークスペースに提出する場合、そのワークスペースのルールがこれらより優先されることがあります。',
        findRule: 'ルールを検索',
        emptyRules: {title: 'ルールがまだ作成されていません', subtitle: '経費報告を自動化するルールを追加する。'},
        changes: {
            billableUpdate: (value: boolean) => `経費 ${value ? '請求対象' : '請求不可'} を更新`,
            categoryUpdate: (value: string) => `カテゴリを「${value}」に更新`,
            commentUpdate: (value: string) => `説明を「${value}」に変更`,
            merchantUpdate: (value: string) => `支払先を「${value}」に更新`,
            reimbursableUpdate: (value: boolean) => `経費 ${value ? '精算対象' : '非精算'} を更新`,
            tagUpdate: (value: string) => `タグを「${value}」に更新`,
            taxUpdate: (value: string) => `税率を${value}に更新`,
            billable: (value: boolean) => `経費 ${value ? '請求対象' : '請求不可'}`,
            category: (value: string) => `カテゴリを「${value}」`,
            comment: (value: string) => `説明を「${value}」`,
            merchant: (value: string) => `支払先を「${value}」`,
            reimbursable: (value: boolean) => `経費 ${value ? '精算対象' : '非精算'}`,
            tag: (value: string) => `タグを「${value}」`,
            tax: (value: string) => `税率を「${value}」`,
            report: (value: string) => `"${value}" という名前のレポートに追加`,
        },
        newRule: '新しいルール',
        addRule: {
            title: 'ルールを追加',
            expenseContains: '経費に以下が含まれる場合:',
            applyUpdates: '次に、これらの更新を適用します。',
            merchantHint: 'すべての加盟店に適用されるルールを作成するには * を入力してください',
            addToReport: '「…という名前のレポートに追加」',
            createReport: '必要に応じてレポートを作成',
            applyToExistingExpenses: '既存の一致する経費に適用',
            confirmError: '店舗名を入力し、少なくとも 1 つの更新を適用してください',
            confirmErrorMerchant: '支払先を入力してください',
            confirmErrorUpdate: '少なくとも 1 件の更新を適用してください',
            saveRule: 'ルールを保存',
        },
        editRule: {title: 'ルールを編集'},
        deleteRule: {
            deleteSingle: 'ルールを削除',
            deleteMultiple: 'ルールを削除',
            deleteSinglePrompt: 'このルールを削除してもよろしいですか？',
            deleteMultiplePrompt: 'これらのルールを本当に削除しますか？',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: 'テスト設定',
            subtitle: 'ステージング環境でアプリのデバッグとテストを支援するための設定。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する機能のアップデートとExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensify からのすべてのサウンドをミュート',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読とピン留めされたチャットのみに#focusするか、またはすべてのチャットを表示し、最新とピン留めされたチャットを一番上に表示するかを選択します。',
        priorityModes: {
            default: {
                label: '最新',
                description: '最新の順にすべてのチャットを表示',
            },
            gsd: {
                label: '#フォーカス',
                description: '未読のみをアルファベット順で表示',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `${policyName} 内`,
        generatingPDF: 'PDFを生成',
        waitForPDF: 'PDFを生成しています。しばらくお待ちください。',
        errorPDF: 'PDFの生成中にエラーが発生しました。',
        successPDF: 'PDFが生成されました！自動的にダウンロードされなかった場合は、下のボタンを使用してください。',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: '部屋の説明（任意）',
        explainerText: 'ルームのカスタム説明を設定します。',
    },
    groupChat: {
        lastMemberTitle: 'ご注意ください！',
        lastMemberWarning: 'あなたがここにいる最後のメンバーのため、退出するとこのチャットはすべてのメンバーがアクセスできなくなります。本当に退出してもよろしいですか？',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}のグループチャット`,
    },
    languagePage: {
        language: '言語',
        aiGenerated: 'この言語の翻訳は自動生成されており、誤りが含まれている場合があります。',
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
        chooseThemeBelowOrSync: '下からテーマを選択するか、お使いのデバイス設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすることで、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">サービス規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `<muted-text-xs>資金送金サービスは、その<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">ライセンス</a>に基づき、${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）によって提供されています。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: '復旧コードを入力してください',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `<a>${timeRemaining}</a>後に新しいコードをリクエスト`,
        requestNewCodeAfterErrorOccurred: '新しいコードをリクエスト',
        error: {
            pleaseFillMagicCode: 'マジックコードを入力してください',
            incorrectMagicCode: '不正確または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'すべての項目を入力してください',
        pleaseFillPassword: 'パスワードを入力してください',
        pleaseFillTwoFactorAuth: '2 要素コードを入力してください',
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには二要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        error: {
            incorrectPassword: 'パスワードが正しくありません。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログインまたはパスワードが正しくありません。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントでは2要素認証（2FA）が有効になっています。メールアドレスまたは電話番号を使用してサインインしてください。',
            invalidLoginOrPassword: 'ログインIDまたはパスワードが正しくありません。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。古いパスワードリセットメールに含まれているパスワードリセットリンクの有効期限が切れている可能性があります。再試行できるよう、新しいリンクをメールでお送りしました。受信トレイと迷惑メールフォルダーをご確認ください。数分以内に届くはずです。',
            noAccess: 'このアプリケーションへのアクセス権がありません。アクセスするには、GitHub のユーザー名を追加してください。',
            accountLocked: '複数回のログイン失敗により、アカウントがロックされました。1時間後にもう一度お試しください。',
            fallback: '問題が発生しました。後でもう一度お試しください。',
        },
    },
    loginForm: {
        phoneOrEmail: '電話番号またはメールアドレス',
        error: {
            invalidFormatEmailLogin: '入力されたメールアドレスが無効です。形式を修正して、もう一度お試しください。',
        },
        cannotGetAccountDetails: 'アカウント情報を取得できませんでした。もう一度サインインしてください。',
        loginForm: 'ログインフォーム',
        notYou: ({user}: NotYouParams) => `${user}ではありませんか？`,
    },
    onboarding: {
        welcome: 'ようこそ！',
        welcomeSignOffTitleManageTeam: '上記のタスクが完了したら、承認ワークフローやルールなど、さらに多くの機能を試してみましょう！',
        welcomeSignOffTitle: 'お会いできてうれしいです！',
        explanationModal: {
            title: 'Expensify へようこそ',
            description:
                'チャットのスピードで、ビジネスとプライベートの支出をまとめて管理できるアプリです。ぜひお試しいただき、ご意見をお聞かせください。今後もさらに多くの機能を追加していきます！',
            secondaryDescription: 'Expensify Classic に戻るには、プロフィール写真をタップし、「Expensify Classic に移動」を選択してください。',
        },
        getStarted: 'はじめる',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: '知り合いの人たちがすでに参加しています！参加するには、メールアドレスを認証してください。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `${domain} のユーザーによってすでにワークスペースが作成されています。${email} に送信されたマジックコードを入力してください。`,
        joinAWorkspace: 'ワークスペースに参加',
        listOfWorkspaces: '参加できるワークスペースの一覧です。あとで参加したい場合でも、いつでも参加できますのでご安心ください。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 人のメンバー${employeeCount > 1 ? '秒' : ''} • ${policyOwner}`,
        whereYouWork: 'どこで働いていますか？',
        errorSelection: '先に進むオプションを選択してください',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: 'セットアップを続行するには「続行」を押してください',
            errorBackButton: 'アプリの利用を開始するには、設定の質問に回答してください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主から立替金の払い戻しを受ける',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'チームの経費を管理する',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '経費の追跡と予算管理',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '友達とチャットして割り勘しよう',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'その他',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '従業員数 1～10 人',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '従業員数 11～50 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '従業員数 51～100 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '従業員数 101～1,000 人',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000人を超える従業員',
        },
        accounting: {
            title: '会計ソフトウェアを利用していますか？',
            none: 'なし',
        },
        interestedFeatures: {
            title: 'どの機能にご興味がありますか？',
            featuresAlreadyEnabled: 'こちらは、最も人気のある機能です。',
            featureYouMayBeInterestedIn: '追加機能を有効にする',
        },
        error: {
            requiredFirstName: '続行するには名を入力してください',
        },
        workEmail: {
            title: '勤務先のメールアドレスは何ですか？',
            subtitle: 'Expensify は、勤務先のメールアドレスを接続すると最も効果的に機能します。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.com に転送してスキャン',
                descriptionTwo: 'すでに Expensify を利用している同僚に参加する',
                descriptionThree: 'よりパーソナライズされたエクスペリエンスをお楽しみください',
            },
            addWorkEmail: '勤務用メールアドレスを追加',
        },
        workEmailValidation: {
            title: '勤務先メールを確認',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `${workEmail} に送信されたマジックコードを入力してください。1～2分ほどで届きます。`,
        },
        workEmailValidationError: {
            publicEmail: '有効な社用メールアドレス（例：mitch@company.com）のような独自ドメインのアドレスを入力してください',
            offline: 'オフラインのため、勤務先メールアドレスを追加できませんでした',
        },
        mergeBlockScreen: {
            title: '勤務用メールアドレスを追加できませんでした',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `${workEmail} を追加できませんでした。後で「設定」からもう一度お試しいただくか、ガイダンスについては Concierge にチャットでお問い合わせください。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `[Expensify が経費精算を最速で行える理由を知るには、こちらのクイックプロダクトツアーをご覧ください](${testDriveURL})`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `[テストドライブ](${testDriveURL})でお試しいただき、チーム全員で *Expensify を3か月間無料* でご利用ください！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        チームの支出を確認し、コントロールするために、*経費承認を追加* しましょう。

                        手順は次のとおりです：

                        1. *ワークスペース* に移動します。
                        2. ワークスペースを選択します。
                        3. *その他の機能* をクリックします。
                        4. *ワークフロー* を有効にします。
                        5. ワークスペースエディタ内の *ワークフロー* に移動します。
                        6. *承認* を有効にします。
                        7. あなたが経費の承認者として設定されます。チームを招待した後は、任意の管理者に変更できます。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `ワークスペースを[作成](${workspaceConfirmationLink})`,
                description: 'ワークスペースを作成し、設定スペシャリストのサポートを受けながら各種設定を行いましょう！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペースを作成](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        経費を追跡し、レシートをスキャンし、チャットなどを行うには、*ワークスペースを作成*しましょう。

                        1. *ワークスペース* をクリックし、*新しいワークスペース* を選択します。

                        *新しいワークスペースの準備ができました！* [確認する](${workspaceSettingsLink})。`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリー](${workspaceCategoriesLink})を設定`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        チームが経費を簡単にレポートできるように、*カテゴリーを設定*しましょう。

                        1. *ワークスペース* をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. *カテゴリー* をクリックします。
                        4. 不要なカテゴリーを無効にします。
                        5. 画面右上から独自のカテゴリーを追加します。

                        [ワークスペースのカテゴリー設定を開く](${workspaceCategoriesLink})。

                        ![カテゴリーを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '経費を提出',
                description: dedent(`
                    金額を入力するか、レシートをスキャンして *経費を提出* します。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、レシートをスキャンします。
                    4. 上司のメールアドレスまたは電話番号を追加します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            adminSubmitExpenseTask: {
                title: '経費を提出',
                description: dedent(`
                    金額を入力するか、レシートをスキャンして*経費を提出*しましょう。

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
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. *個人*スペースを選択します。
                    5. *作成* をクリックします。

                    これで完了です。そう、とても簡単です。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `接続${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'に'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : '宛先'} ${integrationName} を接続して、自動経費コーディングと同期を有効にし、月次決算をスムーズに行いましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *会計* をクリックします。
                        4. ${integrationName} を見つけます。
                        5. *接続* をクリックします。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[会計に移動](${workspaceAccountingLink}).

                        ![${integrationName} に接続](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[会計ページへ移動](${workspaceAccountingLink})`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[法人カード](${corporateCardLink})を連携`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        自動取引インポート、領収書の照合、消込のために、すでにお持ちのカードを連携しましょう。

                        1. *Workspaces* をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. *Company cards* をクリックします。
                        4. 表示される手順に従ってカードを接続します。

                        [会社カード画面へ移動](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[チームを招待](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *チームを招待*して、今すぐExpensifyで経費管理を始めましょう。

                        1. *ワークスペース* をクリックします。
                        2. ワークスペースを選択します。
                        3. *メンバー* > *メンバーを招待* をクリックします。
                        4. メールアドレスまたは電話番号を入力します。
                        5. 必要に応じて、招待メッセージをカスタマイズして追加します。

                        [ワークスペースのメンバー画面へ移動](${workspaceMembersLink})。

                        ![チームを招待](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリ](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *カテゴリーとタグを設定* して、チームが経費をコード付けし、簡単にレポートできるようにしましょう。

                        [会計ソフトを接続](${workspaceAccountingLink})して自動的にインポートするか、[ワークスペース設定](${workspaceCategoriesLink})で手動設定してください。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[タグ](${workspaceTagsLink})を設定`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        プロジェクト、クライアント、所在地、部署などの追加情報を、タグを使って経費に付加できます。複数レベルのタグが必要な場合は、Controlプランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *More features* をクリックします。
                        4. *Tags* を有効にします。
                        5. ワークスペースエディタで *Tags* に移動します。
                        6. *+ Add tag* をクリックして独自のタグを作成します。

                        [More features に移動](${workspaceMoreFeaturesLink})。

                        ![タグの設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `[会計士](${workspaceMembersLink})を招待`,
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

                    まだExpensifyを利用していない相手には、自動的に招待が送信されます。

                    すべてのチャットはメールまたはテキストメッセージとしても送信され、相手はそれに直接返信できます。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割',
                description: dedent(`
                    1 人または複数の人と*経費を分割*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始*を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット画面でグレーの *+* ボタンをクリックし、*経費を分割*を選択します。
                    5. *手入力*、*スキャン*、または *距離* を選んで経費を作成します。

                    必要であれば詳細を追加してもよいですし、そのまま送信してもかまいません。さっそく立替分を精算してもらいましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink}) を確認する`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        ワークスペース設定を確認および更新する手順は次のとおりです：
                        1. 「Workspaces」をクリックします。
                        2. 対象のワークスペースを選択します。
                        3. 設定を確認し、更新します。
                        [ワークスペースに移動](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'あなたの最初のレポートを作成',
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[テストドライブ](${testDriveURL})を試す` : '試してみる'),
            embeddedDemoIframeTitle: 'お試しドライブ',
            employeeFakeReceipt: {
                description: '私の試乗のレシート！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'お金を返してもらうのは、メッセージを送るくらい簡単です。基本を見ていきましょう。',
            onboardingPersonalSpendMessage: '数回のクリックで支出を追跡する方法をご紹介します。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 無料トライアルが開始されました！さっそく設定を進めましょう。
                        👋 こんにちは、私はあなたの Expensify セットアップ スペシャリストです。すでにチームのレシートや経費を管理するためのワークスペースを作成してあります。30日間の無料トライアルを最大限に活用するために、以下の残りの設定手順に従ってください！
                    `)
                    : dedent(`
                        # 無料トライアルが開始されました！セットアップを進めましょう。
                        👋 こんにちは、私はあなたの Expensify セットアップ担当です。ワークスペースを作成したので、以下の手順に従って 30 日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage:
                '# セットアップを始めましょう\n👋 こんにちは、私はあなたの Expensify セットアップ担当です。すでに領収書や経費を管理するためのワークスペースを作成してあります。30日間の無料トライアルを最大限に活用するには、以下の残りのセットアップ手順に従ってください！',
            onboardingChatSplitMessage: '友だちとの割り勘は、メッセージを送るくらい簡単です。やり方は次のとおりです。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自分の経費を申請する方法を学びましょう。',
            onboardingLookingAroundMessage:
                'Expensify は経費精算、出張管理、法人カード管理で最も知られていますが、それだけではありません。ご興味のある内容を教えていただければ、開始できるようお手伝いします。',
            onboardingTestDriveReceiverMessage: '3か月間無料です！以下から始めましょう。',
        },
        workspace: {
            title: 'ワークスペースで整理しましょう',
            subtitle: '1 か所ですべての強力なツールを活用して経費管理をシンプルにしましょう。ワークスペースがあれば、次のことができます。',
            explanationModal: {
                descriptionOne: '領収書を追跡して整理する',
                descriptionTwo: '経費を分類し、タグを付ける',
                descriptionThree: 'レポートの作成と共有',
            },
            price: 'まずは30日間無料でお試し、その後は<strong>1ユーザーあたり月額5ドル</strong>でアップグレードできます。',
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: '領収書の管理、経費の精算、出張の管理、レポート作成などを行うワークスペースを作成し、チャットのスピードですべてを処理しましょう。',
        },
        inviteMembers: {
            title: 'メンバーを招待',
            subtitle: 'チームを追加するか、会計士を招待しましょう。多ければ多いほど楽しくなります！',
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
            cannotContainSpecialCharacters: '名前に特殊文字を含めることはできません',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'あなたの法的な氏名は何ですか？',
        enterDateOfBirth: 'あなたの生年月日はいつですか？',
        enterAddress: 'あなたの住所は何ですか？',
        enterPhoneNumber: '電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は旅行と支払いに使用されます。あなたの公開プロフィールに表示されることは決してありません。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        address: '住所',
        error: {
            dateShouldBeBefore: (dateString: string) => `日付は${dateString}より前でなければなりません`,
            dateShouldBeAfter: (dateString: string) => `日付は${dateString}より後である必要があります`,
            hasInvalidCharacter: '名前にはラテン文字のみ使用できます',
            incorrectZipFormat: (zipFormat?: string) => `郵便番号の形式が正しくありません${zipFormat ? `許容される形式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `電話番号が有効であることを確認してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクを再送信しました',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `${login} にマジックサインインリンクを送信しました。サインインするには ${loginType} を確認してください。`,
        resendLink: 'リンクを再送',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `${secondaryLogin} を承認するには、${primaryLogin} のアカウント設定からマジックコードを再送信してください。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `${primaryLogin} にアクセスできなくなった場合は、アカウントのリンクを解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクを送信しました！',
        successfullyUnlinkedLogin: 'セカンダリログインの連携を正常に解除しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `配信エラーにより、メールプロバイダーが一時的に ${login} へのメール送信を停止しました。ログインを再有効化するには、次の手順に従ってください。`,
        confirmThat: (login: string) =>
            `<strong>${login} が正しく綴られており、実際にメールを受信できる有効なメールアドレスであることを確認してください。</strong> 「expenses@domain.com」などのメールエイリアスは、有効な Expensify ログインとなるために、そのエイリアス専用のメール受信ボックスにアクセスできなければなりません。`,
        ensureYourEmailClient: `<strong>お使いのメールクライアントで expensify.com からのメールが受信できるように設定してください。</strong> この手順の完了方法は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>で確認できますが、メール設定の構成については IT 部門のサポートが必要になる場合があります。`,
        onceTheAbove: `上記の手順が完了したら、ログインのブロック解除のために<a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>までご連絡ください。`,
    },
    openAppFailureModal: {
        title: '問題が発生しました…',
        subtitle: `お客様のデータをすべて読み込むことができませんでした。こちらで問題を検知しており、現在調査中です。解消しない場合は、次の宛先までご連絡ください`,
        refreshAndTryAgain: '再読み込みして、もう一度お試しください',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `${login} に SMS メッセージを送信できなかったため、一時的に停止しました。次の手順で番号の認証をお試しください：`,
        validationSuccess: 'あなたの番号は確認されました！下をクリックして、新しいマジックサインインコードを送信してください。',
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
                return 'もう一度お試しになる前に、しばらくお待ちください。';
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
            return `少々お待ちください！番号を再度認証するには、${timeText}お待ちいただく必要があります。`;
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
        prompt: (priorityModePageUrl: string) =>
            `未読のチャットや、対応が必要なチャットだけを表示して、常に状況を把握しましょう。心配はいりません。これはいつでも<a href="${priorityModePageUrl}">設定</a>で変更できます。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しの支払い詳細が見つかりません。',
        notHere: 'うーん…ここにはありません',
        pageNotFound: 'おっと、このページは見つかりませんでした',
        noAccess: 'このチャットまたは経費は削除された可能性があるか、アクセス権がありません。\n\nご不明な点がありましたら concierge@expensify.com までお問い合わせください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。',
        goToChatInstead: '代わりにチャットに移動してください。',
        contactConcierge: 'ご不明な点がございましたら concierge@expensify.com までお問い合わせください',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `おっと… ${isBreakLine ? '\n' : ''}問題が発生しました`,
        subtitle: 'リクエストを完了できませんでした。時間をおいて、もう一度お試しください。',
        wrongTypeSubtitle: 'その検索条件は無効です。検索条件を調整してやり直してください。',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '絵文字を追加して、同僚や友だちが状況をひと目で分かるようにしましょう。必要に応じてメッセージを追加することもできます。',
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
        clearAfter: '経過後にクリア',
        whenClearStatus: 'ステータスをいつクリアしますか？',
        vacationDelegate: '休暇代理人',
        setVacationDelegate: `休暇中に代理承認者を設定して、不在の間にあなたの代わりにレポートを承認してもらいましょう。`,
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `${nameOrEmail} の休暇代理として`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `${vacationDelegateName} の休暇代理人として ${submittedToName} に`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `${nameOrEmail} を休暇代理人として割り当てようとしています。このユーザーは、まだすべてのワークスペースに参加していません。続行する場合は、すべてのワークスペース管理者に、このユーザーを追加するようメールが送信されます。`,
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
        accountEnding: '…で終わるアカウント',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '以下のアカウントから選択',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログイン',
        connectManually: '手動で接続',
        desktopConnection: '注: Chase、Wells Fargo、Capital One、または Bank of America と接続するには、こちらをクリックしてブラウザでこの手続きを完了してください。',
        yourDataIsSecure: 'お客様のデータは安全です',
        toGetStarted: '1 か所から経費の払い戻し、Expensify Card の発行、請求書の支払い回収、請求書の支払いを行うために、銀行口座を追加しましょう。',
        plaidBodyCopy: '従業員が会社の経費を支払うことも、その払い戻しを受けることも、より簡単に行えるようにしましょう。',
        checkHelpLine: 'ルーティング番号と口座番号は、その口座の小切手で確認できます。',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `銀行口座を連携するには、<a href="${contactMethodRoute}">メールアドレスを主なログイン方法として追加</a>してから、もう一度お試しください。電話番号はサブのログイン方法として追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから、もう一度お試しください。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `おっと！ワークスペースの通貨がUSDとは異なる通貨に設定されているようです。続行するには、<a href="${workspaceRoute}">ワークスペース設定</a>に移動して通貨をUSDに変更し、もう一度お試しください。`,
        bbaAdded: 'ビジネス銀行口座を追加しました！',
        bbaAddedDescription: '支払いに使用する準備ができました。',
        error: {
            youNeedToSelectAnOption: '続行するオプションを選択してください',
            noBankAccountAvailable: '申し訳ありませんが、利用可能な銀行口座がありません',
            noBankAccountSelected: 'アカウントを選択してください',
            taxID: '有効な税務ID番号を入力してください',
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
            industryCode: '有効な6桁の産業分類コードを入力してください',
            restrictedBusiness: '制限対象ビジネス一覧に該当しないビジネスであることを確認してください',
            routingNumber: '有効なルーティング番号を入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: '経路番号と口座番号を同じにすることはできません',
            companyType: '有効な会社の種類を選択してください',
            tooManyAttempts: 'ログイン試行回数が多すぎるため、このオプションは24時間無効になっています。後でもう一度お試しいただくか、代わりに手動で詳細を入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: '有効なSSNの下4桁を入力してください',
            firstName: '有効な名を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: 'デフォルトの入金先口座またはデビットカードを追加してください',
            validationAmounts: '入力した認証用の金額が正しくありません。銀行の取引明細を再確認してから、もう一度お試しください。',
            fullName: '有効な氏名を入力してください',
            ownershipPercentage: '有効なパーセント数値を入力してください',
            deletePaymentBankAccount: 'この銀行口座は、Expensify Card の支払いに使用されているため削除できません。この口座をそれでも削除したい場合は、Concierge までご連絡ください。',
            sameDepositAndWithdrawalAccount: '入金口座と出金口座が同じです。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'あなたの銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'アカウントの詳細を教えてください。',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: 'あなたの銀行口座の詳細は何ですか？',
        accountHolderInformationStepHeader: '口座名義人の詳細とは何ですか？',
        howDoWeProtectYourData: 'お客様のデータをどのように保護しますか？',
        currencyHeader: 'あなたの銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '以下の詳細を再確認し、確認するには利用規約のチェックボックスをオンにしてください。',
        toGetStarted: '払い戻しを受け取ったり、請求書を支払ったり、Expensify Wallet を有効にしたりするには、個人の銀行口座を追加します。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify のパスワードを入力',
        alreadyAdded: 'このアカウントはすでに追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人の銀行口座を追加しました！',
        successMessage: 'おめでとうございます。銀行口座の設定が完了し、精算の受け取りができるようになりました。',
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
            afterLinkText: '表示するには',
            formLabel: 'PDF を表示',
        },
        attachmentNotFound: '添付ファイルが見つかりません',
        retry: '再試行',
    },
    messages: {
        errorMessageInvalidPhone: `かっこやハイフンを使わずに有効な電話番号を入力してください。米国外にいる場合は、国コードを含めて入力してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} のメンバーです`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} の管理者です`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化リクエストを続行することにより、あなたは次の内容を読み、理解し、承諾したことを確認します',
        facialScan: 'Onfido 顔認証ポリシーおよび同意書',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido 顔認証ポリシーおよび同意書</a>、<a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>プライバシー</a> と <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>利用規約</a>。</muted-text-micro>`,
        tryAgain: '再試行',
        verifyIdentity: '本人確認',
        letsVerifyIdentity: '本人確認を行いましょう',
        butFirst: `でもまずは、退屈な内容から。次のステップで利用規約をよく読んで、準備ができたら「同意する」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラへのアクセスを有効にする',
        cameraRequestMessage: '銀行口座の認証を完了するには、カメラへのアクセス許可が必要です。設定 > New Expensify から有効にしてください。',
        microphonePermissionsNotGranted: 'マイクへのアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の認証を完了するためにマイクへのアクセス許可が必要です。設定 > New Expensify から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、本人確認書類のオリジナル画像をアップロードしてください。',
        documentNeedsBetterQuality:
            'ご提示いただいた本人確認書類は、損傷しているか、必要なセキュリティ要素が欠けているようです。損傷のない本人確認書類が全面はっきり写った元の画像をアップロードしてください。',
        imageNeedsBetterQuality: '本人確認書類の画像品質に問題があります。書類全体がはっきりと確認できる新しい画像をアップロードしてください。',
        selfieIssue: '自撮り写真／動画に問題があります。ライブの自撮り写真／動画をアップロードしてください。',
        selfieNotMatching: '自撮り写真／動画が本人確認書類と一致しません。顔がはっきりとわかる新しい自撮り写真／動画をアップロードしてください。',
        selfieNotLive: 'あなたの自撮り／動画はライブ写真／動画ではないようです。ライブの自撮り／動画をアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'ウォレットから送受金する前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: '本人確認を完了するために、あといくつか質問にお答えいただく必要があります。',
        helpLink: 'なぜこれが必要なのか詳しく見る',
        legalFirstNameLabel: '法的な名',
        legalMiddleNameLabel: '法的ミドルネーム',
        legalLastNameLabel: '法的な姓',
        selectAnswer: '続行するには応答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'お客様のSSNの確認に問題が発生しています。SSNの9桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前に、この情報を修正してください',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `ご本人様の確認ができませんでした。後でもう一度お試しいただくか、ご不明な点がありましたら <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> までお問い合わせください。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '料金と利用規約',
        haveReadAndAgreePlain: '電子開示を受け取ることを読み、同意しました。',
        haveReadAndAgree: `<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子開示</a>を受け取ることを読み、同意しました。`,
        agreeToThePlain: 'プライバシーおよびウォレット規約に同意します。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>および<a href="${walletAgreementUrl}">ウォレット利用規約</a>に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越／クレジット機能はありません。',
        electronicFundsWithdrawal: '電子資金引き落とし',
        standard: '標準',
        reviewTheFees: 'いくつかの手数料をご覧ください。',
        checkTheBoxes: '以下のチェックボックスを選択してください。',
        agreeToTerms: '利用規約に同意すれば、すぐに始められます！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensifyウォレットは${walletProgram}によって発行されています。`,
            perPurchase: '1回の購入ごと',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金チャージ',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会（提携内・提携外）',
            customerService: 'カスタマーサービス（自動応対またはオペレーター）',
            inactivityAfterTwelveMonths: '非アクティブ（12か月間取引がない場合）',
            weChargeOneFee: '他に1種類の手数料を請求しています。内容は次のとおりです。',
            fdicInsurance: 'お客様の資金はFDIC保険の適用対象です。',
            generalInfo: `プリペイド口座に関する一般的な情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>をご覧ください。`,
            conditionsDetails: `すべての手数料およびサービスの詳細と条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> をご覧いただくか、+1 833-400-0904 までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き出し（即時）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(最小 ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Expensify ウォレット手数料の一覧',
            typeOfFeeHeader: 'すべての手数料',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: 'アカウントの開設',
            openingAccountDetails: '口座を開設する手数料はかかりません。',
            monthlyFeeDetails: '月額料金はかかりません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス手数料は一切かかりません。',
            inactivityDetails: '非アクティブ料金は一切かかりません。',
            sendingFundsTitle: '別のアカウント保有者への送金',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使って他のアカウント保有者に送金しても、手数料はかかりません。',
            electronicFundsStandardDetails: '標準オプションを利用してExpensifyウォレットから銀行口座へ資金を振り込む場合、手数料はかかりません。通常、この振込は1～3営業日以内に完了します。',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                '即時振込オプションを使用して、Expensifyウォレットからリンク済みデビットカードへ資金を振り替える場合、手数料が発生します。通常、この振込は数分以内に完了します。' +
                `手数料は送金額の${percentage}%（最低手数料${amount}）です。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `お客様の資金はFDIC保険の対象です。お客様の資金はFDIC保険対象機関である${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}に預けられるか、または同機関へ送金されます。` +
                `そこに預けられた資金は、特定の預金保険要件が満たされ、かつカードが登録されている場合に限り、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} が破綻した際、FDIC により ${amount} まで保護されます。詳細は ${CONST.TERMS.FDIC_PREPAID} を参照してください。`,
            contactExpensifyPayments: `${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} には、+1 833-400-0904 へ電話するか、${CONST.EMAIL.CONCIERGE} にメールを送信するか、${CONST.NEW_EXPENSIFY_URL} にサインインしてお問い合わせください。`,
            generalInformation: `プリペイド口座に関する一般的な情報については、${CONST.TERMS.CFPB_PREPAID}をご覧ください。プリペイド口座に関する苦情がある場合は、消費者金融保護局（Consumer Financial Protection Bureau）に1-855-411-2372までお電話いただくか、${CONST.TERMS.CFPB_COMPLAINT}にアクセスしてください。`,
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動',
            liveAgent: 'ライブエージェント',
            instant: '即時',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最小 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効になりました！',
        activatedMessage: 'おめでとうございます。ウォレットの設定が完了し、支払いの準備ができました。',
        checkBackLaterTitle: '少々お待ちください…',
        checkBackLaterMessage: 'お客様の情報を現在確認中です。後ほどもう一度ご確認ください。',
        continueToPayment: '支払いに進む',
        continueToTransfer: '転送を続行',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'ほぼ完了です！セキュリティ上の理由から、いくつかの情報を確認する必要があります。',
        legalBusinessName: '法人名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        companyType: '会社種別',
        incorporationDate: '設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: '私は、この会社が次の対象ではないことを確認します',
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
        learnMore: '詳細はこちら',
        isMyDataSafe: '私のデータは安全ですか？',
    },
    personalInfoStep: {
        personalInfo: '個人情報',
        enterYourLegalFirstAndLast: 'あなたの法的な氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        legalName: '法的氏名',
        enterYourDateOfBirth: 'あなたの生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁は何ですか？',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        last4SSN: 'SSN の下4桁',
        enterYourAddress: 'あなたの住所は何ですか？',
        address: '住所',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は、以下を読み、理解し、同意したものとみなされます',
        whatsYourLegalName: '法的氏名は何ですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁は何ですか？',
        noPersonalChecks: 'ご安心ください。ここでは個人の信用情報の審査は一切行いません。',
        whatsYourPhoneNumber: '電話番号は何ですか？',
        weNeedThisToVerify: 'ウォレットを確認するためにこれが必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: 'あなたの会社名は何ですか？',
        businessName: '法人名',
        enterYourCompanyTaxIdNumber: '御社の税務ID番号は何ですか？',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9桁',
        enterYourCompanyWebsite: '御社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: '御社の住所はどこですか？',
        selectYourCompanyType: 'それはどのような種類の会社ですか？',
        companyType: '会社種別',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '御社の法人設立日はいつですか？',
        incorporationDate: '設立日',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'あなたの会社はどの州で法人登記されましたか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        companyAddress: '会社住所',
        listOfRestrictedBusinesses: '制限対象ビジネスの一覧',
        confirmCompanyIsNot: '私は、この会社が次の対象ではないことを確認します',
        businessInfoTitle: 'ビジネス情報',
        legalBusinessName: '法人名',
        whatsTheBusinessName: '会社名は何ですか？',
        whatsTheBusinessAddress: '会社の住所は何ですか？',
        whatsTheBusinessContactInformation: 'ビジネスの連絡先情報は何ですか？',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '会社登録番号（CRN）とは何ですか？';
                default:
                    return '法人登録番号は何ですか？';
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
        whatsThisNumber: 'これは何の番号ですか？',
        whereWasTheBusinessIncorporated: '会社はどこで法人登録されましたか？',
        whatTypeOfBusinessIsIt: 'どのような種類のビジネスですか？',
        whatsTheBusinessAnnualPayment: 'ビジネスの年間支払額はいくらですか？',
        whatsYourExpectedAverageReimbursements: '想定している平均の精算金額はいくらですか？',
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
                    return 'EU VAT';
            }
        },
        businessAddress: '会社住所',
        businessType: '業種',
        incorporation: '法人化',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人種別',
        businessCategory: 'ビジネスカテゴリ',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `年間支払額（${currencyCode}）`,
        averageReimbursementAmount: '平均精算額',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `${currencyCode}での平均精算額`,
        selectIncorporationType: '法人種別を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        selectBusinessType: '事業の種類を選択',
        findIncorporationType: '法人種別を検索',
        findBusinessCategory: 'ビジネスカテゴリを検索',
        findAnnualPaymentVolume: '年間支払額を確認',
        findIncorporationState: '法人設立州を検索',
        findAverageReimbursement: '平均精算額を見つける',
        findBusinessType: '事業形態を検索',
        error: {
            registrationNumber: '有効な登録番号を入力してください',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効な雇用者識別番号（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な法人番号（BN）を入力してください';
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
        doYouOwn25percent: (companyName: string) => `${companyName} の25％以上を所有していますか？`,
        doAnyIndividualOwn25percent: (companyName: string) => `${companyName} のうち 25% 以上を所有している個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `${companyName} の持分を25％以上所有している個人は、ほかにもいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '規制により、事業の持分を25％超所有している個人の本人確認を行うことが求められています。',
        companyOwner: 'ビジネスオーナー',
        enterLegalFirstAndLastName: 'オーナーの法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        enterTheDateOfBirthOfTheOwner: 'オーナーの生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁は何ですか？',
        last4SSN: 'SSN の下4桁',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        enterTheOwnersAddress: 'オーナーの住所は何ですか？',
        letsDoubleCheck: 'すべてが正しく見えるか、もう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することにより、お客様は、以下を読み、理解し、同意したものとみなされます',
        owners: 'オーナー',
    },
    ownershipInfoStep: {
        ownerInfo: 'オーナー情報',
        businessOwner: 'ビジネスオーナー',
        signerInfo: '署名者情報',
        doYouOwn: (companyName: string) => `${companyName} の25％以上を所有していますか？`,
        doesAnyoneOwn: (companyName: string) => `${companyName} のうち 25% 以上を所有している個人はいますか？`,
        regulationsRequire: '規制により、事業の25％を超えて所有しているすべての個人の本人確認を行うことが求められています。',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        whatsTheOwnersName: 'オーナーの法的氏名は何ですか？',
        whatsYourName: 'あなたの法的な氏名は何ですか？',
        whatPercentage: '事業のうち、オーナーの持分は何パーセントですか？',
        whatsYoursPercentage: 'あなたは事業の何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: 'オーナーの生年月日はいつですか？',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        whatsTheOwnersAddress: 'オーナーの住所は何ですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatAreTheLast: 'オーナーの社会保障番号の下4桁は何ですか？',
        whatsYourLast: 'あなたの社会保障番号の下4桁を入力してください。',
        whatsYourNationality: 'あなたの市民権を持つ国はどこですか？',
        whatsTheOwnersNationality: 'オーナーの国籍はどの国ですか？',
        countryOfCitizenship: '市民権のある国',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません！',
        last4: 'SSN の下4桁',
        whyDoWeAsk: 'なぜこの情報を求めるのですか？',
        letsDoubleCheck: 'すべてが正しく見えるか、もう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '持分比率',
        areThereOther: (companyName: string) => `${companyName} の25％以上を所有している他の個人はいますか？`,
        owners: 'オーナー',
        addCertified: '実質的支配者を示す認定済みの組織図を追加する',
        regulationRequiresChart: '規制により、事業の25％以上を所有するすべての個人または法人を示した、所有構成図の認証済みコピーを収集することが求められています。',
        uploadEntity: '事業体の所有権チャートをアップロード',
        noteEntity: '注: 事業体所有権チャートには、会計士、法律顧問の署名、または公証が必要です。',
        certified: '認定済み事業体所有構成表',
        selectCountry: '国を選択',
        findCountry: '国を検索',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加の書類をアップロード',
        pleaseUpload: 'ビジネス事業体の直接または間接の所有者として、25％以上を保有していることを確認するため、追加の証明書類を以下からアップロードしてください。',
        acceptedFiles: '受け付け可能なファイル形式：PDF、PNG、JPEG。各セクションごとの合計ファイルサイズは 5 MB を超えることはできません。',
        proofOfBeneficialOwner: '受益所有者の証明',
        proofOfBeneficialOwnerDescription:
            '過去3か月以内の日付が記載され、署名者の免許番号が含まれている、公認会計士、公証人、または弁護士が署名した宣誓書および組織図をご提出ください。これらの書類には、事業の25％以上を所有している者の所有権が確認できることが必要です。',
        copyOfID: '実質的支配者の身分証明書のコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など',
        proofOfAddress: '実質的所有者の住所証明',
        proofOfAddressDescription: '例：公共料金の請求書、賃貸契約書など',
        codiceFiscale: '税コード／Tax ID',
        codiceFiscaleDescription:
            '署名権限者との現地訪問時のビデオ、または録音済み通話のビデオをアップロードしてください。  \nビデオ内で署名権限者が以下を提供する必要があります：氏名、生年月日、会社名、登録番号、税コード番号、登録住所、事業内容、および口座の目的。',
    },
    completeVerificationStep: {
        completeVerification: '本人確認を完了',
        confirmAgreements: '以下の契約内容をご確認ください。',
        certifyTrueAndAccurate: '提供された情報が真実かつ正確であることを証明します',
        certifyTrueAndAccurateError: '情報が真実かつ正確であることを証明してください',
        isAuthorizedToUseBankAccount: '私は、このビジネス用銀行口座をビジネス支出に利用する権限を有しています',
        isAuthorizedToUseBankAccountError: 'ビジネス用銀行口座を操作する権限を持つ管理担当者である必要があります',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を認証する',
        validateButtonText: '検証',
        validationInputLabel: '取引',
        maxAttemptsReached: 'この銀行口座は、誤った試行が多すぎるため、認証が無効になりました。',
        description: `1～2営業日以内に、「Expensify, Inc. Validation」という名前などから、銀行口座に3件の少額取引を送金します。`,
        descriptionCTA: '各取引金額を以下のフィールドに入力してください。例：1.51',
        letsChatText: 'あと少しです！チャットで最後にいくつかの情報を確認するお手伝いをお願いします。準備はいいですか？',
        enable2FATitle: '不正行為を防ぐために、2 要素認証（2FA）を有効にする',
        enable2FAText: 'お客様のセキュリティを真剣に考えています。アカウントをさらに保護するために、今すぐ2要素認証（2FA）を設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    countryStep: {
        confirmBusinessBank: 'ビジネス銀行口座の通貨と国を確認',
        confirmCurrency: '通貨と国を確認',
        yourBusiness: 'ビジネスの銀行口座の通貨は、ワークスペースの通貨と一致している必要があります。',
        youCanChange: 'ワークスペースの通貨は、あなたの',
        findCountry: '国を検索',
        selectCountry: '国を選択',
    },
    bankInfoStep: {
        whatAreYour: 'あなたのビジネス用銀行口座の詳細を教えてください。',
        letsDoubleCheck: 'すべて問題なく見えるか、もう一度確認しましょう。',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        accountHolderNameDescription: '承認署名者の氏名',
    },
    signerInfoStep: {
        signerInfo: '署名者情報',
        areYouDirector: (companyName: string) => `${companyName} の取締役ですか？`,
        regulationRequiresUs: '規制により、署名者が事業を代表してこの行為を行う権限を有しているかどうかを確認する必要があります。',
        whatsYourName: '法的な氏名は何ですか',
        fullName: '法的氏名',
        whatsYourJobTitle: 'あなたの職種（役職）は何ですか？',
        jobTitle: '職種',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        uploadID: '身分証明書と住所証明書をアップロード',
        personalAddress: '本人住所を証明する書類（例：公共料金の請求書など）',
        letsDoubleCheck: 'すべてが正しく見えるか、もう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '本人住所証明',
        enterOneEmail: (companyName: string) => `${companyName} の取締役のメールアドレスを入力してください`,
        regulationRequiresOneMoreDirector: '規制により、署名者として最低でももう一人の取締役が必要です。',
        hangTight: '少々お待ちください…',
        enterTwoEmails: (companyName: string) => `${companyName} の取締役2名のメールアドレスを入力してください`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: 'ビジネスの取締役としての本人確認を、他の方が完了するのを待っています。',
        id: '身分証明書のコピー',
        proofOfDirectors: '取締役の証明書類',
        proofOfDirectorsDescription: '例：Oncorp Corporate Profile または Business Registration。',
        codiceFiscale: '納税者番号',
        codiceFiscaleDescription: '署名者、承認ユーザーおよび実質的支配者のための Codice Fiscale。',
        PDSandFSG: 'PDS + FSG 開示書類',
        PDSandFSGDescription: dedent(`
            Corpay とのパートナーシップでは API 接続を利用し、Corpay が有する広範な国際銀行パートナーのネットワークを活用して、Expensify におけるグローバル払い戻し機能を提供しています。オーストラリアの規制に基づき、Corpay の Financial Services Guide (FSG) および Product Disclosure Statement (PDS) をお送りします。

            FSG および PDS には、Corpay が提供する商品およびサービスの詳細と重要な情報が記載されていますので、注意深くお読みください。これらの文書は、将来の参照のために保管しておいてください。
        `),
        pleaseUpload: 'ビジネスの取締役であることを確認するため、以下に追加の書類をアップロードしてください。',
        enterSignerInfo: '署名者情報を入力',
        thisStep: 'このステップは完了しました',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `は、末尾が${bankAccountLastFour}の${currency}建てビジネス銀行口座をExpensifyに接続し、従業員への${currency}での支払いに利用しようとしています。次のステップでは、取締役の署名者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスは異なる必要があります',
        },
    },
    agreementsStep: {
        agreements: '契約',
        pleaseConfirm: '以下の同意事項を確認してください',
        regulationRequiresUs: '規制により、事業の持分を25％超所有している個人の本人確認を行うことが求められています。',
        iAmAuthorized: '私は、ビジネス支出のためにビジネス用銀行口座を利用する権限があります。',
        iCertify: '提供された情報が真実かつ正確であることを証明します。',
        iAcceptTheTermsAndConditions: `<a href="https://cross-border.corpay.com/tc/">利用規約</a> に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約と条件に同意します。',
        accept: '銀行口座を承認して追加',
        iConsentToThePrivacyNotice: '私は<a href="https://payments.corpay.com/compliance">プライバシーに関する通知</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシー通知に同意します。',
        error: {
            authorized: 'ビジネス用銀行口座を操作する権限を持つ管理担当者である必要があります',
            certify: '情報が真実かつ正確であることを証明してください',
            consent: 'プライバシー通知に同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusign フォーム',
        pleaseComplete:
            '下記のDocuSignリンクからACH承認フォームにご記入いただき、署名済みのコピーをこちらにアップロードしてください。そうすることで、当社がお客様の銀行口座から直接資金を引き落とせるようになります。',
        pleaseCompleteTheBusinessAccount: 'ビジネス口座申込の口座振替契約を完了してください',
        pleaseCompleteTheDirect:
            '以下のDocusignリンクから口座振替契約を完了し、署名済みのコピーをここにアップロードしてください。そうすれば、銀行口座から直接資金を引き落とせるようになります。',
        takeMeTo: 'DocuSign に移動',
        uploadAdditional: '追加の書類をアップロード',
        pleaseUpload: 'DEFT フォームと DocuSign 署名ページをアップロードしてください',
        pleaseUploadTheDirect: '口座振替契約書とDocuSign署名ページをアップロードしてください',
    },
    finishStep: {
        letsFinish: 'チャットで終わらせましょう！',
        thanksFor:
            '詳細のご提供ありがとうございます。専任サポート担当者が、ただ今いただいた情報を確認いたします。追加で必要な情報がある場合は、あらためてご連絡いたしますが、その間もご不明な点がありましたらお気軽にお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '不正行為を防ぐために二要素認証（2FA）を有効にする',
        weTake: 'お客様のセキュリティを真剣に考えています。アカウントをさらに保護するために、今すぐ2要素認証（2FA）を設定してください。',
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
        header: '出張を予約',
        title: 'スマートに旅しよう',
        subtitle: 'Expensify Travel を使って、最高の旅行プランを手に入れ、すべてのビジネス経費を一か所で管理しましょう。',
        features: {
            saveMoney: '予約で節約しましょう',
            alerts: '旅行計画が変更された場合のリアルタイムアラートを受け取る',
        },
        bookTravel: '出張を予約',
        bookDemo: 'デモを予約',
        bookADemo: 'デモを予約',
        toLearnMore: '詳細はこちらをご覧ください。',
        termsAndConditions: {
            header: '続行する前に…',
            title: '利用規約',
            label: '利用規約に同意します',
            subtitle: `Expensify Travel の<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります',
            defaultWorkspaceError:
                'Expensify Travel を有効にするには、デフォルトのワークスペースを設定する必要があります。  \n「設定」>「ワークスペース」> ワークスペース横の縦三点アイコンをクリック >「デフォルトのワークスペースに設定」を選択し、もう一度お試しください。',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '乗客',
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
            cancellationUntil: '次の日まで無料でキャンセル可能',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '払い戻し不可',
                freeCancellationUntil: '次の日まで無料でキャンセル可能',
                partiallyRefundable: '一部払い戻し可',
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
            cancellationUntil: '次の日まで無料でキャンセル可能',
            freeCancellation: '無料キャンセル',
            confirmation: '確認番号',
        },
        train: '鉄道',
        trainDetails: {
            passenger: '乗客',
            departs: '出発',
            arrives: '到着',
            coachNumber: 'コーチ番号',
            seat: '席',
            fareDetails: '運賃の詳細',
            confirmation: '確認番号',
        },
        viewTrip: '出張を表示',
        modifyTrip: '旅程を変更',
        tripSupport: '出張サポート',
        tripDetails: '出張の詳細',
        viewTripDetails: '旅行の詳細を表示',
        trip: '出張',
        trips: '出張',
        tripSummary: '出張サマリー',
        departs: '出発',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>出張を予約するには、<a href="${phoneErrorMethodsRoute}">勤務先のメールアドレスをメインのログインとして追加</a>してください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travel のセットアップ用ドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: (domain: string) =>
                `ドメイン <strong>${domain}</strong> に対して Expensify Travel を有効にする権限がありません。代わりに、そのドメインの担当者に Travel を有効にしてもらう必要があります。`,
            accountantInvitation: `あなたが会計士の場合、このドメインで出張を有効にするには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士プログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travel を始める',
            message: `Expensify Travel では、会社のメールアドレス（例：name@company.com）を使用する必要があり、個人のメールアドレス（例：name@gmail.com）は使用できません。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel は無効化されました',
            message: `管理者がExpensify Travelを無効にしました。出張の手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: 'リクエストを確認しています…',
            message: `Expensify Travel をご利用いただく準備ができているか確認するため、こちらでいくつかのチェックを行っています。まもなくご連絡いたします！`,
            confirmText: '了解しました',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン ${domain} の出張機能の有効化に失敗しました。このドメインの出張機能を確認して有効にしてください。`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）が予約されました。確認コード：${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）のチケットは無効になりました。`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）の航空券は、払い戻しまたは変更されています。`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}} のフライト ${airlineCode}（${origin} → ${destination}）は、航空会社によりキャンセルされました。`,
            flightScheduleChangePending: (airlineCode: string) => `航空会社が便名 ${airlineCode} のスケジュール変更を提案しており、現在確認待ちです。`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `スケジュール変更が確認されました：フライト ${airlineCode} の出発時刻は ${startDate} になりました。`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）が更新されました。`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `ご搭乗クラスは、${airlineCode} 便で ${cabinClass} に更新されました。`,
            flightSeatConfirmed: (airlineCode: string) => `${airlineCode}便の座席指定が確定しました。`,
            flightSeatChanged: (airlineCode: string) => `ご搭乗便 ${airlineCode} の座席指定が変更されました。`,
            flightSeatCancelled: (airlineCode: string) => `フライト ${airlineCode} の座席指定が解除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `${type} の予約 ${id} をキャンセルしました。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `ベンダーがあなたの${type}予約 ${id}をキャンセルしました。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `あなたの${type}予約は再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `${type}の予約が更新されました。旅程で新しい詳細を確認してください。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `${startDate} の ${origin} → ${destination} 行きの鉄道チケットが払い戻しされました。クレジットが処理されます。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行きの乗車券は、変更されました。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} 行きの鉄道チケットが更新されました。`,
            defaultUpdate: ({type}: TravelTypeParams) => `あなたの${type}予約が更新されました。`,
        },
        flightTo: 'フライト先',
        trainTo: '〜行きの列車',
        carRental: 'レンタカー',
        nightIn: '夜に',
        nightsIn: '泊数',
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
            reimburse: '精算',
            categories: 'カテゴリー',
            tags: 'タグ',
            customField1: 'カスタムフィールド 1',
            customField2: 'カスタムフィールド 2',
            customFieldHint: 'このメンバーからのすべての支出に適用されるカスタムコーディングを追加します。',
            reports: 'レポート',
            reportFields: 'レポート項目',
            reportTitle: 'レポートタイトル',
            reportField: 'レポートフィールド',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            perDiem: '日当',
            travel: '旅行',
            members: 'メンバー',
            accounting: '会計',
            receiptPartners: '領収書パートナー',
            rules: 'ルール',
            displayedAs: '表示形式',
            plan: 'プラン',
            profile: '概要',
            bankAccount: '銀行口座',
            testTransactions: 'テスト取引',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードを照合',
            selectAll: 'すべて選択',
            selected: () => ({
                one: '1件選択中',
                other: (count: number) => `${count} 件選択済み`,
            }),
            settlementFrequency: '清算頻度',
            setAsDefault: 'デフォルトのワークスペースとして設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信された領収書はこのワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？削除すると、すべてのカードフィードと割り当て済みカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。ワークスペースに新しいメンバーを招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページへのアクセス権がありません。このワークスペースに参加しようとしている場合は、ワークスペースのオーナーにメンバーとして追加してもらってください。ほかにお困りですか？${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
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
            descriptionHint: 'このワークスペースに関する情報を全メンバーと共有します。',
            welcomeNote: '払い戻しのための領収書の提出には Expensify を使用してください。ありがとうございます！',
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
                header: 'ワークスペースを他のメンバーと共有する',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `このQRコードを共有するか、下のリンクをコピーすると、メンバーがあなたのワークスペースへのアクセスを簡単にリクエストできるようになります。ワークスペースへの参加リクエストはすべて、あなたが確認できるように <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> ルームに表示されます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続したことがあるため、既存の接続を再利用するか、新しい接続を作成するかを選択できます。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 最終同期日 ${formattedDate}`,
            authenticationError: (connectionName: string) => `認証エラーのため、${connectionName} に接続できません。`,
            learnMore: '詳細はこちら',
            memberAlternateText: 'レポートを提出して承認する。',
            adminAlternateText: 'レポートとワークスペース設定を管理します。',
            auditorAlternateText: 'レポートを表示してコメントする。',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '管理者';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '監査担当者';
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
                semimonthly: '月2回',
                monthly: '毎月',
            },
            planType: 'プランの種類',
            defaultCategory: 'デフォルトのカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} の経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card の取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">当社のインテグレーション</a>によって作成される「Expensify Card 負債勘定」に自動的にエクスポートされます。</muted-text-label>`,
            youCantDowngradeInvoicing:
                '請求書払いのサブスクリプションでは、プランをダウングレードできません。サブスクリプションについて相談したり変更したりする場合は、アカウントマネージャーまたはConciergeまでお問い合わせください。',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `${organizationName} に接続しました` : '組織全体の出張およびフードデリバリー経費を自動化します。',
                sendInvites: '招待を送信',
                sendInvitesDescription: 'これらのワークスペースメンバーは、まだ Uber for Business アカウントを持っていません。今は招待したくないメンバーの選択を解除してください。',
                confirmInvite: '招待を確認',
                manageInvites: '招待を管理',
                confirm: '確認',
                allSet: '準備完了',
                readyToRoll: '準備完了です',
                takeBusinessRideMessage: 'ビジネスでUberに乗れば、領収書がExpensifyに自動で取り込まれます。さあ急いで！',
                all: 'すべて',
                linked: '連携済み',
                outstanding: '未処理',
                status: {
                    resend: '再送',
                    invite: '招待',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: '連携済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '一時停止中',
                },
                centralBillingAccount: '中央請求アカウント',
                centralBillingDescription: 'すべての Uber 領収書をどこに取り込むかを選択してください。',
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
            subtitle: `<muted-text>日当レートを設定して、従業員の1日あたりの支出を管理しましょう。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳細はこちら</a>。</muted-text>`,
            amount: '金額',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            deletePerDiemRate: '日当レートを削除',
            findPerDiemRate: '日当料金を検索',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            emptyList: {
                title: '日当',
                subtitle: '社員の1日あたりの支出を管理するために、日当レートを設定しましょう。まずはスプレッドシートからレートをインポートしてください。',
            },
            importPerDiemRates: '日当レートをインポート',
            editPerDiemRate: '日当レートを編集',
            editPerDiemRates: '日当レートを編集',
            editDestinationSubtitle: (destination: string) => `この宛先を更新すると、すべての${destination}の日当サブレートに適用されます。`,
            editCurrencySubtitle: (destination: string) => `この通貨を更新すると、すべての${destination}の日当サブレートが変更されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '自己負担経費を QuickBooks Desktop にどのようにエクスポートするかを設定します。',
            exportOutOfPocketExpensesCheckToggle: 'Mark checks as「後で印刷」',
            exportDescription: 'Expensify のデータを QuickBooks Desktop へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書を書き出し先',
            exportExpensifyCard: 'Expensify Card の取引を次の形式でエクスポート',
            account: 'アカウント',
            accountDescription: '仕訳をどこに投稿するかを選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: 'ベンダー請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: 'どこから小切手を送るかを選択してください。',
            creditCardAccount: 'クレジットカード口座',
            exportDate: {
                label: 'エクスポート日',
                description: 'この日付を、レポートを QuickBooks Desktop にエクスポートするときに使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内の最新経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Desktop にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認用に提出された日付。',
                    },
                },
            },
            exportCheckDescription: '各Expensifyレポートごとに明細付きの小切手を作成し、以下の銀行口座から送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に転記します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、下記の勘定科目に追加します。この期間が締められている場合は、次の未締期間の1日付で計上します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop は仕訳のエクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合は、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エントリ',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '確認',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '各Expensifyレポートごとに明細付きの小切手を作成し、以下の銀行口座から送金します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の該当する仕入先と照合します。仕入先が存在しない場合は、紐づけのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付を使用して明細付きの仕入先請求書を作成し、下記のアカウントに追加します。該当期間が締め済みの場合は、次のオープン期間の1日付で記帳します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'どこから小切手を送るかを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '税金が有効になっている場合は、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Desktop にアカウントを追加して、もう一度接続を同期してください',
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
                    `<muted-text><centered-text>現在、QuickBooks Desktop との接続が機能していません。しばらくしてからもう一度お試しいただくか、問題が解決しない場合は<a href="${conciergeLink}">Concierge へお問い合わせください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks Desktop から Expensify へインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            items: 'アイテム',
            customers: '顧客／プロジェクト',
            exportCompanyCardsDescription: '会社カードの購入をQuickBooks Desktopへどのようにエクスポートするかを設定します。',
            defaultVendorDescription: 'エクスポート時に、すべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            accountsDescription: 'QuickBooks Desktop の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリとして有効または無効の状態でインポートするか選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Desktop のクラスをどのように処理するかを選択してください。',
            tagsDisplayedAsDescription: '明細行レベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'Expensify で QuickBooks Desktop の顧客／プロジェクトをどのように処理するかを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に QuickBooks Desktop と同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、存在しない場合は QuickBooks Desktop にベンダーを自動的に作成します。',
            },
            itemsDescription: 'Expensify で QuickBooks Desktop の品目をどのように扱うかを選択してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生基準',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '実費経費は支払い時にエクスポートされます',
                },
            },
        },
        qbo: {
            connectedTo: '接続済み',
            importDescription: 'QuickBooks Online から Expensify にインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            locations: '場所',
            customers: '顧客／プロジェクト',
            accountsDescription: 'QuickBooks Online の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリとして有効または無効の状態でインポートするか選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Online のクラスをどのように扱うかを選択してください。',
            customersDescription: 'Expensify で QuickBooks Online の顧客／プロジェクトをどのように処理するかを選択してください。',
            locationsDescription: 'Expensify で QuickBooks Online のロケーションをどのように処理するかを選択してください。',
            taxesDescription: 'Expensify で QuickBooks Online の税金の処理方法を選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online は、小切手や仕入先請求書の明細行レベルで「ロケーション」をサポートしていません。明細行レベルでロケーションを使用したい場合は、仕訳伝票およびクレジット／デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online は仕訳伝票への税金の適用をサポートしていません。エクスポートオプションを「仕入先請求書」または「小切手」に変更してください。',
            exportDescription: 'Expensify のデータを QuickBooks Online へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書を書き出し先',
            exportExpensifyCard: 'Expensify Card の取引を次の形式でエクスポート',
            exportDate: {
                label: 'エクスポート日',
                description: 'QuickBooks Online へレポートをエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内の最新経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Online にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認用に提出された日付。',
                    },
                },
            },
            receivable: '売掛金', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '売掛金アーカイブ', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: '請求書をQuickBooks Onlineへエクスポートする際に、この口座を使用してください。',
            exportCompanyCardsDescription: '会社カードでの支出を QuickBooks Online へどのようにエクスポートするかを設定します。',
            vendor: 'ベンダー',
            defaultVendorDescription: 'エクスポート時に、すべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            exportOutOfPocketExpensesDescription: '実費精算が QuickBooks Online にエクスポートされる方法を設定します。',
            exportCheckDescription: '各Expensifyレポートごとに明細付きの小切手を作成し、以下の銀行口座から送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に転記します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、下記の勘定科目に追加します。この期間が締められている場合は、次の未締期間の1日付で計上します。',
            account: 'アカウント',
            accountDescription: '仕訳をどこに投稿するかを選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: 'ベンダー請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: 'どこから小切手を送るかを選択してください。',
            creditCardAccount: 'クレジットカード口座',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online は、ベンダー請求書のエクスポートでロケーションをサポートしていません。ワークスペースでロケーションを有効にしているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online は仕訳エントリーのエクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合は、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に QuickBooks Online と同期します。',
                inviteEmployees: '従業員を招待',
                inviteEmployeesDescription: 'QuickBooks Online の従業員レコードをインポートして、このワークスペースに従業員を招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Online に業者がまだ存在しない場合は自動的に作成し、請求書をエクスポートする際には顧客も自動作成します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が、下記の QuickBooks Online アカウントに作成されます。',
                qboBillPaymentAccount: 'QuickBooks 請求書支払口座',
                qboInvoiceCollectionAccount: 'QuickBooks 請求書回収勘定',
                accountSelectDescription: 'どこから請求書を支払うかを選択すると、QuickBooks Online 内に支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、QuickBooks Online 内に支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エントリ',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '確認',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'デビットカード取引の店舗名を、QuickBooks 内の対応する仕入先に自動的に照合します。仕入先が存在しない場合は、関連付けのために「Debit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、自動的に QuickBooks 内の該当する仕入先と照合します。仕入先が存在しない場合は、紐づけのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付を使用して明細付きの仕入先請求書を作成し、下記のアカウントに追加します。該当期間が締め済みの場合は、次のオープン期間の1日付で記帳します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合は、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポート用に有効な口座を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポート用の有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手のエクスポート用に有効な口座を選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書のエクスポートを使用するには、QuickBooks Online で買掛金勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Online で仕訳用勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェックエクスポートを使用するには、QuickBooks Online に銀行口座を設定してください',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Online に口座を追加して、接続をもう一度同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生基準',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '実費経費は支払い時にエクスポートされます',
                },
            },
        },
        workspaceList: {
            joinNow: '今すぐ参加',
            askToJoin: '参加をリクエスト',
        },
        xero: {
            organization: 'Xero組織',
            organizationDescription: 'データをインポートしたい Xero の組織を選択してください。',
            importDescription: 'Xero から Expensify にインポートするコード設定を選択してください。',
            accountsDescription: 'Xeroの勘定科目表は、Expensifyにカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリとして有効または無効の状態でインポートするか選択します。',
            accountsSwitchDescription: '有効化されたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリ',
            trackingCategoriesDescription: 'Expensify で Xero のトラッキングカテゴリーをどのように処理するか選択してください。',
            mapTrackingCategoryTo: (categoryName: string) => `Xero の ${categoryName} をマッピング先に指定`,
            mapTrackingCategoryToDescription: (categoryName: string) => `${categoryName} を Xero へエクスポートする際のマッピング先を選択してください。`,
            customers: '顧客へ再請求',
            customersDescription: 'Expensify で顧客への再請求を行うかどうかを選択します。Xero の顧客連絡先を経費にタグ付けでき、そのまま Xero に売上請求書としてエクスポートされます。',
            taxesDescription: 'Expensify で Xero の税金をどのように処理するか選択してください。',
            notImported: '未インポート',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポート項目',
            },
            exportDescription: 'Expensify のデータを Xero へエクスポートする方法を設定します。',
            purchaseBill: '買掛請求書',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、以下の Xero 銀行口座に銀行取引として記帳され、取引日付は銀行取引明細書の日付と一致します。',
            bankTransactions: '銀行取引',
            xeroBankAccount: 'Xero 銀行口座',
            xeroBankAccountDescription: '経費を銀行取引としてどこに計上するかを選択してください。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで仕入請求書としてエクスポートされます。',
            purchaseBillDate: '購入請求書日',
            exportInvoices: '請求書を次の形式でエクスポート',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '販売請求書には、常に請求書を送信した日付が表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に Xero と同期します。',
                purchaseBillStatusTitle: '購入請求書のステータス',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する請求書支払いが下記の Xero アカウント内に作成されます。',
                xeroBillPaymentAccount: 'Xero請求支払口座',
                xeroInvoiceCollectionAccount: 'Xero 請求書回収勘定',
                xeroBillPaymentAccountDescription: '請求書の支払い元を選択すると、Xero 内に支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、Xero 内に支払いを作成します。',
            },
            exportDate: {
                label: '購入請求書日',
                description: 'レポートをXeroにエクスポートする際にこの日付を使用します。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内の最新経費の日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがXeroにエクスポートされた日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認用に提出された日付。',
                    },
                },
            },
            invoiceStatus: {
                label: '購入請求書のステータス',
                description: 'Xero に購入請求書をエクスポートするときにこのステータスを使用します。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xero にアカウントを追加して、もう一度接続を同期してください',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生基準',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '実費経費は支払い時にエクスポートされます',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日',
                description: 'Sage Intacct へレポートをエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内の最新経費の日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが Sage Intacct にエクスポートされた日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認用に提出された日付。',
                    },
                },
            },
            reimbursableExpenses: {
                description: '実費経費を Sage Intacct へどのようにエクスポートするかを設定します。',
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
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Sage Intacct で一致するベンダーがない${isReimbursable ? '' : '非'}償還対象経費に適用されるデフォルトのベンダーを設定します。`,
            exportDescription: 'Expensify データを Sage Intacct へエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先するエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で個々の会社カードごとに異なるエクスポート口座を設定している場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントで、エクスポート対象のレポートを確認できるようになります。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacct にアカウントを追加して、もう一度接続を同期してください`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensify は毎日自動的に Sage Intacct と同期されます。',
            inviteEmployees: '従業員を招待',
            inviteEmployeesDescription:
                'Sage Intacct の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認になり、「メンバー」ページでさらに設定できます。',
            syncReimbursedReports: '支払済みレポートを同期',
            syncReimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が、以下の Sage Intacct アカウントに作成されます。',
            paymentAccount: 'Sage Intacct 支払口座',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生基準',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '実費経費は支払い時にエクスポートされます',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'NetSuite でデータをインポートしたい子会社を選択してください。',
            exportDescription: 'Expensify のデータを NetSuite へどのようにエクスポートするかを設定します。',
            exportInvoices: '請求書を書き出し先',
            journalEntriesTaxPostingAccount: '仕訳帳エントリの税金計上勘定',
            journalEntriesProvTaxPostingAccount: '仕訳の州税計上勘定',
            foreignCurrencyAmount: '外貨金額をエクスポート',
            exportToNextOpenPeriod: '次の未締め期間にエクスポート',
            nonReimbursableJournalPostingAccount: '非払い戻し仕訳計上勘定',
            reimbursableJournalPostingAccount: '立替精算仕訳の計上勘定',
            journalPostingPreference: {
                label: '仕訳帳の記帳設定',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各レポートごとの単一の明細エントリ',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各経費に対して 1 つの明細',
                },
            },
            invoiceItem: {
                label: '請求書アイテム',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '私の分を作成してください',
                        description: 'エクスポート時に（まだ存在しない場合は）「Expensify請求書の明細行」を作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: '以下で選択された項目に、Expensify の請求書を紐付けます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日',
                description: 'NetSuite にレポートをエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最後の経費の日付',
                        description: 'レポート内の最新経費の日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがNetSuiteにエクスポートされた日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認用に提出された日付。',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '経費精算書',
                        reimbursableDescription: 'NetSuite へは、立替経費が経費レポートとしてエクスポートされます。',
                        nonReimbursableDescription: '会社カードの経費は、経費レポートとして NetSuite にエクスポートされます。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '仕入先請求書',
                        reimbursableDescription: dedent(`
                            実費経費は、以下で指定された NetSuite ベンダーに支払う請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、下記で指定された NetSuite ベンダー宛ての支払対象請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳伝票',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite 勘定科目へ仕訳としてエクスポートされます。

                            各カードごとに特定の仕入先を設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに切り替えると、各カード用の NetSuite 仕入先および振替勘定は無効になります。\n\nご安心ください。後で元に戻したくなった場合に備えて、以前の選択内容は引き続き保存されます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に NetSuite と同期します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が以下の NetSuite アカウント内に作成されます。',
                reimbursementsAccount: '払い戻し用口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択してください。選択された口座に対応する支払いを NetSuite 内に作成します。',
                collectionsAccount: '回収口座',
                collectionsAccountDescription: 'Expensifyで請求書が支払済みにマークされてNetSuiteへエクスポートされると、下記の勘定科目に紐づいて表示されます。',
                approvalAccount: '買掛金承認アカウント',
                approvalAccountDescription:
                    'NetSuite で取引の承認先となる勘定科目を選択してください。払い戻し済みレポートを同期する場合、請求書支払が作成される勘定科目もこの勘定科目になります。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定',
                inviteEmployeesDescription:
                    'NetSuite の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認となり、*メンバー* ページでさらに設定できます。',
                autoCreateEntities: '従業員／ベンダーを自動作成',
                enableCategories: '新しくインポートされたカテゴリを有効にする',
                customFormID: 'カスタムフォーム ID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定されている優先トランザクションフォームを使用して仕訳を作成します。別の方法として、使用する特定のトランザクションフォームを指定することもできます。',
                customFormIDReimbursable: '立替経費',
                customFormIDNonReimbursable: '法人カード経費',
                exportReportsTo: {
                    label: '経費レポートの承認レベル',
                    description: 'Expensify で経費レポートが承認され NetSuite にエクスポートされると、仕訳を記帳する前に NetSuite で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '上司承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '経理承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '上長および経理が承認済み',
                    },
                },
                accountingMethods: {
                    label: 'エクスポートのタイミング',
                    description: '経費をエクスポートするタイミングを選択してください:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生基準',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '最終承認されると、立替経費がエクスポートされます',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '実費経費は支払い時にエクスポートされます',
                    },
                },
                exportVendorBillsTo: {
                    label: 'ベンダー請求書の承認レベル',
                    description: 'ベンダー請求書がExpensifyで承認されNetSuiteにエクスポートされると、仕訳計上前にNetSuite内で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '投稿承認済み',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensify で仕訳が承認され NetSuite にエクスポートされると、仕訳を記帳する前に、NetSuite 側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '投稿承認済み',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォーム ID を入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuite にアカウントを追加して、もう一度接続を同期してください',
            noVendorsFound: 'ベンダーが見つかりません',
            noVendorsFoundDescription: 'NetSuite に仕入先を追加して、接続をもう一度同期してください',
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
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に移動し、*token-based authentication* を有効にしてください。',
                    },
                    enableSoapServices: {
                        title: 'SOAP Webサービスを有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に進み、*SOAP Web Services* を有効にします。',
                    },
                    createAccessToken: {
                        title: 'アクセストークンを作成',
                        description:
                            'NetSuite で、*Setup > Users/Roles > Access Tokens* に移動し、「Expensify」アプリと「Expensify Integration」ロールまたは「Administrator」ロールのいずれかに対してアクセス・トークンを作成します。\n\n*重要:* この手順で表示される *Token ID* と *Token Secret* を必ず保存してください。次の手順で必要になります。',
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
                expenseCategories: '経費カテゴリ',
                expenseCategoriesDescription: 'NetSuite の経費カテゴリーは、Expensify にカテゴリーとしてインポートされます。',
                crossSubsidiaryCustomers: '複数子会社間の顧客／プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'ExpensifyでNetSuiteの *departments* をどのように扱うかを選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensify で *クラス* をどのように処理するかを選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensify で *位置情報* をどのように扱うかを選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客／プロジェクト',
                    subtitle: 'Expensify で NetSuite の「顧客」と「プロジェクト」をどのように処理するかを選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: (importFields: string[], importType: string) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite から税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下からオプションを選択してください：',
                    label: (importedTypes: string[]) => `${importedTypes.join('と')} としてインポートされました`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `${fieldName}を入力してください`,
                    customSegments: {
                        title: 'カスタムセグメント／レコード',
                        addText: 'カスタムセグメント／レコードを追加',
                        recordTitle: 'カスタムセグメント／レコード',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '詳細な手順を表示',
                        helpText: 'カスタムセグメント／レコードの設定について。',
                        emptyTitle: 'カスタムセグメントまたはカスタムレコードを追加',
                        fields: {
                            segmentName: '名前',
                            internalID: '内部 ID',
                            scriptID: 'スクリプトID',
                            customRecordScriptID: '取引列ID',
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
                            segmentRecordType: 'カスタムセグメントとカスタムレコードのどちらを追加しますか？',
                            customSegmentNameTitle: 'カスタムセグメント名は何ですか？',
                            customRecordNameTitle: 'カスタムレコード名は何ですか？',
                            customSegmentNameFooter: `NetSuite の「Customizations > Links, Records & Fields > Custom Segments」ページで、カスタムセグメント名を確認できます。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customRecordNameFooter: `NetSuite でカスタムレコード名を見つけるには、グローバル検索で「Transaction Column Field」と入力してください。

_より詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentInternalIDTitle: '内部 ID は何ですか？',
                            customSegmentInternalIDFooter: `まず、NetSuite で内部 ID を有効にしていることを確認してください（*Home > Set Preferences > Show Internal ID*）。

NetSuite でカスタムセグメントの内部 ID を見つけるには、次の場所を確認します。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. カスタムセグメントをクリックします。
3. *Custom Record Type* の横にあるハイパーリンクをクリックします。
4. 下部のテーブルで内部 ID を探します。

_より詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordInternalIDFooter: `次の手順で、NetSuite 内のカスタムレコードの内部 ID を確認できます。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されている内部 ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentScriptIDTitle: 'スクリプト ID は何ですか？',
                            customSegmentScriptIDFooter: `NetSuite でカスタムセグメントのスクリプト ID を確認するには、次の手順に従ってください。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックして開きます。
3. 画面下部付近の *Application and Sourcing* タブをクリックし、次のいずれかを実行します。
    a. カスタムセグメントを Expensify の *タグ*（明細レベル）として表示したい場合は、*Transaction Columns* サブタブをクリックし、*Field ID* を使用します。
    b. カスタムセグメントを Expensify の *レポートフィールド*（レポートレベル）として表示したい場合は、*Transactions* サブタブをクリックし、*Field ID* を使用します。

_詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordScriptIDTitle: 'トランザクション列IDは何ですか？',
                            customRecordScriptIDFooter: `NetSuite でカスタムレコードのスクリプト ID を見つけるには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されているスクリプト ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentMappingTitle: 'このカスタムセグメントは、Expensify でどのように表示されるべきですか？',
                            customRecordMappingTitle: 'このカスタムレコードは Expensify でどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `この${fieldName?.toLowerCase()}を持つカスタムセグメント / レコードは既に存在します`,
                        },
                    },
                    customLists: {
                        title: 'カスタムリスト',
                        addText: 'カスタムリストを追加',
                        recordTitle: 'カスタムリスト',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '詳細な手順を表示',
                        helpText: 'カスタムリストの設定について。',
                        emptyTitle: 'カスタムリストを追加',
                        fields: {
                            listName: '名前',
                            internalID: '内部 ID',
                            transactionFieldID: '取引フィールドID',
                            mapping: '表示形式',
                        },
                        removeTitle: 'カスタムリストを削除',
                        removePrompt: 'このカスタムリストを削除してもよろしいですか？',
                        addForm: {
                            listNameTitle: 'カスタムリストを選択',
                            transactionFieldIDTitle: '取引フィールドIDは何ですか？',
                            transactionFieldIDFooter: `NetSuite で取引フィールド ID を確認するには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムリストをクリックして開きます。
3. 左側に表示される取引フィールド ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            mappingTitle: 'このカスタムリストは Expensify でどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールド ID を使用したカスタムリストはすでに存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 従業員のデフォルト',
                        description: 'Expensify にインポートされず、エクスポート時に適用されます',
                        footerContent: (importField: string) =>
                            `NetSuite で ${importField} を使用する場合、Expense Report または Journal Entry へエクスポートする際に、従業員レコードに設定されているデフォルトを適用します。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: '明細行レベル',
                        footerContent: (importField: string) => `${startCase(importField)} は、従業員のレポート上の各経費ごとに個別に選択できるようになります。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'レポート項目',
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
            followSteps: '「操作方法：Sage Intacct に接続する」手順に従ってください',
            enterCredentials: 'Sage Intacct の認証情報を入力してください',
            entity: '法人',
            employeeDefault: 'Sage Intacct 従業員デフォルト',
            employeeDefaultDescription: '従業員にデフォルトの部門が存在する場合、その部門が Sage Intacct 内の経費に適用されます。',
            displayedAsTagDescription: '従業員のレポート内の各経費ごとに、部門を選択できるようになります。',
            displayedAsReportFieldDescription: '部門の選択は、従業員のレポート内のすべての経費に適用されます。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Expensify で Sage Intacct の <strong>${mappingTitle}</strong> をどのように処理するかを選択してください。`,
            expenseTypes: '経費タイプ',
            expenseTypesDescription: 'お使いの Sage Intacct の経費タイプは、Expensify ではカテゴリーとしてインポートされます。',
            accountTypesDescription: 'Sage Intacct の勘定科目表は、Expensify ではカテゴリとしてインポートされます。',
            importTaxDescription: 'Sage Intacct から仕入れ税率をインポートします。',
            userDefinedDimensions: 'ユーザー定義ディメンション',
            addUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            integrationName: '連携名',
            dimensionExists: 'この名前のディメンションはすでに存在します。',
            removeDimension: 'ユーザー定義ディメンションを削除',
            removeDimensionPrompt: 'このユーザー定義ディメンションを削除してもよろしいですか？',
            userDefinedDimension: 'ユーザー定義ディメンション',
            addAUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            detailedInstructionsLink: '詳細な手順を表示',
            detailedInstructionsRestOfSentence: 'ユーザー定義ディメンションを追加する際に。',
            userDimensionsAdded: () => ({
                one: 'UDDを1件追加しました',
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
                    cdf: 'Mastercard 商用カード',
                    vcf: 'Visaコマーシャルカード',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `カード発行会社はどちらですか？`,
                whoIsYourBankAccount: 'あなたの銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: '銀行への接続方法を選択してください',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>について詳しく見る。</muted-text>`,
                commercialFeedDetails: 'ご利用の銀行での設定が必要です。通常は大企業で使用され、条件を満たす場合は最適なオプションとなることが多いです。',
                commercialFeedPlaidDetails: `銀行での設定が必要ですが、設定手順はご案内します。通常は大企業に限られます。`,
                directFeedDetails: '最も簡単な方法です。マスター認証情報を使用して、すぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: (provider: string) => `${provider} フィードを有効にする`,
                    heading: 'お使いのカード発行会社と直接連携しており、取引データを迅速かつ正確に Expensify に取り込むことができます。\n\n開始するには、次の手順に従ってください。',
                    visa: '私たちはVisaとグローバル連携していますが、対象となるかどうかは銀行やカードプログラムによって異なります。\n\nご利用を開始するには、次のステップに従ってください。',
                    mastercard:
                        'Mastercardとのグローバル連携がありますが、ご利用いただけるかどうかは銀行およびカードプログラムによって異なります。\n\n開始するには、次の手順に従ってください。',
                    vcf: `1. Visa Commercial Card の設定方法についての詳しい手順は、[このヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。

2. プログラムで商用フィードがサポートされているか確認し、有効化を依頼するために、[銀行に連絡](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})してください。

3. *フィードが有効化され、その詳細がわかったら、次の画面に進んでください。*`,
                    gl1025: `1. お使いのプログラムで American Express がコマーシャルフィードを有効にできるかどうか確認するには、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})をご覧ください。

2. フィードが有効化されると、Amex から本番用レターが送付されます。

3. *フィード情報がそろったら、次の画面に進んでください。*`,
                    cdf: `1. Mastercard Commercial Cards の設定手順については、[このヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。

2. ご利用のプログラムで商用フィードがサポートされているか確認し、有効化を依頼するために、[銀行に連絡](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})してください。

3. *フィードが有効になり、その詳細が分かったら、次の画面へ進んでください。*`,
                    stripe: `1. Stripe のダッシュボードにアクセスし、[Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}) に進みます。

2. 「Product Integrations」の下で、Expensify の横にある「Enable」をクリックします。

3. フィードが有効になったら、下の「Submit」をクリックしてください。追加作業を進めます。`,
                },
                whatBankIssuesCard: 'これらのカードはどの銀行が発行していますか？',
                enterNameOfBank: '銀行名を入力',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細とは何ですか？',
                        processorLabel: 'プロセッサー ID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社ID',
                        helpLabel: 'これらのIDはどこで見つけられますか？',
                    },
                    gl1025: {
                        title: `Amex 配信用ファイル名は何ですか？`,
                        fileNameLabel: '配送ファイル名',
                        helpLabel: '配送ファイル名はどこで確認できますか？',
                    },
                    cdf: {
                        title: `Mastercard の配布 ID とは何ですか？`,
                        distributionLabel: 'ディストリビューション ID',
                        helpLabel: '配布 ID はどこで確認できますか？',
                    },
                },
                amexCorporate: 'カードの表面に「Corporate」と記載されている場合は、これを選択してください',
                amexBusiness: 'カードの表面に「Business」と表示されている場合は、これを選択してください',
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
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '月末最終日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '月末最終営業日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'カスタム月日',
            },
            assignCard: 'カードを割り当てる',
            findCard: 'カードを検索',
            cardNumber: 'カード番号',
            commercialFeed: '商用フィード',
            feedName: (feedName: string) => `${feedName} カード`,
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseTheCardholder: 'カード所有者を選択',
            chooseCard: 'カードを選択',
            chooseCardFor: (assignee: string) =>
                `<strong>${assignee}</strong> に使うカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードには有効なカードがありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>または、何かが壊れている可能性があります。いずれにしても、ご不明な点があれば、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択',
            startDateDescription: 'この日付以降のすべての取引をインポートします。日付が指定されていない場合は、ご利用の銀行が許可する限り過去にさかのぼってインポートします。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタム締め日',
            letsDoubleCheck: 'すべてが正しく見えるか、もう一度確認しましょう。',
            confirmationDescription: '取引のインポートを直ちに開始します。',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィード接続が切断されています。再度接続を確立するために、<a href="#">銀行にログイン</a>してください。</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} に ${link} を割り当てました！インポートされた取引はこのチャットに表示されます。`,
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limited は、Plaid Financial Ltd. の代理人であり、Payment Services Regulations 2017 に基づき Financial Conduct Authority によって規制されている認可支払機関です（企業登録番号：804718）。Plaid は、その代理人である Expensify Limited を通じて、規制対象の口座情報サービスをお客様に提供します。',
            assign: '割り当て',
            assignCardFailedError: 'カードの割り当てに失敗しました。',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            unassignCardFailedError: 'カードの割り当て解除に失敗しました。',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify カードの発行と管理',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            verificationInProgress: '確認を進めています…',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensify Card を発行できる準備が整いましたら、Concierge からお知らせします。',
            disclaimer:
                'Expensify Visa® Commercial Card は、Visa U.S.A. Inc. からのライセンスに基づき、The Bancorp Bank, N.A., Member FDIC によって発行されており、Visa カードを受け付けるすべての加盟店で使用できるとは限りません。Apple® および Apple ロゴ® は、米国およびその他の国において登録された Apple Inc. の商標です。App Store は Apple Inc. のサービスマークです。Google Play および Google Play ロゴは、Google LLC の商標です。',
            euUkDisclaimer:
                'EEA在住者に提供されるカードはTransact Payments Malta Limitedが発行し、英国在住者に提供されるカードはVisa Europe Limitedのライセンスに基づきTransact Payments Limitedが発行します。Transact Payments Malta Limitedは、1994年金融機関法に基づく金融機関としてマルタ金融サービス庁に正式に認可・監督されています。登録番号 C 91879。Transact Payments Limitedはジブラルタル金融サービス委員会の認可および監督を受けています。',
            issueCard: 'カードを発行',
            findCard: 'カードを検索',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '下4桁',
            limit: '制限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在の残高は、前回の決済日以降に発生した、すべての計上済み Expensify Card 取引の合計です。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `残高は${settlementDate}に清算されます`,
            settleBalance: '残高を精算',
            cardLimit: 'カード上限',
            remainingLimit: '残りの上限',
            requestLimitIncrease: 'リクエスト上限の引き上げ',
            remainingLimitDescription:
                '残りの利用限度額を算出する際には、いくつかの要素を考慮します。お客様としてのご利用期間、サインアップ時にご提供いただいた事業関連情報、そして事業用銀行口座の利用可能残高です。残りの利用限度額は、日々変動する可能性があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース全体での月次の清算済み Expensify Card 利用額に基づいています。',
            issueNewCard: '新しいカードを発行',
            finishSetup: 'セットアップを完了',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: '既存のビジネス銀行口座を選択して Expensify Card の残高を支払うか、新しい銀行口座を追加してください',
            accountEndingIn: '…で終わるアカウント',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '決済口座',
            settlementAccountDescription: 'Expensify Card の残高を支払う口座を選択してください。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `このアカウントが、連続照合が正しく機能するように、<a href="${reconciliationAccountSettingsLink}">照合アカウント</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '清算頻度',
            settlementFrequencyDescription: 'Expensify Card の残高を支払う頻度を選択してください。',
            settlementFrequencyInfo: '月次精算に切り替えるには、Plaid を通じて銀行口座を連携し、過去90日間の残高履歴がプラスである必要があります。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カードの詳細',
            cardPending: ({name}: {name: string}) => `カードは現在保留中で、${name} さんのアカウントが認証されると発行されます。`,
            virtual: 'バーチャル',
            physical: '物理',
            deactivate: 'カードを無効化',
            changeCardLimit: 'カード上限を変更',
            changeLimit: '制限を変更',
            smartLimitWarning: (limit: number | string) => `このカードの限度額を${limit}に変更すると、カードでより多くの経費を承認するまで、新しい取引は拒否されます。`,
            monthlyLimitWarning: (limit: number | string) => `このカードの限度額を${limit}に変更すると、来月まで新しい取引は承認されません。`,
            fixedLimitWarning: (limit: number | string) => `このカードの利用限度額を${limit}に変更すると、新しい取引は拒否されます。`,
            changeCardLimitType: 'カードの限度額タイプを変更',
            changeLimitType: '制限タイプを変更',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `このカードの上限タイプをスマート上限に変更すると、未承認の上限 ${limit} にすでに達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `このカードの上限タイプを月次に変更すると、${limit} の月次上限にはすでに達しているため、新しい取引は却下されます。`,
            addShippingDetails: '配送先の詳細を追加',
            issuedCard: (assignee: string) => `${assignee} に Expensify Card を発行しました！カードは 2～3 営業日で到着します。`,
            issuedCardNoShippingDetails: (assignee: string) => `${assignee} に Expensify Card を発行しました！配送先の詳細が確認されると、カードは発送されます。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `${assignee} にバーチャル Expensify Card を発行しました！${link} はすぐに使用できます。`,
            addedShippingDetails: (assignee: string) => `${assignee} が配送先情報を追加しました。Expensify Card は 2～3 営業日で届きます。`,
            replacedCard: (assignee: string) => `${assignee} は Expensify Card を再発行しました。新しいカードは 2～3 営業日以内に到着します。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} は自分のバーチャル Expensify Card を再発行しました！${link} はすぐに使用できます。`,
            card: 'カード',
            replacementCard: '代替カード',
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座を確認済み',
            verifyingBankAccount: '銀行口座を確認しています…',
            verifyingBankAccountDescription: 'このアカウントで Expensify カードを発行できるか確認しています。しばらくお待ちください。',
            bankAccountVerified: '銀行口座が確認されました！',
            bankAccountVerifiedDescription: 'これで、ワークスペースのメンバーに Expensify カードを発行できるようになりました。',
            oneMoreStep: 'あともう一歩…',
            oneMoreStepDescription: '銀行口座を手動で確認する必要があるようです。指示が用意されていますので、Concierge に移動してください。',
            gotIt: '了解しました',
            goToConcierge: 'Concierge へ移動',
        },
        categories: {
            deleteCategories: 'カテゴリを削除',
            deleteCategoriesPrompt: 'これらのカテゴリを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリーを無効にする',
            disableCategory: 'カテゴリを無効化',
            enableCategories: 'カテゴリを有効にする',
            enableCategory: 'カテゴリを有効にする',
            defaultSpendCategories: 'デフォルトの経費カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引およびスキャンされた領収書について、店舗ごとの支出の分類方法をカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください。',
            categoryName: 'カテゴリ名',
            requiresCategory: 'メンバーはすべての経費をカテゴリー分けする必要があります',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `すべての経費は、${connectionName} にエクスポートするために分類する必要があります。`,
            subtitle: 'お金がどこで使われているかを、より明確に把握しましょう。デフォルトのカテゴリを使うことも、自分専用のカテゴリを追加することもできます。',
            emptyCategories: {
                title: 'まだカテゴリを作成していません',
                subtitle: '支出を整理するためにカテゴリを追加してください。',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>現在、カテゴリーは会計接続からインポートされています。変更を加えるには、<a href="${accountingPageURL}">会計</a>に移動してください。</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリーの更新中にエラーが発生しました。もう一度お試しください',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください。',
            addCategory: 'カテゴリを追加',
            editCategory: 'カテゴリを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを検索',
            categoryRequiredError: 'カテゴリ名は必須です',
            existingCategoryError: 'この名前のカテゴリーはすでに存在します',
            invalidCategoryName: '無効なカテゴリ名',
            importedFromAccountingSoftware: '以下のカテゴリーは、次からインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください。',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリを削除または無効にすることはできません',
                description: `ワークスペースでカテゴリが必須のため、少なくとも 1 つのカテゴリは有効のままにする必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: 'ビジネスの成長に合わせて、下のトグルを使ってより多くの機能を有効化しましょう。各機能は、さらにカスタマイズできるようナビゲーションメニューに表示されます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームの規模拡大を支援する機能を有効にする',
            },
            manageSection: {
                title: '管理',
                subtitle: '支出を予算内に収めるのに役立つコントロールを追加しましょう。',
            },
            earnSection: {
                title: '獲得',
                subtitle: '収益を効率化し、より早く支払いを受けましょう。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '支出をグループ化して分析し、支払ったすべての税金を記録します。',
            },
            integrateSection: {
                title: '連携',
                subtitle: 'Expensify を主要な金融プロダクトと連携しましょう。',
            },
            distanceRates: {
                title: '距離レート',
                subtitle: 'レートの追加、更新、および適用を行います。',
            },
            perDiem: {
                title: '日当',
                subtitle: '日当レートを設定して、従業員の1日あたりの支出を管理します。',
            },
            travel: {
                title: '旅行',
                subtitle: 'すべてのビジネス旅行を予約、管理、調整します。',
                getStarted: {
                    title: 'Expensify Travelを始めましょう',
                    subtitle: 'お客様のビジネスについてもう少し情報が必要です。その後、準備完了です。',
                    ctaText: '始めましょう',
                },
                reviewingRequest: {
                    title: '荷物をまとめてください。リクエストを受け取りました...',
                    subtitle: '現在、Expensify Travelの有効化リクエストを確認中です。ご心配なく、準備ができ次第お知らせします。',
                    ctaText: 'リクエスト送信済み',
                },
                bookOrManageYourTrip: {
                    title: '旅行を予約または管理',
                    subtitle: 'Expensify Travelを使用して最高の旅行オファーを取得し、すべてのビジネス経費を一箇所で管理します。',
                    ctaText: '予約または管理',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: '出張予約',
                        subtitle: 'おめでとうございます！このワークスペースで旅行の予約と管理を行う準備が整いました。',
                        manageTravelLabel: '出張を管理',
                    },
                    centralInvoicingSection: {
                        title: '中央請求書管理',
                        subtitle: 'すべての出張費を購入時に都度支払うのではなく、月次請求書にまとめて管理しましょう。',
                        learnHow: '詳しく見る。',
                        subsections: {
                            currentTravelSpendLabel: '現在の出張費用',
                            currentTravelSpendCta: '残高を支払う',
                            currentTravelLimitLabel: '現在の出張上限',
                            settlementAccountLabel: '決済口座',
                            settlementFrequencyLabel: '清算頻度',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '支出を把握し、コントロールしましょう。',
                disableCardTitle: 'Expensify Card を無効化',
                disableCardPrompt: 'Expensify Card はすでに使用中のため、無効にできません。次の対応については Concierge へお問い合わせください。',
                disableCardButton: 'Conciergeとチャット',
                feed: {
                    title: 'Expensify Card を入手',
                    subTitle: '経費精算を効率化してExpensifyの請求額を最大50%節約し、さらに次のメリットも享受できます。',
                    features: {
                        cashBack: 'すべての米国内購入でキャッシュバック',
                        unlimited: '無制限のバーチャルカード',
                        spend: '支出管理とカスタム上限',
                    },
                    ctaTitle: '新しいカードを発行',
                },
            },
            companyCards: {
                title: '会社カード',
                subtitle: '既にお持ちのカードを連携します。',
                feed: {
                    title: '自分のカードを持ち込む（BYOC）',
                    features: {support: '10,000以上の銀行のカードを連携', assignCards: 'チームの既存のカードをリンクする', automaticImport: '取引を自動的に取り込みます'},
                    subtitle: 'すでにお持ちのカードをリンクして、自動取引の取り込み、レシート照合、および消込を行いましょう。',
                },
                bankConnectionError: '銀行接続の問題',
                connectWithPlaid: 'Plaid で接続',
                connectWithExpensifyCard: 'Expensify Card をお試しください。',
                bankConnectionDescription: `もう一度カードの追加をお試しください。それでも解決しない場合は、`,
                disableCardTitle: '会社カードを無効にする',
                disableCardPrompt: 'この機能は現在使用中のため、会社カードを無効にすることはできません。次の手順については Concierge にお問い合わせください。',
                disableCardButton: 'Conciergeとチャット',
                cardDetails: 'カードの詳細',
                cardNumber: 'カード番号',
                cardholder: 'カード保有者',
                cardName: 'カード名',
                allCards: 'すべてのカード',
                assignedCards: '割り当て済み',
                unassignedCards: '未割り当て',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `取引をエクスポートする先の ${integration} アカウントを選択してください。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `取引をエクスポートする${integration}アカウントを選択してください。利用可能なアカウントを変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択してください。`,
                lastUpdated: '最終更新',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当て解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、ドラフトレポート上のすべての取引がカード所有者のアカウントから削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: 'カードフィードを他と区別できるように、一意の名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択します。新しい取引にはこのルールが適用されます。',
                cardFeedRestrictDeletingTransaction: '取引の削除を制限',
                cardFeedAllowDeletingTransaction: '取引の削除を許可',
                removeCardFeed: 'カードフィードを削除',
                removeCardFeedTitle: (feedName: string) => `${feedName} フィードを削除`,
                removeCardFeedDescription: 'このカードフィードを削除してもよろしいですか？すべてのカードの割り当てが解除されます。',
                error: {
                    feedNameRequired: 'カードフィード名は必須です',
                    statementCloseDateRequired: 'ステートメントの締め日を選択してください。',
                },
                corporate: '取引の削除を制限',
                personal: '取引の削除を許可',
                setFeedNameDescription: '他のフィードと区別できるように、このカードフィードに一意の名前を付けてください',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できるようになります。新しい取引はこのルールに従います。',
                emptyAddedFeedTitle: '会社カードを割り当てる',
                emptyAddedFeedDescription: 'メンバーに最初のカードを割り当てて、開始しましょう。',
                pendingFeedTitle: `リクエストを確認しています…`,
                pendingFeedDescription: `現在、お客様のフィードの詳細を確認しています。確認が完了しましたら、次の方法でご連絡いたします`,
                pendingBankTitle: 'ブラウザウィンドウを確認してください',
                pendingBankDescription: (bankName: string) => `先ほど開いたブラウザウィンドウから${bankName}に接続してください。ウィンドウが開かなかった場合は、`,
                pendingBankLink: 'ここをクリックしてください',
                giveItNameInstruction: 'ほかのカードと区別できる名前を付けてください。',
                updating: '更新中...',
                neverUpdated: 'しない',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトのカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `複数のカードフィード（Expensify Cards を除く）が接続されているため、このワークスペースはダウングレードできません。続行するには、<a href="#">カードフィードを 1 つだけ残す</a>ようにしてください。`,
                noAccountsFoundDescription: (connection: string) => `${connection} にアカウントを追加して、再度同期してください`,
                expensifyCardBannerTitle: 'Expensify Card を入手',
                expensifyCardBannerSubtitle:
                    'すべての米国内でのご購入でキャッシュバックを獲得し、Expensify の請求額が最大 50% 割引、無制限のバーチャルカードなど、さらに多くの特典をお楽しみいただけます。',
                expensifyCardBannerLearnMoreButton: '詳細はこちら',
                statementCloseDateTitle: '明細書締め日',
                statementCloseDateDescription: 'カード明細の締め日をお知らせいただければ、Expensify に対応する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認と支払い方法を設定します。',
                disableApprovalPrompt:
                    'このワークスペースの Expensify Card は現在、承認を基準にして Smart Limit が設定されています。承認を無効にする前に、Smart Limit を使用しているすべての Expensify Card の上限タイプを修正してください。',
            },
            invoices: {
                title: '請求書',
                subtitle: '請求書の送受信。',
            },
            categories: {
                title: 'カテゴリー',
                subtitle: '支出を追跡して整理しましょう。',
            },
            tags: {
                title: 'タグ',
                subtitle: 'コストを分類し、請求可能な経費を追跡します。',
            },
            taxes: {
                title: '税金',
                subtitle: '対象となる税金を記録し、還付を受けましょう。',
            },
            reportFields: {
                title: 'レポート項目',
                subtitle: '支出用のカスタムフィールドを設定する。',
            },
            connections: {
                title: '会計',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: '領収書パートナー',
                subtitle: '領収書を自動的に取り込む。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計機能を無効にするには、ワークスペースから会計連携を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber を接続解除',
                disconnectText: 'この機能を無効にするには、まず Uber for Business 連携を切断してください。',
                description: 'この連携を本当に切断しますか？',
                confirmText: '了解しました',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText:
                    'このワークスペース内の Expensify カードは、Smart Limits を定義するために承認ワークフローに依存しています。\n\nワークフローを無効にする前に、Smart Limits が設定されているカードの利用限度額タイプを変更してください。',
                confirmText: 'Expensifyカードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: 'レシートの必須化や高額支出のフラグ付けなどを設定できます。',
            },
            timeTracking: {title: '時間', subtitle: '従業員が作業時間に対して支払いを受けられるよう、時間単位の請求レートを設定します。'},
        },
        reports: {
            reportsCustomTitleExamples: '例:',
            customReportNamesSubtitle: `<muted-text><a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使ってレポートタイトルをカスタマイズしましょう。</muted-text>`,
            customNameTitle: 'デフォルトレポートタイトル',
            customNameDescription: `<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">高度な数式</a>を使って、経費精算書のカスタム名を設定しましょう。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポート開始日: {report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名: {report:workspacename}',
            customNameReportIDExample: 'レポートID: {report:id}',
            customNameTotalExample: '合計: {report:total}',
            preventMembersFromChangingCustomNamesTitle: 'メンバーによるカスタムレポートタイトルの変更を禁止する',
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
            disableReportFieldsConfirmation: '本当に実行しますか？テキストと日付フィールドは削除され、リストは無効になります。',
            importedFromAccountingSoftware: '以下のレポート項目は、あなたの … からインポートされています',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '数式',
            textAlternateText: '自由入力用のフィールドを追加する',
            dateAlternateText: '日付選択用のカレンダーを追加する',
            dropdownAlternateText: '選択できるオプションのリストを追加してください。',
            formulaAlternateText: '数式フィールドを追加します。',
            nameInputSubtitle: 'レポートフィールドの名前を選択してください。',
            typeInputSubtitle: '使用するレポートフィールドの種類を選択してください。',
            initialValueInputSubtitle: 'レポートフィールドに表示する開始値を入力してください。',
            listValuesInputSubtitle: 'これらの値はレポートフィールドのドロップダウンに表示されます。有効化された値はメンバーが選択できます。',
            listInputSubtitle: 'これらの値はレポートのフィールド一覧に表示されます。有効化された値はメンバーが選択できます。',
            deleteValue: '値を削除',
            deleteValues: '値を削除',
            disableValue: '値を無効にする',
            disableValues: '値を無効にする',
            enableValue: '値を有効にする',
            enableValues: '値を有効にする',
            emptyReportFieldsValues: {
                title: 'まだリスト値が作成されていません',
                subtitle: 'レポートに表示されるカスタム値を追加します。',
            },
            deleteValuePrompt: 'このリスト値を削除してもよろしいですか？',
            deleteValuesPrompt: 'これらのリスト値を削除してもよろしいですか？',
            listValueRequiredError: 'リスト値の名前を入力してください',
            existingListValueError: 'この名前のリスト値はすでに存在します',
            editValue: '値を編集',
            listValues: '値の一覧',
            addValue: '値を追加',
            existingReportFieldNameError: 'この名前のレポートフィールドはすでに存在します',
            reportFieldNameRequiredError: 'レポートフィールド名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドの種類を選択してください',
            circularReferenceError: 'このフィールドを自分自身に参照させることはできません。更新してください。',
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
            subtitle: 'タグを使うと、費用をより詳しく分類できます。',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>現在、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">依存タグ</a>を使用しています。タグを更新するには、<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>できます。</muted-text>`,
            emptyTags: {
                title: 'まだタグを作成していません',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'タグを追加して、プロジェクト、勤務地、部門などを追跡しましょう。',
                subtitleHTML: `<muted-text><centered-text>タグを追加して、プロジェクト、所在地、部署などを追跡しましょう。インポート用のタグファイルの書式設定については、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">詳しくはこちら</a>をご覧ください。</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>現在、タグは会計連携からインポートされています。変更を行うには、<a href="${accountingPageURL}">会計</a>に移動してください。</centered-text></muted-text>`,
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
            importedFromAccountingSoftware: '以下のタグは、あなたのからインポートされています',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            tagRules: 'タグのルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費に 1 種類または複数のタグを付けてコード化しましょう。',
            configureMultiLevelTags: 'マルチレベル・タグ付け用のタグ一覧を設定してください。',
            importMultiLevelTagsSupportingText: `こちらがタグのプレビューです。問題なければ、下のボタンをクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列にGLコードがあります',
            },
            tagLevel: {
                singleLevel: '1 つのレベルのタグ',
                multiLevel: '多階層タグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替え',
                prompt1: 'タグレベルを切り替えると、現在のすべてのタグが削除されます。',
                prompt2: 'まず～することをおすすめします',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートすることで。',
                prompt5: '詳細を見る',
                prompt6: 'タグレベルについて',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当によろしいですか？',
                prompt2: '既存のタグは上書きされますが、あなたは',
                prompt3: 'バックアップをダウンロード',
                prompt4: '最初。',
            },
            importedTagsMessage: (columnCounts: number) =>
                `スプレッドシート内に *${columnCounts} 列* 見つかりました。タグ名が含まれている列の横で *Name* を選択してください。タグのステータスを設定する列の横で *Enabled* を選択することもできます。`,
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
                one: '1件のタグ',
                other: (count: number) => `${count}個のタグ`,
            }),
        },
        taxes: {
            subtitle: '税名と税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペースの通貨デフォルト',
            foreignDefault: '外貨のデフォルト',
            customTaxName: 'カスタム税名',
            value: '値',
            taxReclaimableOn: '課税控除対象',
            taxRate: '税率',
            findTaxRate: '税率を検索',
            error: {
                taxRateAlreadyExists: 'この税名はすでに使用されています',
                taxCodeAlreadyExists: 'この税コードは既に使用されています',
                valuePercentageRange: '0〜100 の間の有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名は必須です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Concierge にサポートを依頼してください。',
                updateTaxClaimableFailureMessage: '返還可能な金額は、距離レート額より小さくなければなりません',
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
            importedFromAccountingSoftware: '以下の税金は、あなたの…からインポートされます',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください。',
        },
        duplicateWorkspace: {
            title: '新しいワークスペースに名前を付ける',
            selectFeatures: 'コピーする機能を選択',
            whichFeatures: '新しいワークスペースにコピーしたい機能を選択してください。',
            confirmDuplicate: '続行しますか？',
            categories: 'カテゴリと自動カテゴリルール',
            reimbursementAccount: '払い戻し口座',
            welcomeNote: '新しいワークスペースを使い始めてください',
            delayedSubmission: '提出の遅延',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `元のワークスペースから ${totalMembers ?? 0} 人のメンバーと ${newWorkspaceName ?? ''} を作成して共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースがありません',
            subtitle: '領収書を管理し、経費を精算し、出張を管理し、請求書を送信するなど、さまざまなことができます。',
            createAWorkspaceCTA: '開始する',
            features: {
                trackAndCollect: 'レシートを追跡して収集',
                reimbursements: '従業員に精算する',
                companyCards: '会社カードを管理',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは、複数人で話し合い、作業を進めるのに最適な場所です。共同作業を始めるには、ワークスペースを作成するか参加してください',
        },
        new: {
            newWorkspace: '新しいワークスペース',
            getTheExpensifyCardAndMore: 'Expensify Card を入手して、さらに活用しましょう',
            confirmWorkspace: 'ワークスペースを確認',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `私のグループワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
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
            transferOwner: 'オーナーを移行',
            makeMember: () => ({
                one: 'メンバーにする',
                other: 'メンバーにする',
            }),
            makeAdmin: () => ({
                one: '管理者にする',
                other: '管理者にする',
            }),
            makeAuditor: () => ({
                one: '監査担当者にする',
                other: '監査担当者にする',
            }),
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーの追加中に問題が発生しました',
                cannotRemove: '自分自身またはワークスペースのオーナーは削除できません',
                genericRemove: 'そのワークスペースメンバーの削除中に問題が発生しました',
            },
            addedWithPrimary: '一部のメンバーはプライマリログインで追加されました。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `セカンダリログイン ${secondaryLogin} によって追加されました。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `ワークスペースのメンバー合計: ${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `このワークスペースから${approver}を削除すると、承認ワークフローではワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} は、承認が必要な経費レポートを保留しています。ワークスペースから削除する前に、承認してもらうか、そのレポートの管理を引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除することはできません。［ワークフロー］>［支払いの作成または追跡］で新しい払い戻し担当者を設定してから、もう一度お試しください。`,
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
                chooseCardType: 'カードの種類を選択',
                physicalCard: '物理カード',
                physicalCardDescription: '頻繁に経費を使う方に最適',
                virtualCard: 'バーチャルカード',
                virtualCardDescription: '即時で柔軟',
                chooseLimitType: '制限タイプを選択',
                smartLimit: 'スマート制限',
                smartLimitDescription: '承認が必要になる前に、一定額まで使用を許可',
                monthly: '毎月',
                monthlyDescription: '月ごとに一定額まで使用',
                fixedAmount: '固定額',
                fixedAmountDescription: '一度限り、一定額まで使用',
                setLimit: '上限を設定',
                cardLimitError: '$21,474,836 未満の金額を入力してください',
                giveItName: '名前を付けてください',
                giveItNameInstruction: '他のカードと見分けがつくように、十分ユニークな名前にしてください。具体的な使用例が入っていると、なお良いです！',
                cardName: 'カード名',
                letsDoubleCheck: 'すべてが正しく見えるか、もう一度確認しましょう。',
                willBeReadyToUse: 'このカードはすぐに利用できるようになります。',
                willBeReadyToShip: 'このカードはすぐに発送できる状態になります。',
                cardholder: 'カード保有者',
                cardType: 'カードの種類',
                limit: '制限',
                limitType: '制限タイプ',
                disabledApprovalForSmartLimitError: 'スマート制限を設定する前に、<strong>ワークフロー > 承認を追加</strong> で承認を有効にしてください',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化',
                deactivateConfirmation: 'このカードを無効化すると、今後のすべての取引が拒否され、元に戻すことはできません。',
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
                `Expensify Classic で設定された接続にエラーがあります。[この問題を解決するには Expensify Classic に移動してください。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '設定を管理するには、Expensify Classic に移動してください。',
            setup: '接続',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `最終同期日時 ${relativeDate}`,
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite 従業員のデフォルト',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この連携';
                return `本当に${integrationName}との連携を解除しますか？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計統合'} を接続してもよろしいですか？これにより、既存の会計連携はすべて削除されます。`,
            enterCredentials: '認証情報を入力してください',
            claimOffer: {
                badgeText: 'オファー利用可能！',
                xero: {
                    headline: 'Xero を6か月間無料で利用！',
                    description:
                        '<muted-text><centered-text>Xero を初めてご利用ですか？Expensify のお客様は6か月間無料でご利用いただけます。以下のオファーを獲得してください。</centered-text></muted-text>',
                    connectButton: 'Xero に接続',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Uber の乗車で5%割引',
                    description: `<muted-text><centered-text>Expensify を通じて Uber for Business を有効化すると、6月までのすべてのビジネス乗車で5%割引になります。<a href="${CONST.UBER_TERMS_LINK}">条件が適用されます。</a></centered-text></muted-text>`,
                    connectButton: 'Uber for Business に接続',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '顧客をインポート中';
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
                            return 'ロケーションのインポート';
                        case 'quickbooksOnlineImportProcessing':
                            return 'インポートしたデータを処理中';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '払い済みレポートと請求書支払いの同期';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '税コードのインポート';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online 接続を確認中';
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
                            return '承認証明書をインポートしています';
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
                            return '顧客／プロジェクトを更新しています';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return '参加者リストを更新中';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポートフィールドを更新中';
                        case 'jobDone':
                            return 'インポートしたデータの読み込みを待機中';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期しています';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期中';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensifyレポートを「精算済み」としてマークする';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero の請求書とインボイスを支払済みにする';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期しています';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座を同期しています';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期中';
                        case 'xeroCheckConnection':
                            return 'Xero 接続を確認しています';
                        case 'xeroSyncTitle':
                            return 'Xero データを同期中';
                        case 'netSuiteSyncConnection':
                            return 'NetSuite への接続を初期化しています';
                        case 'netSuiteSyncCustomers':
                            return '顧客をインポート中';
                        case 'netSuiteSyncInitData':
                            return 'NetSuite からデータを取得しています';
                        case 'netSuiteSyncImportTaxes':
                            return '税金のインポート';
                        case 'netSuiteSyncImportItems':
                            return '項目をインポートしています';
                        case 'netSuiteSyncData':
                            return 'Expensify へのデータのインポート';
                        case 'netSuiteSyncAccounts':
                            return 'アカウントを同期中';
                        case 'netSuiteSyncCurrencies':
                            return '通貨を同期しています';
                        case 'netSuiteSyncCategories':
                            return 'カテゴリを同期中';
                        case 'netSuiteSyncReportFields':
                            return 'Expensify レポートフィールドとしてデータをインポートしています';
                        case 'netSuiteSyncTags':
                            return 'Expensifyタグとしてデータをインポートする';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新中';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensifyレポートを「精算済み」としてマークする';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite の請求書とインボイスを支払済みにマークする';
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
                '優先するエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で個々の会社カードごとに異なるエクスポート口座を設定している場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントで、エクスポート対象のレポートを確認できるようになります。',
            exportAs: 'エクスポート形式',
            exportOutOfPocket: '自己負担経費のエクスポート形式',
            exportCompanyCard: '会社カード経費を次の形式でエクスポート',
            exportDate: 'エクスポート日',
            defaultVendor: 'デフォルトのベンダー',
            autoSync: '自動同期',
            autoSyncDescription: 'NetSuite と Expensify を毎日自動で同期します。確定したレポートをリアルタイムでエクスポートします',
            reimbursedReports: '支払済みレポートを同期',
            cardReconciliation: 'カード照合作業',
            reconciliationAccount: '照合勘定',
            continuousReconciliation: '継続的な照合',
            saveHoursOnReconciliation: '各会計期間ごとの照合作業にかかる時間を大幅に削減できます。Expensify が、あなたに代わって Expensify Card の明細と精算を継続的に照合します。',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>継続的な照合を有効にするには、${connectionName} の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card の支払いを照合する銀行口座を選択してください。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Continuous Reconciliation が正しく機能するように、このアカウントが <a href="${settlementAccountUrl}">Expensify Card 決済用口座</a>（末尾 ${lastFourPAN}）と一致していることを確認してください。`,
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
            invoicingDetailsDescription: 'この情報はあなたの請求書に表示されます。',
            companyName: '会社名',
            companyWebsite: '会社のウェブサイト',
            paymentMethods: {
                personal: '個人',
                business: 'ビジネス',
                chooseInvoiceMethod: '下から支払い方法を選択してください。',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書残高',
            invoiceBalanceSubtitle: 'これは、請求書の支払いの回収による現在の残高です。銀行口座を追加済みの場合は、自動的にその口座へ振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いや受け取りを行うために銀行口座を追加してください。',
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
            inviteMessagePrompt: '招待をもっと特別なものにするために、下にメッセージを追加しましょう！',
            personalMessagePrompt: 'メッセージ',
            genericFailureMessage: 'ワークスペースにメンバーを招待する際にエラーが発生しました。もう一度お試しください。',
            inviteNoMembersError: '招待するメンバーを少なくとも1人選択してください',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} が ${workspaceName} への参加をリクエストしました`,
        },
        distanceRates: {
            oopsNotSoFast: 'おっと！ まだ早いですよ…',
            workspaceNeeds: 'ワークスペースには、有効化された距離レートが少なくとも1つ必要です。',
            distance: '距離',
            centrallyManage: 'レートを一元管理し、距離をマイルまたはキロメートルで記録し、デフォルトのカテゴリを設定します。',
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
                '<muted-text>この機能を使用するには、ワークスペースで税金を有効にする必要があります。その変更を行うには、<a href="#">その他の機能</a>に移動してください。</muted-text>',
            deleteDistanceRate: '距離レートを削除',
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
            typeInputLabel: '種類',
            initialValueInputLabel: '初期値',
            nameInputHelpText: 'これは、ワークスペースに表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付ける必要があります',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペースのすべての経費は、この通貨に換算されます。',
            currencyInputDisabledText: (currency: string) => `このワークスペースは ${currency} の銀行口座にリンクされているため、デフォルト通貨は変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travel を有効にするには、ワークスペースの住所が必要です。お客様のビジネスに関連付けられた住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続行',
            youAreAlmostDone: '銀行口座の設定はほぼ完了しています。設定が完了すると、コーポレートカードの発行、経費の精算、請求書の回収、および支払いができるようになります。',
            streamlinePayments: '支払いを効率化',
            connectBankAccountNote: '注意：ワークスペースでの支払いには、個人の銀行口座は使用できません。',
            oneMoreThing: 'もう一つだけ！',
            allSet: 'これで準備完了です！',
            accountDescriptionWithCards: 'この銀行口座は、コーポレートカードの発行、経費の精算、請求書の回収、および支払いに使用されます。',
            letsFinishInChat: 'チャットで終わらせましょう！',
            finishInChat: 'チャットで完了',
            almostDone: 'ほとんど完了しました！',
            disconnectBankAccount: '銀行口座の接続を解除',
            startOver: '最初からやり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、銀行口座との接続を解除します',
            yesStartOver: 'はい、やり直します',
            disconnectYourBankAccount: (bankName: string) => `<strong>${bankName}</strong> 銀行口座の接続を解除します。この口座に対する未処理の取引はすべて引き続き処理されます。`,
            clearProgress: '最初からやり直すと、これまでの進捗がすべて消去されます。',
            areYouSure: '本当によろしいですか？',
            workspaceCurrency: 'ワークスペース通貨',
            updateCurrencyPrompt: '現在、あなたのワークスペースはUSDとは異なる通貨に設定されているようです。下のボタンをクリックして、今すぐ通貨をUSDに更新してください。',
            updateToUSD: 'USD に更新',
            updateWorkspaceCurrency: 'ワークスペース通貨を更新',
            workspaceCurrencyNotSupported: 'ワークスペース通貨はサポートされていません',
            yourWorkspace: `お使いのワークスペースで設定されている通貨はサポートされていません。<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">サポートされている通貨の一覧</a>をご覧ください。`,
            chooseAnExisting: '経費の支払いに使用する既存の銀行口座を選択するか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: '所有者を変更',
            addPaymentCardTitle: '所有権を譲渡するには支払いカードを入力してください',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>カードを追加するには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>を読み、同意してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長インフラストラクチャ',
            addPaymentCardLearnMore: `<muted-text>弊社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>について詳しく見る。</muted-text>`,
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\n残高を精算して、このワークスペースの請求管理を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を振替',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `このワークスペースの所有アカウント（${email}）には、前月からの未払残高があります。

このワークスペースの請求を引き継ぐために、この金額（${amount}）を振り替えますか？お支払いカードには直ちに請求が行われます。`,
            subscriptionTitle: '年間サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `このワークスペースを引き継ぐと、その年間サブスクリプションはあなたの現在のサブスクリプションと統合されます。その結果、サブスクリプションの規模は${usersCount}人分増え、新しいサブスクリプションの規模は${finalCount}人分になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複サブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `${email} さんのワークスペースの請求管理を引き継ごうとしているようですが、そのためには、まずすべてのワークスペースで管理者になる必要があります。

ワークスペース ${workspaceName} のみの請求管理を引き継ぎたい場合は、「続行」をクリックしてください。

サブスクリプション全体の請求管理を引き継ぎたい場合は、請求管理を引き継ぐ前に、すべてのワークスペースであなたを管理者として追加してもらってください。`,
            hasFailedSettlementsTitle: 'オーナー権限を譲渡できません',
            hasFailedSettlementsButtonText: '了解しました',
            hasFailedSettlementsText: (email: string) =>
                `${email} に未払いの Expensify Card 精算があるため、請求の管理を引き継ぐことはできません。問題を解決するために、concierge@expensify.com まで連絡するよう依頼してください。その後、このワークスペースの請求管理を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高の消去に失敗しました',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高を精算できませんでした。後でもう一度お試しください。',
            successTitle: 'やった！これで完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ まだ早いですよ…',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権の移転中に問題が発生しました。もう一度お試しいただくか、ヘルプが必要な場合は<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `以下のレポートはすでに ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポートされています：

${reportName}

もう一度エクスポートしてもよろしいですか？`,
            confirmText: 'はい、もう一度エクスポートします',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポート項目',
                description: `レポートフィールドは、個々の明細行の経費に関連するタグとは異なる、レポート全体レベルの詳細を指定するためのものです。これらの詳細には、特定のプロジェクト名、出張情報、場所などを含めることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からご利用いただける Control プランでのみ使用できます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify + NetSuite 連携で自動同期を利用し、手入力を削減しましょう。プロジェクトや顧客のマッピングを含むネイティブおよびカスタムセグメントのサポートにより、詳細でリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>NetSuite 連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify と Sage Intacct のインテグレーションにより、自動同期を活用して手入力を削減しましょう。ユーザー定義ディメンションに加え、部門、クラス、所在地、顧客、プロジェクト（ジョブ）別の経費コーディングによって、詳細でリアルタイムな財務インサイトを得ることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>当社の Sage Intacct 連携機能は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からとなります</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify と QuickBooks Desktop の連携で、自動同期を活用し、手入力を削減しましょう。リアルタイムの双方向接続と、クラス・品目・顧客・プロジェクト別の経費コード設定により、究極の業務効率を実現できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktop との連携は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `承認の段階をさらに増やしたい場合や、高額な経費に別の担当者の確認を入れたい場合でも、Expensify にお任せください。高度な承認機能により、あらゆるレベルで適切なチェック体制を整え、チームの支出をしっかり管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用できます</muted-text>`,
            },
            categories: {
                title: 'カテゴリー',
                description: 'カテゴリを使用すると、支出を追跡して整理できます。既定のカテゴリを使用するか、自分でカテゴリを追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリーは Collect プランで利用できます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からです</muted-text>`,
            },
            glCodes: {
                title: 'GLコード',
                description: `会計システムや給与システムへの経費の簡単なエクスポートのために、カテゴリやタグにGLコードを追加してください。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードはControlプランでのみ利用可能です。料金は<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`}からです</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL & 給与コード',
                description: `会計システムや給与システムへ経費を簡単にエクスポートできるよう、カテゴリに GL コードと給与コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL &amp; 給与コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用できます</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `税コードを税金に追加して、経費を会計および給与システムへ簡単にエクスポートできるようにしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`}<strong>${formattedPrice}</strong>からのControlプランでのみ利用できます</muted-text>`,
            },
            companyCards: {
                title: '無制限の会社カード',
                description: `さらにカードフィードが必要ですか？すべての主要なカード発行会社から取引を同期できる、無制限の法人カードを有効にしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これは Control プランでのみ利用可能で、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで実行され、細かいことを気にしなくても支出をコントロールできるようにします。

領収書や説明などの経費詳細を必須にしたり、上限やデフォルトを設定したり、承認や支払いを自動化したりと、すべてを 1 か所で管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用可能です</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '日当は、従業員が出張する際の毎日のコストを、コンプライアンスに準拠しつつ予測しやすく保つための優れた方法です。カスタムレート、デフォルトカテゴリ、目的地やサブラテなど、より詳細な設定といった機能を利用できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>日当は Control プランでのみご利用可能で、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            travel: {
                title: '旅行',
                description: 'Expensify Travel は、メンバーが宿泊施設、航空券、交通手段などを予約できる、新しい法人向け出張予約・管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel は Collect プランで利用できます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からです</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使用すると、経費をまとめて、追跡と整理をより簡単に行えます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`}からのCollectプランでご利用いただけます</muted-text>`,
            },
            multiLevelTags: {
                title: '多階層タグ',
                description:
                    'マルチレベルタグを使用すると、経費をより正確に管理できます。各明細行に部門、クライアント、コストセンターなど複数のタグを割り当てることで、すべての経費の背景情報を完全に把握できます。これにより、より詳細なレポート、承認ワークフロー、および会計データのエクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} から利用可能な Control プランでのみご利用いただけます</muted-text>`,
            },
            distanceRates: {
                title: '距離レート',
                description: '自分専用のレートを作成・管理し、マイルまたはキロメートルで走行距離を記録し、距離に関する経費のデフォルトカテゴリを設定できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離レートは Collect プランで利用可能で、<strong>${formattedPrice}</strong> からです ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`}</muted-text>`,
            },
            auditor: {
                title: '監査担当者',
                description: '監査担当者は、完全な可視性とコンプライアンス監視のために、すべてのレポートへの閲覧専用アクセス権を取得します。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>監査担当者は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用可能です</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数承認レベルは、精算が行われる前に複数の担当者によるレポート承認が必要な企業向けのワークフローツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、Control プランでのみ利用可能で、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり月額',
                perMember: 'メンバーごと、1か月あたり。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>この機能を利用するにはアップグレードするか、プランと料金の詳細については<a href="${subscriptionLink}">こちら</a>をご覧ください。</muted-text>`,
            upgradeToUnlock: 'この機能をアンロックする',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>${policyName} を Control プランに正常にアップグレードしました！詳しくは、<a href="${subscriptionLink}">サブスクリプションを表示</a>してください。</centered-text>`,
                categorizeMessage: `Collectプランへのアップグレードが完了しました。これで経費を分類できるようになりました！`,
                travelMessage: `Collect プランへのアップグレードが完了しました。これで、出張の予約と管理を開始できます！`,
                distanceRateMessage: `Collect プランへのアップグレードが完了しました。これで距離レートを変更できるようになりました！`,
                gotIt: '了解しました、ありがとうございます',
                createdWorkspace: `ワークスペースを作成しました！`,
            },
            commonFeatures: {
                title: 'Controlプランにアップグレード',
                note: '以下を含む、最も強力な機能をアンロックしましょう：',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control プランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバーごと、1か月あたり。` : `アクティブメンバー1人あたり月額`} からご利用いただけます。プランと料金の詳細は <a href="${learnMoreMethodsRoute}">こちら</a> をご覧ください。</muted-text>`,
                    benefit1: '高度な会計連携（NetSuite、Sage Intacct など）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランの種類を 次に変更してください',
                },
                upgradeWorkspaceWarning: 'ワークスペースをアップグレードできません',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: '会社がワークスペースの作成を制限しています。管理者に連絡してください。',
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
                    benefit4: '強化されたセキュリティ管理',
                    headsUp: 'ご注意ください！',
                    multiWorkspaceNote: '定期購読を Collect レートで開始するには、最初の月額支払いの前に、すべてのワークスペースをダウングレードする必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択 > プランタイプを次に変更',
                },
            },
            completed: {
                headline: 'あなたのワークスペースはダウングレードされました',
                description: 'Control プランのほかのワークスペースがあります。Collect レートで請求されるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '了解しました、ありがとうございます',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: '最終のお支払い',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `このサブスクリプションの最終請求額は<strong>${formattedAmount}</strong>です`,
            description2: (date: string) => `${date} の内訳は以下のとおりです：`,
            subscription:
                'ご注意ください！この操作を行うと、Expensify のサブスクリプションが終了し、このワークスペースが削除され、すべてのワークスペースメンバーが削除されます。  \nこのワークスペースを残したまま自分だけを削除したい場合は、先に別の管理者に請求の管理を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限中',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `現在、${workspaceName} ワークスペースでの操作は制限されています`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `ワークスペースのオーナーである ${workspaceOwnerName} が、ワークスペースでの新しいアクティビティを有効にするために、登録されている支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを利用するには、登録済みの支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: 'ロック解除するには支払いカードを追加してください！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き使用するには支払カードを追加してください',
            pleaseReachOutToYourWorkspaceAdmin: 'ご不明な点がありましたら、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者にチャットで問い合わせる',
            chatInAdmins: '#admins でチャットする',
            addPaymentCard: '支払カードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>個々の経費に対して支出コントロールとデフォルトを設定します。<a href="${categoriesPageLink}">カテゴリ</a>や<a href="${tagsPageLink}">タグ</a>のルールを作成することもできます。</muted-text>`,
                receiptRequiredAmount: '領収書が必要な金額',
                receiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、支出がこの金額を超えた場合に領収書を必須にする。',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `金額は明細領収書の必要金額（${amount}）より高くすることはできません`,
                itemizedReceiptRequiredAmount: '明細領収書の必要金額',
                itemizedReceiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出には明細領収書が必要です。',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `金額は通常の領収書に必要な金額（${amount}）より低くすることはできません`,
                maxExpenseAmount: '最大経費金額',
                maxExpenseAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出にフラグを付けます。',
                maxAge: '最大年齢',
                maxExpenseAge: '経費の最大経過日数',
                maxExpenseAgeDescription: '特定の日数より前の支出にフラグを付けます。',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count} 日`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費をどのように作成するかを選択してください。会社のカード取引としてインポートされていない経費は、現金経費と見なされます。これには、手動で作成された経費、領収書、日当、距離、および時間に基づく経費が含まれます。',
                reimbursableDefault: '精算対象',
                reimbursableDefaultDescription: '経費は多くの場合、従業員に立て替え払いとして精算されます',
                nonReimbursableDefault: '非払い戻し',
                nonReimbursableDefaultDescription: '従業員に経費が返金されることがあります',
                alwaysReimbursable: '常に払い戻し可能',
                alwaysReimbursableDescription: '経費は常に従業員に払い戻されます',
                alwaysNonReimbursable: '常に精算対象外',
                alwaysNonReimbursableDescription: '従業員に経費が精算されることはありません',
                billableDefault: '請求可能のデフォルト',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>現金およびクレジットカード経費を、デフォルトで請求可能にするかどうかを選択します。請求可能な経費は、<a href="${tagsPageLink}">タグ</a>で有効または無効にできます。</muted-text>`,
                billable: '請求可能',
                billableDescription: '経費は多くの場合、クライアントに再請求されます',
                nonBillable: '請求不可',
                nonBillableDescription: '経費は時々クライアントに再請求されます',
                eReceipts: '電子レシート',
                eReceiptsHint: `eReceipt は[ほとんどの米ドル建てクレジット取引](${CONST.DEEP_DIVE_ERECEIPTS})に対して自動作成されます。`,
                attendeeTracking: '参加者の追跡',
                attendeeTrackingHint: 'すべての経費について、一人当たりの費用を追跡します。',
                prohibitedDefaultDescription:
                    'アルコール、ギャンブル、その他の制限対象品目が含まれている領収書にフラグを付けてください。これらの品目が記載されている領収書を伴う経費は、手動での確認が必要になります。',
                prohibitedExpenses: '禁止経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル付帯費用',
                gambling: 'ギャンブル',
                tobacco: 'たばこ',
                adultEntertainment: 'アダルトエンターテインメント',
                requireCompanyCard: 'すべての購入に会社カードを必須にする',
                requireCompanyCardDescription: 'マイレージや日当の経費を含む、すべての現金支出にフラグを付けます。',
            },
            expenseReportRules: {
                title: '上級',
                subtitle: '経費精算レポートのコンプライアンス、承認、支払いを自動化します。',
                preventSelfApprovalsTitle: '自己承認を防ぐ',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分自身の経費精算レポートを承認できないようにします。',
                autoApproveCompliantReportsTitle: '準拠したレポートを自動承認',
                autoApproveCompliantReportsSubtitle: 'どの経費レポートを自動承認の対象にするかを設定します。',
                autoApproveReportsUnderTitle: '以下の条件でレポートを自動承認',
                autoApproveReportsUnderDescription: 'この金額以下の完全準拠した経費レポートは自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートは、自動承認の対象であっても手動承認を必須にする。',
                autoPayApprovedReportsTitle: '自動支払いが承認されたレポート',
                autoPayApprovedReportsSubtitle: '自動支払いの対象となる経費レポートを設定します。',
                autoPayApprovedReportsLimitError: (currency?: string) => `${currency ?? ''}20,000 未満の金額を入力してください`,
                autoPayApprovedReportsLockedSubtitle: '「その他の機能」に移動してワークフローを有効にし、その後「支払い」を追加してこの機能を有効化してください。',
                autoPayReportsUnderTitle: '以下のレポートを自動支払い',
                autoPayReportsUnderDescription: 'この金額以下の、要件を完全に満たした経費精算書は自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `${featureName} を追加して、この機能を有効にしてください。`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[その他の機能](${moreFeaturesLink})に移動し、${featureName} を有効にしてこの機能をアンロックしてください。`,
            },
            categoryRules: {
                title: 'カテゴリルール',
                approver: '承認者',
                requireDescription: '説明を必須にする',
                requireFields: 'フィールドを必須にする',
                requiredFieldsTitle: '必須項目',
                requiredFieldsDescription: (categoryName: string) => `これは<strong>${categoryName}</strong>として分類されたすべての経費に適用されます。`,
                requireAttendees: '参加者の入力を必須にする',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: (categoryName: string) => `従業員に「${categoryName}」での支出について追加情報を提供するよう促します。このヒントは経費の説明欄に表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロのヒント：短ければ短いほど良いです！',
                maxAmount: '最大金額',
                flagAmountsOver: '～以上の金額にフラグを付ける',
                flagAmountsOverDescription: (categoryName: string) => `カテゴリ「${categoryName}」に適用されます。`,
                flagAmountsOverSubtitle: 'これにより、すべての経費の上限額が上書きされます。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリ別に経費金額をフラグします。このルールは、最大経費金額に関するワークスペース全体の一般ルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費精算書ごとに、1日のカテゴリ合計支出をフラグ設定します。',
                },
                requireReceiptsOver: '経費に領収書を必須',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: 'レシートを要求しない',
                    always: '常に領収書を必須にする',
                },
                requireItemizedReceiptsOver: 'を超える明細領収書を必須にする',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: '明細領収書を要求しない',
                    always: '常に明細領収書を要求する',
                },
                defaultTaxRate: '既定の税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動してワークフローを有効にし、承認を追加してこの機能を有効化してください。`,
            },
            customRules: {
                title: '経費ポリシー',
                cardSubtitle: 'ここにはチームの経費ポリシーが保存されています。これにより、何が対象になるかについて全員が同じ認識を持てます。',
            },
            merchantRules: {
                title: '加盟店',
                subtitle: '取引先ルールを設定して、経費が正しくコード化された状態で届くようにし、後処理を最小限に抑えましょう。',
                addRule: '店舗ルールを追加',
                ruleSummaryTitle: (merchantName: string) => `もし取引先に「${merchantName}」が含まれている場合`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `支払先名を「${merchantName}」に変更`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} を「${fieldValue}」に更新`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `「${reimbursable ? '払い戻し対象' : '精算対象外'}」としてマーク`,
                ruleSummarySubtitleBillable: (billable: boolean) => `「${billable ? '請求可能' : '請求対象外'}」としてマーク`,
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '回収',
                    description: '業務プロセスの自動化を目指すチーム向け。',
                },
                corporate: {
                    label: '管理',
                    description: '高度な要件を持つ組織向け。',
                },
            },
            description: 'あなたに合ったプランをお選びください。機能と料金の詳しい一覧については、こちらをご覧ください',
            subscriptionLink: 'プランの種類と料金に関するヘルプページ',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `${annualSubscriptionEndDate} まで、Control プランで 1 人のアクティブメンバーを利用する年間契約にコミットしています。${annualSubscriptionEndDate} 以降は、自動更新をオフにすることで、従量課金制サブスクリプションに切り替え、Collect プランへダウングレードできます。`,
                other: `あなたは、年間サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランで${count}人のアクティブメンバーを維持することに同意しています。${annualSubscriptionEndDate}以降は、自動更新をオフにすることで、従量課金制サブスクリプションに切り替え、Collectプランにダウングレードできます。`,
            }),
            subscriptions: 'サブスクリプション',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: 'あなたの偉大さへの道を切り開くお手伝いをします！',
        description: '以下のサポートオプションから選択してください：',
        chatWithConcierge: 'Conciergeとチャット',
        scheduleSetupCall: 'セットアップ通話を予約',
        scheduleACall: '通話を予約',
        questionMarkButtonTooltip: '弊社チームにサポートを依頼する',
        exploreHelpDocs: 'ヘルプドキュメントを表示',
        registerForWebinar: 'ウェビナーに登録',
        onboardingHelp: 'オンボーディングヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更',
        headers: {
            frequentlyUsed: 'よく使う',
            smileysAndEmotion: 'スマイリーと感情',
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
        restrictedDescription: 'あなたのワークスペース内のメンバーはこのルームを見つけることができます',
        privateDescription: 'このルームに招待された人は、このルームを見つけることができます',
        publicDescription: '誰でもこのルームを見つけることができます',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '誰でもこのルームを見つけることができます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前のルームは既に存在します',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} はすべてのワークスペースで使用されるデフォルトのルーム名です。別の名前を選択してください。`,
        roomNameInvalidError: 'ルーム名には、小文字の英字、数字、およびハイフンのみを使用できます',
        pleaseEnterRoomName: 'ルーム名を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}は"${newName}"に名前を変更しました（以前は"${oldName}"）` : `${actor}がこのルーム名を「${newName}」（以前は「${oldName}」）に変更しました`;
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
        submitAndApprove: '送信して承認',
        advanced: '高度な',
        dynamicExternal: 'ダイナミック（外部）',
        smartReport: 'スマートレポート',
        billcom: 'Bill.com',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `会社住所を「${newAddress}」（以前は「${previousAddress}」）に変更しました` : `会社の住所を「${newAddress}」に設定`,
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
                return `カテゴリ「${categoryName}」に給与コード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」から給与コード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリの給与コードを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」にGLコード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」からGLコード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリーのGLコードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `「${categoryName}」カテゴリの説明を${!oldValue ? '必須' : '必須ではありません'}（以前は${!oldValue ? '必須ではありません' : '必須'}）に変更しました`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に最大金額 ${newAmount} を追加しました`;
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
                return `レシートを${newValue}に変更して、カテゴリ「${categoryName}」を更新しました`;
            }
            return `「${categoryName}」カテゴリを${newValue}に変更しました（以前は${oldValue}）。`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」を更新し、明細領収書を${newValue}に変更しました。`;
            }
            return `「${categoryName}」カテゴリの明細領収書を${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `カテゴリ名を「${oldName}」から「${newName}」に変更しました`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明ヒント「${oldValue}」を削除しました`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明ヒント「${newValue}」を追加しました`
                : `「${categoryName}」カテゴリの説明ヒントを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `タグリスト名を「${newName}」（以前は「${oldName}」）に変更しました`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `タグリスト「${tagListName}」で、タグ「${oldName}」を「${newName}」に変更して更新しました`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」からタグ「${tagName}」を削除しました`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」から「${count}」タグを削除しました`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `リスト「${tagListName}」内のタグ「${tagName}」の${updatedField}を「${oldValue}」から「${newValue}」に変更して更新しました`;
            }
            return `リスト「${tagListName}」のタグ「${tagName}」を更新し、${updatedField} に「${newValue}」を追加しました`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `${customUnitName} の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '有効' : '無効'} 距離レートでの税金追跡`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `新しい「${customUnitName}」レート「${rateName}」を追加しました`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `${customUnitName}の${updatedField}「${customUnitRateName}」のレートを「${oldValue}」から「${newValue}」に変更しました`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `距離レート「${customUnitRateName}」の税率を「${oldValue} (${oldTaxPercentage})」から「${newValue} (${newTaxPercentage})」に変更しました`;
            }
            return `税率「${newValue} (${newTaxPercentage})」を距離レート「${customUnitRateName}」に追加しました`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `距離単価「${customUnitRateName}」の税還付対象部分を「${oldValue}」から「${newValue}」に変更しました`;
            }
            return `距離レート「${customUnitRateName}」に税還付可能分「${newValue}」を追加しました`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? '有効' : '無効'} ${customUnitName}レート「${customUnitRateName}」`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `「${customUnitName}」のレート「${rateName}」を削除しました`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType} レポートフィールド「${fieldName}」を追加しました`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `レポートフィールド「${fieldName}」のデフォルト値を「${defaultValue}」に設定する`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」にオプション「${optionName}」を追加しました`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `レポートフィールド「${fieldName}」のオプション「${optionName}」を${optionEnabled ? '有効' : '無効'}`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のすべてのオプション`;
            }
            return `レポートフィールド「${fieldName}」のオプション「${optionName}」を${allEnabled ? '有効' : '無効'}し、すべてのオプションを${allEnabled ? '有効' : '無効'}にします`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType} レポートフィールド「${fieldName}」を削除しました`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `「自分自身での承認を防ぐ」を「${newValue === 'true' ? '有効' : '無効'}」（以前は「${oldValue === 'true' ? '有効' : '無効'}」）に更新しました`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定してください`;
            }
            return `月次レポートの提出日を「${newValue}」（以前は「${oldValue}」）に更新しました`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「クライアントへ経費を再請求」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「現金経費のデフォルト」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `「Enforce default report titles」を有効にしました ${value ? 'オン' : 'オフ'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `このワークスペース名を「${newName}」（以前は「${oldName}」）に更新しました`,
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
                one: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。これまでに提出されたレポートは、今後も「受信トレイ」で承認可能な状態で表示されます。`,
                other: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続き受信トレイで承認可能な状態で残ります。`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `${policyName} 内でのあなたのロールが、${oldRole} からユーザーに更新されました。あなた自身のものを除き、すべての精算者の経費チャットから削除されています。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `デフォルト通貨を${newCurrency}（以前は${oldCurrency}）に更新しました`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `自動レポート頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを「${newValue}」（以前は「${oldValue}」）に更新しました`,
        upgradedWorkspace: 'このワークスペースを Control プランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳しくは<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をクリックしてください。`,
        downgradedWorkspace: 'このワークスペースを Collect プランにダウングレードしました',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `手動承認にランダムに回されるレポートの割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) => `すべての経費の手動承認限度額を${newLimit}（以前は${oldLimit}）に変更しました`,
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
                    return `${enabled ? '有効' : '無効'} 枚の会社カード`;
                case 'invoicing':
                    return `${enabled ? '有効' : '無効'} 請求書作成`;
                case 'per diem':
                    return `日当（${enabled ? '有効' : '無効'}）`;
                case 'receipt partners':
                    return `${enabled ? '有効' : '無効'} レシートパートナー`;
                case 'rules':
                    return `${enabled ? '有効' : '無効'} ルール`;
                case 'tax tracking':
                    return `${enabled ? '有効' : '無効'} 税金追跡`;
                default:
                    return `${enabled ? '有効' : '無効'} ${featureName}`;
            }
        },
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
            let text = `${members} の承認ワークフローを変更し、レポートを ${approver} に提出するようにしました`;
            if (wasDefaultApprover && previousApprover) {
                text += `(以前のデフォルト承認者 ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '（以前のデフォルト承認者）';
            } else if (previousApprover) {
                text += `(以前は${previousApprover})`;
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
                ? `${members}の承認ワークフローを、デフォルトの承認者${approver}にレポートを提出するように変更しました`
                : `${members}の承認ワークフローを変更し、レポートをデフォルトの承認者に提出するようにしました`;
            if (wasDefaultApprover && previousApprover) {
                text += `(以前のデフォルト承認者 ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '（以前のデフォルト承認者）';
            } else if (previousApprover) {
                text += `(以前は${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `${approver} の承認ワークフローを変更し、承認済みレポートを ${forwardsTo} に転送するようにしました（以前は ${previousForwardsTo} に転送していました）`
                : `${approver} の承認ワークフローを変更し、承認済みレポートを ${forwardsTo} に転送するようにしました（以前は最終承認済みレポートのみを転送）`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `承認済みレポートの転送を停止するように${approver}の承認ワークフローを変更しました（以前は${previousForwardsTo}に転送していました）`
                : `承認済みレポートの転送を停止するように、${approver} の承認ワークフローを変更しました`,
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 出席者の追跡`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? '有効' : '無効'} 件の払い戻し`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `税「${taxName}」を追加しました`,
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
                    return `${oldValue ? '無効' : '有効'} 税「${taxName}」`;
                }
                default: {
                    return '';
                }
            }
        },
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `デフォルトのビジネス銀行口座を「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」に設定`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `デフォルトのビジネス銀行口座「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」を削除しました`,
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
            `デフォルトのビジネス銀行口座を「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」（以前は「${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}」）に変更しました`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書の会社名を「${newValue}」（以前は「${oldValue}」）に変更しました` : `請求書の会社名を「${newValue}」に設定する`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書会社のウェブサイトを「${newValue}」（以前は「${oldValue}」）に変更しました` : `請求書の会社ウェブサイトを「${newValue}」に設定`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `カスタムレポート名の数式を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `認可された支払者を「${newReimburser}」（以前は「${previousReimburser}」）に変更しました` : `承認済み支払者を「${newReimburser}」に変更しました`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `領収書が必要な金額を「${newValue}」に設定`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `領収書の必須金額を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `必須領収書金額を削除しました（以前の値：「${oldValue}」）`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費金額を「${newValue}」に設定`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費額を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費額を削除しました（以前の値：「${oldValue}」）`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費日数を「${newValue}」日に設定`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費期限を「${newValue}」日に変更しました（以前は「${oldValue}」日）`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `最大経費日数を削除（以前は「${oldValue}」日）`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 件の自動支払い承認済みレポート`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `自動支払い承認レポートの閾値を「${newLimit}」に設定`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `自動支払い承認済みレポートのしきい値を「${newLimit}」（以前は「${oldLimit}」）に変更しました`,
        removedAutoPayApprovedReportsLimit: '自動支払い承認済みレポートのしきい値を削除しました',
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: `このページへのアクセス権がありません。このルームに参加しようとしている場合は、ルームのメンバーに追加してもらってください。その他のお困りごとについては、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        roomArchived: `このルームはアーカイブされたようです。ご不明な点がありましたら、${CONST.EMAIL.CONCIERGE} までお問い合わせください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `本当に、このルームから${memberName}さんを削除しますか？`,
            other: '選択したメンバーをルームから削除してもよろしいですか？',
        }),
        error: {
            genericAdd: 'このルームメンバーを追加する際に問題が発生しました',
        },
    },
    newTaskPage: {
        assignTask: 'タスクを割り当てる',
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
            reopened: '未完了としてマーク済み',
            error: 'リクエストされた操作を行う権限がありません',
        },
        markAsComplete: '完了としてマーク',
        markAsIncomplete: '未完了としてマーク',
        assigneeError: 'このタスクの割り当て中にエラーが発生しました。別の担当者を試してください。',
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。後でもう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを削除してもよろしいですか？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} の明細`,
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
        screenShareRequest: 'Expensify が画面共有に招待しています',
    },
    search: {
        resultsAreLimited: '検索結果は制限されています。',
        viewResults: '結果を表示',
        resetFilters: 'フィルターをリセット',
        searchResults: {
            emptyResults: {
                title: '表示するものがありません',
                subtitle: `検索条件を調整するか、「+」ボタンで新しいものを作成してみてください。`,
            },
            emptyExpenseResults: {
                title: 'まだ経費を作成していません',
                subtitle: '経費を作成するか、Expensify を試用して詳細を確認しましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使用して経費を作成してください。',
            },
            emptyReportResults: {
                title: 'まだレポートを作成していません',
                subtitle: 'Expensify のレポートを作成するか、お試しドライブをして詳細を確認しましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使用してレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    まだ請求書を作成していません
                `),
                subtitle: '請求書を送信するか、Expensify を試用して詳細をご確認ください。',
                subtitleWithOnlyCreateButton: '請求書を送信するには、下の緑色のボタンを使用してください。',
            },
            emptyTripResults: {
                title: '表示できる出張はありません',
                subtitle: 'まずは、下から最初の出張を予約しましょう。',
                buttonText: '旅行を予約',
            },
            emptySubmitResults: {
                title: '送信する経費はありません',
                subtitle: 'すべて問題ありません。勝利のラップを決めましょう！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。くつろぎはマックス。お見事です！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールしました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ゆっくり休む時間です、お疲れさまでした。',
            },
            emptyStatementsResults: {
                title: '表示する経費がありません',
                subtitle: '結果がありません。フィルターを調整して再度お試しください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。くつろぎはマックス。お見事です！',
            },
        },
        columns: '列',
        resetColumns: '列をリセット',
        groupColumns: 'グループ列',
        expenseColumns: '経費列',
        statements: 'ステートメント',
        unapprovedCash: '未承認の現金',
        unapprovedCard: '未承認のカード',
        reconciliation: '消込',
        saveSearch: '検索を保存',
        deleteSavedSearch: '保存した検索を削除',
        deleteSavedSearchConfirm: 'この検索を削除してもよろしいですか？',
        searchName: '名前を検索',
        savedSearchesMenuItemTitle: '保存済み',
        topCategories: 'トップカテゴリ',
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
                after: (date?: string) => `${date ?? ''} 以降`,
                on: (date?: string) => `${date ?? ''} 上`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'しない',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '先月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '今月',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最新の明細',
                },
            },
            status: 'ステータス',
            keyword: 'キーワード',
            keywords: 'キーワード',
            limit: '制限',
            currency: '通貨',
            completed: '完了',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} 未満`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''}より大きい`,
                between: (greaterThan: string, lessThan: string) => `${greaterThan} から ${lessThan} まで`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} と等しい`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個人カード',
                closedCards: '終了したカード',
                cardFeeds: 'カードフィード',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `すべての${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `すべてのCSVインポート済みカード${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} は ${value} です`,
            current: '現在',
            past: '過去',
            submitted: '提出済み',
            approved: '承認済み',
            paid: '支払済み',
            exported: 'エクスポート済み',
            posted: '投稿済み',
            withdrawn: '取り下げ済み',
            billable: '請求可能',
            reimbursable: '精算対象',
            purchaseCurrency: '購入通貨',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'カテゴリー',
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
            accessPlaceHolder: '詳細を開く',
        },
        noCategory: 'カテゴリなし',
        noTag: 'タグなし',
        expenseType: '経費の種類',
        withdrawalType: '出金タイプ',
        recentSearches: '最近の検索',
        recentChats: '最近のチャット',
        searchIn: '検索条件',
        searchPlaceholder: '何かを検索',
        suggestions: '提案',
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おっと、かなり多くのアイテムがありますね！まとめて整理してから、まもなくConciergeがファイルをお送りします。',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: '一致する項目をすべて選択',
            allMatchingItemsSelected: '一致する項目をすべて選択済み',
        },
        topSpenders: 'トップ支出者',
    },
    genericErrorPage: {
        title: 'おっと、問題が発生しました！',
        body: {
            helpTextMobile: 'アプリを一度閉じて再度開くか、または次のものに切り替えてください',
            helpTextWeb: 'ウェブ。',
            helpTextConcierge: '問題が解決しない場合は、次にお問い合わせください',
        },
        refresh: '更新',
    },
    fileDownload: {
        success: {
            title: 'ダウンロード完了！',
            message: '添付ファイルを正常にダウンロードしました！',
            qrMessage:
                'QRコードのコピーは、写真フォルダまたはダウンロードフォルダを確認してください。プロのヒント：プレゼンテーションに追加して、聴衆がスキャンしてあなたと直接つながれるようにしましょう。',
        },
        generalError: {
            title: '添付ファイルエラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージへのアクセス',
            message: 'Expensify は、ストレージへのアクセス権限がないと添付ファイルを保存できません。権限を更新するには「設定」をタップしてください。',
        },
    },
    settlement: {
        status: {
            pending: '保留中',
            cleared: 'クリア済み',
            failed: '失敗',
        },
        failedError: ({link}: {link: string}) => `<a href="${link}">アカウントのロックを解除</a>すると、この精算を再試行します。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • 出金ID：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化 기준:',
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
            createExpense: '経費を作成',
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポートのワークスペースを選択してください。',
            emptyReportConfirmationTitle: 'すでに空のレポートがあります',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `${workspaceName} で別のレポートを作成してもよろしいですか？ 空のレポートには次からアクセスできます`,
            emptyReportConfirmationPromptLink: 'レポート',
            genericWorkspaceName: 'このワークスペース',
            emptyReportConfirmationDontShowAgain: '今後表示しない',
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
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `ワークスペース${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}を変更しました`;
                    }
                    return `ワークスペースを${toPolicyName}${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}に変更しました`;
                },
                changeType: (oldType: string, newType: string) => `${oldType} から ${newType} に変更しました`,
                exportedToCSV: `CSV にエクスポート済み`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `${translatedLabel} にエクスポートしました`;
                    },
                    automaticActionOne: (label: string) => `${label} にエクスポート済み（経由）`,
                    automaticActionTwo: '会計設定',
                    manual: (label: string) => `このレポートを、${label} へ手動エクスポート済みとしてマークしました。`,
                    automaticActionThree: 'のレコードを正常に作成しました',
                    reimburseableLink: '立替経費',
                    nonReimbursableLink: '会社カード経費',
                    pending: (label: string) => `このレポートの${label}へのエクスポートを開始しました…`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `このレポートを${label}にエクスポートできませんでした（"${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `領収書を追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `他で${currency}${amount}を支払いました`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `統合経由で${currency}${amount}を支払いました`,
                outdatedBankAccount: `支払元の銀行口座に問題があり、支払いを処理できませんでした`,
                reimbursementACHBounce: `銀行口座の問題により支払いを処理できませんでした`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払者が銀行口座を変更したため、支払いを処理できませんでした`,
                reimbursementDelayed: `支払いは処理されましたが、さらに 1～2 営業日ほど遅れています`,
                selectedForRandomAudit: `ランダムに選ばれて審査されました`,
                selectedForRandomAuditMarkdown: `レビューのために[ランダムに選択](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)されました`,
                share: ({to}: ShareParams) => `招待されたメンバー ${to}`,
                unshare: ({to}: UnshareParams) => `削除されたメンバー ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `支払い済み ${currency}${amount}`,
                takeControl: `制御を取得しました`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `${label}${errorMessage ? ` ("${errorMessage}")` : ''} との同期中に問題が発生しました。<a href="${workspaceAccountingLink}">ワークスペース設定</a>で問題を解決してください。`,
                addEmployee: (email: string, role: string) => `${email} を ${role === 'member' ? 'a' : '1つの'} ${role} として追加しました`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} のロールを ${currentRole} から ${newRole} に更新しました`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド1（以前の値："${previousValue}"）を削除しました`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド1に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド1を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} さんのカスタムフィールド 2 を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `"${newValue}" を ${email} のカスタムフィールド2に追加しました`
                        : `${email} のカスタムフィールド2を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: (email: string, role: string) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} への接続を削除しました`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続済み`,
                leftTheChat: 'チャットを退出しました',
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `${feedName} との接続が切断されています。カードの取引明細の取り込みを再開するには、<a href='${workspaceCompanyCardRoute}'>銀行にログイン</a>してください`,
            },
            error: {
                invalidCredentials: '認証情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${date} までの ${dayCount} ${dayCount === 1 ? '日' : '日'} の${summary}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date}の${timePeriod}の${summary}`,
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費精算書',
        companyCreditCard: '会社のクレジットカード',
        receiptScanningApp: '領収書スキャンアプリ',
        billPay: '請求書支払い',
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
        jobs: '求人',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投資家向け情報',
        getStarted: '開始する',
        createAccount: '新しいアカウントを作成',
        logIn: 'ログイン',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'チャット一覧に戻る',
        chatWelcomeMessage: 'チャットのウェルカムメッセージ',
        navigatesToChat: 'チャットに移動します',
        newMessageLineIndicator: '新規メッセージ行インジケーター',
        chatMessage: 'チャットメッセージ',
        lastChatMessagePreview: '最後のチャットメッセージのプレビュー',
        workspaceName: 'ワークスペース名',
        chatUserDisplayNames: 'チャットメンバーの表示名',
        scrollToNewestMessages: '最新のメッセージまでスクロール',
        preStyledText: '事前スタイル設定済みテキスト',
        viewAttachment: '添付ファイルを表示',
    },
    parentReportAction: {
        deletedReport: '削除されたレポート',
        deletedMessage: '削除されたメッセージ',
        deletedExpense: '削除された経費',
        reversedTransaction: '返金取引',
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
        copy: 'URLをコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'フラグが付けられたすべてのメッセージは、モデレーターによる確認のために送信されます。',
        chooseAReason: 'フラグを付ける理由を以下から選択してください：',
        spam: '迷惑メール',
        spamDescription: '求められていない無関係な宣伝',
        inconsiderate: '無神経',
        inconsiderateDescription: '侮辱的または無礼な言い回しで、意図に疑わしい点があるもの',
        intimidation: '脅し',
        intimidationDescription: 'もっともな異議を押し切って、強引に自分の議題を推し進めること',
        bullying: 'いじめ',
        bullyingDescription: '服従を得るために個人を標的にすること',
        harassment: '嫌がらせ',
        harassmentDescription: '人種差別的、女性蔑視的、またはその他の広く差別的な行為',
        assault: '暴行',
        assaultDescription: '危害を与える意図をもって行われる、特定の個人を狙った感情的な攻撃',
        flaggedContent: 'このメッセージはコミュニティルールに違反していると判断され、内容は非表示になりました。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告を送信し、メッセージはレビューのために報告されます。',
        levelTwoResult: 'メッセージはチャンネルから非表示になり、匿名の警告が追加され、メッセージはレビューのために報告されました。',
        levelThreeResult: 'チャンネルからメッセージを削除し、匿名の警告を送信し、メッセージを審査用に報告しました。',
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
        submit: '誰かに提出する',
        categorize: 'カテゴリ分けする',
        share: '私の会計士と共有する',
        nothing: '今のところ何もありません',
    },
    teachersUnitePage: {
        teachersUnite: '教師団結',
        joinExpensifyOrg:
            '世界中の不平等をなくすために、Expensify.org に参加しましょう。現在の「Teachers Unite」キャンペーンでは、必需の学用品の費用を分担することで、あらゆる場所の教育者を支援しています。',
        iKnowATeacher: '私は先生を知っています',
        iAmATeacher: '私は教師です',
        getInTouch: '素晴らしいですね！連絡が取れるように、その方の情報を共有してください。',
        introSchoolPrincipal: '学校長の紹介',
        schoolPrincipalVerifyExpense:
            'Expensify.org は、必需の学用品の費用を分担し、低所得世帯の生徒がより良い学習体験を得られるようにします。あなたの費用は、校長先生に確認してもらう必要があります。',
        principalFirstName: '名義人の名',
        principalLastName: '主な姓',
        principalWorkEmail: '主な勤務用メールアドレス',
        updateYourEmail: 'メールアドレスを更新',
        updateEmail: 'メールアドレスを更新',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `先へ進む前に、学校のメールアドレスを既定の連絡方法として設定してください。設定 > プロフィール > <a href="${contactMethodsRoute}">連絡方法</a> で設定できます。`,
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
            onlineSubtitle: 'マップを設定しています。少々お待ちください',
            errorTitle: '地図エラー',
            errorSubtitle: '地図の読み込み中にエラーが発生しました。もう一度お試しください。',
        },
        error: {
            selectSuggestedAddress: '候補の住所を選択するか、現在地を使用してください',
        },
        odometer: {startReading: '読み始める', endReading: '読み取り終了', saveForLater: '後で保存', totalDistance: '合計距離'},
    },
    reportCardLostOrDamaged: {
        screenTitle: '成績証明書の紛失または損傷',
        nextButtonLabel: '次へ',
        reasonTitle: 'なぜ新しいカードが必要ですか？',
        cardDamaged: 'カードが破損しました',
        cardLostOrStolen: 'カードを紛失した／盗難にあった',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは 2～3 営業日以内に到着します。現在お使いのカードは、新しいカードを有効化するまで引き続きご利用いただけます。',
        cardLostOrStolenInfo: '現在お使いのカードは、新しいカードの注文が確定すると同時に恒久的に無効化されます。ほとんどのカードは、数営業日以内に到着します。',
        address: '住所',
        deactivateCardButton: 'カードを無効化',
        shipNewCardButton: '新しいカードを発送',
        addressError: '住所は必須です',
        reasonError: '理由は必須です',
        successTitle: '新しいカードを発送しました！',
        successDescription: '数営業日で届いたら、有効化する必要があります。その間はバーチャルカードを利用できます。',
    },
    eReceipt: {
        guaranteed: '保証付き電子レシート',
        transactionDate: '取引日',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを開始して、<success><strong>友達を紹介しましょう</strong></success>。',
            header: 'チャットを開始、友達を紹介',
            body: '友だちにも Expensify を使ってほしいですか？友だちとのチャットを開始するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を提出して、<success><strong>チームを紹介しましょう</strong></success>。',
            header: '経費を提出し、チームを紹介する',
            body: 'あなたのチームにもExpensifyを使ってほしいですか？そのチームに経費を提出するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友だちを紹介',
            body: '友達にもExpensifyを使ってほしいですか？チャットしたり、支払ったり、精算を分け合ったりするだけで、あとはお任せください。招待リンクを共有するだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友だちを紹介',
            header: '友だちを紹介',
            body: '友達にもExpensifyを使ってほしいですか？チャットしたり、支払ったり、精算を分け合ったりするだけで、あとはお任せください。招待リンクを共有するだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `ヘルプが必要な場合は、<a href="${href}">${adminReportName}</a> でセットアップ担当者とチャットしてください`,
        default: `セットアップについては、<concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> にメッセージを送ってサポートを受けてください`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必須です',
        autoReportedRejectedExpense: 'この経費は却下されました。',
        billableExpense: '請求可能の有効期限切れ',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `領収書が必要です${formattedLimit ? `${formattedLimit} 超過` : ''}`,
        categoryOutOfPolicy: 'カテゴリは無効になりました',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `適用された為替換算サーチャージ${surcharge}%`,
        customUnitOutOfPolicy: 'このワークスペースには有効なレートではありません',
        duplicatedTransaction: '重複の可能性',
        fieldRequired: 'レポートフィールドは必須です',
        futureDate: '未来の日付は使用できません',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `${invoiceMarkup}% 上乗せ済み`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `${maxAge}日より前の日付`,
        missingCategory: 'カテゴリ未設定',
        missingComment: '選択したカテゴリーには説明が必要です',
        missingAttendees: 'このカテゴリには複数の参加者が必要です',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'タグ'} が見つかりません`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '計算された距離から算出された金額と異なります';
                case 'card':
                    return 'カード取引額を超えています';
                default:
                    if (displayPercentVariance) {
                        return `スキャンされたレシートより${displayPercentVariance}%多い金額`;
                    }
                    return 'スキャンしたレシートの金額を超えています';
            }
        },
        modifiedDate: 'スキャンしたレシートの日付と異なります',
        nonExpensiworksExpense: 'Expensiworks 以外の経費',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `経費が自動承認上限額 ${formattedLimit} を超えています`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `1人あたりのカテゴリ上限額 ${formattedLimit} を超えています`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限額 ${formattedLimit} を超過`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `金額が 1 回の出張あたりの上限 ${formattedLimit} を超えています`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限額 ${formattedLimit} を超過`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `1人あたりの1日${formattedLimit}のカテゴリ上限超過額`,
        receiptNotSmartScanned: 'レシートと経費の詳細が手動で追加されました。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `領収書が必要です（カテゴリ上限 ${formattedLimit} を超過）`;
            }
            if (formattedLimit) {
                return `${formattedLimit}を超えるため領収書が必要です`;
            }
            if (category) {
                return `カテゴリ上限を超えたため領収書が必要です`;
            }
            return '領収書が必要';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `明細領収書が必要です${formattedLimit ? `（${formattedLimit}超）` : ''}`,
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
        reviewRequired: 'レビューが必要',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行連携の不具合により、領収書を自動照合できません';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行接続が切断されました。<a href="${companyCardPageURL}">領収書と照合するために再接続</a>`
                    : '銀行接続が切断されています。管理者に依頼して再接続し、領収書と照合してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member} に現金としてマークするよう依頼するか、7日間待ってからもう一度お試しください` : 'カード取引との統合を待機中です。';
            }
            return '';
        },
        brokenConnection530Error: '銀行接続の不具合により領収書が保留中',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の不具合により、領収書が保留されています。<a href="${workspaceCompanyCardRoute}">会社カード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行連携の不具合により、領収書が保留されています。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いをリクエストします。',
        smartscanFailed: ({canEdit = true}) => `レシートのスキャンに失敗しました。${canEdit ? '詳細を手動で入力' : ''}`,
        receiptGeneratedWithAI: 'AI生成の可能性がある領収書',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `不足: ${tagName ?? 'タグ'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} は有効ではなくなりました`,
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税'} は有効ではなくなりました`,
        taxRateChanged: '税率が変更されました',
        taxRequired: '税率が未設定',
        none: 'なし',
        taxCodeToKeep: '保持する税コードを選択',
        tagToKeep: '保持するタグを選択',
        isTransactionReimbursable: 'この取引が精算対象かどうかを選択',
        merchantToKeep: '保持する加盟店を選択',
        descriptionToKeep: '保持する説明を選択',
        categoryToKeep: '維持するカテゴリーを選択',
        isTransactionBillable: '取引が請求可能かどうかを選択',
        keepThisOne: 'これを保持',
        confirmDetails: `保持する詳細を確認してください`,
        confirmDuplicatesInfo: `あなたが保持しない重複分は、申請者が削除できるように保留されます。`,
        hold: 'この経費は保留になっています',
        resolvedDuplicates: '重複を解決しました',
        companyCardRequired: '法人カードでの購入が必須',
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
        header: '行く前に',
        reasonPage: {
            title: '退会理由をお聞かせください',
            subtitle: 'お戻りになる前に、Expensify Classic へ切り替えたい理由をお聞かせください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic でのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'New Expensify の使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensify の使い方はわかりますが、Expensify Classic のほうが好きです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensify にはまだない、必要としている機能は何ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしていますか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜ Expensify Classic を好むのですか？',
        },
        responsePlaceholder: 'あなたの回答',
        thankYou: 'フィードバックをありがとうございます！',
        thankYouSubtitle: 'ご回答は、タスクをより効率的にこなせる、より良いプロダクトづくりに役立ちます。ご協力ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classic に切り替え',
        offlineTitle: 'ここで行き詰まっているようです…',
        offline:
            'オフラインのようです。残念ながら、Expensify Classic はオフラインでは動作しませんが、新しい Expensify はオフラインでも利用できます。Expensify Classic を利用したい場合は、インターネットに接続してから再度お試しください。',
        quickTip: 'クイックヒント…',
        quickTipSubTitle: 'expensify.com にアクセスすると、Expensify Classic に直接移動できます。簡単にアクセスできるよう、ブックマークしておきましょう！',
        bookACall: '通話を予約',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費やレポート上での直接チャット',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルであらゆる操作が可能',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードでこなす出張と経費管理',
        },
        bookACallTextTop: 'Expensify Classic に切り替えると、次の機能が利用できなくなります：',
        bookACallTextBottom: 'ぜひお電話でその理由をお伺いしたいと考えています。お客様のご要望について話し合うために、シニアプロダクトマネージャーとの通話を予約していただけます。',
        takeMeToExpensifyClassic: 'Expensify Classic を表示',
    },
    listBoundary: {
        errorMessage: 'さらにメッセージを読み込む際にエラーが発生しました',
        tryAgain: '再試行',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引にレシートをマッチしました',
    },
    subscription: {
        authenticatePaymentCard: '支払いカードを認証',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションを変更できません。',
        badge: {
            freeTrial: (numOfDays: number) => `無料トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日'} 日`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `${date} までにお支払いカードを更新して、すべてのお気に入りの機能を引き続きご利用ください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `${date} の ${purchaseAmountOwed} の請求を処理できませんでした。未払金を清算するために、支払いカードを追加してください。`
                        : '支払い残高を清算するには、支払いカードを追加してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `お支払い期限を過ぎています。サービスの中断を避けるため、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払いの期限が過ぎています。請求書のお支払いをお願いします。',
            },
            billingDisputePending: {
                title: 'あなたのカードに請求できませんでした',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `${cardEnding}で終わるカードの${amountOwed}の請求に対して異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お支払いカードは完全に認証されていません。',
                subtitle: (cardEnding: string) => `お支払いカード（末尾が ${cardEnding} のカード）を有効化するには、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'あなたのカードに請求できませんでした',
                subtitle: (amountOwed: number) =>
                    `ご利用の支払いカードは残高不足のため承認されませんでした。${amountOwed} の未払い残高を清算するため、再試行するか新しい支払いカードを追加してください。`,
            },
            cardExpired: {
                title: 'あなたのカードに請求できませんでした',
                subtitle: (amountOwed: number) => `お支払いカードの有効期限が切れています。未払い残高 ${amountOwed} を清算するために、新しいお支払いカードを追加してください。`,
            },
            cardExpireSoon: {
                title: 'お使いのカードの有効期限がもうすぐ切れます',
                subtitle:
                    'ご利用の支払いカードは今月末で有効期限が切れます。すべてのお気に入りの機能を引き続きご利用いただくには、下の 3 点メニューをクリックしてカード情報を更新してください。',
            },
            retryBillingSuccess: {
                title: '成功しました！',
                subtitle: 'カードの請求が正常に完了しました。',
            },
            retryBillingError: {
                title: 'あなたのカードに請求できませんでした',
                subtitle: '再試行する前に、Expensify での請求を承認し、保留を解除するよう、銀行に直接ご連絡ください。  \nそれが難しい場合は、別の支払いカードを追加してみてください。',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `${cardEnding}で終わるカードの${amountOwed}の請求に対して異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitle: '次のステップとして、<a href="#">セットアップチェックリストを完了</a>し、チームが経費精算を開始できるようにしましょう。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `トライアル: 残り ${numOfDays} ${numOfDays === 1 ? '日' : '日'} 日！`,
                subtitle: 'すべてのお気に入りの機能を引き続き利用するには、支払いカードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルは終了しました',
                subtitle: 'すべてのお気に入りの機能を引き続き利用するには、支払いカードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: 'オファーを獲得',
                subscriptionPageTitle: (discountType: number) => `<strong>初年度が${discountType}%オフ！</strong> 支払いカードを追加して、年額サブスクリプションを開始しましょう。`,
                onboardingChatTitle: (discountType: number) => `期間限定オファー：初年度が${discountType}%オフ！`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `${days > 0 ? `${days}日 :` : ''}${hours}時間 : ${minutes}分 : ${seconds}秒以内に申請`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensify のサブスクリプションを支払うためのカードを追加してください。',
            addCardButton: '支払カードを追加',
            cardInfo: (name: string, expiration: string, currency: string) => `名前: ${name}, 有効期限: ${expiration}, 通貨: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `次回のお支払い日は${nextPaymentDate}です。`,
            cardEnding: (cardNumber: string) => `末尾が${cardNumber}のカード`,
            changeCard: '支払いカードを変更',
            changeCurrency: '支払通貨を変更',
            cardNotFound: '支払カードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証',
            requestRefund: '返金をリクエスト',
            requestRefundModal: {
                full: '返金を受けるのは簡単です。次回の請求日の前にアカウントをダウングレードすれば、返金されます。<br /> <br /> ご注意：アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合はいつでも新しいワークスペースを作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'あなたのプラン',
            exploreAllPlans: 'すべてのプランを表示',
            customPricing: 'カスタム価格',
            asLowAs: ({price}: YourPlanPriceValueParams) => `アクティブメンバー1人あたり月額${price}から`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price}／メンバー／月`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額${price}`,
            perMemberMonth: '1メンバーあたり／月',
            collect: {
                title: '回収',
                description: '経費、出張、チャットをすべて備えた小規模ビジネス向けプラン。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用しているアクティブメンバーは ${lower}/人、Expensify Card を利用していないアクティブメンバーは ${upper}/人。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用しているアクティブメンバーは ${lower}/人、Expensify Card を利用していないアクティブメンバーは ${upper}/人。`,
                benefit1: 'レシートのスキャン',
                benefit2: '精算',
                benefit3: '法人カード管理',
                benefit4: '経費と出張の承認',
                benefit5: '出張予約とルール',
                benefit6: 'QuickBooks/Xero 連携',
                benefit7: '経費、レポート、ルームでチャット',
                benefit8: 'AI と人間によるサポート',
            },
            control: {
                title: '管理',
                description: '大企業向けの経費精算、出張管理、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用しているアクティブメンバーは ${lower}/人、Expensify Card を利用していないアクティブメンバーは ${upper}/人。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用しているアクティブメンバーは ${lower}/人、Expensify Card を利用していないアクティブメンバーは ${upper}/人。`,
                benefit1: 'Collect プランのすべて',
                benefit2: '多段階承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP 統合（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人事システム連携（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタム分析とレポート',
                benefit8: '予算管理',
            },
            thisIsYourCurrentPlan: 'これは現在ご利用中のプランです',
            downgrade: 'Collect にダウングレード',
            upgrade: 'Control にアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensify Cardで節約',
            saveWithExpensifyDescription: 'Expensify Card のキャッシュバックが Expensify の請求額をどれだけ削減できるか、当社の節約額計算ツールで確認しましょう。',
            saveWithExpensifyButton: '詳細はこちら',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>あなたに最適なプランで、必要な機能をアンロックしましょう。各プランの機能の詳細は、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。</muted-text>`,
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
                'お知らせ：今すぐサブスクリプション人数を設定しない場合、初月のアクティブメンバー数に自動的に設定されます。その場合、今後12か月間は少なくともこの人数分のメンバー料金をお支払いいただくことになります。サブスクリプション人数はいつでも増やすことができますが、契約期間が終了するまでは減らすことはできません。',
            zeroCommitment: '割引された年間サブスクリプション料金でコミットメントは一切不要',
        },
        subscriptionSize: {
            title: 'サブスクリプションのサイズ',
            yourSize: 'サブスクリプションの規模は、ある月にアクティブメンバーによって埋めることができる空席の数を指します。',
            eachMonth:
                '毎月、上記で設定した人数までのアクティブメンバーがサブスクリプションに含まれます。サブスクリプション人数を増やすと、その時点の新しい人数で新たに 12 か月間のサブスクリプションが開始されます。',
            note: '注: アクティブメンバーとは、あなたの会社ワークスペースに紐づく経費データを作成、編集、提出、承認、精算、またはエクスポートしたことのあるユーザーを指します。',
            confirmDetails: '新しい年額サブスクリプションの詳細を確認してください:',
            subscriptionSize: 'サブスクリプションのサイズ',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} 名のアクティブメンバー／月`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年間サブスクリプション期間中はダウングレードできません。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `すでに、${date} まで毎月 ${size} 名のアクティブメンバー分の年間サブスクリプションにコミットしています。自動更新を無効にすると、${date} から従量課金制サブスクリプションに切り替えることができます。`,
            error: {
                size: '有効なサブスクリプションサイズを入力してください',
                sameSize: '現在のサブスクリプション数とは異なる数字を入力してください',
            },
        },
        paymentCard: {
            addPaymentCard: '支払カードを追加',
            enterPaymentCardDetails: '支払いカードの詳細を入力してください',
            security: 'Expensify は PCI-DSS に準拠し、銀行レベルの暗号化を使用し、お客様のデータを保護するために冗長化されたインフラストラクチャを活用しています。',
            learnMoreAboutSecurity: '当社のセキュリティについて詳しく見る',
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `サブスクリプションの種類: ${subscriptionType}、サブスクリプションの規模: ${subscriptionSize}、自動更新: ${autoRenew}、年間シート数の自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年額',
            autoRenew: '自動更新',
            autoIncrease: '年間シート数を自動増加',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `アクティブメンバー1人あたり月額最大${amountWithCurrency}を節約`,
            automaticallyIncrease:
                'アクティブメンバー数が現在の契約数を超えた場合に対応できるよう、年間シート数を自動的に増やします。  \n注: これにより、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensify をより良くするためにご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `更新日：${date}`,
            pricingConfiguration: '料金は構成によって異なります。最もお得にご利用いただくには、年額サブスクリプションを選択し、Expensify Card をご利用ください。',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>詳しくは<a href="${CONST.PRICING}">料金ページ</a>をご覧いただくか、${hasAdminsRoom ? `<a href="adminsRoom">#admins ルーム。</a>` : '#admins ルーム'}で当社チームにチャットでお問い合わせください</muted-text>`,
            estimatedPrice: '見積価格',
            changesBasedOn: 'これは、Expensify Card の利用状況と、以下のサブスクリプションオプションによって変わります。',
        },
        requestEarlyCancellation: {
            title: '早期解約をリクエスト',
            subtitle: '早期解約をリクエストされる主な理由は何ですか？',
            subscriptionCanceled: {
                title: 'サブスクリプションをキャンセルしました',
                subtitle: '年間サブスクリプションは解約されました。',
                info: 'ワークスペースを従量課金制で引き続き利用したい場合は、これで準備完了です。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `今後のアクティビティや請求を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除</a>する必要があります。ワークスペースを削除すると、その月の暦月内に発生した未精算のアクティビティについて料金が請求される点にご注意ください。`,
            },
            requestSubmitted: {
                title: 'リクエストを送信しました',
                subtitle:
                    'サブスクリプションの解約をご希望とのこと、お知らせいただきありがとうございます。現在ご依頼内容を確認しており、まもなく<concierge-link>Concierge</concierge-link>とのチャットを通じてご連絡いたします。',
            },
            acknowledgement: `早期解約をリクエストすることにより、私は、Expensify は Expensify の<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または私と Expensify 間のその他の適用されるサービス契約の下で、かかるリクエストを承認する義務を負わず、また Expensify がその裁量によりかかるリクエストを承認するかどうかを単独で決定する権限を有することを認識し、これに同意します。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖、人員削減、または買収',
        additionalInfoTitle: 'どのソフトウェアへ移行し、理由は何ですか？',
        additionalInfoInputLabel: 'あなたの回答',
    },
    roomChangeLog: {
        updateRoomDescription: '部屋の説明を次の内容に設定:',
        clearRoomDescription: 'ルームの説明を削除しました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームのアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替える',
        copilotDelegatedAccess: 'Copilot：委任アクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにします。',
        addCopilot: 'Copilot を追加',
        membersCanAccessYourAccount: 'これらのメンバーはあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'これらのアカウントには、アカウント切り替え機能からアクセスできます。',
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
        onBehalfOfMessage: (delegator: string) => `${delegator} の代理で`,
        accessLevel: 'アクセス権限レベル',
        confirmCopilot: '以下であなたのCopilotを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。Full と Limited の両方のアクセス権で、コパイロットはすべての会話と経費を閲覧できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '別のメンバーがあなたの代理として、あなたのアカウント内であらゆる操作を行えるようにします。チャット、提出、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'あなたの代理として、あなたのアカウント内でほとんどの操作を別のメンバーに許可します。承認、支払い、却下、および保留は対象外です。';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot を削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセス権限レベルを変更',
        makeSureItIsYou: 'あなた本人であることを確認しましょう',
        enterMagicCode: (contactMethod: string) => `コパイロットを追加するために、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
        enterMagicCodeUpdate: (contactMethod: string) => `${contactMethod} に送信されたマジックコードを入力して、あなたのコパイロットを更新してください。`,
        notAllowed: 'ちょっと待ってください…',
        noAccessMessage: dedent(`
            このページには、コパイロットとしてアクセスできません。申し訳ありません。
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
        editJson: 'JSON を編集',
        preview: 'プレビュー:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} がありません`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `無効なプロパティ: ${propertyName} - 期待される型: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `無効な値 - 期待される値: ${expectedValues}`,
        missingValue: '値が未入力です',
        createReportAction: 'レポート作成アクション',
        reportAction: 'レポートアクション',
        report: 'レポート',
        transaction: '取引',
        violations: '違反',
        transactionViolation: '取引違反',
        hint: 'データの変更はバックエンドに送信されません',
        textFields: 'テキストフィールド',
        numberFields: '数値フィールド',
        booleanFields: 'ブール値フィールド',
        constantFields: '定数フィールド',
        dateTimeFields: '日時フィールド',
        date: '日付',
        time: '時間',
        none: 'なし',
        visibleInLHN: 'LHN に表示',
        GBR: '英国',
        RBR: 'RBR',
        true: '真',
        false: '偽',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: '下書きコメントあり',
            hasGBR: 'GBR を保有',
            hasRBR: 'RBR あり',
            pinnedByUser: 'メンバーによるピン留め',
            hasIOUViolations: 'IOU 違反あり',
            hasAddWorkspaceRoomErrors: 'ワークスペースルームの追加エラーがあります',
            isUnread: '未読（フォーカスモード）',
            isArchived: 'アーカイブ済み（最新モード）',
            isSelfDM: '自分へのDMです',
            isFocused: '一時的にフォーカスされています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストあり（管理者用ルーム）',
            isUnreadWithMention: 'メンション付きの未読',
            isWaitingForAssigneeToCompleteAction: '担当者の対応完了待ち',
            hasChildReportAwaitingAction: '対応待ちの子レポートがあります',
            hasMissingInvoiceBankAccount: '請求書の銀行口座が未設定です',
            hasUnresolvedCardFraudAlert: '未解決のカード不正利用アラートがあります',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションのデータにエラーがあります',
            hasViolations: '違反あり',
            hasTransactionThreadViolations: 'トランザクションスレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '対応が必要なレポートがあります',
            theresAReportWithErrors: 'エラーのあるレポートがあります',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位にエラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題が発生しました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法の確認が必要です',
            theresAProblemWithAPaymentMethod: '支払い方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: '立替精算用の口座に問題があります',
            theresABillingProblemWithYourSubscription: 'サブスクリプションの請求に問題があります',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'サブスクリプションは正常に更新されました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました',
            theresAProblemWithYourWallet: 'ウォレットに問題が発生しました',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: 'New Expensify へようこそ！',
        subtitle: 'クラシックなエクスペリエンスで気に入っていただいているすべてに、生活をさらに便利にする数多くのアップグレードを加えました。',
        confirmText: 'さあ、始めましょう！',
        helpText: '2分間デモを試す',
        features: {
            search: 'モバイル、Web、デスクトップでより強力な検索',
            concierge: '経費処理を自動化するための組み込みConcierge AI',
            chat: '不明点をすばやく解決するために、どの経費でもチャットでやり取りしましょう',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>まずは<strong>こちらから！</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>保存した検索の名前を変更</strong>しましょう！</tooltip>',
        accountSwitcher: '<tooltip>ここから<strong>Copilot アカウント</strong>にアクセスできます</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>テスト領収書をスキャン</strong>して、どのように動作するか確認しましょう！</tooltip>',
            manager: '<tooltip>お試しには<strong>テストマネージャー</strong>を選択してください！</tooltip>',
            confirmation: '<tooltip>では、<strong>経費を申請</strong>して、魔法が起こるのを見てみましょう！</tooltip>',
            tryItOut: '試してみる',
        },
        outstandingFilter: '<tooltip><strong>承認が必要</strong>な経費を絞り込む</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して\n<strong>試用を完了しましょう！</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS 追跡を進行中です！完了したら、下で追跡を停止してください。</tooltip>',
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
            description: '以下の詳細をご確認ください。通話を確定すると、詳しい情報を記載した招待をお送りします。',
            setupSpecialist: 'あなたのセットアップ担当者',
            meetingLength: '会議の長さ',
            dateTime: '日付と時刻',
            minutes: '30分',
        },
        callScheduled: '通話を予約済み',
    },
    autoSubmitModal: {
        title: 'すべて問題なく送信されました！',
        description: 'すべての警告と違反が解除されたので：',
        submittedExpensesTitle: 'これらの経費は提出済みです',
        submittedExpensesDescription: 'これらの経費は承認者に送信されていますが、承認されるまでは引き続き編集できます。',
        pendingExpensesTitle: '保留中の経費は移動されました',
        pendingExpensesDescription: '保留中のカード経費は、計上されるまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分間のテストドライブを試す',
        },
        modal: {
            title: '試しに使ってみる',
            description: '短いプロダクトツアーで、すばやく使いこなしましょう。',
            confirmText: 'テストドライブを開始',
            helpText: 'スキップ',
            employee: {
                description:
                    '<muted-text>あなたのチームに<strong>Expensify を3か月間無料</strong>でお試しいただけます！以下にあなたの上司のメールアドレスを入力して、テスト経費を送信してください。</muted-text>',
                email: '上司のメールアドレスを入力してください',
                error: 'そのメンバーはワークスペースのオーナーです。テストするために別のメンバーを入力してください。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '現在、Expensify をお試し利用中です',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: 'はじめる',
        },
        employeeInviteMessage: (name: string) => `# ${name} があなたを Expensify のお試しに招待しました
やあ！経費処理を最速で行える Expensify を、*3 か月無料* でお試しできるようにしておいたよ。

Expensify の使い方をお見せするための*テストレシート*がこちらです。`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: 'すべてのデータ - レポートレベル',
        expenseLevelExport: 'すべてのデータ - 経費レベル',
        exportInProgress: 'エクスポートを実行中',
        conciergeWillSend: 'Concierge がまもなくファイルを送信します。',
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) => `続行する前に、<strong>${domainName}</strong> の DNS 設定を更新して、あなたが所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNS プロバイダーにアクセスし、<strong>${domainName}</strong> の DNS 設定を開いてください。`,
            addTXTRecord: '次のTXTレコードを追加してください:',
            saveChanges: '変更を保存して、ここに戻りドメインを確認してください。',
            youMayNeedToConsult: `認証を完了するには、組織の IT 部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳細を見る</a>。`,
            warning: '確認後、お客様のドメイン上のすべての Expensify メンバーに、そのアカウントがお客様のドメイン管理下に置かれることを知らせるメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しいただき、問題が解決しない場合は Concierge までお問い合わせください。',
        },
        domainVerified: {
            title: 'ドメイン確認済み',
            header: 'やった！あなたのドメインは認証されました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン <strong>${domainName}</strong> は正常に認証されました。これで SAML やその他のセキュリティ機能を設定できます。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーが Expensify にログインする方法を、より細かく管理できるセキュリティ機能です。有効化するには、自身が権限を持つ会社管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、簡単にログイン',
            moreSecurityAndControl: 'さらなるセキュリティと管理',
            onePasswordForAnything: 'すべてに使える1つのパスワード',
        },
        goToDomain: 'ドメインへ移動',
        samlLogin: {
            title: 'SAML ログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン (SSO)</a> でメンバーのサインインを設定します。</muted-text>`,
            enableSamlLogin: 'SAMLログインを有効にする',
            allowMembers: 'メンバーが SAML を使用してログインできるようにします。',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしているメンバーは、SAML を使用して再認証する必要があります。',
            enableError: 'SAML の有効化設定を更新できませんでした',
            requireError: 'SAML 必須設定を更新できませんでした',
            disableSamlRequired: 'SAML 必須を無効にする',
            oktaWarningPrompt: 'よろしいですか？これにより Okta SCIM も無効になります。',
            requireWithEmptyMetadataError: 'Id プロバイダーのメタデータを以下に追加して有効化してください',
        },
        samlConfigurationDetails: {
            title: 'SAML 設定の詳細',
            subtitle: 'これらの詳細を使用して、SAML を設定してください。',
            identityProviderMetadata: 'ID プロバイダー メタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: '名前 ID 形式',
            loginUrl: 'ログインURL',
            acsUrl: 'ACS（Assertion Consumer Service）URL',
            logoutUrl: 'ログアウト URL',
            sloUrl: 'SLO（シングルログアウト）URL',
            serviceProviderMetaData: 'サービスプロバイダー メタデータ',
            oktaScimToken: 'Okta SCIM トークン',
            revealToken: 'トークンを表示',
            fetchError: 'SAML 設定の詳細を取得できませんでした',
            setMetadataGenericError: 'SAMLメタデータを設定できませんでした',
        },
        accessRestricted: {
            title: 'アクセスが制限されています',
            subtitle: (domainName: string) => `以下を管理する必要がある場合は、<strong>${domainName}</strong> の認可された会社管理者であることを確認してください:`,
            companyCardManagement: '法人カードの管理',
            accountCreationAndDeletion: 'アカウントの作成と削除',
            workspaceCreation: 'ワークスペースの作成',
            samlSSO: 'SAML シングルサインオン',
        },
        addDomain: {
            title: 'ドメインを追加',
            subtitle: 'アクセスしたいプライベートドメイン名を入力してください（例：expensify.com）。',
            domainName: 'ドメイン名',
            newDomain: '新しいドメイン',
        },
        domainAdded: {title: 'ドメインが追加されました', description: '次に、ドメインの所有権を確認し、セキュリティ設定を調整する必要があります。', configure: '設定'},
        enhancedSecurity: {
            title: '強化されたセキュリティ',
            subtitle: 'ドメインのメンバーにシングルサインオンでのログインを必須化し、ワークスペースの作成を制限するなど、さらに多くのことができます。',
            enable: '有効にする',
        },
        admins: {
            title: '管理者',
            findAdmin: '管理者を検索',
            primaryContact: '主要連絡先',
            addPrimaryContact: '主要連絡先を追加',
            setPrimaryContactError: 'メインの連絡先を設定できませんでした。後でもう一度お試しください。',
            settings: '設定',
            consolidatedDomainBilling: '統合ドメイン請求',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>有効にすると、<strong>${domainName}</strong> メンバーが所有するすべてのワークスペースの支払いを代表連絡先が行い、すべての請求書の領収書を受け取ります。</muted-text-label></comment>`,
            consolidatedDomainBillingError: '統合ドメイン請求を変更できませんでした。後でもう一度お試しください。',
            addAdmin: '管理者を追加',
            addAdminError: 'このメンバーを管理者として追加できません。もう一度お試しください。',
            revokeAdminAccess: '管理者アクセスを取り消す',
            cantRevokeAdminAccess: '技術連絡先から管理者アクセス権を取り消すことはできません',
            error: {
                removeAdmin: 'このユーザーを管理者として削除できません。もう一度お試しください。',
                removeDomain: 'このドメインを削除できません。もう一度お試しください。',
                removeDomainNameInvalid: 'リセットするドメイン名を入力してください。',
            },
            resetDomain: 'ドメインをリセット',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `ドメインのリセットを確認するため、<strong>${domainName}</strong> と入力してください。`,
            enterDomainName: 'ここにドメイン名を入力してください',
            resetDomainInfo: `この操作は<strong>永久的</strong>であり、次のデータが削除されます：<br/> <ul><li>会社カードの接続およびそれらのカードからの未報告の経費</li> <li>SAML とグループ設定</li> </ul> すべてのアカウント、ワークスペース、レポート、経費、およびその他のデータは保持されます。<br/><br/>注：関連付けられているメールアドレスを<a href="#">連絡先方法</a>から削除することで、このドメインをドメイン一覧から消去できます。`,
        },
        members: {
            title: 'メンバー',
            findMember: 'メンバーを検索',
            addMember: 'メンバーを追加',
            email: 'メールアドレス',
            errors: {addMember: 'このメンバーを追加できませんでした。もう一度お試しください。'},
        },
        domainAdmins: 'ドメイン管理者',
    },
    gps: {
        disclaimer: '移動中の経路から、GPS を使って経費を作成しましょう。下の「開始」をタップして追跡を始めてください。',
        error: {failedToStart: '位置情報の追跡を開始できませんでした。', failedToGetPermissions: '必要な位置情報の権限を取得できませんでした。'},
        trackingDistance: '距離を追跡中...',
        stopped: '停止',
        start: '開始',
        stop: '停止',
        discard: '破棄',
        stopGpsTrackingModal: {title: 'GPS追跡を停止', prompt: '本当に終了しますか？現在のジャーニーが終了します。', cancel: '追跡を再開', confirm: 'GPS追跡を停止'},
        discardDistanceTrackingModal: {title: '距離の追跡を破棄', prompt: '本当に実行しますか？現在の行程が破棄され、元に戻すことはできません。', confirm: '距離の追跡を破棄'},
        zeroDistanceTripModal: {title: '経費を作成できません', prompt: '開始地点と終了地点が同じ経路では経費を作成できません。'},
        locationRequiredModal: {title: '位置情報へのアクセスが必要です', prompt: 'GPS で距離を追跡するには、デバイスの設定で位置情報へのアクセスを許可してください。', allow: '許可'},
        androidBackgroundLocationRequiredModal: {
            title: 'バックグラウンド位置情報へのアクセスが必要です',
            prompt: 'GPS距離の追跡を開始するには、デバイスの設定でバックグラウンドの位置情報アクセスを許可し（「常に許可」オプション）、有効にしてください。',
        },
        preciseLocationRequiredModal: {title: '正確な位置情報が必要です', prompt: 'GPS距離の追跡を開始するには、デバイスの設定で「正確な位置情報」を有効にしてください。'},
        desktop: {title: 'スマートフォンで距離を記録する', subtitle: 'GPS で自動的にマイルまたはキロメートルを記録し、移動をすぐに経費に変換します。', button: 'アプリをダウンロード'},
        signOutWarningTripInProgress: {title: 'GPS追跡を実行中', prompt: 'この出張を破棄してサインアウトしてもよろしいですか？', confirm: '破棄してサインアウト'},
        notification: {title: 'GPS追跡を実行中', body: '完了するにはアプリに移動'},
        continueGpsTripModal: {
            title: 'GPS の走行記録を続けますか？',
            prompt: '前回のGPS移動中にアプリが終了したようです。その移動の記録を続けますか？',
            confirm: '出張を続ける',
            cancel: '出張を表示',
        },
        locationServicesRequiredModal: {
            title: '位置情報へのアクセスが必要です',
            confirm: '設定を開く',
            prompt: 'GPS距離の追跡を開始するには、デバイスの設定で位置情報へのアクセスを許可してください。',
        },
        fabGpsTripExplained: 'GPS画面へ移動（フローティングアクション）',
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
