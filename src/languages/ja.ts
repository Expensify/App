import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PersonalRulesModifiedFields, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';

import type {ValueOf} from 'type-fest';

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
import {CONST as COMMON_CONST, Str} from 'expensify-common';
import startCase from 'lodash/startCase';

import type en from './en';
import type {
    ChangeFieldParams,
    ConciergeBrokenCardConnectionParams,
    ConnectionNameParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
    IntacctMappingTitleParams,
    InvalidPropertyParams,
    InvalidValueParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromPersonalSpaceParams,
    NotAllowedExtensionParams,
    OptionalParam,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    RemoveCopilotAccessConfirmationParams,
    RemovedFromApprovalWorkflowParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ResolutionConstraintsParams,
    ShareParams,
    SizeExceededParams,
    StepCounterParams,
    SyncStageNameConnectionsParams,
    UnshareParams,
    UnsupportedFormulaValueErrorParams,
    UpdateRoleParams,
    ViolationsIncreasedDistanceParams,
    ViolationsModifiedAmountParams,
    WorkspaceLockedPlanTypeParams,
    YourPlanPriceParams,
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
        count: '数',
        cancel: 'キャンセル',
        dismiss: '閉じる',
        proceed: '続行',
        unshare: '共有を解除',
        yes: 'はい',
        no: 'いいえ',
        ok: 'OK',
        notNow: '今はしない',
        noThanks: '結構です',
        learnMore: '詳細はこちら',
        buttonConfirm: '了解しました',
        name: '名前',
        attachment: '添付ファイル',
        attachments: '添付ファイル',
        center: '中央',
        resetMapToNorth: '地図を北向きに戻す',
        from: '差出人',
        to: '宛先',
        in: '内',
        optional: '任意',
        new: '新規',
        newFeature: '新機能',
        beta: 'ベータ',
        search: '検索',
        reports: 'レポート',
        spend: '支出',
        find: '検索',
        searchWithThreeDots: '検索…',
        next: '次へ',
        previous: '前へ',
        goBack: '戻る',
        create: '作成',
        add: '追加',
        resend: '再送信',
        save: '保存',
        select: '選択',
        deselect: '選択を解除',
        selectMultiple: '複数選択',
        saveChanges: '変更を保存',
        submit: '送信',
        markAsDone: '完了にする',
        submitted: '送信済み',
        markedAsDoneStatus: '完了済み',
        rotate: '回転',
        zoom: 'ズーム',
        password: 'パスワード',
        magicCode: 'マジックコード',
        digits: '数字',
        twoFactorCode: '2 要素コード',
        workspaces: 'ワークスペース',
        home: 'ホーム',
        inbox: '受信トレイ',
        yourReviewIsRequired: '確認が必要です',
        actionBadge: {
            submit: '送信',
            approve: '承認する',
            pay: '支払う',
            fix: '修正',
            task: 'タスク',
        },
        success: '成功しました',
        group: 'グループ',
        profile: 'プロフィール',
        referral: '紹介',
        payments: '支払',
        approvals: '承認',
        wallet: 'ウォレット',
        preferences: '設定',
        view: '表示',
        review: (amount?: string) => `レビュー${amount ? ` ${amount}` : ''}`,
        not: 'いいえ',
        signIn: 'サインイン',
        signInWithGoogle: 'Googleでログイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'でサインイン',
        continue: '続行',
        firstName: '名（First name）',
        lastName: '姓',
        scanning: 'スキャン中',
        analyzing: '分析中…',
        thinking: 'Concierge が考えています...',
        agentThinking: '考えています…',
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
        visible: '表示中',
        delete: '削除',
        archived: 'アーカイブ済み',
        contacts: '連絡先',
        recents: '最近の項目',
        close: '閉じる',
        comment: 'コメント',
        download: 'ダウンロード',
        downloading: 'ダウンロード中',
        uploading: 'アップロード中',
        pin: 'ピン留め',
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
        ssnLast4: 'SSN の下4桁',
        ssnFull9: 'SSN の9桁すべて',
        addressLine: (lineNumber: number) => `住所 ${lineNumber} 行目`,
        personalAddress: '自宅住所',
        companyAddress: '会社住所',
        noPO: '私書箱や私設私書箱などの住所は使用しないでください。',
        city: '市',
        state: '州',
        streetAddress: '番地（丁目・号）',
        stateOrProvince: '州／都道府県',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: '私は以下に同意します',
        acceptTermsAndPrivacy: `私は、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>に同意します`,
        acceptTermsAndConditions: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">利用規約</a>に同意します`,
        acceptTermsOfService: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>に同意します`,
        downloadFailedEmptyReportDescription: () => ({
            one: '空のレポートはエクスポートできません。',
            other: () => '空のレポートはエクスポートできません。',
        }),
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        calendarOpened: 'カレンダーが開きました',
        send: '送信',
        na: '該当なし',
        noResultsFound: '結果が見つかりません',
        noResultsFoundMatching: (searchString: string) => `"${searchString}" に一致する結果は見つかりませんでした`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `「${searchString}」の候補が利用可能です。` : '候補が利用可能です。'),
        recentDestinations: '最近の宛先',
        timePrefix: 'それは',
        conjunctionFor: '〜用',
        todayAt: '今日',
        tomorrowAt: '明日の',
        yesterdayAt: '昨日',
        conjunctionAt: 'で',
        conjunctionTo: '宛先',
        genericErrorMessage: 'おっと…問題が発生したため、リクエストを完了できませんでした。時間をおいてもう一度お試しください。',
        percentage: 'パーセンテージ',
        progressBarLabel: 'オンボーディング進捗',
        converted: '変換済み',
        error: {
            invalidAmount: '金額が無効です',
            acceptTerms: '続行するには、利用規約に同意する必要があります',
            phoneNumber: `完全な電話番号を入力してください
（例：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: 'この項目は必須です',
            requestModified: 'このリクエストは別のメンバーによって編集されています',
            characterLimitExceedCounter: (length: number, limit: number) => `文字数制限を超えています（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '本日または将来の日付を選択してください',
            invalidTimeShouldBeFuture: '少なくとも1分先の時刻を選択してください',
            invalidCharacter: '無効な文字',
            enterMerchant: '店舗名を入力してください',
            enterAmount: '金額を入力してください',
            missingMerchantName: '加盟店名がありません',
            missingAmount: '金額が未入力',
            missingDate: '日付が未入力です',
            enterDate: '日付を入力',
            invalidTimeRange: '12時間制の時刻を入力してください（例: 2:30 PM）',
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
        inTheFormBeforeContinuing: 'をフォームに入力してから続行してください',
        confirm: '確認',
        reset: 'リセット',
        done: '完了',
        more: 'その他',
        other: 'その他',
        debitCard: 'デビットカード',
        bankAccount: '銀行口座',
        personalBankAccount: '個人銀行口座',
        businessBankAccount: 'ビジネス銀行口座',
        join: '参加',
        leave: '退出',
        decline: '却下',
        reject: '却下',
        transferBalance: '残高を振替',
        enterManually: '手入力する',
        message: 'メッセージ',
        leaveThread: 'スレッドを退出',
        you: 'あなた',
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: 'サポートが必要な場合はConciergeにお問い合わせください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を利用するには、インターネットに接続している必要があります。',
        attachmentWillBeAvailableOnceBackOnline: '添付ファイルは、オンラインに戻ると利用できるようになります。',
        errorOccurredWhileTryingToPlayVideo: 'この動画の再生中にエラーが発生しました。',
        areYouSure: '本当に実行しますか？',
        verify: '確認',
        yesContinue: 'はい、続行',
        websiteExample: '例：https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `例：${zipSampleFormat}` : ''),
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        with: '〜で',
        shareCode: 'コードを共有',
        share: '共有',
        per: 'あたり',
        mi: 'マイル',
        km: 'キロメートル',
        milesAbbreviated: 'マイル',
        kilometersAbbreviated: 'キロ',
        copied: 'コピーしました！',
        someone: '誰か',
        total: '合計',
        edit: '編集',
        letsDoThis: `さあ、始めましょう！`,
        letsStart: `はじめましょう`,
        showMore: 'さらに表示',
        showLess: '表示を減らす',
        plusMore: ({count}: {count: number}) => `+${count}件`,
        merchant: '加盟店',
        googleThisMerchant: ({merchant}: {merchant: string}) => `Google ${merchant}`,
        searchOnGoogle: ({merchant}: {merchant: string}) => `Google で ${merchant} を検索します`,
        change: '変更',
        category: 'カテゴリ',
        vendor: 'ベンダー',
        report: 'レポート',
        billable: '請求可能',
        nonBillable: '請求不可',
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
        mcc: 'MCC',
        categoryGLCode: 'カテゴリGLコード',
        whyDoWeAskForThis: 'なぜこの情報が必要なのですか？',
        required: '必須',
        automatic: '自動',
        showing: '表示中',
        of: 'の',
        default: 'デフォルト',
        update: '更新',
        member: 'メンバー',
        auditor: '監査人',
        role: '役割',
        roleCannotBeChanged: (workflowsLinkPage: string) => `このメンバーはこのワークスペースの<a href="${workflowsLinkPage}">支払者</a>であるため、役割を変更できません。`,
        currency: '通貨',
        groupCurrency: 'グループ通貨',
        rate: '評価',
        emptyLHN: {
            title: 'やった！すべて片付きました。',
            subtitleText1: 'チャットを検索するには',
            subtitleText2: '上のボタン、または次を使って何かを作成する',
            subtitleText3: '下のボタンを押してください。',
            noUnreadChats: '未読のチャットはありません',
            noTodos: 'To-do はありません',
            caughtUp: 'すべて確認済みです。お疲れさまでした！',
            seeAllChats: 'すべてのチャットを表示',
        },
        businessName: '会社名',
        clear: 'クリア',
        type: '種類',
        reportName: 'レポート名',
        action: '操作',
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
        disable: '無効にする',
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
        internationalReimbursementIDs: '国際払い戻しID',
        withdrawalStatus: '出金ステータス',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        dropTitle: 'ドロップする',
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: '無視',
        enabled: '有効',
        disabled: '無効',
        import: 'インポート',
        offlinePrompt: 'この操作は現在実行できません。',
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
        chatWithAccountManager: (accountManagerDisplayName: string) => `特定のご要望がありますか？アカウントマネージャーの${accountManagerDisplayName}とチャットしましょう。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務先メール',
        destination: '宛先',
        subrate: 'サブレート',
        perDiem: '日当',
        validate: '検証',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSVとしてダウンロード',
        print: '印刷',
        help: 'ヘルプ',
        collapsed: '折りたたみ',
        expanded: '展開',
        expenseReport: '経費精算書',
        rateOutOfPolicy: 'ポリシー外の料率',
        leaveWorkspace: 'ワークスペースから退出',
        leaveWorkspaceConfirmation: 'このワークスペースを退出すると、そこへ経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを退出すると、そのレポートや設定を表示できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースを退出すると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `このワークスペースを退出すると、あなたの承認ワークフロー上での役割はワークスペースのオーナーである${workspaceOwner}に引き継がれます。`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `このワークスペースを退出すると、優先エクスポーターとしてあなたの代わりにワークスペースのオーナーである${workspaceOwner}が設定されます。`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `このワークスペースを退出すると、あなたに代わってワークスペースのオーナーである${workspaceOwner}が技術連絡先になります。`,
        leaveWorkspaceReimburser:
            '支払担当者であるため、このワークスペースを退出することはできません。［ワークスペース］＞［支払いの作成または追跡］で新しい支払担当者を設定してから、もう一度お試しください。',
        reimbursable: '払い戻し対象',
        editYourProfile: 'プロフィールを編集',
        comments: 'コメント',
        sharedIn: '共有元',
        unreported: '未報告',
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
        range: '範囲',
        reschedule: '予定を変更',
        general: '一般',
        workspacesTabTitle: 'ワークスペース',
        headsUp: 'ご注意ください！',
        submitTo: '提出先',
        forwardTo: '転送先',
        approvalLimit: '承認限度額',
        overLimitForwardTo: '限度額超過時の転送先',
        merge: 'マージ',
        none: 'なし',
        unstableInternetConnection: 'インターネット接続が不安定です。ネットワークを確認して、もう一度お試しください。',
        enableGlobalReimbursements: 'グローバル払い戻しを有効にする',
        purchaseAmount: '購入金額',
        originalAmount: '元の金額',
        frequency: '頻度',
        link: 'リンク',
        pinned: 'ピン留め済み',
        read: '既読',
        copyToClipboard: 'クリップボードにコピー',
        thisIsTakingLongerThanExpected: '想定より時間がかかっています…',
        domains: 'ドメイン',
        actionRequired: '対応が必要',
        duplicate: '複製',
        duplicated: '複製済み',
        duplicateExpense: '重複経費',
        exchangeRate: '為替レート',
        reimbursableTotal: '精算対象合計',
        nonReimbursableTotal: '未払い対象外の合計',
        opensInNewTab: '新しいタブで開きます',
        locked: 'ロックされています',
        month: '月',
        week: '週',
        year: '年',
        quarter: '四半期',
        vacationDelegate: '休暇代理人',
        expensifyLogo: 'Expensifyロゴ',
        concierge: {greeting: 'こんにちは、どのようにお手伝いできますか？', showHistory: '履歴を表示'},
        duplicateReport: 'レポートを複製',
        approver: '承認者',
        goToConcierge: 'Conciergeへ移動',
        allSet: 'すべて完了！',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `${totalDigits}桁中${digitIndex}桁目を入力`,
        copyOfReportName: (reportName: string) => `${reportName} のコピー`,
        previousMonth: '前月',
        nextMonth: '来月',
        previousYear: '前年',
        nextYear: '来年',
        avatar: 'アバター',
        editor: '編集者',
        restrictions: '制限',
        tagGLCode: 'GL コードにタグを付ける',
        off: 'オフ',
        unableToDisplayChart: 'グラフを表示できません',
        webGLNotSupported: 'お使いのブラウザは WebGL に対応していません。有効にするか、別のブラウザに切り替えてください。',
        apiKey: 'API キー',
    },
    socials: {
        podcast: 'ポッドキャストでフォロー',
        twitter: 'Twitterでフォロー',
        instagram: 'Instagramでフォロー',
        facebook: 'Facebookでフォロー',
        linkedin: 'LinkedInでフォロー',
    },
    concierge: {
        collapseReasoning: '推論を折りたたむ',
        expandReasoning: '推論を展開',
        enableNotifications: {
            prompt: 'Conciergeから返信があったときに通知を受け取りますか？',
            cta: '通知',
        },
    },
    supportalNoAccess: {
        title: 'ちょっと待ってください',
        descriptionWithCommand: (command?: string) =>
            `サポートとしてログインしている場合、この操作を行う権限がありません（コマンド: ${command ?? ''}）。Success がこの操作を行えるようにすべきだと思われる場合は、Slack で会話を開始してください。`,
    },
    lockedAccount: {
        title: 'ロックされたアカウント',
        description: 'このアカウントはロックされているため、この操作を完了することはできません。次の手順については concierge@expensify.com までご連絡ください',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: '現在地を特定できませんでした。もう一度お試しいただくか、住所を手入力してください。',
        permissionDenied: '位置情報へのアクセスが拒否されているようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可する',
        tryAgain: 'してから、もう一度お試しください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: '電話から連絡先をインポートして、大切な人たちにいつでもワンタップで連絡できるようにしましょう。',
        importContactsExplanation: 'あなたのお気に入りの人たちが、いつでもタップ一つでつながります。',
        importContactsNativeText: 'あと一息です！連絡先をインポートできるように許可してください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラへのアクセス',
        expensifyDoesNotHaveAccessToCamera: 'Expensifyは、カメラへのアクセス権限がないと写真を撮影できません。権限を更新するには「設定」をタップしてください。',
        attachmentError: '添付ファイルエラー',
        errorWhileSelectingAttachment: '添付ファイルの選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択した際にエラーが発生しました。別のファイルをお試しください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが24MBの上限を超えています',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `添付ファイルのサイズが上限の ${maxUploadSizeInMB} MB を超えています`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイトより大きくする必要があります',
        wrongFileType: '無効なファイル形式',
        notAllowedExtension: 'このファイル形式は許可されていません。別のファイル形式をお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルをお試しください。',
        protectedPDFNotSupported: 'パスワード保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズ変更されています。フル解像度版をダウンロードしてください。',
        attachmentImageTooLarge: 'この画像は大きすぎるため、アップロード前にプレビューできません。',
        imageDimensionsTooLarge: '画像のサイズが大きすぎて処理できません。小さい画像を使用してください。',
        tooManyFiles: (fileLimit: number) => `一度にアップロードできるファイルは最大${fileLimit}件までです。`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `ファイルが ${maxUploadSizeInMB} MB を超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルをアップロードできません',
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `ファイルサイズは${maxUploadSizeInMB}MB以下である必要があります。これより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度にアップロードできるレシートは最大30枚です。超過分はアップロードされません。',
        unsupportedFileType: (fileType: string) => `${fileType} ファイルはサポートされていません。サポートされているファイルタイプのみアップロードされます。`,
        learnMoreAboutSupportedFiles: '対応している形式の詳細を確認する',
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
        description: '画像をドラッグ、ズーム、回転してお好みのように調整してください。',
    },
    composer: {
        noExtensionFoundForMimeType: 'MIMEタイプに対応する拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像を取得する際に問題が発生しました',
        commentExceededMaxLength: (formattedMaxLength: string) => `コメントの最大文字数は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `タスクタイトルの最大文字数は${formattedMaxLength}文字です。`,
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
        reviewTransaction: {
            reviewTransaction: '取引を確認',
            pleaseReview: 'この取引を確認してください',
            requiresYourReview: 'Expensifyカードの取引が、以下の内容であなたの確認を必要としています。',
            transactionDetails: '取引の詳細',
            deny: '拒否',
            approve: '承認',
            denyTransaction: '取引を却下',
            transactionDenied: '取引が拒否されました',
            transactionApproved: '取引が承認されました！',
            areYouSureToDeny: 'よろしいですか？この画面を閉じると、その取引は拒否されます。',
            youCanTryAgainAtMerchantOrReachOut:
                '加盟店でもう一度お試しください。もしこの取引に心当たりがない場合は、不正の可能性がありますので、<concierge-link>Concierge に連絡してください</concierge-link>。',
            youNeedToTryAgainAtMerchant: 'この取引は未認証のため、拒否されました。再度加盟店でお試しください。',
            goBackToTheMerchant: '取引を続行するには、加盟店のサイトに戻ってください。',
            attemptedTransaction: '試行された取引',
            transactionFailed: '取引に失敗しました',
            transactionCouldNotBeCompleted: '取引を完了できませんでした。加盟店で再度お試しください。',
            transactionCouldNotBeCompletedReachOut:
                '取引を完了できませんでした。心当たりのない取引の場合は、不正の可能性がありますので、<concierge-link>Conciergeに連絡してください</concierge-link>。',
            reviewFailed: 'レビューに失敗しました',
            alreadyReviewedSubtitle:
                'この取引はすでに確認済みです。問題がある場合は、<transaction-history-link>取引履歴</transaction-history-link>をご確認いただくか、<concierge-link>Concierge</concierge-link>までご連絡ください。',
        },
        biometricsTest: {
            biometricsTest: '生体認証テスト',
            authenticationSuccessful: '認証に成功しました',
            successfullyAuthenticatedUsing: (authType?: string) => `${authType} を使用して正常に認証されました。`,
            troubleshootBiometricsStatus: ({status}: {status?: string}) => `生体認証（${status}）`,
            yourAttemptWasUnsuccessful: '認証を試みましたが、成功しませんでした。',
            youCouldNotBeAuthenticated: '認証できませんでした',
            areYouSureToReject: '本当に終了しますか？この画面を閉じると、認証の試行は拒否されます。',
            rejectAuthentication: '認証を拒否',
            test: 'テスト',
            biometricsAuthentication: '生体認証',
            authType: {unknown: '不明', none: 'なし', credentials: '資格情報', biometrics: '生体認証', faceId: 'Face ID', touchId: 'Touch ID', opticId: 'Optic ID', passkey: 'Passkey'},
            statusNeverRegistered: '未登録',
            statusNotRegistered: '未登録',
            statusRegisteredThisDevice: '登録済み',
            statusRegisteredOtherDevice: () => ({one: '別のデバイスが登録されました', other: '登録済みの他のデバイス'}),
        },
        pleaseEnableInSystemSettings: {
            start: '顔認証/指紋認証を有効にするか、デバイスのパスコードを設定してください',
            link: 'システム設定',
            end: '.',
        },
        oops: 'おっと、問題が発生しました',
        looksLikeYouRanOutOfTime: '時間切れになったようです。加盟店で再度お試しください。',
        youRanOutOfTime: '時間切れです',
        letsVerifyItsYou: 'ご本人確認を行いましょう',
        nowLetsAuthenticateYou: 'では、ご本人確認を行いましょう…',
        letsAuthenticateYou: '認証を行っています…',
        verifyYourself: {biometrics: '顔または指紋で本人確認を行ってください', passkeys: 'パスキーで本人確認を行います'},
        enableQuickVerification: {
            biometrics: '顔や指紋を使って、素早く安全に認証できます。パスワードやコードは不要です。',
            passkeys: 'パスキーを使って、素早く安全に認証できるようにします。パスワードやコードは不要です。',
        },
        revoke: {
            title: '顔／指紋 & パスキー',
            explanation: '1 台以上の端末で顔／指紋またはパスキー認証が有効になっています。アクセスを取り消すと、その端末で次回認証する際にマジックコードが必要になります。',
            confirmationPrompt: '本当によろしいですか？そのデバイスで次回の認証を行うには、マジックコードが必要になります。',
            cta: 'アクセスを取り消す',
            noDevices: '顔認証・指紋認証またはパスキー認証に登録されているデバイスがありません。デバイスを登録すると、そのアクセス権をここで取り消すことができるようになります。',
            dismiss: '了解しました',
            error: 'リクエストに失敗しました。後でもう一度お試しください。',
            revoke: '取り消す',
            confirmationPromptAll: '本当に実行してよろしいですか？今後どの端末でも、次回の認証にはマジックコードが必要になります。',
            ctaAll: 'すべて取り消す',
            thisDevice: 'このデバイス',
            otherDevices: (otherDeviceCount?: number) => {
                const numberWords = ['1', '二', '三', '四', '五', '六', '七', '8', '9'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `その他${displayCount}件の${otherDeviceCount === 1 ? 'デバイス' : 'デバイス'}`;
            },
            confirmationPromptThisDevice: '本当によろしいですか？このデバイスで次回の認証を行うには、マジックコードが必要になります。',
            confirmationPromptMultiple: 'よろしいですか？その端末で次回の認証を行うには、マジックコードが必要になります。',
        },
        unsupportedDevice: {
            unsupportedDevice: '未対応のデバイス',
            pleaseDownloadMobileApp: `この操作はお使いのデバイスではサポートされていません。<a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> または <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Playストア</a> からExpensifyアプリをダウンロードして、もう一度お試しください。`,
            pleaseUseWebApp: `この操作はお使いのデバイスではサポートされていません。<a href="${CONST.NEW_EXPENSIFY_URL}">Expensifyウェブアプリ</a>をご利用のうえ、もう一度お試しください。`,
        },
        verificationFailed: '認証に失敗しました',
        setPin: {didNotShipCard: 'カードを発送できませんでした。もう一度お試しください。'},
        revealPin: {couldNotReveal: 'PIN を表示できませんでした。もう一度お試しください。'},
        changePin: {didNotChange: 'お客様の暗証番号は変更されていません。もう一度お試しください。'},
        revealCardDetail: {couldNotReveal: 'カード情報を表示できませんでした。もう一度お試しください。'},
    },
    validateCodeModal: {
        successfulSignInTitle: Str.dedent(`
            アブラカダブラ、
            サインインしました！
        `),
        successfulSignInDescription: '続行するには、元のタブに戻ってください。',
        title: 'マジックコードはこちらです',
        description: Str.dedent(`
            最初にコードを要求したデバイスに表示されているコードを入力してください
        `),
        doNotShare: Str.dedent(`
            コードを他人と共有しないでください。
            Expensifyがこのコードをお尋ねすることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここからサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元の端末に戻り、新しいコードをリクエストしてください',
        successfulNewCodeRequest: 'コードを送信しました。デバイスを確認してください。',
        tfaRequiredTitle: Str.dedent(`
            2 要素認証が必要です
        `),
        tfaRequiredDescription: Str.dedent(`
            サインインしようとしている端末で、二要素認証コードを入力してください。
        `),
        requestOneHere: 'ここで 1 件リクエストします。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支払者',
        whatsItFor: 'これは何のためのものですか？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '名前、メールアドレス、または電話番号',
        findMember: 'メンバーを検索',
        searchForSomeone: '誰かを検索',
        userSelected: (username: string) => `${username} 選択された`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を提出し、チームを紹介する',
            subtitleText: 'あなたのチームにもExpensifyを使ってほしいですか？チームに経費精算を1件提出するだけで、あとは私たちにお任せください。',
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
        anotherLoginPageIsOpenExplanation: 'ログインページを別のタブで開いています。そのタブからログインしてください。',
        welcome: 'ようこそ！',
        welcomeWithoutExclamation: 'ようこそ',
        phrase2: 'お金のことは、話せば早い。チャットと支払いがひとつになった今、そのやり取りもかんたんです。',
        phrase3: 'あなたが要点を伝える速さで、支払いもあなたのもとに届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: (login: string) => `${login} さん、ここで新しい顔にお会いできるのはいつでもうれしいです！`,
        welcomeEnterMagicCode: (login: string) => `${login} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
    },
    login: {
        hero: {
            header: '出張と経費精算を、チャットのスピードで',
            body: '次世代のExpensifyへようこそ。ここでは、状況に応じたリアルタイムチャットの助けにより、出張と経費処理がこれまで以上にスピーディーに進みます。',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでのログインを続行:',
        orContinueWithMagicCode: 'マジックコードでサインインすることもできます',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: 'マジックコードを使う',
        launching: '起動中…',
        oneMoment: '会社のシングルサインオンポータルへリダイレクトしますので、少々お待ちください。',
    },
    reportActionCompose: {
        dropToUpload: 'ドロップしてアップロード',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何か書いてください…',
        blockedFromConcierge: '通信は禁止されています',
        fileUploadFailed: 'アップロードに失敗しました。ファイルはサポートされていません。',
        localTime: (user: string, time: string) => `${user} の${time}です`,
        edited: '（編集済み）',
        emoji: '絵文字',
        collapse: '折りたたむ',
        expand: '展開',
        askConciergeToUpdate: '「経費を更新」と入力してみてください…',
        askConciergeToCorrect: '「経費を修正」と入力してみてください…',
        askConciergeForHelp: 'Concierge AI にヘルプを依頼…',
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
            return `この${type}を削除してもよろしいですか？`;
        },
        onlyVisible: '次のユーザーにのみ表示',
        explain: '説明',
        explainMessage: 'これについて説明してください。',
        replyInThread: 'スレッドで返信',
        joinThread: 'スレッドに参加',
        leaveThread: 'スレッドを退出',
        copyOnyxData: 'Onyx データをコピー',
        viewAgentZeroTrace: 'AgentZero トレースを表示',
        flagAsOffensive: '不適切として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクション:',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> のパーティーを見逃しました。ここには何もありません。`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `このチャットは、<strong>${domainRoom}</strong> ドメイン上のすべての Expensify メンバーとのチャットです。同僚との会話や情報共有、質問などに利用してください。`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `このチャットは<strong>${workspaceName}</strong>の管理者とのチャットです。ワークスペースのセットアップなどについて話すためにお使いください。`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `このチャットは<strong>${workspaceName}</strong>内の全員とのものです。最も重要なお知らせに使用してください。`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> に関するあらゆる内容のためのものです。`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `このチャットは、<strong>${invoicePayer}</strong> と <strong>${invoiceReceiver}</strong> 間の請求書用です。請求書を送信するには「+」ボタンを使用してください。`,
        beginningOfChatHistory: (users: string) => `このチャットの相手は${users}です。`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `ここは<strong>${submitterDisplayName}</strong>さんが<strong>${workspaceName}</strong>に経費精算を提出する場所です。+ボタンを押すだけでOKです。`,
        beginningOfChatHistoryPolicyExpenseChatTrack: 'ここは経費を管理する場所です',
        beginningOfChatHistorySelfDM: 'ここはあなたの個人スペースです。メモ、タスク、下書き、リマインダーに活用してください。',
        beginningOfChatHistorySystemDM: 'ようこそ！設定を始めましょう。',
        chatWithAccountManager: 'ここでアカウントマネージャーとチャットする',
        askMeAnything: '何でも聞いてください！',
        sayHello: '挨拶しよう！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: (roomName: string) => `${roomName} へようこそ！`,
        usePlusButton: (additionalText: string) => `+ ボタンを使って経費を${additionalText}します。`,
        askConcierge: 'Concierge は、質問にお答えしたり、経費を更新したり、さまざまなことができます。',
        conciergeSupport: 'あなた専用のAIエージェント',
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
    readOnlyConversation: 'この会話は読み取り専用です。',
    reportAction: {
        asCopilot: '共同操縦者として',
        assistedBy: (agentName: string) => `${agentName}がアシスト`,
        humanSupportAgent: 'サポート担当者',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `選択した頻度で提出できなかった、<a href="${reportUrl}">${reportName}</a> のすべての経費を保持するためにこのレポートを作成しました`,
        createdReportForUnapprovedTransactions: (reportUrl: string, reportName: string, reportID: string, isReportDeleted: boolean) =>
            isReportDeleted
                ? `削除されたレポート #${reportID} に保留されていた経費のためにこのレポートを作成しました`
                : `<a href="${reportUrl}">${reportName}</a> の保留中経費すべてに対してこのレポートを作成しました`,
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話の全員に通知',
    },
    newMessages: '新しいメッセージ',
    latestMessages: '最新メッセージ',
    youHaveBeenBanned: '注意：このチャンネルでのチャットは禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中...',
        multipleMembers: '複数のメンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName} がアカウントを閉鎖したため、このチャットは現在利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `このチャットは、${oldDisplayName} が自分のアカウントを ${displayName} と統合したため、現在はアクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>が${policyName}ワークスペースのメンバーではなくなったため、これ以上利用できません。`
                : `${displayName}さんが${policyName}ワークスペースのメンバーではなくなったため、このチャットはこれ以上利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、これ以上利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、これ以上利用できません。`,
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
        fabScanReceiptExplained: 'レシートをスキャン',
        chatPinned: 'チャットをピン留めしました',
        draftedMessage: '作成中のメッセージ',
        listOfChatMessages: 'チャットメッセージの一覧',
        listOfChats: 'チャット一覧',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
    },
    homePage: {
        forYou: 'あなた向け',
        timeSensitiveSection: {
            title: '時間に敏感',
            addShippingAddress: {title: '配送先住所が必要です', subtitle: 'Expensify カードを受け取る住所を入力してください。', cta: '住所を追加'},
            addPaymentCard: {title: 'Expensify を引き続きご利用いただくには、支払いカードを追加してください', subtitle: 'アカウント ＞ サブスクリプション', cta: '追加'},
            activateCard: {title: 'Expensify カードを有効化する', subtitle: 'カードを認証して支出を始めましょう。', cta: '有効化'},
            reviewCardFraud: {
                title: 'Expensify カードの不正利用の可能性を確認する',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `${merchant} での不正の可能性がある ${amount} を確認`,
                subtitle: 'Expensify カード',
                cta: '確認',
            },
            ctaFix: '修正',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `${feedName} 会社カード接続を修正` : '法人クレジットカードの接続を修正'),
                defaultSubtitle: 'ワークスペース',
                subtitle: ({policyName}: {policyName: string}) => `${policyName} > 会社カード`,
            },
            fixPolicyConnection: {
                title: ({integrationName}: {integrationName: string}) => `${integrationName} 接続を修正`,
                defaultSubtitle: 'ワークスペース',
                subtitle: ({policyName}: {policyName: string}) => `${policyName} > 会計`,
            },
            fixPersonalCardConnection: {title: ({cardName}: {cardName?: string}) => (cardName ? `${cardName}個人カードの接続を修正` : '個人カードの連携を修正'), subtitle: 'ウォレット'},
            validateAccount: {title: 'アカウントを認証してください', subtitle: 'アカウント', cta: '検証する'},
            fixFailedBilling: {title: '登録されているカードから請求できませんでした', subtitle: 'サブスクリプション'},
            unlockBankAccount: {
                workspaceTitle: 'ビジネス用銀行口座がロックされました',
                personalTitle: 'あなたの銀行口座はロックされています',
                workspaceSubtitle: ({policyName}: {policyName: string}) => policyName,
                personalSubtitle: 'ウォレット',
            },
            addVirtualCardPersonalDetails: {title: '個人情報を追加してください', subtitle: 'Expensify カードを表示して使い始めるには、詳細情報を入力してください。', cta: '詳細を追加'},
            enterSignerInfo: {title: '署名者情報が必要です', subtitle: ({bankAccountLastFour}: {bankAccountLastFour: string}) => `銀行口座 ${bankAccountLastFour}`},
        },
        announcements: 'お知らせ',
        discoverSection: {
            title: '発見',
            menuItemTitleNonAdmin: '経費の作成方法とレポートの提出方法を学びましょう。',
            menuItemTitleAdmin: 'メンバーの招待方法、承認ワークフローの編集方法、会社カードの照合方法を確認しましょう。',
            menuItemDescription: 'Expensify でできることを 2 分で確認',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `${count} ${count === 1 ? 'レポート' : 'レポート'} を送信`,
            approve: ({count}: {count: number}) => `${count} 件の ${count === 1 ? 'レポート' : 'レポート'} を承認`,
            pay: ({count}: {count: number}) => `${count} ${count === 1 ? 'レポート' : 'レポート'} を支払う`,
            export: ({count}: {count: number}) => `${count} 件の ${count === 1 ? 'レポート' : 'レポート'} をエクスポート`,
            begin: '開始',
            emptyStateMessages: {
                thumbsUpStarsTitle: '完了しました！',
                thumbsUpStarsDescription: 'この調子です！新しいタスクをお楽しみに。',
                smallRocketTitle: 'すべて確認済みです',
                smallRocketDescription: '今後の To-do がここに表示されます。',
                cowboyHatTitle: '完了しました！',
                cowboyHatDescription: 'すべてのタスクが片付きました。次のタスクにご注目ください。',
                trophy1Title: '表示するものがありません',
                trophy1Description: 'やりました！次の To-do にご注目ください。',
                palmTreeTitle: 'すべて確認済みです',
                palmTreeDescription: 'ひと息つく時間ですが、今後のタスクをお楽しみに。',
                fishbowlBlueTitle: '完了しました！',
                fishbowlBlueDescription: '今後のタスクがここに表示されます。',
                targetTitle: 'すべて確認済みです',
                targetDescription: '目標どおりですね。次のタスクをまた確認してください！',
                chairTitle: '表示するものがありません',
                chairDescription: 'ゆっくりおくつろぎください。今後のやることリストはこちらに表示します。',
                broomTitle: '完了しました！',
                broomDescription: 'タスクは順調です。新しい To-do をお楽しみに。',
                houseTitle: 'すべて確認済みです',
                houseDescription: 'ここが今後のやることのホームベースです。',
                conciergeBotTitle: '表示するものがありません',
                conciergeBotDescription: 'ピッピッ、ブッブッ。次のタスクをまた確認してください！',
                checkboxTextTitle: 'すべて確認済みです',
                checkboxTextDescription: 'ここで今後のやることにチェックを付けましょう。',
                flashTitle: '完了しました！',
                flashDescription: '今後のタスクをここでサッと表示します。',
                sunglassesTitle: '表示するものがありません',
                sunglassesDescription: 'ひと休みするときですが、次の予定をお楽しみに！',
                f1FlagsTitle: 'すべて確認済みです',
                f1FlagsDescription: 'すべての未処理の To-do が完了しました。',
            },
            reviewExpenses: ({count}: {count: number}) => `${count} 件の${count === 1 ? '経費' : '経費'}を確認`,
        },
        upcomingTravel: '今後の出張',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `${destination} 行きのフライト`,
            trainTo: ({destination}: {destination: string}) => `${destination} 行きの電車`,
            hotelIn: ({destination}: {destination: string}) => `${destination}のホテル`,
            carRentalIn: ({destination}: {destination: string}) => `${destination}でのレンタカー`,
            inOneWeek: '1週間後',
            inDays: () => ({one: '1日後', other: (count: number) => `${count}日後`}),
            today: '今日',
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `無料トライアル：あと ${days} ${days === 1 ? '日' : '日数'} 日！`,
            offer50Body: '初年度が50％オフになります',
            offer25Body: '初年度が25％オフになります',
            addCardBody: '支払いカードを追加',
            ctaClaim: '申請',
            ctaAdd: 'カードを追加',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `残り時間：${formattedTime}`,
            timeRemainingDays: () => ({
                one: '残り時間：1日',
                other: (pluralCount: number) => `残り時間：${pluralCount}日`,
            }),
        },
        gettingStartedSection: {
            title: 'はじめに',
            createWorkspace: 'ワークスペースを作成',
            connectAccounting: ({integrationName}: {integrationName: string}) => `${integrationName}に接続する`,
            connectAccountingDefault: '会計ソフトに接続',
            customizeCategories: '会計カテゴリをカスタマイズする',
            linkCompanyCards: '会社カードを連携',
            issueExpensifyCards: 'Expensifyカードを発行',
            issueExpensifyCardsSubtitle: 'コントロールをカスタマイズして支出を効率化',
            setupRules: '支出ルールを設定',
            inviteAccountant: '会計士を招待',
        },
        yourSpend: {
            title: 'あなたの支出',
            awaitingApproval: '承認待ち',
            repaidLast30Days: '過去30日間に返済済み',
            recentTransactions: ({lastFour}: {lastFour: string}) => `最近の取引 • ${lastFour}`,
        },
        seeMore: ({count}: {count: number}) => `さらに${count}件表示`,
        recentlyAddedSection: {
            title: '最近追加されたもの',
            viewAll: 'すべての経費を表示',
            emptyStateTitle: '最近の経費はありません',
            emptyStateMessage: '新規作成するか、レシートをここにドラッグしてください',
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
        dragAndDrop: '<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。サポートされているファイル形式の詳しい説明は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされているファイル形式の詳細は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        fileContainsHeader: 'ファイルに列見出しが含まれています',
        column: (name: string) => `列${name}`,
        fieldNotMapped: (fieldName: string) => `おっと！必須フィールド（「${fieldName}」）がマッピングされていません。確認してもう一度お試しください。`,
        singleFieldMultipleColumns: (fieldName: string) => `おっと！1 つのフィールド（「${fieldName}」）を複数の列に割り当てています。確認してもう一度お試しください。`,
        emptyMappedField: (fieldName: string) => `おっと！フィールド（「${fieldName}」）に1つ以上の空の値が含まれています。確認してもう一度お試しください。`,
        importSuccessfulTitle: 'インポートに成功しました',
        importCategoriesSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'カテゴリーは追加も更新もされていません。';
            }
            if (added && updated) {
                return `${added}件のカテゴリーを追加し、${updated}件のカテゴリーを更新しました。`;
            }
            if (added) {
                return added === 1 ? 'カテゴリーを1件追加しました。' : `${added}件のカテゴリーを追加しました。`;
            }
            return updated === 1 ? 'カテゴリーを1件更新しました。' : `${updated}件のカテゴリーを更新しました。`;
        },
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} 件の取引が追加されました。` : '1 件の取引が追加されました。',
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'メンバーは追加も更新もされていません。';
            }
            if (added && updated) {
                return `${added}件のメンバー${added > 1 ? 's' : ''}を追加し、${updated}件のメンバー${updated > 1 ? 's' : ''}を更新しました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated} 人のメンバーを更新しました。` : '1 名のメンバーが更新されました。';
            }
            return added > 1 ? `${added}人のメンバーが追加されました。` : 'メンバーが1人追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} 個のタグを追加しました。` : 'タグを1件追加しました。'),
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates}件の日当レートが追加されました。` : '1件の日当レートが追加されました。'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} 件の取引がインポートされました。` : '1件の取引がインポートされました。',
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべての項目が正しく入力されていることを確認して、もう一度お試しください。問題が解決しない場合は、Concierge までご連絡ください。',
        importDescription: '下のインポートされた各列の横にあるドロップダウンをクリックして、スプレッドシートのどのフィールドを対応付けるか選択してください。',
        sizeNotMet: 'ファイルサイズは0バイトより大きくする必要があります',
        invalidFileMessage:
            'アップロードしたファイルは空であるか、無効なデータが含まれています。再度アップロードする前に、ファイルの形式が正しく、必要な情報が含まれていることを確認してください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSV をダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードの一部として追加される新しいワークスペースメンバーの詳細を、以下で確認してください。既存のメンバーにはロールの更新や招待メッセージは送信されません。`,
            other: (count: number) =>
                `このアップロードで追加される${count}人の新しいワークスペースメンバーについて、以下の内容を確認してください。既存のメンバーには、ロールの更新や招待メッセージは送信されません。`,
        }),
        importCompanyCardTransactionsPendingMessage: '新しいカードや取引が表示されるまでに少し時間がかかる場合があります。しばらくお待ちください。',
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `またはここにドラッグ＆ドロップしてください`,
        desktopSubtitleMultiple: `またはここにドラッグ＆ドロップしてください`,
        alternativeMethodsTitle: '領収書を追加するその他の方法：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>して携帯電話からスキャン</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を <a href="mailto:${email}">${email}</a> に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">電話番号を追加</a>して、${phoneNumber} に領収書をテキスト送信しましょう</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>${phoneNumber} にレシートをテキスト送信（米国の電話番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: '領収書の写真を撮影するには、カメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセスがまだ許可されていません。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">こちらの手順</a>に従ってください。`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真の撮影中にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        allowLocationFromSetting: `位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。デバイスの権限設定から位置情報アクセスを許可してください。`,
        dropTitle: '手放して',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'この領収書を削除してもよろしいですか？',
        addReceipt: '領収書を追加',
        addAdditionalReceipt: 'レシートを追加',
        scanFailed: 'このレシートは、店舗名、日付、または金額が不足しているためスキャンできませんでした。',
        crop: 'トリミング',
        addAReceipt: {
            phrase1: '領収書を追加',
            phrase2: 'または、ここにファイルをドラッグ＆ドロップしてください',
        },
    },
    quickAction: {
        scanReceipt: 'レシートをスキャン',
        recordDistance: '距離を記録',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: '領収書を分割',
        splitDistance: '距離を分割',
        paySomeone: (name?: string) => `${name ?? '誰か'} を支払う`,
        assignTask: 'タスクを割り当てる',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイック操作の宛先にはアクセスできなくなりました。下から新しい宛先を選択してください。',
        updateDestination: '送信先を更新',
        createReport: 'レポートを作成',
        createTimeExpense: '時間経費を作成',
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
        purchase: '購入',
        split: '分割',
        splitExpense: '経費を分割',
        splitDates: '日付を分割',
        splitDateRange: (startDate: string, endDate: string, count: number) => `${startDate} から ${endDate}（${count} 日間）`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `${merchant}からの${amount}`,
        splitByPercentage: 'パーセンテージで分割',
        splitByDate: '日付ごとに分割',
        addSplit: '分割を追加',
        makeSplitsEven: '分割を均等にする',
        editSplits: '按分割を編集',
        totalAmountGreaterThanOriginal: (amount: string) => `合計金額が元の経費よりも${amount}多くなっています。`,
        totalAmountLessThanOriginal: (amount: string) => `合計金額は元の経費より${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには少なくとも 1 件追加してください。',
        splitExpenseEditTitle: (amount: string, merchant: string) => `${merchant} の ${amount} を編集`,
        removeSplit: '分割を削除',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払済みの経費は編集できません',
        paySomeone: (name?: string) => `${name ?? '誰か'} を支払う`,
        splitExpenseDistanceErrorModalDescription: '距離レートのエラーを修正して、もう一度お試しください。',
        splitExpensePerDiemRateErrorModalDescription: '日当額のエラーを修正して、もう一度お試しください。',
        expense: '経費',
        categorize: 'カテゴリー分け',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '距離を記録',
        createExpenses: (expensesNumber: number) => `${expensesNumber}件の経費を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'この領収書を削除してもよろしいですか？この操作は元に戻せません。',
        addExpense: '経費を追加',
        chooseRecipient: '送金先を選択',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount} の経費を作成`,
        confirmDetails: '詳細を確認',
        pay: '支払う',
        cancelPayment: '支払いをキャンセル',
        cancelPaymentConfirmation: 'この支払いをキャンセルしてもよろしいですか？',
        viewDetails: '詳細を表示',
        pending: '保留中',
        canceled: 'キャンセル済み',
        posted: '投稿日',
        deleteReceipt: '領収書を削除',
        findExpense: '経費を検索',
        deletedTransaction: (amount: string, merchant: string) => `経費を削除しました（${merchant} に ${amount}）`,
        movedFromReport: (reportName: string) => `${reportName} から経費を移動しました`,
        movedFromReportNoName: '経費を移動しました',
        movedTransactionTo: (reportUrl: string, reportName: string) => `この経費を<a href="${reportUrl}">${reportName}</a>に移動しました`,
        movedTransactionToAnotherReport: 'この経費を別のレポートに移動しました',
        movedTransactionFrom: (reportUrl: string, reportName: string) => `この経費を<a href="${reportUrl}">${reportName}</a>から移動しました`,
        movedTransactionFromAnotherReport: 'この経費を別のレポートから移動しました',
        unreportedTransaction: (reportUrl: string) => `この経費をあなたの<a href="${reportUrl}">個人スペース</a>に移動しました`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `このレポートを<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
            }
            return `この<a href="${movedReportUrl}">レポート</a>を<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: '領収書はカード取引との照合待ちです',
        pendingMatch: '保留中の照合',
        pendingMatchWithCreditCardDescription: 'レシートはカード取引との照合待ちです。現金としてマークしてキャンセルします。',
        markAsCash: '現金としてマーク',
        pendingMatchSubmitTitle: 'レポートを提出',
        pendingMatchSubmitDescription: '一部の経費がクレジットカード取引との照合待ちです。現金としてマークしますか？',
        routePending: 'ルート保留中…',
        automaticallyEnterExpenseDetails: 'Concierge が詳細を入力します。',
        receiptScanning: () => ({
            one: 'レシートをスキャンしています…',
            other: 'レシートをスキャンしています…',
        }),
        scanMultipleReceipts: '複数のレシートをスキャン',
        scanMultipleReceiptsDescription: 'すべてのレシートを一度に撮影し、内容を自分で確認するか、私たちにお任せください。',
        receiptScanInProgress: 'レシートのスキャンを実行中',
        receiptScanInProgressDescription: 'レシートのスキャンを実行中です。後で確認するか、今すぐ詳細を入力してください。',
        removeFromReport: 'レポートから削除',
        moveToPersonalSpace: '経費を自分のパーソナルスペースに移動',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? '重複の可能性がある経費が見つかりました。重複を確認してから送信してください。'
                : '重複の可能性がある経費が検出されました。承認を有効にするには重複を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '問題が見つかりました',
        }),
        fieldPending: '保留中…',
        defaultRate: 'デフォルトレート',
        receiptMissingDetails: '領収書に詳細が不足しています',
        missingAmount: '金額が未入力',
        missingMerchant: '加盟店が見つかりません',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のレシートは、あなただけが見ることができます。後でまた確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。詳細を手入力してください。',
        allTransactionsPendingNextStep: 'すべての取引が保留中です。数日後に処理が完了するまで、このレポートを提出することはできません。',
        companyInfo: '会社情報',
        companyInfoDescription: '最初の請求書を送信する前に、いくつか追加の情報が必要です。',
        yourCompanyName: '会社名',
        yourCompanyWebsite: '自社のウェブサイト',
        yourCompanyWebsiteNote: 'ウェブサイトがない場合は、代わりに自社のLinkedInまたはソーシャルメディアのプロフィールを入力できます。',
        invalidDomainError: '無効なドメインが入力されています。続行するには、有効なドメインを入力してください。',
        publicDomainError: '公開ドメインが入力されています。続行するには、プライベートドメインを入力してください。',
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
        deleteReport: () => ({
            one: 'レポートを削除',
            other: 'レポートを削除',
        }),
        deleteReportConfirmation: () => ({
            one: 'このレポートを削除してもよろしいですか？',
            other: 'これらのレポートを削除してもよろしいですか？',
        }),
        settledExpensify: '支払い済み',
        paidStatusMarkedAsPaid: '支払済みに設定しました',
        paidStatusWithdrawing: '出金中',
        paidStatusConfirmed: '確認済み',
        done: '完了',
        settledElsewhere: '他で支払い済み',
        individual: '個人',
        business: 'ビジネス',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `個人として${formattedAmount}を支払う` : `個人アカウントで支払う`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `ウォレットで ${formattedAmount} を支払う` : `ウォレットで支払う`),
        settlePayment: (formattedAmount: string) => `${formattedAmount} を支払う`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} をビジネスとして支払う` : `ビジネスアカウントで支払う`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} を支払済みにする` : `支払い済みにする`),
        confirmPaymentReceivedModalTitle: '支払いを受領したことを確認',
        receivedPayment: '支払い受領済み',
        receivedPaymentReportAction: (payer?: string) => `${payer ? `${payer} ` : ''}支払いを受け取りました`,
        receivedPaymentConfirmation: 'Expensify以外で支払いを受け取っている場合のみ続行してください。',
        confirmReceivedPayment: 'はい、支払いを受け取りました。',
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `個人アカウント（下4桁 ${last4Digits}）で ${amount} を支払いました` : `個人アカウントで支払い済み`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `ビジネス口座（末尾${last4Digits}）で${amount}を支払いました` : `ビジネスアカウントで支払済み`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `${policyName}で${formattedAmount}を支払う` : `${policyName}で支払う`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `銀行口座（末尾${last4Digits}）で${amount}を支払いました` : `銀行口座（下4桁 ${last4Digits}）で支払い済み`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>に従い、銀行口座（下4桁 ${last4Digits}）で${amount ? `${amount} ` : ''}を支払いました`,
        invoicePersonalBank: (lastFour: string) => `個人アカウント・${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `ビジネスアカウント・${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: (amount: string) => `${amount} の請求書を送信`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `${comment}用` : ''}`,
        submitted: (memo?: string) => `送信済み${memo ? `、メモ: ${memo}` : ''}`,
        markedAsDone: (memo) => `完了としてマークしました${memo ? `（メモ：${memo}）` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出の延期</a> 経由で提出されました`,
        queuedToSubmitViaDEW: 'カスタム承認ワークフローで提出待ち',
        queuedToApproveViaDEW: 'カスタム承認ワークフローで承認待ちに設定されました',
        trackedAmount: (formattedAmount: string, comment?: string) => `追跡中 ${formattedAmount}${comment ? `${comment}用` : ''}`,
        splitAmount: (amount: string) => `${amount} を分割`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `${comment}用` : ''} を分割`,
        yourSplit: (amount: string) => `あなたの分担額 ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} は ${amount}${comment ? `${comment}用` : ''} を支払う必要があります`,
        payerOwes: (payer: string) => `${payer} の負担額：`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: (payer: string) => `${payer} が支払いました：`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} が ${amount} を支出しました`,
        payerSpent: (payer: string) => `${payer} の支出額：`,
        managerApproved: (manager: string) => `${manager} が承認しました:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `${manager} が ${amount} を承認しました`,
        payerSettled: (amount: number | string) => `${amount} を支払いました`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount}を支払いました。支払いを受け取るには銀行口座を追加してください。`,
        automaticallyApproved: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>により承認済み`,
        approvedAmount: (amount: number | string) => `${amount} を承認しました`,
        approvedMessage: `承認済み`,
        unapproved: `未承認`,
        automaticallyForwarded: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>により承認済み`,
        forwarded: (memo?: string) => `承認済み${memo ? `、メモ: ${memo}` : ''}`,
        rejectedThisReport: '却下しました',
        waitingOnBankAccount: (submitterDisplayName: string) => `支払いを開始しましたが、${submitterDisplayName}が銀行口座を追加するのを待っています。`,
        adminCanceledRequest: '支払いをキャンセルしました',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `${submitterDisplayName} が30日以内に Expensify Wallet を有効化しなかったため、${amount} の支払いをキャンセルしました`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) => `${submitterDisplayName} が銀行口座を追加しました。${amount} の支払いが行われました。`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}支払い済みにしました${comment ? `、「${comment}」と言っています` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}ウォレットで支払い済み`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}は<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>経由でExpensifyにより支払われました`,
        reimbursedThisReport: 'このレポートを精算しました',
        paidThisBill: 'この請求書を支払いました',
        reimbursedOnBehalfOf: (actor: string) => `${actor}に代わって`,
        reimbursedFromBankAccount: (debitBankAccount: string) => `末尾が ${debitBankAccount} の銀行口座から`,
        reimbursedSubmitterAddedBankAccount: (submitter: string) => `${submitter} さんが銀行口座を追加し、レポートの保留を解除しました。払い戻しを開始しました。`,
        reimbursedWithFastACH: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            expectedDate,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            expectedDate: string;
        }) =>
            isCurrentUser
                ? `. ${creditBankAccount ? `預金口座（末尾番号 ${creditBankAccount}）` : 'アカウント'} にお金を送金中です。払い戻しは ${expectedDate} に完了する見込みです。`
                : `. ${submitterLogin} さんへの${creditBankAccount ? `預金口座（末尾番号 ${creditBankAccount}）` : 'アカウント'}への送金中です。払い戻しの完了予定日は ${expectedDate} です。`,
        reimbursedWithCheck: '小切手で',
        reimbursedWithStripeConnect: ({
            isCurrentUser,
            submitterLogin,
            creditBankAccount,
            isCard,
        }: {
            isCurrentUser: boolean;
            submitterLogin: string;
            creditBankAccount: string;
            isCard: boolean;
        }) => {
            const paymentMethod = isCard ? 'カード' : '銀行口座';
            return isCurrentUser
                ? `. ${paymentMethod}で支払われた資金が、お客様の${creditBankAccount ? `預金口座（末尾番号 ${creditBankAccount}）` : 'アカウント'}に向けて送金中です。最大で10営業日かかる場合があります。`
                : `. ${submitterLogin} さんの ${creditBankAccount ? `預金口座（末尾番号 ${creditBankAccount}）` : 'アカウント'} へ送金中です（${paymentMethod} で支払われます）。最大 10 営業日かかる場合があります。`;
        },
        reimbursedWithACH: ({creditBankAccount, expectedDate}: {creditBankAccount?: string; expectedDate?: string}) =>
            `直接入金（ACH）で${creditBankAccount ? `${creditBankAccount}で終わる銀行口座へ。` : '. '}${expectedDate ? `払戻しは${expectedDate}までに完了する見込みです。` : '通常、営業日で4～5日かかります。'}`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます',
        changedTheExpense: '経費を変更しました',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `${translatedChangedField} を ${newMerchant} に設定し、その結果金額が ${newAmountToDisplay} に設定されました`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `${valueName}（以前は${oldValueToDisplay}）`,
        updatedTheRequest: (valueName: string, newValueToDisplay: string, oldValueToDisplay: string) => `${valueName} を ${newValueToDisplay} に（以前は ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, oldMerchant: string, newAmountToDisplay: string, oldAmountToDisplay: string) =>
            `${translatedChangedField} を ${newMerchant}（以前は ${oldMerchant}）に変更したため、金額が ${newAmountToDisplay}（以前は ${oldAmountToDisplay}）に更新されました`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースルール</a>に基づく` : 'ワークスペースのルールに基づく'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `${comment} 用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} を送信済み${comment ? `${comment}用` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `経費を個人スペースから${workspaceName ?? `${reportName}とチャット`}に移動しました`,
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        error: {
            invalidCategoryLength: 'カテゴリー名が255文字を超えています。短くするか、別のカテゴリーを選択してください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選択してください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidReadings: '続行する前に開始値と終了値の両方を入力してください',
            negativeDistanceNotAllowed: '終了値は開始値より大きくなければなりません',
            distanceAmountTooLarge: '合計金額が大きすぎます。距離を減らすか、レートを下げてください。',
            distanceAmountTooLargeReduceDistance: '合計金額が大きすぎます。距離を減らしてください。',
            distanceAmountTooLargeReduceRate: '合計金額が大きすぎます。レートを下げてください。',
            odometerReadingTooLarge: (formattedMax: string) => `オドメーターの読み取り値は${formattedMax}を超えることはできません。`,
            invalidIntegerAmount: '続行する前にドルの整数金額を入力してください',
            invalidTaxAmount: (amount: string) => `最大税額は${amount}です`,
            invalidSplit: '分割した金額の合計は合計金額と一致している必要があります',
            invalidSplitParticipants: '少なくとも2人の参加者に対して、0より大きい金額を入力してください',
            invalidSplitYourself: '分割する金額は 0 以外の数値を入力してください',
            noParticipantSelected: '参加者を選択してください',
            other: '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
            genericCreateFailureMessage: 'この経費の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留解除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptDeleteFailureError: 'このレシートの削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage:
                '<rbr>領収書のアップロード中にエラーが発生しました。後で再度お試しいただくために、<a href="download">領収書を保存</a>してから、時間をおいて<a href="retry">もう一度お試しください</a>。</rbr>',
            receiptFailureMessageShort: 'レシートのアップロード中にエラーが発生しました。',
            receiptUploadFailedMessage: 'レシートのアップロードに失敗しました。レシートを保存するか、経費を削除して失うかを選択してください。',
            saveReceipt: '領収書を保存',
            genericDeleteFailureMessage: 'この経費の削除中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: '取引に未入力の項目があります',
            duplicateWaypointsErrorMessage: '重複した経由地を削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも2つの異なる住所を入力してください',
            splitExpenseMultipleParticipantsErrorMessage: '経費はワークスペースと他のメンバー間で分割できません。選択内容を更新してください。',
            invalidMerchant: '有効な加盟店名を入力してください',
            atLeastOneAttendee: '少なくとも 1 人の出席者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量は0より大きくなければなりません',
            invalidSubrateLength: '少なくとも 1 つのサブレートが必要です',
            invalidRate: 'このワークスペースでは無効なレートです。ワークスペースで利用可能なレートを選択してください。',
            endDateBeforeStartDate: '終了日は開始日より前にはできません',
            endDateSameAsStartDate: '終了日は開始日と同じにはできません',
            manySplitsProvided: `分割できる最大数は${CONST.IOU.SPLITS_LIMIT}件です。`,
            dateRangeExceedsMaxDays: `日付範囲は${CONST.IOU.SPLITS_LIMIT}日を超えることはできません。`,
            unableToSubmitReport: 'レポートを送信できません',
            allTransactionsPendingDescription: 'すべての取引が保留中のため、このレポートは提出できません。反映されるまでに数日かかる場合があります。',
            stitchOdometerImagesFailed: '走行距離計の画像を結合できませんでした。後でもう一度お試しください。',
            failedToSaveOdometerDraft: 'オドメーターの下書きを保存できませんでした。もう一度お試しください。',
        },
        dismissReceiptError: 'エラーを閉じる',
        dismissReceiptErrorConfirmation: 'ご注意ください！このエラーを閉じると、アップロード済みのレシートが完全に削除されます。本当に続行しますか？',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `清算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留されます。`,
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
        addExistingExpense: '既存の経費を追加',
        selectExistingExpense: 'レポートに追加する経費を少なくとも1件選択してください。',
        emptyStateExistingExpenseTitle: '既存の経費はありません',
        emptyStateExistingExpenseSubtitle: '既存の経費がありません。下から新しく作成してみてください。',
        addExistingExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留している理由を説明してください。',
            other: 'これらの経費を保留している理由を説明してください。',
        }),
        explainHoldApprover: () => ({
            one: 'この経費を承認する前に必要なことを説明してください。',
            other: 'これらの経費を承認する前に必要なことを説明してください。',
        }),
        retracted: '取り消し済み',
        retract: '撤回',
        reopened: '再開しました',
        reopenReport: 'レポートを再開',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}にエクスポートされています。変更するとデータの不整合が生じる可能性があります。このレポートを再度開いてもよろしいですか？`,
        reason: '理由',
        holdReasonRequired: '保留する場合は理由が必須です。',
        expenseWasPutOnHold: '経費は保留されました',
        expenseOnHold: 'この経費は保留されています。今後の手順についてコメントを確認してください。',
        expensesOnHold: 'すべての経費が保留になっています。次のステップについてはコメントを確認してください。',
        expenseDuplicate: 'この経費は別の経費と詳細がよく似ています。続行するには重複しているものを確認してください。',
        someDuplicatesArePaid: 'これらの重複の一部は、すでに承認または支払い済みです。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて保持',
        keepSelected: '選択したものを保持',
        noDuplicatesTitle: '準備完了！',
        noDuplicatesDescription: '確認が必要な重複取引はありません。',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認します。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払金額を確認',
        confirmPayAmount: '保留されていない金額のみ支払うか、レポート全額を支払ってください。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費を保留しますか？',
        whatIsHoldExplain: '保留は、提出の準備ができるまで経費を「一時停止」しておくようなものです。',
        holdIsLeftBehind: '保留中の経費は、レポート全体を提出してもそのまま残ります。',
        unholdWhenReady: '提出の準備ができたら、経費の保留を解除してください。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースに移動すると変更されやすい、次の項目を再確認してください。',
            reCategorize: 'ワークスペースのルールに従うよう、<strong>経費のカテゴリを修正</strong>してください。',
            workflows: 'このレポートには、現在は別の<strong>承認ワークフロー</strong>が適用されている可能性があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: '設定',
        changed: '変更済み',
        removed: '削除済み',
        transactionPending: '取引は保留中です。',
        chooseARate: 'ワークスペースの払い戻しレートをマイルまたはキロメートルごとに選択してください',
        rateValidDateRange: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate}から${endDate}まで有効`,
        rateValidFrom: ({startDate}: {startDate: string}) => `${startDate}から有効`,
        rateValidUntil: ({endDate}: {endDate: string}) => `${endDate}まで有効`,
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: 'ご注意ください！',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `このレポートはすでに ${accountingIntegration} にエクスポートされています。変更するとデータの不整合が発生する可能性があります。本当にこのレポートの承認を取り消しますか？`,
        reimbursable: '経費精算対象',
        nonReimbursable: '精算対象外',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約は、まだ支払いが行われていないため保留中です。',
        bookingArchived: 'この予約はアーカイブされています',
        bookingArchivedDescription: 'この予約は旅行日が過ぎたためアーカイブされています。必要に応じて、最終金額の経費を追加してください。',
        attendees: '参加者',
        totalPerAttendee: '参加者ごと',
        whoIsYourAccountant: 'あなたの会計士は誰ですか？',
        paymentComplete: '支払いが完了しました',
        time: '時間',
        startDate: '開始日',
        endDate: '終了日',
        startTime: '開始時間',
        endTime: '終了時刻',
        deleteSubrate: '副単価を削除',
        deleteSubrateConfirmation: 'このサブレートを削除してもよろしいですか？',
        quantity: '数量',
        subrateSelection: '副料金レートを選択して、数量を入力してください。',
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
            one: `出張: 1日間`,
            other: (count: number) => `出張期間：${count} 日間`,
        }),
        dates: '日付',
        rates: '料金',
        submitsTo: (name: string) => `${name} に提出`,
        reject: {
            educationalTitle: '保留しますか、それとも却下しますか？',
            educationalText: '経費を承認または支払う準備ができていない場合は、保留にするか却下できます。',
            holdExpenseTitle: '承認や支払いの前に、詳細を確認するために経費を保留にします。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたまま、他の経費を承認します。',
            heldExpenseLeftBehindTitle: '保留中の経費は、レポート全体を承認してもそのまま残ります。',
            rejectExpenseTitle: '承認や支払いを行う予定のない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を承認しない理由を説明してください。',
            rejectReason: '却下理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費は却下されました。問題を修正して解決済みにすると、再提出できるようになります。',
            reportActions: {
                rejectedExpense: 'この経費を却下しました',
                markedAsResolved: '却下理由を解決済みにしました',
            },
        },
        rejectReport: {
            title: 'レポートを却下',
            description: 'このレポートを承認しない理由を説明してください:',
            rejectReason: '却理由',
            selectTarget: 'このレポートを差し戻して再確認してもらうメンバーを選択してください：',
            lastApprover: '最終承認者',
            submitter: '申請者',
            rejectedReportMessage: 'このレポートは却下されました。',
            rejectedNextStep: 'このレポートは却下されました。問題を修正し、手動で再提出していただくのをお待ちしています。',
            selectMemberError: 'このレポートを差し戻すメンバーを選択してください。',
            couldNotReject: 'レポートを拒否できませんでした。もう一度お試しください。',
        },
        moveExpenses: 'レポートに移動',
        moveExpensesError: '日当経費は、ワークスペースごとに日当レートが異なる場合があるため、他のワークスペースのレポートに移動することはできません。',
        submitReportTo: {
            sendExpense: '経費を誰にでも送信できます',
            sendExpenseSubtitle: 'メールアドレスまたは電話番号を使って、誰でも Expensify に招待できます。',
        },
        changeApprover: {
            title: '承認者を変更',
            header: (workflowSettingLink: string) =>
                `このレポートの承認者を変更する方法を選択してください。（すべてのレポートで恒久的に変更するには、<a href="${workflowSettingLink}">ワークスペース設定</a>を更新してください。）`,
            changedApproverMessage: (managerID: number) => `承認者を <mention-user accountID="${managerID}"/> に変更しました`,
            reassignedApproverMessage: (managerID: number) => `ワークフローの更新により承認者を <mention-user accountID="${managerID}"/> に再割り当てしました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに追加の承認者を追加します。',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '自分を最終承認者として割り当て、残りの承認者をすべてスキップする。',
            },
            addApprover: {
                subtitle: '残りの承認ワークフローへ回付する前に、このレポートの追加承認者を選択してください。',
                bulkSubtitle: '残りの承認ワークフローに回す前に、これらのレポートの追加承認者を選択してください。',
            },
            bulkSubtitle: 'これらのレポートの承認者を変更する方法を選択してください。',
        },
        chooseWorkspace: 'ワークスペースを選択',
        routedDueToDEW: (to: string, reason?: string) => `レポートは ${to}${reason ? ` ${reason} のため` : ''} に回覧されました`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? '時間' : '時間'} @ ${rate} / 時間`,
            hrs: '時間',
            hours: '時間',
            ratePreview: (rate: string) => `${rate} / 時間`,
            amountTooLargeError: '合計金額が大きすぎます。時間を減らすか、レートを下げてください。',
        },
        correctRateError: 'レートのエラーを修正して、もう一度お試しください。',
        AskToExplain: `・<a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">説明<sparkles-icon/></a>`,
        conciergeAutoMatchedVendor: ({vendorName}: {vendorName: string}) => `Concierge がこの経費を <strong>${vendorName}</strong> に一致させました`,
        duplicateNonDefaultWorkspacePerDiemError: 'ワークスペースごとに日当レートが異なる場合があるため、日当経費をワークスペース間で複製することはできません。',
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? '経費を「精算対象」に指定しました' : '経費を「精算対象外」にマークしました'),
            billable: (value: boolean) => (value ? '経費を「請求可能」に設定しました' : '経費を「請求不可」としてマークしました'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `税率を「${value}」に設定する` : `税率を「${value}」に`),
            reportName: (value: string) => `この経費をレポート「${value}」に移動しました`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `${field} を「${value}」に設定する` : `${field} から「${value}」へ`;
            },
            formatPersonalRules: (fragments: string, route: string) => `${fragments} (<a href="${route}">個人経費ルール</a> 経由)`,
            formatPolicyRules: (fragments: string, route: string) => `${fragments} (<a href="${route}">ワークスペースルール</a> 経由)`,
        },
        failedToAutoSubmitViaDEW: (reason: string) => `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出を遅らせる</a>を使ったレポートの送信に失敗しました。${reason}`,
        failedToSubmitViaDEW: (reason: string) => `レポートの送信に失敗しました。${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認に失敗しました。${reason}`,
        failedToApproveViaDEW: (reason: string) => `承認に失敗しました。${reason}`,
        cannotDuplicateDistanceExpense: '距離精算はワークスペースごとにレートが異なる可能性があるため、ワークスペース間で複製することはできません。',
        taxDisabledAlert: {
            title: '税が無効です',
            prompt: '経費の詳細を編集したり、この経費から税金を削除したりするには、ワークスペースで税金の追跡を有効にしてください。',
            confirmText: '税を削除',
        },
        bulkDuplicateLimit: `一度に複製できる経費は最大で ${CONST.SEARCH.BULK_DUPLICATE_LIMIT} 件です。経費の数を減らして、もう一度お試しください。`,
        deleted: '削除済み',
        categoryDisabledAlert: {
            title: 'カテゴリは無効です',
            prompt: 'ワークスペースでカテゴリを有効にすると、この経費の詳細を編集したり、この経費からカテゴリを削除したりできます。',
            confirmText: 'カテゴリを削除',
        },
        tagDisabledAlert: {
            title: 'タグは無効です',
            prompt: 'ワークスペースでタグを有効にすると、この経費の詳細を編集したり、この経費からタグを削除したりできます。',
            confirmText: 'タグを削除',
        },
    },
    transactionMerge: {
        listPage: {
            header: '経費を統合',
            noEligibleExpenseFound: '該当する経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費と統合できる経費はありません。対象となる経費の詳細は、<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">こちら</a>をご覧ください。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `<strong>${reportName}</strong>と統合する<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">統合対象の経費</a>を選択してください。`,
        },
        receiptPage: {
            header: 'レシートを選択',
            pageTitle: '保持したいレシートを選択してください:',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保持したい詳細を選択してください:',
            noDifferences: '取引間に差異は見つかりませんでした',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'ある' : 'a';
                return `${article} の${field}を選択してください`;
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
        label: '新しいメッセージについて通知する',
        notificationPreferences: {
            always: '今すぐ',
            daily: '毎日',
            mute: 'ミュート',
            hidden: '非表示',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'この番号はまだ確認されていません。ボタンをクリックして、確認リンクをテキストメッセージで再送信してください。',
        emailHasNotBeenValidated: 'メールがまだ認証されていません。ボタンをクリックして、認証リンクをテキストメッセージで再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を見る',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: '申し訳ありません、ワークスペースのアバターを削除する際に予期せぬ問題が発生しました',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択された画像は、アップロード可能な最大サイズ ${maxUploadSizeInMB} MB を超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `${minHeightInPx}x${minWidthInPx}ピクセルより大きく、${maxHeightInPx}x${maxWidthInPx}ピクセルより小さい画像をアップロードしてください。`,
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
        backdropLabel: 'モーダルの背景',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費を追加するのを<strong>あなた</strong>が行うのを待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の申請を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を提出するのを待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を送信するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_MARK_AS_DONE]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が完了にするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が完了にするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が完了にするのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => `これ以上の対応は不要です。`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `銀行口座の追加を<strong>お待ちしています</strong>。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が銀行口座を追加するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `毎月${eta}日に` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなたの</strong>経費が自動送信されるまでお待ちください${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>さんの経費が自動で提出されるのを待機しています${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動送信されるのを待機しています${formattedETA}。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `問題の修正を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が問題を修正するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を修正するのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の承認を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>による経費の承認を待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を承認するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートのエクスポートを<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がこのレポートをエクスポートするのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がこのレポートをエクスポートするのを待機しています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `精算の支払いを<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を支払うのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `ビジネス銀行口座の設定が完了するのを<strong>お客様</strong>の操作待ちです。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がビジネス銀行口座の設定を完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス銀行口座の設定を完了するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                eta?: string,
                etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta}までに` : ` ${eta}`;
                }
                return `支払いの完了を待機しています${formattedETA}。`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (
                _actor: string,
                _actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) =>
                `おっと！<strong>ご自身</strong>に提出しようとしているようです。ご自分のレポートを承認することは、ワークスペースの設定により<strong>禁止</strong>されています。別の相手にこのレポートを提出するか、提出先の担当者を変更してもらうよう管理者に連絡してください。`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: (
                actor: string,
                actorType: ValueOf<typeof CONST.NEXT_STEP.ACTOR_TYPE>,
                _eta?: string,
                _etaType?: ValueOf<typeof CONST.NEXT_STEP.ETA_TYPE>,
            ) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートは却下されました。問題を修正して手動で再提出していただくのを<strong>お待ちしています</strong>。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `このレポートは却下されました。問題を修正して手動で再提出するのを<strong>${actor}</strong>さんを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `このレポートは却下されました。管理者が問題を修正して手動で再提出するのを待っています。`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後ほど',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月末の最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月末最終日に',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '出張の終わりに',
        },
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望する代名詞',
        selectYourPronouns: '代名詞を選択してください',
        selfSelectYourPronoun: '自分の代名詞を選択する',
        emailAddress: 'メールアドレス',
        setMyTimezoneAutomatically: 'タイムゾーンを自動的に設定',
        timezone: 'タイムゾーン',
        invalidFileMessage: '無効なファイルです。別の画像をお試しください。',
        avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
        online: 'オンライン',
        offline: 'オフライン',
        syncing: '同期中',
        profileAvatar: 'プロフィールアバター',
        customInstructions: 'カスタム指示',
        copilotIntoAccount: 'アカウントにCopilot',
        publicSection: {
            title: '公開',
            subtitle: 'これらの詳細はあなたの公開プロフィールに表示され、誰でも閲覧できます。',
        },
        privateSection: {
            title: '非公開',
            subtitle: 'これらの詳細は、旅行や支払いのために使用されます。あなたの公開プロフィールに表示されることは決してありません。',
        },
        aiPromptSection: {
            title: 'AIプロンプト',
            subtitle: 'カスタム指示を作成',
            prompt: 'プロンプト',
            editPrompt: 'プロンプトを編集',
            promptCannotBeEmpty: 'プロンプトを入力してください',
            saved: '保存しました',
        },
    },
    securityPage: {title: 'セキュリティ', subtitle: 'アカウントを安全に保ちます。', goToSecurity: 'セキュリティページに戻る'},
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '自分のQRコードや紹介リンクを共有して、メンバーをExpensifyに招待しましょう。',
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
            `Expensify へのログイン方法とレシート送信方法をさらに追加しましょう。<br/><br/>レシートを <a href="mailto:${email}">${email}</a> に転送するメールアドレスを追加するか、レシートを 47777（米国の電話番号のみ）宛てにテキスト送信する電話番号を追加してください。`,
        pleaseVerify: 'この連絡方法を確認してください。',
        getInTouch: '今後のご連絡にはこの方法を使用します。',
        enterMagicCode: (contactMethod: string) => `${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在のデフォルトの連絡方法です。削除する前に、別の連絡方法を選択し、「デフォルトに設定」をクリックしてください。',
        removeContactMethod: '連絡先方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡先方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。少し待ってから、もう一度お試しください。',
            validateSecondaryLogin: '魔法コードが間違っているか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡方法の削除に失敗しました。サポートが必要な場合はConciergeまでお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法を設定できませんでした。サポートが必要な場合はConciergeまでお問い合わせください。',
            addContactMethod: 'この連絡方法を追加できませんでした。サポートが必要な場合はConciergeまでお問い合わせください。',
            enteredMethodIsAlreadySubmitted: 'この連絡方法はすでに存在します',
            passwordRequired: 'パスワードが必要です。',
            contactMethodRequired: '連絡方法は必須です',
            invalidContactMethod: '無効な連絡方法',
        },
        newContactMethod: '新しい連絡方法',
        goBackContactMethods: '連絡方法に戻る',
        yourDefaultContactMethodRestrictedSwitch: 'これは現在のデフォルトの連絡方法です。会社により、これを削除または変更することは制限されています。',
    },
    pronouns: {
        coCos: '会社 / コスト',
        eEyEmEir: 'E／Ey／Em／Eir',
        faeFaer: 'Fae／Faer',
        heHimHis: '彼／彼／彼の',
        heHimHisTheyThemTheirs: 'He／Him／His／They／Them／Theirs',
        sheHerHers: 'She／Her／Hers',
        sheHerHersTheyThemTheirs: 'She / Her / Hers / They / Them / Theirs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne／Nir／Nirs',
        neeNerNers: 'Nee／Ner／Ners',
        perPers: '名 / 名あたり',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe／Xem／Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '私の名前で呼んでください',
    },
    displayNamePage: {
        headerTitle: '表示名',
        isShownOnProfile: '表示名はあなたのプロフィールに表示されます。',
    },
    timezonePage: {
        timezone: 'タイムゾーン',
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されています。',
        getLocationAutomatically: '位置情報を自動的に取得',
    },
    updateRequiredView: {
        updateRequired: 'アップデートが必要です',
        pleaseInstall: 'New Expensify の最新バージョンにアップデートしてください',
        pleaseInstallExpensifyClassic: '最新バージョンの Expensify をインストールしてください',
        toGetLatestChanges: 'モバイルでは最新バージョンをダウンロードしてインストールしてください。ウェブではブラウザを再読み込みしてください。',
        newAppNotAvailable: '新しい Expensify アプリは、もう利用できません。',
    },
    initialSettingsPage: {
        about: '概要',
        aboutPage: {
            description: 'The New Expensify アプリは、世界中のオープンソース開発者コミュニティによって作られています。Expensify の未来を一緒に築きましょう。',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'キャッシュをクリアして再起動',
            description:
                '<muted-text>以下のツールを使用して、Expensify のご利用状況のトラブルシューティングに役立ててください。問題が発生した場合は、<concierge-link>バグを報告</concierge-link>してください。</muted-text>',
            confirmResetDescription: '送信されていない下書きメッセージはすべて失われますが、その他のデータは安全です。',
            resetAndRefresh: 'リセットして更新',
            clientSideLogging: 'クライアント側ログ記録',
            noLogsToShare: '共有するログはありません',
            useProfiling: 'プロファイリングを使用',
            profileTrace: 'プロファイルトレース',
            results: '結果',
            releaseOptions: 'リリースオプション',
            testingPreferences: 'テスト設定',
            useStagingServer: 'ステージングサーバーを使用',
            forceOffline: '強制的にオフラインにする',
            simulatePoorConnection: '不安定なインターネット接続をシミュレート',
            simulateFailingNetworkRequests: 'ネットワークリクエストの失敗をシミュレート',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイス認証情報',
            invalidate: '無効化',
            destroy: '破棄',
            maskExportOnyxStateData: 'Onyx の状態をエクスポートする際に機微なメンバーデータをマスクする',
            exportOnyxState: 'Onyx の状態をエクスポート',
            importOnyxState: 'Onyx 状態をインポート',
            testCrash: 'テストクラッシュ',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用しています。ここを押してクリアします。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルが無効です。もう一度お試しください。',
            invalidateWithDelay: '遅延して無効化',
            leftHandNavCache: '左側ナビキャッシュ',
            clearleftHandNavCache: 'クリア',
            softKillTheApp: 'アプリをソフトキルする',
            kill: '終了',
            sentryDebug: 'Sentry デバッグ',
            sentrySendDescription: 'Sentry にデータを送信',
            sentryDebugDescription: 'Sentry リクエストをコンソールに記録',
            sentryHighlightedSpanOps: '強調表示されたスパン名',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click、ナビゲーション、ui.load',
            showBranchNameInTitle: 'ブラウザのタイトルにブランチ名を表示',
        },
        security: 'セキュリティ',
        signOut: 'サインアウト',
        restoreStashed: '保存済みログインを復元',
        signOutConfirmationText: 'サインアウトすると、オフライン中の変更内容はすべて失われます。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>をお読みください。`,
        help: 'ヘルプ',
        whatIsNew: '新機能',
        accountSettings: 'アカウント設定',
        account: 'アカウント',
        general: '一般',
        helpPage: {
            title: 'ヘルプとサポート',
            description: '24時間いつでもサポートします。',
            helpSite: 'ヘルプサイト',
            helpSiteDescription: '記事、チュートリアルなど',
            conciergeChat: 'Concierge',
            conciergeChatDescription: 'あなたのパーソナルAIエージェント',
            accountManager: 'アカウントマネージャー',
            yourAccountManager: 'お客様のアカウントマネージャー',
            accountManagerDescription: '質問してサポートを受ける',
            partnerManager: 'パートナーマネージャー',
            yourPartnerManager: 'パートナーマネージャー',
            partnerManagerDescription: 'パートナーシップを最大限に活かし、紹介を促進しましょう',
            guideDescription: 'お客様のアカウント担当者',
            approvedPartnerTeamTitle: '承認済みパートナーチームをご紹介します',
            approvedPartnerTeamDescription: '御社の成長支援、クライアントの迅速なオンボーディング、そして必要なときにいつでも受けられる専門的なサポートに特化した専任チームです。',
            accountExecutive: 'アカウントエグゼクティブ',
            accountExecutiveDescription: 'クライアントの導入を成功させる',
            moreResources: 'その他のリソース',
        },
    },
    closeAccountPage: {
        closeAccount: 'アカウントを閉じる',
        reasonForLeavingPrompt: '退会されるのは残念です。今後の改善のため、よろしければ理由をお聞かせください。',
        enterMessageHere: 'ここにメッセージを入力',
        closeAccountWarning: 'アカウントを閉鎖すると元に戻すことはできません。',
        closeAccountPermanentlyDeleteData: '本当にアカウントを削除してもよろしいですか？未処理の経費はすべて完全に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉じることを確認するため、既定の連絡方法を入力してください。あなたの既定の連絡方法は次のとおりです：',
        enterDefaultContact: '既定の連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法：',
        enterYourDefaultContactMethod: 'アカウントを閉鎖するために、デフォルトの連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合',
        accountDetails: {
            accountToMergeInto: (login: string) => `<strong>${login}</strong> に統合したいアカウントを入力してください。`,
            notReversibleConsent: 'これが取り消せないことを理解しています',
        },
        accountValidate: {
            confirmMerge: '本当にアカウントを統合してもよろしいですか？',
            lossOfUnsubmittedData: (login: string) => `アカウントの統合は元に戻せず、<strong>${login}</strong> の未提出経費はすべて失われます。`,
            enterMagicCode: (login: string) => `続行するには、<strong>${login}</strong> に送信されたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: '魔法コードが間違っているか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントを統合しました！',
            description: (from: string, to: string) =>
                `<muted-text><centered-text><strong>${from}</strong> のすべてのデータを <strong>${to}</strong> に正常に統合しました。今後、このアカウントにはどちらのログイン情報でもアクセスできます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: 'New Expensify では、まだアカウントの統合をサポートしていません。代わりに Expensify Classic でこの操作を行ってください。',
            reachOutForHelp:
                '<muted-text><centered-text>ご不明な点がありましたら、お気軽に<concierge-link>Concierge までお問い合わせください</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classic に移動',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `<muted-text><centered-text><strong>${email.split('@').at(1) ?? ''}</strong> によって管理されているため、<strong>${email}</strong> はマージできません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `<muted-text><centered-text>ドメイン管理者によって primary ログインとして設定されているため、<strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `<muted-text><centered-text><strong>${email}</strong> で二要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong> の二要素認証（2FA）を無効にしてから、もう一度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく見る',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているため、マージできません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `<muted-text><centered-text><strong>${email}</strong> はExpensifyアカウントを持っていないため、アカウントを統合できません。代わりに、<a href="${contactMethodLink}">連絡先方法として追加</a>してください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `<muted-text><centered-text>このアカウントは請求書発行済みの課金関係を所有しているため、アカウントを<strong>${email}</strong>に統合することはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください',
            description: 'アカウントを統合しようとする試行が多すぎます。しばらくしてから、もう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '検証が完了していないため、他のアカウントへ統合できません。アカウントを検証してから、もう一度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: 'アカウントを自分自身と統合することはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '不審な行為を報告',
        lockAccount: 'アカウントをロック',
        lockMyAccount: 'アカウントをロックする',
        unlockAccount: 'アカウントのロック解除',
        findYourSituation: 'ほとんどの問題ではアカウントをロックする必要はありません。以下からご自身の状況をお探しください。',
        lostCardOrCharges:
            '<a href="https://help.expensify.com/articles/expensify-classic/expensify-card/Dispute-Transaction">カードの紛失または身に覚えのない請求</a>：カードを解約し、不明な取引について異議申し立てをするために Concierge へご連絡ください。',
        unauthorizedAccess:
            '<a href="https://help.expensify.com/articles/expensify-classic/settings/Report-Suspicious-Activity">不正なアカウントアクセス</a>：以下からアカウントをロックしてください。これにより、新しい Expensify カードの利用、カードの発行依頼、およびアカウントの変更ができなくなります。ドメイン管理者の場合、ドメイン全体のカードアクティビティと管理者アクションも一時停止されます。',
        securityTeamFollowUp: 'ロック後、セキュリティチームが<a href="mailto:risk@expensify.com">risk@expensify.com</a>からご連絡します。',
        areYouSure: 'Expensify アカウントをロックしてもよろしいですか？',
        onceLocked: 'ロックされると、解除リクエストとセキュリティ審査が完了するまでアカウントは制限されます',
        unlockTitle: 'リクエストを受け付けました',
        unlockDescription: 'アカウントが安全にロック解除できることを確認するために審査し、質問がある場合はConciergeを通じてご連絡します。',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `あなたのアカウントをロックできませんでした。この問題を解決するにはConciergeにチャットでお問い合わせください。`,
        chatWithConcierge: 'Conciergeとチャット',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'セキュリティに関する懸念を解決し、アカウントのロックを解除するには、Concierge とチャットしてください。',
        chatWithConcierge: 'Conciergeとチャット',
    },
    deviceManagementPage: {
        title: 'デバイス管理',
        description:
            'Expensify アカウントでログインしているすべてのデバイスを管理できます。<a href="https://help.expensify.com/articles/new-expensify/settings/Manage-Logged-in-Devices">詳しくはこちら</a>.',
        revoke: '取り消す',
        unknownDevice: '不明なデバイス',
    },
    twoFactorAuth: {
        headerTitle: '2要素認証',
        twoFactorAuthEnabled: '2要素認証が有効になりました',
        whatIsTwoFactorAuth: '2要素認証（2FA）は、アカウントを安全に保つのに役立ちます。ログインする際、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '2 要素認証を無効にする',
        explainProcessToRemove: '2要素認証（2FA）を無効にするには、認証アプリから有効なコードを入力してください。',
        explainProcessToRemoveWithRecovery: '2要素認証（2FA）を無効にするには、有効な復旧コードを入力してください。',
        disabled: '二要素認証は現在無効になっています',
        noAuthenticatorApp: '今後、Expensify にログインする際に認証アプリは不要になります。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらのコードを安全に保管してください。',
        codesLoseAccess: Str.dedent(`
            認証アプリへのアクセスを失い、これらのコードもお持ちでない場合は、アカウントにログインできなくなります。<br><br>
            <strong>注意</strong>：2FA を有効にすると、他のすべてのセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーまたはダウンロードしてください',
        stepVerify: '確認',
        scanCode: '次の端末でQRコードをスキャンしてください:',
        authenticatorApp: '認証アプリ',
        addKey: 'または、この秘密キーを認証アプリに追加してください:',
        secretKey: '秘密キー',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2要素認証が有効になりました',
        congrats: 'おめでとうございます！これでセキュリティがさらに強化されました。',
        copy: 'コピー',
        disable: '無効にする',
        enableTwoFactorAuth: '2 要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '二要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ保護のため、統合を接続するには Xero で二要素認証が必要です。',
        twoFactorAuthIsRequiredForAdminsHeader: '2要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '2要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'Xero 会計連携には二要素認証が必要です。',
        twoFactorAuthIsRequiredCompany: 'あなたの会社では、2 要素認証が必須です。',
        twoFactorAuthCannotDisable: '2要素認証を無効にできません',
        twoFactorAuthRequired: 'Xero 連携には二要素認証（2FA）が必須で、無効にすることはできません。',
        replaceDevice: 'デバイスを交換',
        replaceDeviceTitle: '2 要素認証デバイスを変更',
        verifyOldDeviceTitle: '古い端末を確認',
        verifyOldDeviceDescription: '現在使用している認証アプリに表示されている6桁のコードを入力して、アクセスできることを確認してください。',
        verifyNewDeviceTitle: '新しいデバイスを設定',
        verifyNewDeviceDescription: '新しいデバイスでQRコードをスキャンし、表示されたコードを入力して設定を完了してください。',
        downloadCodes: 'コードをダウンロード',
        copyCodes: 'コードをコピー',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'リカバリーコードを入力してください',
            incorrectRecoveryCode: '復元コードが正しくありません。もう一度お試しください。',
        },
        useRecoveryCode: 'リカバリーコードを使用',
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
        allSet: 'これで準備完了です。新しいパスワードは安全に保管してください。',
    },
    privateNotes: {
        title: '非公開メモ',
        personalNoteMessage: 'このチャットに関するメモをここに残しましょう。メモの追加、編集、閲覧ができるのはあなただけです。',
        sharedNoteMessage: 'このチャットに関するメモをここに残しましょう。Expensify の従業員と team.expensify.com ドメインの他のメンバーがこれらのメモを閲覧できます。',
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
        paymentCurrency: '支払い通貨',
        paymentCurrencyDescription: 'すべての個人経費を換算する標準通貨を選択してください',
        note: `注：支払通貨を変更すると、Expensify のご利用料金が変わる場合があります。詳しくは、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。`,
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
        expensifyPassword: 'Expensify のパスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            debitCardNumber: '有効なデビットカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '有効な請求先住所を入力してください（私書箱は使用できません）',
            addressState: '州を選択してください',
            addressCity: '市区町村を入力してください',
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
        growlMessageOnSave: '支払いカードが正常に追加されました',
        expensifyPassword: 'Expensify のパスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            paymentCardNumber: '有効なカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '有効な請求先住所を入力してください（私書箱は使用できません）',
            addressState: '州を選択してください',
            addressCity: '市区町村を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    personalCard: {
        addPersonalCard: '個人カードを追加',
        addCompanyCard: '会社カードを追加',
        lookingForCompanyCards: '会社カードを追加する必要がありますか？',
        lookingForCompanyCardsDescription: '世界中の10,000以上の銀行から自分のカードを追加できます。',
        personalCardAdded: '個人カードが追加されました！',
        personalCardAddedDescription: 'おめでとうございます。カードからの取引のインポートを開始します。',
        isPersonalCard: 'これは個人カードですか？',
        thisIsPersonalCard: 'これは個人カードです。',
        thisIsCompanyCard: 'これは会社カードです。',
        askAdmin: '管理者にお問い合わせください。',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `その場合、問題ありません。ただし、<strong>会社</strong>カードの場合は、${isAdmin ? 'ワークスペースから割り当ててください。' : '管理者にワークスペースから割り当ててもらってください。'}`,
        bankConnectionError: '銀行情報の接続に関する問題',
        bankConnectionDescription: 'カードの追加を再度お試しください。または、',
        connectWithPlaid: 'Plaid で接続できます。',
        fixCard: 'カードを修正',
        brokenConnection: 'カード接続が切断されています。',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `${cardName}カードとの接続が切れています。カードを修正するには、<a href="${connectionLink}">銀行にログイン</a>してください。`
                : `${cardName}カードとの接続が切れています。カードを修正するには、銀行にログインしてください。`,
        addAdditionalCards: '他のカードを追加',
        upgradeDescription: 'さらにカードを追加しますか？ワークスペースを作成して、個人カードを追加するか、会社カードをチーム全体に割り当てることができます。',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `<muted-text>Collect プランで利用可能で、1 メンバーあたり月額 <strong>${formattedPrice}</strong> です。</muted-text>`,
        note: (subscriptionLink: string) =>
            `<muted-text>この機能にアクセスするにはワークスペースを作成するか、<a href="${subscriptionLink}">プランと料金</a>の詳細をご確認ください。</muted-text>`,
        workspaceCreated: 'ワークスペースが作成されました',
        newWorkspace: 'ワークスペースを作成しました！',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `<centered-text>追加のカードを追加する準備ができました。<a href="${subscriptionLink}">サブスクリプションを表示</a>して詳細をご確認ください。</centered-text>`,
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払方法',
        setDefaultConfirmation: 'デフォルトの支払方法に設定',
        setDefaultSuccess: 'デフォルトの支払い方法を設定しました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを本当に削除しますか？',
        deleteCard: 'カードを削除',
        deleteCardConfirmation: '未提出のカード取引（未提出レポート上の取引を含む）はすべて削除されます。このカードを本当に削除してもよろしいですか？この操作は元に戻せません。',
        error: {
            notOwnerOfBankAccount: 'この銀行口座をデフォルトの支払い方法に設定する際にエラーが発生しました',
            invalidBankAccount: 'この銀行口座は一時的に停止されています',
            notOwnerOfFund: 'このカードをデフォルトの支払い方法に設定中にエラーが発生しました',
            setDefaultFailure: '問題が発生しました。詳しいサポートについてはConciergeにチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座の追加中に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: '入金を早く受け取る',
        addPaymentMethod: 'アプリ内で直接支払いの送受信を行うには、支払方法を追加してください。',
        getPaidBackFaster: 'より早く精算してもらう',
        secureAccessToYourMoney: 'お金への安全なアクセス',
        receiveMoney: '現地通貨で入金を受け取る',
        expensifyWallet: 'Expensifyウォレット（ベータ版）',
        sendAndReceiveMoney: '友だちとお金を送受信できます。米国の銀行口座のみ対応します。',
        enableWallet: 'ウォレットを有効にする',
        addBankAccountToSendAndReceive: '支払いや入金を行うには銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        cardInactive: '非アクティブ',
        assignedCards: 'カード',
        assignedCardsDescription: '割り当てられたカードの取引は自動的に同期されます。',
        addVirtualCardPersonalDetails: {subtitle: 'カードのご利用を開始するには、個人情報を入力してください', cta: '詳細を追加'},
        expensifyCard: 'Expensify カード',
        walletActivationPending: 'お客様の情報を確認しています。数分後にもう一度ご確認ください。',
        walletActivationFailed: '申し訳ありませんが、現在はウォレットを有効にできません。詳しいサポートについてはConciergeにチャットでお問い合わせください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: '銀行口座をExpensifyに連携して、アプリ内で支払いや入金をこれまで以上に簡単に直接行えるようにしましょう。',
        chooseYourBankAccount: '銀行口座を選択してください',
        chooseAccountBody: '必ず正しいものを選択してください。',
        confirmYourBankAccount: '銀行口座を確認する',
        personalBankAccounts: '個人の銀行口座',
        businessBankAccounts: 'ビジネス用銀行口座',
        shareBankAccount: '銀行口座を共有',
        bankAccountShared: '共有銀行口座',
        shareBankAccountTitle: 'この銀行口座を共有する管理者を選択してください:',
        shareBankAccountSuccess: '銀行口座を共有しました！',
        shareBankAccountSuccessDescription: '選択された管理者は、Concierge から確認メッセージを受信します。',
        shareBankAccountFailure: '銀行口座を共有しようとした際に予期しないエラーが発生しました。もう一度お試しください。',
        shareBankAccountEmptyTitle: '利用可能な管理者がいません',
        shareBankAccountEmptyDescription: 'この銀行口座を共有できるワークスペース管理者がいません。',
        shareBankAccountNoAdminsSelected: '続行する前に管理者を選択してください',
        unshareBankAccount: '銀行口座の共有を解除',
        unshareBankAccountDescription: '以下の全員がこの銀行口座にアクセスできます。いつでもアクセス権を削除できます。進行中の支払いはそのまま完了します。',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} はこのビジネス銀行口座へのアクセス権を失います。処理中の支払いは引き続き完了します。`,
        reachOutForHelp: 'Expensify カードで使用されています。共有を解除する必要がある場合は、<concierge-link>Concierge にお問い合わせください</concierge-link>。',
        unshareErrorModalTitle: '銀行口座の共有を解除できません',
        travelCVV: {
            title: 'トラベルCVV',
            subtitle: '出張を予約するときにこれを使用してください',
            description: 'このカードをExpensify Travelでの予約に使用してください。チェックアウト時には「Travel Card」と表示されます。',
        },
        chaseAccountNumberDifferent: '口座番号が異なるのはなぜですか？',
    },
    cardPage: {
        expensifyCard: 'Expensify カード',
        expensifyTravelCard: 'Expensify トラベルカード',
        availableSpend: '残りの上限',
        smartLimit: {
            name: 'スマート上限',
            title: (formattedLimit: string) => `このカードでは最大で${formattedLimit}まで使用でき、提出した経費が承認されると、その限度額はリセットされます。`,
        },
        fixedLimit: {
            name: '固定上限',
            title: (formattedLimit: string) => `このカードでは最大で${formattedLimit}まで利用できます。その後、自動的に無効になります。`,
        },
        monthlyLimit: {
            name: '月ごとの上限',
            title: (formattedLimit: string) => `このカードでは月あたり最大 ${formattedLimit} まで利用できます。利用限度額は毎月、暦月の1日目にリセットされます。`,
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: 'トラベルカードのCVV',
        physicalCardNumber: 'プラスチックカード番号',
        physicalCardPin: 'PIN',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカードの不正利用を報告',
        reportTravelFraud: 'トラベルカードの不正利用を報告',
        reviewTransaction: '取引を確認',
        suspiciousBannerTitle: '不審な取引',
        suspiciousBannerDescription: 'カードで不審な取引を検知しました。下をタップして確認してください。',
        cardLocked: '弊社チームが御社のアカウントを確認している間、カードは一時的にロックされています。',
        markTransactionsAsReimbursable: '取扱を立替精算対象としてマーク',
        markTransactionsDescription: '有効にすると、このカードから取り込まれた取引はデフォルトで立替精算対象としてマークされます。',
        csvCardDescription: 'CSVインポート',
        cardDetails: {
            cardNumber: 'バーチャルカード番号',
            expiration: '有効期限',
            cvv: 'CVV',
            address: '住所',
            reveal: '表示',
            revealDetails: '詳細を表示',
            revealCvv: 'CVV を表示',
            copyCardNumber: 'カード番号をコピー',
            copyCvv: 'CVV をコピー',
            updateAddress: '住所を更新',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `${platform}ウォレットに追加しました`,
        cardDetailsLoadingFailure: 'カード詳細の読み込み中にエラーが発生しました。インターネット接続を確認して、もう一度お試しください。',
        validateCardTitle: 'ご本人確認を行います',
        enterMagicCode: (contactMethod: string) => `カード情報を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        unexpectedError: 'Expensifyカードの詳細を取得中にエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです',
            reportFraudButtonText: 'いいえ、私ではありません',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審なアクティビティを解消し、カード x${cardLastFour} を再有効化しました。これで経費精算を続けられます！`,
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
            }) => `末尾が${cardLastFour}のカードで不審な利用が確認されました。この請求に心当たりはありますか？

${date} の ${merchant} への ${amount}`,
        },
        setYourPin: 'PIN を設定.',
        confirmYourPin: 'PIN を確認してください.',
        changeYourPin: 'カードの新しい暗証番号を入力してください。',
        confirmYourChangedPin: '新しい暗証番号を確認してください。',
        pinMustBeFourDigits: 'PIN は 4 桁で入力してください。',
        invalidPin: 'より安全な暗証番号を選択してください。',
        pinMismatch: 'PIN が一致しません。もう一度お試しください。',
        revealPin: 'PIN を表示',
        hidePin: 'PIN を非表示',
        pin: 'PIN',
        changePin: 'PIN を変更',
        pinChanged: 'PIN を変更しました！',
        pinChangedHeader: 'PIN を変更しました',
        pinChangedDescription: 'これで暗証番号をすぐにご利用いただけます。',
        changePinAtATM: 'PIN は任意の ATM で変更できます',
        changePinAtATMDescription: 'これはお住まいの地域では必須です。ご不明な点がある場合は<concierge-link>Concierge に連絡</concierge-link>してください。',
        freezeCard: 'カードを一時停止',
        unfreeze: '再開',
        unfreezeCard: 'カードの一時停止を解除',
        askToUnfreeze: '一時停止解除を依頼',
        freezeDescription: '一時停止したカードは購入や取引に使用できません。いつでも再開できます。',
        unfreezeDescription: 'このカードの一時停止を解除すると、購入と取引が再び可能になります。カードが安全に使用できると確信できる場合にのみ続行してください。',
        frozen: '凍結中',
        youFroze: ({date}: {date: string}) => `${date}にこのカードを一時停止しました。`,
        frozenBy: ({person, date}: {person: string; date: string}) => `${person}が${date}にこのカードを一時停止しました。`,
        frozenByAdminPrefix: ({date}: {date: string}) => `${date}にこのカードを一時停止したのは`,
        frozenByAdminNeedsUnfreezePrefix: 'このカードは',
        frozenByAdminNeedsUnfreezeSuffix: 'によって一時停止されました。解除するには管理者に連絡してください。',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `このカードは${person}によって一時停止されました。解除するには管理者に連絡してください。`,
        spendRules: '支出ルール',
        editSpendRules: '支出ルールを編集',
        cardUnblocked: 'カードのブロックを解除しました！',
        cardUnblockedDescription: '次回お買い物をされる際に、カードをリーダーに挿入するよう求められる場合があります。',
        pinBlocked: '暗証番号の誤入力が続いたため、カードをブロックしました。',
        unblock: 'ブロック解除',
        unblockCard: 'カードのブロックを解除',
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認および支払いまでを含むワークフローを構成します。',
        submissionFrequency: '申請',
        submissionFrequencyDescription: '経費を提出するためのカスタムスケジュールを選択してください。',
        submissionFrequencyDateOfMonth: '月の日付',
        disableApprovalPromptDescription: '承認を無効にすると、既存のすべての承認ワークフローが削除されます。',
        addApprovalsTitle: '承認',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `${members} の経費で、承認者は ${approvers} です`,
        addApprovalButton: '承認ワークフローを追加',
        loadMoreWorkflows: ({count}: {count: number}) => `さらに${count}件を読み込む`,
        editWorkflowAction: '編集',
        findWorkflow: 'ワークフローを検索',
        addApprovalTip: 'より詳細なワークフローが存在する場合を除き、このデフォルトのワークフローがすべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に、追加の承認を必須にする。',
        makeOrTrackPaymentsTitle: '支払',
        makeOrTrackPaymentsDescription: 'Expensifyでの支払いに対する承認済み支払者を追加するか、他の場所で行われた支払いを記録します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        editor: {
            submissionFrequency: 'Expensify がエラーのない支出を共有するまで、どのくらい待機するかを選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動提出に切り替えてください',
        frequencies: {
            instant: '即時に',
            weekly: '毎週',
            monthly: '毎月',
            twiceAMonth: '月2回',
            byTrip: '出張別',
            manually: '手動で',
            daily: '毎日',
            lastDayOfMonth: '月末最終日',
            lastBusinessDayOfMonth: '月末最終営業日',
            ordinals: {
                one: 'st',
                two: '番目',
                few: 'rd',
                other: '第',
                '1': '最初',
                '2': '秒',
                '3': '3 番目',
                '4': '4番目',
                '5': '5番目',
                '6': '6番目',
                '7': '7番目',
                '8': '8番目',
                '9': '9番目',
                '10': '10番目',
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに属しています。ここでの更新内容はそちらにも反映されます。',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。ワークフローが循環しないよう、別の承認者を選択してください。`,
        emptyContent: {
            title: '表示できるメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは、すでに既存の承認ワークフローに所属しています。',
            approverSubtitle: 'すべての承認者は、既存のワークフローに属しています。',
            bulkApproverSubtitle: '選択されたレポートの条件に一致する承認者がいません。',
        },
        configureViaHR: ({provider}: {provider: string}) => `${provider} で設定する。`,
        hrApprovalWorkflowLockedPrompt: ({provider}: {provider: string}) =>
            `承認は${provider}連携によって管理されています。承認ワークフローを更新するには、${provider}接続設定に移動してください。`,
        goToHRSettings: ({provider}: {provider: string}) => `${provider}設定に移動`,
        approverFromProvider: ({provider}: {provider: string}) => `${provider}から`,
        finalApprover: '最終承認者',
        manager: 'マネージャー',
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '提出頻度を変更できませんでした。もう一度お試しいただくか、サポートまでご連絡ください。',
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
        deletePrompt: 'この承認ワークフローを削除してもよろしいですか？すべてのメンバーは以後、デフォルトのワークフローに従うようになります。',
    },
    workflowsExpensesFromPage: {
        title: '経費（開始日）',
        header: '次のメンバーが経費を提出したとき：',
        memberAlreadyInWorkflowTitle: 'メンバーはすでにワークフローに属しています',
        memberAlreadyInWorkflowPrompt: ({memberName, approverName}: {memberName: string; approverName: string}) =>
            `${memberName}はすでに${approverName}に提出する承認ワークフローに属しています。ここに追加すると、このワークフローに移動します。`,
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
                : 'レポートが以下の金額を超えた場合に、別の承認者を追加する:',
        reportAmountLabel: 'レポート金額',
        additionalApproverLabel: '追加承認者',
        skip: 'スキップ',
        next: '次へ',
        removeLimit: '上限を解除',
        enterAmountError: '有効な金額を入力してください',
        enterApproverError: 'レポートの上限を設定する場合、承認者が必要です',
        enterBothError: 'レポート金額と追加承認者を入力してください',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `${approvalLimit} を超えるレポートは ${approverName} に送付されます`,
    },
    workflowsPayerPage: {
        title: '承認済み支払者',
        genericErrorMessage: '承認された支払者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払者',
        paymentAccount: '支払口座',
        shareBankAccount: {
            shareTitle: '銀行口座へのアクセスを共有しますか？',
            shareDescription: ({admin}: {admin: string}) => `${admin}を支払人にするには、銀行口座へのアクセスを${admin}と共有する必要があります。`,
            validationTitle: '銀行口座の検証待ち',
            validationDescription: ({admin}: {admin: string}) =>
                `<a href="#">この銀行口座を検証</a>する必要があります。検証が完了すると、銀行口座へのアクセス権を${admin}と共有して、支払人にすることができます。`,
            errorTitle: '支払人を変更できません',
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `${admin} はこの銀行口座へのアクセス権がないため、支払人に指定できません。銀行口座を共有する必要がある場合は、<a href="#">${owner} とチャットしてください。</a>`,
        },
    },
    reportFraudPage: {
        title: 'バーチャルカードの不正利用を報告',
        description: 'バーチャルカードの情報が盗まれたり不正利用された場合は、現在のカードを永久に無効化し、新しいバーチャルカードと番号を発行します。',
        deactivateCard: 'カードを無効化',
        reportVirtualCardFraud: 'バーチャルカードの不正利用を報告',
    },
    reportFraudConfirmationPage: {
        title: 'カード不正利用を報告済み',
        description: '既存のカードは永久に無効化しました。カードの詳細画面に戻ると、新しいバーチャルカードが利用可能になっています。',
        descriptionCardNotReplaced: 'カードは完全に無効化されました。新しいカードを発行するには管理者に連絡してください。',
        buttonText: '了解しました、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: '物理カードを有効化',
        error: {
            thatDidNotMatch: 'カードの下4桁が一致しませんでした。もう一度お試しください。',
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
        streetAddress: '番地・丁目',
        city: '市',
        state: '州',
        zipPostcode: '郵便番号',
        country: '国',
        confirmMessage: '以下の内容をご確認ください。',
        estimatedDeliveryMessage: '実物カードは2～3営業日以内に届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: (amount: string) => `振替${amount ? ` ${amount}` : ''}`,
        instant: '即時（デビットカード）',
        instantSummary: (rate: string, minAmount: string) => `${rate}%の手数料（最低${minAmount}）`,
        ach: '1〜3営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どの口座ですか？',
        fee: '手数料',
        transferSuccess: '振替が完了しました！',
        transferDetailBankAccount: '資金は今後1〜3営業日以内に入金される予定です。',
        transferDetailDebitCard: '送金はすぐに反映されるはずです。',
        failedTransfer: '残高が完全に清算されていません。銀行口座へ振替してください。',
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
        accountLastFour: '下4桁が',
        cardLastFour: '末尾番号が',
        addFirstPaymentMethod: 'アプリ内で直接支払いの送受信を行うには、支払方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: (lastFour: string) => `銀行口座・${lastFour}`,
    },
    agentsPage: {
        title: '担当者',
        subtitle: `<muted-text>エージェントがワークフローを代わりに処理するので、毎日の時間を数時間取り戻せます。<a href="${CONST.CUSTOM_AGENTS_HELP_URL}">詳しく見る</a>。</muted-text>`,
        newAgent: '新しいエージェント',
        emptyAgents: {
            title: 'エージェントは作成されていません',
            subtitle: `<muted-text><centered-text>手作業はやめましょう。代わりにエージェントに指示して、大幅な時間短縮につなげてください。<a href="${CONST.CUSTOM_AGENTS_HELP_URL}">詳しく見る</a>。</centered-text></muted-text>`,
        },
        error: {
            genericAdd: 'このエージェントの追加中に問題が発生しました',
            genericUpdate: 'このエージェントの更新中に問題が発生しました',
            updateName: 'このエージェント名の更新中に問題が発生しました',
            updatePrompt: 'このエージェントの指示を更新する際に問題が発生しました',
            updateAvatar: 'このエージェントのアバターを更新する際に問題が発生しました',
        },
    },
    addAgentPage: {
        title: '新しいエージェント',
        agentName: 'エージェント名',
        instructions: 'カスタム指示を作成',
        createAgent: 'エージェントを作成',
        editAvatar: 'アバターを切り替え',
        defaultAgentName: (displayName: string) => `${displayName} さんの代理人`,
        defaultPrompt:
            'ギャンブル、映画、またはその他明らかにビジネス目的ではない理由による経費は却下します。\n\nチップの金額が明確にわかるレシート画像を必ず添付するよう、ユーザーにリマインドします。\n\n同じユーザーの過去のレポートと非常によく似ている場合は、そのレポートを承認します。\n\n出張費が500ドルを超えるレポートは却下します。',
    },
    editAgentPage: {
        title: 'エージェントを編集',
        agentName: '担当者名',
        instructions: 'カスタム手順を作成',
        chatWithAgent: 'エージェントとチャット',
        copilotIntoAccount: 'アカウントにコパイロット',
        deleteAgent: 'エージェントを削除',
        deleteAgentTitle: 'エージェントを削除しますか？',
        deleteAgentMessage: 'このエージェントを削除してもよろしいですか？この操作は元に戻せません。',
    },
    editAgentAvatarPage: {title: 'アバターを編集'},
    editAgentNamePage: {title: '担当者名'},
    editAgentPromptPage: {title: 'カスタム手順を作成', error: {emptyPrompt: 'エージェントへの指示を入力してください。'}},
    expenseRulesPage: {
        title: '経費ルール',
        findRule: 'ルールを検索',
        emptyRules: {title: 'まだルールがありません', subtitle: '経費レポートを自動化するルールを追加する'},
        changes: {
            billableUpdate: (value: boolean) => `経費 ${value ? '請求可能' : '請求対象外'} を更新`,
            categoryUpdate: (value: string) => `カテゴリを「${value}」に更新`,
            commentUpdate: (value: string) => `説明を「${value}」に更新`,
            merchantUpdate: (value: string) => `取引先を「${value}」に更新`,
            reimbursableUpdate: (value: boolean) => `経費 ${value ? '経費精算対象' : '精算対象外'} を更新`,
            tagUpdate: (value: string) => `タグを「${value}」に更新`,
            taxUpdate: (value: string) => `税率を「${value}」に更新`,
            billable: (value: boolean) => `経費 ${value ? '請求可能' : '請求対象外'}`,
            category: (value: string) => `カテゴリを「${value}」にしました`,
            comment: (value: string) => `説明を「${value}」に変更`,
            merchant: (value: string) => `加盟店を「${value}」に`,
            reimbursable: (value: boolean) => `経費 ${value ? '経費精算対象' : '精算対象外'}`,
            tag: (value: string) => `"${value}" をタグ付け`,
            tax: (value: string) => `税率を「${value}」に`,
            report: (value: string) => `"${value}" という名前のレポートに追加`,
        },
        newRule: '新しいルール',
        addRule: {
            title: 'ルールを追加',
            expenseContains: '経費に次を含む場合:',
            applyUpdates: 'それから次の更新を適用します。',
            merchantHint: '. を入力して、すべての加盟店に適用されるルールを作成します',
            addToReport: '名前が次のレポートに追加',
            createReport: '必要に応じてレポートを作成',
            applyToExistingExpenses: '既存の一致する経費に適用',
            confirmError: '店舗名を入力し、少なくとも1つの更新を適用してください',
            confirmErrorMerchant: '加盟店を入力してください',
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
        subtitle: 'これらのルールはあなたの経費に適用されます。',
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: 'テスト設定',
            subtitle: 'ステージング環境でアプリのデバッグとテストを行うための設定です。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する機能のアップデートやExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensify のすべてのサウンドをミュートする',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読とピン留めされたチャットのみを#focusに表示するか、すべてのチャットを表示して、最新とピン留めされたチャットを上部に表示するかを選択してください。',
        priorityModes: {
            default: {
                label: '最新',
                description: '最新順ですべてのチャットを表示',
            },
            gsd: {
                label: '#focus',
                description: '未読のみをアルファベット順で表示',
            },
        },
    },
    focusModeUpdateModal: {
        title: '#focus モードへようこそ！',
        prompt: (priorityModePageUrl: string) =>
            `未読のチャットや対応が必要なチャットだけを表示して、状況を常に把握できるようにしましょう。いつでも<a href="${priorityModePageUrl}">設定</a>で変更できます。`,
    },
    inboxTabs: {all: 'すべて', todo: 'To-do リスト', unread: '未読'},
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `${policyName} 内`,
        generatingPDF: 'PDFを生成',
        waitForPDF: 'PDF を作成しています。しばらくお待ちください。',
        errorPDF: 'PDF の生成中にエラーが発生しました',
        successPDF: 'PDFが作成されました！自動的にダウンロードされない場合は、下のボタンを使用してください。',
        goToRoom: 'ルームに移動',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: 'ルームの説明（任意）',
        explainerText: 'ルームのカスタム説明を設定する',
    },
    groupChat: {
        lastMemberTitle: 'ご注意ください！',
        lastMemberWarning: 'ここにいる最後のメンバーのため、退出するとこのチャットには誰もアクセスできなくなります。本当に退出してもよろしいですか？',
        defaultReportName: (displayName: string) => `${displayName}のグループチャット`,
    },
    languagePage: {
        language: '言語',
        aiGenerated: 'この言語の翻訳は自動生成されており、誤りが含まれている可能性があります。',
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
        highContrastMode: 'ハイコントラストモード',
        enableHighContrast: 'ハイコントラストを有効にする',
        disableHighContrast: 'ハイコントラストを無効にする',
        chooseThemeBelowOrSync: '以下からテーマを選択するか、デバイスの設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすると、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `資金移動サービスは、その<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">認可</a>に基づき、${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）によって提供されています。`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        avoidScamsMessage: '<strong>詐欺に注意してください。コードを他人と共有しないでください。</strong> 当社スタッフがこのコードを電話・SMS・メールでお尋ねすることは決してありません。',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: 'リカバリーコードを入力してください',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `<a>${timeRemaining}</a> 後に新しいコードをリクエストする`,
        requestNewCodeAfterErrorOccurred: '新しいコードをリクエスト',
        timeRemainingAnnouncement: ({timeRemaining}) => `残り時間: ${timeRemaining}秒`,
        timeExpiredAnnouncement: '時間切れです',
        error: {
            pleaseFillMagicCode: 'マジックコードを入力してください',
            incorrectMagicCode: '魔法コードが間違っているか無効です。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'すべての項目を入力してください',
        pleaseFillPassword: 'パスワードを入力してください',
        pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには二要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        error: {
            incorrectPassword: 'パスワードが正しくありません。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログイン名またはパスワードが正しくありません。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントでは2要素認証が有効になっています。メールアドレスまたは電話番号でサインインしてください。',
            invalidLoginOrPassword: 'ログインまたはパスワードが正しくありません。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。これは、古いパスワード再設定メール内のパスワード再設定リンクの有効期限が切れていることが原因と思われます。再度お試しいただけるよう、新しいリンクを記載したメールを送信しました。受信トレイと迷惑メールフォルダをご確認ください。数分以内に届くはずです。',
            noAccess: 'このアプリケーションにアクセスする権限がありません。アクセスするには、GitHub のユーザー名を追加してください。',
            accountLocked: '試行回数が多すぎたため、アカウントがロックされました。1時間後にもう一度お試しください。',
            fallback: '問題が発生しました。後でもう一度お試しください。',
        },
    },
    loginForm: {
        phoneOrEmail: '電話番号またはメールアドレス',
        error: {
            invalidFormatEmailLogin: '入力されたメールアドレスが無効です。形式を修正して、もう一度お試しください。',
            agentSignInBlocked:
                'エージェントアカウントには直接サインインすることはできません。エージェントを利用するには、ご自身のアカウントでサインインし、Copilot 経由でアクセスしてください。',
        },
        cannotGetAccountDetails: 'アカウントの詳細を取得できませんでした。もう一度サインインしてください。',
        loginForm: 'ログインフォーム',
        notYou: (user: string) => `${user}ではありませんか？`,
    },
    onboarding: {
        welcome: 'ようこそ！',
        welcomeSignOffTitleManageTeam: '上記のタスクが完了したら、承認ワークフローやルールなど、さらに多くの機能を試してみましょう！',
        welcomeSignOffTitle: 'お会いできてうれしいです！',
        getStarted: 'はじめる',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: 'あなたのチームが Expensify を利用しているか確認する',
        workspaceYouMayJoin: (domain: string, email: string) => `${email} に送信されたコードを入力して、${domain} の誰かが参加できるワークスペースを持っているか確認します。`,
        joinAWorkspace: 'ワークスペースに参加',
        listOfWorkspaces: '参加できるワークスペースの一覧です。',
        skipForNow: '今はスキップ',
        workspaceMemberList: (employeeCount: number, policyOwner: string) => `${employeeCount}人のメンバー${employeeCount > 1 ? 's' : ''}・${policyOwner}`,
        whereYouWork: '勤務先はどこですか？',
        errorSelection: '次に進むオプションを選択してください',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: '続行を押してセットアップを完了してください',
            errorBackButton: 'アプリを使い始めるには、セットアップの質問にすべて回答してください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主に経費を提出する',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'チームの経費を管理',
            [CONST.ONBOARDING_CHOICES.TRACK_BUSINESS]: 'ビジネスの経費を記録',
            [CONST.ONBOARDING_CHOICES.TRACK_PERSONAL]: '個人の支出を管理',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'その他',
        },
        personalTrackGoal: {
            title: '何を管理したいですか？',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.INVESTMENT_TRACKING]: '投資用不動産の費用',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.HOUSEHOLD_TRACKING]: '家計費',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SIDEPROJECT_TRACKING]: 'サイドプロジェクト経費',
            [CONST.ONBOARDING_PERSONAL_TRACK_GOALS.SOMETHING_ELSE]: 'その他',
            somethingElsePlaceholder: '何を記録しますか？',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL]: '1～4名の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO_MEDIUM]: '5～10人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '従業員数 1～10 人',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11～50名の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51～100人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101～1,000人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000人超の従業員',
        },
        accounting: {
            title: '会計ソフトを利用していますか？',
            none: 'なし',
        },
        interestedFeatures: {
            title: 'どの機能にご興味がありますか？',
            featuresAlreadyEnabled: '当社で最も人気のある機能はこちらです。',
            featureYouMayBeInterestedIn: '追加機能を有効にする:',
        },
        error: {
            requiredFirstName: '続行するには名を入力してください',
        },
        workEmail: {
            title: '勤務先のメールアドレスは何ですか？',
            subtitle: 'Expensify は、勤務先のメールアドレスを連携すると最も便利にご利用いただけます。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.com に転送してスキャンする',
                descriptionTwo: 'すでにExpensifyを利用している同僚に参加する',
                descriptionThree: 'より自分好みの体験をお楽しみください',
            },
            addWorkEmail: '勤務用メールアドレスを追加',
        },
        workEmailValidation: {
            title: '勤務先メールを確認してください',
            magicCodeSent: (workEmail: string | undefined) => `${workEmail} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        },
        workEmailValidationError: {
            publicEmail: 'プライベートドメインの有効な勤務先メールアドレスを入力してください（例：mitch@company.com）',
            sameAsSignupEmail: 'サインアップ時に使用したものとは別のメールアドレスを入力してください',
            offline: 'オフラインのため、勤務先のメールアドレスを追加できませんでした',
        },
        mergeBlockScreen: {
            title: '勤務用メールアドレスを追加できませんでした',
            subtitle: (workEmail: string | undefined) =>
                `${workEmail} を追加できませんでした。後で「設定」からもう一度お試しいただくか、ガイダンスについて Concierge にチャットでお問い合わせください。`,
            workAccountClosedSubtitle:
                'このメールアドレスに関連付けられている業務用アカウントは停止されています。再有効化するには会社の管理者にご連絡いただくか、別のメールアドレスでサインアップしてください。',
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `Expensify が経費精算を最速で行える理由を知るために、[短いプロダクトツアーを体験しましょう](${testDriveURL})。`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[テストドライブ](${testDriveURL})を試す`,
                description: ({testDriveURL}) => `[お試し体験](${testDriveURL})でご利用いただくと、あなたのチームは *Expensify を3か月間無料* でお使いいただけます！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    Str.dedent(`
                        チームの支出を確認して管理できるように、*経費承認機能を追加*しましょう。

                        手順は次のとおりです：

                        1. *Workspaces* に移動します。
                        2. 対象のワークスペースを選択します。
                        3. *More features* をクリックします。
                        4. *Workflows* を有効にします。
                        5. ワークスペースエディター内の *Workflows* に移動します。
                        6. *Approvals* を有効にします。
                        7. これで、あなたが経費承認者として設定されます。チームを招待したあと、任意の管理者に変更できます。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `ワークスペースを[作成](${workspaceConfirmationLink})`,
                description: 'ワークスペースを作成し、アカウントエグゼクティブのサポートを受けながら設定を行いましょう。',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペースを作成](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    Str.dedent(`
                        経費を管理し、レシートをスキャンしたり、チャットしたりできる *ワークスペースを作成* しましょう。

                        1. *ワークスペース* をクリックし、*新しいワークスペース* を選択します。

                        *新しいワークスペースの準備ができました！* [こちらを確認](${workspaceSettingsLink})。`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリ](${workspaceCategoriesLink})を設定`,
                description: ({workspaceCategoriesLink}) =>
                    Str.dedent(`
                        経費をかんたんにレポートできるよう、チームが仕訳に使う*カテゴリを設定*しましょう。

                        1. *ワークスペース*をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. *カテゴリ*をクリックします。
                        4. 不要なカテゴリを無効にします。
                        5. 右上から独自のカテゴリを追加します。

                        [ワークスペースのカテゴリ設定に移動](${workspaceCategoriesLink})。
                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: '経費を作成',
                description: Str.dedent(`
                    金額を入力するかレシートをスキャンして、*経費を作成*しましょう。


                    1. *+* ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、レシートをスキャンします。
                    4. 上司のメールアドレスまたは電話番号を追加します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            adminSubmitExpenseTask: {
                title: '経費を作成',
                description: Str.dedent(`
                    金額を入力するか、領収書をスキャンして*経費を作成*します。


                    1. *+* ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. 詳細を確認します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            trackExpenseTask: {
                title: '経費を記録',
                description: Str.dedent(`
                    領収書の有無にかかわらず、どの通貨でも*経費を記録*できます。

                    1. *+* ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. *個人*スペースを選択します。
                    5. *作成* をクリックします。

                    以上です！とても簡単です。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `接続${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'から へ'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    Str.dedent(`
${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : '宛先'} ${integrationName} を接続して、自動経費コード設定と同期を行い、月末締めをスムーズにしましょう。

                        1.「*ワークスペース*」をクリックします。
                        2. ワークスペースを選択します。
                        3.「*会計*」をクリックします。
                        4. ${integrationName} を探します。
                        5.「*接続*」をクリックします。

                        [経理画面に移動](${workspaceAccountingLink})。
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[法人カード](${corporateCardLink})を連携`,
                description: ({corporateCardLink}) =>
                    Str.dedent(`
                        自動取引インポート、領収書の照合、消込のために、すでにお持ちのカードを連携しましょう。

                        1. 「*ワークスペース*」をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. 「*会社カード*」をクリックします。
                        4. 表示される指示に従ってカードを接続します。

                        [会社カードに移動](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[チームを招待する](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    Str.dedent(`
                        *チームを招待*して、今すぐ経費の記録を始めてもらいましょう。

                        1. *ワークスペース*をクリックします。
                        2. ワークスペースを選択します。
                        3. *メンバー* > *メンバーを招待* をクリックします。
                        4. メールアドレスまたは電話番号を入力します。
                        5. 必要に応じて、招待メッセージをカスタマイズしてください。

                        [ワークスペースのメンバー画面へ移動](${workspaceMembersLink})。
                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリ](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    Str.dedent(`
                        *カテゴリとタグを設定* すると、チームが経費にコードを付けて、レポートを簡単に作成できるようになります。

                        [会計ソフトウェアを接続](${workspaceAccountingLink})して自動的にインポートするか、[ワークスペース設定](${workspaceCategoriesLink})で手動設定してください。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[tag](${workspaceTagsLink})を設定`,
                description: ({workspaceMoreFeaturesLink}) =>
                    Str.dedent(`
                        タグを使って、プロジェクト、クライアント、所在地、部署などの追加経費情報を管理しましょう。タグを複数階層で使いたい場合は、Control プランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *More features* をクリックします。
                        4. *Tags* を有効にします。
                        5. ワークスペースエディタ内の *Tags* に移動します。
                        6. *+ Add tag* をクリックして、独自のタグを作成します。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。

                    `),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `[会計士](${workspaceMembersLink})を招待する`,
                description: ({workspaceMembersLink}) =>
                    Str.dedent(`
                        *会計士を招待して*ワークスペースで共同作業し、ビジネス経費を管理しましょう。

                        1. *ワークスペース* をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. *メンバー* をクリックします。
                        4. *メンバーを招待* をクリックします。
                        5. 会計士のメールアドレスを入力します。

                        [今すぐ会計士を招待](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: 'チャットを開始',
                description: Str.dedent(`
                    メールアドレスまたは電話番号を使って、誰とでも*チャットを開始*できます。

                    1. *+* ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。

                    まだ Expensify を利用していない相手には、自動的に招待が送信されます。

                    すべてのチャットはメールまたはテキストメッセージとしても送信され、相手はそこから直接返信できます。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割',
                description: Str.dedent(`
                    1人または複数の人と*経費を分割*しましょう。

                    1. *+* ボタンをクリックします。
                    2. *チャットを開始*を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット画面でグレーの *+* ボタンをクリックし、*経費の分割*を選択します。
                    5. *手動入力*、*スキャン*、または*距離*から選んで経費を作成します。

                    必要に応じて詳細を追加することも、そのまま送信することもできます。さっそく立て替えた分を精算してもらいましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink})を確認する`,
                description: ({workspaceSettingsLink}) =>
                    Str.dedent(`
                        ワークスペース設定を確認・更新する手順：
                        1.［ワークスペース］をクリックします。
                        2. 対象のワークスペースを選択します。
                        3. 設定内容を確認し、必要に応じて更新します。
                        [ワークスペースに移動](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '最初のレポートを作成',
                description: Str.dedent(`
                    レポートの作成方法は次のとおりです：

                    1. *+* ボタンをクリックします。
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
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '返金を受け取るのは、メッセージを送るくらい簡単です。基本を確認しましょう。',
            onboardingPersonalSpendMessage: '数回のクリックで支出を管理する方法をご紹介します。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? Str.dedent(`
                        # 無料トライアルが開始されました！セットアップを始めましょう。
                        👋 こんにちは、私はあなたの Expensify アカウントエグゼクティブです。すでにチームの領収書と経費を管理するためのワークスペースを作成済みです。30日間の無料トライアルを最大限に活用するために、以下の残りのセットアップ手順に沿って進めてください。
                    `)
                    : Str.dedent(`
                        # 無料トライアルが開始しました！セットアップを始めましょう。
                        👋 こんにちは、私はあなたの Expensify アカウントエグゼクティブです。ワークスペースを作成いただいたので、下記の手順に従って 30 日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage: '30日間の無料トライアルを最大限に活用するために、以下の残りの手順に従ってください。',
            onboardingChatSplitMessage: '友だちとの割り勘は、メッセージを送るくらい簡単です。やり方はこちら。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自分の経費を提出する方法を学びましょう。',
            onboardingTestDriveReceiverMessage: '*3か月無料でご利用いただけます！下から始めましょう。*',
        },
        workspace: {
            title: 'ワークスペースで整理整頓しよう',
            subtitle: '強力なツールで経費管理をシンプルに、すべてを1か所で。ワークスペースを使うと、次のことができます。',
            explanationModal: {
                descriptionOne: '領収書を追跡して整理する',
                descriptionTwo: '経費を分類してタグ付けする',
                descriptionThree: 'レポートを作成して共有',
            },
            price: (price?: string) => `まずは30日間無料でお試しいただき、その後はわずか<strong>${price ?? '$5'}/ユーザー/月</strong>でアップグレードできます。`,
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: 'レシートの管理、経費精算、出張管理、レポート作成などをチャットのスピードでこなせるワークスペースを作成しましょう。',
        },
        inviteMembers: {
            title: 'メンバーを招待',
            subtitle: 'チームを追加するか、会計士を招待しましょう。人数が多いほど、もっと便利になります！',
        },
        workEmail2FAError: 'このログインは、二要素認証（2FA）が有効になっている既存のアカウントです。',
        singleSignOnError: 'このログインは、SSO／SAML が有効になっている既存のアカウントです。',
    },
    featureTraining: {
        doNotShowAgain: '今後このメッセージを表示しない',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: '名前に特殊文字を含めることはできません',
            containsReservedWord: '名前に「Expensify」または「Concierge」を含めることはできません',
            hasInvalidCharacter: '名前にカンマまたはセミコロンを含めることはできません',
            requiredFirstName: '名を空欄にすることはできません',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '法的氏名は何ですか？',
        enterDateOfBirth: '生年月日はいつですか？',
        enterAddress: 'あなたの住所は何ですか？',
        enterPhoneNumber: '電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は出張と支払いに使用されます。公開プロフィールに表示されることは決してありません。',
        basicDetails: '基本情報',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        address: '住所',
        error: {
            dateShouldBeBefore: (dateString: string) => `日付は${dateString}より前である必要があります`,
            dateShouldBeAfter: (dateString: string) => `日付は${dateString}より後の日付にしてください`,
            hasInvalidCharacter: '名前にはラテン文字のみ使用できます',
            cannotIncludeCommaOrSemicolon: '名前にコンマまたはセミコロンを含めることはできません',
            incorrectZipFormat: (zipFormat?: string) => `郵便番号の形式が正しくありません${zipFormat ? `使用可能な形式：${zipFormat}` : ''}`,
            invalidPhoneNumber: `電話番号が有効であることを確認してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクを再送信しました',
        weSentYouMagicSignInLink: (login: string, loginType: string) => `${login} にマジックサインインリンクを送信しました。サインインするには ${loginType} を確認してください。`,
        resendLink: 'リンクを再送',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) => `${secondaryLogin} を確認するには、${primaryLogin} のアカウント設定からマジックコードを再送してください。`,
        noLongerHaveAccess: (primaryLogin: string) => `${primaryLogin} にアクセスできなくなった場合は、アカウントの連携を解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクを送信しました！',
        successfullyUnlinkedLogin: 'セカンダリログインを正常に連携解除しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `配信の問題により、メールプロバイダーが一時的に ${login} へのメール送信を停止しました。ログインのブロックを解除するには、次の手順に従ってください。`,
        confirmThat: (login: string) =>
            `<strong>${login} のスペルが正しいこと、また実在しメールを受信できるメールアドレスであることを確認してください。</strong> 「expenses@domain.com」のようなメールエイリアスは、有効な Expensify ログインとするために、そのメールアドレス専用の受信トレイへアクセスできなければなりません。`,
        ensureYourEmailClient: `<strong>お使いのメールクライアントで expensify.com からのメールが受信できるように設定してください。</strong> この手順の完了方法は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>で確認できますが、メール設定の構成には IT 部門のサポートが必要な場合があります。`,
        onceTheAbove: `上記の手順が完了したら、ログインのブロック解除のために<a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>までご連絡ください。`,
    },
    openAppFailureModal: {
        title: '問題が発生しました…',
        subtitle: `すべてのデータを読み込むことができませんでした。問題を確認する通知を受け取り、現在調査しています。この状態が続く場合は、次にご連絡ください:`,
        refreshAndTryAgain: '更新して、もう一度お試しください',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) => `${login} に SMS メッセージを送信できないため、一時的に利用を停止しました。次の手順で番号の確認を行ってください。`,
        validationSuccess: '電話番号が認証されました！下をクリックして、新しいマジックサインインコードを送信してください。',
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
                return '少し待ってから、もう一度お試しください。';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '日' : '日数'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '時間' : '時間'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '分' : '分 minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `少々お待ちください！番号を再度確認するまでに、${timeText}お待ちいただく必要があります。`;
        },
    },
    welcomeSignUpForm: {
        join: '参加',
        marketingSMSConsent: 'Expensifyからのマーケティングテキストの受信に同意します',
    },
    detailsPage: {
        localTime: '現地時間',
    },
    newChatPage: {startGroup: 'グループを開始', addToGroup: 'グループに追加', addUserToGroup: (username: string) => `${username} をグループに追加`},
    yearPickerPage: {
        year: '年',
        selectYear: '年を選択してください',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しのお支払い詳細が見つかりません。',
        notHere: 'うーん…ここにはありません',
        pageNotFound: 'おっと、このページは見つかりません',
        noAccess: 'このチャットまたは経費は削除されたか、アクセス権がありません。\n\nご不明な点がありましたら concierge@expensify.com までご連絡ください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。',
        goToChatInstead: '代わりにチャットに移動してください。',
        contactConcierge: 'ご不明な点がありましたら concierge@expensify.com までご連絡ください',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `おっと… ${isBreakLine ? '\n' : ''}問題が発生しました`,
        subtitle: 'リクエストを完了できませんでした。後でもう一度お試しください。',
        wrongTypeSubtitle: 'その検索は無効です。検索条件を調整してみてください。',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '絵文字と任意のメッセージでステータスを設定します。',
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
        untilTomorrow: '明日まで',
        untilTime: (time: string) => `${time}まで`,
        date: '日付',
        time: '時間',
        clearAfter: 'クリアまでの時間',
        whenClearStatus: 'ステータスをいつクリアしますか？',
        setVacationDelegate: `休暇中に不在の間、あなたに代わってレポートを承認する代理人を設定しましょう。`,
        cannotSetVacationDelegate: `現在、次のメンバーの代理人になっているため、休暇代理人を設定できません：`,
        addVacationDelegate: '休暇代理人を追加',
        vacationDelegateError: '休暇の代理人を更新中にエラーが発生しました。',
        asVacationDelegate: (nameOrEmail: string) => `${nameOrEmail} さんの休暇代理として`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `${vacationDelegateName} の休暇代理人として ${submittedToName} に`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `${nameOrEmail} さんをあなたの休暇代理人に指定しようとしています。この人は、まだすべてのワークスペースに参加していません。続行すると、すべてのワークスペース管理者に、この人を追加するようメールが送信されます。`,
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
        accountEnding: '末尾が…の口座',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '下のアカウントを選択してください',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログインする',
        connectManually: '手動で接続',
        desktopConnection: '注意：Chase、Wells Fargo、Capital One、または Bank of America と接続するには、ブラウザでこの手続きを完了するためにこちらをクリックしてください。',
        yourDataIsSecure: 'お客様のデータは安全です',
        toGetStarted: '銀行口座を追加して、経費の精算、Expensify カードの発行、請求書の入金管理、請求書の支払いをすべて一括で行いましょう。',
        plaidBodyCopy: '従業員に、会社の経費を支払うのも立て替え精算を受けるのも、より簡単な方法を提供しましょう。',
        checkHelpLine: '口座のルーティング番号と口座番号は、その口座の小切手に記載されています。',
        bankAccountPurposeTitle: '銀行口座で何をしたいですか？',
        getReimbursed: '払い戻しを受ける',
        getReimbursedDescription: '雇用主または他の人から',
        makePayments: '支払いを行う',
        makePaymentsDescription: '経費の支払いまたは Expensify カードの発行',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `銀行口座を連携するには、まず<a href="${contactMethodRoute}">メールアドレスをプライマリログインとして追加</a>してから、もう一度お試しください。電話番号はセカンダリログインとして追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから、もう一度お試しください。',
        hasCurrencyError: (workspaceRoute: string) =>
            `おっと！ワークスペースの通貨がUSD以外に設定されているようです。続行するには、<a href="${workspaceRoute}">ワークスペース設定</a>で通貨をUSDに変更してから、もう一度お試しください。`,
        bbaAdded: 'ビジネス用銀行口座を追加しました！',
        bbaAddedDescription: '支払いに利用できる状態です。',
        lockedBankAccount: 'ロックされた銀行口座',
        unlockBankAccount: '銀行口座を解除する',
        youCantPayThis: `このレポートは支払えません。<a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">ロックされた銀行口座</a>があるためです。下をタップすると、コンシェルジュが解除の手続きを案内します。`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `<h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>銀行口座のロック解除リクエストを送信いただきありがとうございます。出金リクエストは、残高不足や銀行口座が口座振替に対応していない場合に拒否されることがあります。お客様のケースを確認し、問題解決のために追加情報が必要な場合はご連絡いたします。</p>`,
        textUnlockMessage: (maskedAccountNumber: string) =>
            `Expensify Business Bank Account ${maskedAccountNumber}\n銀行口座のロック解除リクエストを送信いただきありがとうございます。出金リクエストは、残高不足や銀行口座が口座振替に対応していない場合に拒否されることがあります。お客様のケースを確認し、問題解決のために追加情報が必要な場合はご連絡いたします。`,
        error: {
            youNeedToSelectAnOption: '続行するオプションを選択してください',
            noBankAccountAvailable: '申し訳ありませんが、利用可能な銀行口座がありません',
            noBankAccountSelected: 'アカウントを選択してください',
            taxID: '有効な納税者番号を入力してください',
            website: '有効なウェブサイトを入力してください',
            zipCode: `有効なZIPコードを、次の形式で入力してください: ${COMMON_CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '有効な電話番号を入力してください',
            email: '有効なメールアドレスを入力してください',
            companyName: '有効な会社名を入力してください',
            addressCity: '有効な都市名を入力してください',
            addressStreet: '有効な住所を入力してください',
            physicalAddressRequired: '実際の住所が必要です。私書箱や郵便転送サービスは受け付けていません。',
            addressState: '有効な州を選択してください',
            incorporationDateFuture: '設立日は未来の日付にできません',
            incorporationState: '有効な州を選択してください',
            industryCode: '有効な6桁の業種分類コードを入力してください',
            restrictedBusiness: 'ビジネスが制限対象の事業一覧に含まれていないことを確認してください',
            routingNumber: '有効なルーティング番号を入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: 'ルーティング番号と口座番号を同じにすることはできません',
            companyType: '有効な会社の種類を選択してください',
            tooManyAttempts: 'ログイン試行回数が多すぎるため、このオプションは24時間無効になっています。時間をおいてから再度お試しいただくか、代わりに詳細情報を手動で入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: '有効なSSNの下4桁を入力してください',
            firstName: '有効な名を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: 'デフォルトの入金口座またはデビットカードを追加してください',
            validationAmounts: '入力した検証用金額が正しくありません。銀行明細書をもう一度確認してから、再度お試しください。',
            fullName: '有効な氏名を入力してください',
            ownershipPercentage: '有効なパーセント数値を入力してください',
            deletePaymentBankAccount: 'この銀行口座は Expensify カードの支払いに使用されているため、削除できません。この口座を削除したい場合は、Concierge までご連絡ください。',
            sameDepositAndWithdrawalAccount: '入金口座と出金口座が同じです。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'あなたの口座情報は何ですか？',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: '銀行口座の詳細を教えてください。',
        accountHolderInformationStepHeader: '口座名義人の詳細は何ですか？',
        howDoWeProtectYourData: 'お客様のデータをどのように保護していますか？',
        currencyHeader: '銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '下記の詳細を再確認し、利用規約のチェックボックスをオンにして確定してください。',
        toGetStarted: '個人の銀行口座を追加して、経費精算の受け取りや請求書の支払い、Expensifyウォレットの有効化を行いましょう。',
        updatePersonalInfo: '銀行口座を更新',
        updatePersonalInfoFailure: '銀行口座情報を更新できませんでした。後でもう一度お試しください。',
        updateSuccessTitle: '銀行口座が更新されました!',
        updateSuccessHeader: '銀行口座が更新されました',
        updateSuccessMessage: 'おめでとうございます。銀行口座の設定が完了し、精算の受け取りができるようになりました。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify のパスワードを入力',
        alreadyAdded: 'このアカウントはすでに追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人の銀行口座を追加しました！',
        successMessage: 'おめでとうございます。銀行口座の設定が完了し、払い戻しを受け取る準備が整いました。',
    },
    attachmentView: {
        unknownFilename: '不明なファイル名',
        passwordRequired: 'パスワードを入力してください',
        passwordIncorrect: 'パスワードが正しくありません。もう一度お試しください。',
        failedToLoadPDF: 'PDF ファイルを読み込めませんでした',
        pdfPasswordForm: {
            title: 'パスワード保護されたPDF',
            infoText: 'このPDFはパスワードで保護されています。',
            beforeLinkText: 'お願いします',
            linkText: 'パスワードを入力してください',
            afterLinkText: '表示する。',
            formLabel: 'PDFを表示',
        },
        attachmentNotFound: '添付ファイルが見つかりません',
        retry: '再試行',
    },
    messages: {
        errorMessageInvalidPhone: `かっこやハイフンを含まない有効な電話番号を入力してください。米国外の場合は、国番号を含めて入力してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: (login: string, name: string) => `${login} はすでに ${name} のメンバーです`,
        userIsAlreadyAnAdmin: (login: string, name: string) => `${login} はすでに ${name} の管理者です`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレット有効化のリクエストを続行することで、お客様は次の内容を読み、理解し、同意したものとみなされます',
        facialScan: 'Onfido 顔認証ポリシーおよび同意書',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidoの顔スキャンポリシーおよび同意</a>、<a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>プライバシー</a>、および<a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>利用規約</a>。</muted-text-micro>`,
        tryAgain: '再試行',
        verifyIdentity: '本人確認',
        letsVerifyIdentity: '本人確認を行いましょう',
        butFirst: `その前に、ちょっと退屈な話です。次のステップで法律関連の内容をよく読んで、準備ができたら「同意」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラへのアクセスを有効にする',
        cameraRequestMessage: '銀行口座の確認を完了するには、カメラへのアクセス許可が必要です。設定 ＞ New Expensify から有効にしてください。',
        microphonePermissionsNotGranted: 'マイクへのアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の認証を完了するにはマイクへのアクセスが必要です。設定 ＞ New Expensify から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、本人確認書類の元の画像をアップロードしてください。',
        documentNeedsBetterQuality:
            'ご提出いただいた身分証明書は、損傷しているか、セキュリティ要素の一部が欠けているようです。損傷がなく、全体がはっきり写っている身分証明書の原本画像をアップロードしてください。',
        imageNeedsBetterQuality: 'ご本人確認書類の画像品質に問題があります。書類全体がはっきり写っている新しい画像をアップロードしてください。',
        selfieIssue: '自撮り写真／動画に問題があります。ライブの自撮り写真／動画をアップロードしてください。',
        selfieNotMatching: '自撮り写真／動画が本人確認書類と一致しません。顔がはっきりと確認できる新しい自撮り写真／動画をアップロードしてください。',
        selfieNotLive: '自撮り写真／動画がライブ写真／ライブ動画ではないようです。ライブの自撮り写真／動画をアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'ウォレットから送金および受け取りができるようにする前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: '本人確認を完了するために、あと少しだけ質問にお答えいただく必要があります。',
        helpLink: 'これが必要な理由の詳細を見る',
        legalFirstNameLabel: '法的な名',
        legalMiddleNameLabel: '法的なミドルネーム',
        legalLastNameLabel: '法的な姓',
        selectAnswer: '続行するには回答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'SSN の確認に問題が発生しました。SSN の9桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前にこの情報を修正してください',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `本人確認ができませんでした。後でもう一度お試しいただくか、ご不明な点があれば <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> までご連絡ください。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '料金と条件',
        haveReadAndAgreePlain: '電子開示を受け取ることを読み理解し、同意します。',
        haveReadAndAgree: `<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子開示書面</a>を受け取ることを確認し、同意します。`,
        agreeToThePlain: 'プライバシーおよびウォレット規約に同意します。',
        agreeToThe: (walletAgreementUrl: string) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>および<a href="${walletAgreementUrl}">ウォレット利用規約</a>に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越／クレジット機能はありません。',
        electronicFundsWithdrawal: '電子資金引き出し',
        standard: '標準',
        reviewTheFees: 'いくつかの手数料を確認してください。',
        checkTheBoxes: '以下のチェックボックスを選択してください。',
        agreeToTerms: '利用規約に同意すれば、すぐに始められます！',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `Expensifyウォレットは${walletProgram}によって発行されています。`,
            perPurchase: '購入ごと',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金リロード',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM 残高照会（提携内ATM・提携外ATM）',
            customerService: 'カスタマーサービス（自動応答またはオペレーター）',
            inactivityAfterTwelveMonths: '非取引期間（12か月間取引がない場合）',
            weChargeOneFee: '他に1種類の手数料を請求します。内容は次のとおりです：',
            fdicInsurance: 'お客様の資金はFDIC保険の対象です。',
            generalInfo: `プリペイド口座に関する一般的な情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>をご覧ください。`,
            conditionsDetails: `すべての手数料およびサービスの詳細と条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> にアクセスするか、+1 833-400-0904 までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き落とし（即時）',
            electronicFundsInstantFeeMin: (amount: string) => `(最小 ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'すべてのExpensifyウォレット手数料の一覧',
            typeOfFeeHeader: 'すべての手数料',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: '口座開設',
            openingAccountDetails: '口座開設手数料はかかりません。',
            monthlyFeeDetails: '月額料金はかかりません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス料金はかかりません。',
            inactivityDetails: '非アクティブ手数料はかかりません。',
            sendingFundsTitle: '別のアカウント保有者への送金',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使って他のアカウント保有者に送金しても、手数料はかかりません。',
            electronicFundsStandardDetails:
                '標準オプションを使用してExpensifyウォレットから銀行口座へ資金を振り替える場合、手数料はかかりません。通常、この振替は1〜3営業日以内に完了します。',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                '即時振込オプションを使用してExpensifyウォレットからリンク済みのデビットカードへ資金を振り替える場合、手数料が発生します。この振替は通常、数分以内に完了します。' +
                `手数料は振込金額の${percentage}%（最低手数料は${amount}）です。`,
            fdicInsuranceBancorp: (amount: string) =>
                `お客さまの資金はFDIC保険の対象となります。お客さまの資金はFDIC保険の対象となる金融機関である${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}に保管されるか、または同機関へ振替えられます。` +
                `そこに移された資金は、特定の預金保険要件を満たし、かつカードが登録されている場合に限り、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} が破綻したときでも、FDIC により最大 ${amount} まで保険で保護されます。詳細は ${CONST.TERMS.FDIC_PREPAID} をご覧ください。`,
            contactExpensifyPayments: `${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} には、+1 833-400-0904 へのお電話、${CONST.EMAIL.CONCIERGE} へのメール、または ${CONST.NEW_EXPENSIFY_URL} へのサインインでお問い合わせください。`,
            generalInformation: `プリペイド口座に関する一般的な情報については、${CONST.TERMS.CFPB_PREPAID}をご覧ください。プリペイド口座に関する苦情がある場合は、1-855-411-2372 で消費者金融保護局（Consumer Financial Protection Bureau）に電話するか、${CONST.TERMS.CFPB_COMPLAINT}にアクセスしてください。`,
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動',
            liveAgent: 'ライブ担当者',
            instant: '即時',
            electronicFundsInstantFeeMin: (amount: string) => `最小 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効になりました！',
        activatedMessage: 'ウォレットの設定が完了し、支払いの準備ができました。',
        checkBackLaterTitle: '少々お待ちください…',
        checkBackLaterMessage: 'お客様の情報を引き続き確認しております。後ほどもう一度ご確認ください。',
        continueToPayment: '支払いに進む',
        continueToTransfer: '振替を続行',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'ほぼ完了です！セキュリティ保護のため、いくつかの情報を確認する必要があります。',
        legalBusinessName: '正式な会社名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '税務識別番号',
        taxIDNumberPlaceholder: '9桁',
        companyType: '会社の種類',
        incorporationDate: '設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: '私は、この会社が次のリストに掲載されていないことを確認します',
        listOfRestrictedBusinesses: '制限対象事業の一覧',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業個人事業個人事業',
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
        enterYourLegalFirstAndLast: '法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        legalName: '法的氏名',
        legalNameSubtitle: '身分証明書に記載されている正式な氏名を入力してください。',
        enterYourDateOfBirth: '生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁は何ですか？',
        dontWorry: 'ご安心ください。個人信用情報の審査は一切行いません。',
        last4SSN: 'SSN の下4桁',
        enterYourAddress: 'あなたの住所は何ですか？',
        address: '住所',
        addressSubtitle: '実際の住所が必要です。私書箱や郵便転送サービスは受け付けていません。',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することで、お客様は次の内容を読み、理解し、同意したものとみなされます',
        whatsYourLegalName: 'あなたの法的氏名は何ですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁は何ですか？',
        noPersonalChecks: 'ご安心ください、ここで個人信用情報の審査が行われることはありません！',
        whatsYourPhoneNumber: '電話番号を教えてください。',
        weNeedThisToVerify: 'ウォレットを確認するためにこれが必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: 'あなたの会社名は何ですか？',
        businessName: '法人名',
        enterYourCompanyTaxIdNumber: '会社の税務ID番号は何ですか？',
        taxIDNumber: '税務識別番号',
        taxIDNumberPlaceholder: '9桁',
        enterYourCompanyWebsite: '御社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: '御社の住所はどこですか？',
        selectYourCompanyType: 'どのような種類の会社ですか？',
        companyType: '会社の種類',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協同組合',
            SOLE_PROPRIETORSHIP: '個人事業個人事業個人事業',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '会社の法人設立日はいつですか？',
        incorporationDate: '設立日',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '会社はどの州で法人登記されていますか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        companyAddress: '会社住所',
        listOfRestrictedBusinesses: '制限対象事業の一覧',
        confirmCompanyIsNot: '私は、この会社が次のリストに掲載されていないことを確認します',
        businessInfoTitle: 'ビジネス情報',
        legalBusinessName: '正式な会社名',
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
                    return '事業番号（BN）とは何ですか？';
                case CONST.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST.COUNTRY.AU:
                    return 'オーストラリア事業番号（ABN）とは何ですか？';
                default:
                    return 'EUのVAT番号とは何ですか？';
            }
        },
        whatsThisNumber: 'この番号は何ですか？',
        whereWasTheBusinessIncorporated: '会社はどこで法人設立されましたか？',
        whatTypeOfBusinessIsIt: 'どのような事業形態ですか？',
        whatsTheBusinessAnnualPayment: 'そのビジネスの年間決済額はいくらですか？',
        whatsYourExpectedAverageReimbursements: '想定される平均の精算額はいくらですか？',
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
        incorporation: '法人化',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人形態',
        businessCategory: '事業カテゴリ',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `${currencyCode}での年間支払額`,
        averageReimbursementAmount: '平均払い戻し額',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `${currencyCode}での平均払い戻し額`,
        selectIncorporationType: '設立形態を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        selectBusinessType: '事業形態を選択',
        findIncorporationType: '法人形態を検索',
        findBusinessCategory: 'ビジネスカテゴリを検索',
        findAnnualPaymentVolume: '年間支払額を見つける',
        findIncorporationState: '法人設立州を検索',
        findAverageReimbursement: '平均払い戻し額を確認',
        findBusinessType: '事業タイプを検索',
        error: {
            registrationNumber: '有効な登録番号を入力してください',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効な雇用主識別番号（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な事業者番号（BN）を入力してください';
                    case CONST.COUNTRY.GB:
                        return '有効なVAT登録番号（VRN）を入力してください';
                    case CONST.COUNTRY.AU:
                        return '有効なオーストラリア事業者番号（ABN）を入力してください';
                    default:
                        return '有効なEUのVAT番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `${companyName}の25％以上を所有していますか？`,
        doAnyIndividualOwn25percent: (companyName: string) => `${companyName}の25％以上を所有している個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `${companyName} の25％以上を所有している個人は、ほかにいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '法律により、事業の持分を25％超所有するすべての個人の本人確認を行うことが求められています。',
        companyOwner: 'ビジネスオーナー',
        enterLegalFirstAndLastName: 'オーナーの法的氏名は何ですか？',
        legalNameSubtitle: '身分証明書に記載されているオーナーの正式な氏名を入力してください。',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        enterTheDateOfBirthOfTheOwner: '所有者の生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁を入力してください。',
        last4SSN: 'SSN の下4桁',
        dontWorry: 'ご安心ください。個人信用情報の審査は一切行いません。',
        enterTheOwnersAddress: 'オーナーの住所は何ですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することで、お客様は次の内容を読み、理解し、同意したものとみなされます',
        owners: 'オーナー',
    },
    ownershipInfoStep: {
        ownerInfo: 'オーナー情報',
        businessOwner: 'ビジネスオーナー',
        signerInfo: '署名者情報',
        doYouOwn: (companyName: string) => `${companyName}の25％以上を所有していますか？`,
        doesAnyoneOwn: (companyName: string) => `${companyName}の25％以上を所有している個人はいますか？`,
        regulationsRequire: '規制により、事業の25％を超えて保有するすべての個人の本人確認を行う必要があります。',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        whatsTheOwnersName: 'オーナーの法的氏名は何ですか？',
        whatsYourName: '法的氏名は何ですか？',
        whatPercentage: '事業のうち、オーナーの持分は何パーセントですか？',
        whatsYoursPercentage: 'あなたは事業の何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: '所有者の生年月日はいつですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsTheOwnersAddress: 'オーナーの住所は何ですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatAreTheLast: '所有者の社会保障番号の下4桁は何ですか？',
        whatsYourLast: 'あなたの社会保障番号の下4桁は何ですか？',
        whatsYourNationality: 'あなたの市民権を持つ国はどこですか？',
        whatsTheOwnersNationality: '所有者の国籍はどこですか？',
        countryOfCitizenship: '市民権のある国',
        dontWorry: 'ご安心ください。個人信用情報の審査は一切行いません。',
        last4: 'SSN の下4桁',
        whyDoWeAsk: 'なぜこの情報が必要なのですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '持分比率',
        areThereOther: (companyName: string) => `${companyName}の25％以上を所有している他の個人はいますか？`,
        owners: 'オーナー',
        addCertified: '実質的支配者を示す認定済みの組織図を追加',
        regulationRequiresChart: '法令により、事業の25％以上を所有するすべての個人または法人が示された所有構成図の認証済み写しを収集する必要があります。',
        uploadEntity: '事業体の所有構成図をアップロード',
        noteEntity: '注：事業体の所有権構成図は、あなたの会計士または法律顧問の署名、もしくは公証を受けている必要があります。',
        certified: '認定された事業体の所有構成図',
        selectCountry: '国を選択',
        findCountry: '国を検索',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加書類をアップロード',
        pleaseUpload: '事業体の直接または間接の25％以上の所有者であることを確認するため、以下に追加の書類をアップロードしてください。',
        acceptedFiles: '使用可能なファイル形式：PDF、PNG、JPEG。各セクションの合計ファイルサイズは 5 MB を超えることはできません。',
        proofOfBeneficialOwner: '受益所有者の証明',
        proofOfBeneficialOwnerDescription:
            '事業の所有権が25%以上であることを証明するため、公認会計士、公証人、または弁護士が署名した宣誓書および組織図をご提出ください。日付は過去3か月以内のものであり、署名者の免許番号が記載されている必要があります。',
        copyOfID: '実質的支配者の本人確認書類のコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など',
        proofOfAddress: '実質的支配者の住所証明',
        proofOfAddressDescription: '例：公共料金の請求書、賃貸借契約書など',
        codiceFiscale: '納税者番号／Tax ID',
        codiceFiscaleDescription:
            '署名担当者との現地訪問の様子、または録音済み通話の動画をアップロードしてください。担当者は以下の情報を提供する必要があります：氏名、生年月日、会社名、登記番号、納税者番号、登記住所、事業内容、および口座の目的。',
    },
    completeVerificationStep: {
        completeVerification: '認証を完了',
        confirmAgreements: '以下の契約内容を確認してください。',
        certifyTrueAndAccurate: '提供された情報が真実かつ正確であることを証明します',
        certifyTrueAndAccurateError: '情報が真実かつ正確であることを証明してください',
        isAuthorizedToUseBankAccount: '私は、このビジネス支出のためにこの法人銀行口座を利用する権限があります',
        isAuthorizedToUseBankAccountError: 'ビジネス用銀行口座を操作する権限を持つ管理責任者である必要があります',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を認証する',
        validateButtonText: '検証',
        validationInputLabel: '取引',
        maxAttemptsReached: '誤った試行が多すぎたため、この銀行口座の認証は無効化されました。',
        description: `1〜2営業日以内に、「Expensify, Inc. Validation」といった名義から、少額の取引3件をお客様の銀行口座に送金します。`,
        descriptionCTA: '各取引の金額を下のフィールドに入力してください。例: 1.51。',
        letsChatText: 'あと少しです！チャットで最後にいくつかの情報を確認するお手伝いをお願いします。よろしいですか？',
        enable2FATitle: '不正行為を防ぐために、二要素認証（2FA）を有効にする',
        enable2FAText: 'お客様のセキュリティを重要視しています。アカウントをさらに強固に保護するため、今すぐ2要素認証（2FA）を設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    countryStep: {
        confirmBusinessBank: 'ビジネス銀行口座の通貨と国を確認',
        confirmCurrency: '通貨と国を確認',
        yourBusiness: 'ビジネス用銀行口座の通貨は、ワークスペースの通貨と一致している必要があります。',
        youCanChange: 'ワークスペースの通貨は、次の場所で変更できます',
        findCountry: '国を検索',
        selectCountry: '国を選択',
        error: {
            connectToWorkspace: (workspaceRoute: string) =>
                `この銀行口座はワークスペースにリンクする必要があります。<a href="${workspaceRoute}">ワークスペース</a>に移動し、ワークスペースを選択して、ワークフロー > 支払い > 銀行口座を追加 に進んでください。`,
        },
    },
    bankInfoStep: {
        whatAreYour: 'あなたのビジネス用銀行口座の詳細を教えてください。',
        letsDoubleCheck: 'すべて問題ないか、もう一度確認しましょう。',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        accountHolderNameDescription: '権限のある署名者の氏名',
    },
    signerInfoStep: {
        signerInfo: '署名者情報',
        areYouDirector: (companyName: string) => `あなたは${companyName}の取締役ですか？`,
        regulationRequiresUs: '規制により、署名者が事業者を代表してこの操作を行う権限を有しているか確認する必要があります。',
        whatsYourName: '法的氏名を入力してください',
        fullName: '法的氏名',
        whatsYourJobTitle: 'あなたの職種（役職）は何ですか？',
        jobTitle: '職種タイトル',
        whatsYourDOB: '生年月日はいつですか？',
        uploadID: '身分証明書と住所証明書をアップロード',
        personalAddress: '本人住所の証明（公共料金の請求書など）',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '個人住所の証明',
        enterOneEmail: (companyName: string) => `${companyName} のディレクターのメールアドレスを入力してください`,
        regulationRequiresOneMoreDirector: '規定により、署名者として最低でももう一人の取締役が必要です。',
        hangTight: '少々お待ちください…',
        enterTwoEmails: (companyName: string) => `${companyName} の取締役2名のメールアドレスを入力してください`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: 'ほかの取締役が本人確認を完了するのをお待ちしています。',
        id: '身分証明書のコピー',
        proofOfDirectors: '取締役の証明',
        proofOfDirectorsDescription: '例：Oncorp 企業プロフィールまたは企業登録。',
        codiceFiscale: '納税者番号',
        codiceFiscaleDescription: '署名者、権限を付与されたユーザー、および実質的支配者のための納税者番号（Codice Fiscale）。',
        PDSandFSG: 'PDS と FSG の開示書類',
        PDSandFSGDescription: Str.dedent(`
            Expensify は Corpay との提携により、API 接続を通じて Corpay の広大な国際銀行パートナーネットワークを活用し、グローバル払い戻し機能を提供しています。オーストラリアの規制に基づき、Corpay の金融サービスガイド（FSG）および商品開示説明書（PDS）をお渡しします。

            FSG と PDS には、Corpay が提供する商品とサービスの詳細および重要な情報が記載されていますので、よくお読みください。今後の参照のため、これらの書類を保管しておいてください。
        `),
        pleaseUpload: 'ビジネスの取締役としての本人確認を行うため、以下に追加の書類をアップロードしてください。',
        enterSignerInfo: '署名者情報を入力',
        thisStep: 'このステップは完了しました',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `は、従業員への支払いを${currency}で行うため、末尾が${bankAccountLastFour}の${currency}建てビジネス銀行口座をExpensifyに接続しようとしています。次のステップでは、取締役の署名者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスは異なる必要があります',
        },
    },
    agreementsStep: {
        agreements: '契約書',
        pleaseConfirm: '以下の規約に同意してください',
        regulationRequiresUs: '法律により、事業の持分を25％超所有するすべての個人の本人確認を行うことが求められています。',
        iAmAuthorized: '私は、ビジネス支出のためにそのビジネス用銀行口座を使用する権限があります。',
        iCertify: '提供された情報が真実かつ正確であることを証明します。',
        iAcceptTheTermsAndConditions: `私は<a href="https://www.corpay.com/cross-border/terms">利用規約と条件</a>に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約に同意します。',
        accept: '承認して銀行口座を追加',
        iConsentToThePrivacyNotice: '私は<a href="https://payments.corpay.com/compliance">プライバシー通知</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシー通知に同意します。',
        error: {
            authorized: 'ビジネス用銀行口座を操作する権限を持つ管理責任者である必要があります',
            certify: '情報が真実かつ正確であることを証明してください',
            consent: 'プライバシー通知に同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusign フォーム',
        pleaseComplete:
            '下のDocuSignリンクからACH承認フォームにご記入いただき、署名済みのコピーをこちらにアップロードしてください。そうすることで、お客さまの銀行口座から直接資金を引き落とせるようになります。',
        pleaseCompleteTheBusinessAccount: 'ビジネス口座申込用の口座振替（自動引き落とし）手続き書類にご記入ください',
        pleaseCompleteTheDirect:
            '下記の DocuSign リンクを使用して口座振替契約を完了し、署名済みの書類をこちらにアップロードしてください。お客様の銀行口座から直接引き落としできるようになります。',
        takeMeTo: 'DocuSign に移動',
        uploadAdditional: '追加書類をアップロード',
        pleaseUpload: 'DEFTフォームとDocuSignの署名ページをアップロードしてください',
        pleaseUploadTheDirect: '口座振替契約書とDocuSignの署名ページをアップロードしてください',
    },
    finishStep: {
        letsFinish: 'チャットで完了しましょう！',
        thanksFor:
            '詳しい情報をご提供いただきありがとうございます。専任のサポート担当者がただいま内容を確認しています。追加で必要な情報がある場合はあらためてご連絡しますが、その前でもご不明な点があればお気軽にお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '不正防止のために二要素認証（2FA）を有効にする',
        weTake: 'お客様のセキュリティを重要視しています。アカウントをさらに強固に保護するため、今すぐ2要素認証（2FA）を設定してください。',
        secure: 'アカウントを保護する',
    },
    documentsStep: {
        beforeYouGo: '続行する前に、いくつかの情報を確認するための書類が必要です',
        subheader: '確認',
        verificationFailed: '確認に失敗したため、追加の書類で本人および事業の確認が必要です',
        taxIDVerification: '納税者番号の確認',
        taxIDVerificationDescription: Str.dedent(`
            以下のいずれかの書類をアップロードしてください：
            • IRS TIN/EIN 割当通知書
            • IRS TIN/EIN 申請確認書（通常「Congratulations! The EIN has been successfully assigned」と記載）
            • 会社名と EIN が記載された IRS の免税通知書
        `),
        nameChangeDocument: '名称変更書類',
        nameChangeDocumentDescription: 'TIN/EIN 申請後に会社名が変更された場合、提供された納税者番号を確認するためにこの書類が必要です',
        companyAddressVerification: '会社住所の確認',
        companyAddressVerificationDescription: Str.dedent(`
            以下のいずれかの書類をアップロードしてください：
            • 会社名と住所が記載された最近の公共料金請求書
            • 会社名と住所が記載された銀行取引明細書
            • 署名ページを含む現行の賃貸契約書（会社名と現住所が記載されたもの）
            • 会社名と住所が記載された保険証書
            • 会社名と住所が記載された TIN 割当書類
        `),
        userAddressVerification: '住所確認',
        userAddressVerificationDescription: Str.dedent(`
            以下のいずれかの書類をアップロードしてください：
            • 有権者登録カード
            • 運転免許証
            • 銀行取引明細書
            • 公共料金請求書
        `),
        userDOBVerification: '生年月日の確認',
        userDOBVerificationDescription: '米国発行の身分証明書をアップロードしてください',
        finishViaChat: 'チャットで完了',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '少々お待ちください',
        explanationLine: '現在、お客様の情報を確認しています。まもなく次のステップに進めるようになります。',
    },
    session: {
        offlineMessageRetry: 'オフラインのようです。接続を確認して、もう一度お試しください。',
    },
    travel: {
        header: '出張を予約',
        title: '賢く旅しよう',
        subtitle: 'Expensify Travel を使って、最高のお得な旅行プランを手に入れ、すべてのビジネス経費を一か所で管理しましょう。',
        features: {
            saveMoney: '予約でお得に節約しましょう',
            alerts: '旅行プランの変更をリアルタイムでお知らせ',
        },
        bookTravel: '出張を予約',
        bookDemo: 'デモを予約',
        bookADemo: 'デモを予約',
        toLearnMore: '詳しくはこちらをご覧ください。',
        termsAndConditions: {
            header: '続ける前に…',
            title: '利用規約',
            label: '利用規約と条件に同意します',
            subtitle: `Expensify Travel の<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります',
            defaultWorkspaceError:
                'Expensify Travel を有効にするには、デフォルトのワークスペースを設定する必要があります。［設定］＞［ワークスペース］＞ ワークスペース名の右にある縦三点リーダーをクリック ＞［デフォルトのワークスペースに設定］の順に進んでから、もう一度お試しください。',
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
            cancellationUntil: '無料キャンセル期限：',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '払い戻し不可',
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
        train: '鉄道',
        trainDetails: {
            passenger: '乗客',
            departs: '出発日時',
            arrives: '到着予定',
            coachNumber: '車両番号',
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
        tripSummary: '出張概要',
        departs: '出発日時',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: (phoneErrorMethodsRoute: string) => `<rbr>出張を予約するには、<a href="${phoneErrorMethodsRoute}">勤務先メールアドレスを主なログインとして追加</a>してください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travel のセットアップ用ドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: (domain: string) =>
                `ドメイン <strong>${domain}</strong> に対して Expensify Travel を有効にする権限がありません。代わりに、そのドメインの管理者にトラベル機能の有効化を依頼してください。`,
            accountantInvitation: `あなたが会計士であれば、このドメインで出張機能を有効にするために、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士プログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travel を使い始める',
            message: `Expensify Travelでは、個人用メール（例：name@gmail.com）ではなく、勤務先のメール（例：name@company.com）を使用する必要があります。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travelは無効になっています',
            message: `管理者によりExpensify Travelがオフにされました。出張の手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: 'リクエストを確認しています…',
            message: `Expensify Travel をご利用いただく準備ができているか確認するため、こちらでいくつかのチェックを行っています。まもなくご連絡します！`,
            confirmText: '了解しました',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン ${domain} のトラベル有効化に失敗しました。このドメインのトラベル設定を確認し、有効化してください。`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）の航空券を予約しました。確認コード：${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）の航空券は無効になりました。`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）の航空券は、払戻または変更済みです。`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}の${airlineCode}便（${origin} → ${destination}）は、航空会社により欠航となりました。`,
            flightScheduleChangePending: (airlineCode: string) => `航空会社が便名${airlineCode}のスケジュール変更を提案しており、現在確認待ちです。`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `スケジュール変更が確定しました：便名 ${airlineCode} の出発時刻は ${startDate} になりました。`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `${startDate}のフライト ${airlineCode}（${origin} → ${destination}）が更新されました。`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `ご利用の客室クラスは、フライト${airlineCode}で${cabinClass}に更新されました。`,
            flightSeatConfirmed: (airlineCode: string) => `${airlineCode}便の座席指定が確定しました。`,
            flightSeatChanged: (airlineCode: string) => `${airlineCode}便の座席指定が変更されました。`,
            flightSeatCancelled: (airlineCode: string) => `${airlineCode}便の座席指定が解除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: (type: string, id = '') => `${type}の予約（${id}）をキャンセルしました。`,
            bookingCancelledByVendor: (type: string, id = '') => `業者があなたの${type}予約（${id}）をキャンセルしました。`,
            bookingRebooked: (type: string, id = '') => `${type}の予約が再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: (type: string) => `${type}の予約が更新されました。旅程表で新しい詳細を確認してください。`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `${origin} → ${destination} 行き（${startDate}）の鉄道チケットは払い戻しされました。クレジットが処理されます。`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `${startDate}の${origin}発${destination}行きの鉄道チケットは交換されました。`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `${startDate} の ${origin} → ${destination} 行きの鉄道チケットが更新されました。`,
            defaultUpdate: (type: string) => `${type}の予約が更新されました。`,
        },
        flightTo: '行きのフライト',
        trainTo: '方面行き',
        carRental: 'レンタカー',
        nightIn: '宿泊数',
        nightsIn: '泊（滞在先）',
    },
    workspace: {
        common: {
            card: 'カード',
            expensifyCard: 'Expensify カード',
            companyCards: '会社カード',
            personalCards: '個人カード',
            workflows: 'ワークフロー',
            workspace: 'ワークスペース',
            findWorkspace: 'ワークスペースを探す',
            findRoom: 'ルームを探す',
            edit: 'ワークスペースを編集',
            enabled: '有効',
            disabled: '無効',
            everyone: '全員',
            delete: 'ワークスペースを削除',
            settings: '設定',
            categories: 'カテゴリ',
            tags: 'タグ',
            customField1: 'カスタムフィールド1',
            customField2: 'カスタムフィールド2',
            customFieldHint: 'このメンバーのすべての支出に適用されるカスタムコードを追加します。',
            reports: 'レポート',
            reportFields: 'レポート項目',
            reportTitle: 'レポートタイトル',
            reportField: 'レポート項目',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            perDiem: '日当',
            travel: '出張',
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
                one: '1件を選択済み',
                other: (count: number) => `${count} 件選択中`,
            }),
            settlementFrequency: '清算頻度',
            setAsDefault: 'デフォルトのワークスペースに設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信されたレシートは、このワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？ すべてのカードフィードと割り当て済みカードが削除されます。',
            deleteOpenExpensifyCardsError: '御社にはまだ Expensify カードが残っています。削除するには、<concierge-link>Concierge までお問い合わせください</concierge-link>。',
            outstandingBalanceWarning: '最後のワークスペースを削除する前に精算する必要がある未払残高があります。支払いを解決するには、サブスクリプション設定に移動してください。',
            settleBalance: 'サブスクリプションに移動',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。ワークスペースに新しいメンバーを招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページへのアクセス権がありません。このワークスペースに参加しようとしている場合は、ワークスペースのオーナーに依頼してメンバーとして追加してもらってください。別のご用件ですか？${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
            goToWorkspace: 'ワークスペースに移動',
            duplicateWorkspace: 'ワークスペースを複製',
            duplicateWorkspacePrefix: '複製',
            goToWorkspaces: 'ワークスペースに移動',
            clearFilter: 'フィルターをクリア',
            workspaceName: 'ワークスペース名',
            workspaceOwner: 'オーナー',
            keepMeAsAdmin: '管理者のままにする',
            workspaceType: 'ワークスペースの種類',
            workspaceAvatar: 'ワークスペースのアバター',
            clientID: 'クライアントID',
            clientIDInputHint: 'クライアントの一意の識別子を入力してください',
            mustBeOnlineToViewMembers: 'このワークスペースのメンバーを表示するには、オンライン接続が必要です。',
            moreFeatures: 'その他の機能',
            requested: 'リクエスト済み',
            distanceRates: '距離単価',
            defaultDescription: 'すべての領収書と経費を一か所で管理。',
            descriptionHint: 'このワークスペースに関する情報をすべてのメンバーと共有します。',
            welcomeNote: '精算のための領収書提出には Expensify をご利用ください。ありがとうございます！',
            subscription: 'サブスクリプション',
            markAsEntered: '手入力としてマーク',
            markAsExported: 'エクスポート済みにする',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポート`,
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            lineItemLevel: '明細レベル',
            reportLevel: 'レポートレベル',
            topLevel: 'トップレベル',
            appliedOnExport: 'Expensify にはインポートされず、エクスポート時に適用されます',
            shareNote: {
                header: 'ワークスペースを他のメンバーと共有する',
                content: (adminsRoomLink: string) =>
                    `このQRコードを共有するか、以下のリンクをコピーしてメンバーがあなたのワークスペースへのアクセスを簡単にリクエストできるようにしましょう。ワークスペースへの参加リクエストはすべて、あなたが確認できるように<a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>ルームに表示されます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続したことがあるため、既存の接続を再利用するか、新しい接続を作成できます。`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `${connectionName} - 最終同期日時 ${formattedDate}`,
            authenticationError: (connectionName: string) => `認証エラーが原因で${connectionName}に接続できません。`,
            learnMore: '詳細はこちら',
            memberAlternateText: 'レポートを提出して承認します。',
            adminAlternateText: 'レポートとワークスペースの設定を管理します。',
            auditorAlternateText: 'レポートを表示してコメントします。',
            roleName: (role?: string) => {
                switch (role) {
                    case CONST.POLICY.ROLE.OWNER:
                        return 'オーナー';
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'ワークスペース管理者';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '監査担当者';
                    case CONST.POLICY.ROLE.EDITOR:
                        return '編集者';
                    case CONST.POLICY.ROLE.CARD_ADMIN:
                        return 'カード管理者';
                    case CONST.POLICY.ROLE.PEOPLE_ADMIN:
                        return 'メンバー管理';
                    case CONST.POLICY.ROLE.PAYMENTS_ADMIN:
                        return '支払い管理者';
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
                '請求書払いのサブスクリプションでは、プランをダウングレードすることはできません。サブスクリプションについて相談したり変更したりする場合は、アカウントマネージャーまたはConciergeまでお問い合わせください。',
            defaultCategory: 'デフォルトカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: (displayName: string) => `${displayName} さんの経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify カードの取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">当社の連携機能</a>で作成される「Expensify カード負債勘定」に自動的にエクスポートされます。</muted-text-label>`,
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: 'ダイレクト',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: 'なし',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: '間接',
            },
            budgetFrequency: {monthly: '毎月', yearly: '年次'},
            budgetFrequencyUnit: {monthly: '月', yearly: '年'},
            budgetTypeForNotificationMessage: {tag: 'タグ', category: 'カテゴリ'},
            travelInvoicing: '統合トラベル請求の経費を次の形式でエクスポートします',
            travelInvoicingVendor: '出張ベンダー',
            travelInvoicingPayableAccount: '旅費未払金勘定',
            hr: '人事',
            rooms: 'ルーム',
            findDomain: 'ドメインを検索',
            cardAdminAlternateText: 'ワークスペースカードを管理します。',
            peopleAdminAlternateText: 'メンバーと承認ワークフローを管理します。',
            paymentsAdminAlternateText: 'ワークフローの支払いを管理します。',
            readOnlyActionTitle: 'ちょっと待ってください…',
            readOnlyActionPrompt: 'このワークスペースでのあなたのロールは、これらの設定を表示できますが、編集することはできません。',
        },
        createdForClient: {
            title: 'クライアントのワークスペースを作成しました！',
            description: '素晴らしいニュースです 🎉。セットアップにサポートが必要な場合はお問い合わせください。',
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) => (organizationName ? `${organizationName} に接続しました` : '組織全体の出張費や飲食デリバリー経費を自動化しましょう。'),
                sendInvites: '招待を送信',
                sendInvitesDescription: 'これらのワークスペースメンバーはまだ Uber for Business アカウントを持っていません。現時点で招待しないメンバーがいれば、選択を解除してください。',
                confirmInvite: '招待を確認',
                manageInvites: '招待を管理',
                confirm: '確認',
                allSet: '準備完了',
                readyToRoll: '準備完了しました',
                takeBusinessRideMessage: 'ビジネス利用で乗車すると、Uber の領収書が Expensify に自動取り込みされます。さあ、出発しましょう！',
                all: 'すべて',
                linked: 'リンク済み',
                outstanding: '未払い',
                status: {
                    resend: '再送信',
                    invite: '招待する',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'リンク済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '一時停止中',
                },
                centralBillingAccount: '集中請求アカウント',
                centralBillingDescription: 'すべてのUber領収書の取込先を選択してください。',
                invitationFailure: 'Uber for Business にメンバーを招待できませんでした',
                autoInvite: 'Uber for Business に新しいワークスペースメンバーを招待',
                autoRemove: 'Uber for Business から削除されたワークスペースメンバーを非アクティブ化する',
                emptyContent: {
                    title: '未処理の招待はありません',
                    subtitle: 'やった！上から下まで探しましたが、未処理の招待は見つかりませんでした。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>日当額を設定して、従業員の日々の支出を管理しましょう。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳しく見る</a>。</muted-text>`,
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
                subtitle: '日当レートを設定して、従業員の1日あたりの支出を管理しましょう。スプレッドシートからレートをインポートして開始します。',
            },
            importPerDiemRates: '日当レートをインポート',
            editPerDiemRate: '日当額を編集',
            editPerDiemRates: '日当レートを編集',
            editDestinationSubtitle: (destination: string) => `この行き先を更新すると、すべての ${destination} 日当サブレートに適用されます。`,
            editCurrencySubtitle: (destination: string) => `この通貨を更新すると、すべての${destination}の日当サブレートの通貨が変更されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '自己負担経費を QuickBooks Desktop にエクスポートする方法を設定します。',
            exportOutOfPocketExpensesCheckToggle: '小切手を「後で印刷」にマーク',
            exportDescription: 'Expensify のデータを QuickBooks Desktop へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensify カードの取引を次の形式でエクスポートします',
            account: 'アカウント',
            accountDescription: '仕訳を記帳する場所を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択します。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送金元を選択してください。',
            creditCardAccount: 'クレジットカード口座',
            exportDate: {
                label: 'エクスポート日',
                description: 'QuickBooks Desktop へレポートをエクスポートする際にこの日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最新の経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Desktop にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認申請として提出された日付。',
                    },
                },
            },
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に計上します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop は仕訳エクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、QuickBooks 内の対応する仕入先と自動的に照合します。仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートについて、最後の経費の日付を使用して項目別の仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する取引先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '小切手の送金元を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効な場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
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
                body: 'セットアップを完了するには、QuickBooks Desktop が動作しているコンピューターで次のリンクを開いてください。',
                setupErrorTitle: '問題が発生しました',
                setupErrorBody: (conciergeLink: string) =>
                    `<muted-text><centered-text>現在、QuickBooks Desktop との接続が機能していません。しばらくしてからもう一度お試しいただくか、問題が解決しない場合は <a href="${conciergeLink}">Concierge までお問い合わせください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks Desktop から Expensify にインポートするコード設定を選択してください。',
            classes: 'クラス',
            items: '項目',
            customers: '顧客／プロジェクト',
            exportCompanyCardsDescription: '会社カードでの購入が QuickBooks Desktop にどのようにエクスポートされるかを設定します。',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            accountsDescription: 'QuickBooks Desktop の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい口座を有効または無効なカテゴリとして取り込むかを選択します。',
            accountsSwitchDescription: '有効なカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Desktop のクラスをどのように扱うかを選択してください。',
            tagsDisplayedAsDescription: '明細行レベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'Expensify で QuickBooks Desktop の顧客／プロジェクトをどのように扱うか選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に QuickBooks Desktop と同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、存在しない場合は QuickBooks Desktop にベンダーを自動的に作成します。',
            },
            itemsDescription: 'Expensify で QuickBooks Desktop の品目をどのように処理するかを選択してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '立替経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払われた時点でエクスポートされます',
                },
            },
        },
        qbo: {
            connectedTo: '接続先',
            importDescription: 'QuickBooks Online から Expensify に取り込むコード設定を選択してください。',
            classes: 'クラス',
            locations: '場所',
            customers: '顧客／プロジェクト',
            accountsDescription: 'QuickBooks Onlineの勘定科目表は、Expensifyにカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい口座を有効または無効なカテゴリとして取り込むかを選択します。',
            accountsSwitchDescription: '有効なカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Online のクラスをどのように処理するかを選択してください。',
            customersDescription: 'Expensify で QuickBooks Online の顧客／プロジェクトをどのように扱うかを選択してください。',
            locationsDescription: 'Expensify で QuickBooks Online のロケーションをどのように扱うかを選択してください。',
            taxesDescription: 'Expensify で QuickBooks Online の税金をどのように処理するかを選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online では、小切手または仕入先請求書の明細行レベルでロケーションをサポートしていません。明細行レベルでロケーションを使用したい場合は、振替伝票（仕訳）とクレジット／デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online は仕訳伝票での税金に対応していません。エクスポートオプションをベンダー請求書または小切手に変更してください。',
            exportDescription: 'Expensify のデータを QuickBooks Online へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensify カードの取引を次の形式でエクスポートします',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートをQuickBooks Onlineにエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最新の経費の日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Online にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認申請として提出された日付。',
                    },
                },
            },
            receivable: '売掛金',
            archive: '売掛金アーカイブ',
            exportInvoicesDescription: 'QuickBooks Online に請求書をエクスポートする際は、この勘定科目を使用してください。',
            exportCompanyCardsDescription: '会社カードでの購入をQuickBooks Onlineへどのようにエクスポートするかを設定します。',
            vendor: '取引先',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトのベンダーを設定します。',
            exportOutOfPocketExpensesDescription: '立替経費を QuickBooks Online へどのようにエクスポートするかを設定します。',
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに明細付きの小切手を作成し、送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に計上します。',
            exportVendorBillDescription:
                '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
            account: 'アカウント',
            accountDescription: '仕訳を記帳する場所を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択します。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送金元を選択してください。',
            creditCardAccount: 'クレジットカード口座',
            travelInvoicingDescription: '旅費は、以下で指定した QuickBooks Online アカウントにクレジットカード請求としてエクスポートされます。',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online では、ロケーションをタグとして取り込んでいる場合、ベンダー請求書のエクスポートでロケーションをサポートしていません。現在このワークスペースではロケーションがタグとして取り込まれているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online は仕訳のエクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日、自動的に QuickBooks Online と同期します。',
                inviteEmployees: '従業員を招待',
                inviteEmployeesDescription: 'QuickBooks Online の従業員レコードをインポートし、このワークスペースに従業員を招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Online にまだ存在しない場合はベンダーを自動的に作成し、請求書をエクスポートする際に顧客も自動作成します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が下記の QuickBooks Online アカウントに作成されます。',
                qboBillPaymentAccount: 'QuickBooks 請求書支払口座',
                qboInvoiceCollectionAccount: 'QuickBooks 請求書回収口座',
                accountSelectDescription: '請求書の支払元を選択すると、QuickBooks Online に支払いが作成されます。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、QuickBooks Online に支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳伝票',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェック',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'デビットカード取引の加盟店名を、QuickBooks 内の対応する仕入先と自動的に照合します。該当する仕入先が存在しない場合は、関連付けのために「Debit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、QuickBooks 内の対応する仕入先と自動的に照合します。仕入先が存在しない場合は、関連付けのために「Credit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートについて、最後の経費の日付を使用して項目別の仕入先請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締め期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する取引先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'ロケーションが有効な場合、仕入先請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書のエクスポート用に有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポート用の有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手のエクスポート用に有効な口座を選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポートを使用するには、QuickBooks Online で買掛金勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Online で仕訳勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェックのエクスポートを使用するには、QuickBooks Online で銀行口座を設定してください',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Online に口座を追加して、もう一度同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '立替経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払われた時点でエクスポートされます',
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
            accountsSwitchTitle: '新しい口座を有効または無効なカテゴリとして取り込むかを選択します。',
            accountsSwitchDescription: '有効なカテゴリーは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリ',
            trackingCategoriesDescription: 'Expensify で Xero のトラッキングカテゴリーをどのように扱うかを選択してください。',
            mapTrackingCategoryTo: (categoryName: string) => `Xero の ${categoryName} をマッピング先:`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Xero にエクスポートするとき、${categoryName} をどこにマッピングするか選択してください。`,
            customers: '顧客に再請求',
            customersDescription: 'Expensify で顧客への再請求を行うかどうかを選択します。Xero の顧客コンタクトは経費にタグ付けでき、売上請求書として Xero にエクスポートされます。',
            taxesDescription: 'Expensify で Xero の税金をどのように処理するかを選択してください。',
            notImported: 'インポートされていません',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero 連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポート項目',
            },
            exportDescription: 'ExpensifyのデータをXeroへエクスポートする方法を設定します。',
            purchaseBill: '仕入請求書',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、以下のXero銀行口座に銀行取引として記帳され、取引日付は銀行取引明細書の日付と一致します。',
            bankTransactions: '銀行取引',
            travelInvoicingDescription: '旅費は、以下で指定したXeroアカウントに銀行取引としてエクスポートされます。',
            xeroBankAccount: 'Xero 銀行口座',
            bankAccount: '銀行口座',
            xeroBankAccountDescription: '経費を銀行取引として計上する先を選択してください。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで仕入請求書としてエクスポートされます。',
            purchaseBillDate: '仕入請求書の日付',
            exportInvoices: '請求書をエクスポート（形式）',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '売上請求書には、請求書を送信した日付が常に表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に Xero と同期します。',
                purchaseBillStatusTitle: '仕入請求書のステータス',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払予定が下記の Xero アカウントに作成されます。',
                xeroBillPaymentAccount: 'Xero請求書支払口座',
                xeroInvoiceCollectionAccount: 'Xero請求書回収勘定',
                xeroBillPaymentAccountDescription: '請求書の支払元を選択すると、Xero 内に支払処理を作成します。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、Xero に支払いが作成されます。',
            },
            exportDate: {
                label: '仕入請求書の日付',
                description: 'レポートをXeroにエクスポートする際にこの日付を使用します。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最新の経費の日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがXeroにエクスポートされた日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認申請として提出された日付。',
                    },
                },
            },
            invoiceStatus: {
                label: '仕入請求書のステータス',
                description: '購入請求書をXeroにエクスポートする際に、このステータスを使用します。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xero にアカウントを追加して、もう一度同期してください',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '立替経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払われた時点でエクスポートされます',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日',
                description: 'Sage Intacct へレポートをエクスポートする際は、この日付を使用します。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最新の経費の日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが Sage Intacct にエクスポートされた日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認申請として提出された日付。',
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
                description: '会社カードでの購入を Sage Intacct へどのようにエクスポートするかを設定します。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'クレジットカード',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '仕入先請求書',
                },
            },
            travelInvoicingDescription: '旅費は、以下で指定した Sage Intacct アカウントにクレジットカード請求としてエクスポートされます。',
            creditCardAccount: 'クレジットカード口座',
            defaultVendor: 'デフォルトのベンダー',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Sage Intacct で対応する仕入先がない ${isReimbursable ? '' : '非'}立替精算費用に適用されるデフォルトの仕入先を設定します。`,
            exportDescription: 'Expensify のデータを Sage Intacct へエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート先口座を設定している場合は、ドメイン管理者である必要もあります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントでエクスポート対象のレポートを確認できるようになります。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacct に口座を追加して、もう一度接続を同期してください`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensify は毎日自動的に Sage Intacct と同期します。',
            inviteEmployees: '従業員を招待',
            inviteEmployeesDescription:
                'Sage Intacct の従業員レコードをインポートし、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認となり、メンバーのページでさらに設定できます。',
            syncReimbursedReports: '精算済みレポートを同期',
            syncReimbursedReportsDescription: 'Expensify ACH を使ってレポートが支払われるたびに、対応する支払伝票が、下記の Sage Intacct アカウント内に作成されます。',
            paymentAccount: 'Sage Intacct の支払い口座',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '立替経費は最終承認時にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払われた時点でエクスポートされます',
                },
            },
        },
        certinia: {
            title: 'Certinia',
            titleFFA: 'Certinia (FFA)',
            titlePSA: 'Certinia (PSA)',
            company: '会社',
            autoSyncDescription: 'Expensify は毎日自動的に Certinia と同期します。',
            syncReimbursedReportsDescription: 'このオプションを有効にすると、FFA で買掛請求書が支払われるたびに、関連する Expensify レポートが自動的に精算済みとしてマークされます。',
            taxNonBillable: '税額を請求対象外としてエクスポート',
            taxNonBillableDescription: 'Expensify の税率でコード化された請求対象の経費をエクスポートする場合、Certinia PSA へのエクスポート時に税額部分は請求対象外としてマークされます。',
            foreignCurrencyAmount: '外貨金額をエクスポート',
            foreignCurrencyAmountDescription: '払い戻し対象の経費を経費レポートとしてエクスポートする場合、存在すれば各取引の元の外貨金額を Certinia にエクスポートします。',
            exportDescription: 'Expensify のデータを Certinia へエクスポートする方法を設定します。',
            payableInvoices: '支払対象の請求書',
            exportStatus: {
                label: '買掛請求書のステータス',
                values: {
                    [CONST.CERTINIA_EXPORT_STATUS.COMPLETE]: '完了',
                    [CONST.CERTINIA_EXPORT_STATUS.IN_PROGRESS]: '進行中',
                    [CONST.CERTINIA_EXPORT_STATUS.APPROVED]: '承認済み',
                    [CONST.CERTINIA_EXPORT_STATUS.SUBMITTED]: '送信済み',
                },
            },
            reportExportStatus: {
                label: '経費レポートステータス',
                values: {
                    [CONST.CERTINIA_REPORT_EXPORT_STATUS.APPROVED]: '承認済み',
                    [CONST.CERTINIA_REPORT_EXPORT_STATUS.SUBMITTED]: '送信済み',
                },
            },
            exportDate: {
                label: '支払予定請求書日',
                values: {
                    [CONST.CERTINIA_EXPORT_DATE.LAST_EXPENSE]: '最終経費日',
                    [CONST.CERTINIA_EXPORT_DATE.REPORT_SUBMITTED]: 'レポート提出日',
                    [CONST.CERTINIA_EXPORT_DATE.REPORT_EXPORTED]: 'エクスポート日',
                },
            },
            exportReimbursable: {label: '精算対象経費の書き出し形式', helperText: '払い戻し対象としてマークされた経費は、従業員宛ての未払請求書としてエクスポートされます。'},
            exportNonReimbursable: {label: '未払い精算の対象外経費を次の形式でエクスポートする'},
            expenseReports: '経費レポート',
            exportReimbursableExpenseReports: {helperText: '払い戻し対象としてマークされた経費は、従業員宛ての経費レポートとしてエクスポートされます。'},
            exportNonReimbursableExpenseReports: {helperText: '払い戻し対象外としてマークされた経費は、従業員宛ての経費レポートとしてエクスポートされます。'},
            noVendorsFound: 'ベンダーが見つかりませんでした',
            noVendorsFoundDescription: 'Certinia にベンダーを追加した後に、もう一度接続の同期を行ってください。',
            noCompaniesFound: '会社が見つかりませんでした',
            noCompaniesFoundDescription: 'Certinia に会社を追加した後に、もう一度接続の同期を行ってください。',
            prerequisites: {
                title: '接続する前に',
                installBundle: 'Expensify バンドルをインストールします',
                installBundlePSAHeader: 'PSA/SRP 接続の場合：',
                installBundlePSADescription: ({href, version}: {href: string; version: string}) =>
                    `このリンクをクリックして Salesforce に Expensify バンドルをインストールしてください：<a href="${href}">PSA/SRP Expensify バンドル（バージョン ${version}）をインストール</a>`,
                installBundleFFAHeader: 'FFA 接続用:',
                installBundleFFADescription: ({href, version}: {href: string; version: string}) =>
                    `このリンクをクリックして、Salesforce に Expensify バンドルをインストールしてください：<a href="${href}">FFA 用 Expensify バンドルをインストール（バージョン ${version}）</a>`,
                installBundleConfirm: 'バンドルをインストールしました',
                setupContacts: 'ユーザーと連絡先を設定',
                setupContactsBullet1:
                    'Certinia に、まだ存在しない場合は自分用のユーザーと連絡先の両方を作成し、メールアドレスが Expensify のプライマリメールと一致していることを確認します。',
                setupContactsBullet2:
                    '経費精算書を提出する従業員ごと、および各承認者ごとに連絡先を作成してください。各連絡先のメールアドレスが、その従業員の Expensify アカウントに登録されているメールアドレスと一致していることを確認してください。',
                setupContactsBullet3: '各連絡先／リソースごとにユーザーの権限を設定します。',
                setupContactsConfirm: 'ユーザーと連絡先を設定しました',
                oauth: 'Salesforce からログイン',
                oauthDescription: '設定を完了するには、Salesforce と Certinia を通じてサインインする必要があります。\n\n続行するには、下のボタンを使用してください。',
                connectButton: 'Certinia に接続',
            },
            import: {
                chartOfAccounts: '勘定科目表',
                chartOfAccountsDescription: '勘定科目表は、カテゴリとして Expensify にインポートされます。',
                dimensionMapping: ({n}: {n: number}) => `ディメンション ${n}`,
                dimensions: {dimension1: 'ディメンション 1', dimension2: 'ディメンション 2', dimension3: 'ディメンション 3', dimension4: 'ディメンション4'},
                doNotMap: 'マッピングしない',
                doNotMapSubtitle: '従業員リソースをデフォルトで使用する',
                mappingTypes: {
                    [CONST.CERTINIA_MAPPING_VALUE.DEFAULT]: 'マッピングしない',
                    [CONST.CERTINIA_MAPPING_VALUE.TAG]: 'タグとしてインポート済み',
                    [CONST.CERTINIA_MAPPING_VALUE.REPORT_FIELD]: 'レポートフィールドとしてインポートしました',
                },
                expenseTypeGlaMappings: '経費タイプのGLAマッピング',
                expenseTypeGlaMappingsDescription: 'FinancialForce の経費タイプ GLA マッピングは、Expensify にカテゴリとしてインポートされます。',
                tagsMappedTo: 'タグは次の項目にマッピングされます',
                milestones: 'マイルストーン',
                milestonesDescription: '有効にすると、PSA プロジェクトに関連付けられているマイルストーンが Expensify に同期されます。',
                parentTagMappingTypes: {
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS_AND_ASSIGNMENTS]: 'プロジェクトと割り当て',
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS]: 'プロジェクト',
                    [CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_ASSIGNMENTS]: 'アサインメント',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'データをインポートしたいNetSuiteの子会社を選択してください。',
            exportDescription: 'Expensify データを NetSuite へエクスポートする方法を設定します。',
            exportInvoices: '請求書のエクスポート先',
            journalEntriesTaxPostingAccount: '仕訳伝票の税金計上勘定',
            journalEntriesProvTaxPostingAccount: '仕訳の地方税計上勘定',
            foreignCurrencyAmount: '外貨金額をエクスポート',
            exportToNextOpenPeriod: '次の未締め期間にエクスポート',
            nonReimbursableJournalPostingAccount: '立替精算対象外の仕訳計上勘定',
            reimbursableJournalPostingAccount: '立替精算用仕訳計上勘定',
            journalPostingPreference: {
                label: '仕訳の記帳設定',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各経費につき1件の入力',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各レポートごとの単一の明細エントリ',
                },
            },
            invoiceItem: {
                label: '請求書アイテム',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '作成してください',
                        description: 'エクスポート時に（まだ存在しない場合は）「Expensify 請求書明細項目」を作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: 'Expensify の請求書を、下で選択した項目に紐付けます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日',
                description: 'NetSuite にレポートをエクスポートするときは、この日付を使用します。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最新の経費の日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが NetSuite にエクスポートされた日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認申請として提出された日付。',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '経費精算書',
                        reimbursableDescription: '自己負担経費は、経費レポートとして NetSuite にエクスポートされます。',
                        nonReimbursableDescription: '会社カードの経費は、経費レポートとして NetSuite にエクスポートされます。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '仕入先請求書',
                        reimbursableDescription: Str.dedent(`
                            立替経費は、以下で指定された NetSuite のベンダー宛ての支払対象請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に進んでください。
                        `),
                        nonReimbursableDescription: Str.dedent(`
                            会社カードの経費は、下記で指定した NetSuite のベンダーに支払う請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳伝票',
                        reimbursableDescription: Str.dedent(`
                            立替経費は、下記で指定された NetSuite 勘定科目に仕訳としてエクスポートされます。

                            各カードごとに特定の仕入先を設定したい場合は、*設定 > ドメイン > 会社カード* に進んでください。
                        `),
                        nonReimbursableDescription: Str.dedent(`
                            会社カードの経費は、以下で指定された NetSuite 勘定科目に仕訳としてエクスポートされます。

                            各カードごとに特定の取引先を設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        travelDescription: '出張費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。',
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに切り替えると、個々のカードに対するNetSuiteのベンダーおよび転記勘定は無効になります。\n\nご安心ください。後で元に戻したくなった場合に備えて、以前の選択内容は引き続き保存されます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に NetSuite と同期します。',
                reimbursedReportsDescription: 'Expensify ACH を使ってレポートが支払われるたびに、対応する支払伝票が下記の NetSuite アカウント内に作成されます。',
                reimbursementsAccount: '精算口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、対応する支払いが NetSuite に作成されます。',
                collectionsAccount: '回収勘定',
                collectionsAccountDescription: 'Expensify で請求書が支払済みとしてマークされ、NetSuite にエクスポートされると、以下の勘定科目に反映されます。',
                approvalAccount: '買掛金承認勘定',
                approvalAccountDescription:
                    'NetSuite で取引の承認先となる勘定科目を選択してください。払い戻し済みレポートを同期している場合は、請求書支払の作成先となる勘定科目にもなります。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定',
                inviteEmployeesDescription:
                    'NetSuite の従業員レコードをインポートして、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認となり、さらに *メンバー* ページで設定を変更できます。',
                autoCreateEntities: '従業員/取引先を自動作成',
                enableCategories: '新しくインポートされたカテゴリを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定された優先トランザクションフォームを使用して仕訳を作成します。必要に応じて、使用する特定のトランザクションフォームを指定することもできます。',
                customFormIDReimbursable: '立替経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費精算書の承認レベル',
                    description: '経費精算書がExpensifyで承認されNetSuiteへエクスポートされると、仕訳計上前にNetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '上司承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '経理承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '上長および経理が承認済み',
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
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '立替経費は最終承認時にエクスポートされます',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '自己負担経費は支払われた時点でエクスポートされます',
                    },
                },
                exportVendorBillsTo: {
                    label: '仕入先請求書の承認レベル',
                    description: 'Expensifyでベンダー請求書が承認されてNetSuiteにエクスポートされると、仕訳の記帳前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '掲載承認済み',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensify で振替伝票が承認され NetSuite にエクスポートされると、仕訳を記帳する前に NetSuite 側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '掲載承認済み',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォームIDを入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuite にアカウントを追加して、接続をもう一度同期してください',
            noVendorsFound: 'ベンダーが見つかりません',
            noVendorsFoundDescription: 'NetSuite に仕入先を追加して、接続をもう一度同期してください',
            noItemsFound: '請求書項目が見つかりません',
            noItemsFoundDescription: 'NetSuite で請求書アイテムを追加し、接続をもう一度同期してください',
            noSubsidiariesFound: '子会社が見つかりません',
            noSubsidiariesFoundDescription: 'NetSuite に子会社を追加して、もう一度接続を同期してください',
            tokenInput: {
                title: 'NetSuite のセットアップ',
                formSteps: {
                    installBundle: {
                        title: 'Expensify バンドルをインストール',
                        description: 'NetSuite で、*Customization > SuiteBundler > Search & Install Bundles* に移動し、「Expensify」を検索してバンドルをインストールしてください。',
                    },
                    enableTokenAuthentication: {
                        title: 'トークンベース認証を有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に移動し、*token-based authentication* を有効にします。',
                    },
                    enableSoapServices: {
                        title: 'SOAP Web サービスを有効化',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に移動し、*SOAP Web Services* を有効にします。',
                    },
                    createAccessToken: {
                        title: 'アクセス トークンを作成',
                        description:
                            'NetSuite で、*Setup > Users/Roles > Access Tokens* に進み、「Expensify」アプリと、「Expensify Integration」または「Administrator」ロールのいずれかに対してアクセストークンを作成します。\n\n*重要：* この手順で表示される *Token ID* と *Token Secret* を必ず保存してください。次の手順で必要になります。',
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
                crossSubsidiaryCustomers: '複数子会社間の顧客／プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'Expensify で NetSuite の *departments* をどのように扱うか選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensify で「クラス」をどのように扱うかを選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensify で *所在地* をどのように扱うかを選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客／プロジェクト',
                    subtitle: 'Expensify で NetSuite の「顧客」と「プロジェクト」をどのように扱うかを選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: (importFields: string[], importType: string) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite から税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下からオプションを選択:',
                    label: (importedTypes: string[]) => `${importedTypes.join('と')}としてインポートされました`,
                    requiredFieldError: (fieldName: string) => `${fieldName}を入力してください`,
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
                            internalID: '内部ID',
                            scriptID: 'スクリプトID',
                            customRecordScriptID: '取引列ID',
                            mapping: '表示形式',
                        },
                        removeTitle: 'カスタムセグメント / レコードを削除',
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

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customRecordNameFooter: `グローバル検索で「Transaction Column Field」と入力すると、NetSuite 内でカスタムレコード名を確認できます。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})。_`,
                            customSegmentInternalIDTitle: '内部IDは何ですか？',
                            customSegmentInternalIDFooter: `まず、NetSuite で内部 ID が有効になっていることを確認してください（*Home > Set Preferences > Show Internal ID*）。

カスタムセグメントの内部 ID は、NetSuite で次の場所から確認できます。

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 任意のカスタムセグメントをクリックします。
3. *Custom Record Type* の横にあるハイパーリンクをクリックします。
4. 画面下部のテーブルから内部 ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordInternalIDFooter: `次の手順で、NetSuite でカスタムレコードの内部 ID を確認できます。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. 任意のカスタムレコードをクリックします。
3. 左側に表示されている内部 ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentScriptIDTitle: 'スクリプトIDは何ですか？',
                            customSegmentScriptIDFooter: `NetSuite でカスタムセグメントのスクリプト ID を確認するには、次の手順に従ってください:

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックします。
3. 画面下部付近の *Application and Sourcing* タブをクリックし、次のいずれかを行います:
    a. Expensify でカスタムセグメントを（明細行レベルで）*タグ*として表示したい場合は、*Transaction Columns* サブタブをクリックし、*Field ID* を使用します。
    b. Expensify でカスタムセグメントを（レポートレベルで）*レポートフィールド*として表示したい場合は、*Transactions* サブタブをクリックし、*Field ID* を使用します。

_さらに詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            customRecordScriptIDTitle: '取引列のIDは何ですか？',
                            customRecordScriptIDFooter: `NetSuite でカスタムレコードのスクリプト ID を見つけるには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されているスクリプト ID を探します。

_より詳細な手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_。`,
                            customSegmentMappingTitle: 'このカスタムセグメントを Expensify でどのように表示しますか？',
                            customRecordMappingTitle: 'このカスタムレコードを Expensify ではどのように表示しますか？',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `この ${fieldName?.toLowerCase()} を持つカスタムセグメント／レコードはすでに存在します`,
                        },
                    },
                    customLists: {
                        title: 'カスタムリスト',
                        addText: 'カスタムリストを追加',
                        recordTitle: 'カスタムリスト',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '詳しい手順を表示',
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
                            transactionFieldIDTitle: '取引フィールドIDは何ですか？',
                            transactionFieldIDFooter: `次の手順で、NetSuite でトランザクションフィールド ID を確認できます。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムリストをクリックして開きます。
3. 左側に表示されているトランザクションフィールド ID を探します。

_詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_。`,
                            mappingTitle: 'このカスタムリストは Expensify でどのように表示しますか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールドIDを使用したカスタムリストはすでに存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite 従業員のデフォルト',
                        description: 'Expensify にはインポートされず、エクスポート時に適用されます',
                        footerContent: (importField: string) =>
                            `NetSuiteで${importField}を使用している場合、経費レポートまたは仕訳帳へのエクスポート時に、従業員レコードに設定されているデフォルトを適用します。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: '明細レベル',
                        footerContent: (importField: string) => `${startCase(importField)} は、従業員のレポート内の各経費ごとに選択できるようになります。`,
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
            followSteps: '「操作ガイド：Sage Intacct への接続手順」に従って進めてください',
            enterCredentials: 'Sage Intacct の認証情報を入力してください',
            entity: 'エンティティ',
            employeeDefault: 'Sage Intacct 従業員のデフォルト',
            employeeDefaultDescription: 'Sage Intacct に部門が設定されている場合は、その従業員の既定の部門が経費に適用されます。',
            displayedAsTagDescription: '部署は、従業員のレポート上の各経費ごとに選択できるようになります。',
            displayedAsReportFieldDescription: '部門の選択は、従業員のレポート内のすべての経費に適用されます。',
            toggleImportTitle: (mappingTitle: string) => `Expensify で Sage Intacct の <strong>${mappingTitle}</strong> をどのように処理するか選択してください。`,
            expenseTypes: '経費の種類',
            expenseTypesDescription: 'Sage Intacct の経費タイプは、Expensify にはカテゴリとしてインポートされます。',
            accountTypesDescription: 'Sage Intacctの勘定科目表は、Expensifyにカテゴリとしてインポートされます。',
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
            detailedInstructionsRestOfSentence: 'ユーザー定義ディメンションの追加について',
            userDimensionsAdded: () => ({
                one: '1件のUDDを追加しました',
                other: (count: number) => `${count} 件のUDDを追加しました`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部門';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'クラス';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '所在地';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '顧客';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'プロジェクト（ジョブ）';
                    default:
                        return 'マッピング';
                }
            },
        },
        rillet: {
            rilletSetup: 'Rillet のセットアップ',
            enterCredentials: 'Rillet の API キーを入力してください',
            howToFindAPIKey:
                '<strong>API キーの確認方法</strong><ol><li>Rillet にログインします</li><li>［Account］→［Settings］に移動します</li><li>以下の API キーをコピーします</li></ol>',
            subsidiary: '子会社',
            subsidiarySelectDescription: 'データをインポートしたい Rillet 内の子会社を選択してください。',
            noSubsidiariesFound: '子会社が見つかりません',
            noSubsidiariesFoundDescription: 'Rillet に子会社を追加して、もう一度接続を同期してください',
        },
        type: {
            free: '無料',
            control: 'コントロール',
            collect: '回収',
            submit: '提出',
        },
        companyCards: {
            addCards: 'カードを追加',
            selectCards: 'カードを選択',
            fromOtherWorkspaces: '他のワークスペースから',
            addWorkEmail: 'あなたの勤務用メールアドレスを追加',
            addWorkEmailDescription: '他のワークスペースの既存フィードを使用するには、勤務用メールアドレスを追加してください。',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'カードフィードを読み込めませんでした',
                workspaceFeedsCouldNotBeLoadedMessage: 'ワークスペースカードフィードの読み込み中にエラーが発生しました。もう一度お試しいただくか、管理者にお問い合わせください。',
                feedCouldNotBeLoadedTitle: 'このフィードを読み込めませんでした',
                feedCouldNotBeLoadedMessage: 'このフィードの読み込み中にエラーが発生しました。もう一度お試しいただくか、管理者にお問い合わせください。',
                tryAgain: '再試行',
            },
            addNewCard: {
                other: 'その他',
                fileImport: 'ファイルから取引をインポート',
                createFileFeedHelpText: `<muted-text>会社カードの経費をインポートするには、この<a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">ヘルプガイド</a>に従ってください。</muted-text>`,
                companyCardLayoutName: '法人カードレイアウト名',
                cardLayoutNameRequired: '法人カードレイアウト名は必須です',
                useAdvancedFields: '詳細フィールドを使用（非推奨）',
                cardProviders: {
                    gl1025: 'American Express コーポレートカード',
                    cdf: 'Mastercard コマーシャルカード',
                    vcf: 'Visaコマーシャルカード',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `カードの発行会社はどこですか？`,
                whoIsYourBankAccount: 'ご利用の銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: '銀行口座にはどのように接続しますか？',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>について詳しく見る。</muted-text>`,
                commercialFeedDetails: '銀行での設定が必要です。通常は大企業で利用されており、条件を満たす場合は最適な選択肢となることが多いです。',
                commercialFeedPlaidDetails: `ご利用の銀行での設定が必要ですが、こちらで手順をご案内します。通常は大企業のみが対象となります。`,
                directFeedDetails: '最もシンプルな方法です。マスター認証情報を使ってすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: (provider: string) => `${provider}フィードを有効にする`,
                    heading: 'あなたのカード発行会社と直接連携しているため、取引データを迅速かつ正確にExpensifyへ取り込むことができます。\n\n開始するには、次のステップに従ってください。',
                    visa: 'Visa とはグローバルに連携していますが、利用資格は銀行やカードプログラムによって異なります。\n\n開始するには、次のステップに従ってください。',
                    mastercard: 'Mastercard とはグローバルに連携していますが、利用できるかどうかは銀行やカードプログラムによって異なります。\n\n開始するには、次の手順に従ってください。',
                    vcf: `1. Visa商用カードの設定方法についての詳しい手順は、[このヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。

2. ご利用のプログラムで商用フィードがサポートされているか確認し、有効化を依頼するために、[銀行に連絡](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})してください。

3. *フィードが有効になり、その詳細がわかったら、次の画面に進んでください。*`,
                    gl1025: `1. ご利用のプログラムで American Express が商用フィードを有効にできるか確認するには、[このヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})をご覧ください。

2. フィードが有効になると、Amex から本番用レターが送付されます。

3. *フィード情報を取得したら、次の画面に進んでください。*`,
                    cdf: `1. Mastercard Commercial Cards を設定するための詳しい手順については、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。

2. ご利用のプログラムで商用フィードに対応しているかを確認し、有効化を依頼するために、[銀行に問い合わせてください](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})。

3. *フィードが有効になり、その詳細が分かったら、次の画面へ進んでください。*`,
                    stripe: `1. Stripe のダッシュボードにアクセスし、[Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}) に進みます。

2. 「Product Integrations」の下で、Expensify の横にある「Enable」をクリックします。

3. フィードが有効になったら、下の「送信」をクリックしてください。追加作業を進めます。`,
                },
                whatBankIssuesCard: 'これらのカードはどの銀行が発行していますか？',
                enterNameOfBank: '銀行名を入力',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細は何ですか？',
                        processorLabel: 'プロセッサーID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社ID',
                        helpLabel: 'これらのIDはどこで確認できますか？',
                    },
                    gl1025: {
                        title: `Amex配信用ファイル名は何ですか？`,
                        fileNameLabel: '配信用ファイル名',
                        helpLabel: '配信用ファイル名はどこで確認できますか？',
                    },
                    cdf: {
                        title: `Mastercardの配布IDは何ですか？`,
                        distributionLabel: '配布 ID',
                        helpLabel: '配布 ID はどこで確認できますか？',
                    },
                },
                amexCorporate: 'カードの表面に「Corporate」と印字されている場合は、これを選択してください',
                amexBusiness: 'カードの表面に「Business」と書かれている場合に選択してください',
                amexPersonal: 'カードが個人用の場合はこれを選択',
                error: {
                    pleaseSelectProvider: '続行する前にカードプロバイダーを選択してください',
                    pleaseSelectBankAccount: '続行する前に銀行口座を選択してください',
                    pleaseSelectBank: '続行する前に銀行を選択してください',
                    pleaseSelectCountry: '続行する前に国を選択してください',
                    pleaseSelectFeedType: '続行する前にフィードの種類を選択してください',
                },
                exitModal: {
                    title: 'うまく動作していませんか？',
                    prompt: 'カードの追加が完了していないようです。問題が見つかった場合はお知らせください。元どおりスムーズに進められるようお手伝いします。',
                    confirmText: '問題を報告',
                    cancelText: 'スキップ',
                },
                csvColumns: {
                    cardNumber: 'カード番号',
                    postedDate: '日付',
                    merchant: '加盟店',
                    amount: '金額',
                    currency: '通貨',
                    ignore: '無視',
                    originalTransactionDate: '元の取引日',
                    originalAmount: '元の金額',
                    originalCurrency: '元の通貨',
                    comment: 'コメント',
                    category: 'カテゴリ',
                    tag: 'タグ',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `各属性に列を割り当ててください：${missingColumns}`,
                    duplicateColumns: (duplicateColumn: string) => `おっと！1 つのフィールド（"${duplicateColumn}"）を複数の列にマッピングしています。確認して、もう一度お試しください。`,
                },
                fileImportDescription: '銀行からフィードを送信できない場合の手動オプションです。',
                duplicateFeedModal: {title: 'カードフィードはすでに接続されています', prompt: '同じカードフィードを同じワークスペースに二重に追加することはできません。'},
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '月末最終日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '月末最終営業日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'カスタム日付（毎月）',
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
                `<strong>${assignee}</strong> に割り当てるカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードに有効なカードはありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>もしくは不具合が発生している可能性があります。いずれにせよ、ご不明な点があれば、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択',
            startDateDescription: 'インポート開始日を選択してください。この日付以降のすべての取引を同期します。',
            editStartDateDescription: '新しい取引開始日を選択してください。その日以降のすべての取引を、すでに取り込んだものを除いて同期します。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタム締め日',
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            confirmationDescription: 'ただちに取引のインポートを開始します。',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィード接続が切断されています。再度接続を確立するため、<a href="#">銀行にログイン</a>してください。</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} に ${link} を割り当てました！取り込まれた取引はこのチャットに表示されます。`,
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limited は Plaid Financial Ltd. の代理人であり、Plaid Financial Ltd. は 2017 年決済サービス規則（Payment Services Regulations 2017）に基づき金融行為監督機構（Financial Conduct Authority）の規制を受ける認可決済機関です（会社登録番号：804718）。Plaid は、その代理人である Expensify Limited を通じて、お客様に規制対象である口座情報サービスを提供します。',
            deletedFeed: '削除済みフィード',
            assignCardFailedError: 'カードの割り当てに失敗しました。',
            unassignCardFailedError: 'カードの割り当て解除に失敗しました。',
            cardAlreadyAssignedError: 'このカードは、別のワークスペースのユーザーにすでに割り当てられています。',
            importTransactions: {
                title: 'ファイルから取引をインポート',
                description: 'インポート時に適用されるファイルの設定を調整してください。',
                cardDisplayName: 'カード表示名',
                currency: '通貨',
                transactionsAreReimbursable: '取引は精算対象です',
                flipAmountSign: '金額の符号を反転',
                importButton: '取引をインポート',
            },
            deletedCard: '削除されたカード',
            assignNewCards: {title: '新しいカードを割り当てる', description: '銀行から割り当て可能な最新のカードを取得します'},
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify カードを発行して管理する',
            getStartedIssuing: 'まずは最初のバーチャルカードまたは物理カードを発行しましょう。',
            verificationInProgress: '確認を進めています…',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensify カードを発行できる準備が整いましたら、Concierge からお知らせします。',
            disclaimer:
                'Expensify Visa® コマーシャルカードは、Visa U.S.A. Inc. からのライセンスに基づき、The Bancorp Bank, N.A.（FDIC メンバー）によって発行されており、Visa カードを受け付けるすべての加盟店で利用できるとは限りません。Apple® および Apple ロゴ® は、米国およびその他の国において登録された Apple Inc. の商標です。App Store は Apple Inc. のサービスマークです。Google Play および Google Play ロゴは、Google LLC の商標です。',
            euUkDisclaimer:
                'EEA在住者に提供されるカードはTransact Payments Malta Limitedによって発行され、英国在住者に提供されるカードはVisa Europe Limitedのライセンスに基づきTransact Payments Limitedによって発行されます。Transact Payments Malta Limitedは、Financial Institution Act 1994に基づく金融機関としてマルタ金融サービス庁に正式に認可・監督されています。登録番号C 91879。Transact Payments Limitedは、ジブラルタル金融サービス委員会の認可および監督を受けています。',
            issueCard: 'カードを発行',
            findCard: 'カードを探す',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '下4桁',
            limit: '上限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在残高は、前回の精算日以降に発生し記帳されたすべての Expensify カード取引の合計です。',
            balanceWillBeSettledOn: (settlementDate: string) => `残高は${settlementDate}に精算されます`,
            settleBalance: '残高を清算',
            cardLimit: 'カード上限',
            remainingLimit: '残りの上限',
            requestLimitIncrease: 'リクエスト上限の引き上げ',
            remainingLimitDescription:
                '残りの限度額を算出する際には、お客様としてのご利用期間、登録時にご提供いただいた事業関連情報、およびビジネス用銀行口座の利用可能残高など、複数の要素を考慮します。残りの限度額は日々変動する可能性があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース内で決済済みの月間 Expensify カード利用額に基づいています。',
            issueNewCard: '新しいカードを発行',
            finishSetup: 'セットアップを完了',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: '既存のビジネス銀行口座を選んで Expensify カードの残高を支払うか、新しい銀行口座を追加してください',
            accountEndingIn: '末尾が…の口座',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '決済口座',
            settlementAccountDescription: 'Expensify カードの残高を支払う口座を選択してください。',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `継続照合が正しく機能するように、この口座が<a href="${reconciliationAccountSettingsLink}">照合用口座</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '清算頻度',
            settlementFrequencyDescription: 'Expensify カードの残高を支払う頻度を選択してください。',
            settlementFrequencyInfo: '月次清算に切り替えるには、Plaid を通じて銀行口座を連携し、直近90日間の残高履歴がプラスである必要があります。',
            applyCashbackToBill: 'キャッシュバックを Expensify 請求書に適用する',
            applyCashbackToBillDescription: 'Expensify カードのキャッシュバックは、Expensify 請求書の支払いに使用されます。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カード情報',
            virtual: 'バーチャル',
            physical: '物理',
            deactivate: 'カードを無効化',
            changeCardLimit: 'カード上限を変更',
            changeLimit: '上限を変更',
            smartLimitWarning: (limit: number | string) => `このカードの利用限度額を${limit}に変更すると、カード上の経費をさらに承認するまで、新しい取引は承認されません。`,
            monthlyLimitWarning: (limit: number | string) => `このカードの上限を${limit}に変更すると、来月まで新規取引は承認されません。`,
            fixedLimitWarning: (limit: number | string) => `このカードの利用限度額を${limit}に変更すると、新しい取引は拒否されます。`,
            changeCardLimitType: 'カード上限タイプを変更',
            changeLimitType: '上限タイプを変更',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `このカードの上限タイプをSmart Limitに変更すると、未承認の上限額 ${limit} にすでに達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `このカードの限度額タイプを「月次」に変更すると、すでに月間限度額 ${limit} に達しているため、新しい取引は拒否されます。`,
            addShippingDetails: '配送先の詳細を追加',
            addPersonalDetails: '個人情報を追加',
            issuedCard: (assignee: string) => `${assignee} に Expensify カードを発行しました。カードは 2〜3 営業日以内に到着します。`,
            issuedCardNoShippingDetails: (assignee: string) => `${assignee} に Expensify カードを発行しました。配送先の詳細が確認され次第、カードを発送します。`,
            issuedCardVirtual: (assignee: string, link: string) => `${assignee} にバーチャル Expensify カードを発行しました！${link} はすぐにご利用いただけます。`,
            addedShippingDetails: (assignee: string) => `${assignee} さんが配送先情報を追加しました。Expensify カードは営業日2～3日で届きます。`,
            replacedCard: (assignee: string) => `${assignee} さんが Expensify カードを再発行しました。新しいカードは 2〜3 営業日以内に到着します。`,
            replacedVirtualCard: (assignee: string, link: string) => `${assignee} はバーチャル Expensify カードを再発行しました！${link} はすぐにご利用いただけます。`,
            card: 'カード',
            replacementCard: '再発行カード',
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座が確認されました',
            verifyingBankAccount: '銀行口座を確認しています…',
            verifyingBankAccountDescription: 'このアカウントで Expensify カードを発行できるか確認しています。しばらくお待ちください。',
            bankAccountVerified: '銀行口座が認証されました！',
            bankAccountVerifiedDescription: 'ワークスペースのメンバーに Expensify カードを発行できるようになりました。',
            oneMoreStep: 'あともう一歩…',
            oneMoreStepDescription: '銀行口座を手動で確認する必要があるようです。指示が表示されていますので、Concierge 画面に進んでください。',
            gotIt: '了解しました',
            goToConcierge: 'Concierge へ移動',
            exportAsCSV: 'CSVでエクスポート',
            csvColumnType: 'タイプ',
            csvColumnLimitType: '限度タイプ',
            csvColumnLimit: '限度額',
        },
        categories: {
            deleteCategories: 'カテゴリを削除',
            deleteCategoriesPrompt: 'これらのカテゴリを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリを無効にする',
            disableCategory: 'カテゴリを無効にする',
            enableCategories: 'カテゴリを有効にする',
            enableCategory: 'カテゴリを有効化',
            defaultSpendCategories: 'デフォルト支出カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引とスキャンしたレシートについて、加盟店の支出がどのように分類されるかをカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください',
            categoryName: 'カテゴリ名',
            requiresCategory: 'メンバーはすべての経費を分類する必要があります',
            needCategoryForExportToIntegration: (connectionName: string) => `${connectionName} にエクスポートするには、すべての経費にカテゴリを指定する必要があります。`,
            subtitle: 'お金がどこで使われているかを、より分かりやすく把握しましょう。デフォルトのカテゴリを使うか、自分用のカテゴリを追加できます。',
            emptyCategories: {
                title: 'カテゴリはまだありません',
                subtitle: '支出を整理するカテゴリを追加してください。',
                subtitleWithAccounting: (accountingPageURL: string, canManage = true) =>
                    `<muted-text><centered-text>現在、お客様のカテゴリは会計連携からインポートされています。${canManage ? `変更するには、<a href="${accountingPageURL}">会計</a>に移動してください。` : ''}</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリの更新中にエラーが発生しました。もう一度お試しください。',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください。',
            addCategory: 'カテゴリを追加',
            editCategory: 'カテゴリーを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを検索',
            categoryRequiredError: 'カテゴリ名は必須です',
            existingCategoryError: 'この名前のカテゴリーはすでに存在します',
            invalidCategoryName: '無効なカテゴリ名',
            importedFromAccountingSoftware: '次のカテゴリは、あなたの〜からインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリを削除または無効にすることはできません',
                description: `ワークスペースでカテゴリが必須のため、少なくとも1つのカテゴリは有効のままにする必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: 'ビジネスの成長に合わせて、下の切り替えスイッチでさらに多くの機能を有効にしましょう。各機能はナビゲーションメニューに表示され、さらにカスタマイズできます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームの拡大を支援する機能を有効にする',
            },
            manageSection: {
                title: '管理',
                subtitle: '支出を予算内に収めるための管理機能を追加する。',
            },
            earnSection: {
                title: '獲得',
                subtitle: '収益を効率化して、より早く入金を受け取りましょう。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '支出をグループ化して分析し、支払ったすべての税金を記録します。',
            },
            integrateSection: {
                title: '連携する',
                subtitle: 'Expensify を人気の金融サービスに接続しましょう。',
            },
            distanceRates: {
                title: '距離単価',
                subtitle: 'レートを追加、更新し、適用します。',
            },
            perDiem: {
                title: '日当',
                subtitle: '日当料金を設定して、従業員の1日あたりの支出を管理しましょう。',
            },
            travel: {
                title: '出張',
                subtitle: '出張の予約、管理、精算をすべて一元管理。',
                disableTravelTitle: '先に一括旅行請求をオフにしてください',
                disableTravelPrompt: 'このワークスペースでは一括出張請求が有効になっています。Travel を無効にする前に、一括出張請求をオフにしてください。',
                disableTravelButton: '出張設定に移動します',
                getStarted: {
                    title: 'Expensify Travel を使い始める',
                    subtitle: 'ビジネスについてあと少しだけ情報を教えてください。準備が整い次第、すぐに開始できます。',
                    ctaText: '始めよう',
                },
                reviewingRequest: {
                    title: '荷造りをしておいてください。ご依頼の準備ができました…',
                    subtitle: '現在、Expensify Travel の有効化リクエストを確認中です。準備が整い次第、お知らせしますのでご安心ください。',
                    ctaText: 'リクエストを送信しました',
                },
                bookOrManageYourTrip: {title: '出張予約', subtitle: 'おめでとうございます！このワークスペースで旅行の予約と管理を行う準備が整いました。', ctaText: '出張を管理'},
                settings: {autoAddTripName: {title: '経費に出張名を追加', subtitle: 'Expensifyで予約した出張について、経費の説明に出張名を自動的に追加します。'}},
                travelInvoicing: {
                    travelBookingSection: {
                        title: '出張予約',
                        subtitle: 'おめでとうございます！このワークスペースで旅行の予約と管理を行う準備ができました。',
                        manageTravelLabel: '出張を管理',
                    },
                    travelInvoicingSection: {
                        title: '出張費の一括請求',
                        subtitle: '購入時に都度支払うのではなく、すべての出張費用を月次請求書に集約して管理します。',
                        learnHow: '詳しく見る',
                        subsections: {
                            currentTravelSpendLabel: '現在の出張費支出',
                            currentTravelSpendPaymentQueued: (amount: string) => `${amount} の支払いはキューに登録されており、まもなく処理されます。`,
                            currentTravelSpendCta: '残高を支払う',
                            currentTravelLimitLabel: '現在の出張上限',
                            settlementAccountLabel: '決済口座',
                            settlementFrequencyLabel: '清算頻度',
                            settlementFrequencyDescription: 'Expensify が直近の Expensify Travel 取引を精算するために、あなたのビジネス銀行口座から資金を引き落とす頻度。',
                            monthlySpendLimitLabel: 'メンバーごとの月間支出上限',
                            monthlySpendLimitDescription: '各メンバーが1か月に出張に使える最大金額。',
                            reduceLimitTitle: '出張支出上限を引き下げますか？',
                            reduceLimitWarning: 'この上限を引き下げると、すでにこの金額を超えて支出しているメンバーは、翌月まで新しい出張予約ができなくなります。',
                            provisioningError:
                                'ワークスペース内の一部メンバーに対して、Consolidated Travel Billing を有効化できませんでした。時間をおいてもう一度お試しいただくか、サポートが必要な場合は Concierge までお問い合わせください。',
                        },
                    },
                    disableModal: {
                        title: '一括旅行請求をオフにしますか？',
                        body: '今後のホテルおよびレンタカーの予約は、キャンセルを避けるために別のお支払い方法で再予約する必要がある場合があります。',
                        confirm: 'オフにする',
                    },
                    outstandingBalanceModal: {title: '統合トラベル請求をオフにできません', body: '未清算の出張残高があります。先に残高を精算してください。', confirm: '了解しました'},
                    payBalanceModal: {
                        title: (amount: string) => `残高 ${amount} を支払いますか？`,
                        body: '支払いはキューに追加され、その後まもなく処理されます。この操作は一度開始すると元に戻すことはできません。',
                    },
                    exportToPDF: 'PDF にエクスポート',
                    exportToCSV: 'CSV にエクスポート',
                    selectDateRangeError: 'エクスポートする日付範囲を選択してください',
                    invalidDateRangeError: '開始日は終了日より前でなければなりません',
                    enabled: '一括出張請求が有効になりました！',
                    enabledDescription: 'このワークスペースでの出張費用は、今後すべて月次の請求書に集約されます。',
                },
                personalDetailsDescription: '旅行を予約するために、政府発行の身分証明書に記載されているとおりの正式な氏名を入力してください。',
            },
            expensifyCard: {
                title: 'Expensify カード',
                subtitle: '支出を把握し、コントロールしましょう。',
                disableCardTitle: 'Expensify カードを無効にする',
                disableCardPrompt: 'Expensify カードはすでに使用中のため、無効にすることはできません。今後の対応については Concierge までお問い合わせください。',
                disableCardButton: 'Conciergeとチャット',
                feed: {
                    title: 'Expensify カードを入手する',
                    subTitle: '経費精算を効率化してExpensifyの請求額を最大50％節約し、さらに以下の特典も利用できます。',
                    features: {
                        cashBack: '米国内でのすべての購入にキャッシュバック',
                        unlimited: '無制限のバーチャルカード',
                        spend: '支出管理とカスタム上限設定',
                    },
                    ctaTitle: '新しいカードを発行',
                },
            },
            companyCards: {
                title: '会社カード',
                subtitle: 'お持ちのカードを連携しましょう。',
                feed: {
                    title: '自分のカードを持ち込む（BYOC）',
                    subtitle: '自動取引取り込み、領収書の照合、照合作業のために、すでにお持ちのカードをリンクしましょう。',
                    features: {
                        support: '10,000以上の銀行のカードを連携',
                        assignCards: 'チームの既存カードを連携する',
                        automaticImport: '取引を自動的に取り込みます',
                    },
                },
                bankConnectionError: '銀行接続の問題',
                connectWithPlaid: 'Plaid 経由で接続',
                connectWithExpensifyCard: 'Expensify カードをお試しください。',
                bankConnectionDescription: `もう一度カードの追加をお試しください。それでも解決しない場合は、次の方法をお試しください。`,
                disableCardTitle: '法人カードを無効化',
                disableCardPrompt: 'この機能が使用中のため、会社カードは無効にできません。今後の対応についてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeとチャット',
                cardDetails: 'カード情報',
                cardNumber: 'カード番号',
                cardholder: 'カード名義人',
                cardName: 'カード名',
                allCards: 'すべてのカード',
                assignedCards: '割り当て済み',
                unassignedCards: '未割り当て',
                integrationExport: (integration: string, type?: string) => (integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`),
                integrationExportTitleXero: (integration: string) => `取引のエクスポート先となる${integration}の口座を選択してください。`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `取引をエクスポートする${integration}アカウントを選択してください。利用可能なアカウントを変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択してください。`,
                lastUpdated: '最終更新日時',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当てを解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、未送信の取引はすべて削除されます。',
                removeCard: 'カードを削除',
                remove: '削除',
                removeCardDescription: 'このカードを削除すると、未送信のすべての取引が削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: '他のカードフィードと区別できるように、一意の名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択してください。新しい取引にはこのルールが適用されます。',
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
                setFeedNameDescription: '他と区別できるように、カードフィードに一意の名前を付けてください',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できるようになります。新しい取引にもこのルールが適用されます。',
                emptyAddedFeedTitle: 'このフィードにはカードがありません',
                emptyAddedFeedDescription: '銀行のカード明細フィードにカードが含まれていることを確認してください。',
                pendingFeedTitle: `リクエストを確認しています…`,
                pendingFeedDescription: `現在、お客さまのフィードの詳細を確認しています。完了し次第、次の方法でご連絡します：`,
                pendingBankTitle: 'ブラウザウィンドウを確認してください',
                pendingBankDescription: (bankName: string) => `先ほど開いたブラウザウィンドウで${bankName}に接続してください。もしウィンドウが開かなかった場合は、`,
                pendingBankLink: 'ここをクリックしてください',
                giveItNameInstruction: 'ほかのカードと区別できる名前を付けてください。',
                updating: '更新中...',
                neverUpdated: '決してない',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `このワークスペースには複数のカードフィード（Expensify カードを除く）が接続されているため、ダウングレードできません。続行するには、<a href="#">カードフィードを1つだけ残す</a>ようにしてください。`,
                noAccountsFoundDescription: (connection: string) => `${connection} にアカウントを追加して、もう一度接続を同期してください`,
                expensifyCardBannerTitle: 'Expensify カードを入手する',
                expensifyCardBannerSubtitle:
                    '米国内でのあらゆるご利用でキャッシュバックを獲得し、Expensify の請求額を最大 50% 割引、無制限のバーチャルカードなど、さらに多くの特典をご利用いただけます。',
                expensifyCardBannerLearnMoreButton: '詳細はこちら',
                statementCloseDateTitle: '取引明細書の締め日',
                statementCloseDateDescription: 'カード明細の締め日を教えていただければ、Expensify 内に対応する明細を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認と支払い方法を設定します。',
                disableApprovalPrompt:
                    'このワークスペースの Expensify カードは現在、Smart Limits を設定するために承認フローに依存しています。承認を無効にする前に、Smart Limits が設定されている Expensify カードの上限タイプを変更してください。',
            },
            invoices: {
                title: '請求書',
                subtitle: '請求書を送受信する。',
            },
            categories: {
                title: 'カテゴリ',
                subtitle: '支出を記録して整理しましょう。',
            },
            tags: {
                title: 'タグ',
                subtitle: 'コストを分類し、請求可能な経費を追跡します。',
            },
            taxes: {
                title: '税金',
                subtitle: '対象となる税金を記録して払い戻しを受けましょう。',
            },
            reportFields: {
                title: 'レポート項目',
                subtitle: '支出用のカスタムフィールドを設定する',
            },
            connections: {
                title: '会計',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: '領収書パートナー',
                subtitle: '領収書を自動で取り込みます。',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計機能を無効にするには、ワークスペースから会計連携を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber との連携を解除',
                disconnectText: 'この機能を無効にするには、まず Uber for Business の連携を解除してください。',
                description: 'この連携を解除してもよろしいですか？',
                confirmText: '了解しました',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText:
                    'このワークスペースの Expensify カードは、Smart Limit を設定するために承認ワークフローに依存しています。\n\nワークフローを無効にする前に、Smart Limit が設定されているカードの上限タイプを変更してください。',
                confirmText: 'Expensify カードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: '領収書の提出を必須にし、高額支出にフラグを付けるなど、さまざまな設定ができます。',
            },
            timeTracking: {
                title: '時間',
                subtitle: '時間追跡用の請求可能な時間単価を設定します。',
                defaultHourlyRate: 'デフォルトの時給率',
            },
            hrWarningModal: {disconnectText: ({integration}: {integration: string}) => `HR を無効にするには、まずこのワークスペースから ${integration} を切断してください。`},
        },
        reports: {
            reportsCustomTitleExamples: '例:',
            customReportNamesSubtitle: `<muted-text>当社の<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">高度な数式</a>を使ってレポートタイトルをカスタマイズしましょう。</muted-text>`,
            customNameTitle: 'デフォルトレポートタイトル',
            customNameDescription: `<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">高度な数式</a>を使って、経費レポート用のカスタム名を選択しましょう。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポート開始日: {report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名：{report:workspacename}',
            customNameReportIDExample: 'レポートID：{report:id}',
            customNameTotalExample: '合計：{report:total}',
            preventMembersFromChangingCustomNamesTitle: 'メンバーがカスタムレポートのタイトルを変更できないようにする',
        },
        reportFields: {
            addField: 'フィールドを追加',
            delete: 'フィールドを削除',
            deleteFields: 'フィールドを削除',
            findReportField: 'レポート項目を検索',
            deleteConfirmation: 'このレポートフィールドを削除してもよろしいですか？',
            deleteFieldsConfirmation: 'これらのレポートフィールドを削除してもよろしいですか？',
            emptyReportFields: {title: 'レポート項目はまだありません', subtitle: 'レポートに表示されるカスタムフィールド（テキスト、日付、またはドロップダウン）を追加する。'},
            subtitle: 'レポートフィールドはすべての支出に適用され、追加情報の入力を促したい場合に便利です。',
            disableReportFields: 'レポート項目を無効にする',
            disableReportFieldsConfirmation: '本当に実行しますか？テキストと日付フィールドは削除され、リストは無効になります。',
            importedFromAccountingSoftware: '以下のレポート項目は、次からインポートされます',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '数式',
            textAlternateText: 'フリーテキスト入力用のフィールドを追加する。',
            dateAlternateText: '日付選択用のカレンダーを追加する。',
            dropdownAlternateText: '選択できるオプションのリストを追加します。',
            formulaAlternateText: '数式フィールドを追加',
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
            enableValues: '値を有効化',
            emptyReportFieldsValues: {title: 'まだリストの値がありません', subtitle: 'レポートに表示するカスタム値を追加します。'},
            deleteValuePrompt: 'このリスト値を削除してもよろしいですか？',
            deleteValuesPrompt: 'これらのリスト値を削除してもよろしいですか？',
            listValueRequiredError: 'リスト値の名前を入力してください',
            existingListValueError: 'この名前のリスト値はすでに存在します',
            editValue: '値を編集',
            listValues: '値を一覧表示',
            addValue: '価値を追加',
            existingReportFieldNameError: 'この名前のレポートフィールドはすでに存在します',
            reportFieldNameRequiredError: 'レポート項目名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドの種類を選択してください',
            circularReferenceError: 'このフィールドを自分自身に参照することはできません。更新してください。',
            unsupportedFormulaValueError: ({value}: UnsupportedFormulaValueErrorParams) => `数式フィールド ${value} が認識されません`,
            reportFieldInitialValueRequiredError: 'レポート項目の初期値を選択してください',
            genericFailureMessage: 'レポートフィールドの更新中にエラーが発生しました。もう一度お試しください。',
        },
        tags: {
            tagName: 'タグ名',
            requiresTag: 'メンバーはすべての経費にタグを付ける必要があります',
            trackBillable: '請求可能な経費を管理',
            customTagName: 'カスタムタグ名',
            enableTag: 'タグを有効にする',
            enableTags: 'タグを有効にする',
            requireTag: '必須タグ',
            requireTags: '必須タグ',
            notRequireTags: '必須にしない',
            disableTag: 'タグを無効化',
            disableTags: 'タグを無効にする',
            addTag: 'タグを追加',
            editTag: 'タグを編集',
            editTags: 'タグを編集',
            findTag: 'タグを検索',
            subtitle: 'タグを使うと、コストをより詳しく分類できます。',
            subtitleWithDependentTags: (importSpreadsheetLink: string, canReimport = true) =>
                `<muted-text>タグを使うと、コストをより詳しく分類できます。あなたは<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">連動タグ</a>を使用しています。${canReimport ? `タグを更新するには、<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>できます。` : ''}</muted-text>`,
            emptyTags: {
                title: 'タグはまだありません',
                subtitle: 'タグを追加して、プロジェクト、所在地、部署などを追跡しましょう。',
                subtitleHTML: `<muted-text><centered-text>タグを追加して、プロジェクト、所在地、部門などを追跡しましょう。インポート用のタグファイルの書式設定については、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">詳しくはこちら</a>をご覧ください。</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string, canManage = true) =>
                    `<muted-text><centered-text>現在、タグは会計連携からインポートされています。${canManage ? `変更するには<a href="${accountingPageURL}">会計</a>に移動してください。` : ''}</centered-text></muted-text>`,
            },
            deleteTag: 'タグを削除',
            deleteTags: 'タグを削除',
            deleteTagConfirmation: 'このタグを削除してもよろしいですか？',
            deleteTagsConfirmation: 'これらのタグを本当に削除しますか？',
            deleteFailureMessage: 'タグの削除中にエラーが発生しました。もう一度お試しください',
            tagRequiredError: 'タグ名は必須です',
            existingTagError: 'この名前のタグはすでに存在します',
            invalidTagNameError: 'タグ名を0にはできません。別の値を選択してください。',
            genericFailureMessage: 'タグの更新中にエラーが発生しました。もう一度お試しください',
            importedFromAccountingSoftware: 'タグは次の場所で管理できます:',
            employeesSeeTagsAs: '従業員にはタグが次のように表示されます',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください',
            tagRules: 'タグルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費に 1 種類または複数のタグを付けて分類しましょう。',
            configureMultiLevelTags: '複数レベルのタグ付けのために、タグの一覧を設定します。',
            importMultiLevelTagsSupportingText: `こちらがタグのプレビューです。問題なければ、下をクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列に総勘定元帳コードがあります',
            },
            tagLevel: {
                singleLevel: '単一レベルのタグ',
                multiLevel: '多階層タグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替える',
                prompt1: 'タグレベルを切り替えると、現在のタグはすべて消去されます。',
                prompt2: 'まずはじめに行うことをおすすめします',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートして行います。',
                prompt5: '詳細を確認',
                prompt6: 'タグレベルについて。',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当に実行しますか？',
                prompt2: '既存のタグは上書きされますが、あなたは',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'まず。',
            },
            importedTagsMessage: (columnCounts: number) =>
                `スプレッドシート内に *${columnCounts} 列* 見つかりました。タグ名が含まれている列の横にある *Name* を選択してください。タグのステータスを設定する列の横にある *Enabled* を選択することもできます。`,
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: `ワークスペースでタグが必須のため、少なくとも1つのタグは有効のままにする必要があります。`,
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグを任意にはできません',
                description: `ワークスペースの設定でタグが必須のため、少なくとも1つのタグは必須のままにする必要があります。`,
            },
            cannotMakeTagListRequired: {
                title: 'タグリストを必須にすることはできません',
                description: 'ポリシーで複数のタグレベルが設定されている場合にのみ、タグリストを必須にできます。',
            },
            tagCount: () => ({
                one: '1日タグ',
                other: (count: number) => `${count} 件のタグ`,
            }),
        },
        taxes: {
            subtitle: '税名と税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペースの通貨デフォルト',
            foreignDefault: '外貨のデフォルト',
            customTaxName: 'カスタム税名',
            value: '値',
            taxReclaimableOn: '還付対象の税金',
            taxRate: '税率',
            findTaxRate: '税率を検索',
            error: {
                taxRateAlreadyExists: 'この税金名はすでに使用されています',
                taxCodeAlreadyExists: 'この税コードはすでに使用されています',
                valuePercentageRange: '0～100の範囲で有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名が必要です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Concierge にヘルプを依頼してください。',
                updateTaxClaimableFailureMessage: '返金可能額は距離レート額より小さくなければなりません',
            },
            deleteTaxConfirmation: 'この税を削除してもよろしいですか？',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `${taxAmount} 件の税額を削除してもよろしいですか？`,
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
            welcomeNote: '私の新しいワークスペースを使い始めてください',
            delayedSubmission: '遅延提出',
            merchantRules: '販売者ルール',
            merchantRulesCount: () => ({
                one: '1 販売者ルール',
                other: (count: number) => `${count} 販売者ルール`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `元のワークスペースから ${totalMembers ?? 0} 人のメンバーと一緒に、${newWorkspaceName ?? ''} を作成して共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        copyPolicySettings: {
            title: '設定をコピー',
            error: 'ワークスペース設定のコピー中にエラーが発生しました。もう一度お試しください。',
            selectWorkspaces: {
                title: 'ワークスペースを選択',
                description: '設定をコピーしたいワークスペースを選択し、その後、コピーしたい設定を選びます。',
                searchPlaceholder: 'ワークスペースを検索',
            },
            selectSettings: {
                title: 'コピーする機能を選択します',
                description: '既存のワークスペースで上書きする設定を選択します。',
                accountingMismatch: ({part}: {part: string}) => `すべてのワークスペースが同じ会計システムと会社接続を使用している場合にのみ、${part} をコピーできます。`,
                travelAddressMismatch: '出張をコピーできるのは、選択したすべてのワークスペースに会社の住所がある場合のみです。',
            },
            confirmSettings: {
                title: 'すべて正しく表示されているか確認しましょう。',
                description: ({workspaceName}: {workspaceName: string}) => `次の設定を<strong>${workspaceName}</strong>から指定したワークスペースにコピーします`,
            },
            confirmWorkflows: {
                continue: 'メンバーなしで続行',
                description: 'メンバーなしでワークフローをコピーすると、承認ワークフローはコピーされません。提出と支払いの設定は引き続きコピーされます。',
            },
            progress: {
                copyInProgressTitle: 'コピーを実行中です...',
                copyInProgressDescription: '処理が完了するまで待つこともできますし、完了したら Concierge からお知らせすることもできます。',
                letMeKnowPrompt: '完了したら教えてください',
                conciergeNotificationTitle: 'Concierge からお知らせします',
                conciergeNotificationDescription: '処理が完了すると、Concierge からメッセージが送信されます。',
                copyCompleted: 'ワークスペースの設定がコピーされました。',
            },
        },
        emptyWorkspace: {
            title: 'ワークスペースがありません',
            subtitle: '領収書を管理し、経費を精算し、出張を管理し、請求書を送信するなど、さまざまなことができます。',
            createAWorkspaceCTA: '始める',
            features: {
                trackAndCollect: '領収書を追跡して収集する',
                reimbursements: '従業員に精算する',
                companyCards: '会社カードを管理',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは複数人で議論したり一緒に作業したりするのに最適な場所です。共同作業を始めるには、ワークスペースを作成するか参加してください',
        },
        new: {
            newWorkspace: '新しいワークスペース',
            getTheExpensifyCardAndMore: 'Expensify カードなどを利用する',
            confirmWorkspace: 'ワークスペースを確認',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `マイ・グループワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `${userName} のワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'ワークスペースからメンバーを削除する際にエラーが発生しました。もう一度お試しください',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `${memberName} さんを削除してもよろしいですか？`,
                other: 'これらのメンバーを本当に削除しますか？',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `${memberName} はこのワークスペースの承認者です。このワークスペースの共有を解除すると、承認ワークフロー内でその承認者はワークスペースのオーナーである ${ownerName} に置き換えられます`,
            removeMembersTitle: () => ({
                one: 'メンバーを削除',
                other: 'メンバーを削除',
            }),
            findMember: 'メンバーを検索',
            removeWorkspaceMemberButtonTitle: 'ワークスペースから削除',
            removeGroupMemberButtonTitle: 'グループから削除',
            removeRoomMemberButtonTitle: 'チャットから削除',
            removeMemberPrompt: (memberName: string) => `${memberName} さんを削除してもよろしいですか？`,
            removeMemberTitle: 'メンバーを削除',
            transferOwner: '所有者を変更',
            makeMember: () => ({
                one: 'メンバーにする',
                other: 'メンバーにする',
            }),
            makeAdmin: () => ({
                one: 'ワークスペース管理者にする',
                other: 'ワークスペース管理者にする',
            }),
            makeGroupAdmin: () => ({
                one: '管理者にする',
                other: '管理者にする',
            }),
            makeAuditor: () => ({
                one: '監査担当者に設定',
                other: '監査担当者を作成',
            }),
            makePeopleAdmin: () => ({
                one: 'People 管理者にする',
                other: 'People 管理者にする',
            }),
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーを追加する際に問題が発生しました',
                cannotRemove: '自分自身またはワークスペースのオーナーを削除することはできません',
                genericRemove: 'そのワークスペースメンバーを削除する際に問題が発生しました',
            },
            addedWithPrimary: '一部のメンバーは、プライマリーログインで追加されました。',
            invitedBySecondaryLogin: (secondaryLogin: string) => `セカンダリログイン${secondaryLogin}によって追加されました。`,
            workspaceMembersCount: (count: number) => `ワークスペースメンバー合計：${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `このワークスペースから${approver}を削除すると、承認ワークフロー内ではワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `${memberName} には未承認の経費精算書があります。ワークスペースから削除する前に、承認してもらうか、その精算書の管理を引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除することはできません。ワークフロー ＞ 支払いの作成または追跡 で新しい払い戻し担当者を設定してから、もう一度お試しください。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}さんを削除すると、優先エクスポーターはワークスペースのオーナーである${workspaceOwner}さんに置き換えられます。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、技術連絡先はワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} は、対応が必要な未処理のレポートがあります。ワークスペースから削除する前に、必要な対応を完了するよう依頼してください。`,
            allMembers: 'すべてのメンバー',
            admins: 'ワークスペース管理者',
            approvers: '承認者',
            auditors: '監査担当者',
            editors: '編集者',
            emptyRoleFilter: {title: 'このフィルターに一致するメンバーはいません', subtitle: 'メンバーを招待するか、上のフィルターを変更してください。'},
            configureHRSync: (providerName: string) => `${providerName} の同期を設定します。`,
            syncWithHR: (providerName: string) => `${providerName}と同期`,
            makeCardAdmin: () => ({one: 'カード管理者にする', other: 'カード管理者に設定'}),
            cardAdmins: 'カード管理者',
            peopleAdmins: 'People 管理者',
            members: 'メンバー',
        },
        card: {
            getStartedIssuing: 'まずは最初のバーチャルカードまたは物理カードを発行しましょう。',
            issueCard: 'カードを発行',
            chooseRule: 'ルールを選択してください',
            issueNewCard: {
                whoNeedsCard: '誰がカードを必要としていますか？',
                inviteNewMember: '新しいメンバーを招待',
                findMember: 'メンバーを検索',
                chooseCardType: 'カードの種類を選択',
                physicalCard: '物理カード',
                physicalCardDescription: '頻繁に支出する人に最適',
                virtualCard: 'バーチャルカード',
                virtualCardDescription: '即時かつ柔軟',
                chooseLimitType: '上限の種類を選択',
                smartLimit: 'スマート制限',
                smartLimitDescription: '承認が必要になる前に、一定額まで支出できる',
                monthly: '毎月',
                monthlyDescription: '毎月、一定額まで利用する',
                fixedAmount: '固定額',
                fixedAmountDescription: '一度だけ上限額まで利用する',
                setLimit: '上限を設定',
                cardLimitError: '$21,474,836 未満の金額を入力してください',
                giveItName: '名前を付けてください',
                giveItNameInstruction: '他のカードと見分けがつくように、十分にユニークな名前を付けてください。具体的な用途を書くと、さらに分かりやすくなります！',
                cardName: 'カード名',
                letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
                willBeReadyToUse: 'このカードはすぐに利用できるようになります。',
                willBeReadyToShip: 'このカードはすぐに発送できる状態になります。',
                cardholder: 'カード名義人',
                cardType: 'カードの種類',
                limit: '上限',
                limitType: '上限の種類',
                disabledApprovalForSmartLimitError: 'スマート制限を設定する前に、<strong>ワークフロー &gt; 承認を追加</strong> で承認を有効にしてください',
                singleUse: '一回限り',
                singleUseDescription: '1回の取引後に期限切れ',
                validFrom: '有効開始日',
                startDate: '開始日',
                endDate: '終了日',
                noExpirationHint: '有効期限のないカードは期限切れになりません',
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate}から${endDate}まで有効`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate}から${endDate}まで`,
                combineWithExpiration: '追加の支出制御のために有効期限オプションと組み合わせる',
                enterValidDate: '有効な日付を入力してください',
                expirationDate: '有効期限',
                limitAmount: '制限額',
                setCardRules: 'カードルールを設定',
                addSpendRule: '支出ルールを追加',
                addExpirationDate: '有効期限を追加',
                addExpirationDateDescription: '特定の日付が設定されていない場合、カードは既存の有効期限に基づいて失効します',
                amount: '金額',
                copyExisting: '既存のものをコピー',
                createNew: '新規作成',
                spendRulesEmptyStateTitle: '選択できるルールがありません',
                spendRulesEmptyStateSubtitle: 'まだルールがありません。前の画面から作成できます。',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化',
                deactivateConfirmation: 'このカードを無効化すると今後のすべての取引が拒否され、元に戻すことはできません。',
            },
            searchRules: '支出ルールを検索',
        },
        accounting: {
            settings: '設定',
            title: '接続',
            subtitle: '会計ソフトを接続して、自動同期を行いましょう。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            rillet: 'Rillet',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'アカウントエグゼクティブとチャットします。',
            talkYourAccountManager: 'アカウントマネージャーとチャットする',
            talkToConcierge: 'Conciergeとチャットする',
            needAnotherAccounting: 'ほかの会計ソフトが必要ですか？',
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
                    case CONST.POLICY.CONNECTIONS.NAME.RILLET:
                        return 'Rillet';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Expensify Classic で設定されている接続にエラーがあります。[この問題を解決するには Expensify Classic に移動してください。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '設定を管理するには、Expensify Classic に移動してください。',
            setup: '接続',
            lastSync: (relativeDate: string) => `最終同期：${relativeDate}`,
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
                return `${integrationName}の接続を解除`;
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
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計連携'} を接続してもよろしいですか？これにより、既存の会計連携はすべて削除されます。`,
            enterCredentials: '認証情報を入力してください',
            reconnect: '再接続',
            updateCredentials: '認証情報を更新',
            claimOffer: {
                badgeText: 'オファーをご利用いただけます！',
                xero: {
                    headline: 'Xero を6か月間無料で利用しましょう！',
                    description:
                        '<muted-text><centered-text>Xero を初めてご利用ですか？Expensify のお客様は 6 か月間無料でお使いいただけます。以下から特典をお申し込みください。</centered-text></muted-text>',
                    connectButton: 'Xero に接続',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Uber の乗車料金が 5% オフになります',
                    description: `<muted-text><centered-text>Expensify を通じて Uber for Business を有効化すると、6 月までのすべてのビジネス乗車が 5% 割引になります。<a href="${CONST.UBER_TERMS_LINK}">諸条件が適用されます。</a></centered-text></muted-text>`,
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
                            return '従業員のインポート';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return '口座のインポート';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'クラスのインポート';
                        case 'quickbooksOnlineImportLocations':
                            return '場所をインポート中';
                        case 'quickbooksOnlineImportProcessing':
                            return 'インポートしたデータを処理しています';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '払い戻し済みレポートと支払い済み請求書の同期';
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
                            return '承認証明書をインポート中';
                        case 'quickbooksDesktopImportDimensions':
                            return 'ディメンションをインポート中';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '保存ポリシーのインポート';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'QuickBooks とデータを同期中です… Web Connector が実行中であることを確認してください';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online データを同期中';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'データを読み込んでいます';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'カテゴリを更新中';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '顧客／プロジェクトの更新';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'メンバー一覧を更新中';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポートフィールドを更新中';
                        case 'jobDone':
                            return 'インポートしたデータの読み込みを待っています';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期中';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期しています';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensifyレポートを精算済みとしてマークする';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero の請求書とインボイスを支払済みにする';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期中';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座を同期中';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期しています';
                        case 'xeroCheckConnection':
                            return 'Xero 接続を確認中';
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
                            return 'カテゴリを同期しています';
                        case 'netSuiteSyncReportFields':
                            return 'データをExpensifyのレポートフィールドとしてインポートする';
                        case 'netSuiteSyncTags':
                            return 'Expensify タグとしてデータをインポート';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新しています';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensifyレポートを精算済みとしてマークする';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite の請求書とインボイスを支払済みにマークする';
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
                            return 'Sage Intacct データのインポート';
                        case 'financialForceSyncTitle':
                            return 'Certinia データを同期中';
                        case 'financialForceSyncStep':
                            return 'Certinia 接続を同期中';
                        case 'financialForceSyncCategories':
                            return 'カテゴリをインポート中';
                        case 'financialForceSyncTags':
                            return 'タグをインポート中';
                        case 'financialForceSyncVendors':
                            return 'ベンダーをインポート中';
                        case 'financialForceSyncContacts':
                            return '連絡先をインポート中';
                        case 'financialForceSyncCompanies':
                            return '会社をインポート中';
                        case 'financialForceSyncUsers':
                            return 'ユーザーをインポート中';
                        case 'financialForceSyncDimensions':
                            return 'ディメンションをインポート中';
                        case 'financialForceMarkAsReimbursed':
                            return 'レポートを払い戻し済みにマーク中';
                        case 'rilletSyncTitle':
                            return 'Rillet データを同期しています';
                        case 'rilletSyncConnection':
                            return 'Rillet への接続を初期化しています';
                        case 'rilletSyncImportData':
                            return 'データを読み込んでいます';
                        default: {
                            return `ステージの翻訳が見つかりません: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '優先エクスポーター',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポート先口座を設定している場合は、ドメイン管理者である必要もあります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントでエクスポート対象のレポートを確認できるようになります。',
            exportAs: 'エクスポート形式',
            exportOutOfPocket: '立替経費のエクスポート形式',
            exportCompanyCard: '法人カード経費のエクスポート形式',
            exportDate: 'エクスポート日',
            defaultVendor: 'デフォルトのベンダー',
            defaultAccount: 'デフォルトのアカウント',
            autoSync: '自動同期',
            autoSyncDescription: 'NetSuite と Expensify を毎日自動で同期。確定したレポートをリアルタイムでエクスポート',
            reimbursedReports: '精算済みレポートを同期',
            cardReconciliation: 'カード照合',
            reconciliationAccount: '照合勘定',
            continuousReconciliation: '継続的な照合',
            saveHoursOnReconciliation: 'Expensify が Expensify カードの明細と清算を自動的に照合することで、会計期間ごとの消し込み作業にかかる時間を大幅に削減できます。',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>継続的な消込を有効にするには、${connectionName} の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify カードの支払いを照合する銀行口座を選択してください。',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `継続消込が正しく機能するように、この口座が、末尾が ${lastFourPAN} の<a href="${settlementAccountUrl}">Expensify カード精算口座</a>と一致していることを確認してください。`,
                chooseTravelInvoicingBankAccount: '一括旅行請求の支払いを消し込む銀行口座を選択してください。',
                travelInvoicingSettlementAccountReconciliation: (lastFourPAN: string) =>
                    `Continuous Reconciliation が正しく動作するように、この口座が、Consolidated Travel Billing の決済口座（末尾が ${lastFourPAN}）と一致していることをご確認ください。`,
            },
            syncTravelInvoicingSettlements: '統合トラベル請求の精算を同期する',
        },
        export: {
            notReadyHeading: 'エクスポートの準備ができていません',
            notReadyDescription: '下書きまたは承認待ちの経費精算書は会計システムへエクスポートできません。エクスポートする前に、これらの経費を承認するか支払ってください。',
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
                chooseInvoiceMethod: '下から支払い方法を選択してください：',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書残高',
            invoiceBalanceSubtitle: 'これは、請求書の支払いを回収して得た現在の残高です。銀行口座を追加していれば、自動的にその口座へ振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いの送金と受け取りを行うために、銀行口座を追加してください。',
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
            oopsNotSoFast: 'おっと！ちょっと待って…',
            workspaceNeeds: 'ワークスペースには、少なくとも 1 つの有効な距離レートが必要です。',
            commuterExclusions: {
                title: '通勤を除外',
                summaryDisabled: '通勤除外なし',
                summaryFixedDistance: ({distance, unit}: {distance: number; unit: string}) => `申請ごとに ${distance} ${unit} を除外します`,
                optionDisabledTitle: '通勤を除外しない',
                optionDisabledHelp: '通勤除外は適用されていません。',
                optionFixedDistanceTitle: '申請ごとに一定距離を除外します',
                optionFixedDistanceHelp: '各申請から同じ通勤距離を差し引きます。1勤務日につき1件の申請を行うメンバーに最適です。',
                distanceLabel: '距離',
                errors: {distanceMustBePositive: '距離は正の整数で入力してください。'},
            },
            distance: '距離',
            centrallyManage: '料金を一元管理し、マイルまたはキロメートルで追跡し、デフォルトのカテゴリを設定できます。',
            emptyRates: {title: '距離レートはまだありません', subtitle: 'カスタムレートで走行距離を精算するためのレートを追加します。'},
            rate: '評価',
            addRate: 'レートを追加',
            findRate: 'レートを検索',
            trackTax: '税金を記録',
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
            statusActive: 'アクティブ',
            statusFuture: '将来',
            statusExpired: '期限切れ',
            statusInactive: '無効',
            unit: '単位',
            taxFeatureNotEnabledMessage:
                '<muted-text>この機能を利用するには、ワークスペースで税金設定を有効にする必要があります。設定を変更するには、<a href="#">その他の機能</a>に移動してください。</muted-text>',
            deleteDistanceRate: '距離レートを削除',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            errors: {
                rateNameRequired: 'レート名は必須です',
                existingRateName: 'この名前の距離レートはすでに存在します',
                nameRequired: '名前は必須です',
                startDateMustBeBeforeEndDate: '開始日は終了日より前でなければなりません',
                amountRequired: '金額は必須です',
            },
            amountPerUnit: (unit: string) => `${unit}あたりの金額`,
            startDate: '開始日',
            endDate: '終了日',
        },
        editor: {
            descriptionInputLabel: '説明',
            nameInputLabel: '名前',
            typeInputLabel: '種類',
            initialValueInputLabel: '初期値',
            nameInputHelpText: 'これはワークスペース上で表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付ける必要があります',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペース上のすべての経費は、この通貨に換算されます。',
            currencyInputDisabledText: (currency: string) => `このワークスペースは ${currency} の銀行口座にリンクされているため、デフォルト通貨は変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travel を有効にするには、ワークスペースの住所が必要です。お客様のビジネスに関連付けられた住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続行',
            youAreAlmostDone: '銀行口座の設定はほぼ完了です。これにより、コーポレートカードの発行、経費精算、請求書の回収、請求書の支払いが行えるようになります。',
            streamlinePayments: '支払いを効率化',
            connectBankAccountNote: '注: ワークスペースでの支払いには個人の銀行口座は使用できません。',
            oneMoreThing: 'もう一つだけ！',
            allSet: '準備完了です！',
            accountDescriptionWithCards: 'この銀行口座は、コーポレートカードの発行、経費の精算、請求書の回収、および支払いに利用されます。',
            letsFinishInChat: 'チャットで完了しましょう！',
            finishInChat: 'チャットで完了',
            almostDone: 'ほぼ完了です！',
            disconnectBankAccount: '銀行口座を切断',
            startOver: 'やり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、銀行口座の連携を解除します',
            yesStartOver: 'はい、やり直す',
            disconnectYourBankAccount: (bankName: string) => `<strong>${bankName}</strong>の銀行口座との接続を解除します。この口座の未処理取引は引き続き処理されます。`,
            clearProgress: '最初からやり直すと、これまでの進捗がすべてクリアされます。',
            areYouSure: '本当に実行しますか？',
            workspaceCurrency: 'ワークスペースの通貨',
            updateCurrencyPrompt: '現在、ご利用のワークスペースはUSD（米ドル）以外の通貨に設定されています。下のボタンをクリックして、通貨をUSDに更新してください。',
            updateToUSD: 'USD に更新',
            updateWorkspaceCurrency: 'ワークスペースの通貨を更新',
            workspaceCurrencyNotSupported: 'ワークスペースの通貨はサポートされていません',
            yourWorkspace: `ご利用のワークスペースはサポートされていない通貨に設定されています。<a href="${CONST.ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL}">サポートされている通貨の一覧</a>を表示します。`,
            chooseAnExisting: '既存の銀行口座を選択して経費を支払うか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: '所有者を変更',
            addPaymentCardTitle: '所有権を移転するには支払いカードを入力してください',
            addPaymentCardButtonText: '規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>カードを追加するには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>を読み、同意してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長構成',
            addPaymentCardLearnMore: `<muted-text>当社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>の詳細を見る。</muted-text>`,
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\n残高を精算して、このワークスペースの請求管理を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を振替',
            ownerOwesAmountText: (email: string, amount: string) => `このワークスペースの所有アカウント（${email}）には、前月からの未払い残高があります。

この金額（${amount}）を引き継いで、このワークスペースの支払いを担当しますか？お支払い用カードにはただちに請求されます。`,
            subscriptionTitle: '年間サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `このワークスペースを引き継ぐと、その年額サブスクリプションは現在のサブスクリプションと統合されます。これによりサブスクリプションの人数は${usersCount}人増え、新しいサブスクリプションの合計人数は${finalCount}人になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複したサブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `${email} さんのワークスペースの支払い管理を引き継ごうとしているようですが、そのためには、まずすべてのワークスペースであなたが管理者である必要があります。

ワークスペース ${workspaceName} の支払い管理のみを引き継ぐ場合は、「続行」をクリックしてください。

サブスクリプション全体の支払い管理を引き継ぎたい場合は、支払い管理を引き継ぐ前に、すべてのワークスペースであなたを管理者として追加してもらってください。`,
            hasFailedSettlementsTitle: '所有権を譲渡できません',
            hasFailedSettlementsButtonText: '了解しました',
            hasFailedSettlementsText: (email: string) =>
                `${email} に未払いの Expensify カードの清算があるため、請求の引き継ぎはできません。問題を解決するために、concierge@expensify.com まで連絡するよう依頼してください。その後、このワークスペースの請求を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高のクリアに失敗しました',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高を消去できませんでした。後でもう一度お試しください。',
            successTitle: 'やった！これで完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ちょっと待って…',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権の移譲中に問題が発生しました。もう一度お試しいただくか、サポートが必要な場合は<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `次のレポートはすでに ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポートされています。もう一度エクスポートしてもよろしいですか？

${reportName}`,
            confirmText: 'はい、再度エクスポートします',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポート項目',
                description: `レポートフィールドを使うと、各明細行の経費に関連するタグとは異なる、ヘッダー（レポート全体）レベルの詳細を指定できます。これらの詳細には、特定のプロジェクト名、出張情報、所在地などを含めることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用できます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify と NetSuite の連携により、自動同期を活用して手入力を減らしましょう。プロジェクトや顧客のマッピングを含むネイティブおよびカスタムセグメントのサポートで、詳細かつリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>NetSuite 連携は Control プランでのみご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify と Sage Intacct の連携で同期を自動化し、手動入力を削減しましょう。ユーザー定義ディメンションに加え、部門、クラス、ロケーション、顧客、プロジェクト（ジョブ）ごとの経費コード設定により、詳細かつリアルタイムな財務インサイトを得られます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sage Intacct との連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただける Control プランでのみ提供されています</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify と QuickBooks Desktop の連携により、自動同期を活用して手入力を削減しましょう。リアルタイムの双方向接続と、クラス、品目、顧客、プロジェクト別の経費コード設定で、究極の効率性を実現できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktop 連携機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                title: 'Certinia',
                description: `Expensify と Certinia の連携で自動同期を活用し、手入力を減らしましょう。経費のコーディングディメンションと税務同期を Certinia の設定に合わせて、財務の可視性を高めます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Certinia 連携は Control プランでのみご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.RILLET]: {
                title: 'Rillet',
                description: `Expensify と Rillet の連携で自動同期を活用し、手入力を減らしましょう。経費のコーディングディメンションと税務同期を Rillet の設定に合わせて、財務の可視性を高めます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rillet 連携は Control プランでのみご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `承認フローにさらに多くの段階を追加したい場合や、高額な経費に必ず別の承認者の目を通したい場合も、ご安心ください。高度な承認機能により、あらゆるレベルで適切なチェック体制を整え、チームの支出をしっかり管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}から利用できるControlプランでのみご利用いただけます</muted-text>`,
            },
            categories: {
                title: 'カテゴリ',
                description: 'カテゴリを使うと支出を追跡して整理できます。デフォルトのカテゴリを使うか、自分用のカテゴリを追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリは Collect プランでご利用いただけます。料金は<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からです</muted-text>`,
            },
            glCodes: {
                title: 'GLコード',
                description: `経費を会計システムや給与システムに簡単にエクスポートできるよう、カテゴリとタグにGLコードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用できます</muted-text>`,
            },
            glAndPayrollCodes: {
                title: '総勘定元帳コードと給与コード',
                description: `勘定科目に総勘定元帳（GL）コードと給与コードを追加して、経費を会計システムや給与システムへ簡単にエクスポートできるようにしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL と給与コードは、Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `会計システムや給与システムへ経費を簡単にエクスポートできるように、税金に税コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用可能です</muted-text>`,
            },
            companyCards: {
                title: '無制限の法人カード',
                description: `カードフィードをもっと追加する必要がありますか？主要なカード発行会社すべてから取引を同期できる、無制限の法人カードを有効にしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からの Control プランでのみ利用できます</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで動作し、細かいことに頭を悩ませなくても支出をきちんと管理できるようにします。

領収書や説明などの経費詳細を必須にし、上限やデフォルトを設定し、承認や支払いを自動化——すべてを1か所で行えます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみご利用いただけます</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '日当は、従業員が出張するときの毎日の費用を、ポリシーに準拠させつつ予測しやすく管理するのに最適な方法です。カスタムレート、デフォルトカテゴリ、目的地やサブラテなどのより詳細な設定を活用できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>日当は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみ利用できます</muted-text>`,
            },
            travel: {
                title: '出張',
                description: 'Expensify Travel は、メンバーが宿泊施設、フライト、交通機関などを予約できる、新しい法人向け出張予約・管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel は Collect プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使うと、経費をグループ化して、より簡単に追跡・整理できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのCollectプランで利用できます</muted-text>`,
            },
            multiLevelTags: {
                title: '多階層タグ',
                description:
                    'マルチレベルタグを使うと、経費をより正確に管理できます。各明細行に部署、クライアント、コストセンターなど複数のタグを割り当てることで、あらゆる経費の全体的な状況を把握できます。これにより、より詳細なレポート、承認ワークフロー、会計データのエクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からのControlプランでのみご利用いただけます</muted-text>`,
            },
            distanceRates: {
                title: '距離単価',
                description: '自分用のレートを作成・管理し、マイルまたはキロメートルで距離を記録し、距離精算用のデフォルトカテゴリを設定できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離レートはCollectプランで利用できます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からご利用になれます</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数承認レベルは、精算前にレポートを複数人で承認する必要がある会社向けのワークフローツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}から利用できるControlプランでのみご利用いただけます</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり月額',
                perMember: 'メンバー1人あたり月額',
            },
            note: (subscriptionLink: string) => `<muted-text>プランと料金については<a href="${subscriptionLink}">詳しく見る</a>をご覧ください。</muted-text>`,
            upgradeToUnlock: 'この機能を有効にする',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: (policyName: string, planName: string, subscriptionLink: string) =>
                    `<centered-text>${policyName}を${planName}プランにアップグレードしました！詳しくは<a href="${subscriptionLink}">サブスクリプションを表示</a>してください。</centered-text>`,
                categorizeMessage: `Collectプランへのアップグレードが完了しました。これで経費をカテゴリー分けできるようになりました！`,
                travelMessage: `Collectプランへのアップグレードが完了しました。さっそく出張の予約や管理を始めましょう！`,
                distanceRateMessage: `Collectプランへのアップグレードが完了しました。これで距離単価を変更できるようになりました！`,
                gotIt: '了解しました、ありがとうございます',
                createdWorkspace: `ワークスペースを作成しました！`,
            },
            commonFeatures: {
                title: 'Controlプランにアップグレード',
                collect: {
                    title: 'Collectプランにアップグレード',
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>Collect プランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。プランと料金の詳細は <a href="${learnMoreMethodsRoute}">こちら</a> をご覧ください。</muted-text>`,
                    note: '以下を含む、ビジネスに欠かせない機能をアンロックしましょう：',
                },
                note: '以下を含む、最も強力な機能をアンロックしましょう：',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>Control プランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます。プランと料金の詳細は <a href="${learnMoreMethodsRoute}">こちら</a> をご覧ください。</muted-text>`,
                    benefit1: '高度な会計連携（NetSuite、Sage Intacct など）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ管理',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランの種類を次に変更してください:',
                },
                upgradeWorkspaceWarning: `ワークスペースをアップグレードできません`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'あなたの会社ではワークスペースの作成が制限されています。管理者に連絡してサポートを受けてください。',
            },
            hr: {
                title: '人事連携',
                description: '人事システムを連携して、従業員情報を自動で同期し、承認ワークフローを管理できます。チームの名簿とレポートラインを手作業なしで最新の状態に保てます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>人事システム連携は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり、1か月ごと。`}からのControlプランでのみご利用いただけます</muted-text>`,
            },
            approvalSubmit: {
                title: '承認',
                description: '承認機能を有効にして、全メンバーの提出先を一括設定しましょう。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>承認機能は、Collect プランおよび Control プランで利用できます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
            },
            approvalSubmitReport: {
                title: 'レポートを承認',
                description:
                    '申請の確認と承認、支出の管理をすべて一か所で行うことができます。承認ワークフローを使えば、コストの管理、社内ポリシーの順守、従業員への迅速な精算が可能になります。',
                onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
                    `<muted-text>承認ワークフローは、アクティブメンバー1人あたり月額<strong>${formattedPrice}</strong>からの Collect プランでのみご利用いただけます。</muted-text>`,
            },
            companyCardSubmit: {
                title: '会社カード',
                description: `お使いの会社カードをExpensifyに連携して、自動取込、自動分類、カスタマイズ可能なルール設定、そして統合された照合機能を利用しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>会社カードのインポートは、Collect プランと Control プランで利用できます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
            },
            travelSubmit: {
                title: 'Expensify トラベル',
                description: 'Expensify から世界中の割引航空券、ホテル、レンタカー、列車を予約し、デューティ・オブ・ケアレポートと経費管理を統合して利用できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Expensify Travel は Collect プランと Control プランで利用でき、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            roles: {
                title: 'ロール',
                description: 'メンバーごとに異なるロールを割り当て、必要に応じて閲覧権限や管理権限を増減させましょう。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ロールは、Collect および Control プランで利用できます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からご利用いただけます</muted-text>`,
            },
            payments: {
                title: '支払い',
                description: '従業員への精算を、事業用銀行口座から直接行います。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>支払い機能は、Collect プランおよび Control プランで利用できます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです</muted-text>`,
            },
            accounting: {
                title: '会計',
                description: '会計システムからExpensifyへカテゴリ、タグ、税率などを同期し、経費レポートやカード取引をエクスポートできます。手入力も、入力ミスの心配も不要です！',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>会計機能は Collect プランと Control プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からご利用可能です</muted-text>`,
            },
            expensifyCard: {
                title: 'Expensify カード',
                description:
                    '自社の銀行口座から（バーチャルカードを含む）コーポレートカードを直接発行し、途切れない連携によるリアルタイムな支出管理と、最大2%のキャッシュバックを手に入れましょう！',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Expensify Card は Collect プランと Control プランでご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`} からです。</muted-text>`,
                upgradeButton: 'アップグレードして有効化',
            },
            invoicing: {
                title: '請求書発行',
                description: 'Expensify 内でプロ仕様の請求書を作成・送信・追跡。統合された支払い機能とリアルタイムの可視性で、より早く入金を受けましょう。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>請求書発行機能は、Collect プランと Control プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額` : `アクティブメンバー1人あたり月額`}からご利用可能です。</muted-text>`,
            },
            controlPolicyRoles: {
                title: 'コントロールポリシーのロール',
                description: '監査人やカード管理者などのロールを割り当てて、メンバーに特定のアクセス権を付与します。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>特別なワークスペースロールは Control プランでのみご利用いただけます（<strong>${formattedPrice}</strong> から、${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり／月`}）。</muted-text>`,
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collect にダウングレード',
                note: '次の機能へのアクセス権がなくなります',
                benefits: {
                    confirm: 'Collect レートを適用するには、すべてのワークスペースの「プランタイプ」を「Collect」に変更する必要があります。',
                    benefit1: 'NetSuite、Sage Intacct、QuickBooks Desktop、Oracle、Microsoft Dynamics',
                    benefit2: 'Workday、Certinia',
                    benefit3: 'SSO/SAML',
                    benefit4: 'スマート経費ルール、日当、マルチレベル承認、カスタムレポート、予算管理',
                    headsUp: 'ご注意ください！',
                    multiWorkspaceNote: 'Collect料金でのサブスクリプションを開始するには、初回の月額支払いの前に、すべてのワークスペースをダウングレードする必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択 > プランタイプを変更',
                    benefit1Label: 'ERP 連携',
                    benefit2Label: '人事連携',
                    benefit3Label: 'セキュリティ',
                    benefit4Label: '詳細設定',
                    important: '重要:',
                },
                noteAndMore: 'など：',
            },
            completed: {
                headline: 'ワークスペースがダウングレードされました',
                description: 'Control プランのほかのワークスペースがあります。Collect レートで請求されるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '了解しました、ありがとうございます',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: '最終の支払い',
            description1: (formattedAmount: string) => `このサブスクリプションの最終請求額は<strong>${formattedAmount}</strong>です`,
            description2: (date: string) => `${date} の内訳は以下のとおりです：`,
            subscription:
                'ご注意ください！この操作を行うと、Expensify のサブスクリプションが終了し、このワークスペースが削除され、すべてのワークスペースメンバーが削除されます。このワークスペースを残したまま自分だけを抜けたい場合は、先に別の管理者に請求担当を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限あり',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `${workspaceName} ワークスペースでの操作は現在制限されています`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `ワークスペースオーナーである${workspaceOwnerName}が、ワークスペースの新しいアクティビティを有効にするために、登録済みの支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを有効にするには、登録済みの支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: 'ロック解除のために支払いカードを追加してください！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き利用するには、支払いカードを追加してください',
            pleaseReachOutToYourWorkspaceAdmin: 'ご不明な点がありましたら、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者にチャットで連絡',
            chatInAdmins: '#admins でチャット',
            addPaymentCard: '支払カードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>個々の経費に対する支出管理とデフォルト設定を行います。<a href="${categoriesPageLink}">カテゴリー</a>や<a href="${tagsPageLink}">タグ</a>に対するルールを作成することもできます。</muted-text>`,
                receiptRequiredAmount: '領収書が必要な金額',
                receiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、支出がこの金額を超える場合はレシートを必須にする。',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `金額は、明細付き領収書が必要な金額（${amount}）を超えることはできません`,
                itemizedReceiptRequiredAmount: '明細付き領収書が必要な金額',
                itemizedReceiptRequiredAmountDescription: '支出がこの金額を超える場合、カテゴリールールで上書きされていない限り、明細付き領収書を必須にする。',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `金額は、通常のレシートに必要な金額（${amount}）より少なくすることはできません`,
                maxExpenseAmount: '経費の最大金額',
                maxExpenseAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出にフラグを付けます。',
                maxAge: '最大年齢',
                maxExpenseAge: '最大経費日数',
                maxExpenseAgeDescription: '特定の日数より前の支出にフラグを付ける。',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count}日`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費の作成方法を選択してください。インポートされた会社カード取引でない場合、その経費は現金経費と見なされます。これには、手動で作成された経費、レシート、日当、距離、および時間に基づく経費が含まれます。',
                reimbursableDefault: '払い戻し対象',
                reimbursableDefaultDescription: '経費は多くの場合、従業員に精算されます',
                nonReimbursableDefault: '本人精算不可',
                nonReimbursableDefaultDescription: '経費が従業員に返金されることがあります',
                alwaysReimbursable: '常に精算可能',
                alwaysReimbursableDescription: '経費は常に従業員に払い戻されます',
                alwaysNonReimbursable: '常に精算対象外',
                alwaysNonReimbursableDescription: '経費は従業員に精算されません',
                billableDefault: '請求可能のデフォルト',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>現金およびクレジットカード経費をデフォルトで請求可能にするかどうかを選択してください。請求可能な経費は、<a href="${tagsPageLink}">タグ</a>で有効または無効にできます。</muted-text>`,
                billable: '請求可能',
                billableDescription: '経費は多くの場合、クライアントに再請求されます',
                nonBillable: '請求不可',
                nonBillableDescription: '経費はときどき顧客へ再請求されます',
                eReceipts: '電子レシート',
                eReceiptsHint: `eReceiptsは[ほとんどの米ドル建てクレジット取引に対して自動作成されます](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費について、1人あたりの費用を追跡します。',
                prohibitedDefaultDescription: 'これらの明細項目を含むレシートにフラグを付けて、手動で確認します。',
                prohibitedExpenses: '禁止経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル付帯費用',
                gambling: 'ギャンブル',
                tobacco: 'たばこ',
                adultEntertainment: 'アダルトエンターテインメント',
                giftCard: 'ギフトカード購入',
                handwrittenReceipt: '手書きレシート',
                requireCompanyCard: 'すべての購入に会社カードを必須にする',
                requireCompanyCardDescription: 'マイレージや日当経費を含む、すべての現金支出にフラグを付ける。',
                requireCompanyCardDisabledTooltip: 'ロック解除するには、「その他の機能」内の「会社カード」を有効にしてください。',
            },
            expenseReportRules: {
                title: '詳細設定',
                subtitle: '経費精算のコンプライアンス、承認、支払いを自動化。',
                preventSelfApprovalsTitle: '自己承認を防止',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分自身の経費レポートを承認できないようにする。',
                autoApproveCompliantReportsTitle: 'コンプライアンス準拠レポートを自動承認',
                autoApproveCompliantReportsSubtitle: '自動承認の対象とする経費レポートを設定します。',
                autoApproveReportsUnderTitle: 'すべての経費がこの金額以下のレポートを自動承認',
                autoApproveReportsUnderDescription: 'すべての経費がこの金額以下で完全準拠している経費精算書は、自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートについては、自動承認の対象であっても手動承認を必須にする',
                autoPayApprovedReportsTitle: '自動支払い対象の承認済みレポート',
                autoPayApprovedReportsSubtitle: '自動支払いの対象となる経費レポートを設定する。',
                autoPayApprovedReportsLimitError: (currency?: string) => `${currency ?? ''}20,000未満の金額を入力してください`,
                autoPayApprovedReportsLockedSubtitle: '「その他の機能」に移動してワークフローを有効にし、その後「支払い」を追加してこの機能を有効化してください。',
                autoPayReportsUnderTitle: '自動支払いレポートの対象:',
                autoPayReportsUnderDescription: 'この金額以下で完全準拠の経費精算書は、自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `この機能を利用するには、${featureName} を追加してください。`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `[その他の機能](${moreFeaturesLink})に移動し、${featureName} を有効にしてこの機能を利用できるようにしてください。`,
            },
            agentsPromoBanner: {
                title: '必要なルールが見つかりませんか？エージェントを追加してください',
                subtitle: '複雑なルールを追加し、カスタムエージェントで手動承認を減らしましょう。',
                cta: 'お試しください',
            },
            merchantRules: {
                title: '加盟店',
                subtitle: '経費が正しくコード化され、後処理が最小限で済むように、取引先ルールを設定しましょう。',
                addRule: '支払先ルールを追加',
                addRuleTitle: 'ルールを追加',
                editRuleTitle: 'ルールを編集',
                expensesWith: '対象となる経費条件:',
                expensesExactlyMatching: '次の条件に完全一致する経費の場合:',
                applyUpdates: 'これらの更新を適用する',
                saveRule: 'ルールを保存',
                previewMatches: 'プレビュー候補を表示',
                confirmError: '店舗名を入力し、少なくとも1つの更新を適用してください',
                confirmErrorMerchant: '加盟店を入力してください',
                confirmErrorUpdate: '少なくとも 1 つの更新を適用してください',
                previewMatchesEmptyStateTitle: '表示するものはありません',
                previewMatchesEmptyStateSubtitle: 'このルールに一致する未提出の経費はありません。',
                deleteRule: 'ルールを削除',
                deleteRuleConfirmation: 'このルールを削除してもよろしいですか？',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `加盟店 ${isExactMatch ? '完全一致' : '含む'}「${merchantName}」である場合`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `${merchantName} に名前を変更`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} を「${fieldValue}」に更新`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `"${reimbursable ? '経費精算対象' : '精算対象外'}" をマーク`,
                ruleSummarySubtitleBillable: (billable: boolean) => `「${billable ? '請求可能' : '請求対象外'}」としてマーク`,
                matchType: '一致タイプ',
                matchTypeContains: '含む',
                matchTypeExact: '完全一致',
                duplicateRuleTitle: '同様のマーチャントルールが既に存在します',
                duplicateRulePrompt: (merchantName: string) => `「${merchantName}」に対する既存のルールが、このルールよりも優先されます。保存しますか？`,
                saveAnyway: 'とにかく保存',
                applyToExistingUnsubmittedExpenses: '既存の未提出経費に適用',
                findRule: '加盟店ルールを検索',
                expenseDefaultsTitle: '経費のデフォルト設定',
                expenseDefaultsSubtitle: '申請者が何も操作しなくてもフィールドを更新する',
                ifAnyExpenseMatches: 'いずれかの経費が次の条件に一致する場合：',
                thenApplyFollowingDefaults: '次に、以下のデフォルトを適用します。',
            },
            categoryRules: {
                title: 'カテゴリルール',
                approver: '承認者',
                requireDescription: '説明が必要です',
                requireFields: '必須フィールド',
                requiredFieldsTitle: '必須項目',
                requiredFieldsDescription: (categoryName: string) => `これは、<strong>${categoryName}</strong> に分類されたすべての経費に適用されます。`,
                requireAttendees: '出席者を必須にする',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: (categoryName: string) => `従業員に「${categoryName}」の支出について追加情報を記載するよう促します。このヒントは経費の説明欄に表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロ向けヒント：短ければ短いほど良いです！',
                maxAmount: '最大金額',
                flagAmountsOver: '超過金額にフラグを付ける',
                flagAmountsOverDescription: (categoryName: string) => `カテゴリ「${categoryName}」に適用されます。`,
                flagAmountsOverSubtitle: 'これは、すべての経費の上限金額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリごとに経費金額にフラグを付けます。このルールは、経費金額の上限に関するワークスペース全体の一般ルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費レポートごとに、カテゴリ別の1日あたり合計支出をフラグ設定する。',
                },
                requireReceiptsOver: '～以上の領収書を必須',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: 'レシートを一切必須にしない',
                    always: '常に領収書を必須にする',
                },
                requireItemizedReceiptsOver: '明細付きレシートを必須にする期間',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: '明細付き領収書を求めない',
                    always: '常に明細付きの領収書を必須にする',
                },
                defaultTaxRate: 'デフォルト税率',
                enableWorkflows: (moreFeaturesLink: string) => `[その他の機能](${moreFeaturesLink})に移動してワークフローを有効にし、承認を追加してこの機能を有効化してください。`,
            },
            customRules: {
                title: '経費ポリシー',
                cardSubtitle: 'ここはチームの経費ポリシーが保存されている場所です。何が対象になるか、全員が同じ認識を持てます。',
                policyDocument: 'ポリシー文書',
                policyText: 'ポリシーテキスト',
            },
            spendRules: {
                title: '支出',
                subtitle: 'Expensify カードの取引をリアルタイムで承認または却下できます。',
                defaultRuleDescription: 'すべてのカード',
                block: 'ブロック',
                defaultRuleTitle: 'カテゴリ：アダルトサービス、ATM、ギャンブル、送金',
                builtInProtectionModal: {
                    title: 'Expensify カードには、常に標準で保護機能があります',
                    description: `Expensify は、次のような支払いを常に拒否します：

  ・アダルトサービス
  ・ATM
  ・ギャンブル
  ・送金

会社のキャッシュフローを守るために、支出ルールをさらに追加しましょう。`,
                },
                addSpendRule: '支出ルールを追加',
                cardPageTitle: 'カード',
                cardsSectionTitle: 'カード',
                chooseCards: 'カードを選択',
                saveRule: 'ルールを保存',
                allow: '許可',
                spendRuleSectionTitle: '支出ルール',
                addMerchant: '取引先を追加',
                merchantContains: '加盟店に次を含む',
                merchantExactlyMatches: '完全一致する加盟店',
                noBlockedMerchants: 'ブロックされている加盟店はありません',
                addMerchantToBlockSpend: '支出をブロックする加盟店を追加',
                noAllowedMerchants: '許可された加盟店はありません',
                addMerchantToAllowSpend: '支出を許可する加盟店を追加',
                matchType: 'マッチタイプ',
                matchTypeContains: '含む',
                matchTypeExact: '完全一致',
                maxAmount: '最大金額',
                maxAmountHelp: '加盟店や支出カテゴリの制限にかかわらず、この金額を超えるすべての支払いは拒否されます。',
                maxAmountCurrencyMismatchTitle: '通貨の不一致',
                maxAmountCurrencyMismatchPrompt: '上限金額を設定するには、同じ通貨で清算されるカードを選択してください。',
                reviewSelectedCards: '選択したカードを確認',
                summaryMoreCount: ({summary, count}: {summary: string; count: number}) => (count > 0 ? `${summary}、ほか+${count}件` : summary),
                confirmErrorApplyAtLeastOneSpendRuleToOneCard: '少なくとも1つの支出ルールを1枚のカードに適用してください',
                confirmErrorCardRequired: 'カードは必須項目です',
                confirmErrorApplyAtLeastOneSpendRule: '少なくとも 1 つの支出ルールを適用してください',
                categories: 'カテゴリ',
                merchants: '加盟店',
                noAvailableCards: 'すべてのカードにはすでにルールがあります',
                noAvailableCardsSubtitle: '既存のカードルールを編集して変更します',
                noCardsIssuedTitle: 'Expensify カードは発行されていません',
                noCardsIssuedSubtitle: 'Expensify カードを発行して支出ルールを作成しましょう',
                max: '最大',
                categoryOptions: {
                    [CONST.SPEND_RULES.CATEGORIES.AIRLINES]: '航空会社',
                    [CONST.SPEND_RULES.CATEGORIES.ALCOHOL_AND_BARS]: '酒類とバー',
                    [CONST.SPEND_RULES.CATEGORIES.AMAZON_AND_BOOKSTORES]: 'Amazon と書店',
                    [CONST.SPEND_RULES.CATEGORIES.AUTOMOTIVE]: '自動車',
                    [CONST.SPEND_RULES.CATEGORIES.CAR_RENTALS]: 'レンタカー',
                    [CONST.SPEND_RULES.CATEGORIES.DINING]: '外食',
                    [CONST.SPEND_RULES.CATEGORIES.FUEL_AND_GAS]: '燃料・ガス',
                    [CONST.SPEND_RULES.CATEGORIES.GOVERNMENT_AND_NON_PROFITS]: '政府機関・非営利団体',
                    [CONST.SPEND_RULES.CATEGORIES.GROCERIES]: '食料品',
                    [CONST.SPEND_RULES.CATEGORIES.GYMS_AND_FITNESS]: 'ジム・フィットネス',
                    [CONST.SPEND_RULES.CATEGORIES.HEALTHCARE]: '医療',
                    [CONST.SPEND_RULES.CATEGORIES.HOTELS]: 'ホテル',
                    [CONST.SPEND_RULES.CATEGORIES.INTERNET_AND_PHONE]: 'インターネットと電話',
                    [CONST.SPEND_RULES.CATEGORIES.OFFICE_SUPPLIES]: '事務用品',
                    [CONST.SPEND_RULES.CATEGORIES.PARKING_AND_TOLLS]: '駐車料金と通行料金',
                    [CONST.SPEND_RULES.CATEGORIES.PROFESSIONAL_SERVICES]: 'プロフェッショナルサービス',
                    [CONST.SPEND_RULES.CATEGORIES.RETAIL]: '小売業',
                    [CONST.SPEND_RULES.CATEGORIES.SHIPPING_AND_DELIVERY]: '配送と配達',
                    [CONST.SPEND_RULES.CATEGORIES.SOFTWARE]: 'ソフトウェア',
                    [CONST.SPEND_RULES.CATEGORIES.TRANSIT_AND_RIDESHARE]: '交通機関とライドシェア',
                    [CONST.SPEND_RULES.CATEGORIES.TRAVEL_AGENCIES]: '旅行代理店',
                },
                editRuleTitle: 'ルールを編集',
                deleteRule: 'ルールを削除',
                deleteRuleConfirmation: 'このルールを削除してもよろしいですか？',
                summaryMerchants: ({
                    merchants,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    merchants: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'ブロック済み' : '許可されています'} ${shownCount > 1 ? '加盟店' : '加盟店'}: ${merchants}${hiddenCount > 0 ? `、ほか +${hiddenCount} 件` : ''}`,
                summaryCategories: ({
                    categories,
                    hiddenCount,
                    shownCount,
                    action,
                }: {
                    categories: string;
                    hiddenCount: number;
                    shownCount: number;
                    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
                }) =>
                    `${action === CONST.SPEND_RULES.ACTION.BLOCK ? 'ブロック済み' : '許可されています'} ${shownCount > 1 ? 'カテゴリ' : 'カテゴリ'}: ${categories}${hiddenCount > 0 ? `、ほか +${hiddenCount} 件` : ''}`,
                defaultRuleSummary: 'アダルトサービス、ATM、ギャンブルなどを含むカテゴリ',
                findRule: 'ルールを検索',
                defaultSection: 'デフォルト',
                customRulesSection: 'カスタムルール',
                tableColumnType: '種類',
                tableColumnCard: 'カード',
                tableColumnRule: 'ルール',
                cardRulesUpsell: {
                    title: 'Expensify カードを入手して支出を管理しましょう',
                    subtitle:
                        'Expensify カードを使うと、利用限度額のルールを設定したり、特定の加盟店や購入タイプをブロックまたは許可したりできます。さらに、2％のキャッシュバックも受けられます。',
                    cta: 'カードを申し込む',
                },
                restrictCardSpendTitle: 'カード利用を制限',
                restrictCardSpendSubtitle: '販売時点で支出をブロックまたは制限します。',
                ifAnyCardMatches: 'いずれかのカードが次と一致する場合:',
                thenDoThisAtPointOfSale: 'あとは、販売時点で次のことを行ってください。',
                setRestrictions: '制限を設定',
                merchantRestrictions: '加盟店の制限',
                blockedMerchant: 'ブロックされた加盟店',
                blockedMerchantTypes: 'ブロックされた加盟店タイプ',
                maxAmountAbove: ({amount}: {amount: string}) => `${amount}以上`,
                restrictMerchants: '加盟店を制限する',
                merchantTypes: '加盟店種別',
                allowedMerchants: '許可された加盟店',
                allowedMerchantTypes: '許可された加盟店の種類',
                blockedMerchants: 'ブロックされた加盟店',
                currencies: '通貨',
                permittedCurrencies: '許可されている通貨',
                allCurrencies: 'すべての通貨',
                permittedCurrenciesSubtitle: 'すべての通貨、または特定の通貨のみを許可するように選択します',
                settlementCurrencyPermittedSubtitle: 'カードの決済通貨は常に許可されています',
                currenciesCurrencyMismatchTitle: '通貨の不一致',
                currenciesCurrencyMismatchPrompt: '希望する通貨を設定するには、同じ通貨で清算されるカードを選択してください。',
                restrictMerchantsOffSubtitle: '許可された通貨で、最大金額を超えない請求のみが承認されます',
                restrictMerchantsAllowSubtitle: '許可された通貨で、上限金額を超えず、加盟店または加盟店の種類が一致する場合に、チャージが承認されます。',
                restrictMerchantsBlockSubtitle: '承認される支出は、許可された通貨で上限金額を超えないもの、または加盟店または加盟店の種類が条件に一致するものです。',
                summaryCurrencies: ({currencies, hiddenCount, shownCount}: {currencies: string; hiddenCount: number; shownCount: number}) =>
                    `許可された ${shownCount > 1 ? '通貨' : '通貨'}：${currencies}${hiddenCount > 0 ? `、ほか +${hiddenCount} 件` : ''}`,
            },
            agentRules: {
                title: 'エージェントルール',
                subtitle: 'このワークスペースで AI エージェントが経費を処理する方法のルールを設定します。',
                enforcedBy: 'エージェントルールは次によって適用されます',
                ruleBotName: 'RuleBot',
                addRule: 'エージェントルールを追加',
                findRule: 'エージェントルールを検索',
                addRuleTitle: 'ルールを追加',
                editRuleTitle: 'ルールを編集',
                deleteRule: 'ルールを削除',
                deleteRuleConfirmation: 'このルールを削除してもよろしいですか？',
                describeRuleTitle: 'AI エージェントに従わせるルールを記述してください',
                disclaimer: 'AI エージェントは間違える場合があります。',
                agentCreatedTitle: 'RuleBot がワークスペースに追加されました!',
                agentCreatedDescription: (agentsRoute: string) =>
                    `<muted-text>エージェント ルールを適用するために、エージェントを作成し、ワークスペースの管理者として追加しました。<br><br>エージェントの詳細は <a href="${agentsRoute}">「アカウント」&gt;「エージェント」</a> で編集できます。</muted-text>`,
                revampSubtitle: '必要なときに実行できる柔軟なルールを設定します。',
                newRuleTitle: '新しいルール',
                describeRuleForConcierge: 'ルールの内容を入力すると、Concierge が自動作成します',
                nextButton: '次へ',
                gotIt: '了解しました',
            },
            tabs: {
                general: '一般',
                cardRestrictions: 'カードの制限',
                expenseDefaults: '経費のデフォルト設定',
                requireFields: '必須項目',
                flagForReview: '確認のためにフラグを付ける',
                agents: 'エージェント',
            },
            bulkActions: {
                deleteMultiple: () => ({
                    one: 'ルールを削除',
                    other: 'ルールを削除',
                }),
                deleteMultipleConfirmation: () => ({
                    one: 'このルールを削除してもよろしいですか？',
                    other: 'これらのルールを削除してもよろしいですか？',
                }),
            },
            generalTab: {
                title: '基本ルール',
                subtitle: '支出を管理する共通ルール',
                expensesOlderThan: '次の日付より前の経費にフラグを付ける',
                expensesAboveAmount: '指定金額を超える経費にフラグを付ける',
                flagReceiptLineItems: 'レシートの明細行にフラグを付ける',
                receiptRequirements: 'レシートを必須にする',
                receiptRequirementsSummary: ({regularAmount, itemizedAmount}: {regularAmount?: string; itemizedAmount?: string}) => {
                    if (regularAmount && itemizedAmount) {
                        return `通常経費は${regularAmount}以上、明細経費は${itemizedAmount}以上`;
                    }
                    if (regularAmount) {
                        return `通常分は ${regularAmount} を超える場合、明細化は不要です`;
                    }
                    if (itemizedAmount) {
                        return `明細の合計が ${itemizedAmount} を超える場合は、通常の明細入力を必須にしない`;
                    }
                    return '領収書を必須にしない';
                },
                requireFieldsForAllExpenses: 'すべての経費に必須項目を設定する',
                cashExpenses: '現金経費',
                cashExpensesReimbursableByDefault: 'デフォルトで精算対象',
                cashExpensesNonReimbursableByDefault: 'デフォルトで非精算扱い',
                cashExpensesAlwaysReimbursable: '常に精算対象',
                cashExpensesAlwaysNonReimbursable: '常に精算対象外',
                billableExpenses: '請求可能な経費',
                billableExpensesBillable: '現金およびクレジットカードの請求対象',
                billableExpensesNonBillable: '現金およびクレジットカード（請求対象外）',
            },
            requireReceipts: {
                title: 'レシートを必須にする',
                description: 'カテゴリルールで上書きされない限り、この金額を超える支出にはレシートを必須にします。',
                requireReceipt: '領収書を必須にする',
                requireItemizedReceipt: '項目別のレシートを必須にする',
                requireAboveAmount: '上記の金額を必須にする',
                saveRule: 'ルールを保存',
                emptyAmountError: '保存する前に有効な金額を入力してください',
            },
            requireFields: {title: 'すべての経費に必須項目を設定する', category: 'カテゴリ', tag: 'タグ', save: 'ルールを保存'},
            newRule: {
                title: '新しいルール',
                subtitle: '何をしたいですか？',
                restrictCardSpend: 'カード利用を制限',
                restrictCardSpendDescription: '販売時点で支出をブロックまたは制限する',
                applyExpenseDefaults: '経費のデフォルトを適用',
                applyExpenseDefaultsDescription: '申請者が何も操作しなくてもフィールドを更新する',
                flagForReview: '確認のためにフラグを付ける',
                flagForReviewDescription: '条件が満たされたときに通知します。',
                requireFields: '必須項目',
                requireFieldsDescription: '提出時の領収書、カテゴリなど',
                createAgentRule: 'エージェントルール',
                createAgentRuleDescription: '必要なときに実行できる柔軟なルールを設定します。',
            },
            expenseDefaultsTable: {
                tableColumnType: '種類',
                tableColumnCondition: '条件',
                tableColumnRule: 'ルール',
                findRule: 'ルールを検索',
                rename: '名前を変更',
                update: '更新',
                merchantIs: (merchant: string) => `加盟店名は「${merchant}」です`,
                merchantTypeIs: (merchantType: string) => `加盟店タイプ: 「${merchantType}」`,
            },
            merchantTypeRule: {merchantType: '加盟店種別', saveRule: 'ルールを保存', confirmErrorCategory: 'カテゴリを選択してください。'},
            requireFieldsTable: {
                tableColumnType: '種類',
                tableColumnCondition: '条件',
                tableColumnRule: 'ルール',
                findRule: 'ルールを検索',
                typeLabel: '必須項目',
                conditionCategoryIs: (category: string) => `カテゴリは「${category}」です`,
                requireDescription: '説明が必須です',
                requireAttendees: '参加者を必須にする',
                requireItemizedReceipt: '明細付きレシートを必須にする',
                requireItemizedReceiptOver: (amount: string) => `${amount} を超える金額には明細付き領収書が必要です`,
                alwaysRequireReceipt: '常にレシートを必須にする',
                requireReceiptOver: (amount: string) => `${amount} を超える領収書を必須にする`,
            },
            requireFieldsEmptyState: {
                title: '不足している詳細を事前に把握しましょう',
                subtitle: '経費を提出する前に、重要な項目がすべて入力されていることを確認してください。',
                cta: '必須ルールを作成',
            },
            requireFieldsRule: {
                title: '必須項目',
                subtitle: '提出時にレシートやカテゴリなどを必須にする',
                thenWarnMember: '不足している項目がある場合はメンバーに警告します:',
                itemizedReceipt: '明細付きレシート',
                saveRule: 'ルールを保存',
                confirmErrorCategory: 'カテゴリを選択してください。',
                confirmErrorField: '少なくとも 1 つの必須項目を選択してください。',
            },
            flagForReviewTable: {
                tableColumnType: '種類',
                tableColumnCondition: '条件',
                tableColumnRule: 'ルール',
                findRule: 'ルールを検索',
                typeLabel: 'フラグ',
                conditionCategoryAndAmount: (category: string, amount: string) => `カテゴリが「${category}」で、金額が ${amount} を超える場合`,
                conditionCategoryAndDailyAmount: (category: string, amount: string) => `カテゴリが「${category}」で、1日のカテゴリ合計が${amount}を超える場合`,
                flagForReview: '確認のためにフラグを付ける',
            },
            flagForReviewEmptyState: {
                title: '詳しく確認が必要な経費を洗い出します',
                subtitle: '特定の経費について、追加の確認が必要な場合に承認者へアラートを送信します。',
                cta: 'フラグルールを作成',
            },
            flagForReviewRule: {
                title: '確認のためにフラグを付ける',
                subtitle: '次の条件を満たしたときに承認者へ通知します。',
                saveRule: 'ルールを保存',
                confirmErrorCategory: 'カテゴリを選択してください。',
                confirmErrorAmount: '金額を入力してください。',
                thenFlagForReview: '次の条件で確認フラグを付けます：',
            },
            agentRulesEmptyState: {title: 'エージェントルールが追加されていません', subtitle: 'ワークスペースのポリシーを自動化するルールを作成します。', cta: 'AIルールを追加'},
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '回収',
                    description: 'プロセスの自動化を求めているチーム向け。',
                },
                corporate: {
                    label: 'コントロール',
                    description: '高度な要件を持つ組織向け。',
                },
                submit2026: {
                    label: '提出',
                    description: '雇用主に経費を提出したい従業員向け。',
                },
            },
            description: '自分に合ったプランをお選びください。',
            subscriptionLink: '詳しく見る',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `${annualSubscriptionEndDate} までの年間サブスクリプション期間中、Control プランでアクティブメンバー 1 名を利用することに同意しています。${annualSubscriptionEndDate} 以降、 自動更新を無効にすることで、従量課金サブスクリプションに切り替え、Collect プランへダウングレードできます。`,
                other: `あなたは、年間サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランでアクティブメンバー${count}名を契約しています。${annualSubscriptionEndDate}以降は、自動更新を無効にすることで、従量課金制サブスクリプションに切り替え、Collectプランへダウングレードできます。その操作は、`,
            }),
            subscriptions: 'サブスクリプション',
        },
        hr: {
            title: '人事',
            connections: '接続',
            connectionsSubtitle: '人事システムと連携して従業員データを同期し、精算を自動で正しい担当者に紐づけることで、手作業なしでチームの経費を正確に管理できます。',
            subtitle: '人事ツールを連携して、従業員の承認を常に同期させます。',
            connect: '接続',
            syncNow: '今すぐ同期',
            disconnect: '切断',
            disconnectTitle: (providerName: string) => `${providerName}を切断`,
            disconnectPrompt: (providerName: string) => `${providerName}を切断してもよろしいですか？`,
            alreadyConnectedTitle: '複数の人事プラットフォームには接続できません',
            alreadyConnectedPrompt: '別の人事プラットフォームに接続する前に、現在の人事プラットフォームとの接続を解除する必要があります。',
            lastSync: (relativeDate: string) => `最終同期: ${relativeDate}`,
            syncError: (providerName: string) => `${providerName}に接続できません`,
            connectionDescription: (providerName: string) => `${providerName}を接続して、従業員の承認をワークスペースと同期させましょう。`,
            approvalMode: '承認モード',
            providerApprovalMode: (providerName: string) => `${providerName} 承認モード`,
            finalApprover: '最終承認者',
            providerFinalApprover: (providerName: string) => `${providerName} 最終承認者`,
            notSet: '未設定',
            approvalModeDescription: (providerName: string) => `メンバーとマネージャーは ${providerName} と同期するように設定されています。`,
            approvalModeWarningTitle: '承認モードを変更しますか？',
            approvalModeWarningPrompt: (providerName: string, helpSiteURL: string) =>
                `このワークスペースの承認モードを変更してもよろしいですか？${providerName} 対応の各ワークフローモードについては、<a href="${helpSiteURL}">ヘルプサイト</a>で詳しくご覧いただけます。`,
            approvalModeWarningConfirm: '承認モードを変更',
            approvalModes: {
                basic: {label: '基本承認', description: 'すべてのユーザーは、処理と承認のために 1 人の担当者に提出します。'},
                manager: {
                    label: 'マネージャー承認',
                    description: (providerName: string) => `従業員は、${providerName} で設定された直属のマネージャーにレポートを提出します。`,
                },
                custom: {label: 'カスタム承認', description: 'Expensify で承認ワークフローを手動で設定します。'},
            },
            syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                switch (stage) {
                    case 'gustoSyncTitle':
                        return 'Gusto 従業員を同期中';
                    case 'gustoSyncLoadData':
                        return 'Gusto からデータを読み込んでいます';
                    case 'gustoSyncProvisioning':
                        return 'ポリシー内で従業員をプロビジョニングする';
                    case 'zenefitsSyncTitle':
                        return 'TriNet 従業員を同期しています';
                    case 'zenefitsSyncLoadData':
                        return 'TriNet からデータを読み込んでいます';
                    case 'zenefitsSyncProvisioning':
                        return 'ポリシー内で従業員をプロビジョニングする';
                    case 'jobDone':
                        return 'インポートしたデータの読み込みを待機しています';
                    default: {
                        return `ステージ「${stage}」の翻訳が見つかりません`;
                    }
                }
            },
            syncResults: {
                title: (provider: string) => `${provider} の同期が完了しました`,
                successTitle: (provider: string) => `${provider} との接続が正常に同期されました！`,
                added: '追加済み',
                removed: '削除済み',
                skipped: 'スキップ済み',
                employeeCount: () => ({
                    one: '1 従業員',
                    other: (count: number) => `${count} 従業員`,
                }),
            },
            gusto: {
                title: 'Gusto',
            },
            zenefits: {
                title: 'TriNet',
            },
            syncingModalTitle: '接続を同期しています',
            syncingModalDescription: '最初の接続には時間がかかる場合があります。エラーが発生した場合は通知されます。',
            syncing: '従業員を同期しています',
            mergeHR: {
                completeSetup: '設定を完了',
                setupIncomplete: (setupLink: string | undefined) =>
                    `<muted-text-label>接続されました。従業員をインポートするには ${setupLink ? `<a href="${setupLink}">セットアップを完了</a>` : '設定を完了'} に接続してください。</muted-text-label>`,
                groups: {title: 'グループ', description: 'このワークスペースと同期したい従業員グループを選択してください'},
            },
            notSync: '未同期',
            authenticationError: (providerName: string) => `有効期限が切れた接続のため、${providerName} に接続できません。`,
            reconnect: '再接続',
            reconnectLink: '再接続する',
        },
        emptyDomain: {
            title: 'ドメインでセキュリティを強化しましょう',
            subtitle: 'ドメインのメンバーにシングルサインオンでのログインを必須にし、ワークスペースの作成を制限するなどの管理ができます。',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: 'あなたの偉業への道を切り開くお手伝いをします！',
        description: '以下のサポートオプションから選択:',
        chatWithConcierge: 'Conciergeとチャット',
        scheduleSetupCall: 'セットアップの通話を予約',
        scheduleACall: '通話を予約',
        questionMarkButtonTooltip: 'サポートチームに問い合わせる',
        exploreHelpDocs: 'ヘルプドキュメントを確認',
        registerForWebinar: 'ウェビナーに登録',
        onboardingHelp: 'オンボーディングヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更',
        headers: {
            frequentlyUsed: 'よく使う',
            smileysAndEmotion: 'スマイリーと感情',
            peopleAndBody: '人物と体',
            animalsAndNature: '動物＆自然',
            foodAndDrink: '飲食',
            travelAndPlaces: '旅行と場所',
            activities: 'アクティビティ',
            objects: 'オブジェクト',
            symbols: '記号',
            flags: 'フラグ',
        },
        emojiNotSelected: '絵文字が選択されていません',
    },
    newRoomPage: {
        newRoom: '新しいルーム',
        groupName: 'グループ名',
        roomName: 'ルーム名',
        visibility: '表示',
        restrictedDescription: 'ワークスペース内のメンバーがこのルームを見つけることができます',
        privateDescription: 'このルームに招待された人は、このルームを見つけることができます',
        publicDescription: '誰でもこのルームを見つけられます',
        public_announceDescription: '誰でもこのルームを見つけられます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前のルームはすでに存在します',
        roomNameReservedError: (reservedName: string) => `${reservedName} はすべてのワークスペースで使われるデフォルトのルーム名です。別の名前を選択してください。`,
        roomNameInvalidError: 'ルーム名に使用できるのは、小文字のアルファベット、数字、ハイフンのみです',
        pleaseEnterRoomName: 'ルーム名を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}は"${oldName}"から"${newName}"に名前を変更しました` : `${actor}はこのルーム名を「${newName}」（以前は「${oldName}」）に変更しました`;
        },
        roomRenamedTo: (newName: string) => `ルーム名が${newName}に変更されました`,
        social: 'ソーシャル',
        selectAWorkspace: 'ワークスペースを選択',
        growlMessageOnRenameError: 'ワークスペースルームの名前を変更できません。接続を確認して、もう一度お試しください。',
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
            `既定のビジネス銀行口座を「${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}」（以前は「${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}」）に変更しました`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `会社住所を「${newAddress}」（以前は「${previousAddress}」）に変更しました` : `会社住所を「${newAddress}」に設定する`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `${field}「${name}」の承認者として${approverName}（${approverEmail}）を追加しました`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${field}「${name}」の承認者として、${approverName}（${approverEmail}）を削除しました`,
        updateApprovalRule: (field: string, name: string, newApproverEmail: string, newApproverName: string | undefined, oldApproverEmail: string, oldApproverName: string | undefined) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `${field}「${name}」の承認者を${formatApprover(newApproverName, newApproverEmail)}（以前は${formatApprover(oldApproverName, oldApproverEmail)}）に変更しました`;
        },
        addCategory: (categoryName: string) => `カテゴリ「${categoryName}」を追加しました`,
        deleteCategory: (categoryName: string) => `カテゴリ「${categoryName}」を削除しました`,
        updateCategory: (categoryName: string, oldValue: boolean) => `${oldValue ? '無効' : '有効'} カテゴリ「${categoryName}」`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に給与コード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」から給与コード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリの給与コードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」にGLコード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」からGLコード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリのGLコードを「${newValue}」に変更しました（以前は「${oldValue}」）`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `「${categoryName}」カテゴリーの説明を${!oldValue ? '必須' : '任意'}に変更しました（以前は${!oldValue ? '任意' : '必須'}）`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に上限額 ${newAmount} を追加しました`;
            }
            if (oldAmount && !newAmount) {
                return `カテゴリ「${categoryName}」から上限額 ${oldAmount} を削除しました`;
            }
            return `「${categoryName}」カテゴリの上限金額を${newAmount}に変更しました（以前は${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に上限タイプ ${newValue} を追加しました`;
            }
            return `「${categoryName}」カテゴリーの上限タイプを${newValue}（以前は${oldValue}）に変更しました`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `領収書を${newValue}に変更して、カテゴリ「${categoryName}」を更新しました`;
            }
            return `「${categoryName}」カテゴリを${newValue}に変更しました（以前は${oldValue}）`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: (categoryName: string, oldValue: string | undefined, newValue: string) => {
            if (!oldValue) {
                return `「${categoryName}」カテゴリーの「明細付きレシート」を${newValue}に変更して更新しました`;
            }
            return `「${categoryName}」カテゴリの明細付きレシートを${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: (oldName: string, newName: string) => `カテゴリ名を「${oldName}」から「${newName}」に変更しました`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明のヒント「${oldValue}」を削除しました`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明のヒント「${newValue}」を追加しました`
                : `「${categoryName}」カテゴリの説明のヒントを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateTagListName: (oldName: string, newName: string) => `タグリスト名を「${newName}」（以前は「${oldName}」）に変更しました`,
        addTag: (tagListName: string, tagName?: string) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました`,
        updateTagName: (tagListName: string, newName: string, oldName: string) => `タグリスト「${tagListName}」でタグ「${oldName}」を「${newName}」に変更して更新しました`,
        updateTagEnabled: (tagListName: string, tagName?: string, enabled?: boolean) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: (tagListName: string, tagName?: string) => `タグ「${tagName}」をリスト「${tagListName}」から削除しました`,
        deleteMultipleTags: (count?: string, tagListName?: string) => `リスト「${tagListName}」からタグ「${count}」個を削除しました`,
        updateTag: (tagListName: string, newValue: string, tagName: string, updatedField: string, oldValue?: string) => {
            if (oldValue) {
                return `${updatedField} を「${oldValue}」から「${newValue}」に変更して、リスト「${tagListName}」内のタグ「${tagName}」を更新しました`;
            }
            return `${updatedField}「${newValue}」を追加して、リスト「${tagListName}」上のタグ「${tagName}」を更新しました`;
        },
        updateCustomUnit: (customUnitName: string, newValue: string, oldValue: string, updatedField: string) =>
            `${customUnitName} の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `${newValue ? '有効' : '無効'} 距離レートでの税金追跡`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `${customUnitName}レート「${rateName}」を追加しました`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `${customUnitName} の ${updatedField}「${customUnitRateName}」のレートを「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `距離レート「${customUnitRateName}」の税率を「${oldValue}（${oldTaxPercentage}）」から「${newValue}（${newTaxPercentage}）」に変更しました`;
            }
            return `距離レート「${customUnitRateName}」に税率「${newValue}（${newTaxPercentage}）」を追加しました`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `距離レート「${customUnitRateName}」の税還付可能部分を「${newValue}」（以前は「${oldValue}」）に変更しました`;
            }
            return `距離単価「${customUnitRateName}」に対して、税金還付対象額「${newValue}」を追加しました`;
        },
        updatedCustomUnitRateName: (customUnitName: string, oldValue: string, newValue: string) => `${customUnitName}のレート名を「${oldValue}」から「${newValue}」に変更しました`,
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `${newValue ? '有効' : '無効'} の ${customUnitName} レート「${customUnitRateName}」`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `「${customUnitName}」レート「${rateName}」を削除しました`,
        updateReportFieldDefaultValue: (defaultValue?: string, fieldName?: string) => `レポートフィールド「${fieldName}」のデフォルト値を「${defaultValue}」に設定する`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `レポート項目「${fieldName}」にオプション「${optionName}」を追加しました`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `レポートフィールド「${fieldName}」のオプション「${optionName}」を${optionEnabled ? '有効' : '無効'}`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のすべてのオプション`;
            }
            return `レポート項目「${fieldName}」のオプション「${optionName}」を${allEnabled ? '有効' : '無効'}にし、すべてのオプションを${allEnabled ? '有効' : '無効'}にしました`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `${fieldType}レポートフィールド「${fieldName}」を削除しました`,
        preventSelfApproval: (oldValue: string, newValue: string) =>
            `「自分で承認を防止」を「${newValue === 'true' ? '有効' : '無効'}」（以前は「${oldValue === 'true' ? '有効' : '無効'}」）に更新しました`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定`;
            }
            return `月次レポートの提出日を「${newValue}」（以前は「${oldValue}」）に更新しました`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `「クライアントへの経費再請求」を「${newValue}」に更新しました（以前は「${oldValue}」）`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `「現金経費のデフォルト」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultTitleEnforced: (value: boolean) => `「デフォルトのレポートタイトルを適用」を有効にしました ${value ? 'オン' : 'オフ'}`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `カスタムレポート名の数式を「${newValue}」に変更しました（以前は「${oldValue}」）`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `このワークスペースの名前を「${newName}」（以前は「${oldName}」）に更新しました`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
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
                one: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。これまでに提出されたレポートは、引き続き受信トレイで承認できます。`,
                other: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。これまでに提出されたレポートは、引き続き受信トレイで承認可能です。`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `${policyName} でのあなたのロールを ${oldRole} からユーザーに更新しました。あなた自身のものを除き、すべての申請者経費チャットから削除されました。`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `デフォルト通貨を${newCurrency}（以前は${oldCurrency}）に更新しました`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `自動レポート頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを「${newValue}」（以前は「${oldValue}」）に更新しました`,
        upgradedWorkspace: 'このワークスペースを Control プランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳しくは<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をクリックしてください。`,
        downgradedWorkspace: 'このワークスペースを Collect プランにダウングレードしました',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `手動承認にランダムに回付されるレポートの割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました`,
        updatedManualApprovalThreshold: (oldLimit: string, newLimit: string) => `すべての経費の手動承認上限を${newLimit}に変更しました（以前は${oldLimit}）`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? '有効' : '無効'} 件のカテゴリ`;
                case 'tags':
                    return `${enabled ? '有効' : '無効'} 個のタグ`;
                case 'workflows':
                    return `${enabled ? '有効' : '無効'} 個のワークフロー`;
                case 'distance rates':
                    return `${enabled ? '有効' : '無効'} 件の距離レート`;
                case 'accounting':
                    return `${enabled ? '有効' : '無効'} 会計`;
                case 'Expensify Cards':
                    return `${enabled ? '有効' : '無効'} Expensify カード`;
                case 'travel invoicing':
                    return `${enabled ? '有効' : '無効'} 統合旅行請求`;
                case 'company cards':
                    return `${enabled ? '有効' : '無効'} 件の会社カード`;
                case 'invoicing':
                    return `${enabled ? '有効' : '無効'} 請求書作成`;
                case 'per diem':
                    return `${enabled ? '有効' : '無効'} 日当`;
                case 'receipt partners':
                    return `${enabled ? '有効' : '無効'} 件のレシートパートナー`;
                case 'rules':
                    return `${enabled ? '有効' : '無効'} 件のルール`;
                case 'tax tracking':
                    return `${enabled ? '有効' : '無効'} 税金の追跡`;
                default:
                    return `${enabled ? '有効' : '無効'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 名の出席者追跡`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 件の自動支払い承認済みレポート`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `自動支払い承認レポートのしきい値を「${newLimit}」に設定する`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `自動支払い承認レポートのしきい値を「${newLimit}」（以前は「${oldLimit}」）に変更しました`,
        removedAutoPayApprovedReportsLimit: '自動支払い承認レポートのしきい値を削除しました',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `デフォルトの承認者を${newApprover}に変更しました（以前は${previousApprover}）` : `デフォルト承認者を${newApprover}に変更しました`,
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
                ? `${members} の承認ワークフローを変更し、レポートをデフォルト承認者 ${approver} に提出するようにしました`
                : `${members} の承認ワークフローを変更し、レポートをデフォルトの承認者に提出するようにしました`;
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
                ? `${approver} の承認ワークフローを変更し、承認済みレポートを ${forwardsTo} に転送するようにしました（以前は ${previousForwardsTo} に転送）`
                : `${approver} の承認ワークフローを変更し、承認済みレポートを（以前は最終承認済みレポートを）${forwardsTo} に転送するようにしました`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `${approver} の承認ワークフローを、承認済みレポートを転送しないように変更しました（以前は ${previousForwardsTo} に転送）`
                : `${approver} の承認ワークフローを変更し、承認済みレポートを転送しないようにしました`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書の会社名を「${newValue}」に変更しました（以前は「${oldValue}」）` : `請求書の会社名を「${newValue}」に設定する`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `請求書の会社ウェブサイトを「${newValue}」（以前は「${oldValue}」）に変更しました` : `請求書の会社ウェブサイトを「${newValue}」に設定しました`,
        changedReimburser: (newReimburser: string, previousReimburser?: string) =>
            previousReimburser ? `認可された支払者を「${newReimburser}」（以前は「${previousReimburser}」）に変更しました` : `承認済み支払担当者を「${newReimburser}」に変更しました`,
        updateReimbursementEnabled: (enabled: boolean) => `${enabled ? '有効' : '無効'}件の精算`,
        updateCustomTaxName: (oldName: string, newName: string) => `カスタム税区分名を「${newName}」（以前は「${oldName}」）に変更しました`,
        updateCurrencyDefaultTax: (oldName: string, newName: string) => `ワークスペースの通貨デフォルト税率を「${newName}」（以前は「${oldName}」）に変更しました`,
        updateForeignCurrencyDefaultTax: (oldName: string, newName: string) => `外貨のデフォルト税率を「${newName}」に変更しました（以前は「${oldName}」）。`,
        addTax: (taxName: string) => `税「${taxName}」を追加しました`,
        deleteTax: (taxName: string) => `税金「${taxName}」を削除しました`,
        updateTax: (oldValue?: string | boolean | number, taxName?: string, updatedField?: string, newValue?: string | boolean | number) => {
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
        setReceiptRequiredAmount: (newValue: string) => `必要な領収書金額を「${newValue}」に設定`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `領収書必須金額を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedReceiptRequiredAmount: (oldValue: string) => `必須領収書金額を削除しました（以前の値：「${oldValue}」）`,
        setItemizedReceiptRequiredAmount: (newValue: string) => `明細付き領収書の必須金額を「${newValue}」に設定しました`,
        changedItemizedReceiptRequiredAmount: (oldValue: string, newValue: string) => `品目別レシートの必須金額を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedItemizedReceiptRequiredAmount: (oldValue: string) => `品目別レシートの必須金額を削除しました（以前の値：「${oldValue}」）`,
        setMaxExpenseAmount: (newValue: string) => `最大経費金額を「${newValue}」に設定`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `上限経費額を「${newValue}」に変更しました（以前は「${oldValue}」）`,
        removedMaxExpenseAmount: (oldValue: string) => `最大経費金額を削除しました（以前の値: 「${oldValue}」）`,
        setMaxExpenseAge: (newValue: string) => `最大経費日数を「${newValue}」日に設定`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `最大経費期限を「${newValue}」日に変更しました（以前は「${oldValue}」日）`,
        removedMaxExpenseAge: (oldValue: string) => `最大経費日数を削除（以前は「${oldValue}」日）`,
        updateCategories: (count: number) => `${count} 個のカテゴリーを更新しました`,
        updateTagList: (tagListName: string) => `リスト「${tagListName}」のタグを更新しました`,
        updateTagListRequired: (tagListsName: string, isRequired: boolean) => `タグリスト「${tagListsName}」を${isRequired ? '必須' : '必須ではありません'}に変更しました`,
        importTags: 'スプレッドシートからタグをインポートしました',
        deletedAllTags: 'すべてのタグを削除しました',
        updateCustomUnitDefaultCategory: (customUnitName: string, newValue?: string, oldValue?: string) =>
            `${customUnitName}のデフォルトカテゴリを「${newValue}」に変更しました ${oldValue ? `（以前の値 "${oldValue}"）` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `カスタム単位「${customUnitName}」のレートをインポートしました`,
        updateCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, customUnitSubRateName: string, oldValue: string, newValue: string, updatedField: string) =>
            `「${customUnitName}」のレート「${customUnitRateName}」、サブレート「${customUnitSubRateName}」の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        removedCustomUnitSubRate: (customUnitName: string, customUnitRateName: string, removedSubRateName: string) =>
            `「${customUnitName}」のレート「${customUnitRateName}」からサブレート「${removedSubRateName}」を削除しました`,
        addBudget: (frequency: string, entityName: string, entityType: string, shared?: string, individual?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `通知しきい値「${notificationThreshold}%」で` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `${entityType}「${entityName}」に、個人予算「${individual}」を${frequency}件と、共有予算「${shared}」を${frequency}件${thresholdSuffix}追加しました`;
            }
            if (typeof individual !== 'undefined') {
                return `${entityType}「${entityName}」に、${frequency} 個人予算「${individual}」${thresholdSuffix}を追加しました`;
            }
            return `${frequency}の共有予算「${shared}」${thresholdSuffix}を${entityType}「${entityName}」に追加しました`;
        },
        updateBudget: (
            entityType: string,
            entityName: string,
            oldFrequency?: string,
            newFrequency?: string,
            oldIndividual?: string,
            newIndividual?: string,
            oldShared?: string,
            newShared?: string,
            oldNotificationThreshold?: number,
            newNotificationThreshold?: number,
        ) => {
            const frequencyChanged = !!(newFrequency && oldFrequency !== newFrequency);
            const sharedChanged = !!(newShared && oldShared !== newShared);
            const individualChanged = !!(newIndividual && oldIndividual !== newIndividual);
            const thresholdChanged = typeof newNotificationThreshold === 'number' && oldNotificationThreshold !== newNotificationThreshold;
            const changesList: string[] = [];
            if (frequencyChanged) {
                changesList.push(`予算の頻度を「${newFrequency}」（以前は「${oldFrequency}」）に変更しました`);
            }
            if (sharedChanged) {
                changesList.push(`ワークスペースの合計予算を「${newShared}」に変更しました（以前は「${oldShared}」）`);
            }
            if (individualChanged) {
                changesList.push(`個人予算を「${newIndividual}」（以前は「${oldIndividual}」）に変更しました`);
            }
            if (thresholdChanged) {
                changesList.push(`通知のしきい値を「${newNotificationThreshold}%」に変更しました（以前は「${oldNotificationThreshold}%」）`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `${entityType}「${entityName}」の予算を更新しました`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `${entityType}「${entityName}」の予算頻度を「${newFrequency}」に変更しました（以前は「${oldFrequency}」）`;
                }
                if (sharedChanged) {
                    return `${entityType}「${entityName}」のワークスペース合計予算を「${newShared}」（以前は「${oldShared}」）に変更しました`;
                }
                if (individualChanged) {
                    return `${entityType}「${entityName}」の個別予算を「${newIndividual}」（以前は「${oldIndividual}」）に変更しました`;
                }
                return `${entityType}「${entityName}」の通知しきい値を「${newNotificationThreshold}%」（以前は「${oldNotificationThreshold}%」）に変更しました`;
            }
            return `${entityType}「${entityName}」の予算を更新しました：${changesList.join('; ')}`;
        },
        deleteBudget: (entityType: string, entityName: string, frequency?: string, individual?: string, shared?: string, notificationThreshold?: number) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `通知しきい値「${notificationThreshold}%」で` : '';
            if (shared && individual) {
                return `${entityType}「${entityName}」から、共有予算（${frequency}）「${shared}」と個人予算「${individual}」${thresholdSuffix}を削除しました`;
            }
            if (shared) {
                return `${entityType}「${entityName}」から「${shared}」の${frequency}共有予算${thresholdSuffix}を削除しました`;
            }
            if (individual) {
                return `${entityType}「${entityName}」から、${thresholdSuffix} を持つ「${individual}」の個人予算（${frequency}）を削除しました`;
            }
            return `${entityType}「${entityName}」から予算を削除しました`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `${enabled ? '有効' : '無効'} 時間追跡`;
        },
        updatedTimeRate: (newRate?: string, oldRate?: string) => {
            return `時給を「${newRate}」（以前は「${oldRate}」）に変更しました`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `禁止経費に「${prohibitedExpense}」を追加しました`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `禁止経費から「${prohibitedExpense}」を削除しました`,
        commuterExclusions: {
            changedToFixedDistance: '通勤分の除外方法を、申請ごとの固定距離に変更しました',
            setFixedDistance: ({distance, unit}: {distance: number; unit: string}) => {
                const isSingular = distance === 1;
                let unitLabel: string;
                if (unit === 'mi') {
                    unitLabel = isSingular ? 'マイル' : 'マイル';
                } else {
                    unitLabel = isSingular ? 'キロメートル' : 'キロメートル';
                }
                return `1件の経費申請につき固定除外距離を${distance} ${unitLabel}に設定します`;
            },
            changedFixedDistance: ({newDistance, oldDistance, unit}: {newDistance: number; oldDistance: number; unit: string}) =>
                `1件あたりの固定距離除外を${oldDistance} ${unit}から${newDistance} ${unit}に変更しました`,
            disabled: '距離レートで通勤を除外する設定を無効にしました',
        },
        updatedReimbursementChoice: (newReimbursementChoice: string, oldReimbursementChoice: string) =>
            `精算方法を「${newReimbursementChoice}」（以前は「${oldReimbursementChoice}」）に変更しました`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} ワークスペース参加リクエストの事前承認`,
        updatedDefaultTitle: (newDefaultTitle: string, oldDefaultTitle: string) => `カスタムレポート名の数式を「${newDefaultTitle}」に変更しました（以前は「${oldDefaultTitle}」）`,
        updatedOwnership: (oldOwnerEmail: string, oldOwnerName: string, policyName: string) => `${oldOwnerName}（${oldOwnerEmail}）から${policyName}の所有権を引き継ぎました`,
        updatedAutoHarvesting: (enabled: boolean) => `${enabled ? '有効' : '無効'} の送信を予約しました`,
        updatedIndividualBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
            summaryLink?: string,
            userEmail?: string,
        ) =>
            `お知らせです！このワークスペースには、${budgetTypeForNotificationMessage}「${budgetName}」に対して、${budgetFrequency}あたり「${budgetAmount}」の予算が設定されています。${userEmail} は現在 ${approvedReimbursedClosedSpend} を利用しており、これは予算の ${thresholdPercentage}% を超えています。さらに承認待ちが ${awaitingApprovalSpend}、未申請が ${unsubmittedSpend} あり、合計で ${totalSpend} になります。${summaryLink ? `<a href="${summaryLink}">こちらがレポートです</a>。これらすべての経費の記録としてご利用ください！` : ''}`,
        updatedSharedBudgetNotification: (
            budgetAmount: string,
            budgetFrequency: string,
            budgetName: string,
            budgetTypeForNotificationMessage: string,
            summaryLink: string | undefined,
            thresholdPercentage: number,
            totalSpend: number,
            unsubmittedSpend: number,
            awaitingApprovalSpend: number,
            approvedReimbursedClosedSpend: number,
        ) =>
            `お知らせです！このワークスペースには、${budgetTypeForNotificationMessage}「${budgetName}」に対して、${budgetFrequency}の予算額「${budgetAmount}」が設定されています。現在の金額は${approvedReimbursedClosedSpend}で、予算の${thresholdPercentage}%を超えています。さらに承認待ちの金額が${awaitingApprovalSpend}あり、まだ提出されていない金額が${unsubmittedSpend}あるため、合計は${totalSpend}になります。${summaryLink ? `<a href="${summaryLink}">こちらがレポートです</a>。これらすべての経費が記録用にまとめられています！` : ''}`,
        addedCardFeed: (feedName: string) => `カードフィード「${feedName}」を追加しました`,
        removedCardFeed: (feedName: string) => `カードフィード「${feedName}」を削除しました`,
        renamedCardFeed: (newName: string, oldName: string) => `カードフィードの名前を「${newName}」に変更しました（以前は「${oldName}」）`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `${email} さんに下4桁が ${cardLastFour} の${feedName ? `「${feedName}」` : ''}会社カードを割り当てました`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) => `${email} の未割り当て${feedName ? `「${feedName}」` : ''}会社カード（下4桁 ${cardLastFour}）`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) => `カードフィード「${feedName}」のカード取引を削除できるカード保有者の数：${enabled ? '有効' : '無効'}`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `カード明細フィード「${feedName}」の利用明細期間の終了日を変更しました${newValue ? ` を「${newValue}」に` : ''}${previousValue ? ` （以前の値：「${previousValue}」）` : ''}`,
        addedReportField: (fieldType: string, fieldName?: string, defaultValue?: string) =>
            `${fieldType}レポートフィールド「${fieldName}」を追加しました${defaultValue ? ` デフォルト値「${defaultValue}」付き` : ''}`,
        updatedMccGroupCategory: ({mccGroupName, oldCategory, newCategory}: {mccGroupName: string; oldCategory: string; newCategory: string}) =>
            `「${mccGroupName}」のデフォルト支出カテゴリーを「${newCategory}」に変更しました（以前は「${oldCategory}」）`,
        updatedRequireCompanyCards: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} の法人カード購入要件`,
        expensifyCardRule: {
            actionVerb: {block: 'ブロック済み', allow: '許可済み'},
            amountOperator: {
                over: '以上',
                under: '以下のいずれかの意味に応じてお使いください：  \n- 位置・場所：「〜の下」→「under」＝「〜の下」  \n- 条件・範囲：「〜のもとで／〜以下」→「under 18」＝「18歳未満」',
            },
            amountFilter: ({operator, amount}: {operator: string; amount: string}) => `金額が ${amount} を${operator}`,
            theCard: 'カード',
            multipleCards: ({count}: {count: number}) => ({
                one: '1 枚のカード',
                other: `${count} 枚のカード`,
            }),
            addRule: ({verb, filters, cards}: {verb: string; filters: string; cards: string}) => {
                let text = verb;
                if (filters !== '') {
                    text += ` ${filters}`;
                }
                text += `（${cards}）で`;
                return text;
            },
            removeRule: ({cards}: {cards: string}) => `${cards} から支出ルールを削除しました`,
            restrictionVerb: {block: 'ブロック', allow: 'のみ許可'},
            update: {
                modeChange: ({fromAction, toAction, cards}: {fromAction: string; toAction: string; cards: string}) => `${cards} の利用ルールを ${fromAction} から ${toAction} に変更しました`,
                appliedToAdditionalCards: ({count}: {count: number}) => ({
                    one: '追加で 1 枚のカードに支出ルールを適用しました',
                    other: `追加で ${count} 枚のカードに支出ルールを適用しました`,
                }),
                phraseVerb: {added: '追加しました', removed: '削除済み', changed: '変更しました', set: '設定', applied: '適用済み'},
                bodyMerchant: ({adjective, value}: {adjective: string; value: string}) => (adjective !== '' ? `${adjective}なマーチャント「${value}」` : `加盟店「${value}」`),
                bodyMerchantValueOnly: ({value}: {value: string}) => `「${value}」`,
                bodyMerchantChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `${oldValue} から ${newValue} へ${adjective}加盟店を変更しました` : `加盟店を「${oldValue}」から「${newValue}」に変更しました`,
                bodySpendCategory: ({adjective, value}: {adjective: string; value: string}) => (adjective !== '' ? `${adjective}な支出カテゴリ「${value}」` : `支出カテゴリ「${value}」`),
                bodySpendCategoryValueOnly: ({value}: {value: string}) => `「${value}」`,
                bodySpendCategoryChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `${adjective}支出カテゴリを「${oldValue}」から「${newValue}」に変更しました` : `支出カテゴリを「${oldValue}」から「${newValue}」に変更しました`,
                bodyMaxAmount: '最大金額',
                bodyMaxAmountSet: ({value}: {value: string}) => `最大金額を${value}に設定`,
                bodyMaxAmountChange: ({oldValue, newValue}: {oldValue: string; newValue: string}) => `最大金額を${oldValue}から${newValue}に変更しました`,
                bodyAppliedToAdditionalCards: ({count}: {count: number}) => ({
                    one: '1枚の追加カードに支出ルールを適用します',
                    other: `${count}枚の追加カードに支出ルールを適用します`,
                }),
                bodyRemovedFromCards: ({cards}: {cards: string}) => `${cards} からの支出ルール`,
                composeOnCards: ({content, cards}: {content: string; cards: string}) => `${cards} 上の ${content}`,
                composeFromCards: ({content, cards}: {content: string; cards: string}) => `${cards} からの ${content}`,
                bodyCurrency: ({adjective, value}: {adjective: string; value: string}) => (adjective !== '' ? `${adjective} 通貨「${value}」` : `通貨「${value}」`),
                bodyCurrencyValueOnly: ({value}: {value: string}) => `'${value}'`,
                bodyCurrencyChange: ({adjective, oldValue, newValue}: {adjective: string; oldValue: string; newValue: string}) =>
                    adjective !== '' ? `${adjective}通貨を「${oldValue}」から「${newValue}」に変更しました` : `通貨を「${oldValue}」から「${newValue}」に変更しました`,
                bodyCurrencyRestriction: '通貨制限',
            },
            allowedCurrencyFilters: ({currencies}: {currencies: string}) => `通貨 ${currencies}`,
            blockedCurrencyFilters: ({currencies}: {currencies: string}) => `${currencies} に含まれていない通貨`,
        },
        updatedCategoryTaxRate: ({categoryName, oldTax, newTax}: {categoryName: string; oldTax: string; newTax: string}) =>
            `「${categoryName}」カテゴリのデフォルト税率を「${newTax}」に変更しました（以前は「${oldTax}」）`,
        addCustomUnitRateWithAmount: (rateName: string, rateValue: string) => `「${rateName}」レート（${rateValue}）を追加しました`,
        addCustomUnitRateWithAmountAndStartDate: (rateName: string, rateValue: string, startDate: string) => `${startDate}から有効な「${rateName}」レート（${rateValue}）を追加しました`,
        addCustomUnitRateWithAmountAndEndDate: (rateName: string, rateValue: string, endDate: string) => `「${rateName}」レート（${rateValue}）を${endDate}まで有効として追加しました`,
        addCustomUnitRateWithAmountAndDates: (rateName: string, rateValue: string, startDate: string, endDate: string) =>
            `「${rateName}」レート（${rateValue}）を追加しました。有効期間：${startDate}〜${endDate}`,
        updatedCustomUnitRateDateRange: (rateName: string, newDateRange: string, oldDateRange: string) =>
            `距離レート「${rateName}」を更新し、${newDateRange} に適用しました（以前は ${oldDateRange}）`,
        customUnitRateDateRangeStartToEnd: (startDate: string, endDate: string) => `${startDate} - ${endDate}`,
        customUnitRateDateRangeFrom: (date: string) => `${date} から`,
        customUnitRateDateRangeUntilEnd: (date: string) => `${date}まで`,
        customUnitRateDateRangeAllDates: () => `すべての日付に対して`,
        policyCopy: {
            overview: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から概要をコピーしました`,
            employees: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からメンバーをコピーしました`,
            reportFields: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からレポート項目を 1 件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からレポート項目を ${count} 件コピーしました`,
            }),
            accounting: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から会計設定をコピーしました`,
            receiptPartners: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から領収書パートナー設定をコピーしました`,
            hr: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から人事設定をコピーしました`,
            categories: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からカテゴリを 1 件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から ${count} 件のカテゴリをコピーしました`,
            }),
            tags: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からタグを 1 件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から ${count} 個のタグをコピーしました`,
            }),
            taxes: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から税率を 1 件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から税率を ${count} 件コピーしました`,
            }),
            timeTracking: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からタイムトラッキング設定をコピーしました`,
            workflows: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からワークフローをコピーしました`,
            rules: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> からルールをコピーしました`,
            codingRules: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から取引先ルールを 1 件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から ${count} 件の取引先ルールをコピーしました`,
            }),
            distanceRates: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から距離レートを1件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から距離レートを ${count} 件コピーしました`,
            }),
            perDiem: ({sourcePolicyName, sourcePolicyURL}: {sourcePolicyName: string; sourcePolicyURL: string}) => ({
                one: `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から日当レートを1件コピーしました`,
                other: (count: number) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から日当レートを ${count} 件コピーしました`,
            }),
            invoices: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から請求書の設定をコピーしました`,
            travel: (sourcePolicyName: string, sourcePolicyURL: string) => `<a href="${sourcePolicyURL}">${sourcePolicyName}</a> から出張設定をコピーしました`,
        },
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: `このページへのアクセス権がありません。このルームに参加しようとしている場合は、ルームメンバーに追加してもらってください。別のお問い合わせですか？${CONST.EMAIL.CONCIERGE} までご連絡ください`,
        roomArchived: `このルームはアーカイブされたようです。ご不明な点があれば、${CONST.EMAIL.CONCIERGE} までお問い合わせください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `${memberName} さんをこのルームから削除してもよろしいですか？`,
            other: '選択したメンバーをこのルームから削除してもよろしいですか？',
        }),
        error: {
            genericAdd: 'このルームメンバーを追加する際に問題が発生しました',
        },
    },
    newTaskPage: {
        assignTask: 'タスクを割り当てる',
        assignMe: '自分に割り当てる',
        confirmTask: 'タスクを確定',
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
            created: (title: string) => `${title} のタスク`,
            completed: '完了としてマークしました',
            canceled: '削除されたタスク',
            reopened: '未完了としてマーク済み',
            error: '要求された操作を行う権限がありません',
        },
        markAsComplete: '完了としてマーク',
        markAsIncomplete: '未完了にする',
        assigneeError: 'このタスクの担当者を割り当てる際にエラーが発生しました。別の担当者をお試しください。',
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。後でもう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを削除してもよろしいですか？',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `${year}年${monthName}の明細書`,
    },
    keyboardShortcutsPage: {
        title: 'キーボードショートカット',
        subtitle: 'これらの便利なキーボードショートカットで時間を節約しましょう。',
        shortcuts: {
            openShortcutDialog: 'キーボードショートカットのダイアログを開きます',
            markAllMessagesAsRead: 'すべてのメッセージを既読にする',
            escape: 'ダイアログを閉じる',
            search: '検索ダイアログを開く',
            newChat: '新しいチャット画面',
            copy: 'コメントをコピー',
            openDebug: 'テスト設定ダイアログを開く',
            expenseReportSearch: '経費レポートを検索',
            goToWorkspace: '現在のレポートのワークスペースに移動',
        },
    },
    guides: {
        screenShare: '画面共有',
        screenShareRequest: 'Expensify が画面共有にあなたを招待しています',
    },
    search: {
        resultsAreLimited: '検索結果は制限されています。',
        viewResults: '結果を表示',
        applyFilters: 'フィルターを適用する',
        appliedFilters: '適用されたフィルター',
        resetFilters: 'フィルターをリセット',
        searchResults: {
            emptyResults: {
                title: '表示するものはありません',
                subtitle: `検索条件を調整するか、＋ボタンを使って作成してみてください。`,
            },
            emptyExpenseResults: {
                title: '経費はまだありません',
                subtitle: '経費を作成するか、Expensify をお試し利用して詳細を確認しましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使って経費を作成してください。',
            },
            emptyReportResults: {
                title: 'レポートはまだありません',
                subtitle: 'レポートを作成するか、Expensify を試用して詳細を確認しましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使ってレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: '請求書はまだありません',
                subtitle: '請求書を送信するか、Expensify を試用してさらに詳しく知りましょう。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使って請求書を送信してください。',
                subtitleCannotSend: '請求書を送信するには、Invoicesが有効なワークスペースが必要です。',
                subtitleCannotSendWithTestDrive: '請求書を送信するには、Invoicesが有効なワークスペースが必要です。Expensify を試用してさらに詳しく知りましょう。',
            },
            emptyTripResults: {title: 'まだ出張はありません', subtitle: 'まずは、下から最初の出張を予約しましょう。', buttonText: '出張を予約'},
            emptySubmitResults: {
                title: '提出できる経費はありません',
                subtitle: 'すべて完了しました。勝利の一周をしてきましょう！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックス度マックス。お見事です！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールに到達しました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ひと休みする時間です、お疲れさまでした。',
            },
            emptyStatementsResults: {
                title: '表示する経費がありません',
                subtitle: '結果がありません。フィルターの条件を調整してください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。リラックス度マックス。お見事です！',
            },
        },
        columns: '列',
        editColumns: '列の編集',
        resetColumns: '列をリセット',
        groupColumns: '列をグループ化',
        expenseColumns: '経費列',
        saveView: 'ビューを保存',
        deleteSavedSearch: '保存した検索を削除',
        deleteSavedSearchConfirm: 'この検索を削除してもよろしいですか？',
        searchName: '名前を検索',
        savedSearchesMenuItemTitle: '保存済み',
        urlCopied: 'URLをコピーしました',
        groupedExpenses: 'グループ化された経費',
        bulkActions: {
            editMultiple: '複数を編集',
            editMultipleTitle: '複数の経費を編集',
            editMultipleDescription: '変更は選択されたすべての経費に適用され、以前に設定された値は上書きされます。',
            approve: '承認',
            pay: '支払う',
            delete: '削除',
            hold: '保留',
            unhold: '保留を解除',
            reject: '却下',
            duplicateExpense: ({count}: {count: number}) => `${count === 1 ? '経費を複製' : '経費を一括複製'}`,
            noOptionsAvailable: '選択した経費グループには利用できるオプションがありません。',
            undelete: '削除を取り消す',
            duplicateReport: ({count}: {count: number}) => `${count === 1 ? 'レポート' : 'レポート'} を複製`,
        },
        filtersHeader: 'フィルター',
        filters: {
            date: {
                before: (date?: string) => `${date ?? ''} より前`,
                after: (date?: string) => `${date ?? ''} の後`,
                on: (date?: string) => `${date ?? ''} に発生`,
                customDate: 'カスタム日付',
                customRange: 'カスタム範囲',
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: '決してない',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '先月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '今月',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: '年初来（累計）',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: '過去12か月',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最新明細書',
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
                lessThan: (amount?: string) => `${amount ?? ''} 未満`,
                greaterThan: (amount?: string) => `${amount ?? ''}より大きい`,
                between: (greaterThan?: string, lessThan?: string) => {
                    if (greaterThan && lessThan) {
                        return `${greaterThan} 以上 ${lessThan} 未満`;
                    }
                    return '間';
                },
                equalTo: (amount?: string) => `${amount ?? ''} に等しい`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個人カード',
                closedCards: '解約済みカード',
                cardFeeds: 'カードフィード',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `すべての${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `すべてのCSVインポート済みカード${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                travelInvoicing: '出張費の一括請求',
            },
            bankAccount: {banks: '銀行口座', closedBankAccounts: '解約済み銀行口座'},
            reportField: (name: string, value: string) => `${name} は ${value} です`,
            current: '現在',
            past: '過去',
            submitted: '送信済み',
            approved: '承認済み',
            firstApprover: '最初の承認者',
            firstApproved: '最初に承認済み',
            paid: '支払い済み',
            exported: 'エクスポート済み',
            posted: '投稿日',
            withdrawn: '取下済み',
            billable: '請求可能',
            reimbursable: '払い戻し対象',
            purchaseCurrency: '購入通貨',
            sortOrder: {
                [CONST.SEARCH.SORT_ORDER.ASC]: '昇順',
                [CONST.SEARCH.SORT_ORDER.DESC]: '降順',
            },
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'カテゴリ',
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
                [CONST.SEARCH.WITHDRAWAL_TYPE.CENTRAL_TRAVEL_INVOICING]: '出張費の一括請求',
            },
            is: 'は',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '送信',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '承認',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '支払う',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'エクスポート',
            },
        },
        display: {
            label: '表示',
            sortBy: '並べ替え',
            sortOrder: '並べ替え順',
            groupBy: 'グループ化基準',
            limitResults: '結果の絞り込み',
        },
        has: '持っている',
        view: {label: '表示', table: 'テーブル', bar: 'バー', line: '折れ線', pie: '円グラフ'},
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
            [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'エクスポート',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'カテゴリ',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: '加盟店',
            [CONST.SEARCH.GROUP_BY.TAG]: 'タグ',
            [CONST.SEARCH.GROUP_BY.MONTH]: '月数',
            [CONST.SEARCH.GROUP_BY.WEEK]: '週数',
            [CONST.SEARCH.GROUP_BY.YEAR]: '年数',
            [CONST.SEARCH.GROUP_BY.QUARTER]: '四半期',
        },
        moneyRequestReport: {emptyStateTitle: 'まだ経費がありません', accessPlaceHolder: '詳細を開く'},
        noCategory: 'カテゴリなし',
        noMerchant: '店舗なし',
        noTag: 'タグなし',
        expenseType: '経費の種類',
        receiptType: '領収書の種類',
        receiptTypeValues: {
            ereceipt: '電子領収書',
            itemized: '明細',
            hotel: 'ホテル',
        },
        withdrawalType: '出金の種類',
        recentSearches: '最近の検索',
        recentChats: '最近のチャット',
        serverResults: '検索結果',
        searchIn: '検索対象',
        askConcierge: (message: string) => `Concierge に「${message}」と聞く`,
        searchPlaceholder: '何かを検索...',
        suggestions: '提案',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `候補があります${query ? `: ${query}` : ''}。${count}件の結果。`,
            other: (resultCount: number) => `候補があります${query ? `: ${query}` : ''}。${resultCount}件の結果。`,
        }),
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おっと、アイテムがたくさんありますね！まとめて整理して、間もなくConciergeからファイルをお送りします。',
        },
        exportedTo: 'エクスポート先',
        exportAll: {selectAllMatchingItems: '一致する項目をすべて選択', allMatchingItemsSelected: '一致する項目をすべて選択済み', selectAllOnThisPage: 'このページのすべてを選択'},
        errors: {
            pleaseSelectDatesForBothFromAndTo: '開始日と終了日の両方を選択してください',
        },
        spendOverTime: '時間経過による支出',
        tabs: {
            expenseReports: '経費精算書',
            reports: 'レポート',
            expenses: '経費',
            submit: '下書き',
            approve: '承認が必要',
            pay: '支払いの準備完了',
            accounting: '会計',
            export: 'エクスポート待ち',
            unapprovedCash: '現金発生主義',
            unapprovedCard: 'カード発生額',
            statements: 'カード明細',
            reconciliation: '銀行照合',
            insights: 'インサイト',
            topSpenders: '上位の支出者',
            topCategories: '上位カテゴリ',
            topMerchants: '上位加盟店',
        },
    },
    genericErrorPage: {
        title: 'おっと、問題が発生しました！',
        body: {
            helpTextMobile: 'アプリを一度閉じて再度開くか、または次に切り替えてください',
            helpTextWeb: 'web。',
            helpTextConcierge: '問題が解決しない場合は、次に連絡してください',
        },
        refresh: '更新',
    },
    fileDownload: {
        success: {
            title: 'ダウンロードしました！',
            message: '添付ファイルを正常にダウンロードしました！',
            qrMessage:
                '写真フォルダまたはダウンロードフォルダで、自分のQRコードのコピーを確認してください。プロのコツ：プレゼンテーションに追加して、聴衆がスキャンしてあなたと直接つながれるようにしましょう。',
        },
        generalError: {
            title: '添付ファイルエラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージへのアクセス',
            message: 'ストレージへのアクセス権がないため、Expensifyは添付ファイルを保存できません。権限を更新するには「設定」をタップしてください。',
        },
    },
    settlement: {
        status: {
            pending: '保留中',
            cleared: '支払済み',
            failed: '失敗しました',
        },
        failedError: ({link}: {link: string}) => `<a href="${link}">アカウントのロックを解除</a>すると、この精算を再試行します。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date}・出金 ID：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化基準:',
        selectGroupByOption: 'レポート内の経費のグループ化方法を選択',
        uncategorized: '未分類',
        noTag: 'タグなし',
        selectGroup: ({groupName}: {groupName: string}) => `${groupName} 内のすべての経費を選択`,
        groupBy: {
            category: 'カテゴリ',
            tag: 'タグ',
        },
    },
    report: {
        newReport: {
            createExpense: '経費を作成',
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポート用のワークスペースを選択してください。',
            emptyReportConfirmationTitle: 'すでに空のレポートがあります',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) => `${workspaceName} で別のレポートを作成してもよろしいですか？空のレポートには次からアクセスできます`,
            emptyReportConfirmationDontShowAgain: '今後このメッセージを表示しない',
            genericWorkspaceName: 'このワークスペース',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportFieldFailureMessage: 'フィールドの更新中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポート名の変更中に予期しないエラーが発生しました。しばらくしてからもう一度お試しください。',
        noActivityYet: 'まだアクティビティがありません',
        connectionSettings: '接続設定',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」（以前は「${oldValue}」）に変更しました`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」に設定`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `ワークスペース${fromPolicyName ? `（以前は${fromPolicyName}）` : ''}を変更しました`;
                    }
                    return `ワークスペースを${toPolicyName}${fromPolicyName ? `（以前は${fromPolicyName}）` : ''}に変更しました`;
                },
                changeType: (oldType: string, newType: string) => `種別を${oldType}から${newType}に変更しました`,
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
                    automaticActionOne: (label: string) => `${label} にエクスポート（経由：`,
                    automaticActionTwo: '会計設定',
                    manual: (label: string) => `このレポートを、${label} へ手動エクスポート済みとしてマークしました。`,
                    automaticActionThree: 'および、次のレコードを正常に作成しました:',
                    reimburseableLink: '立替経費',
                    nonReimbursableLink: '会社カード経費',
                    pending: (label: string) => `このレポートの${label}へのエクスポートを開始しました…`,
                    travelCardLink: 'トラベルカード経費',
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `このレポートを${label}にエクスポートできませんでした（"${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `レシートを追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: (amount: string, currency: string) => `他の場所で${currency}${amount}を支払いました`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `連携経由で${currency}${amount}を支払いました`,
                outdatedBankAccount: `支払元の銀行口座に問題があるため、支払いを処理できませんでした`,
                reimbursementACHBounceDefault: `ルーティング番号または口座番号の誤り、もしくは口座が閉鎖されているため、支払いを処理できませんでした`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `支払いを処理できませんでした：${returnReason}`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払元が銀行口座を変更したため、支払いを処理できませんでした`,
                reimbursementDelayed: `支払いは処理されましたが、あと1～2営業日遅れています`,
                selectedForRandomAudit: `ランダムに選択されて審査中`,
                selectedForRandomAuditMarkdown: `審査のために[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)`,
                share: ({to}: ShareParams) => `メンバーを${to}に招待しました`,
                unshare: ({to}: UnshareParams) => `メンバー ${to} を削除しました`,
                stripePaid: (amount: string, currency: string) => `支払い済み ${currency}${amount}`,
                takeControl: `管理権限を取得しました`,
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `${label}${errorMessage ? ` ("${errorMessage}")` : ''}との同期中に問題が発生しました。<a href="${workspaceAccountingLink}">ワークスペース設定</a>で問題を解決してください。`,
                integrationSyncFailedRecurrence: ({count}: {count: number}) => `（${count} 回繰り返し）`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `${feedName} との接続が切断されています。カードの取引明細の取込を再開するには、<a href='${workspaceCompanyCardRoute}'>銀行にログイン</a>してください。`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `Plaid によるビジネス銀行口座との接続が切断されています。Expensify カードを引き続きご利用いただくために、<a href='${walletRoute}'>銀行口座 ${maskedAccountNumber} を再接続</a>してください。`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) => {
                    const translatedRole = String(translations.workspace.common.roleName(role)).toLowerCase();
                    const article = role === CONST.POLICY.ROLE.AUDITOR ? '1つの' : 'a';
                    return didJoinPolicy ? `${email} さんがワークスペースの招待リンクから参加しました` : `${email} を ${article} ${translatedRole} として追加しました`;
                },
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} のロールを ${currentRole} から ${newRole} に更新しました`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド1を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド1に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド1を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド2を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド2に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド2を「${newValue}」に変更しました（以前は「${previousValue}」）`;
                },
                leftWorkspace: (nameOrEmail: string) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: (email: string, role: string) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} との連携を削除しました`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続済み`,
                leftTheChat: 'チャットを退出しました',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `ビジネス銀行口座 ${maskedBankAccountNumber} は、払い戻しまたは Expensify カードの精算に問題が発生したため自動的にロックされました。問題を解決するには、<a href="${linkURL}">ワークスペース設定</a>で修正してください。`,
                leftTheChatWithName: (nameOrEmail: string) => `${nameOrEmail ? `${nameOrEmail}: ` : ''}がチャットから退出しました`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `Expensify モバイルアプリを開いて、${amountAndMerchantText && `${amountAndMerchantText} `}の取引を確認してください`;
                },
            },
            error: {
                invalidCredentials: '認証情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `${summary}（${date} までの ${dayCount} ${dayCount === 1 ? '日' : '日数'} 分）`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `${date}の${timePeriod}の${summary}`,
        startTimer: 'タイマー開始',
        stopTimer: (duration: string) => `タイマーを停止 (${duration})`,
        scheduleOOO: '不在予定を設定',
        scheduleOOOTitle: '不在予定を設定',
        date: '日付',
        time: '時間（24時間表記）',
        durationAmount: '期間',
        durationUnit: '単位',
        reason: '理由',
        workingPercentage: '稼働率',
        dateRequired: '日付は必須です。',
        invalidTimeFormat: '有効な24時間表記の時刻を入力してください（例: 14:30）。',
        enterANumber: '数字を入力してください。',
        hour: '時間',
        day: '日数',
        week: '週間',
        month: 'か月',
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費レポート',
        companyCreditCard: '法人クレジットカード',
        receiptScanningApp: 'レシートスキャンアプリ',
        billPay: '支払管理',
        invoicing: '請求書作成',
        CPACard: 'CPAカード',
        payroll: '給与計算',
        travel: '出張',
        resources: 'リソース',
        expensifyApproved: 'Expensifyで承認済み！',
        pressKit: 'プレスキット',
        support: 'サポート',
        expensifyHelp: 'Expensifyヘルプ',
        terms: '利用規約',
        privacy: 'プライバシー',
        learnMore: '詳しく見る',
        aboutExpensify: 'Expensify について',
        blog: 'ブログ',
        jobs: 'ジョブ',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投資家向け情報',
        getStarted: '始める',
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
        lastChatMessagePreview: '最新チャットメッセージのプレビュー',
        workspaceName: 'ワークスペース名',
        chatUserDisplayNames: 'チャットメンバー表示名',
        scrollToNewestMessages: '最新のメッセージまでスクロール',
        scrollToActionBadgeTarget: '注意が必要なアクションまでスクロール',
        preStyledText: '事前にスタイル設定されたテキスト',
        viewAttachment: '添付ファイルを表示',
        contextMenuAvailable: 'コンテキストメニューが利用可能です。Shift+F10 を押して開きます。',
        contextMenuAvailableMacOS: 'コンテキストメニューが利用可能です。VO-Shift-M を押して開きます。',
        contextMenuAvailableNative: 'コンテキストメニューが利用可能です。ダブルタップして長押しで開きます。',
        selectAllFeatures: 'すべての機能を選択',
        selectAllTransactions: 'すべての取引を選択',
        selectAllItems: 'すべての項目を選択',
        openActionsMenu: 'アクションメニューを開く',
        selectAllCategories: 'すべてのカテゴリを選択',
        selectAllDistanceRates: 'すべての距離レートを選択',
        selectAllTags: 'すべてのタグを選択',
        selectAllTaxes: 'すべての税を選択',
        selectAllPerDiemRates: 'すべての日当レートを選択',
        selectAllMembers: 'すべてのメンバーを選択',
        selectAllValues: 'すべての値を選択',
        selectAllRules: 'すべてのルールを選択',
    },
    parentReportAction: {
        deletedReport: '削除されたレポート',
        deletedMessage: '削除されたメッセージ',
        deletedExpense: '削除された経費',
        reversedTransaction: '返戻取引',
        deletedTask: '削除されたタスク',
        hiddenMessage: '非表示のメッセージ',
    },
    threads: {
        thread: 'スレッド',
        replies: '返信',
        reply: '返信',
        from: '差出人',
        in: '内',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `${reportName}${workspaceName ? `${workspaceName} の中` : ''} から`,
    },
    qrCodes: {
        qrCode: 'QRコード',
        copy: 'URLをコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'フラグが付けられたすべてのメッセージは、モデレーターに送信されて確認されます。',
        chooseAReason: '通報する理由を下から選択してください:',
        spam: 'スパム',
        spamDescription: '無関係な未依頼の宣伝',
        inconsiderate: '思いやりがない',
        inconsiderateDescription: '侮辱的または無礼な表現で、意図が疑わしいもの',
        intimidation: '威圧',
        intimidationDescription: '正当な異議があるのに強引に自分の議題を押し進めること',
        bullying: 'いじめ',
        bullyingDescription: '服従を得るために個人を標的にすること',
        harassment: '嫌がらせ',
        harassmentDescription: '人種差別的、女性差別的、その他幅広い差別的な行為',
        assault: '暴行',
        assaultDescription: '害意を持って行われる、特定の相手を狙った感情的な攻撃',
        flaggedContent: 'このメッセージはコミュニティルール違反としてフラグが付けられたため、内容が非表示になっています。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告が送信され、メッセージは審査のために報告されます。',
        levelTwoResult: 'メッセージはチャンネルから非表示になり、匿名の警告が送信され、メッセージはレビュー用に報告されます。',
        levelThreeResult: 'チャンネルからメッセージを削除し、匿名で警告を送信、メッセージは審査のために報告されました。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '経費精算の提出を依頼',
        inviteToChat: 'チャットへの招待のみ',
        nothing: '何もしない',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '承認',
        decline: '却下',
    },
    actionableMentionTrackExpense: {
        submit: '誰かに送信する',
        categorize: '仕分けする',
        share: '会計士と共有する',
        nothing: '今のところ何もありません',
    },
    teachersUnitePage: {
        teachersUnite: '教師ユナイト',
        joinExpensifyOrg:
            'Expensify.org に参加して、世界中の不公正の解消に取り組みましょう。現在実施中の「Teachers Unite」キャンペーンでは、必需の学用品の費用を分担することで、すべての教育者を支援しています。',
        iKnowATeacher: '私は先生を知っています',
        iAmATeacher: '私は教師です',
        personalKarma: {
            title: 'パーソナルカルマを有効にする',
            description: '毎月の支出500ドルごとに1ドルを Expensify.org に寄付します',
            stopDonationsPrompt: 'Expensify.org への寄付をやめてもよろしいですか？',
        },
        getInTouch: '素晴らしいです！その方の情報を共有していただければ、こちらからご連絡いたします。',
        introSchoolPrincipal: '学校校長への紹介',
        schoolPrincipalVerifyExpense: 'Expensify.org は、低所得世帯の生徒がより良い学習体験を得られるよう、必要な学用品の費用を分担します。あなたの経費は、校長により確認されます。',
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
        outOfPocket: '返金可能',
        companySpend: '返金不可',
        personalCard: '個人のカード',
        companyCard: '会社カード',
        expensifyCard: 'Expensify カード',
        travelInvoicing: '出張費の一括請求',
        travelCard: 'トラベルカード',
    },
    distance: {
        addStop: '経由地を追加',
        address: '住所',
        waypointDescription: {
            start: '開始',
            stop: '停止',
        },
        mapPending: {
            title: 'マッピング保留中',
            subtitle: 'オンラインに戻ると地図が生成されます',
            onlineSubtitle: 'マップを設定しています。しばらくお待ちください',
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
            totalDistance: '合計距離',
            startMessageWeb: '旅行の<strong>開始時</strong>のオドメーターの写真を追加してください。ここにファイルをドラッグするか、またはアップロードするファイルを選択してください。',
            endMessageWeb: '旅行の<strong>終了時</strong>の走行距離計の写真を追加してください。ここにファイルをドラッグするか、アップロードするファイルを選択してください。',
            startTitle: '走行距離計の開始時の写真',
            endTitle: '走行距離計（終了時）の写真',
            deleteOdometerPhoto: '走行距離計の写真を削除',
            deleteOdometerPhotoConfirmation: 'この走行距離計の写真を削除してもよろしいですか？',
            cameraAccessRequired: '写真を撮影するにはカメラへのアクセス権限が必要です。',
            snapPhotoStart: '<muted-text-label>移動を<strong>開始</strong>するときに、走行距離計の写真を撮影してください。</muted-text-label>',
            snapPhotoEnd: '<muted-text-label>走行の<strong>終了時</strong>に、オドメーターの写真を撮影してください。</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: '位置情報の追跡を開始できませんでした。',
            failedToGetPermissions: '必要な位置情報の権限を取得できませんでした。',
        },
        trackingDistance: '距離を計測中...',
        stopped: '停止済み',
        start: '開始',
        stop: '停止',
        save: '保存',
        resume: '再開',
        discard: '破棄',
        discardDistanceTrackingModal: {
            title: '移動距離の追跡を破棄',
            prompt: '本当によろしいですか？現在の操作は破棄され、元に戻すことはできません。',
            confirm: '移動距離の追跡を破棄',
        },
        zeroDistanceTripModal: {
            title: '経費を作成できません',
            prompt: '開始地点と終了地点が同じ経路では経費を作成できません。',
        },
        locationRequiredModal: {
            title: '位置情報へのアクセスが必要です',
            prompt: 'GPSで距離の追跡を開始するには、端末の設定で位置情報へのアクセスを許可してください。',
            allow: '許可',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'バックグラウンド位置情報へのアクセスが必要です',
            prompt: 'GPSで距離を計測するには、デバイスの設定でバックグラウンド位置情報へのアクセス（「常に許可」オプション）を許可してください。',
        },
        preciseLocationRequiredModal: {
            title: '正確な位置情報が必要です',
            prompt: 'GPS距離の追跡を開始するには、デバイスの設定で「正確な位置情報」を有効にしてください。',
        },
        desktop: {
            title: 'スマートフォンで移動距離を記録',
            subtitle: 'GPSで自動的にマイルまたはキロメートルを記録し、移動をすぐに経費に変換しましょう。',
            button: 'アプリをダウンロード',
        },
        notification: {
            title: 'GPS追跡を実行中',
            body: 'アプリに移動して完了する',
        },
        continueGpsTripModal: {
            title: 'GPSでの走行記録を続けますか？',
            prompt: '前回のGPS走行中にアプリが終了したようです。その走行の記録を続けますか？',
            confirm: '旅程を続ける',
            cancel: '出張を表示',
        },
        signOutWarningTripInProgress: {
            title: 'GPS追跡を実行中',
            prompt: 'この旅行を破棄してサインアウトしてもよろしいですか？',
            confirm: '破棄してサインアウト',
        },
        switchToODWarningTripInProgress: {
            title: 'GPS追跡を実行中',
            prompt: 'GPS追跡を停止して、Expensify Classic に切り替えてもよろしいですか？',
            confirm: '停止して切り替える',
        },
        switchAccountWarningTripInProgress: {title: 'GPS トラッキングを実行中です', prompt: 'GPS 追跡を停止してアカウントを切り替えてもよろしいですか？', confirm: '停止して切り替える'},
        locationServicesRequiredModal: {
            title: '位置情報へのアクセスが必要です',
            confirm: '設定を開く',
            prompt: 'GPSで距離の追跡を開始するには、端末の設定で位置情報へのアクセスを許可してください。',
        },
        gpsFloatingPillText: 'GPS 追跡を実行中です…',
        liveActivity: {subtitle: '距離の記録', button: '進捗を表示', lockScreenBadgeText: '距離', lockScreenTrackingText: '追跡中…'},
    },
    reportCardLostOrDamaged: {
        screenTitle: '成績表の紛失または破損',
        nextButtonLabel: '次へ',
        reasonTitle: '新しいカードが必要な理由を教えてください。',
        cardDamaged: 'カードが破損しました',
        cardLostOrStolen: 'カードを紛失した、または盗難にあった',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは 2～3 営業日以内に到着します。現在お使いのカードは、新しいカードを有効化するまで引き続きご利用いただけます。',
        cardLostOrStolenInfo: '現在お使いのカードは、ご注文が確定すると同時に完全に無効化されます。ほとんどのカードは数営業日以内に到着します。',
        address: '住所',
        deactivateCardButton: 'カードを無効化',
        shipNewCardButton: '新しいカードを発送',
        addressError: '住所は必須です',
        reasonError: '理由は必須です',
        successTitle: '新しいカードを発送しました！',
        successDescription: '数営業日で到着したら有効化が必要です。その間はバーチャルカードをご利用いただけます。',
    },
    eReceipt: {
        guaranteed: '保証付き電子レシート',
        transactionDate: '取引日',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを開始して、<success><strong>友達を紹介しましょう</strong></success>。',
            header: 'チャットを開始、友達を紹介',
            closeAccessibilityLabel: '閉じる、チャットを開始、友達を紹介、バナー',
            body: '友だちにもExpensifyを使ってほしいですか？チャットを開始するだけで、あとはお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を申請し、<success><strong>チームを紹介しましょう</strong></success>。',
            header: '経費を提出し、チームを紹介する',
            closeAccessibilityLabel: '閉じる、経費を提出、チームを紹介、バナー',
            body: 'あなたのチームにもExpensifyを使ってほしいですか？チームに経費精算を1件提出するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友だちを紹介',
            body: '友だちにもExpensifyを使ってもらいませんか？チャットしたり支払ったり、経費を割り勘したりするだけで、あとはすべておまかせください。招待リンクを共有するだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友だちを紹介',
            header: '友だちを紹介',
            body: '友だちにもExpensifyを使ってもらいませんか？チャットしたり支払ったり、経費を割り勘したりするだけで、あとはすべておまかせください。招待リンクを共有するだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `ヘルプが必要な場合は、<a href="${href}">${adminReportName}</a> でアカウント担当者とチャットしてください`,
        default: `セットアップのサポートが必要な場合は、<concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> にメッセージを送信してください`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必須です',
        autoReportedRejectedExpense: 'この経費精算は却下されました。',
        billableExpense: '請求可能区分は無効になりました',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        categoryOutOfPolicy: 'カテゴリは無効です',
        conversionSurcharge: (surcharge: number) => `${surcharge}% の換算手数料を適用しました`,
        customUnitOutOfPolicy: 'このワークスペースでは有効なレートではありません',
        duplicatedTransaction: '重複の可能性',
        fieldRequired: 'レポートの項目は必須です',
        futureDate: '将来の日付は使用できません',
        inactiveVendor: 'ベンダーは無効です',
        invoiceMarkup: (invoiceMarkup: number) => `${invoiceMarkup}%値上げ済み`,
        maxAge: (maxAge: number) => `日付が${maxAge}日より前です`,
        missingCategory: 'カテゴリが未選択です',
        missingComment: '選択したカテゴリには説明が必要です',
        missingAttendees: 'このカテゴリには複数の参加者が必要です',
        missingTag: (tagName?: string) => `${tagName ?? 'タグ'} が見つかりません`,
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
                    return 'スキャンしたレシートの金額を超えています';
            }
        },
        modifiedDate: '日付がスキャンしたレシートと異なります',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `距離が計算されたルート距離（${formattedRouteDistance}）を超えています` : '距離が計算されたルートを超えています',
        nonExpensiworksExpense: 'Expensiworks 以外の経費',
        overAutoApprovalLimit: (formattedLimit: string) => `経費が自動承認限度額 ${formattedLimit} を超えています`,
        overCategoryLimit: (formattedLimit: string) => `1人あたりのカテゴリ上限 ${formattedLimit} を超えた金額`,
        overLimit: (formattedLimit: string) => `1人あたりの上限額 ${formattedLimit} を超過した金額`,
        overTripLimit: (formattedLimit: string) => `1回の出張あたりの上限${formattedLimit}超過額`,
        overLimitAttendee: (formattedLimit: string) => `1人あたりの上限額 ${formattedLimit} を超過した金額`,
        perDayLimit: (formattedLimit: string) => `1人あたりの1日上限額 ${formattedLimit} を超えたカテゴリ金額`,
        receiptNotSmartScanned: 'レシートと経費の詳細が手動で追加されました。',
        receiptRequired: (formattedLimit?: string, category?: string) => {
            if (formattedLimit && category) {
                return `レシートが必要です（カテゴリ上限 ${formattedLimit} を超過）`;
            }
            if (formattedLimit) {
                return `${formattedLimit} を超える場合は領収書が必要`;
            }
            if (category) {
                return `カテゴリの上限額を超えたため領収書が必要です`;
            }
            return '領収書が必要です';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `項目別の領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        prohibitedExpense: (prohibitedExpenseTypes: string | string[]) => {
            const preMessage = '禁止経費：';
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
                        return `ホテル諸雑費`;
                    case 'giftCard':
                        return `ギフトカード購入`;
                    case 'handwrittenReceipt':
                        return `手書きレシート`;
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
        customRules: (message: string) => message,
        reviewRequired: '要レビュー',
        rter: (
            brokenBankConnection: boolean,
            isAdmin: boolean,
            isTransactionOlderThan7Days: boolean,
            member?: string,
            rterType?: ValueOf<typeof CONST.RTER_VIOLATION_TYPES>,
            companyCardPageURL?: string,
            connectionLink?: string,
            isPersonalCard?: boolean,
            isMarkAsCash?: boolean,
        ) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行連携の不具合により、領収書を自動照合できません。';
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return '銀行連携の不具合により、領収書を自動照合できません。';
                }
                return isMarkAsCash
                    ? `カード連携の不具合により領収書を自動照合できません。無視するには現金としてマークするか、<a href="${connectionLink}">カードを修正</a>して領収書と照合してください。`
                    : `カード連携が壊れているため、領収書を自動照合できません。領収書を照合するには、<a href="${connectionLink}">カードの問題を解決</a>してください。`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行連携が切断されました。<a href="${companyCardPageURL}">レシートと照合するために再接続</a>`
                    : '銀行連携が切断されています。管理者に依頼して再接続し、領収書と照合してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member} に現金としてマークするよう依頼するか、7日待ってから再試行してください` : 'カード取引との照合待ちです。';
            }
            return '';
        },
        brokenConnection530Error: '銀行連携の不具合により領収書が保留されています',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の不具合により領収書が保留されています。<a href="${workspaceCompanyCardRoute}">会社カード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行連携の不具合により領収書が保留されています。ワークスペース管理者に対応を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いをリクエストします。',
        smartscanFailed: ({canEdit = true, missingFields = []}: {canEdit?: boolean; missingFields?: string[]}) => {
            if (missingFields.length > 0) {
                const fieldNames: Record<string, string> = {merchant: '加盟店', date: '日付', amount: '金額'};
                const translated = missingFields.map((f) => fieldNames[f] ?? f);
                const fieldList = translated.join('、');
                return `レシートのスキャンに失敗しました — ${fieldList}が見つかりません。${canEdit ? '詳細を手動で入力してください。' : ''}`;
            }
            return `レシートのスキャンに失敗しました。${canEdit ? '詳細を手動で入力してください。' : ''}`;
        },
        receiptGeneratedWithAI: 'AI生成の可能性があるレシート',
        someTagLevelsRequired: (tagName?: string) => `${tagName ?? 'タグ'} が見つかりません`,
        tagOutOfPolicy: (tagName?: string) => `${tagName ?? 'タグ'} は無効になりました`,
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: (taxName?: string) => `${taxName ?? '税金'} は有効期限切れです`,
        taxRateChanged: '税率が変更されました',
        taxRequired: '税率が未設定です',
        none: 'なし',
        taxCodeToKeep: '保持する税コードを選択',
        tagToKeep: 'どのタグを残すか選択',
        isTransactionReimbursable: '取引が経費精算対象かどうかを選択',
        merchantToKeep: '保持する店舗を選択',
        descriptionToKeep: '保持する説明を選択',
        categoryToKeep: '残すカテゴリを選択',
        isTransactionBillable: '取引が請求可能かどうかを選択',
        keepThisOne: 'これは残しておく',
        confirmDetails: `保持する詳細を確認`,
        confirmDuplicatesInfo: `保持しない重複分は、提出者が削除できるよう保留されます。`,
        hold: 'この経費は保留になっています',
        resolvedDuplicates: '重複を解消しました',
        companyCardRequired: '会社カードでの購入が必須です',
        noRoute: '有効な住所を選択してください',
        customUnitRateOutOfDateRange: ({startDate, endDate}: {startDate: string; endDate: string}) => `料金は${startDate}から${endDate}までのみ有効です`,
        customUnitRateOutOfDateRangeStartOnly: ({startDate}: {startDate: string}) => `料金は${startDate}からのみ有効です`,
        customUnitRateOutOfDateRangeEndOnly: ({endDate}: {endDate: string}) => `料金は${endDate}までのみ有効です`,
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `${fieldName} は必須です`,
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
        header: 'お帰りの前に',
        reasonPage: {
            title: '退会理由をお聞かせください',
            subtitle: 'お手数ですが、その前にExpensify Classicに切り替えたい理由を教えてください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic でのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'New Expensify の使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensify の使い方は理解していますが、Expensify Classic のほうが好みです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensify にはまだない、必要な機能は何ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしていますか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜExpensify Classicを好むのですか？',
        },
        responsePlaceholder: 'あなたの回答',
        thankYou: 'ご意見ありがとうございます！',
        thankYouSubtitle: '皆さまのご回答は、より便利で仕事がはかどる製品づくりに役立ちます。ご協力ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
        offlineTitle: 'ここで行き詰まってしまったようです…',
        offline:
            'オフラインのようです。申し訳ありませんが、Expensify Classic はオフラインでは使用できませんが、新しい Expensify はオフラインでも動作します。Expensify Classic を利用したい場合は、インターネットに接続できるときにもう一度お試しください。',
        quickTip: 'お役立ち情報…',
        quickTipSubTitle: 'expensify.com にアクセスすると、すぐに Expensify Classic を利用できます。簡単に開けるようにブックマークしておきましょう！',
        bookACall: '通話を予約',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費やレポート上でのダイレクトチャット',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルで何でもできる機能',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードで進む出張と経費管理',
        },
        bookACallTextTop: 'Expensify Classic に切り替えると、次の機能が利用できなくなります：',
        bookACallTextBottom: 'ぜひお電話で理由をお聞かせください。お客様のニーズについて話し合うために、シニアプロダクトマネージャーとの通話を予約できます。',
        takeMeToExpensifyClassic: 'Expensify Classic に移動',
        goBackJustOnce: '一度だけ戻る',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引にレシートを照合しました',
    },
    subscription: {
        authenticatePaymentCard: '支払カードを認証',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションの変更はできません。',
        badge: {
            freeTrial: (numOfDays: number) => `無料トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 日`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `お気に入りの機能をすべて引き続き利用するには、${date}までにお支払いカードを更新してください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `${date}の${purchaseAmountOwed}の請求を処理できませんでした。未払い金を清算するために支払カードを追加してください。`
                        : '未払い残高を清算するために、支払いカードを追加してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: (date: string) => `お支払い期限を過ぎています。サービスの中断を防ぐため、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払い期日を過ぎています。請求書のお支払いをお願いします。',
            },
            billingDisputePending: {
                title: 'カードに請求できませんでした',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `末尾が${cardEnding}のカードで${amountOwed}の請求に異議が申し立てられました。銀行との異議申立てが解決するまで、お客様のアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お支払いカードが完全に認証されていません。',
                subtitle: (cardEnding: string) => `末尾が${cardEnding}の支払いカードを有効化するには、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'カードに請求できませんでした',
                subtitle: (amountOwed: number) =>
                    `ご利用の支払いカードは残高不足のため承認されませんでした。未払い残高 ${amountOwed} を清算するには、再度お試しいただくか、新しい支払いカードを追加してください。`,
            },
            cardExpired: {
                title: 'カードに請求できませんでした',
                subtitle: (amountOwed: number) => `お支払いカードの有効期限が切れています。未払い残高 ${amountOwed} を清算するため、新しいお支払いカードを追加してください。`,
            },
            cardExpireSoon: {
                title: 'カードの有効期限がまもなく切れます',
                subtitle: 'ご利用の支払カードは今月末で有効期限が切れます。下の三点リーダーメニューをクリックしてカード情報を更新し、お気に入りの機能を引き続きご利用ください。',
            },
            retryBillingSuccess: {
                title: '成功しました！',
                subtitle: 'カードの請求が正常に完了しました。',
            },
            retryBillingError: {
                title: 'カードに請求できませんでした',
                subtitle: '再試行する前に、Expensifyでの請求を承認し、保留を解除してもらうために、銀行へ直接お電話ください。難しい場合は、別の支払い用カードを追加してみてください。',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `末尾が${cardEnding}のカードで${amountOwed}の請求に異議が申し立てられました。銀行との異議申立てが解決するまで、お客様のアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitle: '次のステップとして、チームが経費精算を開始できるように、<a href="#">セットアップチェックリストを完了してください</a>。',
            },
            trialStarted: {
                title: (numOfDays: number) => `トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日数'} 日！`,
                subtitle: 'すべてのお気に入り機能を引き続き利用するには、支払い用カードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアル期間は終了しました',
                subtitle: 'すべてのお気に入り機能を引き続き利用するには、支払い用カードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: 'オファーを獲得',
                subscriptionPageTitle: (discountType: number) => `<strong>最初の1年間${discountType}%オフ！</strong> 支払いカードを追加して、年額サブスクリプションを開始しましょう。`,
                onboardingChatTitle: (discountType: number) => `期間限定オファー：初年度が${discountType}%オフ！`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `${days > 0 ? `${days}日：` : ''}${hours}時間以内に請求：${minutes}分：${seconds}秒`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensify のサブスクリプション料金を支払うためのカードを追加してください。',
            addCardButton: '支払カードを追加',
            cardInfo: (name: string, expiration: string, currency: string) => `名前: ${name}、有効期限: ${expiration}、通貨: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `次回のお支払い日は${nextPaymentDate}です。`,
            cardEnding: (cardNumber: string) => `末尾が${cardNumber}のカード`,
            changeCard: '支払カードを変更',
            changeCurrency: '支払通貨を変更',
            cardNotFound: '支払いカードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証',
            requestRefund: '返金をリクエスト',
            requestRefundModal: {
                full: '返金を受けるのは簡単です。次回の請求日より前にアカウントをダウングレードするだけで、返金されます。<br /> <br /> ご注意：アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合はいつでも新しいワークスペースを作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'あなたのプラン',
            exploreAllPlans: 'すべてのプランを表示',
            customPricing: 'カスタム料金',
            asLowAs: (price: string) => `アクティブメンバー1人あたり月額${price}〜`,
            pricePerMemberMonth: (price: string) => `メンバー1人あたり/月 ${price}`,
            pricePerMemberPerMonth: (price: string) => `${price}（メンバー1人あたり／月）`,
            perMemberMonth: 'メンバー1人あたり／月',
            collect: {
                title: '回収',
                description: '経費、出張、チャットがすべて使える小規模ビジネス向けプラン。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify カードありのアクティブメンバーは ${lower}、Expensify カードなしのアクティブメンバーは ${upper} です。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify カードありのアクティブメンバーは ${lower}、Expensify カードなしのアクティブメンバーは ${upper} です。`,
                benefit1: 'レシートのスキャン',
                benefit2: '精算払い',
                benefit3: 'コーポレートカード管理',
                benefit4: '経費および出張の承認',
                benefit5: '出張予約とルール',
                benefit6: 'QuickBooks/Xero 連携',
                benefit7: '経費・レポート・ルームでチャット',
                benefit8: 'AI と人によるサポート',
            },
            control: {
                title: 'コントロール',
                description: '大企業向けの経費精算、出張管理、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify カードありのアクティブメンバーは ${lower}、Expensify カードなしのアクティブメンバーは ${upper} です。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify カードありのアクティブメンバーは ${lower}、Expensify カードなしのアクティブメンバーは ${upper} です。`,
                benefit1: 'Collect プランのすべての内容',
                benefit2: '多段階承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP連携（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人事統合（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタム分析とレポート作成',
                benefit8: '予算管理',
            },
            thisIsYourCurrentPlan: 'これは現在ご利用中のプランです',
            downgrade: 'Collect へダウングレード',
            upgrade: 'Control にアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensify カードで節約しましょう',
            saveWithExpensifyDescription: '節約計算ツールを使って、Expensify カードのキャッシュバックが Expensify の請求額をどれだけ減らせるか確認しましょう。',
            saveWithExpensifyButton: '詳細はこちら',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>あなたに最適なプランで、必要な機能をすべてご利用いただけます。各プランの機能比較については、<a href="${CONST.PRICING}">料金ページをご覧ください</a>。</muted-text>`,
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年額サブスクリプション',
            creditBalance: 'クレジット残高',
            taxExempt: '非課税扱いを申請',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '非課税ステータス',
            payPerUse: '従量課金',
            subscriptionSize: 'サブスクリプションサイズ',
            headsUp:
                'お知らせ：今すぐ購読人数を設定しない場合、初月のアクティブメンバー数を基準に自動的に設定されます。その場合、今後12か月間は少なくともその人数分のメンバー料金をお支払いいただくことになります。購読人数はいつでも増やせますが、現在の購読期間が終了するまでは減らすことができません。',
            zeroCommitment: '割引年額サブスクリプション料金でもコミットメントはゼロ',
        },
        subscriptionSize: {
            title: 'サブスクリプションサイズ',
            yourSize: 'サブスクリプションの規模は、任意のアクティブメンバーがその月に利用できる空き席数を指します。',
            eachMonth:
                '毎月、ご利用のサブスクリプションは、上で設定された人数分までのアクティブメンバーを対象とします。サブスクリプションの人数枠を増やすたびに、その新しい人数で新たな 12 か月間のサブスクリプションが開始されます。',
            note: '注：アクティブメンバーとは、あなたの会社ワークスペースに紐づく経費データを作成、編集、提出、承認、精算、またはエクスポートしたことがあるすべてのユーザーを指します。',
            confirmDetails: '新しい年額サブスクリプションの詳細を確認してください。',
            subscriptionSize: 'サブスクリプションサイズ',
            activeMembers: (size: number) => `${size} 名のアクティブメンバー／月`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年額サブスクリプションの期間中はダウングレードできません。',
            youAlreadyCommitted: (size: number, date: string) =>
                `${date} まで、すでに月あたり ${size} 名のアクティブメンバーという年間サブスクリプションにコミットしています。自動更新を無効にすると、${date} に従量課金制のサブスクリプションへ切り替えることができます。`,
            error: {
                size: '有効なサブスクリプション数を入力してください',
                sameSize: '現在のサブスクリプション数とは異なる数値を入力してください',
            },
        },
        paymentCard: {
            addPaymentCard: '支払カードを追加',
            enterPaymentCardDetails: '支払いカードの詳細を入力してください',
            security: 'Expensify は PCI-DSS に準拠し、銀行レベルの暗号化を使用し、お客様のデータを保護するために冗長化されたインフラストラクチャを活用しています。',
            learnMoreAboutSecurity: '当社のセキュリティについて詳しく見る',
        },
        expensifyCode: {
            title: 'Expensifyコード',
            discountCode: '割引コード',
            enterCode: 'サブスクリプションに適用するExpensifyコードを入力してください。',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `次の${validBillingCycles ? `${validBillingCycles}回の` : ''}請求に対して${promoDiscount}%の割引が適用されます。`,
            apply: '適用',
            error: {
                invalid: 'このコードは無効です',
            },
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `サブスクリプションタイプ: ${subscriptionType}、サブスクリプション規模: ${subscriptionSize}${expensifyCode ? `、Expensifyコード: ${expensifyCode}` : ''}、自動更新: ${autoRenew}、年間席数の自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年額',
            autoRenew: '自動更新',
            autoIncrease: '年間席数を自動増加',
            saveUpTo: (amountWithCurrency: string) => `アクティブメンバー1人あたり月額最大${amountWithCurrency}節約`,
            automaticallyIncrease: 'サブスクリプションの席数を超える有効メンバーが発生した場合に、年間席数を自動的に増やします。注：年間サブスクリプションの終了日は延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensify の改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: (date: string) => `更新日：${date}`,
            pricingConfiguration: '料金は設定内容によって異なります。最もお得にご利用いただくには、年額プランを選択し、Expensify カードをお申し込みください。',
            learnMore: (hasAdminsRoom: boolean) =>
                `<muted-text>詳しくは<a href="${CONST.PRICING}">料金ページ</a>をご覧いただくか、${hasAdminsRoom ? `<a href="adminsRoom">#adminsルーム。</a>` : '#admins ルーム。'}で当社チームにチャットでお問い合わせください</muted-text>`,
            estimatedPrice: '概算価格',
            changesBasedOn: 'これは、お客様の Expensify カードの利用状況と、以下のサブスクリプションオプションによって変わります。',
            collectBillingDescription: 'Collect ワークスペースは、年間契約なしで、メンバーごとに毎月課金されます。',
            pricing: '料金',
        },
        cancelSubscription: {
            title: 'サブスクリプションをキャンセル',
            subtitle: 'サブスクリプションをキャンセルする主な理由を教えてください。',
            subscriptionCanceled: {
                title: 'サブスクリプションを解約しました',
                subtitle: '年間サブスクリプションは解約されました。',
                info: 'ワークスペースを従量課金制で使い続けたい場合は、これで準備完了です。',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `今後のアクティビティや請求を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除</a>する必要があります。ワークスペースを削除すると、当月中に発生した未精算のアクティビティについて請求が行われることにご注意ください。`,
            },
            requestSubmitted: {
                title: 'リクエストを送信しました',
                subtitle:
                    'サブスクリプションの解約をご希望とのこと、お知らせいただきありがとうございます。ご依頼の内容を確認し、まもなく<concierge-link>Concierge</concierge-link>とのチャットを通じてご連絡いたします。',
            },
            acknowledgement: `解約を申請することにより、私は、Expensify の<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または私と Expensify 間のその他の適用されるサービス契約のいずれにおいても、Expensify は当該申請を承認する義務を負わず、また当該申請を承認するかどうかについての裁量が専ら Expensify にあることを認識し、これに同意します。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖、縮小、または買収',
        additionalInfoTitle: 'どのソフトウェアへ移行する予定で、その理由は何ですか？',
        additionalInfoInputLabel: 'あなたの回答',
    },
    roomChangeLog: {
        updateRoomDescription: 'ルームの説明を次の内容に設定:',
        clearRoomDescription: 'ルームの説明をクリアしました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替え:',
        switch: '切り替え',
        copilot: 'Copilot',
        copilotDelegatedAccess: 'Copilot：代理アクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにする',
        learnMoreAboutDelegatedAccess: '代理アクセスの詳細',
        addCopilot: 'コパイロットを追加',
        membersCanAccessYourAccount: '次のメンバーがあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'これらのアカウントにアクセスできます:',
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
        genericError: '問題が発生しました。もう一度お試しください。',
        onBehalfOfMessage: (delegator: string) => `${delegator} の代理として`,
        accessLevel: 'アクセス権限レベル',
        confirmCopilot: '以下でコパイロットを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。フルアクセスと制限付きアクセスの両方で、コパイロットはすべての会話と経費を閲覧できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return '他のメンバーがあなたに代わってアカウント内のすべての操作を行えるようにします。チャット、申請、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'あなたの代わりに、あなたのアカウントでほとんどの操作を行えるように他のメンバーを許可します。ただし、承認、支払い、却下、および保留は除きます。';
                default:
                    return '';
            }
        },
        removeCopilot: 'コパイロットを削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'ご本人確認を行います',
        enterMagicCode: (contactMethod: string) => `コパイロットを追加するには、${contactMethod} に送信されたマジックコードを入力してください。1〜2分以内に届きます。`,
        enterMagicCodeUpdate: (contactMethod: string) => `コパイロットを更新するため、${contactMethod} に送信されたマジックコードを入力してください。`,
        notAllowed: 'ちょっと待ってください…',
        noAccessMessage: Str.dedent(`
            副操縦士としては、このページにアクセスできません。申し訳ありません。
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `${accountOwnerEmail} の<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">コパイロット</a>として、この操作を行う権限がありません。申し訳ありません。`,
        removeCopilotAccess: '自分のコパイロットアクセスを削除',
        removeCopilotAccessTitle: 'コパイロットアクセスを削除しますか？',
        removeCopilotAccessConfirmation: ({delegatorName}: RemoveCopilotAccessConfirmationParams) =>
            `${delegatorName}のExpensifyアカウントへのコパイロットアクセスを削除してもよろしいですか？この操作は元に戻せません。`,
        removeCopilotAccessConfirm: 'アクセスを削除',
        copilotAccess: 'Copilot へのアクセス',
    },
    debug: {
        debug: 'デバッグ',
        details: '詳細',
        JSON: 'JSON',
        reportActions: '操作',
        reportActionPreview: 'プレビュー',
        nothingToPreview: 'プレビューするものはありません',
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
        booleanFields: 'ブール値フィールド',
        constantFields: '定数フィールド',
        dateTimeFields: 'DateTimeフィールド',
        date: '日付',
        time: '時間',
        none: 'なし',
        visibleInLHN: 'LHN に表示',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: '偽',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: '下書きコメントあり',
            hasGBR: 'GBR あり',
            hasRBR: 'RBR あり',
            pinnedByUser: 'メンバーによりピン留め',
            hasIOUViolations: 'IOU 違反があります',
            hasAddWorkspaceRoomErrors: 'ワークスペースのルーム追加エラーがあります',
            isUnread: '未読（フォーカスモード）',
            isArchived: 'アーカイブ済み（最新モード）',
            isSelfDM: '自分へのDM',
            isFocused: '一時的にフォーカスされています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストあり（管理者用ルーム）',
            isUnreadWithMention: '未読（メンションあり）',
            isWaitingForAssigneeToCompleteAction: '担当者のアクション完了を待機中',
            hasChildReportAwaitingAction: '対応が必要な子レポートがあります',
            hasMissingInvoiceBankAccount: '請求書の銀行口座が未設定',
            hasUnresolvedCardFraudAlert: '未解決のカード不正利用アラートがあります',
            hasDEWApproveFailed: 'DEW の承認が失敗しました',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションのデータにエラーがあります',
            hasViolations: '違反があります',
            hasTransactionThreadViolations: 'トランザクションスレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '対応が必要なレポートがあります',
            theresAReportWithErrors: 'エラーのあるレポートがあります',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位のエラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題が発生しました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法の確認が必要です',
            theresAProblemWithAPaymentMethod: '支払方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: '立替金払い戻し口座に問題があります',
            theresABillingProblemWithYourSubscription: 'ご利用中のサブスクリプションの請求に問題があります',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'ご利用のサブスクリプションは正常に更新されました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました',
            theresAProblemWithYourWallet: 'ウォレットに問題があります',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
            aBankAccountIsLocked: '銀行口座がロックされています',
            completeHrSetup: '人事設定を完了する',
            theresAProblemWithAnHRConnection: '人事連携に問題が発生しています',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: 'New Expensifyへようこそ！',
        subtitle: '従来のエクスペリエンスでおなじみの機能に、あなたの毎日をさらに楽にする数多くのアップグレードを加えました。',
        confirmText: 'さあ、行こう！',
        helpText: '2分デモを試す',
        features: {
            search: 'モバイル、Web、デスクトップでさらに強力な検索',
            concierge: '経費処理を自動化する内蔵のConcierge AI',
            chat: 'あらゆる経費でチャットして、疑問をすばやく解決しましょう',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>まずは<strong>こちらから！</strong></tooltip>',
        saveSearchTooltip: '<tooltip>保存済み検索の<strong>名前を変更</strong>しましょう！</tooltip>',
        accountSwitcher: '<tooltip>ここから<strong>Copilot アカウント</strong>にアクセスできます</tooltip>',
        outstandingFilter: '<tooltip><strong>承認が必要な</strong>経費を絞り込む</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して\n<strong>試用を完了しましょう！</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS追跡を実行中です！完了したら、下で追跡を停止してください。</tooltip>',
        hasFilterNegation: '<tooltip><strong>-has:receipt</strong> を使って、レシートのない経費を検索します。</tooltip>',
        mileageRateAutoUpdated: '<tooltip>出張日にもとづいてレートを更新しました。</tooltip>',
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
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> の空き時間</muted-text>`,
        },
        confirmation: {
            title: '通話を確認',
            description: '以下の詳細をご確認ください。問題なければ通話を確定してください。確定後、詳細情報を記載した招待状をお送りします。',
            setupSpecialist: 'お客様のアカウント担当者',
            meetingLength: '会議時間',
            dateTime: '日時',
            minutes: '30分',
        },
        callScheduled: '通話を予約しました',
    },
    autoSubmitModal: {
        title: 'すべて問題なく送信されました！',
        description: 'すべての警告と違反はクリアされたので、',
        submittedExpensesTitle: 'これらの経費は提出済みです',
        submittedExpensesDescription: 'これらの経費は承認者に送信されていますが、承認されるまでは引き続き編集できます。',
        pendingExpensesTitle: '保留中の経費が移動されました',
        pendingExpensesDescription: '未処理のカード経費は、計上されるまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分間のテストドライブを試す',
        },
        banner: {
            currentlyTestDrivingExpensify: '現在、Expensify を試用中です',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: 'はじめる',
        },
        employeeInviteMessage: (name: string) => `# ${name} さんがExpensifyのお試し利用に招待しました
やあ！経費精算を最速でこなせるExpensifyを、*3か月間無料*でお試しできることになったよ。

使い方がわかるように、こちらが*テスト用レシート*です。`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: 'すべてのデータ - レポートレベル',
        expenseLevelExport: 'すべてのデータ - 経費レベル',
        exportInProgress: 'エクスポート処理中',
        conciergeWillSend: 'Conciergeがまもなくファイルを送信します。',
        currentView: '現在のビュー',
    },
    exportDownload: {
        preparingTitle: 'Preparing download...',
        preparingBody: 'You can either wait for the download to finish or Concierge can send it to you via chat.',
        sendFromConcierge: "Send me the file when it's ready",
        conciergeTitle: 'You bet!',
        conciergeBody: 'Concierge will send you a message when the file is ready.',
        goToConcierge: 'Go to Concierge',
        dismiss: 'Dismiss',
        readyTitle: 'Your file is ready!',
        readyBody: "If it didn't automatically download, use the button below.",
        downloadFile: 'Download file',
        failedTitle: 'Export failed',
        csvFailedBody: 'Your export could not be completed. Please try again later.',
        pdfFailedBody: 'Your file could not be generated. Try again, or reach out to Concierge for help.',
        readyPartialBody: ({count, total}: {count: number; total: number}) =>
            `${count} of ${total} reports exported. If it didn't automatically download, use the button below. See which reports failed in <concierge-link>Concierge</concierge-link>.`,
        close: 'Close',
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) => `続行する前に、DNS 設定を更新して、<strong>${domainName}</strong> の所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNS プロバイダーにアクセスし、<strong>${domainName}</strong> の DNS 設定を開いてください。`,
            addTXTRecord: '次の TXT レコードを追加してください。',
            saveChanges: '変更を保存してからここに戻り、ドメインを確認してください。',
            youMayNeedToConsult: `検証を完了するには、組織の IT 部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳細はこちら</a>。`,
            warning: '確認が完了すると、あなたのドメイン上のすべてのExpensifyメンバーに、アカウントがあなたのドメインで管理されることを知らせるメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しいただき、問題が解決しない場合はConciergeまでお問い合わせください。',
        },
        domainVerified: {
            title: 'ドメインが確認されました',
            header: 'やった！ドメインが認証されました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン<strong>${domainName}</strong>は正常に認証されました。これで、SAML などのセキュリティ機能を設定できます。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーが Expensify にログインする方法を、より細かく管理できるセキュリティ機能です。有効化するには、自身が会社の権限ある管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、かんたんにログイン',
            moreSecurityAndControl: 'さらなるセキュリティと管理権限',
            onePasswordForAnything: 'すべてをひとつのパスワードで',
        },
        goToDomain: 'ドメインへ移動',
        samlLogin: {
            title: 'SAMLログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン（SSO）</a> を使ってメンバーのサインイン方法を設定しましょう。</muted-text>`,
            enableSamlLogin: 'SAML ログインを有効にする',
            allowMembers: 'メンバーが SAML でログインできるようにする。',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしているメンバーは、SAML を使用して再認証する必要があります。',
            enableError: 'SAML有効化設定を更新できませんでした',
            requireError: 'SAML 必須設定を更新できませんでした',
            disableSamlRequired: '必須なSAMLを無効にする',
            oktaWarningPrompt: 'よろしいですか？これにより Okta SCIM も無効になります。',
            requireWithEmptyMetadataError: '有効にするには、以下にアイデンティティプロバイダーのメタデータを追加してください',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `<muted-text>SAML ログインを有効にするには、<a href="${twoFactorAuthSettingsUrl}">二要素認証の強制</a>を無効にしてください。</muted-text>`,
        },
        samlConfigurationDetails: {
            title: 'SAML 設定の詳細',
            subtitle: 'これらの詳細を使用して SAML を設定します。',
            identityProviderMetadata: 'IDプロバイダーのメタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: 'Name ID 形式',
            loginUrl: 'ログインURL',
            acsUrl: 'ACS（Assertion Consumer Service）URL',
            logoutUrl: 'ログアウトURL',
            sloUrl: 'SLO（シングルログアウト）URL',
            serviceProviderMetaData: 'サービスプロバイダー・メタデータ',
            oktaScimToken: 'Okta SCIM トークン',
            revealToken: 'トークンを表示',
            fetchError: 'SAML の構成詳細を取得できませんでした',
            setMetadataGenericError: 'SAMLメタデータを設定できませんでした',
        },
        accessRestricted: {
            title: 'アクセスが制限されています',
            subtitle: (domainName: string) => `以下の管理が必要な場合は、<strong>${domainName}</strong> の承認済み会社管理者としてご本人確認を行ってください。`,
            companyCardManagement: 'コーポレートカード管理',
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
            findAdmin: '管理者を検索',
            primaryContact: '主要連絡先',
            addPrimaryContact: '主な連絡先を追加',
            setPrimaryContactError: '主要連絡先を設定できませんでした。後でもう一度お試しください。',
            consolidatedDomainBilling: 'ドメイン一括請求',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>有効にすると、主な連絡先は <strong>${domainName}</strong> メンバーが所有するすべてのワークスペースの支払いを行い、すべての請求書の受領書を受け取ります。</muted-text-label></comment>`,
            consolidatedDomainBillingError: '統合ドメインの請求を変更できませんでした。後でもう一度お試しください。',
            addAdmin: '管理者を追加',
            addAdminError: 'このメンバーを管理者として追加できませんでした。もう一度お試しください。',
            revokeAdminAccess: '管理者アクセスを取り消す',
            cantRevokeAdminAccess: '技術担当者から管理者アクセス権を取り消すことはできません',
            error: {
                removeAdmin: 'このユーザーを管理者から削除できません。もう一度お試しください。',
                removeDomain: 'このドメインを削除できません。もう一度お試しください。',
                removeDomainNameInvalid: 'リセットするドメイン名を入力してください。',
            },
            resetDomain: 'ドメインをリセット',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `ドメインのリセットを確認するため、<strong>${domainName}</strong> と入力してください。`,
            enterDomainName: 'ここにドメイン名を入力してください',
            resetDomainInfo: `この操作は<strong>完全に削除</strong>され、次のデータが消去されます。<br/> <bullet-list><bullet-item>会社カードの接続およびそれらのカードに紐づく未申報経費</bullet-item><bullet-item>SAML とグループ設定</bullet-item><bullet-item>旅行データおよび Expensify Travel へのアクセス</bullet-item></bullet-list> すべてのアカウント、ワークスペース、レポート、経費、およびその他のデータはそのまま残ります。<br/><br/>注：<a href="#">連絡方法</a>から関連付けられたメールアドレスを削除すると、このドメインをドメイン一覧から消去できます。`,
        },
        domainMembers: 'ドメインメンバー',
        members: {
            title: 'メンバー',
            findMember: 'メンバーを検索',
            addMember: 'メンバーを追加',
            allMembers: 'すべてのメンバー',
            email: 'メールアドレス',
            closeAccount: () => ({
                one: 'アカウントを閉じる',
                other: 'アカウントを閉じる',
            }),
            closeAccountPrompt: '本当によろしいですか？この操作は元に戻せません。',
            forceCloseAccount: () => ({one: 'アカウントを強制的に閉鎖', other: 'アカウントを強制的に閉鎖'}),
            safeCloseAccount: () => ({
                one: 'アカウントを安全に閉じる',
                other: 'アカウントを安全に閉じる',
            }),
            closeAccountInfo: () => ({
                one: '保留中の承認、処理中の精算、代替ログイン方法がない場合などでもアカウントを閉鎖できるように、安全にアカウントを閉鎖することを推奨します: <bullet-list><bullet-item>保留中の承認</bullet-item><bullet-item>進行中の払い戻し</bullet-item><bullet-item>代替ログイン方法なし</bullet-item></bullet-list>それ以外の場合は、上記の安全上の注意を無視して、選択したアカウントを強制的に閉鎖できます。',
                other: '保留中の承認、処理中の精算、代替ログイン方法がない場合などでもアカウントを閉鎖できるように、安全にアカウントを閉鎖することを推奨します: <bullet-list><bullet-item>保留中の承認</bullet-item><bullet-item>進行中の払い戻し</bullet-item><bullet-item>代替ログイン方法なし</bullet-item></bullet-list>それ以外の場合は、上記の安全上の注意を無視して、選択したアカウントを強制的に閉鎖できます。',
            }),
            error: {
                removeMember: 'このユーザーを削除できません。もう一度お試しください。',
                addMember: 'このメンバーを追加できませんでした。もう一度お試しください。',
                vacationDelegate: 'このユーザーを休暇代理人として設定できませんでした。もう一度お試しください。',
                moveMember: 'このメンバーを移動できませんでした。もう一度お試しください。',
                moveMemberNotPolicyAdmin:
                    'メンバーをドメイングループに移動できません。このユーザーを移動しようとしているドメイングループに設定された優先ポリシーのポリシー管理者である必要があります。',
            },
            cannotSetVacationDelegateForMember: (email: string) => `${email} に休暇代理人を設定できません。現在、このユーザーは次のメンバーの代理人になっています。`,
            reportSuspiciousActivityPrompt: (email: string) =>
                `本当によろしいですか？これにより、<strong>${email}</strong> さんのアカウントがロックされます。<br /><br />その後、当社のチームがアカウントを確認し、不正アクセスを削除します。アクセスを回復するには、Concierge と連携して対応してもらう必要があります。`,
            reportSuspiciousActivityConfirmationPrompt: 'アカウントが安全にロック解除できることを確認するために審査し、質問がある場合はConciergeを通じてご連絡します。',
            emptyMembers: {title: 'このグループにはメンバーがいません', subtitle: 'メンバーを追加するか、上のフィルターを変更してみてください。'},
            moveToGroup: 'グループへ移動',
            chooseWhereToMove: ({count}: {count: number}) => `${count} ${count === 1 ? 'メンバー' : 'メンバー'} を移動する先を選択してください。`,
            domainGroup: 'ドメイングループ',
            chooseWhereToMoveName: ({name}: {name: string}) => `${name} をどこに移動するか選択してください。`,
            membersFeatureList: {
                subtitle: ({domainName}: {domainName: string}) =>
                    `<muted-text>Expensify で <strong>${domainName}</strong> メンバーをより細かく管理できるように、ドメインを確認してください。</muted-text>`,
                controlPolicyCreation: 'ワークスペースの作成を制限',
                enableSamlSso: 'SAML SSO を有効にする',
                enforce2FA: '2 要素認証を必須にする',
            },
        },
        common: {
            settings: '設定',
            forceTwoFactorAuth: '2要素認証を必須にする',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `<muted-text>2 要素認証を必須にするには、<a href="${samlPageUrl}">SAML</a> を無効にしてください。</muted-text>`,
            forceTwoFactorAuthDescription: `<muted-text>このドメインのすべてのメンバーに二要素認証を必須にします。ドメインメンバーは、サインイン時に自分のアカウントで二要素認証を設定するよう求められます。</muted-text>`,
            forceTwoFactorAuthError: '2要素認証の強制設定を変更できませんでした。後でもう一度お試しください。',
            resetTwoFactorAuth: '2 要素認証をリセット',
            error: 'この変更を保存できませんでした。もう一度お試しください。',
        },
        groups: {
            title: 'グループ',
            memberCount: () => ({one: 'メンバー 1 人', other: (count: number) => `${count}名のメンバー`}),
            defaultGroup: '新しいメンバーのデフォルトグループ',
            defaultGroupPrompt: (currentName: string, newName: string) =>
                `本当に ${newName} をデフォルトグループに設定しますか？新しいメンバーは、以前のデフォルトグループ (${currentName}) ではなく、このグループに招待されます。`,
            makeDefault: 'デフォルトに設定',
            neverMind: 'やめておく',
            createGroupError: 'このグループを作成できませんでした。もう一度お試しください。',
            permissions: 'グループの権限',
            createNewGroupButton: '新しいグループ',
            createGroupSubmitButton: 'グループを作成',
            expensifyCardPreferredWorkspace: 'Expensify Card の優先ワークスペース',
            expensifyCardPreferredWorkspaceDescription: 'すべてのExpensify Cardトランザクションは、優先ワークスペースではなくExpensify Card優先ワークスペースで作成されます。',
            strictlyEnforceWorkspaceRules: 'ワークスペースのルールを厳密に適用する',
            strictlyEnforceWorkspaceRulesDescription: 'レポートを送信する前にすべてのワークスペースのルールを満たす必要があります。手動による例外は許可されていません。',
            restrictExpenseWorkspaceCreation: '経費ワークスペースの作成／削除を制限する',
            restrictExpenseWorkspaceCreationDescription:
                'メンバーが経費ワークスペースを作成したり、経費ワークスペースから自分自身を削除したりできないようにします。これは、厳格なワークスペース適用と組み合わせることで、ドメイン外での使用を目的としたレポートの提出に Expensify が利用されるのを防ぐのに役立ちます。',
            deleteGroup: 'グループを削除',
            deleteGroupDangerConfirmationModal: 'グループを削除',
            deleteGroupDangerConfirmationModalDescription: (defaultGroupName: string) =>
                `本当によろしいですか？これにより、すべてのメンバーがデフォルトグループ（${defaultGroupName}）に再割り当てされ、元に戻すことはできません。`,
            deleteGroupError: 'このグループを削除できませんでした。もう一度お試しください。',
            preferredWorkspace: '優先ワークスペース',
            preferredWorkspaceDescription: (enabled: boolean) => `すべての新しいレポートと経費は${enabled ? '選択された優先' : 'この'}ワークスペースに作成されます。`,
            preferredWorkspaceSelectDescription: 'すべての新しい経費とレポートはこのワークスペースに作成されます。',
            noWorkspacesMessage: 'このドメインにワークスペースがありません。この制限を有効にするにはワークスペースが必要です。',
            restrictDefaultLoginSelection: 'デフォルトのログイン選択を制限する',
            restrictDefaultLoginSelectionDescription: 'メンバーがポリシー制限を回避するために、ログイン用のメールアドレスを会社のドメイン以外に変更することを防ぎます。',
            expensifyCardPreferredWorkspaceDisabledMessage: 'この設定を有効にするには、まず優先するワークスペースを有効にし、ドメインでExpensify Cardsを設定してください。',
            findGroup: 'グループを検索',
        },
    },
    proactiveAppReview: {
        title: '新しい Expensify をお楽しみいただけていますか？',
        description: '経費精算の体験をさらに良くできるよう、お知らせください。',
        positiveButton: 'やった！',
        negativeButton: 'そうでもありません',
    },
    monthPickerPage: {month: '月', selectMonth: '月を選択してください'},
};
export default translations;
