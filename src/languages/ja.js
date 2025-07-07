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
        count: 'カウント',
        cancel: 'キャンセル',
        dismiss: '却下する',
        yes: 'はい',
        no: 'いいえ',
        ok: 'OK',
        notNow: '今は無理',
        learnMore: '詳しくはこちら。',
        buttonConfirm: '了解しました。',
        name: '名前',
        attachment: '添付ファイル',
        attachments: '添付ファイル',
        center: 'センター',
        from: 'から',
        to: 'に',
        in: 'In',
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
        rotate: '回転',
        zoom: 'Zoom',
        password: 'パスワード',
        magicCode: 'Magic code',
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
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
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
        download: 'ダウンロード',
        downloading: 'ダウンロード中',
        uploading: 'アップロード中',
        pin: 'ピン',
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
        currentYear: 'Current year',
        currentMonth: '今月',
        ssnLast4: 'SSNの下4桁',
        ssnFull9: 'SSNの9桁すべて',
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "\u4F4F\u6240\u884C ".concat(lineNumber);
        },
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
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        send: '送信',
        na: 'N/A',
        noResultsFound: '結果が見つかりませんでした',
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "\u300C".concat(searchString, "\u300D\u306B\u4E00\u81F4\u3059\u308B\u7D50\u679C\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
        },
        recentDestinations: '最近の目的地',
        timePrefix: 'それは',
        conjunctionFor: 'for',
        todayAt: '今日',
        tomorrowAt: '明日',
        yesterdayAt: '昨日',
        conjunctionAt: 'at',
        conjunctionTo: 'に',
        genericErrorMessage: 'おっと...何か問題が発生し、リクエストを完了できませんでした。後でもう一度お試しください。',
        percentage: 'パーセンテージ',
        error: {
            invalidAmount: '無効な金額',
            acceptTerms: '続行するには、利用規約に同意する必要があります。',
            phoneNumber: "\u6709\u52B9\u306A\u96FB\u8A71\u756A\u53F7\u3092\u56FD\u30B3\u30FC\u30C9\u3068\u3068\u3082\u306B\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u4F8B: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, "\uFF09"),
            fieldRequired: 'このフィールドは必須です',
            requestModified: 'このリクエストは他のメンバーによって変更されています。',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "\u6587\u5B57\u6570\u5236\u9650\u3092\u8D85\u3048\u307E\u3057\u305F\uFF08".concat(length, "/").concat(limit, "\uFF09");
            },
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
        semicolon: 'semicolon',
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
        transferBalance: '残高を移動',
        cantFindAddress: '住所が見つかりませんか？',
        enterManually: '手動で入力してください。',
        message: 'メッセージ',
        leaveThread: 'スレッドを退出',
        you: 'あなた',
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
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        createdBy: '作成者',
        with: 'with',
        shareCode: 'コードを共有',
        share: '共有',
        per: 'per',
        mi: 'マイル',
        km: 'キロメートル',
        copied: 'コピーしました！',
        someone: '誰か',
        total: '合計',
        edit: '編集',
        letsDoThis: "\u3084\u308A\u307E\u3057\u3087\u3046\uFF01",
        letsStart: "\u59CB\u3081\u307E\u3057\u3087\u3046",
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
        card: 'カード',
        whyDoWeAskForThis: 'なぜこれを尋ねるのですか？',
        required: '必須',
        showing: '表示中',
        of: 'of',
        default: 'デフォルト',
        update: '更新',
        member: 'メンバー',
        auditor: '監査人',
        role: '役割',
        currency: '通貨',
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
        tax: '税金',
        shared: '共有',
        drafts: '下書き',
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
        longID: 'Long ID',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        dropTitle: 'そのままにしておく',
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: 'Ignore',
        enabled: '有効',
        disabled: '無効',
        import: 'インポート',
        offlinePrompt: '現在、この操作を行うことはできません。',
        outstanding: '未払い',
        chats: 'チャット',
        tasks: 'タスク',
        unread: '未読',
        sent: '送信済み',
        links: 'リンク',
        days: '日',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Skip',
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "\u4F55\u304B\u7279\u5B9A\u306E\u3082\u306E\u304C\u5FC5\u8981\u3067\u3059\u304B\uFF1F\u30A2\u30AB\u30A6\u30F3\u30C8\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC\u306E".concat(accountManagerDisplayName, "\u3068\u30C1\u30E3\u30C3\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        chatNow: '今すぐチャット',
        workEmail: '勤務用メールアドレス',
        destination: '目的地',
        subrate: 'Subrate',
        perDiem: '日当',
        validate: '検証する',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSVとしてダウンロード',
        help: '助けて',
        expenseReports: '経費報告書',
        rateOutOfPolicy: 'ポリシー外の評価',
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
        getTheApp: 'アプリを入手',
        scanReceiptsOnTheGo: '携帯電話から領収書をスキャンする',
        headsUp: 'ご注意ください！',
    },
    supportalNoAccess: {
        title: 'ちょっと待ってください',
        description: 'サポートがログインしているときにこの操作を行う権限がありません。',
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
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "\u6DFB\u4ED8\u30D5\u30A1\u30A4\u30EB\u306E\u30B5\u30A4\u30BA\u304C ".concat(maxUploadSizeInMB, " MB \u306E\u5236\u9650\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002");
        },
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイト以上である必要があります。',
        wrongFileType: '無効なファイルタイプ',
        notAllowedExtension: 'このファイルタイプは許可されていません。別のファイルタイプをお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルを試してください。',
        protectedPDFNotSupported: 'パスワード保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズ変更されています。フル解像度でダウンロードしてください。',
        attachmentImageTooLarge: 'この画像はアップロード前にプレビューするには大きすぎます。',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "\u4E00\u5EA6\u306B\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3067\u304D\u308B\u30D5\u30A1\u30A4\u30EB\u306F".concat(fileLimit, "\u500B\u307E\u3067\u3067\u3059\u3002");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "\u30D5\u30A1\u30A4\u30EB\u304C ".concat(maxUploadSizeInMB, " MB \u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
        },
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "\u30D5\u30A1\u30A4\u30EB\u306F".concat(maxUploadSizeInMB, "MB\u672A\u6E80\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002\u305D\u308C\u3088\u308A\u5927\u304D\u3044\u30D5\u30A1\u30A4\u30EB\u306F\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3055\u308C\u307E\u305B\u3093\u3002");
        },
        maxFileLimitExceeded: '一度に最大30枚の領収書をアップロードできます。超過分はアップロードされません。',
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "".concat(fileType, "\u30D5\u30A1\u30A4\u30EB\u306F\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u308B\u30D5\u30A1\u30A4\u30EB\u30BF\u30A4\u30D7\u306E\u307F\u304C\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059\u3002");
        },
        learnMoreAboutSupportedFiles: 'サポートされているフォーマットについて詳しく知る。',
        passwordProtected: 'パスワード保護されたPDFはサポートされていません。サポートされているファイルのみがアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
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
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "\u30B3\u30E1\u30F3\u30C8\u306E\u6700\u5927\u9577\u306F".concat(formattedMaxLength, "\u6587\u5B57\u3067\u3059\u3002");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "\u30BF\u30B9\u30AF\u30BF\u30A4\u30C8\u30EB\u306E\u6700\u5927\u9577\u306F".concat(formattedMaxLength, "\u6587\u5B57\u3067\u3059\u3002");
        },
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
        loggedInAs: function (_a) {
            var email = _a.email;
            return "".concat(email, "\u3068\u3057\u3066\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u3044\u307E\u3059\u3002\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u30A2\u30D7\u30EA\u306B\u30ED\u30B0\u30A4\u30F3\u3059\u308B\u306B\u306F\u3001\u30D7\u30ED\u30F3\u30D7\u30C8\u306E\u300C\u30EA\u30F3\u30AF\u3092\u958B\u304F\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        doNotSeePrompt: 'プロンプトが見えませんか？',
        tryAgain: 'もう一度試してください。',
        or: '、または',
        continueInWeb: 'ウェブアプリに進む',
    },
    validateCodeModal: {
        successfulSignInTitle: 'アブラカダブラ、サインインしました！',
        successfulSignInDescription: '元のタブに戻って続行してください。',
        title: 'こちらがあなたのマジックコードです',
        description: '元のデバイスでリクエストされたコードを入力してください',
        doNotShare: 'コードを他の人と共有しないでください。Expensifyがそれを求めることはありません！',
        or: '、または',
        signInHere: 'ここでサインインしてください',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻り、新しいコードをリクエストしてください。',
        successfulNewCodeRequest: 'コードが要求されました。デバイスを確認してください。',
        tfaRequiredTitle: '二要素認証が必要です',
        tfaRequiredDescription: 'サインインしようとしている場所で、二要素認証コードを入力してください。',
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
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: '経費を提出し、上司に紹介する',
            subtitleText: 'あなたの上司にもExpensifyを使ってもらいたいですか？経費を提出するだけで、あとは私たちにお任せください。',
        },
        _a),
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
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, "\u3001\u3053\u3053\u3067\u65B0\u3057\u3044\u9854\u3092\u898B\u308B\u306E\u306F\u3044\u3064\u3082\u5B09\u3057\u3044\u3067\u3059\uFF01");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "".concat(login, "\u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u30021\uFF5E2\u5206\u4EE5\u5185\u306B\u5C4A\u304F\u306F\u305A\u3067\u3059\u3002");
        },
    },
    login: {
        hero: {
            header: 'チャットの速度で旅行と経費を管理',
            body: 'コンテキストに基づいたリアルタイムチャットの助けを借りて、旅行と経費がより迅速に進む次世代のExpensifyへようこそ。',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "".concat(email, "\u3068\u3057\u3066\u65E2\u306B\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u3066\u3044\u307E\u3059\u3002");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "".concat(provider, "\u3067\u30B5\u30A4\u30F3\u30A4\u30F3\u3057\u305F\u304F\u306A\u3044\u3067\u3059\u304B\uFF1F");
        },
        continueWithMyCurrentSession: '現在のセッションを続ける',
        redirectToDesktopMessage: 'サインインが完了すると、デスクトップアプリにリダイレクトします。',
        signInAgreementMessage: 'ログインすることにより、あなたは以下に同意したことになります',
        termsOfService: '利用規約',
        privacy: 'プライバシー',
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
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "".concat(user, "\u306E\u305F\u3081\u306E").concat(time, "\u3067\u3059");
        },
        edited: '(編集済み)',
        emoji: 'Emoji',
        collapse: '折りたたむ',
        expand: '展開する',
    },
    reportActionContextMenu: {
        copyToClipboard: 'クリップボードにコピー',
        copied: 'コピーしました！',
        copyLink: 'リンクをコピー',
        copyURLToClipboard: 'URLをクリップボードにコピー',
        copyEmailToClipboard: 'メールをクリップボードにコピー',
        markAsUnread: '未読としてマーク',
        markAsRead: '既読にする',
        editAction: function (_a) {
            var action = _a.action;
            return "".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? '経費' : 'コメント', "\u3092\u7DE8\u96C6");
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? '経費' : 'コメント', "\u3092\u524A\u9664");
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "\u3053\u306E".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? '経費' : 'コメント', "\u3092\u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F");
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
        beginningOfArchivedRoomPartOne: 'パーティーを逃しました',
        beginningOfArchivedRoomPartTwo: '、ここには何もありません。',
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001".concat(domainRoom, " \u30C9\u30E1\u30A4\u30F3\u306E\u3059\u3079\u3066\u306EExpensify\u30E1\u30F3\u30D0\u30FC\u3068\u306E\u3082\u306E\u3067\u3059\u3002");
        },
        beginningOfChatHistoryDomainRoomPartTwo: '同僚とチャットしたり、ヒントを共有したり、質問したりするために使用してください。',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'このチャットは、',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: 'ワークスペースの設定やその他についてチャットするために使用します。',
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F".concat(workspaceName, "\u306E\u5168\u54E1\u3068\u884C\u308F\u308C\u307E\u3059\u3002");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "\u6700\u3082\u91CD\u8981\u306A\u304A\u77E5\u3089\u305B\u306B\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        beginningOfChatHistoryUserRoomPartOne: 'このチャットルームは何でもOKです',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001\u8ACB\u6C42\u66F8\u306E\u3084\u308A\u53D6\u308A\u7528\u3067\u3059",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". \u8ACB\u4F7F\u7528 + \u30DC\u30BF\u30F3\u3092\u62BC\u3057\u3066\u8ACB\u6C42\u66F8\u3092\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        beginningOfChatHistory: 'このチャットは',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'ここが',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: '経費を提出します',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '+ ボタンを使用するだけです。',
        beginningOfChatHistorySelfDM: 'これはあなたの個人スペースです。メモ、タスク、下書き、リマインダーに使用してください。',
        beginningOfChatHistorySystemDM: 'ようこそ！セットアップを始めましょう。',
        chatWithAccountManager: 'こちらでアカウントマネージャーとチャットしてください',
        sayHello: 'こんにちは！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "".concat(roomName, "\u3078\u3088\u3046\u3053\u305D\uFF01");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "+ \u30DC\u30BF\u30F3\u3092\u4F7F\u7528\u3057\u3066\u7D4C\u8CBB\u3092".concat(additionalText, "\u3057\u307E\u3059\u3002");
        },
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
    youHaveBeenBanned: '注意: このチャンネルでのチャットは禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中...',
        multipleMembers: '複数のメンバー',
    },
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'このチャットルームはアーカイブされました。',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F".concat(displayName, "\u304C\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u9589\u3058\u305F\u305F\u3081\u3001\u3082\u3046\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001".concat(oldDisplayName, "\u304C\u30A2\u30AB\u30A6\u30F3\u30C8\u3092").concat(displayName, "\u3068\u7D71\u5408\u3057\u305F\u305F\u3081\u3001\u3082\u3046\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001<strong>\u3042\u306A\u305F</strong>\u304C".concat(policyName, "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u306F\u306A\u304F\u306A\u3063\u305F\u305F\u3081\u3001\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002")
                : "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001".concat(displayName, "\u304C").concat(policyName, "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u306A\u304F\u306A\u3063\u305F\u305F\u3081\u3001\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001".concat(policyName, " \u304C\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u306F\u306A\u304F\u306A\u3063\u305F\u305F\u3081\u3001\u3082\u3046\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001".concat(policyName, " \u304C\u30A2\u30AF\u30C6\u30A3\u30D6\u306A\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u306F\u306A\u304F\u306A\u3063\u305F\u305F\u3081\u3001\u3082\u3046\u30A2\u30AF\u30C6\u30A3\u30D6\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'この予約はアーカイブされています。',
        _b),
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
    },
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        dragAndDrop: 'スプレッドシートをここにドラッグ＆ドロップするか、以下のファイルを選択してください。対応フォーマット: .csv, .txt, .xls, および .xlsx。',
        chooseSpreadsheet: 'インポートするスプレッドシートファイルを選択してください。サポートされている形式: .csv, .txt, .xls, および .xlsx。',
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています。',
        column: function (_a) {
            var name = _a.name;
            return "\u5217 ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "\u304A\u3063\u3068\uFF01\u5FC5\u9808\u30D5\u30A3\u30FC\u30EB\u30C9\uFF08\"".concat(fieldName, "\"\uFF09\u304C\u30DE\u30C3\u30D4\u30F3\u30B0\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u78BA\u8A8D\u3057\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "\u304A\u3063\u3068\uFF01\u5358\u4E00\u306E\u30D5\u30A3\u30FC\u30EB\u30C9\uFF08\u300C".concat(fieldName, "\u300D\uFF09\u3092\u8907\u6570\u306E\u5217\u306B\u30DE\u30C3\u30D4\u30F3\u30B0\u3057\u3066\u3044\u307E\u3059\u3002\u78BA\u8A8D\u3057\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "\u304A\u3063\u3068\uFF01\u30D5\u30A3\u30FC\u30EB\u30C9\uFF08\"".concat(fieldName, "\"\uFF09\u306B1\u3064\u4EE5\u4E0A\u306E\u7A7A\u306E\u5024\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002\u78BA\u8A8D\u3057\u3066\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
        },
        importSuccessfulTitle: 'インポートが成功しました',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "".concat(categories, " \u30AB\u30C6\u30B4\u30EA\u30FC\u304C\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F\u3002") : '1 カテゴリが追加されました。');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return 'メンバーが追加または更新されていません。';
            }
            if (added && updated) {
                return "".concat(added, " \u30E1\u30F3\u30D0\u30FC").concat(added > 1 ? 's' : '', "\u304C\u8FFD\u52A0\u3055\u308C\u3001").concat(updated, " \u30E1\u30F3\u30D0\u30FC").concat(updated > 1 ? 's' : '', "\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002");
            }
            if (updated) {
                return updated > 1 ? "".concat(updated, " \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002") : '1名のメンバーが更新されました。';
            }
            return added > 1 ? "".concat(added, " \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC\u304C\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F\u3002") : '1人のメンバーが追加されました。';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "".concat(tags, " \u30BF\u30B0\u304C\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F\u3002") : '1 つのタグが追加されました。');
        },
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return rates > 1 ? "".concat(rates, " \u306E\u65E5\u5F53\u304C\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F\u3002") : '1つの日当料金が追加されました。';
        },
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべてのフィールドが正しく入力されていることを確認し、再試行してください。問題が解決しない場合は、Conciergeに連絡してください。',
        importDescription: '以下のインポートされた列の横にあるドロップダウンをクリックして、スプレッドシートからマップするフィールドを選択してください。',
        sizeNotMet: 'ファイルサイズは0バイトより大きくなければなりません',
        invalidFileMessage: 'アップロードしたファイルは空であるか、無効なデータが含まれています。ファイルが正しくフォーマットされ、必要な情報が含まれていることを確認してから、再度アップロードしてください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSVをダウンロード',
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        dragReceiptBeforeEmail: '領収書をこのページにドラッグするか、領収書を転送する',
        dragReceiptsBeforeEmail: '領収書をこのページにドラッグするか、領収書を転送する',
        dragReceiptAfterEmail: 'または、以下にアップロードするファイルを選択してください。',
        dragReceiptsAfterEmail: 'または、以下にアップロードするファイルを選択してください。',
        chooseReceipt: 'アップロードするレシートを選択するか、レシートを転送してください',
        chooseReceipts: 'アップロードするレシートを選択するか、レシートを転送してください',
        takePhoto: '写真を撮る',
        cameraAccess: '領収書の写真を撮るためにカメラへのアクセスが必要です。',
        deniedCameraAccess: 'カメラへのアクセスがまだ許可されていません。以下の手順に従ってください。',
        deniedCameraAccessInstructions: 'these instructions',
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真を撮る際にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスは、どこに行ってもタイムゾーンと通貨を正確に保つのに役立ちます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスは、どこに行ってもタイムゾーンと通貨を正確に保つのに役立ちます。',
        allowLocationFromSetting: "\u4F4D\u7F6E\u60C5\u5831\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u306F\u3001\u3069\u3053\u306B\u884C\u3063\u3066\u3082\u30BF\u30A4\u30E0\u30BE\u30FC\u30F3\u3068\u901A\u8CA8\u3092\u6B63\u78BA\u306B\u4FDD\u3064\u306E\u306B\u5F79\u7ACB\u3061\u307E\u3059\u3002\u30C7\u30D0\u30A4\u30B9\u306E\u6A29\u9650\u8A2D\u5B9A\u304B\u3089\u4F4D\u7F6E\u60C5\u5831\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u3092\u8A31\u53EF\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
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
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Pay ".concat(name !== null && name !== void 0 ? name : '誰か');
        },
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
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "".concat(formattedAmount, " \u3092\u627F\u8A8D\u3059\u308B") : '承認する');
        },
        approved: '承認済み',
        cash: '現金',
        card: 'カード',
        original: 'Original',
        split: '分割',
        splitExpense: '経費を分割',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(merchant, "\u304B\u3089").concat(amount);
        },
        addSplit: '分割を追加',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "\u5408\u8A08\u91D1\u984D\u306F\u5143\u306E\u7D4C\u8CBB\u3088\u308A\u3082".concat(amount, "\u591A\u3044\u3067\u3059\u3002");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "\u5408\u8A08\u91D1\u984D\u306F\u5143\u306E\u7D4C\u8CBB\u3088\u308A\u3082".concat(amount, "\u5C11\u306A\u304F\u306A\u3063\u3066\u3044\u307E\u3059\u3002");
        },
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(merchant, "\u306E").concat(amount, "\u3092\u7DE8\u96C6");
        },
        removeSplit: '分割を削除',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Pay ".concat(name !== null && name !== void 0 ? name : '誰か');
        },
        expense: '経費',
        categorize: 'カテゴリー分けする',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '距離を追跡する',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "".concat(expensesNumber, "\u4EF6\u306E\u7D4C\u8CBB\u3092\u4F5C\u6210");
        },
        addExpense: '経費を追加',
        chooseRecipient: '受取人を選択',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, "\u306E\u7D4C\u8CBB\u3092\u4F5C\u6210");
        },
        confirmDetails: '詳細を確認',
        pay: '支払う',
        cancelPayment: '支払いをキャンセルする',
        cancelPaymentConfirmation: 'この支払いをキャンセルしてもよろしいですか？',
        viewDetails: '詳細を表示',
        pending: '保留中',
        canceled: 'キャンセルされました',
        posted: '投稿済み',
        deleteReceipt: '領収書を削除',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u3067\u7D4C\u8CBB\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3001".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "\u8CBB\u7528".concat(reportName ? "".concat(reportName, " \u304B\u3089") : '', "\u3092\u79FB\u52D5\u3057\u307E\u3057\u305F");
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "\u3053\u306E\u7D4C\u8CBB".concat(reportName ? "to <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '', "\u3092\u79FB\u52D5\u3057\u307E\u3057\u305F");
        },
        unreportedTransaction: 'この経費をあなたの個人スペースに移動しました。',
        pendingMatchWithCreditCard: 'カード取引との一致待ちの領収書',
        pendingMatch: '保留中の一致',
        pendingMatchWithCreditCardDescription: '領収書がカード取引と一致待ちです。現金としてマークしてキャンセルしてください。',
        markAsCash: '現金としてマーク',
        routePending: 'ルートを保留中...',
        receiptScanning: function () { return ({
            one: '領収書をスキャン中...',
            other: '領収書をスキャン中...',
        }); },
        scanMultipleReceipts: '複数の領収書をスキャンする',
        scanMultipleReceiptsDescription: 'すべての領収書を一度に撮影し、自分で詳細を確認するか、SmartScanに任せましょう。',
        receiptScanInProgress: '領収書のスキャン中',
        receiptScanInProgressDescription: '領収書のスキャン中です。後で確認するか、今すぐ詳細を入力してください。',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? '重複の可能性がある経費が特定されました。提出を有効にするために重複を確認してください。'
                : '重複の可能性がある経費が特定されました。承認を有効にするために重複を確認してください。';
        },
        receiptIssuesFound: function () { return ({
            one: '問題が見つかりました',
            other: '問題が見つかりました',
        }); },
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
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " \u30B9\u30AD\u30E3\u30F3\u4E2D"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " \u4EF6\u306E\u4FDD\u7559\u4E2D"));
            }
            return {
                one: statusText.length > 0 ? "1 \u7D4C\u8CBB (".concat(statusText.join(', '), ")") : "1 \u7D4C\u8CBB",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " \u7D4C\u8CBB (").concat(statusText.join(', '), ")") : "".concat(count, " \u7D4C\u8CBB")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 経費',
                other: function (count) { return "".concat(count, " \u7D4C\u8CBB"); },
            };
        },
        deleteExpense: function () { return ({
            one: '経費を削除',
            other: '経費を削除',
        }); },
        deleteConfirmation: function () { return ({
            one: 'この経費を削除してもよろしいですか？',
            other: 'これらの経費を削除してもよろしいですか？',
        }); },
        deleteReport: 'レポートを削除',
        deleteReportConfirmation: 'このレポートを削除してもよろしいですか？',
        settledExpensify: '支払済み',
        done: '完了',
        settledElsewhere: '他で支払い済み',
        individual: '個人',
        business: 'ビジネス',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Expensify\u3067".concat(formattedAmount, "\u3092\u652F\u6255\u3046") : "Expensify\u3067\u652F\u6255\u3046");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "\u500B\u4EBA\u3068\u3057\u3066".concat(formattedAmount, "\u3092\u652F\u6255\u3046") : "\u500B\u4EBA\u3068\u3057\u3066\u652F\u6255\u3046");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "".concat(formattedAmount, "\u3092\u652F\u6255\u3046");
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "".concat(formattedAmount, " \u3092\u30D3\u30B8\u30CD\u30B9\u3068\u3057\u3066\u652F\u6255\u3046") : "\u30D3\u30B8\u30CD\u30B9\u3068\u3057\u3066\u652F\u6255\u3046");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "\u4ED6\u306E\u5834\u6240\u3067".concat(formattedAmount, "\u3092\u652F\u6255\u3046") : "\u4ED6\u306E\u5834\u6240\u3067\u652F\u6255\u3046");
        },
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, " \u8ACB\u6C42\u66F8\u3092\u9001\u4FE1");
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, "\u3092\u63D0\u51FA");
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "".concat(comment, " \u306E\u305F\u3081\u306B") : '');
        },
        submitted: "\u63D0\u51FA\u6E08\u307F",
        automaticallySubmitted: "<a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">\u9001\u4FE1\u306E\u9045\u5EF6</a>\u3092\u901A\u3058\u3066\u9001\u4FE1\u3055\u308C\u307E\u3057\u305F"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "tracking ".concat(formattedAmount).concat(comment ? "".concat(comment, " \u306E\u305F\u3081\u306B") : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, " \u3092\u5206\u5272");
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "split ".concat(formattedAmount).concat(comment ? "".concat(comment, " \u306E\u305F\u3081\u306B") : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "\u3042\u306A\u305F\u306E\u5206\u5272\u984D ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " \u306F ").concat(amount).concat(comment ? "".concat(comment, " \u306E\u305F\u3081\u306B") : '', " \u3092\u501F\u308A\u3066\u3044\u307E\u3059\u3002");
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " \u306E\u501F\u91D1:");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', "\u304C").concat(amount, "\u3092\u652F\u6255\u3044\u307E\u3057\u305F");
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " \u304C\u652F\u6255\u3044\u307E\u3057\u305F:");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, "\u304C").concat(amount, "\u3092\u4F7F\u3044\u307E\u3057\u305F");
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " \u304C\u4F7F\u3063\u305F\u91D1\u984D:");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " \u627F\u8A8D\u6E08\u307F:");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " \u304C ").concat(amount, " \u3092\u627F\u8A8D\u3057\u307E\u3057\u305F");
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, " \u3092\u652F\u6255\u3044\u307E\u3057\u305F");
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "".concat(amount, "\u3092\u652F\u6255\u3044\u307E\u3057\u305F\u3002\u652F\u6255\u3044\u3092\u53D7\u3051\u53D6\u308B\u306B\u306F\u9280\u884C\u53E3\u5EA7\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        automaticallyApproved: "<a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30EB\u30FC\u30EB</a>\u3067\u627F\u8A8D\u6E08\u307F"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "\u627F\u8A8D\u6E08\u307F ".concat(amount);
        },
        approvedMessage: "\u627F\u8A8D\u6E08\u307F",
        unapproved: "\u672A\u627F\u8A8D",
        automaticallyForwarded: "<a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30EB\u30FC\u30EB</a>\u3067\u627F\u8A8D\u6E08\u307F"),
        forwarded: "\u627F\u8A8D\u6E08\u307F",
        rejectedThisReport: 'このレポートを拒否しました',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "\u7CBE\u7B97\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002".concat(submitterDisplayName, " \u304C\u9280\u884C\u53E3\u5EA7\u3092\u8FFD\u52A0\u3059\u308B\u307E\u3067\u3001\u652F\u6255\u3044\u306F\u4FDD\u7559\u3055\u308C\u307E\u3059\u3002");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', "\u304C\u652F\u6255\u3044\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "".concat(submitterDisplayName, "\u304C30\u65E5\u4EE5\u5185\u306BExpensify\u30A6\u30A9\u30EC\u30C3\u30C8\u3092\u6709\u52B9\u306B\u3057\u306A\u304B\u3063\u305F\u305F\u3081\u3001").concat(amount, "\u306E\u652F\u6255\u3044\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F\u3002");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, "\u304C\u9280\u884C\u53E3\u5EA7\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002").concat(amount, "\u306E\u652F\u6255\u3044\u304C\u884C\u308F\u308C\u307E\u3057\u305F\u3002");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "\u306F\u4ED6\u3067\u652F\u6255\u308F\u308C\u307E\u3057\u305F");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "\u306FExpensify\u3067\u652F\u6255\u3044\u307E\u3057\u305F");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "\u306F<a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30EB\u30FC\u30EB</a>\u3092\u901A\u3058\u3066Expensify\u3067\u652F\u6255\u3044\u307E\u3057\u305F\u3002");
        },
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます。',
        changedTheExpense: '経費を変更しました',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "".concat(valueName, " \u3092 ").concat(newValueToDisplay, " \u306B");
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "".concat(translatedChangedField, "\u3092").concat(newMerchant, "\u306B\u8A2D\u5B9A\u3057\u3001\u91D1\u984D\u3092").concat(newAmountToDisplay, "\u306B\u8A2D\u5B9A\u3057\u307E\u3057\u305F\u3002");
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "".concat(valueName, "\uFF08\u4EE5\u524D\u306F").concat(oldValueToDisplay, "\uFF09");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "".concat(valueName, "\u3092").concat(newValueToDisplay, "\uFF08\u4EE5\u524D\u306F").concat(oldValueToDisplay, "\uFF09\u306B");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "".concat(translatedChangedField, "\u3092").concat(newMerchant, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(oldMerchant, "\uFF09\u3001\u3053\u308C\u306B\u3088\u308A\u91D1\u984D\u304C").concat(newAmountToDisplay, "\u306B\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(oldAmountToDisplay, "\uFF09\u3002");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "".concat(comment, "\u7528") : '経費');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "\u8ACB\u6C42\u66F8\u30EC\u30DD\u30FC\u30C8 #".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " \u9001\u4FE1\u6E08\u307F").concat(comment ? "".concat(comment, " \u306E\u305F\u3081\u306B") : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "\u500B\u4EBA\u30B9\u30DA\u30FC\u30B9\u304B\u3089".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "".concat(reportName, "\u3068\u30C1\u30E3\u30C3\u30C8\u3059\u308B"), "\u306B\u7D4C\u8CBB\u3092\u79FB\u52D5\u3057\u307E\u3057\u305F\u3002");
        },
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        tagSelection: '支出をより整理するためにタグを選択してください。',
        categorySelection: '支出をより整理するためにカテゴリを選択してください。',
        error: {
            invalidCategoryLength: 'カテゴリ名が255文字を超えています。短くするか、別のカテゴリを選んでください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選んでください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidIntegerAmount: '続行する前にドルの金額を入力してください',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "\u6700\u5927\u7A0E\u984D\u306F".concat(amount, "\u3067\u3059\u3002");
            },
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
            receiptFailureMessage: '領収書のアップロード中にエラーが発生しました。どうぞ',
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            tryAgainMessage: 'もう一度試してください。',
            saveFileMessage: '領収書を保存',
            uploadLaterMessage: '後でアップロードする。',
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
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "\u7CBE\u7B97\u3092\u958B\u59CB\u3057\u307E\u3057\u305F\u3002".concat(submitterDisplayName, " \u304C\u30A6\u30A9\u30EC\u30C3\u30C8\u3092\u6709\u52B9\u306B\u3059\u308B\u307E\u3067\u3001\u652F\u6255\u3044\u306F\u4FDD\u7559\u3055\u308C\u307E\u3059\u3002");
        },
        enableWallet: 'ウォレットを有効にする',
        hold: '保留',
        unhold: '保留を解除',
        holdExpense: '経費を保留',
        unholdExpense: '経費の保留を解除',
        heldExpense: 'この経費を保留しました',
        unheldExpense: 'この経費を未保留にする',
        moveUnreportedExpense: '未報告の経費を移動',
        addUnreportedExpense: '未報告の経費を追加',
        createNewExpense: '新しい経費を作成',
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1つ選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。以下で新しく作成してみてください。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        explainHold: 'この経費を保留している理由を説明してください。',
        undoSubmit: '送信を取り消す',
        retracted: '撤回されました',
        undoClose: '閉じるを元に戻す',
        reopened: '再開されました',
        reopenReport: 'レポートを再開する',
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u306F\u3059\u3067\u306B".concat(connectionName, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5909\u66F4\u3059\u308B\u3068\u30C7\u30FC\u30BF\u306E\u4E0D\u4E00\u81F4\u304C\u751F\u3058\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u672C\u5F53\u306B\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u3092\u518D\u958B\u3057\u307E\u3059\u304B\uFF1F");
        },
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
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }); },
        confirmPay: '支払い金額を確認',
        confirmPayAmount: '保留されていないものを支払うか、レポート全体を支払う。',
        confirmPayAllHoldAmount: function () { return ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }); },
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'このリクエストはオン',
        holdEducationalText: '保留',
        whatIsHoldExplain: '保留は、承認や支払いの前に詳細を確認するために、経費を「一時停止」するようなものです。',
        holdIsLeftBehind: '保留された経費は承認または支払い時に別のレポートに移動します。',
        unholdWhenReady: '承認者は、承認または支払いの準備が整ったときに経費を解除できます。',
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
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u306F\u3059\u3067\u306B".concat(accountingIntegration, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5909\u66F4\u3059\u308B\u3068\u30C7\u30FC\u30BF\u306E\u4E0D\u6574\u5408\u304C\u751F\u3058\u308B\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002\u672C\u5F53\u306B\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u306E\u627F\u8A8D\u3092\u53D6\u308A\u6D88\u3057\u307E\u3059\u304B\uFF1F");
        },
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
        firstDayText: function () { return ({
            one: "\u521D\u65E5: 1\u6642\u9593",
            other: function (count) { return "\u521D\u65E5: ".concat(count.toFixed(2), "\u6642\u9593"); },
        }); },
        lastDayText: function () { return ({
            one: "\u6700\u7D42\u65E5: 1\u6642\u9593",
            other: function (count) { return "\u6700\u7D42\u65E5: ".concat(count.toFixed(2), "\u6642\u9593"); },
        }); },
        tripLengthText: function () { return ({
            one: "\u65C5\u884C: 1\u65E5\u9593",
            other: function (count) { return "\u65C5\u884C: ".concat(count, "\u65E5\u9593"); },
        }); },
        dates: '日付',
        rates: '料金',
        submitsTo: function (_a) {
            var name = _a.name;
            return "".concat(name, "\u306B\u9001\u4FE1");
        },
        moveExpenses: function () { return ({ one: '経費を移動', other: '経費を移動' }); },
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
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "\u9078\u629E\u3057\u305F\u753B\u50CF\u306F\u3001\u6700\u5927\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u30B5\u30A4\u30BA\u306E".concat(maxUploadSizeInMB, " MB\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "".concat(minHeightInPx, "x").concat(minWidthInPx, "\u30D4\u30AF\u30BB\u30EB\u4EE5\u4E0A\u3001").concat(maxHeightInPx, "x").concat(maxWidthInPx, "\u30D4\u30AF\u30BB\u30EB\u672A\u6E80\u306E\u753B\u50CF\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u5199\u771F\u306F\u6B21\u306E\u30BF\u30A4\u30D7\u306E\u3044\u305A\u308C\u304B\u3067\u306A\u3051\u308C\u3070\u306A\u308A\u307E\u305B\u3093: ".concat(allowedExtensions.join(', '), "\u3002");
        },
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
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '個人用QRコードまたは紹介リンクを共有して、Expensifyにメンバーを招待しましょう。',
    },
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: 'オプションを表示するために検索',
    },
    contacts: {
        contactMethod: '連絡方法',
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を使用するには、アカウントの確認が必要です。',
        validateAccount: 'アカウントを確認してください',
        helpTextBeforeEmail: '人々があなたを見つける方法を増やし、領収書を転送する',
        helpTextAfterEmail: '複数のメールアドレスから。',
        pleaseVerify: 'この連絡方法を確認してください',
        getInTouch: '私たちがあなたに連絡を取る必要がある場合、この連絡方法を使用します。',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "".concat(contactMethod, "\u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u30021\uFF5E2\u5206\u4EE5\u5185\u306B\u5C4A\u304F\u306F\u305A\u3067\u3059\u3002");
        },
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
            description: 'Expensifyの体験をトラブルシューティングするために、以下のツールを使用してください。問題が発生した場合は、どうぞ',
            submitBug: 'バグを提出する',
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
        },
        debugConsole: {
            saveLog: 'ログを保存',
            shareLog: 'ログを共有',
            enterCommand: 'コマンドを入力してください',
            execute: '実行する',
            noLogsAvailable: 'ログは利用できません',
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "\u30ED\u30B0\u30B5\u30A4\u30BA\u304C".concat(size, " MB\u306E\u5236\u9650\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002\u300C\u30ED\u30B0\u3092\u4FDD\u5B58\u300D\u3092\u4F7F\u7528\u3057\u3066\u30ED\u30B0\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
            },
            logs: 'ログ',
            viewConsole: 'コンソールを表示',
        },
        security: 'セキュリティー',
        signOut: 'サインアウト',
        restoreStashed: '隠されたログインを復元',
        signOutConfirmationText: 'サインアウトすると、オフラインでの変更が失われます。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: '読む',
            phrase2: '利用規約',
            phrase3: 'および',
            phrase4: 'プライバシー',
        },
        help: '助けて',
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
            accountToMergeInto: 'マージしたいアカウントを入力してください',
            notReversibleConsent: 'これは元に戻せないことを理解しています。',
        },
        accountValidate: {
            confirmMerge: 'アカウントをマージしてもよろしいですか？',
            lossOfUnsubmittedData: "\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u7D71\u5408\u306F\u5143\u306B\u623B\u305B\u305A\u3001\u672A\u63D0\u51FA\u306E\u7D4C\u8CBB\u304C\u5931\u308F\u308C\u308B\u7D50\u679C\u306B\u306A\u308A\u307E\u3059\u3002",
            enterMagicCode: "\u7D9A\u884C\u3059\u308B\u306B\u306F\u3001\u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
            errors: {
                incorrectMagicCode: '無効または不正なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントが統合されました！',
            successfullyMergedAllData: {
                beforeFirstEmail: "\u3059\u3079\u3066\u306E\u30C7\u30FC\u30BF\u3092\u6B63\u5E38\u306B\u30DE\u30FC\u30B8\u3057\u307E\u3057\u305F",
                beforeSecondEmail: "into",
                afterSecondEmail: "\u4ECA\u5F8C\u3001\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u306F\u3069\u3061\u3089\u306E\u30ED\u30B0\u30A4\u30F3\u3082\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002",
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: '新しいExpensifyではアカウントの統合をまだサポートしていません。この操作はExpensify Classicで行ってください。',
            reachOutForHelp: {
                beforeLink: 'ご自由に',
                linkText: 'Conciergeに連絡する',
                afterLink: 'ご質問があればどうぞ！',
            },
            goToExpensifyClassic: 'Expensify Classicに移動',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'マージできません',
            beforeDomain: 'それはによって管理されているため',
            afterDomain: '. お願いします',
            linkText: 'Conciergeに連絡する',
            afterLink: 'サポートが必要な場合。',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'マージできません',
            afterEmail: 'ドメイン管理者がそれをあなたのプライマリーログインとして設定したため、他のアカウントに統合することはできません。代わりに他のアカウントをそれに統合してください。',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'アカウントをマージできません、なぜなら',
                beforeSecondEmail: '二要素認証 (2FA) が有効になっています。2FAを無効にしてください。',
                afterSecondEmail: 'そしてもう一度試してください。',
            },
            learnMore: 'アカウントの統合について詳しく学ぶ。',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'マージできません',
            afterEmail: 'ロックされているためです。どうぞ',
            linkText: 'Conciergeに連絡する',
            afterLink: "\u30B5\u30DD\u30FC\u30C8\u304C\u5FC5\u8981\u306A\u5834\u5408\u3002",
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'アカウントをマージできません、なぜなら',
                afterEmail: 'Expensifyアカウントを持っていません。',
            },
            addContactMethod: {
                beforeLink: 'お願いします',
                linkText: '連絡方法として追加する',
                afterLink: 'instead.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'マージできません',
            afterEmail: '他のアカウントに統合することはできません。代わりに他のアカウントをこのアカウントに統合してください。',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'マージできません',
            afterEmail: '請求書発行済みアカウントの請求オーナーであるため、他のアカウントに統合することはできません。代わりに他のアカウントをこのアカウントに統合してください。',
        },
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
        ourTeamWill: 'チームが調査を行い、不正アクセスを削除します。アクセスを回復するには、Conciergeと連携する必要があります。',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u30ED\u30C3\u30AF\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u3053\u306E\u554F\u984C\u3092\u89E3\u6C7A\u3059\u308B\u305F\u3081\u306BConcierge\u3068\u30C1\u30E3\u30C3\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
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
        codesLoseAccess: '認証アプリへのアクセスを失い、これらのコードを持っていない場合、アカウントへのアクセスを失います。\n\n注: 二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。',
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
        twoFactorAuthIsRequiredForAdminsDescription: 'Xeroの会計接続には二要素認証の使用が必要です。Expensifyを引き続き使用するには、有効にしてください。',
        twoFactorAuthCannotDisable: '2FAを無効にできません',
        twoFactorAuthRequired: 'Xeroの接続には二要素認証（2FA）が必要であり、無効にすることはできません。',
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
        note: '注意: 支払い通貨を変更すると、Expensifyの支払い額に影響を与える可能性があります。私たちのガイドを参照してください。',
        noteLink: '価格ページ',
        noteDetails: '詳細については。',
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
        expirationDate: 'MMYY',
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
        addBankAccountToSendAndReceive: 'ワークスペースに提出した経費の払い戻しを受ける。',
        addBankAccount: '銀行口座を追加',
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
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: '残りの制限',
        smartLimit: {
            name: 'スマートリミット',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u3067\u306F\u6700\u5927".concat(formattedLimit, "\u307E\u3067\u4F7F\u7528\u3067\u304D\u3001\u63D0\u51FA\u3055\u308C\u305F\u7D4C\u8CBB\u304C\u627F\u8A8D\u3055\u308C\u308B\u3068\u5236\u9650\u304C\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u307E\u3059\u3002");
            },
        },
        fixedLimit: {
            name: '固定限度額',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u3067\u306F\u6700\u5927".concat(formattedLimit, "\u307E\u3067\u5229\u7528\u3067\u304D\u3001\u305D\u308C\u4EE5\u964D\u306F\u7121\u52B9\u306B\u306A\u308A\u307E\u3059\u3002");
            },
        },
        monthlyLimit: {
            name: '月間制限',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u3067\u306F\u3001\u6708\u306B\u6700\u5927".concat(formattedLimit, "\u307E\u3067\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002\u3053\u306E\u5236\u9650\u306F\u3001\u6BCE\u6708\u306E1\u65E5\u306B\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u307E\u3059\u3002");
            },
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: 'トラベルカードCVV',
        physicalCardNumber: '物理カード番号',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカード詐欺を報告する',
        reportTravelFraud: 'トラベルカード詐欺を報告する',
        reviewTransaction: '取引を確認する',
        suspiciousBannerTitle: '不審な取引',
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
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "".concat(platform, "\u30A6\u30A9\u30EC\u30C3\u30C8\u306B\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F");
        },
        cardDetailsLoadingFailure: 'カードの詳細を読み込む際にエラーが発生しました。インターネット接続を確認して、もう一度お試しください。',
        validateCardTitle: 'あなたであることを確認しましょう',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "\u30AB\u30FC\u30C9\u306E\u8A73\u7D30\u3092\u8868\u793A\u3059\u308B\u306B\u306F\u3001".concat(contactMethod, " \u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u30021\uFF5E2\u5206\u4EE5\u5185\u306B\u5C4A\u304F\u306F\u305A\u3067\u3059\u3002");
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認および支払いを含むワークフローを設定します。',
        delaySubmissionTitle: '提出を遅らせる',
        delaySubmissionDescription: '経費提出のカスタムスケジュールを選択するか、支出のリアルタイム更新のためにこれをオフにしておいてください。',
        submissionFrequency: '提出頻度',
        submissionFrequencyDateOfMonth: '月の日付',
        addApprovalsTitle: '承認を追加',
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'このデフォルトのワークフローは、より具体的なワークフローが存在しない限り、すべてのメンバーに適用されます。',
        approver: '承認者',
        connectBankAccount: '銀行口座を接続',
        addApprovalsDescription: '支払いを承認する前に追加の承認が必要です。',
        makeOrTrackPaymentsTitle: '支払いを行うまたは追跡する',
        makeOrTrackPaymentsDescription: 'Expensifyでの支払いのために認可された支払者を追加するか、他の場所で行われた支払いを追跡します。',
        editor: {
            submissionFrequency: 'Expensifyがエラーフリーの支出を共有するまでの待機時間を選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動で行うように設定してください。',
        frequencies: {
            instant: 'インスタント',
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
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> \u306F\u3059\u3067\u306B <strong>").concat(name2, "</strong> \u306B\u30EC\u30DD\u30FC\u30C8\u3092\u627F\u8A8D\u3057\u3066\u3044\u307E\u3059\u3002\u5FAA\u74B0\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u907F\u3051\u308B\u305F\u3081\u306B\u3001\u5225\u306E\u627F\u8A8D\u8005\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002");
        },
        emptyContent: {
            title: '表示するメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは既存の承認ワークフローにすでに属しています。',
            approverSubtitle: 'すべての承認者は既存のワークフローに属しています。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: '遅延した提出は変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
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
            throttled: 'Expensifyカードの最後の4桁を間違えて入力しました。数字が正しいと確信している場合は、Conciergeに連絡して解決してください。それ以外の場合は、後でもう一度試してください。',
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
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'インスタント（デビットカード）',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% \u624B\u6570\u6599\uFF08\u6700\u4F4E ").concat(minAmount, "\uFF09");
        },
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
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "".concat(policyName, " \u5185");
        },
        generatingPDF: 'PDFを生成中',
        waitForPDF: 'PDFを生成するまでお待ちください',
        errorPDF: 'PDFの生成中にエラーが発生しました。',
        generatedPDF: 'あなたのレポートPDFが生成されました！',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: '部屋の説明（任意）',
        explainerText: '部屋のカスタム説明を設定します。',
    },
    groupChat: {
        lastMemberTitle: '注意！',
        lastMemberWarning: 'あなたが最後の一人なので、退出するとこのチャットはすべてのメンバーにアクセスできなくなります。本当に退出しますか？',
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "".concat(displayName, "\u306E\u30B0\u30EB\u30FC\u30D7\u30C1\u30E3\u30C3\u30C8");
        },
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
        phrase1: 'ログインすることにより、あなたは以下に同意したことになります',
        phrase2: '利用規約',
        phrase3: 'および',
        phrase4: 'プライバシー',
        phrase5: "\u9001\u91D1\u306F\u3001".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, "\uFF08NMLS ID:2017010\uFF09\u306B\u3088\u3063\u3066\u3001\u305D\u306E"),
        phrase6: 'ライセンス',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: 'リカバリーコードを入力してください',
        requiredWhen2FAEnabled: '2FAが有効になっている場合に必要',
        requestNewCode: '新しいコードをリクエスト',
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
            unableToResetPassword: 'パスワードを変更できませんでした。これは、古いパスワードリセットメール内のパスワードリセットリンクが期限切れになっている可能性があります。再試行できるように、新しいリンクをメールでお送りしました。受信トレイと迷惑メールフォルダを確認してください。数分以内に届くはずです。',
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
        notYou: function (_a) {
            var user = _a.user;
            return "".concat(user, "\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u304B\uFF1F");
        },
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
        welcomeVideo: {
            title: 'Expensifyへようこそ',
            description: 'チャットでビジネスと個人の支出をすべて管理するための1つのアプリ。あなたのビジネス、チーム、そして友人のために作られました。',
        },
        getStarted: '始めましょう',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: 'あなたが知っている人々はすでにここにいます！メールを確認して参加しましょう。',
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "".concat(domain, " \u306E\u8AB0\u304B\u304C\u3059\u3067\u306B\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u4F5C\u6210\u3057\u3066\u3044\u307E\u3059\u3002").concat(email, " \u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        joinAWorkspace: 'ワークスペースに参加する',
        listOfWorkspaces: 'こちらが参加できるワークスペースのリストです。心配しないでください。後で参加することもできます。',
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " \u540D\u306E\u30E1\u30F3\u30D0\u30FC").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'どこで働いていますか？',
        errorSelection: '先に進むためのオプションを選択してください',
        purpose: (_c = {
                title: '今日は何をしたいですか？',
                errorContinue: 'セットアップを続行するには「続行」を押してください。',
                errorBackButton: 'アプリの使用を開始するためにセットアップの質問を完了してください'
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = '雇用主から払い戻しを受ける',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = '私のチームの経費を管理する',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = '経費を追跡し、予算を管理する',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = '友達とチャットして経費を分割する',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = '何か他のもの',
            _c),
        employees: (_d = {
                title: '従業員は何人いますか？'
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10人の従業員',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50人の従業員',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100人の従業員',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1,000人の従業員',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = '1,000人以上の従業員',
            _d),
        accounting: {
            title: '会計ソフトを使用していますか？',
            none: 'None',
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
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "".concat(workEmail, " \u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u30021\u30012\u5206\u3067\u5C4A\u304F\u306F\u305A\u3067\u3059\u3002");
            },
        },
        workEmailValidationError: {
            publicEmail: '有効なプライベートドメインの勤務用メールアドレスを入力してください。例: mitch@company.com',
            offline: 'オフラインのようなので、仕事用メールを追加できませんでした。',
        },
        mergeBlockScreen: {
            title: '勤務用メールを追加できませんでした。',
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "".concat(workEmail, "\u3092\u8FFD\u52A0\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u5F8C\u3067\u8A2D\u5B9A\u3067\u518D\u8A66\u884C\u3059\u308B\u304B\u3001\u30AC\u30A4\u30C0\u30F3\u30B9\u304C\u5FC5\u8981\u306A\u5834\u5408\u306FConcierge\u3068\u30C1\u30E3\u30C3\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6](".concat(testDriveURL, ")\u3092\u884C\u3046");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Expensify\u304C\u6700\u3082\u5B89\u3044\u65B9\u6CD5\u3067\u3042\u308B\u7406\u7531\u3092\u78BA\u304B\u3081\u308B\u305F\u3081\u306B\u3001\u30D7\u30ED\u30C0\u30AF\u30C8\u30C4\u30A2\u30FC\u3092\u7D76\u597D\u306A\u3008\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6\u3092\u884C\u3046\u3009(".concat(testDriveURL, ")\u305F\u3081\u306B\u3001\u30D7\u30ED\u30C0\u30AF\u30C8\u30C4\u30A2\u30FC\u3092\u7D76\u597D\u306A\u3008\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6\u3092\u884C\u3046\u3009(").concat(testDriveURL, ")\u3092\u3057\u307E\u3059\u3002");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6](".concat(testDriveURL, ")\u3092\u884C\u3046");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "\u5F7C\u3089\u306B](".concat(testDriveURL, ")\u3092\u884C\u3044\u3001Expensify\u306E*\u30AF\u30FC\u30DD\u30F3\u3092\u6700\u521D\u306E3\u304B\u6708\u3067\u5165\u624B\u3057\u307E\u305B\u3093\u304B*");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u4F5C\u6210](".concat(workspaceConfirmationLink, ")");
                },
                description: '\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u30B9\u30DA\u30B7\u30E3\u30EA\u30B9\u30C8\u3068\u5171\u306B\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u4F5C\u6210\u3057\u3001\u8A2D\u5B9A\u3092\u69CB\u6210\u3057\u307E\u3059\uFF01',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u4F5C\u6210](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u4F5C\u6210\u3057\u307E\u3059* \u306B\u306F\u3001\u7D4C\u8CBB\u3092\u8FFD\u8DE1\u3057\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u3001\u30C1\u30E3\u30C3\u30C8\u306A\u3069\u3092\u884C\u3044\u307E\u3059\u3002\n' +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9* > *\u65B0\u3057\u3044\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "*\u65B0\u3057\u3044\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u6E96\u5099\u304C\u3067\u304D\u307E\u3057\u305F\uFF01* [\u78BA\u8A8D\u3059\u308B](".concat(workspaceSettingsLink, ")\u3002");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "\u30AB\u30C6\u30B4\u30EA\u30FC\u306E\u8A2D\u5B9A](".concat(workspaceCategoriesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u8A2D\u5B9A\u3057\u307E\u3059* \u3068\u3001\u30C1\u30FC\u30E0\u306F\u7C21\u5358\u306A\u5831\u544A\u306E\u305F\u3081\u306B\u7D4C\u8CBB\u3092\u30B3\u30FC\u30C9\u5316\u3067\u304D\u307E\u3059\u3002\n' +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '3. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '4. *\u30AB\u30C6\u30B4\u30EA\u30FC*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '5. \u4E0D\u8981\u306A\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u7121\u52B9\u306B\u3057\u307E\u3059\u3002\n' +
                        '6. \u53F3\u4E0A\u306B\u81EA\u5206\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "[\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30AB\u30C6\u30B4\u30EA\u30FC\u8A2D\u5B9A\u3078](".concat(workspaceCategoriesLink, ")\u3002\n") +
                        '\n' +
                        "![\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u8A2D\u5B9A](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: '\u7D4C\u8CBB\u3092\u63D0\u51FA\u3059\u308B',
                description: '*\u7D4C\u8CBB\u3092\u63D0\u51FA\u3059\u308B* \u306B\u306F\u3001\u91D1\u984D\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u7D4C\u8CBB\u306E\u4F5C\u6210*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. \u91D1\u984D\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u307E\u3059\u3002\n' +
                    "4. \u4E0A\u53F8\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002\n" +
                    '5. *\u4F5C\u6210*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u3053\u308C\u3067\u5B8C\u4E86\u3067\u3059\uFF01',
            },
            adminSubmitExpenseTask: {
                title: '\u7D4C\u8CBB\u3092\u63D0\u51FA\u3059\u308B',
                description: '*\u7D4C\u8CBB\u3092\u63D0\u51FA\u3059\u308B* \u306B\u306F\u3001\u91D1\u984D\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u7D4C\u8CBB\u306E\u4F5C\u6210*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. \u91D1\u984D\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u307E\u3059\u3002\n' +
                    '4. \u8A73\u7D30\u3092\u78BA\u8A8D\u3057\u307E\u3059\u3002\n' +
                    '5. *\u4F5C\u6210*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    "\u3053\u308C\u3067\u5B8C\u4E86\u3067\u3059\uFF01",
            },
            trackExpenseTask: {
                title: '\u7D4C\u8CBB\u3092\u8FFD\u8DE1\u3059\u308B',
                description: '*\u7D4C\u8CBB\u3092\u8FFD\u8DE1\u3059\u308B* \u306B\u306F\u3001\u3042\u306A\u305F\u304C\u9818\u53CE\u66F8\u3092\u6301\u3063\u3066\u3044\u308B\u304B\u3069\u3046\u304B\u306B\u304B\u304B\u308F\u3089\u305A\u3001\u3044\u304B\u306A\u308B\u901A\u8CA8\u3067\u3082\u53EF\u80FD\u3067\u3059\u3002\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u7D4C\u8CBB\u306E\u4F5C\u6210*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. \u91D1\u984D\u3092\u5165\u529B\u3059\u308B\u304B\u3001\u9818\u53CE\u66F8\u3092\u30B9\u30AD\u30E3\u30F3\u3057\u307E\u3059\u3002\n' +
                    '4. *\u500B\u4EBA*\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '5. *\u4F5C\u6210*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u3053\u308C\u3067\u5B8C\u4E86\u3067\u3059\uFF01\u306F\u3044\u3001\u305D\u308C\u307B\u3069\u7C21\u5358\u3067\u3059\u3002',
            },
            addAccountingIntegrationTask: {
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '\u3068', "[").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '\u3042\u306A\u305F\u306E' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")\u3068\u63A5\u7D9A\u3059\u308B");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '\u3042\u306A\u305F\u306E' : '', " ").concat(integrationName, "\u3068\u63A5\u7D9A\u3059\u308B\u3068\u3001\u7D4C\u8CBB\u306E\u81EA\u52D5\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0\u3068\u540C\u671F\u304C\u53EF\u80FD\u306B\u306A\u308A\u3001\u6708\u672B\u306E\u7D50\u7B97\u304C\u5BB9\u6613\u306B\u306A\u308A\u307E\u3059\u3002\n") +
                        '\n' +
                        '1. *\u8A2D\u5B9A*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '2. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u306B\u79FB\u52D5\u3057\u307E\u3059\u3002\n' +
                        '3. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '4. *\u4F1A\u8A08*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        "5. ".concat(integrationName, "\u3092\u63A2\u3057\u307E\u3059\u3002\n") +
                        '6. *\u63A5\u7D9A*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[\u4F1A\u8A08\u306B\u79FB\u52D5\u3059\u308B](".concat(workspaceAccountingLink, ").\n\n![").concat(integrationName, "\u3068\u63A5\u7D9A\u3059\u308B](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[\u4F1A\u8A08\u306B\u79FB\u52D5\u3059\u308B](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "[\u3042\u306A\u305F\u306E\u6CD5\u4EBA\u30AB\u30FC\u30C9](".concat(corporateCardLink, ")\u3092\u63A5\u7D9A\u3059\u308B");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "\u6CD5\u4EBA\u30AB\u30FC\u30C9\u3092\u63A5\u7D9A\u3059\u308B\u3068\u3001\u7D4C\u8CBB\u3092\u81EA\u52D5\u7684\u306B\u30A4\u30F3\u30DD\u30FC\u30C8\u3057\u3001\u30B3\u30FC\u30C9\u5316\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002\n" +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '2. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '3. *\u6CD5\u4EBA\u30AB\u30FC\u30C9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '4. \u30D7\u30ED\u30F3\u30D7\u30C8\u306B\u5F93\u3063\u3066\u30AB\u30FC\u30C9\u3092\u63A5\u7D9A\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "[\u79C1\u306E\u6CD5\u4EBA\u30AB\u30FC\u30C9\u3092\u63A5\u7D9A\u3059\u308B](".concat(corporateCardLink, ")\u3002");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "[\u3042\u306A\u305F\u306E\u30C1\u30FC\u30E0](".concat(workspaceMembersLink, ")\u3092\u62DB\u5F85\u3059\u308B");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*\u3042\u306A\u305F\u306E\u30C1\u30FC\u30E0\u3092\u62DB\u5F85\u3057\u307E\u3059* \u3068\u3001\u5F7C\u3089\u306F\u4ECA\u65E5\u304B\u3089\u7D4C\u8CBB\u306E\u8FFD\u8DE1\u3092\u958B\u59CB\u3067\u304D\u307E\u3059\u3002\n' +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '3. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '4. *\u30E1\u30F3\u30D0\u30FC* > *\u30E1\u30F3\u30D0\u30FC\u3092\u62DB\u5F85*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '5. \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u3092\u5165\u529B\u3057\u307E\u3059\u3002\n' +
                        '6. \u5FC5\u8981\u306B\u5FDC\u3058\u3066\u30AB\u30B9\u30BF\u30E0\u62DB\u5F85\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u8FFD\u52A0\u3057\u307E\u3059\uFF01\n' +
                        '\n' +
                        "[\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30E1\u30F3\u30D0\u30FC\u3078](".concat(workspaceMembersLink, ")\u3002\n") +
                        '\n' +
                        "![\u3042\u306A\u305F\u306E\u30C1\u30FC\u30E0\u3092\u62DB\u5F85](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "[\u30AB\u30C6\u30B4\u30EA\u30FC](".concat(workspaceCategoriesLink, ")\u3068[\u30BF\u30B0](").concat(workspaceMoreFeaturesLink, ")\u3092\u8A2D\u5B9A\u3059\u308B");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*\u30AB\u30C6\u30B4\u30EA\u30FC\u3068\u30BF\u30B0\u3092\u8A2D\u5B9A\u3057\u307E\u3059* \u3068\u3001\u30C1\u30FC\u30E0\u306F\u7D4C\u8CBB\u3092\u30B3\u30FC\u30C9\u5316\u3057\u3066\u5BB9\u6613\u306B\u5831\u544A\u3067\u304D\u307E\u3059\u3002\n' +
                        '\n' +
                        "[\u4F1A\u8A08\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u3092\u63A5\u7D9A\u3059\u308B](".concat(workspaceAccountingLink, ")\u3053\u3068\u3067\u81EA\u52D5\u7684\u306B\u30A4\u30F3\u30DD\u30FC\u30C8\u3059\u308B\u304B\u3001[\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u8A2D\u5B9A](").concat(workspaceCategoriesLink, ")\u3067\u624B\u52D5\u3067\u8A2D\u5B9A\u3057\u307E\u305B\u3093\u304B\u3002");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "[\u30BF\u30B0](".concat(workspaceMoreFeaturesLink, ")\u3092\u8A2D\u5B9A\u3059\u308B");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return '\u30BF\u30B0\u3092\u4F7F\u7528\u3057\u3066\u3001\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3001\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u3001\u5834\u6240\u3001\u90E8\u7F72\u306A\u3069\u306E\u8FFD\u52A0\u306E\u7D4C\u8CBB\u8A73\u7D30\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002\u8907\u6570\u306E\u30EC\u30D9\u30EB\u306E\u30BF\u30B0\u304C\u5FC5\u8981\u306A\u5834\u5408\u306F\u3001Control\u30D7\u30E9\u30F3\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3067\u304D\u307E\u3059\u3002\n' +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '3. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '4. *\u305D\u306E\u4ED6\u306E\u6A5F\u80FD*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '5. *\u30BF\u30B0*\u3092\u6709\u52B9\u306B\u3057\u307E\u3059\u3002\n' +
                        '6. \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u30A8\u30C7\u30A3\u30BF\u30FC\u3067*\u30BF\u30B0*\u306B\u79FB\u52D5\u3057\u307E\u3059\u3002\n' +
                        '7. *+\u30BF\u30B0\u3092\u8FFD\u52A0*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u3001\u81EA\u5206\u306E\u30BF\u30B0\u3092\u4F5C\u6210\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "[\u305D\u306E\u4ED6\u306E\u6A5F\u80FD\u3078](".concat(workspaceMoreFeaturesLink, ")\u3002\n") +
                        '\n' +
                        "![\u30BF\u30B0\u3092\u8A2D\u5B9A](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "\u3042\u306A\u305F\u306E[ \u4F1A\u8A08\u58EB ](".concat(workspaceMembersLink, ")\u3092\u62DB\u5F85");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*\u3042\u306A\u305F\u306E\u4F1A\u8A08\u58EB\u3092\u62DB\u5F85* \u3057\u3066\u3001\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u5354\u529B\u3057\u3001\u4F01\u696D\u7D4C\u8CBB\u3092\u7BA1\u7406\u3057\u307E\u3057\u3087\u3046\u3002\n' +
                        '\n' +
                        '1. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9* \u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '2. \u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                        '3. *\u30E1\u30F3\u30D0\u30FC* \u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '4. *\u30E1\u30F3\u30D0\u30FC\u3092\u62DB\u5F85* \u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '5. \u4F1A\u8A08\u58EB\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u307E\u3059\u3002\n' +
                        '\n' +
                        "[\u4ECA\u3059\u3050\u4F1A\u8A08\u58EB\u3092\u62DB\u5F85](".concat(workspaceMembersLink, ")\u3002");
                },
            },
            startChatTask: {
                title: '\u30C1\u30E3\u30C3\u30C8\u3092\u958B\u59CB\u3059\u308B',
                description: '*\u30C1\u30E3\u30C3\u30C8\u3092\u958B\u59CB\u3059\u308B* \u306B\u306F\u3001\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u3092\u4F7F\u7528\u3057\u3066\u8AB0\u3068\u3067\u3082\u30C1\u30E3\u30C3\u30C8\u3067\u304D\u307E\u3059\u3002\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u30C1\u30E3\u30C3\u30C8\u3092\u958B\u59CB*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u3092\u5165\u529B\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u5F7C\u3089\u304C\u307E\u3060Expensify\u3092\u4F7F\u7528\u3057\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u81EA\u52D5\u7684\u306B\u62DB\u5F85\u3055\u308C\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u3059\u3079\u3066\u306E\u30C1\u30E3\u30C3\u30C8\u306F\u3001\u30C0\u30A4\u30EC\u30AF\u30C8\u306B\u8FD4\u4FE1\u3067\u304D\u308B\u30E1\u30FC\u30EB\u307E\u305F\u306F\u30C6\u30AD\u30B9\u30C8\u306B\u3082\u5909\u63DB\u3055\u308C\u307E\u3059\u3002',
            },
            splitExpenseTask: {
                title: '\u7D4C\u8CBB\u3092\u5206\u5272\u3059\u308B',
                description: '*\u7D4C\u8CBB\u3092\u5206\u5272\u3059\u308B* \u306B\u306F\u30011\u4EBA\u307E\u305F\u306F\u8907\u6570\u306E\u4EBA\u3068\u5171\u6709\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u30C1\u30E3\u30C3\u30C8\u3092\u958B\u59CB*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u3092\u5165\u529B\u3057\u307E\u3059\u3002\n' +
                    '4. \u30C1\u30E3\u30C3\u30C8\u5185\u306E\u7070\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF > *\u7D4C\u8CBB\u3092\u5206\u5272*\u3002\n' +
                    '5. *\u624B\u52D5* \u3001*\u30B9\u30AD\u30E3\u30F3* \u3001\u307E\u305F\u306F*\u8DDD\u96E2*\u3092\u9078\u629E\u3057\u3066\u7D4C\u8CBB\u3092\u4F5C\u6210\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u5FC5\u8981\u306A\u3089\u3070\u8A73\u7D30\u3092\u8FFD\u52A0\u3059\u308B\u304B\u3001\u5358\u306B\u9001\u4FE1\u3057\u307E\u3059\u3002\u6255\u3044\u623B\u3057\u3092\u3042\u308A\u307E\u3057\u3087\u3046\uFF01',
            },
            reviewWorkspaceSettingsTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "[\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u8A2D\u5B9A](".concat(workspaceSettingsLink, ")\u3092\u78BA\u8A8D\u3059\u308B");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u8A2D\u5B9A\u3092\u78BA\u8A8D\u304A\u3088\u3073\u66F4\u65B0\u3059\u308B\u65B9\u6CD5\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059\uFF1A\n' +
                        '1. \u8A2D\u5B9A\u30BF\u30D6\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        '2. *\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9* > [\u3042\u306A\u305F\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9]\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                        "[\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3078\u79FB\u52D5](".concat(workspaceSettingsLink, ")\u3002#admins\u30EB\u30FC\u30E0\u3067\u3068\u3082\u306B\u8FFD\u8DE1\u3057\u307E\u3059\u3002");
                },
            },
            createReportTask: {
                title: '\u521D\u3081\u3066\u306E\u30EC\u30DD\u30FC\u30C8\u3092\u4F5C\u6210\u3059\u308B',
                description: '\u30EC\u30DD\u30FC\u30C8\u3092\u4F5C\u6210\u3059\u308B\u65B9\u6CD5\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059\uFF1A\n' +
                    '\n' +
                    '1. \u7DD1\u8272\u306E*+*\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '2. *\u30EC\u30DD\u30FC\u30C8\u306E\u4F5C\u6210*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n' +
                    '3. *\u7D4C\u8CBB\u3092\u8FFD\u52A0*\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n' +
                    '4. \u6700\u521D\u306E\u7D4C\u8CBB\u3092\u8FFD\u52A0\u3057\u307E\u3059\u3002\n' +
                    '\n' +
                    '\u3053\u308C\u3067\u5B8C\u4E86\u3067\u3059\uFF01',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return testDriveURL ? "\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6](".concat(testDriveURL, ")\u3092\u884C\u3046") : '\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6\u3092\u884C\u3046';
            },
            embeddedDemoIframeTitle: '\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6',
            employeeFakeReceipt: {
                description: '\u79C1\u306E\u30C6\u30B9\u30C8\u30C9\u30E9\u30A4\u30D6\u306E\u9818\u53CE\u66F8\uFF01',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: '\u652F\u6255\u3044\u3092\u53D7\u3051\u53D6\u308B\u306E\u306F\u3001\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u308B\u306E\u3068\u540C\u3058\u304F\u3089\u3044\u7C21\u5358\u3067\u3059\u3002\u57FA\u672C\u3092\u78BA\u8A8D\u3057\u307E\u3057\u3087\u3046\u3002',
            onboardingPersonalSpendMessage: '\u6570\u56DE\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3060\u3051\u3067\u3042\u306A\u305F\u306E\u652F\u51FA\u3092\u8FFD\u8DE1\u3059\u308B\u65B9\u6CD5\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059\u3002',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "\u3042\u306A\u305F\u306E\u4F1A\u793E\u306E\u898F\u6A21\u3067\u306F\u3001".concat(onboardingCompanySize, "\u4EBA\u306E\u63D0\u51FA\u8005\u304C\u3044\u308B\u5834\u5408\u306B\u304A\u52E7\u3081\u3059\u308B\u30BF\u30B9\u30AF\u30EA\u30B9\u30C8\u3092\u7D39\u4ECB\u3057\u307E\u3059\uFF1A");
            },
            onboardingTrackWorkspaceMessage: '# \u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3057\u307E\u3057\u3087\u3046\n\u3063\u3066\u3001\u304A\u624B\u4F1D\u3044\u3057\u307E\u3059\uFF01\u958B\u59CB\u306B\u3042\u305F\u3063\u3066\u3001\u3042\u306A\u305F\u306E\u30ef\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u8A2D\u5B9A\u3092\u500B\u4EBA\u4E8B\u696D\u4E3B\u3084\u985E\u4F3C\u306E\u4F01\u696D\u306B\u5408\u308F\u305B\u3066\u8ABF\u6574\u3057\u307E\u3057\u305F\u3002\u4EE5\u4E0B\u306E\u30EA\u30F3\u30AF\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u3001\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u8ABF\u6574\u3067\u304D\u307E\u3059\uFF01\n\n\u6570\u56DE\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3060\u3051\u3067\u3042\u306A\u305F\u306E\u652F\u51FA\u3092\u8FFD\u8DE1\u3059\u308B\u65B9\u6CD5\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059\u3002',
            onboardingChatSplitMessage: '\u53CB\u9054\u3068\u306E\u8ACB\u6C42\u66F8\u306E\u5206\u5272\u306F\u3001\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u308B\u306E\u3068\u540C\u3058\u304F\u3089\u3044\u7C21\u5358\u3067\u3059\u3002\u65B9\u6CD5\u306F\u6B21\u306E\u3068\u304A\u308A\u3067\u3059\u3002',
            onboardingAdminMessage: '\u7BA1\u7406\u8005\u3068\u3057\u3066\u30C1\u30FC\u30E0\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u7BA1\u7406\u3057\u3001\u81EA\u5206\u306E\u7D4C\u8CBB\u3092\u63D0\u51FA\u3059\u308B\u65B9\u6CD5\u3092\u5B66\u3073\u307E\u3057\u3087\u3046\u3002',
            onboardingLookingAroundMessage: 'Expensify\u306F\u7D4C\u8CBB\u3001\u51FA\u5F35\u3001\u6CD5\u4EBA\u30AB\u30FC\u30C9\u7BA1\u7406\u3067\u6700\u3082\u3088\u304F\u77E5\u3089\u308C\u3066\u3044\u307E\u3059\u304C\u3001\u305D\u308C\u4EE5\u5916\u306B\u3082\u305F\u304F\u3055\u3093\u306E\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002\u4F55\u306B\u8208\u5473\u304C\u3042\u308B\u304B\u304A\u77E5\u3089\u305B\u304F\u3060\u3055\u3044\u3002\u304A\u624B\u4F1D\u3044\u3057\u307E\u3059\u3002',
            onboardingTestDriveReceiverMessage: '*\u3042\u306A\u305F\u306B\u306F3\u304B\u6708\u304C\u7121\u6599\u3067\u5229\u7528\u3067\u304D\u307E\u3059\uFF01\u4EE5\u4E0B\u304B\u3089\u958B\u59CB\u3057\u3066\u304F\u3060\u3055\u3044\u3002*',
        },
        workspace: {
            title: 'ワークスペースで整理整頓を保つ',
            subtitle: '経費管理を簡素化するための強力なツールをすべて一か所で利用できます。ワークスペースを使用すると、次のことができます。',
            explanationModal: {
                descriptionOne: '領収書を追跡して整理する',
                descriptionTwo: '経費を分類してタグ付けする',
                descriptionThree: 'レポートを作成して共有する',
            },
            price: '30日間無料でお試しいただけます。その後、<strong>$5/月</strong>でアップグレードしてください。',
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
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "\u65E5\u4ED8\u306F".concat(dateString, "\u3088\u308A\u524D\u3067\u306A\u3051\u308C\u3070\u306A\u308A\u307E\u305B\u3093\u3002");
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "\u65E5\u4ED8\u306F".concat(dateString, "\u4EE5\u964D\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002");
            },
            hasInvalidCharacter: '名前にはラテン文字のみを含めることができます。',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "\u7121\u52B9\u306A\u90F5\u4FBF\u756A\u53F7\u5F62\u5F0F".concat(zipFormat ? "\u8A31\u5BB9\u3055\u308C\u308B\u5F62\u5F0F: ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "\u96FB\u8A71\u756A\u53F7\u304C\u6709\u52B9\u3067\u3042\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044 (\u4F8B: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクが再送信されました。',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "".concat(login, "\u306B\u30DE\u30B8\u30C3\u30AF\u30B5\u30A4\u30F3\u30A4\u30F3\u30EA\u30F3\u30AF\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F\u3002\u30B5\u30A4\u30F3\u30A4\u30F3\u3059\u308B\u306B\u306F").concat(loginType, "\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        resendLink: 'リンクを再送信',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "".concat(secondaryLogin, "\u3092\u78BA\u8A8D\u3059\u308B\u306B\u306F\u3001").concat(primaryLogin, "\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u8A2D\u5B9A\u304B\u3089\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u518D\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "".concat(primaryLogin, "\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u306A\u304F\u306A\u3063\u305F\u5834\u5408\u306F\u3001\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u30EA\u30F3\u30AF\u3092\u89E3\u9664\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        unlink: 'リンク解除',
        linkSent: 'リンクが送信されました！',
        successfullyUnlinkedLogin: 'セカンダリーログインのリンク解除に成功しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "\u79C1\u305F\u3061\u306E\u30E1\u30FC\u30EB\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306F\u3001\u914D\u4FE1\u306E\u554F\u984C\u306B\u3088\u308A".concat(login, "\u3078\u306E\u30E1\u30FC\u30EB\u3092\u4E00\u6642\u7684\u306B\u505C\u6B62\u3057\u307E\u3057\u305F\u3002\u30ED\u30B0\u30A4\u30F3\u3092\u89E3\u9664\u3059\u308B\u306B\u306F\u3001\u6B21\u306E\u624B\u9806\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "".concat(login, "\u304C\u6B63\u3057\u304F\u7DB4\u3089\u308C\u3066\u304A\u308A\u3001\u5B9F\u969B\u306B\u914D\u4FE1\u53EF\u80FD\u306A\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3067\u3042\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        emailAliases: '「expenses@domain.com」のようなメールエイリアスは、有効なExpensifyログインとするために、自分のメール受信箱にアクセスできる必要があります。',
        ensureYourEmailClient: 'メールクライアントがexpensify.comからのメールを許可していることを確認してください。',
        youCanFindDirections: 'このステップを完了する方法についての指示を見つけることができます。',
        helpConfigure: 'ただし、メール設定の構成にはIT部門の支援が必要な場合があります。',
        onceTheAbove: '上記の手順が完了したら、に連絡してください。',
        toUnblock: 'ログインを解除するために。',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "".concat(login, "\u306BSMS\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u4E00\u6642\u7684\u306B\u505C\u6B62\u3057\u307E\u3057\u305F\u3002\u756A\u53F7\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        validationSuccess: 'あなたの番号が確認されました！新しいマジックサインインコードを送信するには、以下をクリックしてください。',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'もう一度試す前に少々お待ちください。';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? '日' : '日'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? '時間' : '時間'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? '分' : '分'));
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
            return "\u304A\u5F85\u3061\u304F\u3060\u3055\u3044\uFF01\u3082\u3046\u4E00\u5EA6\u756A\u53F7\u3092\u78BA\u8A8D\u3059\u308B\u306B\u306F\u3001".concat(timeText, "\u5F85\u3064\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002");
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
        prompt: '未読のチャットや注意が必要なチャットのみを表示することで、物事を把握しましょう。心配しないでください、これはいつでも変更できます。',
        settings: '設定',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しの支払い詳細が見つかりません。',
        notHere: 'うーん... ここにはないですね。',
        pageNotFound: 'おっと、このページは見つかりません',
        noAccess: 'このチャットまたは経費は削除されたか、アクセス権がありません。\n\nご質問がある場合は、concierge@expensify.com にお問い合わせください。',
        goBackHome: 'ホームページに戻る',
    },
    errorPage: {
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "\u304A\u3063\u3068... ".concat(isBreakLine ? '\n' : '', "\u4F55\u304B\u304C\u3046\u307E\u304F\u3044\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002");
        },
        subtitle: 'リクエストを完了できませんでした。後でもう一度お試しください。',
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
        setVacationDelegate: "\u4E0D\u5728\u4E2D\u306B\u30EC\u30DD\u30FC\u30C8\u3092\u627F\u8A8D\u3057\u3066\u3082\u3089\u3046\u305F\u3081\u3001\u4F11\u6687\u4EE3\u7406\u4EBA\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "".concat(managerName, "\u306E\u4F11\u6687\u4EE3\u7406\u4EBA\u3068\u3057\u3066");
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "".concat(submittedToName, "\u3078\u3001").concat(vacationDelegateName, "\u306E\u4F11\u6687\u4EE3\u7406\u4EBA\u3068\u3057\u3066");
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "".concat(nameOrEmail, " \u3092\u4F11\u6687\u4EE3\u7406\u4EBA\u3068\u3057\u3066\u8A2D\u5B9A\u3057\u3066\u3044\u307E\u3059\u3002\u307E\u3060\u3059\u3079\u3066\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u305B\u3093\u3002\u7D9A\u884C\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u7BA1\u7406\u8005\u306B\u8FFD\u52A0\u3092\u4F9D\u983C\u3059\u308B\u30E1\u30FC\u30EB\u304C\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002");
        },
        untilTomorrow: '明日まで',
        untilTime: function (_a) {
            var time = _a.time;
            return "".concat(time, "\u307E\u3067");
        },
        date: '日付',
        time: '時間',
        clearAfter: '後でクリア',
        whenClearStatus: 'いつステータスをクリアすべきですか？',
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "\u30B9\u30C6\u30C3\u30D7".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
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
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "\u9280\u884C\u53E3\u5EA7\u3092\u63A5\u7D9A\u3059\u308B\u306B\u306F\u3001\u304A\u9858\u3044\u3057\u307E\u3059 <a href=\"".concat(contactMethodRoute, "\">\u30E1\u30FC\u30EB\u3092\u30D7\u30E9\u30A4\u30DE\u30EA\u30FC\u30ED\u30B0\u30A4\u30F3\u3068\u3057\u3066\u8FFD\u52A0\u3059\u308B</a> \u3082\u3046\u4E00\u5EA6\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u96FB\u8A71\u756A\u53F7\u3092\u30BB\u30AB\u30F3\u30C0\u30EA\u30ED\u30B0\u30A4\u30F3\u3068\u3057\u3066\u8FFD\u52A0\u3067\u304D\u307E\u3059\u3002");
        },
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから再試行してください。',
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "\u304A\u3063\u3068\uFF01\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u901A\u8CA8\u304CUSD\u3068\u306F\u7570\u306A\u308B\u901A\u8CA8\u306B\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u308B\u3088\u3046\u3067\u3059\u3002\u7D9A\u884C\u3059\u308B\u306B\u306F\u3001\u3053\u3061\u3089\u306B\u30A2\u30AF\u30BB\u30B9\u3057\u3066\u304F\u3060\u3055\u3044\u3002<a href=\"".concat(workspaceRoute, "\">\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8A2D\u5B9A</a> USD\u306B\u8A2D\u5B9A\u3057\u3066\u3001\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002");
        },
        error: {
            youNeedToSelectAnOption: 'オプションを選択してください',
            noBankAccountAvailable: '申し訳ありませんが、利用可能な銀行口座がありません。',
            noBankAccountSelected: 'アカウントを選択してください',
            taxID: '有効な税務ID番号を入力してください',
            website: '有効なウェブサイトを入力してください',
            zipCode: "\u6709\u52B9\u306A\u90F5\u4FBF\u756A\u53F7\u3092\u6B21\u306E\u5F62\u5F0F\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044: ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
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
        unknownFilename: 'Unknown filename',
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
    },
    messages: {
        errorMessageInvalidPhone: "\u6709\u52B9\u306A\u96FB\u8A71\u756A\u53F7\u3092\u62EC\u5F27\u3084\u30C0\u30C3\u30B7\u30E5\u306A\u3057\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u7C73\u56FD\u5916\u306E\u5834\u5408\u306F\u3001\u56FD\u30B3\u30FC\u30C9\u3092\u542B\u3081\u3066\u304F\u3060\u3055\u3044\uFF08\u4F8B: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, "\uFF09\u3002"),
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " \u306F\u3059\u3067\u306B ").concat(name, " \u306E\u30E1\u30F3\u30D0\u30FC\u3067\u3059");
        },
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化リクエストを続行することで、あなたは読んで理解し、受け入れたことを確認します',
        facialScan: 'Onfidoの顔認識ポリシーとリリース',
        tryAgain: 'もう一度試してください。',
        verifyIdentity: '本人確認を行う',
        letsVerifyIdentity: 'あなたの身元を確認しましょう',
        butFirst: "\u3067\u3082\u307E\u305A\u306F\u9000\u5C48\u306A\u3053\u3068\u304B\u3089\u3002\u6B21\u306E\u30B9\u30C6\u30C3\u30D7\u3067\u6CD5\u7684\u6587\u66F8\u3092\u8AAD\u3093\u3067\u3001\u6E96\u5099\u304C\u3067\u304D\u305F\u3089\u300C\u627F\u8AFE\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
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
        failedKYCTextBefore: '本人確認ができませんでした。後でもう一度お試しいただくか、にお問い合わせください。',
        failedKYCTextAfter: 'ご質問がある場合。',
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '手数料と条件',
        haveReadAndAgree: '私は、受け取ることに同意します',
        electronicDisclosures: '電子開示',
        agreeToThe: '同意する',
        walletAgreement: 'ウォレット契約',
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
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "Expensify\u30A6\u30A9\u30EC\u30C3\u30C8\u306F".concat(walletProgram, "\u306B\u3088\u3063\u3066\u767A\u884C\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
            },
            perPurchase: '購入ごとに',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金リロード',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会',
            inOrOutOfNetwork: '（ネットワーク内またはネットワーク外）',
            customerService: 'カスタマーサービス',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '（12か月間取引がない場合）',
            weChargeOneFee: '私たちは他に1種類の手数料を請求します。それは:',
            fdicInsurance: 'あなたの資金はFDIC保険の対象です。',
            generalInfo: 'プリペイドアカウントに関する一般情報については、こちらをご覧ください。',
            conditionsDetails: 'すべての料金およびサービスの詳細と条件については、こちらをご覧ください',
            conditionsPhone: 'または +1 833-400-0904 にお電話ください。',
            instant: '(instant)',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
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
            fdicInsuranceBancorp2: '詳細については。',
            contactExpensifyPayments: "".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " \u306B\u9023\u7D61\u3059\u308B\u306B\u306F\u3001+1 833-400-0904 \u306B\u96FB\u8A71\u3059\u308B\u304B\u3001\u30E1\u30FC\u30EB\u3067\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002"),
            contactExpensifyPayments2: 'またはサインイン',
            generalInformation: 'プリペイドアカウントに関する一般情報については、こちらをご覧ください。',
            generalInformation2: 'プリペイドアカウントに関する苦情がある場合は、消費者金融保護局（Consumer Financial Protection Bureau）に1-855-411-2372までお電話いただくか、次のウェブサイトをご覧ください。',
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動化',
            liveAgent: 'ライブエージェント',
            instant: 'インスタント',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "\u6700\u5C0F ".concat(amount);
            },
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
        whatsTheBusinessRegistrationNumber: '事業登録番号は何ですか?',
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return '雇用者識別番号（EIN）とは何ですか？';
                case CONST_1.default.COUNTRY.CA:
                    return '法人番号（BN）とは何ですか？';
                case CONST_1.default.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST_1.default.COUNTRY.AU:
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
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "".concat(currencyCode, "\u3067\u306E\u5E74\u9593\u652F\u6255\u984D");
        },
        averageReimbursementAmount: '平均払い戻し額',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "".concat(currencyCode, "\u3067\u306E\u5E73\u5747\u6255\u3044\u623B\u3057\u984D");
        },
        selectIncorporationType: '法人の種類を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払い額を選択',
        selectIncorporationCountry: '法人設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        findIncorporationType: '法人の種類を見つける',
        findBusinessCategory: 'ビジネスカテゴリを見つける',
        findAnnualPaymentVolume: '年間支払い額を見つける',
        findIncorporationState: '設立州を見つける',
        findAverageReimbursement: '平均払い戻し額を見つける',
        error: {
            registrationNumber: '有効な登録番号を提供してください。',
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return '有効な雇用者識別番号（EIN）を入力してください';
                    case CONST_1.default.COUNTRY.CA:
                        return '有効な法人番号（BN）を入力してください';
                    case CONST_1.default.COUNTRY.GB:
                        return '有効なVAT登録番号（VRN）を入力してください';
                    case CONST_1.default.COUNTRY.AU:
                        return '有効なオーストラリア事業番号（ABN）を入力してください';
                    default:
                        return '有効なEU VAT番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'あなたは25％以上を所有していますか',
        doAnyIndividualOwn25percent: '25%以上を所有している個人はいますか',
        areThereMoreIndividualsWhoOwn25percent: '25％以上を所有する個人は他にいますか',
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
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "".concat(companyName, "\u306E25%\u4EE5\u4E0A\u3092\u6240\u6709\u3057\u3066\u3044\u307E\u3059\u304B\uFF1F");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "".concat(companyName, "\u306E25%\u4EE5\u4E0A\u3092\u6240\u6709\u3057\u3066\u3044\u308B\u500B\u4EBA\u306F\u3044\u307E\u3059\u304B\uFF1F");
        },
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
        dontWorry: 'ご安心ください、私たちは個人の信用調査を行いません！',
        last4: 'SSNの下4桁',
        whyDoWeAsk: 'なぜこれを尋ねるのですか？',
        letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '所有権の割合',
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "".concat(companyName, "\u306E25%\u4EE5\u4E0A\u3092\u6240\u6709\u3057\u3066\u3044\u308B\u4ED6\u306E\u500B\u4EBA\u306F\u3044\u307E\u3059\u304B?");
        },
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
        proofOfBeneficialOwnerDescription: '25%以上のビジネス所有権を確認するために、公認会計士、公証人、または弁護士からの署名入りの証明書と組織図を提供してください。それは過去3ヶ月以内の日付であり、署名者のライセンス番号を含む必要があります。',
        copyOfID: '受益所有者のIDのコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など。',
        proofOfAddress: '受益所有者の住所証明書',
        proofOfAddressDescription: '例: 公共料金の請求書、賃貸契約書など。',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: 'サイト訪問のビデオまたは署名担当者との録音された通話をアップロードしてください。担当者は次の情報を提供する必要があります：氏名、生年月日、会社名、登録番号、税コード番号、登録住所、事業の性質、アカウントの目的。',
    },
    validationStep: {
        headerTitle: '銀行口座を確認する',
        buttonText: 'セットアップを完了する',
        maxAttemptsReached: 'この銀行口座の検証は、不正な試行が多すぎるため無効になっています。',
        description: "1\uFF5E2\u55B6\u696D\u65E5\u4EE5\u5185\u306B\u3001\u300CExpensify, Inc. Validation\u300D\u306E\u3088\u3046\u306A\u540D\u524D\u304B\u3089\u3042\u306A\u305F\u306E\u9280\u884C\u53E3\u5EA7\u306B3\u3064\u306E\u5C0F\u984D\u53D6\u5F15\u3092\u9001\u4FE1\u3057\u307E\u3059\u3002",
        descriptionCTA: '以下のフィールドに各取引金額を入力してください。例: 1.51。',
        reviewingInfo: 'ありがとうございます！私たちはあなたの情報を確認しており、すぐにご連絡いたします。Conciergeとのチャットをご確認ください。',
        forNextStep: '銀行口座の設定を完了するための次のステップ。',
        letsChatCTA: 'はい、チャットしましょう',
        letsChatText: 'もう少しです！チャットでいくつかの情報を確認するお手伝いをお願いします。準備はいいですか？',
        letsChatTitle: 'チャットしましょう！',
        enable2FATitle: '不正行為を防ぐために、二要素認証（2FA）を有効にしてください。',
        enable2FAText: '私たちはあなたのセキュリティを真剣に考えています。アカウントに追加の保護層を加えるために、今すぐ2FAを設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    beneficialOwnersStep: {
        additionalInformation: '追加情報',
        checkAllThatApply: '該当するものにすべてチェックを入れ、それ以外は空白のままにしてください。',
        iOwnMoreThan25Percent: '私は25%以上を所有しています',
        someoneOwnsMoreThan25Percent: '他の誰かが25%以上を所有しています',
        additionalOwner: '追加の実質的支配者',
        removeOwner: 'この実質的支配者を削除する',
        addAnotherIndividual: '25%以上を所有している別の個人を追加',
        agreement: '同意:',
        termsAndConditions: '利用規約',
        certifyTrueAndAccurate: '私は提供された情報が真実で正確であることを証明します。',
        error: {
            certify: '情報が真実で正確であることを証明する必要があります。',
        },
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
        connectBankAccount: '銀行口座を接続',
        finishButtonText: 'セットアップを完了する',
        validateYourBankAccount: '銀行口座を確認してください',
        validateButtonText: '検証する',
        validationInputLabel: '取引',
        maxAttemptsReached: 'この銀行口座の検証は、不正な試行が多すぎるため無効になっています。',
        description: "1\uFF5E2\u55B6\u696D\u65E5\u4EE5\u5185\u306B\u3001\u300CExpensify, Inc. Validation\u300D\u306E\u3088\u3046\u306A\u540D\u524D\u304B\u3089\u3042\u306A\u305F\u306E\u9280\u884C\u53E3\u5EA7\u306B3\u3064\u306E\u5C0F\u984D\u53D6\u5F15\u3092\u9001\u4FE1\u3057\u307E\u3059\u3002",
        descriptionCTA: '以下のフィールドに各取引金額を入力してください。例: 1.51。',
        reviewingInfo: 'ありがとうございます！私たちはあなたの情報を確認しており、すぐにご連絡いたします。Conciergeとのチャットをご確認ください。',
        forNextSteps: '銀行口座の設定を完了するための次のステップ。',
        letsChatCTA: 'はい、チャットしましょう',
        letsChatText: 'もう少しです！チャットでいくつかの情報を確認するお手伝いをお願いします。準備はいいですか？',
        letsChatTitle: 'チャットしましょう！',
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
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "\u3042\u306A\u305F\u306F".concat(companyName, "\u306E\u53D6\u7DE0\u5F79\u307E\u305F\u306F\u4E0A\u7D1A\u5F79\u54E1\u3067\u3059\u304B\uFF1F");
        },
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
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "".concat(companyName, "\u306E\u30C7\u30A3\u30EC\u30AF\u30BF\u30FC\u307E\u305F\u306F\u4E0A\u7D1A\u5F79\u54E1\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        regulationRequiresOneMoreDirector: '規制により、署名者として少なくとももう一人の取締役または上級役員が必要です。',
        hangTight: 'お待ちください…',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "".concat(companyName, "\u306E\u53D6\u7DE0\u5F79\u307E\u305F\u306F\u4E0A\u7D1A\u5F79\u54E1\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u30922\u4EF6\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: '私たちは、他の人がビジネスの取締役または上級役員としての身元を確認するのを待っています。',
        id: 'IDのコピー',
        proofOfDirectors: '取締役の証明書',
        proofOfDirectorsDescription: '例: Oncorp Corporate Profile または Business Registration.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: '署名者、認定ユーザー、および実質的所有者のためのCodice Fiscale。',
        PDSandFSG: 'PDS + FSG開示書類',
        PDSandFSGDescription: '私たちのCorpayとの提携は、API接続を利用して、彼らの広範な国際銀行パートナーのネットワークを活用し、Expensifyでのグローバル払い戻しを実現します。オーストラリアの規制に従い、Corpayの金融サービスガイド（FSG）と製品開示声明（PDS）を提供しています。\n\nFSGとPDSの文書には、Corpayが提供する製品とサービスに関する詳細情報と重要な情報が含まれているため、注意深くお読みください。これらの文書は、将来の参考のために保管してください。',
        pleaseUpload: '事業体の取締役または上級役員としての身元を確認するために、追加の書類を以下にアップロードしてください。',
    },
    agreementsStep: {
        agreements: '契約書',
        pleaseConfirm: '以下の契約を確認してください',
        regulationRequiresUs: '規制により、事業の25%以上を所有する個人の身元を確認する必要があります。',
        iAmAuthorized: '私はビジネス支出のためにビジネス銀行口座を使用する権限があります。',
        iCertify: '提供された情報が真実で正確であることを証明します。',
        termsAndConditions: '利用規約',
        accept: '銀行口座を承認して追加',
        iConsentToThe: '私はこれに同意します',
        privacyNotice: 'プライバシー通知',
        error: {
            authorized: 'ビジネス銀行口座を操作するには、権限を持つ管理責任者でなければなりません。',
            certify: '情報が真実で正確であることを証明してください。',
            consent: 'プライバシー通知に同意してください',
        },
    },
    finishStep: {
        connect: '銀行口座を接続',
        letsFinish: 'チャットで終わらせましょう！',
        thanksFor: 'これらの詳細をありがとうございます。専任のサポートエージェントがあなたの情報を確認します。追加で必要な情報がある場合はご連絡しますが、その間に質問があればお気軽にお問い合わせください。',
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
            subtitle: 'Expensify Travelに同意してください',
            termsAndConditions: '利用規約',
            travelTermsAndConditions: '利用規約',
            agree: '同意する',
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります。',
            defaultWorkspaceError: 'Expensify Travelを有効にするには、デフォルトのワークスペースを設定する必要があります。設定 > ワークスペース > ワークスペースの横にある縦の3つのドットをクリック > デフォルトのワークスペースとして設定し、もう一度お試しください！',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '乗客',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>\u3053\u306E\u30D5\u30E9\u30A4\u30C8\u306E\u524D\u306B<strong>".concat(layover, "\u306E\u4E57\u308A\u7D99\u304E</strong>\u304C\u3042\u308A\u307E\u3059</muted-text-label>");
            },
            takeOff: '離陸',
            landing: 'ランディング',
            seat: '席',
            class: 'キャビンクラス',
            recordLocator: 'レコードロケーター',
            cabinClasses: {
                unknown: 'Unknown',
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
                unknown: 'Unknown',
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
        phoneError: {
            phrase1: 'お願いします',
            link: '勤務用メールアドレスをプライマリログインとして追加してください。',
            phrase2: '旅行を予約するために。',
        },
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travelのセットアップ用にドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restrictionPrefix: "\u3053\u306E\u30C9\u30E1\u30A4\u30F3\u306B\u5BFE\u3057\u3066Expensify Travel\u3092\u6709\u52B9\u306B\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
            restrictionSuffix: "\u305D\u306E\u30C9\u30E1\u30A4\u30F3\u306E\u62C5\u5F53\u8005\u306B\u3001\u4EE3\u308F\u308A\u306B\u30C8\u30E9\u30D9\u30EB\u3092\u6709\u52B9\u306B\u3059\u308B\u3088\u3046\u4F9D\u983C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
            accountantInvitationPrefix: "\u4F1A\u8A08\u58EB\u306E\u65B9\u306F\u3001\u305C\u3072\u3053\u3061\u3089\u306B\u53C2\u52A0\u3057\u3066\u304F\u3060\u3055\u3044",
            accountantInvitationLink: "ExpensifyApproved! accountants program",
            accountantInvitationSuffix: "\u3053\u306E\u30C9\u30E1\u30A4\u30F3\u3067\u65C5\u884C\u3092\u6709\u52B9\u306B\u3059\u308B\u305F\u3081\u306B\u3002",
        },
        publicDomainError: {
            title: 'Expensify Travelを始めましょう',
            message: "Expensify Travel\u3067\u306F\u3001\u500B\u4EBA\u306E\u30E1\u30FC\u30EB\uFF08\u4F8B: name@gmail.com\uFF09\u3067\u306F\u306A\u304F\u3001\u52E4\u52D9\u5148\u306E\u30E1\u30FC\u30EB\uFF08\u4F8B: name@company.com\uFF09\u3092\u4F7F\u7528\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
        },
        blockedFeatureModal: {
            title: 'Expensify Travelは無効になっています',
            message: "\u7BA1\u7406\u8005\u304CExpensify Travel\u3092\u30AA\u30D5\u306B\u3057\u307E\u3057\u305F\u3002\u65C5\u884C\u306E\u624B\u914D\u306B\u3064\u3044\u3066\u306F\u3001\u4F1A\u793E\u306E\u4E88\u7D04\u30DD\u30EA\u30B7\u30FC\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
        },
        verifyCompany: {
            title: '今日から旅行を始めましょう！',
            message: "\u65C5\u884C\u306E\u30C7\u30E2\u3092\u53D6\u5F97\u3057\u3001\u5FA1\u793E\u5411\u3051\u306B\u6709\u52B9\u5316\u3059\u308B\u306B\u306F\u3001\u30A2\u30AB\u30A6\u30F3\u30C8\u30DE\u30CD\u30FC\u30B8\u30E3\u30FC\u307E\u305F\u306Fsalesteam@expensify.com\u306B\u3054\u9023\u7D61\u304F\u3060\u3055\u3044\u3002",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "\u3042\u306A\u305F\u306E\u30D5\u30E9\u30A4\u30C8 ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") \u306F ").concat(startDate, " \u306B\u4E88\u7D04\u3055\u308C\u307E\u3057\u305F\u3002\u78BA\u8A8D\u30B3\u30FC\u30C9: ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "".concat(startDate, "\u306E").concat(airlineCode, "\u4FBF\uFF08").concat(origin, " \u2192 ").concat(destination, "\uFF09\u306E\u822A\u7A7A\u5238\u306F\u7121\u52B9\u306B\u306A\u308A\u307E\u3057\u305F\u3002");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "".concat(startDate, "\u306E").concat(airlineCode, "\u4FBF\uFF08").concat(origin, " \u2192 ").concat(destination, "\uFF09\u306E\u30C1\u30B1\u30C3\u30C8\u306F\u6255\u3044\u623B\u3057\u307E\u305F\u306F\u4EA4\u63DB\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "\u3042\u306A\u305F\u306E\u30D5\u30E9\u30A4\u30C8 ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") \u306F ").concat(startDate, " \u306B\u822A\u7A7A\u4F1A\u793E\u306B\u3088\u3063\u3066\u30AD\u30E3\u30F3\u30BB\u30EB\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "\u822A\u7A7A\u4F1A\u793E\u306F\u30D5\u30E9\u30A4\u30C8".concat(airlineCode, "\u306E\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u5909\u66F4\u3092\u63D0\u6848\u3057\u307E\u3057\u305F\u3002\u78BA\u8A8D\u3092\u5F85\u3063\u3066\u3044\u307E\u3059\u3002");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u5909\u66F4\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3057\u305F: \u30D5\u30E9\u30A4\u30C8 ".concat(airlineCode, " \u306F ").concat(startDate, " \u306B\u51FA\u767A\u3057\u307E\u3059\u3002");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "\u3042\u306A\u305F\u306E\u30D5\u30E9\u30A4\u30C8 ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") \u304C ").concat(startDate, " \u306B\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "\u30D5\u30E9\u30A4\u30C8".concat(airlineCode, "\u306E\u30AD\u30E3\u30D3\u30F3\u30AF\u30E9\u30B9\u304C").concat(cabinClass, "\u306B\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "\u30D5\u30E9\u30A4\u30C8".concat(airlineCode, "\u306E\u5EA7\u5E2D\u6307\u5B9A\u304C\u78BA\u8A8D\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "\u30D5\u30E9\u30A4\u30C8".concat(airlineCode, "\u306E\u5EA7\u5E2D\u6307\u5B9A\u304C\u5909\u66F4\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "\u30D5\u30E9\u30A4\u30C8".concat(airlineCode, "\u306E\u5EA7\u5E2D\u6307\u5B9A\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "\u3042\u306A\u305F\u306F".concat(id, "\u306E").concat(type, "\u4E88\u7D04\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F\u3002");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "\u30D9\u30F3\u30C0\u30FC\u304C\u3042\u306A\u305F\u306E".concat(type, "\u4E88\u7D04").concat(id, "\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F\u3002");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "\u3042\u306A\u305F\u306E".concat(type, "\u4E88\u7D04\u304C\u518D\u4E88\u7D04\u3055\u308C\u307E\u3057\u305F\u3002\u65B0\u3057\u3044\u78BA\u8A8D\u756A\u53F7\uFF1A").concat(id, "\u3002");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "\u3042\u306A\u305F\u306E".concat(type, "\u306E\u4E88\u7D04\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002\u65C5\u7A0B\u3067\u65B0\u3057\u3044\u8A73\u7D30\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "".concat(startDate, "\u306E").concat(origin, " \u2192 ").concat(destination, "\u306E\u9244\u9053\u30C1\u30B1\u30C3\u30C8\u304C\u6255\u3044\u623B\u3055\u308C\u307E\u3057\u305F\u3002\u30AF\u30EC\u30B8\u30C3\u30C8\u304C\u51E6\u7406\u3055\u308C\u307E\u3059\u3002");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "".concat(startDate, "\u306E").concat(origin, " \u2192 ").concat(destination, "\u306E\u9244\u9053\u30C1\u30B1\u30C3\u30C8\u304C\u4EA4\u63DB\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "".concat(origin, " \u2192 ").concat(destination, " \u306E ").concat(startDate, " \u306E\u9244\u9053\u30C1\u30B1\u30C3\u30C8\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "\u3042\u306A\u305F\u306E".concat(type, "\u4E88\u7D04\u304C\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002");
            },
        },
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
            reportFields: 'レポートフィールド',
            reportTitle: 'レポートタイトル',
            reportField: 'レポートフィールド',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            travel: '旅行',
            members: 'メンバー',
            accounting: '会計',
            rules: 'ルール',
            displayedAs: '表示される内容',
            plan: '計画',
            profile: '概要',
            bankAccount: '銀行口座',
            connectBankAccount: '銀行口座を接続',
            testTransactions: 'トランザクションをテストする',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードを照合する',
            selected: function () { return ({
                one: '1 件選択済み',
                other: function (count) { return "".concat(count, " \u4EF6\u9078\u629E\u6E08\u307F"); },
            }); },
            settlementFrequency: '決済頻度',
            setAsDefault: 'デフォルトのワークスペースに設定',
            defaultNote: "".concat(CONST_1.default.EMAIL.RECEIPTS, " \u306B\u9001\u4FE1\u3055\u308C\u305F\u9818\u53CE\u66F8\u306F\u3001\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002"),
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？これにより、すべてのカードフィードと割り当てられたカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。新しいメンバーをワークスペースに招待するには、上の招待ボタンを使用してください。',
            notAuthorized: "\u3053\u306E\u30DA\u30FC\u30B8\u306B\u30A2\u30AF\u30BB\u30B9\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u53C2\u52A0\u3057\u3088\u3046\u3068\u3057\u3066\u3044\u308B\u5834\u5408\u306F\u3001\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30AA\u30FC\u30CA\u30FC\u306B\u30E1\u30F3\u30D0\u30FC\u3068\u3057\u3066\u8FFD\u52A0\u3057\u3066\u3082\u3089\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u4ED6\u306B\u4F55\u304B\u304A\u56F0\u308A\u3067\u3059\u304B\uFF1F".concat(CONST_1.default.EMAIL.CONCIERGE, "\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002"),
            goToWorkspace: 'ワークスペースに移動',
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
            markAsExported: '手動でエクスポート済みとしてマーク',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8");
            },
            letsDoubleCheck: 'すべてが正しいかどうかをもう一度確認しましょう。',
            lineItemLevel: 'ラインアイテムレベル',
            reportLevel: 'レポートレベル',
            topLevel: 'トップレベル',
            appliedOnExport: 'Expensifyにインポートされず、エクスポート時に適用されます。',
            shareNote: {
                header: '他のメンバーとワークスペースを共有する',
                content: {
                    firstPart: 'このQRコードを共有するか、以下のリンクをコピーして、メンバーがワークスペースへのアクセスをリクエストしやすくしてください。ワークスペースへの参加リクエストはすべて、',
                    secondPart: 'レビューのためのスペース。',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], "\u306B\u63A5\u7D9A");
            },
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用する',
            existingConnections: '既存の接続',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "\u4EE5\u524D\u306B".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], "\u306B\u63A5\u7D9A\u3057\u305F\u3053\u3068\u304C\u3042\u308B\u306E\u3067\u3001\u65E2\u5B58\u306E\u63A5\u7D9A\u3092\u518D\u5229\u7528\u3059\u308B\u304B\u3001\u65B0\u3057\u3044\u63A5\u7D9A\u3092\u4F5C\u6210\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - \u6700\u7D42\u540C\u671F\u65E5 ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "\u8A8D\u8A3C\u30A8\u30E9\u30FC\u306E\u305F\u3081\u3001".concat(connectionName, " \u306B\u63A5\u7D9A\u3067\u304D\u307E\u305B\u3093");
            },
            learnMore: '詳しくはこちら。',
            memberAlternateText: 'メンバーはレポートを提出および承認できます。',
            adminAlternateText: '管理者は、すべてのレポートとワークスペース設定に対して完全な編集アクセス権を持っています。',
            auditorAlternateText: '監査人はレポートを閲覧し、コメントを残すことができます。',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return '管理者';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return '監査人';
                    case CONST_1.default.POLICY.ROLE.USER:
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
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "".concat(displayName, "\u306E\u7D4C\u8CBB");
            },
        },
        perDiem: {
            subtitle: '日当料金を設定して、従業員の1日の支出を管理します。',
            amount: '金額',
            deleteRates: function () { return ({
                one: 'レートを削除',
                other: 'レートを削除',
            }); },
            deletePerDiemRate: '日当料金を削除',
            findPerDiemRate: '日当料金を見つける',
            areYouSureDelete: function () { return ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }); },
            emptyList: {
                title: '日当',
                subtitle: '日当の設定を行い、従業員の1日の支出を管理します。スプレッドシートからレートをインポートして始めましょう。',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "\u5024\u304C".concat(rate, "\u306E\u30EC\u30FC\u30C8\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059");
                },
            },
            importPerDiemRates: '日当料金をインポート',
            editPerDiemRate: '日当料金を編集',
            editPerDiemRates: '日当のレートを編集',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "\u3053\u306E\u5B9B\u5148\u3092\u66F4\u65B0\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E".concat(destination, "\u306E\u65E5\u5F53\u30B5\u30D6\u30EC\u30FC\u30C8\u304C\u5909\u66F4\u3055\u308C\u307E\u3059\u3002");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "\u3053\u306E\u901A\u8CA8\u3092\u66F4\u65B0\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E".concat(destination, "\u306E\u65E5\u5F53\u30B5\u30D6\u30EC\u30FC\u30C8\u304C\u5909\u66F4\u3055\u308C\u307E\u3059\u3002");
            },
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
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'エクスポート日付',
                        description: 'レポートがQuickBooks Desktopにエクスポートされた日付。',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                    _e),
            },
            exportCheckDescription: '各Expensifyレポートに対して項目別の小切手を作成し、以下の銀行口座から送信します。',
            exportJournalEntryDescription: '各Expensifyレポートに対して項目別の仕訳を作成し、以下のアカウントに投稿します。',
            exportVendorBillDescription: '私たちは、各Expensifyレポートのために項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
            deepDiveExpensifyCard: 'Expensifyカードの取引は、作成された「Expensifyカード負債勘定」に自動的にエクスポートされます。',
            deepDiveExpensifyCardIntegration: '私たちの統合。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktopは、仕訳帳エクスポートで税金をサポートしていません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'クレジットカード',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = '仕入先請求書',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = '仕訳帳エントリ',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'チェック',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = '各Expensifyレポートに対して項目別の小切手を作成し、以下の銀行口座から送信します。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = 'クレジットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」ベンダーを作成します。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = '私たちは、各Expensifyレポートに対して最後の経費の日付を含む項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'クレジットカード取引のエクスポート先を選択してください。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = '小切手の送付先を選択してください。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = '場所が有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = '場所が有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
                _f),
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
                setupErrorBody1: 'QuickBooks Desktopの接続が現在機能していません。後でもう一度お試しください、または',
                setupErrorBody2: '問題が解決しない場合。',
                setupErrorBodyContactConcierge: 'Conciergeに連絡する',
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
            locationsLineItemsRestrictionDescription: 'QuickBooks Onlineは、小切手や仕入先請求書の行レベルでの場所をサポートしていません。行レベルで場所を持ちたい場合は、仕訳帳エントリとクレジット/デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Onlineは仕訳帳の税金をサポートしていません。エクスポートオプションを仕入先請求書または小切手に変更してください。',
            exportDescription: 'ExpensifyデータをQuickBooks Onlineにエクスポートする方法を設定します。',
            date: 'エクスポート日付',
            exportInvoices: '請求書をエクスポート',
            exportExpensifyCard: 'Expensifyカードの取引をエクスポートする',
            deepDiveExpensifyCard: 'Expensifyカードの取引は、作成された「Expensifyカード負債勘定」に自動的にエクスポートされます。',
            deepDiveExpensifyCardIntegration: '私たちの統合。',
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをQuickBooks Onlineにエクスポートしてください。',
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'エクスポート日付',
                        description: 'レポートがQuickBooks Onlineにエクスポートされた日付。',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                    _g),
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
            exportVendorBillDescription: '私たちは、各Expensifyレポートのために項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
            account: 'アカウント',
            accountDescription: '仕訳を投稿する場所を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付先を選択してください。',
            creditCardAccount: 'クレジットカードアカウント',
            companyCardsLocationEnabledDescription: 'QuickBooks Onlineは、仕入先請求書のエクスポートでロケーションをサポートしていません。ワークスペースでロケーションが有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription: 'QuickBooks Onlineは仕訳帳エクスポートで税金をサポートしていません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
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
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'デビットカード',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'クレジットカード',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = '仕入先請求書',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = '仕訳帳エントリ',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'チェック',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = '私たちは、デビットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Debit Card Misc.」ベンダーを作成します。',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = 'クレジットカード取引の加盟店名をQuickBooksの対応するベンダーに自動的に一致させます。ベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」ベンダーを作成します。',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = '私たちは、各Expensifyレポートに対して最後の経費の日付を含む項目別のベンダー請求書を作成し、以下のアカウントに追加します。この期間が閉じている場合、次の開いている期間の1日に投稿します。',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'デビットカード取引のエクスポート先を選択してください。',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'クレジットカード取引のエクスポート先を選択してください。',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'すべてのクレジットカード取引に適用するベンダーを選択してください。',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = '場所が有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = '場所が有効になっている場合、小切手は利用できません。別のエクスポートオプションを選択してください。',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = '税金が有効になっている場合、仕訳帳は利用できません。別のエクスポートオプションを選択してください。',
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'ベンダー請求書のエクスポートに有効なアカウントを選択してください。',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = '仕訳エクスポートのために有効なアカウントを選択してください',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = '小切手のエクスポート用に有効なアカウントを選択してください',
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'ベンダー請求書エクスポートを使用するには、QuickBooks Onlineで買掛金勘定を設定してください。',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = '仕訳エクスポートを使用するには、QuickBooks Onlineで仕訳アカウントを設定してください。',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'チェックエクスポートを使用するには、QuickBooks Onlineで銀行口座を設定してください。',
                _k),
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Onlineにアカウントを追加し、接続を再同期してください。',
            accountingMethods: {
                label: 'エクスポートのタイミング',
                description: '経費をエクスポートするタイミングを選択:',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = '発生主義',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = '現金',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = '自己負担の経費は最終承認時にエクスポートされます。',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = '自己負担の経費は支払われたときにエクスポートされます。',
                    _m),
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
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Xero ".concat(categoryName, " \u3092\u30DE\u30C3\u30D4\u30F3\u30B0\u3059\u308B");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "Xero\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3059\u308B\u969B\u306B".concat(categoryName, "\u3092\u3069\u3053\u306B\u30DE\u30C3\u30D4\u30F3\u30B0\u3059\u308B\u304B\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
            },
            customers: '顧客への再請求',
            customersDescription: 'Expensifyで顧客に再請求するかどうかを選択します。Xeroの顧客連絡先は経費にタグ付けでき、Xeroに売上請求書としてエクスポートされます。',
            taxesDescription: 'ExpensifyでXeroの税金をどのように処理するか選択してください。',
            notImported: 'インポートされていません',
            notConfigured: '未設定',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Xero連絡先のデフォルト',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'タグ',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'レポートフィールド',
                _o),
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
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'エクスポート日付',
                        description: 'レポートがXeroにエクスポートされた日付。',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                    _p),
            },
            invoiceStatus: {
                label: '購入請求書のステータス',
                description: 'このステータスを使用して、購入請求書をXeroにエクスポートします。',
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = '下書き',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = '承認待ち',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = '支払い待ち',
                    _q),
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xeroにアカウントを追加し、再度接続を同期してください。',
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをSage Intacctにエクスポートしてください。',
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: 'エクスポート日付',
                        description: 'レポートがSage Intacctにエクスポートされた日付。',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: '実費経費がSage Intacctにエクスポートされる方法を設定します。',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = '経費報告書',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = '仕入先請求書',
                    _s),
            },
            nonReimbursableExpenses: {
                description: '会社カードの購入がSage Intacctにエクスポートされる方法を設定します。',
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'クレジットカード',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = '仕入先請求書',
                    _t),
            },
            creditCardAccount: 'クレジットカードアカウント',
            defaultVendor: 'デフォルトのベンダー',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "Sage Intacct\u3067\u4E00\u81F4\u3059\u308B\u30D9\u30F3\u30C0\u30FC\u304C\u306A\u3044".concat(isReimbursable ? '' : 'non-', "\u306E\u6255\u3044\u623B\u3057\u53EF\u80FD\u306A\u7D4C\u8CBB\u306B\u9069\u7528\u3055\u308C\u308B\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u30D9\u30F3\u30C0\u30FC\u3092\u8A2D\u5B9A\u3057\u307E\u3059\u3002");
            },
            exportDescription: 'ExpensifyデータをSage Intacctにエクスポートする方法を設定します。',
            exportPreferredExporterNote: '優先されるエクスポーターは任意のワークスペース管理者で構いませんが、ドメイン設定で個々の会社カードに異なるエクスポートアカウントを設定する場合は、ドメイン管理者である必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントでエクスポート用のレポートを確認できます。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: "Sage Intacct\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0\u3057\u3001\u518D\u5EA6\u63A5\u7D9A\u3092\u540C\u671F\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
            autoSync: '自動同期',
            autoSyncDescription: 'Expensifyは毎日自動的にSage Intacctと同期します。',
            inviteEmployees: '従業員を招待する',
            inviteEmployeesDescription: 'Sage Intacctの従業員記録をインポートし、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認となり、メンバーのページでさらに設定できます。',
            syncReimbursedReports: '払い戻されたレポートを同期する',
            syncReimbursedReportsDescription: 'Expensify ACHを使用してレポートが支払われるたびに、対応する請求書の支払いが以下のSage Intacctアカウントに作成されます。',
            paymentAccount: 'Sage Intacct支払いアカウント',
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
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = '各レポートの単一の項目別エントリ',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = '各経費の単一エントリ',
                    _u),
            },
            invoiceItem: {
                label: '請求書項目',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: '作成してください。',
                        description: 'エクスポート時に（既に存在しない場合は）「Expensify請求書の項目」を作成します。',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: '既存のものを選択',
                        description: 'Expensifyの請求書を以下で選択された項目に結びつけます。',
                    },
                    _v),
            },
            exportDate: {
                label: 'エクスポート日付',
                description: 'この日付を使用してレポートをNetSuiteにエクスポートしてください。',
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: '最後の経費の日付',
                        description: 'レポート上の最新経費の日付。',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: 'エクスポート日付',
                        description: 'レポートがNetSuiteにエクスポートされた日付。',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: '経費報告書',
                        reimbursableDescription: '実費は、経費報告書としてNetSuiteにエクスポートされます。',
                        nonReimbursableDescription: '会社のカード経費は、経費報告書としてNetSuiteにエクスポートされます。',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: '仕入先請求書',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: '仕訳帳エントリ',
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
                autoSyncDescription: 'Expensifyは毎日自動的にNetSuiteと同期します。',
                reimbursedReportsDescription: 'レポートがExpensify ACHを使用して支払われるたびに、対応する請求書支払いが以下のNetSuiteアカウントに作成されます。',
                reimbursementsAccount: '払い戻し口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、関連する支払いがNetSuiteで作成されます。',
                collectionsAccount: 'コレクションアカウント',
                collectionsAccountDescription: '請求書がExpensifyで支払済みとしてマークされ、NetSuiteにエクスポートされると、以下のアカウントに表示されます。',
                approvalAccount: 'A/P承認アカウント',
                approvalAccountDescription: 'NetSuiteで取引が承認されるアカウントを選択してください。払い戻されたレポートを同期している場合、これは請求書の支払いが作成されるアカウントでもあります。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定する',
                inviteEmployeesDescription: 'NetSuiteの従業員記録をインポートし、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認になり、*メンバー* ページでさらに設定できます。',
                autoCreateEntities: '従業員/ベンダーを自動作成',
                enableCategories: '新しくインポートされたカテゴリーを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription: 'デフォルトでは、Expensify は NetSuite で設定された優先トランザクションフォームを使用してエントリを作成します。あるいは、特定のトランザクションフォームを指定して使用することもできます。',
                customFormIDReimbursable: '自己負担経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費報告承認レベル',
                    description: 'Expensifyで経費報告書が承認され、NetSuiteにエクスポートされた後、NetSuiteで投稿する前に追加の承認レベルを設定できます。',
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'NetSuiteのデフォルト設定',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'スーパーバイザー承認のみ',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = '会計のみ承認済み',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = '監督者と会計が承認しました',
                        _y),
                },
                accountingMethods: {
                    label: 'エクスポートのタイミング',
                    description: '経費をエクスポートするタイミングを選択:',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = '発生主義',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = '現金',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = '自己負担の経費は最終承認時にエクスポートされます。',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = '自己負担の経費は支払われたときにエクスポートされます。',
                        _0),
                },
                exportVendorBillsTo: {
                    label: 'ベンダー請求書承認レベル',
                    description: 'ベンダーの請求書がExpensifyで承認され、NetSuiteにエクスポートされると、NetSuiteで投稿する前に追加の承認レベルを設定できます。',
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'NetSuiteのデフォルト設定',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = '承認待ち',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = '投稿が承認されました',
                        _1),
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensifyで仕訳が承認され、NetSuiteにエクスポートされた後、NetSuiteで仕訳を記帳する前に追加の承認レベルを設定できます。',
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'NetSuiteのデフォルト設定',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = '承認待ち',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = '投稿が承認されました',
                        _2),
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
                        description: 'NetSuiteで、*Setup > Users/Roles > Access Tokens* に移動し、「Expensify」アプリおよび「Expensify Integration」または「Administrator」ロールのアクセストークンを作成します。\n\n*重要:* このステップで *Token ID* と *Token Secret* を必ず保存してください。次のステップで必要になります。',
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
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('と'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'NetSuiteから税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下のオプションから選択してください:',
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Imported as ".concat(importedTypes.join('と'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "".concat(fieldName, "\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044");
                    },
                    customSegments: {
                        title: 'カスタムセグメント/レコード',
                        addText: 'カスタムセグメント/レコードを追加',
                        recordTitle: 'カスタムセグメント/レコード',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
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
                            customSegmentNameFooter: "NetSuite\u306E*\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA > \u30EA\u30F3\u30AF\u3001\u30EC\u30B3\u30FC\u30C9\u3001\u30D5\u30A3\u30FC\u30EB\u30C9 > \u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8*\u30DA\u30FC\u30B8\u3067\u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u540D\u3092\u898B\u3064\u3051\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8\u3092\u3054\u89A7\u304F\u3060\u3055\u3044](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")\u3002_"),
                            customRecordNameFooter: "NetSuite\u3067\u30AB\u30B9\u30BF\u30E0\u30EC\u30B3\u30FC\u30C9\u540D\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u30B0\u30ED\u30FC\u30D0\u30EB\u691C\u7D22\u3067\u300CTransaction Column Field\u300D\u3092\u5165\u529B\u3057\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8\u3092\u3054\u89A7\u304F\u3060\u3055\u3044](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")\u3002_"),
                            customSegmentInternalIDTitle: '内部IDは何ですか？',
                            customSegmentInternalIDFooter: "\u307E\u305A\u3001NetSuite\u3067\u5185\u90E8ID\u3092\u6709\u52B9\u306B\u3059\u308B\u306B\u306F\u3001*Home > Set Preferences > Show Internal ID*\u306B\u79FB\u52D5\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\nNetSuite\u3067\u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u306E\u5185\u90E8ID\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u4EE5\u4E0B\u306E\u624B\u9806\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\uFF1A\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*\u306B\u79FB\u52D5\u3057\u307E\u3059\u3002\n2. \u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n3. *Custom Record Type*\u306E\u96A3\u306B\u3042\u308B\u30CF\u30A4\u30D1\u30FC\u30EA\u30F3\u30AF\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n4. \u4E0B\u90E8\u306E\u30C6\u30FC\u30D6\u30EB\u3067\u5185\u90E8ID\u3092\u898B\u3064\u3051\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u3053\u3061\u3089\u306E\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002_"),
                            customRecordInternalIDFooter: "NetSuite\u3067\u30AB\u30B9\u30BF\u30E0\u30EC\u30B3\u30FC\u30C9\u306E\u5185\u90E8ID\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u6B21\u306E\u624B\u9806\u306B\u5F93\u3044\u307E\u3059\uFF1A\n\n1. \u30B0\u30ED\u30FC\u30D0\u30EB\u691C\u7D22\u306B\u300CTransaction Line Fields\u300D\u3068\u5165\u529B\u3057\u307E\u3059\u3002\n2. \u30AB\u30B9\u30BF\u30E0\u30EC\u30B3\u30FC\u30C9\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n3. \u5DE6\u5074\u306B\u5185\u90E8ID\u3092\u898B\u3064\u3051\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002_"),
                            customSegmentScriptIDTitle: 'スクリプトIDは何ですか？',
                            customSegmentScriptIDFooter: "NetSuite\u3067\u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u30B9\u30AF\u30EA\u30D7\u30C8ID\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u6B21\u306E\u624B\u9806\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\uFF1A\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*\u3092\u9078\u629E\u3057\u307E\u3059\u3002\n2. \u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n3. \u753B\u9762\u4E0B\u90E8\u8FD1\u304F\u306E*Application and Sourcing*\u30BF\u30D6\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3001\u6B21\u306E\u3044\u305A\u308C\u304B\u3092\u9078\u629E\u3057\u307E\u3059\uFF1A\n    a. \u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u3092Expensify\u3067*\u30BF\u30B0*\uFF08\u30E9\u30A4\u30F3\u30A2\u30A4\u30C6\u30E0\u30EC\u30D9\u30EB\uFF09\u3068\u3057\u3066\u8868\u793A\u3057\u305F\u3044\u5834\u5408\u306F\u3001*Transaction Columns*\u30B5\u30D6\u30BF\u30D6\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3001*Field ID*\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002\n    b. \u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u3092Expensify\u3067*\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9*\uFF08\u30EC\u30DD\u30FC\u30C8\u30EC\u30D9\u30EB\uFF09\u3068\u3057\u3066\u8868\u793A\u3057\u305F\u3044\u5834\u5408\u306F\u3001*Transactions*\u30B5\u30D6\u30BF\u30D6\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3001*Field ID*\u3092\u4F7F\u7528\u3057\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u3053\u3061\u3089\u306E\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002_"),
                            customRecordScriptIDTitle: 'トランザクション列IDは何ですか？',
                            customRecordScriptIDFooter: "NetSuite\u3067\u30AB\u30B9\u30BF\u30E0\u30EC\u30B3\u30FC\u30C9\u30B9\u30AF\u30EA\u30D7\u30C8ID\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u6B21\u306E\u624B\u9806\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\uFF1A\n\n1. \u30B0\u30ED\u30FC\u30D0\u30EB\u691C\u7D22\u3067\u300CTransaction Line Fields\u300D\u3068\u5165\u529B\u3057\u307E\u3059\u3002\n2. \u30AB\u30B9\u30BF\u30E0\u30EC\u30B3\u30FC\u30C9\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n3. \u5DE6\u5074\u306B\u30B9\u30AF\u30EA\u30D7\u30C8ID\u3092\u898B\u3064\u3051\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002_"),
                            customSegmentMappingTitle: 'このカスタムセグメントはExpensifyでどのように表示されるべきですか？',
                            customRecordMappingTitle: 'このカスタムレコードはExpensifyでどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "\u3053\u306E".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), "\u3092\u6301\u3064\u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8/\u30EC\u30B3\u30FC\u30C9\u306F\u3059\u3067\u306B\u5B58\u5728\u3057\u307E\u3059");
                            },
                        },
                    },
                    customLists: {
                        title: 'カスタムリスト',
                        addText: 'カスタムリストを追加',
                        recordTitle: 'カスタムリスト',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
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
                            transactionFieldIDFooter: "NetSuite\u3067\u30C8\u30E9\u30F3\u30B6\u30AF\u30B7\u30E7\u30F3\u30D5\u30A3\u30FC\u30EB\u30C9ID\u3092\u898B\u3064\u3051\u308B\u306B\u306F\u3001\u6B21\u306E\u624B\u9806\u306B\u5F93\u3063\u3066\u304F\u3060\u3055\u3044\uFF1A\n\n1. \u30B0\u30ED\u30FC\u30D0\u30EB\u691C\u7D22\u3067\u300CTransaction Line Fields\u300D\u3068\u5165\u529B\u3057\u307E\u3059\u3002\n2. \u30AB\u30B9\u30BF\u30E0\u30EA\u30B9\u30C8\u306B\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n3. \u5DE6\u5074\u306B\u30C8\u30E9\u30F3\u30B6\u30AF\u30B7\u30E7\u30F3\u30D5\u30A3\u30FC\u30EB\u30C9ID\u3092\u898B\u3064\u3051\u307E\u3059\u3002\n\n_\u8A73\u7D30\u306A\u624B\u9806\u306B\u3064\u3044\u3066\u306F\u3001[\u30D8\u30EB\u30D7\u30B5\u30A4\u30C8](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002_"),
                            mappingTitle: 'このカスタムリストはExpensifyでどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "\u3053\u306E\u53D6\u5F15\u30D5\u30A3\u30FC\u30EB\u30C9ID\u3092\u6301\u3064\u30AB\u30B9\u30BF\u30E0\u30EA\u30B9\u30C8\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'NetSuiteの従業員デフォルト',
                        description: 'Expensifyにインポートされず、エクスポート時に適用されます。',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "NetSuite\u3067".concat(importField, "\u3092\u4F7F\u7528\u3059\u308B\u5834\u5408\u3001Expense Report\u307E\u305F\u306FJournal Entry\u3078\u306E\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u6642\u306B\u5F93\u696D\u54E1\u8A18\u9332\u306B\u8A2D\u5B9A\u3055\u308C\u305F\u30C7\u30D5\u30A9\u30EB\u30C8\u3092\u9069\u7528\u3057\u307E\u3059\u3002");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'タグ',
                        description: 'ラインアイテムレベル',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " \u306F\u3001\u5F93\u696D\u54E1\u306E\u30EC\u30DD\u30FC\u30C8\u306E\u5404\u7D4C\u8CBB\u306B\u5BFE\u3057\u3066\u9078\u629E\u53EF\u80FD\u306B\u306A\u308A\u307E\u3059\u3002");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'レポートフィールド',
                        description: 'レポートレベル',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " \u306E\u9078\u629E\u306F\u3001\u5F93\u696D\u54E1\u306E\u30EC\u30DD\u30FC\u30C8\u4E0A\u306E\u3059\u3079\u3066\u306E\u7D4C\u8CBB\u306B\u9069\u7528\u3055\u308C\u307E\u3059\u3002");
                        },
                    },
                    _3),
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
            toggleImportTitleFirstPart: 'Sage Intacctの処理方法を選択',
            toggleImportTitleSecondPart: 'in Expensify.',
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
            userDimensionsAdded: function () { return ({
                one: '1 UDDが追加されました',
                other: function (count) { return "".concat(count, " UDDs\u304C\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部門';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'ロケーション';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '顧客';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
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
                yourCardProvider: "\u3042\u306A\u305F\u306E\u30AB\u30FC\u30C9\u30D7\u30ED\u30D0\u30A4\u30C0\u30FC\u306F\u8AB0\u3067\u3059\u304B\uFF1F",
                whoIsYourBankAccount: 'あなたの銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: 'どのように銀行に接続したいですか？',
                learnMoreAboutOptions: {
                    text: 'これらについて詳しく学ぶ',
                    linkText: 'オプション。',
                },
                commercialFeedDetails: '銀行との設定が必要です。これは通常、大企業によって使用され、資格がある場合には最良のオプションであることが多いです。',
                commercialFeedPlaidDetails: "\u9280\u884C\u3068\u306E\u8A2D\u5B9A\u304C\u5FC5\u8981\u3067\u3059\u304C\u3001\u79C1\u305F\u3061\u304C\u6848\u5185\u3057\u307E\u3059\u3002\u3053\u308C\u306F\u901A\u5E38\u3001\u5927\u4F01\u696D\u306B\u9650\u5B9A\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
                directFeedDetails: '最も簡単な方法です。マスター資格情報を使用してすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "".concat(provider, "\u30D5\u30A3\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3059\u308B");
                    },
                    heading: '私たちはあなたのカード発行会社と直接統合しており、取引データをExpensifyに迅速かつ正確にインポートできます。\n\n始めるには、次の手順に従ってください:',
                    visa: '私たちはVisaとグローバルな統合をしていますが、適格性は銀行やカードプログラムによって異なります。\n\n始めるには、次のことを行ってください:',
                    mastercard: '私たちはMastercardとのグローバルな統合を持っていますが、適格性は銀行やカードプログラムによって異なります。\n\n始めるには、次の手順に従ってください。',
                    vcf: "1. Visa Commercial Cards\u306E\u8A2D\u5B9A\u65B9\u6CD5\u306B\u3064\u3044\u3066\u306E\u8A73\u7D30\u306A\u624B\u9806\u306F\u3001[\u3053\u3061\u3089\u306E\u30D8\u30EB\u30D7\u8A18\u4E8B](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002\n\n2. \u3042\u306A\u305F\u306E\u30D7\u30ED\u30B0\u30E9\u30E0\u306B\u5546\u696D\u30D5\u30A3\u30FC\u30C9\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u308B\u304B\u3092\u78BA\u8A8D\u3059\u308B\u305F\u3081\u306B\u3001[\u9280\u884C\u306B\u9023\u7D61](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ")\u3057\u3001\u30D5\u30A3\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3059\u308B\u3088\u3046\u4F9D\u983C\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n3. *\u30D5\u30A3\u30FC\u30C9\u304C\u6709\u52B9\u306B\u306A\u308A\u3001\u305D\u306E\u8A73\u7D30\u3092\u53D6\u5F97\u3057\u305F\u3089\u3001\u6B21\u306E\u753B\u9762\u306B\u9032\u3093\u3067\u304F\u3060\u3055\u3044\u3002*"),
                    gl1025: "1. American Express\u304C\u3042\u306A\u305F\u306E\u30D7\u30ED\u30B0\u30E9\u30E0\u306B\u5546\u696D\u30D5\u30A3\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3067\u304D\u308B\u304B\u3069\u3046\u304B\u3092\u78BA\u8A8D\u3059\u308B\u306B\u306F\u3001[\u3053\u306E\u30D8\u30EB\u30D7\u8A18\u4E8B](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, ")\u3092\u8A2A\u554F\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n2. \u30D5\u30A3\u30FC\u30C9\u304C\u6709\u52B9\u306B\u306A\u308B\u3068\u3001Amex\u306F\u3042\u306A\u305F\u306B\u30D7\u30ED\u30C0\u30AF\u30B7\u30E7\u30F3\u30EC\u30BF\u30FC\u3092\u9001\u308A\u307E\u3059\u3002\n\n3. *\u30D5\u30A3\u30FC\u30C9\u60C5\u5831\u3092\u53D6\u5F97\u3057\u305F\u3089\u3001\u6B21\u306E\u753B\u9762\u306B\u9032\u3093\u3067\u304F\u3060\u3055\u3044\u3002*"),
                    cdf: "1. Mastercard Commercial Cards\u306E\u8A2D\u5B9A\u65B9\u6CD5\u306B\u3064\u3044\u3066\u306E\u8A73\u7D30\u306A\u624B\u9806\u306F\u3001[\u3053\u3061\u3089\u306E\u30D8\u30EB\u30D7\u8A18\u4E8B](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ")\u3092\u3054\u89A7\u304F\u3060\u3055\u3044\u3002\n\n2. \u3042\u306A\u305F\u306E\u30D7\u30ED\u30B0\u30E9\u30E0\u306B\u5546\u696D\u30D5\u30A3\u30FC\u30C9\u3092\u30B5\u30DD\u30FC\u30C8\u3057\u3066\u3044\u308B\u304B\u3092\u78BA\u8A8D\u3059\u308B\u305F\u3081\u306B\u3001[\u9280\u884C\u306B\u9023\u7D61](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ")\u3057\u3001\u30D5\u30A3\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3059\u308B\u3088\u3046\u4F9D\u983C\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n3. *\u30D5\u30A3\u30FC\u30C9\u304C\u6709\u52B9\u306B\u306A\u308A\u3001\u305D\u306E\u8A73\u7D30\u3092\u53D6\u5F97\u3057\u305F\u3089\u3001\u6B21\u306E\u753B\u9762\u306B\u9032\u3093\u3067\u304F\u3060\u3055\u3044\u3002*"),
                    stripe: "1. Stripe\u306E\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u306B\u30A2\u30AF\u30BB\u30B9\u3057\u3001[\u8A2D\u5B9A](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ")\u306B\u79FB\u52D5\u3057\u307E\u3059\u3002\n\n2. \u88FD\u54C1\u7D71\u5408\u306E\u4E0B\u3067\u3001Expensify\u306E\u6A2A\u306B\u3042\u308B\u6709\u52B9\u5316\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002\n\n3. \u30D5\u30A3\u30FC\u30C9\u304C\u6709\u52B9\u306B\u306A\u3063\u305F\u3089\u3001\u4E0B\u306E\u9001\u4FE1\u3092\u30AF\u30EA\u30C3\u30AF\u3059\u308B\u3068\u3001\u8FFD\u52A0\u4F5C\u696D\u3092\u958B\u59CB\u3057\u307E\u3059\u3002"),
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
                        title: "Amex\u914D\u4FE1\u30D5\u30A1\u30A4\u30EB\u540D\u306F\u4F55\u3067\u3059\u304B\uFF1F",
                        fileNameLabel: '配信ファイル名',
                        helpLabel: '配信ファイル名はどこで見つけますか？',
                    },
                    cdf: {
                        title: "Mastercard\u306E\u914D\u5E03ID\u306F\u4F55\u3067\u3059\u304B\uFF1F",
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
            },
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = '月の最終日',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = '月の最終営業日',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'カスタム月日',
                _4),
            assignCard: 'カードを割り当てる',
            findCard: 'カードを探す',
            cardNumber: 'カード番号',
            commercialFeed: '商業フィード',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "".concat(feedName, "\u30AB\u30FC\u30C9");
            },
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseCard: 'カードを選んでください',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "".concat(feed, "\u30AB\u30FC\u30C9\u30D5\u30A3\u30FC\u30C9\u304B\u3089").concat(assignee, "\u306E\u305F\u3081\u306B\u30AB\u30FC\u30C9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
            },
            noActiveCards: 'このフィードにはアクティブなカードがありません',
            somethingMightBeBroken: 'または何かが壊れている可能性があります。いずれにせよ、質問があれば、ただ',
            contactConcierge: 'Conciergeに連絡する',
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
            brokenConnectionErrorFirstPart: "\u30AB\u30FC\u30C9\u30D5\u30A3\u30FC\u30C9\u306E\u63A5\u7D9A\u304C\u5207\u308C\u3066\u3044\u307E\u3059\u3002\u3069\u3046\u304B",
            brokenConnectionErrorLink: '銀行にログインする',
            brokenConnectionErrorSecondPart: 'それで、再び接続を確立できます。',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "".concat(assignee, "\u306B").concat(link, "\u3092\u5272\u308A\u5F53\u3066\u307E\u3057\u305F\uFF01\u30A4\u30F3\u30DD\u30FC\u30C8\u3055\u308C\u305F\u53D6\u5F15\u306F\u3053\u306E\u30C1\u30E3\u30C3\u30C8\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002");
            },
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation: 'Expensify, Inc.は、Plaid Financial Ltd.の代理店であり、支払いサービス規則2017に基づいて金融行動監視機構によって規制されている認可支払い機関です（会社参照番号: 804718）。Plaidは、Expensify Limitedをその代理店として通じて、規制されたアカウント情報サービスを提供します。',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensifyカードを発行および管理する',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            verificationInProgress: '確認中...',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensifyカードの発行準備が整ったら、Conciergeがお知らせします。',
            disclaimer: 'The Expensify Visa® Commercial Cardは、Visa U.S.A. Inc.からのライセンスに基づき、FDICメンバーであるThe Bancorp Bank, N.A.によって発行されており、Visaカードを受け付けるすべての加盟店で使用できるわけではありません。Apple®およびAppleロゴ®は、米国およびその他の国で登録されたApple Inc.の商標です。App StoreはApple Inc.のサービスマークです。Google PlayおよびGoogle Playロゴは、Google LLCの商標です。',
            issueCard: 'カードを発行',
            findCard: 'カードを探す',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '最後の4つ',
            limit: '制限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在の残高は、前回の決済日以降に発生したすべてのExpensifyカード取引の合計です。',
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "\u6B8B\u9AD8\u306F".concat(settlementDate, "\u306B\u6C7A\u6E08\u3055\u308C\u307E\u3059\u3002");
            },
            settleBalance: '残高を清算する',
            cardLimit: 'カード限度額',
            remainingLimit: '残りの制限',
            requestLimitIncrease: 'リクエスト制限の増加を要求する',
            remainingLimitDescription: '残りの限度額を計算する際には、いくつかの要因を考慮します。お客様としてのご利用期間、サインアップ時に提供されたビジネス関連情報、そしてビジネス銀行口座の利用可能な現金です。残りの限度額は日々変動する可能性があります。',
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
            settlementAccountInfoPt1: 'このアカウントがあなたのものと一致していることを確認してください',
            settlementAccountInfoPt2: 'したがって、Continuous Reconciliationは正常に動作します。',
            reconciliationAccount: '調整口座',
            settlementFrequency: '決済頻度',
            settlementFrequencyDescription: 'Expensifyカードの残高をどのくらいの頻度で支払うか選択してください。',
            settlementFrequencyInfo: '月次決済に切り替えたい場合は、Plaidを通じて銀行口座を接続し、90日間のプラス残高履歴が必要です。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カードの詳細',
            virtual: 'バーチャル',
            physical: '物理的',
            deactivate: 'カードを無効化する',
            changeCardLimit: 'カード限度額を変更',
            changeLimit: '制限を変更',
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u306E\u9650\u5EA6\u984D\u3092".concat(limit, "\u306B\u5909\u66F4\u3059\u308B\u3068\u3001\u65B0\u3057\u3044\u53D6\u5F15\u306F\u30AB\u30FC\u30C9\u4E0A\u3067\u3055\u3089\u306B\u7D4C\u8CBB\u3092\u627F\u8A8D\u3059\u308B\u307E\u3067\u62D2\u5426\u3055\u308C\u307E\u3059\u3002");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u306E\u9650\u5EA6\u984D\u3092".concat(limit, "\u306B\u5909\u66F4\u3059\u308B\u3068\u3001\u65B0\u3057\u3044\u53D6\u5F15\u306F\u6765\u6708\u307E\u3067\u62D2\u5426\u3055\u308C\u307E\u3059\u3002");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u306E\u9650\u5EA6\u984D\u3092".concat(limit, "\u306B\u5909\u66F4\u3059\u308B\u3068\u3001\u65B0\u3057\u3044\u53D6\u5F15\u306F\u62D2\u5426\u3055\u308C\u307E\u3059\u3002");
            },
            changeCardLimitType: 'カード制限タイプを変更する',
            changeLimitType: '制限タイプを変更',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u306E\u9650\u5EA6\u984D\u30BF\u30A4\u30D7\u3092\u30B9\u30DE\u30FC\u30C8\u30EA\u30DF\u30C3\u30C8\u306B\u5909\u66F4\u3059\u308B\u3068\u3001".concat(limit, " \u306E\u672A\u627F\u8A8D\u9650\u5EA6\u984D\u306B\u65E2\u306B\u9054\u3057\u3066\u3044\u308B\u305F\u3081\u3001\u65B0\u3057\u3044\u53D6\u5F15\u306F\u62D2\u5426\u3055\u308C\u307E\u3059\u3002");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "\u3053\u306E\u30AB\u30FC\u30C9\u306E\u9650\u5EA6\u984D\u30BF\u30A4\u30D7\u3092\u6708\u6B21\u306B\u5909\u66F4\u3059\u308B\u3068\u3001".concat(limit, " \u306E\u6708\u6B21\u9650\u5EA6\u984D\u306B\u3059\u3067\u306B\u9054\u3057\u3066\u3044\u308B\u305F\u3081\u3001\u65B0\u3057\u3044\u53D6\u5F15\u306F\u62D2\u5426\u3055\u308C\u307E\u3059\u3002");
            },
            addShippingDetails: '配送詳細を追加',
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, "\u306BExpensify\u30AB\u30FC\u30C9\u3092\u767A\u884C\u3057\u307E\u3057\u305F\uFF01\u30AB\u30FC\u30C9\u306F2\uFF5E3\u55B6\u696D\u65E5\u3067\u5230\u7740\u3057\u307E\u3059\u3002");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, "\u306BExpensify\u30AB\u30FC\u30C9\u3092\u767A\u884C\u3057\u307E\u3057\u305F\uFF01\u30AB\u30FC\u30C9\u306F\u767A\u9001\u60C5\u5831\u304C\u8FFD\u52A0\u3055\u308C\u6B21\u7B2C\u3001\u767A\u9001\u3055\u308C\u307E\u3059\u3002");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "".concat(assignee, "\u306B\u30D0\u30FC\u30C1\u30E3\u30EB").concat(link, "\u3092\u767A\u884C\u3057\u307E\u3057\u305F\uFF01\u30AB\u30FC\u30C9\u306F\u3059\u3050\u306B\u4F7F\u7528\u3067\u304D\u307E\u3059\u3002");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, "\u304C\u914D\u9001\u60C5\u5831\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002Expensify Card\u306F2\uFF5E3\u55B6\u696D\u65E5\u3067\u5230\u7740\u3057\u307E\u3059\u3002");
            },
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
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "\u3059\u3079\u3066\u306E\u7D4C\u8CBB\u306F\u3001".concat(connectionName, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3059\u308B\u305F\u3081\u306B\u30AB\u30C6\u30B4\u30EA\u5206\u3051\u3055\u308C\u306A\u3051\u308C\u3070\u306A\u308A\u307E\u305B\u3093\u3002");
            },
            subtitle: 'お金がどこで使われているかをより良く把握しましょう。デフォルトのカテゴリーを使用するか、自分で追加してください。',
            emptyCategories: {
                title: 'カテゴリが作成されていません',
                subtitle: '支出を整理するためにカテゴリーを追加してください。',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'あなたのカテゴリは現在、会計接続からインポートされています。こちらに移動してください',
                subtitle2: '会計',
                subtitle3: '変更を加えるために。',
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
                description: "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u30AB\u30C6\u30B4\u30EA\u30FC\u304C\u5FC5\u8981\u306A\u305F\u3081\u3001\u5C11\u306A\u304F\u3068\u30821\u3064\u306E\u30AB\u30C6\u30B4\u30EA\u30FC\u3092\u6709\u52B9\u306B\u3057\u3066\u304A\u304F\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
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
                disableCardTitle: '会社カードを無効にする',
                disableCardPrompt: 'この機能が使用中のため、会社カードを無効にすることはできません。次のステップについてはConciergeにお問い合わせください。',
                disableCardButton: 'Conciergeとチャットする',
                cardDetails: 'カードの詳細',
                cardNumber: 'カード番号',
                cardholder: 'カードホルダー',
                cardName: 'カード名',
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8") : "".concat(integration, " \u30A8\u30AF\u30B9\u30DD\u30FC\u30C8");
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "\u53D6\u5F15\u3092\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3059\u308B".concat(integration, "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
                integrationExportTitlePart: '別のものを選択',
                integrationExportTitleLinkPart: 'エクスポートオプション',
                integrationExportTitleSecondPart: '利用可能なアカウントを変更するには。',
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
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "".concat(feedName, " \u30D5\u30A3\u30FC\u30C9\u3092\u524A\u9664");
                },
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
                pendingFeedTitle: "\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059...",
                pendingFeedDescription: "\u73FE\u5728\u3001\u30D5\u30A3\u30FC\u30C9\u306E\u8A73\u7D30\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059\u3002\u305D\u308C\u304C\u5B8C\u4E86\u6B21\u7B2C\u3001\u7D4C\u7531\u3067\u3054\u9023\u7D61\u3044\u305F\u3057\u307E\u3059\u3002",
                pendingBankTitle: 'ブラウザウィンドウを確認してください。',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "".concat(bankName, "\u306B\u63A5\u7D9A\u3059\u308B\u306B\u306F\u3001\u958B\u3044\u305F\u30D6\u30E9\u30A6\u30B6\u30A6\u30A3\u30F3\u30C9\u30A6\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30A6\u30A3\u30F3\u30C9\u30A6\u304C\u958B\u304B\u306A\u3044\u5834\u5408\u306F\u3001");
                },
                pendingBankLink: 'こちらをクリックしてください',
                giveItNameInstruction: 'カードに他と区別できる名前を付けてください。',
                updating: '更新中...',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u30C0\u30A6\u30F3\u30B0\u30EC\u30FC\u30C9\u3067\u304D\u307E\u305B\u3093",
                downgradeSubTitleFirstPart: "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306F\u3001\u8907\u6570\u306E\u30AB\u30FC\u30C9\u30D5\u30A3\u30FC\u30C9\u304C\u63A5\u7D9A\u3055\u308C\u3066\u3044\u308B\u305F\u3081\uFF08Expensify\u30AB\u30FC\u30C9\u3092\u9664\u304F\uFF09\u3001\u30C0\u30A6\u30F3\u30B0\u30EC\u30FC\u30C9\u3067\u304D\u307E\u305B\u3093\u3002\u3069\u3046\u305E",
                downgradeSubTitleMiddlePart: "\u30AB\u30FC\u30C9\u30D5\u30A3\u30FC\u30C9\u30921\u3064\u3060\u3051\u4FDD\u6301",
                downgradeSubTitleLastPart: '続行する。',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "".concat(connection, "\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0\u3057\u3001\u518D\u5EA6\u63A5\u7D9A\u3092\u540C\u671F\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
                expensifyCardBannerTitle: 'Expensifyカードを取得する',
                expensifyCardBannerSubtitle: 'すべての米国での購入でキャッシュバックを楽しみ、Expensifyの請求書が最大50%オフ、無制限のバーチャルカードなど、さらに多くの特典があります。',
                expensifyCardBannerLearnMoreButton: '詳細を確認',
                statementCloseDateTitle: '利用明細書の締め日',
                statementCloseDateDescription: 'カード利用明細書の締め日をお知らせいただければ、Expensifyで一致する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認と支払い方法を設定します。',
                disableApprovalPrompt: 'このワークスペースのExpensifyカードは現在、承認に依存してスマートリミットを定義しています。承認を無効にする前に、スマートリミットを持つExpensifyカードの制限タイプを修正してください。',
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
            connectionsWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '会計を無効にするには、ワークスペースから会計接続を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'ちょっと待ってください…',
                featureEnabledText: 'このワークスペースのExpensifyカードは、承認ワークフローに依存してスマートリミットを定義しています。\n\nワークフローを無効にする前に、スマートリミットが設定されているカードのリミットタイプを変更してください。',
                confirmText: 'Expensifyカードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: '領収書の要求、高額支出のフラグ付け、その他。',
            },
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
            textAlternateText: '自由入力フィールドを追加してください。',
            dateAlternateText: '日付選択用のカレンダーを追加します。',
            dropdownAlternateText: '選択肢のリストを追加してください。',
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
            dependentMultiLevelTagsSubtitle: {
                phrase1: '使用中です',
                phrase2: '依存タグ',
                phrase3: '. You can',
                phrase4: 'スプレッドシートを再インポートする',
                phrase5: 'タグを更新するために。',
            },
            emptyTags: {
                title: 'タグが作成されていません',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'プロジェクト、場所、部門などを追跡するためのタグを追加します。',
                subtitle1: 'スプレッドシートをインポートして、プロジェクト、場所、部門などの追跡用タグを追加します。',
                subtitle2: '詳細を確認',
                subtitle3: 'フォーマットタグファイルについて。',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'あなたのタグは現在、会計接続からインポートされています。こちらに移動して',
                subtitle2: '会計',
                subtitle3: '変更を加えるために。',
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
            tagRules: 'Tag rules',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費を1種類のタグまたは複数のタグでコード化します。',
            configureMultiLevelTags: 'マルチレベルタグ付けのためのタグリストを設定します。',
            importMultiLevelTagsSupportingText: "\u3053\u3061\u3089\u304C\u30BF\u30B0\u306E\u30D7\u30EC\u30D3\u30E5\u30FC\u3067\u3059\u3002\u3059\u3079\u3066\u554F\u984C\u306A\u3051\u308C\u3070\u3001\u4E0B\u306E\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u30A4\u30F3\u30DD\u30FC\u30C8\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
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
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "\u30B9\u30D7\u30EC\u30C3\u30C9\u30B7\u30FC\u30C8\u3067*".concat(columnCounts, "\u5217*\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F\u3002\u30BF\u30B0\u540D\u3092\u542B\u3080\u5217\u306E\u6A2A\u306B*\u540D\u524D*\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u307E\u305F\u3001\u30BF\u30B0\u306E\u30B9\u30C6\u30FC\u30BF\u30B9\u3092\u8A2D\u5B9A\u3059\u308B\u5217\u306E\u6A2A\u306B*\u6709\u52B9*\u3092\u9078\u629E\u3059\u308B\u3053\u3068\u3082\u3067\u304D\u307E\u3059\u3002");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u30BF\u30B0\u304C\u5FC5\u8981\u306A\u305F\u3081\u3001\u5C11\u306A\u304F\u3068\u30821\u3064\u306E\u30BF\u30B0\u3092\u6709\u52B9\u306B\u3057\u3066\u304A\u304F\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグをオプションにすることはできません',
                description: "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8A2D\u5B9A\u3067\u30BF\u30B0\u304C\u5FC5\u8981\u306A\u305F\u3081\u3001\u5C11\u306A\u304F\u3068\u30821\u3064\u306E\u30BF\u30B0\u3092\u5FC5\u9808\u306B\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
            },
            tagCount: function () { return ({
                one: '1日',
                other: function (count) { return "".concat(count, " \u30BF\u30B0"); },
            }); },
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
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "".concat(taxAmount, "\u306E\u7A0E\u91D1\u3092\u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F");
            },
            actions: {
                delete: 'レートを削除',
                deleteMultiple: 'レートを削除',
                enable: 'レートを有効にする',
                disable: 'レートを無効にする',
                enableTaxRates: function () { return ({
                    one: 'レートを有効にする',
                    other: 'レートを有効にする',
                }); },
                disableTaxRates: function () { return ({
                    one: 'レートを無効にする',
                    other: 'レートを無効にする',
                }); },
            },
            importedFromAccountingSoftware: '以下の税金はあなたのからインポートされています',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースを作成',
            subtitle: '領収書を追跡し、経費を払い戻し、旅行を管理し、請求書を送信するためのワークスペースを作成し、チャットの速度でこれらすべてを行いましょう。',
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
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "\u30DE\u30A4\u30B0\u30EB\u30FC\u30D7\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "".concat(userName, "\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9").concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: 'ワークスペースからメンバーを削除する際にエラーが発生しました。もう一度お試しください。',
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "".concat(memberName, "\u3092\u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F"),
                    other: 'これらのメンバーを削除してもよろしいですか？',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " \u306F\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u627F\u8A8D\u8005\u3067\u3059\u3002\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u5171\u6709\u3092\u89E3\u9664\u3059\u308B\u3068\u3001\u627F\u8A8D\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3067 ").concat(ownerName, " \u3068\u3044\u3046\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u6240\u6709\u8005\u306B\u7F6E\u304D\u63DB\u3048\u3089\u308C\u307E\u3059\u3002");
            },
            removeMembersTitle: function () { return ({
                one: 'メンバーを削除',
                other: 'メンバーを削除',
            }); },
            findMember: 'メンバーを探す',
            removeWorkspaceMemberButtonTitle: 'ワークスペースから削除',
            removeGroupMemberButtonTitle: 'グループから削除',
            removeRoomMemberButtonTitle: 'チャットから削除',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "".concat(memberName, "\u3092\u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F");
            },
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
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "\u30BB\u30AB\u30F3\u30C0\u30EA\u30FC\u30ED\u30B0\u30A4\u30F3 ".concat(secondaryLogin, " \u306B\u3088\u3063\u3066\u8FFD\u52A0\u3055\u308C\u307E\u3057\u305F\u3002");
            },
            membersListTitle: 'すべてのワークスペースメンバーのディレクトリ。',
            importMembers: 'メンバーをインポート',
        },
        card: {
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            issueCard: 'カードを発行',
            issueNewCard: {
                whoNeedsCard: '誰がカードを必要としていますか？',
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
            errorODIntegration: 'Expensify Classicで設定された接続にエラーがあります。',
            goToODToFix: 'この問題を解決するには、Expensify Classicに移動してください。',
            goToODToSettings: '設定を管理するには、Expensify Classicに移動してください。',
            setup: '接続する',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "\u6700\u7D42\u540C\u671F\u65E5\u6642: ".concat(relativeDate);
            },
            notSync: '同期されていません',
            import: 'インポート',
            export: 'エクスポート',
            advanced: '上級',
            other: 'その他',
            syncNow: '今すぐ同期',
            disconnect: '切断する',
            reinstall: 'コネクタを再インストール',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '統合';
                return "".concat(integrationName, "\u3092\u5207\u65AD");
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : '会計統合', " \u306B\u63A5\u7D9A");
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Onlineに接続できません';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xeroに接続できません';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuiteに接続できません';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
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
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'インポート済み',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'タグとしてインポートされました',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'インポート済み',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'インポートされていません',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'インポートされていません',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'レポートフィールドとしてインポートされました',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'NetSuiteの従業員デフォルト',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この統合';
                return "".concat(integrationName, "\u3092\u5207\u65AD\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'この会計統合', "\u3092\u63A5\u7D9A\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F\u3053\u308C\u306B\u3088\u308A\u3001\u65E2\u5B58\u306E\u4F1A\u8A08\u63A5\u7D9A\u304C\u3059\u3079\u3066\u524A\u9664\u3055\u308C\u307E\u3059\u3002");
            },
            enterCredentials: '資格情報を入力してください',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
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
                            return "\u30B9\u30C6\u30FC\u30B8\u306E\u7FFB\u8A33\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: '優先エクスポーター',
            exportPreferredExporterNote: '優先されるエクスポーターは任意のワークスペース管理者で構いませんが、ドメイン設定で個々の会社カードに異なるエクスポートアカウントを設定する場合は、ドメイン管理者である必要があります。',
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
            enableContinuousReconciliation: '継続的な調整を有効にするには、有効にしてください',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensifyカードの支払いを照合する銀行口座を選択してください。',
                accountMatches: 'このアカウントがあなたのものと一致していることを確認してください',
                settlementAccount: 'Expensifyカード決済口座',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "\uFF08".concat(lastFourPAN, "\u3067\u7D42\u308F\u308B\uFF09\u305F\u3081\u3001\u7D99\u7D9A\u7684\u306A\u8ABF\u6574\u304C\u6B63\u3057\u304F\u6A5F\u80FD\u3057\u307E\u3059\u3002");
                },
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
                addBankAccount: '銀行口座を追加',
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
            pleaseEnterValidLogin: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u96FB\u8A71\u756A\u53F7\u304C\u6709\u52B9\u3067\u3042\u308B\u3053\u3068\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u4F8B: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, "\uFF09\u3002"),
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
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, "\u304C").concat(workspaceName, "\u3078\u306E\u53C2\u52A0\u3092\u30EA\u30AF\u30A8\u30B9\u30C8\u3057\u307E\u3057\u305F\u3002");
            },
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
            deleteRates: function () { return ({
                one: 'レートを削除',
                other: 'レートを削除',
            }); },
            enableRates: function () { return ({
                one: 'レートを有効にする',
                other: 'レートを有効にする',
            }); },
            disableRates: function () { return ({
                one: 'レートを無効にする',
                other: 'レートを無効にする',
            }); },
            enableRate: 'レートを有効にする',
            status: 'ステータス',
            unit: '単位',
            taxFeatureNotEnabledMessage: 'この機能を使用するには、ワークスペースで税金を有効にする必要があります。こちらに移動して',
            changePromptMessage: 'その変更を行うために。',
            deleteDistanceRate: '距離料金を削除',
            areYouSureDelete: function () { return ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }); },
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
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306F".concat(currency, "\u306E\u9280\u884C\u53E3\u5EA7\u306B\u30EA\u30F3\u30AF\u3055\u308C\u3066\u3044\u308B\u305F\u3081\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\u901A\u8CA8\u3092\u5909\u66F4\u3067\u304D\u307E\u305B\u3093\u3002");
            },
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travelを有効にするには、ワークスペースの住所が必要です。ビジネスに関連する住所を入力してください。',
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
            disconnectYour: '切断する',
            bankAccountAnyTransactions: '銀行口座。この口座の未処理の取引は引き続き完了します。',
            clearProgress: 'やり直すと、これまでの進捗がクリアされます。',
            areYouSure: 'よろしいですか？',
            workspaceCurrency: 'ワークスペース通貨',
            updateCurrencyPrompt: 'お使いのワークスペースは現在、USDとは異なる通貨に設定されているようです。下のボタンをクリックして、通貨をUSDに更新してください。',
            updateToUSD: 'USDに更新',
            updateWorkspaceCurrency: 'ワークスペースの通貨を更新する',
            workspaceCurrencyNotSupported: 'ワークスペース通貨はサポートされていません',
            yourWorkspace: 'ワークスペースがサポートされていない通貨に設定されています。こちらをご覧ください',
            listOfSupportedCurrencies: 'サポートされている通貨のリスト',
        },
        changeOwner: {
            changeOwnerPageTitle: 'オーナーを移行',
            addPaymentCardTitle: '所有権を移転するために支払いカードを入力してください。',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptTextPart1: '読み取りと承認',
            addPaymentCardReadAndAcceptTextPart2: 'カードを追加するためのポリシー',
            addPaymentCardTerms: '利用規約',
            addPaymentCardPrivacy: 'プライバシー',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長インフラストラクチャー',
            addPaymentCardLearnMore: '私たちの詳細について学ぶ',
            addPaymentCardSecurity: 'セキュリティ',
            amountOwedTitle: '未払い残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\nこの残高を清算して、このワークスペースの請求を引き継ぎますか？',
            ownerOwesAmountTitle: '未払い残高',
            ownerOwesAmountButtonText: '残高を移動',
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u6240\u6709\u8005\uFF08".concat(email, "\uFF09\u306B\u306F\u3001\u524D\u6708\u304B\u3089\u306E\u672A\u6255\u3044\u6B8B\u9AD8\u304C\u3042\u308A\u307E\u3059\u3002\n\n\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u3050\u305F\u3081\u306B\u3001\u3053\u306E\u91D1\u984D\uFF08").concat(amount, "\uFF09\u3092\u632F\u308A\u66FF\u3048\u307E\u3059\u304B\uFF1F\u3042\u306A\u305F\u306E\u652F\u6255\u3044\u30AB\u30FC\u30C9\u306B\u5373\u5EA7\u306B\u8ACB\u6C42\u3055\u308C\u307E\u3059\u3002");
            },
            subscriptionTitle: '年間サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行する',
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u5F15\u304D\u7D99\u3050\u3068\u3001\u5E74\u9593\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u304C\u73FE\u5728\u306E\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u3068\u7D71\u5408\u3055\u308C\u307E\u3059\u3002\u3053\u308C\u306B\u3088\u308A\u3001\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306E\u30B5\u30A4\u30BA\u304C".concat(usersCount, "\u4EBA\u5897\u52A0\u3057\u3001\u65B0\u3057\u3044\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306E\u30B5\u30A4\u30BA\u306F").concat(finalCount, "\u4EBA\u306B\u306A\u308A\u307E\u3059\u3002\u7D9A\u884C\u3057\u307E\u3059\u304B\uFF1F");
            },
            duplicateSubscriptionTitle: '重複サブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行する',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "".concat(email, "\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u3054\u3046\u3068\u3057\u3066\u3044\u308B\u3088\u3046\u3067\u3059\u304C\u3001\u305D\u306E\u305F\u3081\u306B\u306F\u307E\u305A\u3001\u3059\u3079\u3066\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u7BA1\u7406\u8005\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002\n\n\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9").concat(workspaceName, "\u306E\u8ACB\u6C42\u306E\u307F\u3092\u5F15\u304D\u7D99\u304E\u305F\u3044\u5834\u5408\u306F\u3001\u300C\u7D9A\u884C\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u5168\u4F53\u306E\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u304E\u305F\u3044\u5834\u5408\u306F\u3001\u307E\u305A\u3059\u3079\u3066\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u7BA1\u7406\u8005\u3068\u3057\u3066\u8FFD\u52A0\u3057\u3066\u3082\u3089\u3063\u3066\u304B\u3089\u3001\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u3044\u3067\u304F\u3060\u3055\u3044\u3002");
            },
            hasFailedSettlementsTitle: '所有権を移転できません',
            hasFailedSettlementsButtonText: '了解しました。',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "".concat(email, " \u306F\u672A\u6255\u3044\u306E Expensify Card \u6C7A\u6E08\u304C\u3042\u308B\u305F\u3081\u3001\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u3050\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3002\u554F\u984C\u3092\u89E3\u6C7A\u3059\u308B\u305F\u3081\u306B\u3001concierge@expensify.com \u306B\u9023\u7D61\u3059\u308B\u3088\u3046\u306B\u4F9D\u983C\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u305D\u306E\u5F8C\u3001\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8ACB\u6C42\u3092\u5F15\u304D\u7D99\u3050\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002");
            },
            failedToClearBalanceTitle: '残高をクリアできませんでした',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高をクリアできませんでした。後でもう一度お試しください。',
            successTitle: 'やったー！準備完了です。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ちょっと待って...',
            errorDescriptionPartOne: 'このワークスペースの所有権の移行に問題が発生しました。もう一度お試しいただくか、',
            errorDescriptionPartTwo: 'Conciergeに連絡する',
            errorDescriptionPartThree: 'for help.',
        },
        exportAgainModal: {
            title: '注意！',
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "\u6B21\u306E\u30EC\u30DD\u30FC\u30C8\u306F\u3059\u3067\u306B".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u307E\u3059\uFF1A\n\n").concat(reportName, "\n\n\u672C\u5F53\u306B\u518D\u5EA6\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3059\u304B\uFF1F");
            },
            confirmText: 'はい、再度エクスポートしてください。',
            cancelText: 'キャンセル',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'レポートフィールド',
                    description: "\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u3067\u306F\u3001\u500B\u3005\u306E\u9805\u76EE\u306E\u7D4C\u8CBB\u306B\u95A2\u9023\u3059\u308B\u30BF\u30B0\u3068\u306F\u7570\u306A\u308A\u3001\u30D8\u30C3\u30C0\u30FC\u30EC\u30D9\u30EB\u306E\u8A73\u7D30\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u3002\u3053\u308C\u3089\u306E\u8A73\u7D30\u306B\u306F\u3001\u7279\u5B9A\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u540D\u3001\u51FA\u5F35\u60C5\u5831\u3001\u5834\u6240\u306A\u3069\u304C\u542B\u307E\u308C\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059\u3002",
                    onlyAvailableOnPlan: 'レポートフィールドは、Controlプランでのみ利用可能です。料金は',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Expensify + NetSuite\u306E\u7D71\u5408\u306B\u3088\u308A\u3001\u81EA\u52D5\u540C\u671F\u3092\u697D\u3057\u307F\u3001\u624B\u52D5\u5165\u529B\u3092\u524A\u6E1B\u3067\u304D\u307E\u3059\u3002\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3084\u9867\u5BA2\u306E\u30DE\u30C3\u30D4\u30F3\u30B0\u3092\u542B\u3080\u30CD\u30A4\u30C6\u30A3\u30D6\u304A\u3088\u3073\u30AB\u30B9\u30BF\u30E0\u30BB\u30B0\u30E1\u30F3\u30C8\u306E\u30B5\u30DD\u30FC\u30C8\u3067\u3001\u8A73\u7D30\u3067\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u306E\u8CA1\u52D9\u30A4\u30F3\u30B5\u30A4\u30C8\u3092\u5F97\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002",
                onlyAvailableOnPlan: '私たちのNetSuite統合は、Controlプランでのみ利用可能です。開始価格は',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Expensify + Sage Intacct \u306E\u7D71\u5408\u3067\u3001\u81EA\u52D5\u540C\u671F\u3092\u697D\u3057\u307F\u3001\u624B\u52D5\u5165\u529B\u3092\u6E1B\u3089\u3057\u307E\u3057\u3087\u3046\u3002\u30E6\u30FC\u30B6\u30FC\u5B9A\u7FA9\u306E\u30C7\u30A3\u30E1\u30F3\u30B7\u30E7\u30F3\u306B\u3088\u308B\u8A73\u7D30\u3067\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u306A\u8CA1\u52D9\u30A4\u30F3\u30B5\u30A4\u30C8\u3092\u5F97\u308B\u3068\u3068\u3082\u306B\u3001\u90E8\u9580\u3001\u30AF\u30E9\u30B9\u3001\u5834\u6240\u3001\u9867\u5BA2\u3001\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\uFF08\u30B8\u30E7\u30D6\uFF09\u3054\u3068\u306E\u7D4C\u8CBB\u30B3\u30FC\u30C9\u5316\u304C\u53EF\u80FD\u3067\u3059\u3002",
                onlyAvailableOnPlan: 'Sage Intacctとの統合は、Controlプランでのみ利用可能で、料金は',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Expensify + QuickBooks Desktop \u306E\u7D71\u5408\u3067\u3001\u81EA\u52D5\u540C\u671F\u3092\u697D\u3057\u307F\u3001\u624B\u52D5\u5165\u529B\u3092\u6E1B\u3089\u3057\u307E\u3057\u3087\u3046\u3002\u30AF\u30E9\u30B9\u3001\u30A2\u30A4\u30C6\u30E0\u3001\u9867\u5BA2\u3001\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3054\u3068\u306E\u7D4C\u8CBB\u30B3\u30FC\u30C9\u5316\u3068\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u306E\u53CC\u65B9\u5411\u63A5\u7D9A\u3067\u3001\u7A76\u6975\u306E\u52B9\u7387\u6027\u3092\u5B9F\u73FE\u3057\u307E\u3059\u3002",
                onlyAvailableOnPlan: 'QuickBooks Desktopの統合は、Controlプランでのみ利用可能で、料金は',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: '高度な承認',
                description: "\u8FFD\u52A0\u306E\u627F\u8A8D\u30EC\u30A4\u30E4\u30FC\u3092\u52A0\u3048\u305F\u3044\u5834\u5408\u3084\u3001\u6700\u3082\u5927\u304D\u306A\u7D4C\u8CBB\u306B\u3082\u3046\u4E00\u3064\u306E\u76EE\u3092\u901A\u3057\u305F\u3044\u5834\u5408\u3067\u3082\u3001\u79C1\u305F\u3061\u304C\u30B5\u30DD\u30FC\u30C8\u3057\u307E\u3059\u3002\u9AD8\u5EA6\u306A\u627F\u8A8D\u6A5F\u80FD\u306B\u3088\u308A\u3001\u3042\u3089\u3086\u308B\u30EC\u30D9\u30EB\u3067\u9069\u5207\u306A\u30C1\u30A7\u30C3\u30AF\u3092\u884C\u3044\u3001\u30C1\u30FC\u30E0\u306E\u652F\u51FA\u3092\u7BA1\u7406\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002",
                onlyAvailableOnPlan: '高度な承認は、Controlプランでのみ利用可能で、料金は',
            },
            _6.categories = {
                title: 'カテゴリ',
                description: "\u30AB\u30C6\u30B4\u30EA\u306F\u3001\u652F\u51FA\u3092\u3088\u308A\u826F\u304F\u6574\u7406\u3057\u3001\u304A\u91D1\u3092\u3069\u3053\u306B\u4F7F\u3063\u3066\u3044\u308B\u304B\u3092\u628A\u63E1\u3059\u308B\u306E\u306B\u5F79\u7ACB\u3061\u307E\u3059\u3002\u63D0\u6848\u3055\u308C\u305F\u30AB\u30C6\u30B4\u30EA\u30EA\u30B9\u30C8\u3092\u4F7F\u7528\u3059\u308B\u304B\u3001\u81EA\u5206\u3067\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
                onlyAvailableOnPlan: 'カテゴリは、Collectプランで利用可能です。料金は',
            },
            _6.glCodes = {
                title: 'GLコード',
                description: "GL\u30B3\u30FC\u30C9\u3092\u30AB\u30C6\u30B4\u30EA\u3068\u30BF\u30B0\u306B\u8FFD\u52A0\u3057\u3066\u3001\u4F1A\u8A08\u304A\u3088\u3073\u7D66\u4E0E\u30B7\u30B9\u30C6\u30E0\u3078\u306E\u7D4C\u8CBB\u306E\u7C21\u5358\u306A\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3092\u5B9F\u73FE\u3057\u307E\u3057\u3087\u3046\u3002",
                onlyAvailableOnPlan: 'GLコードは、Controlプランでのみ利用可能です。開始価格は',
            },
            _6.glAndPayrollCodes = {
                title: 'GL & Payroll コード',
                description: "GL\u30B3\u30FC\u30C9\u3068\u7D66\u4E0E\u30B3\u30FC\u30C9\u3092\u30AB\u30C6\u30B4\u30EA\u306B\u8FFD\u52A0\u3057\u3066\u3001\u7D4C\u8CBB\u3092\u4F1A\u8A08\u304A\u3088\u3073\u7D66\u4E0E\u30B7\u30B9\u30C6\u30E0\u306B\u7C21\u5358\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3057\u3087\u3046\u3002",
                onlyAvailableOnPlan: 'GLおよび給与コードは、Controlプランでのみ利用可能です。料金は',
            },
            _6.taxCodes = {
                title: '税コード',
                description: "\u7A0E\u30B3\u30FC\u30C9\u3092\u7A0E\u91D1\u306B\u8FFD\u52A0\u3057\u3066\u3001\u7D4C\u8CBB\u3092\u4F1A\u8A08\u304A\u3088\u3073\u7D66\u4E0E\u30B7\u30B9\u30C6\u30E0\u306B\u7C21\u5358\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3057\u307E\u3057\u3087\u3046\u3002",
                onlyAvailableOnPlan: '税コードは、Controlプランでのみ利用可能です。料金は',
            },
            _6.companyCards = {
                title: '無制限の会社カード',
                description: "\u3055\u3089\u306B\u30AB\u30FC\u30C9\u30D5\u30A3\u30FC\u30C9\u3092\u8FFD\u52A0\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u304B\uFF1F\u3059\u3079\u3066\u306E\u4E3B\u8981\u306A\u30AB\u30FC\u30C9\u767A\u884C\u4F1A\u793E\u304B\u3089\u306E\u53D6\u5F15\u3092\u540C\u671F\u3059\u308B\u305F\u3081\u306B\u3001\u7121\u5236\u9650\u306E\u4F1A\u793E\u30AB\u30FC\u30C9\u3092\u30A2\u30F3\u30ED\u30C3\u30AF\u3057\u307E\u3057\u3087\u3046\u3002",
                onlyAvailableOnPlan: 'これは、Controlプランでのみ利用可能です。料金は',
            },
            _6.rules = {
                title: 'ルール',
                description: "\u30EB\u30FC\u30EB\u306F\u30D0\u30C3\u30AF\u30B0\u30E9\u30A6\u30F3\u30C9\u3067\u5B9F\u884C\u3055\u308C\u3001\u3042\u306A\u305F\u306E\u652F\u51FA\u3092\u7BA1\u7406\u3059\u308B\u306E\u3067\u3001\u5C0F\u3055\u306A\u3053\u3068\u3092\u5FC3\u914D\u3059\u308B\u5FC5\u8981\u306F\u3042\u308A\u307E\u305B\u3093\u3002\n\n\u9818\u53CE\u66F8\u3084\u8AAC\u660E\u306A\u3069\u306E\u7D4C\u8CBB\u8A73\u7D30\u3092\u8981\u6C42\u3057\u3001\u5236\u9650\u3084\u30C7\u30D5\u30A9\u30EB\u30C8\u3092\u8A2D\u5B9A\u3057\u3001\u627F\u8A8D\u3068\u652F\u6255\u3044\u3092\u81EA\u52D5\u5316\u3057\u307E\u3059\u3002\u3059\u3079\u3066\u3092\u4E00\u304B\u6240\u3067\u884C\u3048\u307E\u3059\u3002",
                onlyAvailableOnPlan: 'ルールは、Controlプランでのみ利用可能で、料金は',
            },
            _6.perDiem = {
                title: '日当',
                description: '日当は、従業員が出張する際に日々の費用を遵守し、予測可能にするための優れた方法です。カスタム料金、デフォルトカテゴリ、目的地やサブレートなどの詳細な機能をお楽しみください。',
                onlyAvailableOnPlan: '日当は、Controlプランでのみ利用可能です。料金は',
            },
            _6.travel = {
                title: '旅行',
                description: 'Expensify Travelは、メンバーが宿泊施設、フライト、交通機関などを予約できる新しい法人向け旅行予約および管理プラットフォームです。',
                onlyAvailableOnPlan: '旅行は、Collectプランで利用可能です。料金は',
            },
            _6.multiLevelTags = {
                title: 'マルチレベルタグ',
                description: 'マルチレベルタグは、経費をより正確に追跡するのに役立ちます。各項目に部門、クライアント、コストセンターなどの複数のタグを割り当てることで、すべての経費の完全なコンテキストを把握できます。これにより、より詳細なレポート作成、承認ワークフロー、および会計エクスポートが可能になります。',
                onlyAvailableOnPlan: 'マルチレベルタグは、Controlプランでのみ利用可能です。開始価格は',
            },
            _6.pricing = {
                perActiveMember: 'アクティブメンバー1人あたり月額。',
                perMember: 'メンバーごとに月額。',
            },
            _6.note = {
                upgradeWorkspace: 'ワークスペースをアップグレードして、この機能にアクセスするか、',
                learnMore: '詳細を確認',
                aboutOurPlans: '私たちのプランと価格について。',
            },
            _6.upgradeToUnlock = 'この機能をアンロックする',
            _6.completed = {
                headline: "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u307E\u3057\u305F\uFF01",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "".concat(policyName, "\u3092\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D7\u30E9\u30F3\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3057\u307E\u3057\u305F\uFF01");
                },
                categorizeMessage: "Collect\u30D7\u30E9\u30F3\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u6B63\u5E38\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3055\u308C\u307E\u3057\u305F\u3002\u3053\u308C\u3067\u7D4C\u8CBB\u3092\u5206\u985E\u3067\u304D\u307E\u3059\uFF01",
                travelMessage: "Collect\u30D7\u30E9\u30F3\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306B\u6B63\u5E38\u306B\u30A2\u30C3\u30D7\u30B0\u30EC\u30FC\u30C9\u3055\u308C\u307E\u3057\u305F\u3002\u3053\u308C\u3067\u3001\u65C5\u884C\u306E\u4E88\u7D04\u3068\u7BA1\u7406\u3092\u958B\u59CB\u3067\u304D\u307E\u3059\uFF01",
                viewSubscription: 'サブスクリプションを表示',
                moreDetails: '詳細については。',
                gotIt: '了解しました、ありがとうございます。',
            },
            _6.commonFeatures = {
                title: 'Controlプランにアップグレード',
                note: '以下を含む、最も強力な機能をアンロック:',
                benefits: {
                    startsAt: 'コントロールプランは、料金が',
                    perMember: 'アクティブメンバー1人あたり月額。',
                    learnMore: '詳細を確認',
                    pricing: '私たちのプランと価格について。',
                    benefit1: '高度な会計接続（NetSuite、Sage Intacct、その他）',
                    benefit2: 'スマート経費ルール',
                    benefit3: 'マルチレベル承認ワークフロー',
                    benefit4: '強化されたセキュリティコントロール',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランタイプを変更します',
                },
            },
            _6),
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
            description1: 'このサブスクリプションの最終請求書は',
            description2: function (_a) {
                var date = _a.date;
                return "".concat(date, "\u306E\u5185\u8A33\u3092\u4EE5\u4E0B\u306B\u793A\u3057\u307E\u3059\uFF1A");
            },
            subscription: 'ご注意ください！この操作は、Expensifyのサブスクリプションを終了し、このワークスペースを削除し、すべてのワークスペースメンバーを削除します。このワークスペースを保持し、自分だけを削除したい場合は、別の管理者に請求を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限されています',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "".concat(workspaceName, " \u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u306E\u30A2\u30AF\u30B7\u30E7\u30F3\u306F\u73FE\u5728\u5236\u9650\u3055\u308C\u3066\u3044\u307E\u3059\u3002");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30AA\u30FC\u30CA\u30FC\u3067\u3042\u308B".concat(workspaceOwnerName, "\u306F\u3001\u65B0\u3057\u3044\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3\u3092\u30A2\u30F3\u30ED\u30C3\u30AF\u3059\u308B\u305F\u3081\u306B\u3001\u30D5\u30A1\u30A4\u30EB\u4E0A\u306E\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0\u307E\u305F\u306F\u66F4\u65B0\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002");
            },
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを解除するには、ファイル上の支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: '支払いカードを追加してロックを解除！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き使用するには、支払いカードを追加してください。',
            pleaseReachOutToYourWorkspaceAdmin: 'ご質問がある場合は、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者とチャットする',
            chatInAdmins: '#adminsでチャットする',
            addPaymentCard: '支払いカードを追加',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: '個別の経費に対して支出管理とデフォルトを設定します。また、ルールを作成することもできます。',
                receiptRequiredAmount: '領収書の必要金額',
                receiptRequiredAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出には領収書が必要です。',
                maxExpenseAmount: '最大経費額',
                maxExpenseAmountDescription: 'カテゴリールールで上書きされない限り、この金額を超える支出にフラグを立てます。',
                maxAge: '最大年齢',
                maxExpenseAge: '最大経費年齢',
                maxExpenseAgeDescription: '特定の日数より古い支出をフラグする。',
                maxExpenseAgeDays: function () { return ({
                    one: '1日',
                    other: function (count) { return "".concat(count, "\u65E5\u9593"); },
                }); },
                billableDefault: '請求可能なデフォルト',
                billableDefaultDescription: '現金およびクレジットカードの経費をデフォルトで請求可能にするかどうかを選択します。請求可能な経費は、次の場所で有効または無効にします。',
                billable: 'ビラブル',
                billableDescription: '経費は多くの場合、クライアントに再請求されます。',
                nonBillable: '非請求対象',
                nonBillableDescription: '経費は時々クライアントに再請求されます。',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceiptsは自動作成されます',
                eReceiptsHintLink: 'ほとんどのUSDクレジット取引の場合',
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費の一人当たりの費用を追跡します。',
                prohibitedDefaultDescription: 'アルコール、ギャンブル、その他の制限された項目が含まれる領収書をすべてフラグ付けしてください。これらの項目が含まれる領収書の経費は、手動での確認が必要です。',
                prohibitedExpenses: '禁止された経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル付随費用',
                gambling: 'ギャンブル',
                tobacco: 'タバコ',
                adultEntertainment: 'アダルトエンターテインメント',
            },
            expenseReportRules: {
                examples: '例:',
                title: '経費報告書',
                subtitle: '経費報告のコンプライアンス、承認、支払いを自動化します。',
                customReportNamesSubtitle: 'カスタマイズレポートのタイトルを使用して',
                customNameTitle: 'デフォルトのレポートタイトル',
                customNameDescription: 'カスタム名を選択して、経費レポートを作成するには、私たちの',
                customNameDescriptionLink: '広範な数式',
                customNameInputLabel: '名前',
                customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
                customNameStartDateExample: 'レポート開始日: {report:startdate}',
                customNameWorkspaceNameExample: 'ワークスペース名: {report:workspacename}',
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: '合計: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'メンバーがカスタムレポート名を変更するのを防ぐ',
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
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "".concat(currency !== null && currency !== void 0 ? currency : '', "20,000\u672A\u6E80\u306E\u91D1\u984D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
                autoPayApprovedReportsLockedSubtitle: 'その他の機能に移動してワークフローを有効にし、その後、支払いを追加してこの機能をアンロックしてください。',
                autoPayReportsUnderTitle: '以下の金額未満のレポートを自動支払い',
                autoPayReportsUnderDescription: 'この金額以下の完全に準拠した経費報告書は自動的に支払われます。',
                unlockFeatureGoToSubtitle: '移動',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3092\u6709\u52B9\u306B\u3057\u3001\u305D\u306E\u5F8C".concat(featureName, "\u3092\u8FFD\u52A0\u3057\u3066\u3053\u306E\u6A5F\u80FD\u3092\u30A2\u30F3\u30ED\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "\u305D\u3057\u3066".concat(featureName, "\u3092\u6709\u52B9\u306B\u3057\u3066\u3001\u3053\u306E\u6A5F\u80FD\u3092\u30A2\u30F3\u30ED\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
            },
            categoryRules: {
                title: 'カテゴリールール',
                approver: '承認者',
                requireDescription: '説明が必要です',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "\u5F93\u696D\u54E1\u306B\u300C".concat(categoryName, "\u300D\u306E\u652F\u51FA\u306B\u95A2\u3059\u308B\u8FFD\u52A0\u60C5\u5831\u3092\u63D0\u4F9B\u3059\u308B\u3088\u3046\u306B\u30EA\u30DE\u30A4\u30F3\u30C9\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u3053\u306E\u30D2\u30F3\u30C8\u306F\u7D4C\u8CBB\u306E\u8AAC\u660E\u6B04\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002");
                },
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロのヒント: 短ければ短いほど良い！',
                maxAmount: '最大金額',
                flagAmountsOver: '金額が超過している場合はフラグを立てる',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "\u300C".concat(categoryName, "\u300D\u30AB\u30C6\u30B4\u30EA\u306B\u9069\u7528\u3055\u308C\u307E\u3059\u3002");
                },
                flagAmountsOverSubtitle: 'これはすべての経費の最大金額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリ別に経費金額をフラグします。このルールは、最大経費金額に関する一般的なワークスペースルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費報告書ごとにカテゴリ別の合計支出をフラグ付けします。',
                },
                requireReceiptsOver: 'を超える領収書を必須にする',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " \u30C7\u30D5\u30A9\u30EB\u30C8");
                    },
                    never: '領収書を要求しない',
                    always: '常に領収書を要求する',
                },
                defaultTaxRate: 'デフォルト税率',
                goTo: '移動',
                andEnableWorkflows: 'ワークフローを有効にしてから承認を追加して、この機能を利用できるようにします。',
            },
            customRules: {
                title: 'カスタムルール',
                subtitle: '説明',
                description: '経費報告書のカスタムルールを入力',
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
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "\u3042\u306A\u305F\u306F\u3001\u5E74\u9593\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u304C\u7D42\u4E86\u3059\u308B".concat(annualSubscriptionEndDate, "\u307E\u3067\u3001Control\u30D7\u30E9\u30F3\u306E1\u4EBA\u306E\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u306B\u30B3\u30DF\u30C3\u30C8\u3057\u3066\u3044\u307E\u3059\u3002\u81EA\u52D5\u66F4\u65B0\u3092\u7121\u52B9\u306B\u3059\u308B\u3053\u3068\u3067\u3001").concat(annualSubscriptionEndDate, "\u304B\u3089\u5F93\u91CF\u8AB2\u91D1\u5236\u306E\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306B\u5207\u308A\u66FF\u3048\u3001Collect\u30D7\u30E9\u30F3\u306B\u30C0\u30A6\u30F3\u30B0\u30EC\u30FC\u30C9\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002"),
                    other: "\u3042\u306A\u305F\u306F\u3001\u5E74\u9593\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u304C".concat(annualSubscriptionEndDate, "\u306B\u7D42\u4E86\u3059\u308B\u307E\u3067\u3001Control\u30D7\u30E9\u30F3\u3067").concat(count, "\u4EBA\u306E\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u306B\u30B3\u30DF\u30C3\u30C8\u3057\u3066\u3044\u307E\u3059\u3002\u81EA\u52D5\u66F4\u65B0\u3092\u7121\u52B9\u306B\u3059\u308B\u3053\u3068\u3067\u3001").concat(annualSubscriptionEndDate, "\u304B\u3089\u5F93\u91CF\u8AB2\u91D1\u5236\u306E\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306B\u5207\u308A\u66FF\u3048\u3001Collect\u30D7\u30E9\u30F3\u306B\u30C0\u30A6\u30F3\u30B0\u30EC\u30FC\u30C9\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002"),
                });
            },
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
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, "\u306F\u3059\u3079\u3066\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3067\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u30EB\u30FC\u30E0\u3067\u3059\u3002\u5225\u306E\u540D\u524D\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002");
        },
        roomNameInvalidError: 'ルーム名には小文字のアルファベット、数字、ハイフンのみを使用できます。',
        pleaseEnterRoomName: '部屋の名前を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport ? "".concat(actor, "\u306F\"").concat(oldName, "\"\u304B\u3089\"").concat(newName, "\"\u306B\u540D\u524D\u3092\u5909\u66F4\u3057\u307E\u3057\u305F") : "".concat(actor, "\u304C\u3053\u306E\u30EB\u30FC\u30E0\u306E\u540D\u524D\u3092\"").concat(oldName, "\"\u304B\u3089\"").concat(newName, "\"\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "\u90E8\u5C4B\u306E\u540D\u524D\u304C".concat(newName, "\u306B\u5909\u66F4\u3055\u308C\u307E\u3057\u305F\u3002");
        },
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
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "".concat(field, "\u300C").concat(name, "\u300D\u306E\u627F\u8A8D\u8005\u3068\u3057\u3066").concat(approverName, "\uFF08").concat(approverEmail, "\uFF09\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "".concat(field, "\u300C").concat(name, "\u300D\u306E\u627F\u8A8D\u8005\u3068\u3057\u3066").concat(approverName, "\uFF08").concat(approverEmail, "\uFF09\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "".concat(field, "\u300C").concat(name, "\u300D\u306E\u627F\u8A8D\u8005\u3092").concat(formatApprover(newApproverName, newApproverEmail), "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(formatApprover(oldApproverName, oldApproverEmail), "\uFF09");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "\u30AB\u30C6\u30B4\u30EA\u30FC\u300C".concat(categoryName, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? '無効' : '有効', " \u30AB\u30C6\u30B4\u30EA \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "\u7D66\u4E0E\u30B3\u30FC\u30C9\u300C".concat(newValue, "\u300D\u3092\u30AB\u30C6\u30B4\u30EA\u300C").concat(categoryName, "\u300D\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
            }
            if (!newValue && oldValue) {
                return "\u7D66\u4E0E\u30B3\u30FC\u30C9\u300C".concat(oldValue, "\u300D\u3092\u30AB\u30C6\u30B4\u30EA\u300C").concat(categoryName, "\u300D\u304B\u3089\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
            }
            return "\"".concat(categoryName, "\" \u30AB\u30C6\u30B4\u30EA\u306E\u7D66\u4E0E\u30B3\u30FC\u30C9\u3092\u300C").concat(newValue, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, "\u300D\uFF09\u3002");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u306BGL\u30B3\u30FC\u30C9\u300C").concat(newValue, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
            }
            if (!newValue && oldValue) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u304B\u3089GL\u30B3\u30FC\u30C9\u300C").concat(oldValue, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
            }
            return "\u300C".concat(categoryName, "\u300D\u30AB\u30C6\u30B4\u30EA\u306EGL\u30B3\u30FC\u30C9\u3092\u300C").concat(newValue, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, "\u300D\uFF09");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "\u300C".concat(categoryName, "\u300D\u30AB\u30C6\u30B4\u30EA\u306E\u8AAC\u660E\u3092").concat(!oldValue ? '必須' : '不要', "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(!oldValue ? '不要' : '必須', "\uFF09");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u306B\u6700\u5927\u91D1\u984D").concat(newAmount, "\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
            }
            if (oldAmount && !newAmount) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u304B\u3089\u6700\u5927\u91D1\u984D").concat(oldAmount, "\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
            }
            return "\"".concat(categoryName, "\" \u30AB\u30C6\u30B4\u30EA\u306E\u6700\u5927\u91D1\u984D\u3092 ").concat(newAmount, " \u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F ").concat(oldAmount, "\uFF09");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u306B\u5236\u9650\u30BF\u30A4\u30D7").concat(newValue, "\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
            }
            return "\"".concat(categoryName, "\" \u30AB\u30C6\u30B4\u30EA\u306E\u5236\u9650\u30BF\u30A4\u30D7\u3092 ").concat(newValue, " \u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F ").concat(oldValue, "\uFF09");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u3092\u66F4\u65B0\u3057\u3001Receipts\u3092").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
            }
            return "\u300C".concat(categoryName, "\u300D\u30AB\u30C6\u30B4\u30EA\u3092").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(oldValue, "\uFF09");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(oldName, "\u300D\u306E\u540D\u524D\u3092\u300C").concat(newName, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u304B\u3089\u8AAC\u660E\u30D2\u30F3\u30C8\u300C").concat(oldValue, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
            }
            return !oldValue
                ? "\u30AB\u30C6\u30B4\u30EA\u300C".concat(categoryName, "\u300D\u306B\u8AAC\u660E\u306E\u30D2\u30F3\u30C8\u300C").concat(newValue, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002")
                : "\"".concat(categoryName, "\" \u30AB\u30C6\u30B4\u30EA\u306E\u8AAC\u660E\u30D2\u30F3\u30C8\u3092 \"").concat(newValue, "\" \u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F \"").concat(oldValue, "\"\uFF09");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "\u30BF\u30B0\u30EA\u30B9\u30C8\u540D\u3092\"".concat(newName, "\"\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\"").concat(oldName, "\"\uFF09");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "\u30BF\u30B0\u300C".concat(tagName, "\u300D\u3092\u30EA\u30B9\u30C8\u300C").concat(tagListName, "\u300D\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "\u30BF\u30B0\u30EA\u30B9\u30C8\u300C".concat(tagListName, "\u300D\u3092\u66F4\u65B0\u3057\u3001\u30BF\u30B0\u300C").concat(oldName, "\u300D\u3092\u300C").concat(newName, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? '有効' : '無効', " \u30EA\u30B9\u30C8\u300C").concat(tagListName, "\u300D\u306E\u30BF\u30B0\u300C").concat(tagName, "\u300D");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "\u30EA\u30B9\u30C8\u300C".concat(tagListName, "\u300D\u304B\u3089\u30BF\u30B0\u300C").concat(tagName, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "\u30EA\u30B9\u30C8\u300C".concat(tagListName, "\u300D\u304B\u3089\u300C").concat(count, "\u300D\u30BF\u30B0\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "\u30BF\u30B0\u30EA\u30B9\u30C8\u300C".concat(tagListName, "\u300D\u306E\u30BF\u30B0\u300C").concat(tagName, "\u300D\u3092\u66F4\u65B0\u3057\u3001").concat(updatedField, "\u3092\u300C").concat(oldValue, "\u300D\u304B\u3089\u300C").concat(newValue, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
            }
            return "\u30EA\u30B9\u30C8\u300C".concat(tagListName, "\u300D\u306E\u30BF\u30B0\u300C").concat(tagName, "\u300D\u3092\u66F4\u65B0\u3057\u3001").concat(updatedField, "\u3092\u300C").concat(newValue, "\u300D\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "".concat(customUnitName, "\u306E").concat(updatedField, "\u3092\"").concat(oldValue, "\"\u304B\u3089\"").concat(newValue, "\"\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "\u8DDD\u96E2\u30EC\u30FC\u30C8\u306B\u95A2\u3059\u308B".concat(newValue ? '有効' : '無効', "\u306E\u7A0E\u91D1\u8FFD\u8DE1");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "\u65B0\u3057\u3044\u300C".concat(customUnitName, "\u300D\u30EC\u30FC\u30C8\u300C").concat(rateName, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "".concat(customUnitName, "\u306E").concat(updatedField, "\u300C").concat(customUnitRateName, "\u300D\u306E\u30EC\u30FC\u30C8\u3092\u300C").concat(newValue, "\u300D\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, "\u300D\uFF09\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "\u8DDD\u96E2\u30EC\u30FC\u30C8\u300C".concat(customUnitRateName, "\u300D\u306E\u7A0E\u7387\u3092\u300C").concat(newValue, " (").concat(newTaxPercentage, ")\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, " (").concat(oldTaxPercentage, ")\u300D\uFF09\u3002");
            }
            return "\u8DDD\u96E2\u30EC\u30FC\u30C8\u300C".concat(customUnitRateName, "\u300D\u306B\u7A0E\u7387\u300C").concat(newValue, " (").concat(newTaxPercentage, ")\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "\u8DDD\u96E2\u30EC\u30FC\u30C8\u300C".concat(customUnitRateName, "\u300D\u306E\u7A0E\u9084\u4ED8\u53EF\u80FD\u90E8\u5206\u3092\u300C").concat(newValue, "\u300D\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, "\u300D\uFF09\u3002");
            }
            return "\u8DDD\u96E2\u6599\u91D1\u300C".concat(customUnitRateName, "\u300D\u306B\u7A0E\u9084\u4ED8\u53EF\u80FD\u90E8\u5206\u300C").concat(newValue, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "\"".concat(customUnitName, "\" \u30EC\u30FC\u30C8 \"").concat(rateName, "\" \u3092\u524A\u9664\u3057\u307E\u3057\u305F");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "".concat(fieldType, " \u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9 \"").concat(fieldName, "\" \u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9 \"".concat(fieldName, "\" \u306E\u30C7\u30D5\u30A9\u30EB\u30C8\u5024\u3092 \"").concat(defaultValue, "\" \u306B\u8A2D\u5B9A\u3059\u308B");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u300C".concat(fieldName, "\u300D\u306B\u30AA\u30D7\u30B7\u30E7\u30F3\u300C").concat(optionName, "\u300D\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u300C".concat(fieldName, "\u300D\u304B\u3089\u30AA\u30D7\u30B7\u30E7\u30F3\u300C").concat(optionName, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? '有効' : '無効', " \u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u300C").concat(fieldName, "\u300D\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u300C").concat(optionName, "\u300D");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? '有効' : '無効', " \u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9 \"").concat(fieldName, "\" \u306E\u3059\u3079\u3066\u306E\u30AA\u30D7\u30B7\u30E7\u30F3");
            }
            return "".concat(allEnabled ? '有効' : '無効', " \u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u300C").concat(fieldName, "\u300D\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u300C").concat(optionName, "\u300D\u3001\u3059\u3079\u3066\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u3092").concat(allEnabled ? '有効' : '無効');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "".concat(fieldType, "\u30EC\u30DD\u30FC\u30C8\u30D5\u30A3\u30FC\u30EB\u30C9\u300C").concat(fieldName, "\u300D\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "\"Prevent self-approval\" \u3092 \"".concat(newValue === 'true' ? '有効' : '無効', "\" \u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F \"").concat(oldValue === 'true' ? '有効' : '無効', "\"\uFF09");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "\u6700\u5927\u9818\u53CE\u66F8\u5FC5\u8981\u7D4C\u8CBB\u984D\u3092".concat(oldValue, "\u304B\u3089").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "\u9055\u53CD\u306E\u305F\u3081\u306E\u6700\u5927\u7D4C\u8CBB\u984D\u3092".concat(oldValue, "\u304B\u3089").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "\"\u6700\u5927\u7D4C\u8CBB\u5E74\u9F62\uFF08\u65E5\u6570\uFF09\"\u3092\"".concat(newValue, "\"\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\"\uFF09");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "\u6708\u6B21\u30EC\u30DD\u30FC\u30C8\u306E\u63D0\u51FA\u65E5\u3092\u300C".concat(newValue, "\u300D\u306B\u8A2D\u5B9A\u3059\u308B");
            }
            return "\u6708\u6B21\u5831\u544A\u66F8\u306E\u63D0\u51FA\u65E5\u3092\u300C".concat(newValue, "\u300D\uFF08\u4EE5\u524D\u306F\u300C").concat(oldValue, "\u300D\uFF09\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "\"\u30AF\u30E9\u30A4\u30A2\u30F3\u30C8\u3078\u306E\u7D4C\u8CBB\u518D\u8ACB\u6C42\"\u3092\"".concat(newValue, "\"\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\"").concat(oldValue, "\"\uFF09");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "\"\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u30EC\u30DD\u30FC\u30C8\u30BF\u30A4\u30C8\u30EB\u3092\u5F37\u5236\u3059\u308B\" ".concat(value ? 'on' : 'オフ');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u540D\u524D\u3092\u300C".concat(newName, "\u300D\uFF08\u4EE5\u524D\u306F\u300C").concat(oldName, "\u300D\uFF09\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription ? "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8AAC\u660E\u3092\"".concat(newDescription, "\"\u306B\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002") : "\u3053\u306E\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8AAC\u660E\u3092\"".concat(oldDescription, "\"\u304B\u3089\"").concat(newDescription, "\"\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('と');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "".concat(joinedNames, "\u306E\u627F\u8A8D\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3068\u7D4C\u8CBB\u30C1\u30E3\u30C3\u30C8\u304B\u3089\u3042\u306A\u305F\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002\u4EE5\u524D\u306B\u63D0\u51FA\u3055\u308C\u305F\u30EC\u30DD\u30FC\u30C8\u306F\u3001\u5F15\u304D\u7D9A\u304D\u53D7\u4FE1\u30C8\u30EC\u30A4\u3067\u627F\u8A8D\u53EF\u80FD\u3067\u3059\u3002"),
                other: "".concat(joinedNames, "\u306E\u627F\u8A8D\u30EF\u30FC\u30AF\u30D5\u30ED\u30FC\u3068\u7D4C\u8CBB\u30C1\u30E3\u30C3\u30C8\u304B\u3089\u3042\u306A\u305F\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002\u4EE5\u524D\u306B\u63D0\u51FA\u3055\u308C\u305F\u30EC\u30DD\u30FC\u30C8\u306F\u3001\u5F15\u304D\u7D9A\u304D\u3042\u306A\u305F\u306E\u53D7\u4FE1\u30C8\u30EC\u30A4\u3067\u627F\u8A8D\u53EF\u80FD\u3067\u3059\u3002"),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "".concat(policyName, "\u3067\u306E\u3042\u306A\u305F\u306E\u5F79\u5272\u304C").concat(oldRole, "\u304B\u3089\u30E6\u30FC\u30B6\u30FC\u306B\u66F4\u65B0\u3055\u308C\u307E\u3057\u305F\u3002\u3042\u306A\u305F\u81EA\u8EAB\u306E\u3082\u306E\u3092\u9664\u304F\u3059\u3079\u3066\u306E\u63D0\u51FA\u8005\u306E\u7D4C\u8CBB\u30C1\u30E3\u30C3\u30C8\u304B\u3089\u524A\u9664\u3055\u308C\u307E\u3057\u305F\u3002");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "\u30C7\u30D5\u30A9\u30EB\u30C8\u901A\u8CA8\u3092".concat(newCurrency, "\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(oldCurrency, "\uFF09");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "\u81EA\u52D5\u30EC\u30DD\u30FC\u30C8\u306E\u983B\u5EA6\u3092\u300C".concat(newFrequency, "\u300D\uFF08\u4EE5\u524D\u306F\u300C").concat(oldFrequency, "\u300D\uFF09\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "\u627F\u8A8D\u30E2\u30FC\u30C9\u3092\"".concat(oldValue, "\"\u304B\u3089\"").concat(newValue, "\"\u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\u3002");
        },
        upgradedWorkspace: 'このワークスペースをコントロールプランにアップグレードしました',
        downgradedWorkspace: 'このワークスペースをCollectプランにダウングレードしました。',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "\u30EC\u30DD\u30FC\u30C8\u304C\u624B\u52D5\u627F\u8A8D\u306E\u305F\u3081\u306B\u30E9\u30F3\u30C0\u30E0\u306B\u30EB\u30FC\u30C6\u30A3\u30F3\u30B0\u3055\u308C\u308B\u5272\u5408\u3092".concat(Math.round(newAuditRate * 100), "%\uFF08\u4EE5\u524D\u306F").concat(Math.round(oldAuditRate * 100), "%\uFF09\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "\u3059\u3079\u3066\u306E\u7D4C\u8CBB\u306E\u624B\u52D5\u627F\u8A8D\u9650\u5EA6\u984D\u3092".concat(newLimit, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F").concat(oldLimit, "\uFF09");
        },
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: "\u3053\u306E\u30DA\u30FC\u30B8\u306B\u30A2\u30AF\u30BB\u30B9\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u3053\u306E\u30EB\u30FC\u30E0\u306B\u53C2\u52A0\u3057\u3088\u3046\u3068\u3057\u3066\u3044\u308B\u5834\u5408\u306F\u3001\u30EB\u30FC\u30E0\u30E1\u30F3\u30D0\u30FC\u306B\u8FFD\u52A0\u3057\u3066\u3082\u3089\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u4ED6\u306B\u4F55\u304B\u304A\u56F0\u308A\u3067\u3059\u304B\uFF1F".concat(CONST_1.default.EMAIL.CONCIERGE, "\u306B\u304A\u554F\u3044\u5408\u308F\u305B\u304F\u3060\u3055\u3044\u3002"),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "\u3053\u306E\u30EB\u30FC\u30E0\u304B\u3089".concat(memberName, "\u3092\u524A\u9664\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F"),
                other: '選択したメンバーをルームから削除してもよろしいですか？',
            });
        },
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
            created: function (_a) {
                var title = _a.title;
                return "".concat(title, "\u306E\u30BF\u30B9\u30AF");
            },
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
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "".concat(monthName, " ").concat(year, " \u660E\u7D30\u66F8");
        },
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
                subtitle: '検索条件を調整するか、緑色の+ボタンで何かを作成してみてください。',
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
                title: 'まだ請求書を作成していません。',
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
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費ゼロ。最大限のリラックス。よくやった！',
            },
        },
        unapproved: '未承認',
        unapprovedCash: '未承認現金',
        unapprovedCompanyCards: '未承認の社用カード',
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
            noOptionsAvailable: '選択した経費グループには利用可能なオプションがありません。',
        },
        filtersHeader: 'フィルター',
        filters: {
            date: {
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "".concat(date !== null && date !== void 0 ? date : '', "\u306E\u524D\u306B");
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
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = '未承認',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = '先月',
                    _7),
            },
            status: 'ステータス',
            keyword: 'キーワード',
            hasKeywords: 'キーワードがあります',
            currency: '通貨',
            link: 'リンク',
            pinned: '固定済み',
            unread: '未読',
            completed: '完了しました',
            amount: {
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "".concat(amount !== null && amount !== void 0 ? amount : '', "\u672A\u6E80");
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "".concat(amount !== null && amount !== void 0 ? amount : '', " \u3088\u308A\u5927\u304D\u3044");
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "".concat(greaterThan, " \u3068 ").concat(lessThan, " \u306E\u9593");
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個別カード',
                closedCards: 'クローズドカード',
                cardFeeds: 'カードフィード',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "\u3059\u3079\u3066\u306E".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "\u3059\u3079\u3066\u306ECSV\u30A4\u30F3\u30DD\u30FC\u30C8\u30AB\u30FC\u30C9".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
            },
            current: '現在',
            past: '過去',
            submitted: '提出日',
            approved: '承認日付',
            paid: '支払日',
            exported: 'エクスポートされた日付',
            posted: '投稿日',
            billable: 'ビラブル',
            reimbursable: '払い戻し可能',
            groupBy: {
                reports: '報告',
                members: 'メンバー',
                cards: 'カード',
            },
        },
        groupBy: 'グループ',
        moneyRequestReport: {
            emptyStateTitle: 'このレポートには経費がありません。',
            emptyStateSubtitle: 'このレポートに経費を追加するには、上のボタンを使用してください。',
        },
        noCategory: 'カテゴリなし',
        noTag: 'タグなし',
        expenseType: '経費タイプ',
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
            qrMessage: '写真やダウンロードフォルダにQRコードのコピーがないか確認してください。プロのヒント: プレゼンテーションに追加して、聴衆がスキャンして直接あなたとつながることができるようにしましょう。',
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
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "\u65B0\u3057\u3044\u30D0\u30FC\u30B8\u30E7\u30F3\u306F\u307E\u3082\u306A\u304F\u5229\u7528\u53EF\u80FD\u306B\u306A\u308A\u307E\u3059\u3002".concat(!isSilentUpdating ? '更新の準備が整いましたらお知らせします。' : '');
            },
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
    report: {
        newReport: {
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポートのワークスペースを選択してください。',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportFieldFailureMessage: 'フィールドの更新中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポートの名前変更中に予期しないエラーが発生しました。後でもう一度お試しください。',
        noActivityYet: 'まだ活動がありません',
        actions: {
            type: {
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "".concat(fieldName, "\u3092").concat(oldValue, "\u304B\u3089").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F");
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "".concat(fieldName, "\u3092").concat(newValue, "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F");
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092".concat(toPolicyName).concat(fromPolicyName ? "\uFF08\u4EE5\u524D\u306F".concat(fromPolicyName, "\uFF09") : '', "\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\u3002");
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "".concat(oldType, " \u304B\u3089 ").concat(newType, " \u306B\u30BF\u30A4\u30D7\u3092\u5909\u66F4\u3057\u307E\u3057\u305F");
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "".concat(originalManager, "\u304C\u4F11\u6687\u4E2D\u306E\u305F\u3081\u3001\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u3092").concat(delegateUser, "\u306B\u9001\u4FE1\u3057\u307E\u3057\u305F\u3002");
                },
                exportedToCSV: "CSV\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u307E\u3057\u305F",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "".concat(label, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u307E\u3057\u305F");
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "".concat(label, " \u7D4C\u7531\u3067\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3055\u308C\u307E\u3057\u305F");
                    },
                    automaticActionTwo: '会計設定',
                    manual: function (_a) {
                        var label = _a.label;
                        return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u3092\u624B\u52D5\u3067".concat(label, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u6E08\u307F\u3068\u3057\u3066\u30DE\u30FC\u30AF\u3057\u307E\u3057\u305F\u3002");
                    },
                    automaticActionThree: '正常にレコードを作成しました',
                    reimburseableLink: '自己負担費用',
                    nonReimbursableLink: '会社カード経費',
                    pending: function (_a) {
                        var label = _a.label;
                        return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u306E\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3092".concat(label, "\u306B\u958B\u59CB\u3057\u307E\u3057\u305F...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "\u3053\u306E\u30EC\u30DD\u30FC\u30C8\u3092".concat(label, "\u306B\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\uFF08\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\"\uFF09");
                },
                managerAttachReceipt: "\u9818\u53CE\u66F8\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F",
                managerDetachReceipt: "\u9818\u53CE\u66F8\u3092\u524A\u9664\u3057\u307E\u3057\u305F",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "\u4ED6\u306E\u5834\u6240\u3067".concat(currency).concat(amount, "\u3092\u652F\u6255\u3044\u307E\u3057\u305F\u3002");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "".concat(currency).concat(amount, " \u3092\u7D71\u5408\u7D4C\u7531\u3067\u652F\u6255\u3044\u307E\u3057\u305F");
                },
                outdatedBankAccount: "\u652F\u6255\u8005\u306E\u9280\u884C\u53E3\u5EA7\u306B\u554F\u984C\u304C\u3042\u308B\u305F\u3081\u3001\u652F\u6255\u3044\u3092\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
                reimbursementACHBounce: "\u652F\u6255\u8005\u306B\u5341\u5206\u306A\u8CC7\u91D1\u304C\u306A\u3044\u305F\u3081\u3001\u652F\u6255\u3044\u3092\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
                reimbursementACHCancelled: "\u652F\u6255\u3044\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F",
                reimbursementAccountChanged: "\u652F\u6255\u3044\u3092\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u652F\u6255\u8005\u304C\u9280\u884C\u53E3\u5EA7\u3092\u5909\u66F4\u3057\u305F\u305F\u3081\u3067\u3059\u3002",
                reimbursementDelayed: "\u652F\u6255\u3044\u306F\u51E6\u7406\u3055\u308C\u307E\u3057\u305F\u304C\u3001\u3055\u3089\u306B1\uFF5E2\u55B6\u696D\u65E5\u9045\u308C\u307E\u3059\u3002",
                selectedForRandomAudit: "\u30EC\u30D3\u30E5\u30FC\u306E\u305F\u3081\u306B\u30E9\u30F3\u30C0\u30E0\u306B\u9078\u3070\u308C\u307E\u3057\u305F",
                selectedForRandomAuditMarkdown: "[\u30E9\u30F3\u30C0\u30E0\u306B\u9078\u629E\u3055\u308C\u305F](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)\u30EC\u30D3\u30E5\u30FC\u7528",
                share: function (_a) {
                    var to = _a.to;
                    return "\u62DB\u5F85\u3055\u308C\u305F\u30E1\u30F3\u30D0\u30FC".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "\u524A\u9664\u3055\u308C\u305F\u30E1\u30F3\u30D0\u30FC".concat(to);
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "".concat(currency).concat(amount, " \u3092\u652F\u6255\u3044\u307E\u3057\u305F");
                },
                takeControl: "\u5236\u5FA1\u3092\u53D6\u308A\u307E\u3057\u305F",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "".concat(label, "\u3068\u306E\u540C\u671F\u4E2D\u306B\u554F\u984C\u304C\u767A\u751F\u3057\u307E\u3057\u305F").concat(errorMessage ? "\uFF08\"".concat(errorMessage, "\"\uFF09") : '', "\u3002<a href=\"").concat(workspaceAccountingLink, "\">\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u306E\u8A2D\u5B9A</a>\u3067\u554F\u984C\u3092\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "".concat(email, "\u3092").concat(role === 'member' ? 'a' : 'an', " ").concat(role, "\u3068\u3057\u3066\u8FFD\u52A0\u3057\u307E\u3057\u305F");
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "".concat(email, " \u306E\u5F79\u5272\u3092 ").concat(newRole, " \u306B\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F ").concat(currentRole, "\uFF09");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "".concat(email, "\u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C91\u3092\u524A\u9664\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(previousValue, "\u300D\uFF09");
                    }
                    return !previousValue
                        ? "\"".concat(newValue, "\" \u3092 ").concat(email, " \u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C91\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002")
                        : "".concat(email, " \u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C91\u3092 \"").concat(newValue, "\" \u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F \"").concat(previousValue, "\"\uFF09");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "".concat(email, "\u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C92\u3092\u524A\u9664\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\u300C").concat(previousValue, "\u300D\uFF09");
                    }
                    return !previousValue
                        ? "\"".concat(newValue, "\" \u3092 ").concat(email, " \u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C92\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F\u3002")
                        : "".concat(email, "\u306E\u30AB\u30B9\u30BF\u30E0\u30D5\u30A3\u30FC\u30EB\u30C92\u3092\"").concat(newValue, "\"\u306B\u5909\u66F4\u3057\u307E\u3057\u305F\uFF08\u4EE5\u524D\u306F\"").concat(previousValue, "\"\uFF09");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " \u304C\u30EF\u30FC\u30AF\u30B9\u30DA\u30FC\u30B9\u3092\u9000\u51FA\u3057\u307E\u3057\u305F");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "".concat(role, " ").concat(email, " \u3092\u524A\u9664\u3057\u307E\u3057\u305F");
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " \u3078\u306E\u63A5\u7D9A\u3092\u524A\u9664\u3057\u307E\u3057\u305F\u3002");
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], "\u306B\u63A5\u7D9A\u3057\u307E\u3057\u305F");
                },
                leftTheChat: 'チャットを退出しました',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " \u306F ").concat(date, " \u307E\u3067\u306E ").concat(dayCount, " \u65E5\u9593\u306E ").concat(dayCount === 1 ? '日' : '日', " \u3067\u3059\u3002");
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(date, "\u306E").concat(timePeriod, "\u304B\u3089\u306E").concat(summary);
        },
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
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
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
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "From ".concat(reportName).concat(workspaceName ? "".concat(workspaceName, "\u5185") : '');
        },
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
        invite: '招待する',
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
        schoolPrincipalVerifyExpense: 'Expensify.orgは、低所得世帯の学生がより良い学習体験を得られるように、必需品の学用品の費用を分担します。あなたの校長があなたの経費を確認するよう求められます。',
        principalFirstName: '名',
        principalLastName: '姓',
        principalWorkEmail: '主要な勤務先のメールアドレス',
        updateYourEmail: 'メールアドレスを更新してください',
        updateEmail: 'メールアドレスを更新する',
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "\u5148\u306B\u9032\u3080\u524D\u306B\u3001\u5B66\u6821\u306E\u30E1\u30FC\u30EB\u3092\u30C7\u30D5\u30A9\u30EB\u30C8\u306E\u9023\u7D61\u65B9\u6CD5\u3068\u3057\u3066\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u8A2D\u5B9A > \u30D7\u30ED\u30D5\u30A3\u30FC\u30EB > <a href=\"".concat(contactMethodsRoute, "\">\u9023\u7D61\u65B9\u6CD5</a> \u3067\u884C\u3046\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002");
        },
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
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'チャットを開始する',
            buttonText2: '友達を紹介する。',
            header: 'チャットを開始し、友達を紹介する',
            body: '友達にもExpensifyを使ってほしいですか？ 彼らとチャットを始めるだけで、あとは私たちにお任せください。',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: '経費を提出する',
            buttonText2: 'あなたの上司を紹介してください。',
            header: '経費を提出し、上司に紹介する',
            body: 'あなたの上司にもExpensifyを使ってもらいたいですか？経費を提出するだけで、あとは私たちにお任せください。',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: '友達を紹介する',
            body: 'Expensifyを友達にも使ってもらいたいですか？彼らとチャットしたり、支払ったり、経費を分割したりするだけで、あとは私たちにお任せください。または、招待リンクを共有するだけでもOKです！',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: '友達を紹介する',
            header: '友達を紹介する',
            body: 'Expensifyを友達にも使ってもらいたいですか？彼らとチャットしたり、支払ったり、経費を分割したりするだけで、あとは私たちにお任せください。または、招待リンクを共有するだけでもOKです！',
        },
        _8.copyReferralLink = '招待リンクをコピー',
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'セットアップスペシャリストとチャットする',
            phrase2: 'ヘルプが必要な場合',
        },
        _9.default = {
            phrase1: 'メッセージ',
            phrase2: 'セットアップのヘルプについて',
        },
        _9),
    violations: {
        allTagLevelsRequired: 'すべてのタグが必要です。',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, "\u306F\u3053\u306E\u7D4C\u8CBB\u3092\u5374\u4E0B\u3057\u307E\u3057\u305F\u3002\u30B3\u30E1\u30F3\u30C8: \"").concat(rejectReason, "\"");
        },
        billableExpense: '課金対象は無効になりました',
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Receipt required".concat(formattedLimit ? "".concat(formattedLimit, " \u3092\u8D85\u3048\u308B") : '');
        },
        categoryOutOfPolicy: 'カテゴリが無効になりました。',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "".concat(surcharge, "% \u306E\u70BA\u66FF\u624B\u6570\u6599\u304C\u9069\u7528\u3055\u308C\u307E\u3057\u305F\u3002");
        },
        customUnitOutOfPolicy: 'このワークスペースでは有効なレートではありません。',
        duplicatedTransaction: 'Duplicate',
        fieldRequired: 'レポートフィールドは必須です',
        futureDate: '未来の日付は許可されていません',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "".concat(invoiceMarkup, "% \u4E0A\u4E57\u305B\u3055\u308C\u307E\u3057\u305F");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "".concat(maxAge, "\u65E5\u3088\u308A\u53E4\u3044\u65E5\u4ED8");
        },
        missingCategory: 'カテゴリがありません',
        missingComment: '選択したカテゴリーの説明が必要です。',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return '金額が計算された距離と異なります';
                case 'card':
                    return 'カード取引を超える金額';
                default:
                    if (displayPercentVariance) {
                        return "\u30B9\u30AD\u30E3\u30F3\u3055\u308C\u305F\u9818\u53CE\u66F8\u3088\u308A\u3082".concat(displayPercentVariance, "%\u591A\u3044\u91D1\u984D");
                    }
                    return 'スキャンされた領収書よりも金額が多い';
            }
        },
        modifiedDate: '日付がスキャンされた領収書と異なります',
        nonExpensiworksExpense: '非Expensiworks経費',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "\u7D4C\u8CBB\u304C\u81EA\u52D5\u627F\u8A8D\u9650\u5EA6\u984D\u306E".concat(formattedLimit, "\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002");
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "".concat(formattedLimit, "/\u4EBA\u306E\u30AB\u30C6\u30B4\u30EA\u5236\u9650\u3092\u8D85\u3048\u308B\u91D1\u984D");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "".concat(formattedLimit, "/\u4EBA\u306E\u5236\u9650\u3092\u8D85\u3048\u305F\u91D1\u984D");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "".concat(formattedLimit, "/\u4EBA\u306E\u5236\u9650\u3092\u8D85\u3048\u305F\u91D1\u984D");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "1\u65E5\u3042\u305F\u308A\u306E\u30AB\u30C6\u30B4\u30EA\u5236\u9650".concat(formattedLimit, "/\u4EBA\u3092\u8D85\u3048\u308B\u91D1\u984D");
        },
        receiptNotSmartScanned: '経費の詳細と領収書が手動で追加されました。詳細を確認してください。すべての領収書の自動監査について<a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">詳細を学ぶ</a>。',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = '領収書が必要です';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += '終了';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'カテゴリ制限';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = '禁止された経費:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " \u30A2\u30EB\u30B3\u30FC\u30EB");
                case 'gambling':
                    return "".concat(preMessage, " \u30AE\u30E3\u30F3\u30D6\u30EB");
                case 'tobacco':
                    return "".concat(preMessage, " \u30BF\u30D0\u30B3");
                case 'adultEntertainment':
                    return "".concat(preMessage, " \u30A2\u30C0\u30EB\u30C8\u30A8\u30F3\u30BF\u30FC\u30C6\u30A4\u30F3\u30E1\u30F3\u30C8");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " \u30DB\u30C6\u30EB\u96D1\u8CBB");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'レビューが必要です',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行接続が切れているため、領収書を自動照合できません。';
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "".concat(email, "\u304C\u4FEE\u6B63\u3059\u308B\u5FC5\u8981\u304C\u3042\u308B\u9280\u884C\u63A5\u7D9A\u306E\u554F\u984C\u306E\u305F\u3081\u3001\u9818\u53CE\u66F8\u3092\u81EA\u52D5\u30DE\u30C3\u30C1\u30F3\u30B0\u3067\u304D\u307E\u305B\u3093\u3002")
                    : '壊れた銀行接続のため、領収書を自動マッチングできません。修正が必要です。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? "".concat(member, "\u306B\u73FE\u91D1\u3068\u3057\u3066\u30DE\u30FC\u30AF\u3059\u308B\u3088\u3046\u306B\u4F9D\u983C\u3059\u308B\u304B\u30017\u65E5\u9593\u5F85\u3063\u3066\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002") : 'カード取引とのマージを待機中。';
            }
            return '';
        },
        brokenConnection530Error: '銀行接続の不具合により領収書が保留中です。',
        adminBrokenConnectionError: '銀行接続の不具合により領収書が保留されています。で解決してください。',
        memberBrokenConnectionError: '銀行接続が壊れているため、領収書が保留中です。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いをリクエストします。',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "\u9818\u53CE\u66F8\u306E\u30B9\u30AD\u30E3\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002".concat(canEdit ? '詳細を手動で入力してください。' : '');
        },
        receiptGeneratedWithAI: 'AI生成の領収書の可能性',
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'タグ');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'タグ', " \u306F\u7121\u52B9\u306B\u306A\u308A\u307E\u3057\u305F");
        },
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : '税金', " \u306F\u7121\u52B9\u306B\u306A\u308A\u307E\u3057\u305F");
        },
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
        confirmDetails: "\u4FDD\u6301\u3057\u3066\u3044\u308B\u8A73\u7D30\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
        confirmDuplicatesInfo: "\u4FDD\u6301\u3057\u306A\u3044\u91CD\u8907\u30EA\u30AF\u30A8\u30B9\u30C8\u306F\u3001\u30E1\u30F3\u30D0\u30FC\u304C\u524A\u9664\u3059\u308B\u305F\u3081\u306B\u4FDD\u6301\u3055\u308C\u307E\u3059\u3002",
        hold: 'この経費は保留されました',
        resolvedDuplicates: '重複を解決しました',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "".concat(fieldName, "\u306F\u5FC5\u9808\u3067\u3059");
        },
        _10),
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
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Expensify Classicでのみ利用可能な機能が必要です。',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'New Expensifyの使い方がわかりません。',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'New Expensifyの使い方は理解していますが、Expensify Classicの方が好きです。',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'New Expensifyにないどの機能が必要ですか？',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = '何をしようとしているのですか？',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'なぜExpensify Classicを好むのですか？',
            _12),
        responsePlaceholder: 'あなたの返信',
        thankYou: 'フィードバックありがとうございます！',
        thankYouSubtitle: 'あなたの回答は、私たちがより良い製品を作り、物事を成し遂げるのに役立ちます。ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classicに切り替える',
        offlineTitle: 'ここで行き詰まっているようです…',
        offline: 'オフラインのようです。残念ながら、Expensify Classicはオフラインでは動作しませんが、新しいExpensifyは動作します。Expensify Classicを使用したい場合は、インターネット接続があるときに再試行してください。',
        quickTip: 'ちょっとしたヒント...',
        quickTipSubTitle: 'expensify.comにアクセスして、Expensify Classicに直接移動できます。簡単なショートカットとしてブックマークしてください！',
        bookACall: '通話を予約する',
        noThanks: '結構です',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = '経費やレポートで直接チャットする',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'モバイルで全てを行う能力',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'チャットのスピードで出張と経費を管理',
            _13),
        bookACallTextTop: 'Expensify Classicに切り替えると、次のことを逃すことになります：',
        bookACallTextBottom: 'なぜかを理解するために、あなたとお電話でお話しできることを楽しみにしています。ご要望について話し合うために、私たちのシニアプロダクトマネージャーの一人との通話を予約できます。',
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
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "\u7121\u6599\u30C8\u30E9\u30A4\u30A2\u30EB: \u6B8B\u308A".concat(numOfDays, " ").concat(numOfDays === 1 ? '日' : '日');
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "\u3059\u3079\u3066\u306E\u304A\u6C17\u306B\u5165\u308A\u306E\u6A5F\u80FD\u3092\u5F15\u304D\u7D9A\u304D\u4F7F\u7528\u3059\u308B\u305F\u3081\u306B\u3001".concat(date, "\u307E\u3067\u306B\u304A\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u66F4\u65B0\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: 'お支払いを処理できませんでした。',
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "".concat(date, "\u306E").concat(purchaseAmountOwed, "\u306E\u8ACB\u6C42\u3092\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u672A\u6255\u3044\u91D1\u984D\u3092\u6E05\u7B97\u3059\u308B\u305F\u3081\u306B\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002")
                        : '支払いカードを追加して、未払い金額を清算してください。';
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "\u304A\u652F\u6255\u3044\u304C\u671F\u9650\u3092\u904E\u304E\u3066\u3044\u307E\u3059\u3002\u30B5\u30FC\u30D3\u30B9\u306E\u4E2D\u65AD\u3092\u907F\u3051\u308B\u305F\u3081\u306B\u3001".concat(date, "\u307E\u3067\u306B\u8ACB\u6C42\u66F8\u3092\u304A\u652F\u6255\u3044\u304F\u3060\u3055\u3044\u3002");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払いが期限を過ぎています。請求書をお支払いください。',
            },
            billingDisputePending: {
                title: 'カードを請求できませんでした。',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "\u3042\u306A\u305F\u306F\u3001".concat(cardEnding, "\u3067\u7D42\u308F\u308B\u30AB\u30FC\u30C9\u306E").concat(amountOwed, "\u306E\u8ACB\u6C42\u3092\u7570\u8B70\u7533\u3057\u7ACB\u3066\u3057\u307E\u3057\u305F\u3002\u7570\u8B70\u304C\u9280\u884C\u3067\u89E3\u6C7A\u3055\u308C\u308B\u307E\u3067\u3001\u3042\u306A\u305F\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306F\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3059\u3002");
                },
            },
            cardAuthenticationRequired: {
                title: 'カードを請求できませんでした。',
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "\u304A\u652F\u6255\u3044\u30AB\u30FC\u30C9\u304C\u5B8C\u5168\u306B\u8A8D\u8A3C\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002".concat(cardEnding, "\u3067\u7D42\u308F\u308B\u304A\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3059\u308B\u305F\u3081\u306B\u3001\u8A8D\u8A3C\u30D7\u30ED\u30BB\u30B9\u3092\u5B8C\u4E86\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
            },
            insufficientFunds: {
                title: 'カードを請求できませんでした。',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "\u304A\u652F\u6255\u3044\u30AB\u30FC\u30C9\u306F\u6B8B\u9AD8\u4E0D\u8DB3\u306E\u305F\u3081\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\u3002\u518D\u8A66\u884C\u3059\u308B\u304B\u3001\u65B0\u3057\u3044\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u3066\u3001\u672A\u6255\u3044\u6B8B\u9AD8".concat(amountOwed, "\u3092\u30AF\u30EA\u30A2\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
            },
            cardExpired: {
                title: 'カードを請求できませんでした。',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "\u304A\u652F\u6255\u3044\u30AB\u30FC\u30C9\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u65B0\u3057\u3044\u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u3066\u3001\u672A\u6255\u3044\u6B8B\u9AD8\u306E".concat(amountOwed, "\u3092\u6E05\u7B97\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                },
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
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "\u3042\u306A\u305F\u306F\u3001".concat(cardEnding, "\u3067\u7D42\u308F\u308B\u30AB\u30FC\u30C9\u306E").concat(amountOwed, "\u306E\u8ACB\u6C42\u3092\u7570\u8B70\u7533\u3057\u7ACB\u3066\u3057\u307E\u3057\u305F\u3002\u7570\u8B70\u304C\u9280\u884C\u3067\u89E3\u6C7A\u3055\u308C\u308B\u307E\u3067\u3001\u3042\u306A\u305F\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306F\u30ED\u30C3\u30AF\u3055\u308C\u307E\u3059\u3002");
            },
            preTrial: {
                title: '無料トライアルを開始',
                subtitleStart: '次のステップとして、',
                subtitleLink: 'セットアップチェックリストを完了する',
                subtitleEnd: 'あなたのチームが経費精算を始められるように。',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "\u30C8\u30E9\u30A4\u30A2\u30EB: ".concat(numOfDays, " ").concat(numOfDays === 1 ? '日' : '日', " \u65E5\u6B8B\u308A\uFF01");
                },
                subtitle: 'お気に入りの機能を引き続き利用するために、支払いカードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルが終了しました',
                subtitle: 'お気に入りの機能を引き続き利用するために、支払いカードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: 'オファーを請求する',
                noThanks: '結構です',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>\u6700\u521D\u306E1\u5E74\u9593\u306F".concat(discountType, "%\u30AA\u30D5\uFF01</strong> \u652F\u6255\u3044\u30AB\u30FC\u30C9\u3092\u8FFD\u52A0\u3057\u3066\u3001\u5E74\u9593\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u3092\u958B\u59CB\u3059\u308B\u3060\u3051\u3067\u3059\u3002");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "\u671F\u9593\u9650\u5B9A\u30AA\u30D5\u30A1\u30FC: \u6700\u521D\u306E1\u5E74\u9593\u306F".concat(discountType, "%\u30AA\u30D5\uFF01");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "".concat(hours, "\u6642\u9593 ").concat(minutes, "\u5206 ").concat(seconds, "\u79D2\u4EE5\u5185\u306B").concat(days > 0 ? "".concat(days, "\u65E5 :") : '', "\u3092\u8ACB\u6C42\u3057\u3066\u304F\u3060\u3055\u3044");
                },
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensifyのサブスクリプションを支払うためのカードを追加してください。',
            addCardButton: '支払いカードを追加',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "\u6B21\u56DE\u306E\u652F\u6255\u65E5\u306F".concat(nextPaymentDate, "\u3067\u3059\u3002");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "".concat(cardNumber, "\u3067\u7D42\u308F\u308B\u30AB\u30FC\u30C9");
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "\u540D\u524D: ".concat(name, "\u3001\u6709\u52B9\u671F\u9650: ").concat(expiration, "\u3001\u901A\u8CA8: ").concat(currency);
            },
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
            asLowAs: function (_a) {
                var price = _a.price;
                return "\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC1\u4EBA\u3042\u305F\u308A\u6708\u984D".concat(price, "\u304B\u3089");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "\u30E1\u30F3\u30D0\u30FC1\u4EBA\u3042\u305F\u308A\u6708".concat(price);
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "\u30E1\u30F3\u30D0\u30FC1\u4EBA\u3042\u305F\u308A\u6708".concat(price);
            },
            perMemberMonth: 'メンバーごと/月',
            collect: {
                title: '収集する',
                description: '経費、旅行、チャットを提供する小規模ビジネスプラン。',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "".concat(lower, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u3064\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u304B\u3089\u3001").concat(upper, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u305F\u306A\u3044\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u307E\u3067\u3002");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "".concat(lower, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u3064\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u304B\u3089\u3001").concat(upper, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u305F\u306A\u3044\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u307E\u3067\u3002");
                },
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
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "".concat(lower, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u3064\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u304B\u3089\u3001").concat(upper, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u305F\u306A\u3044\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u307E\u3067\u3002");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "".concat(lower, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u3064\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u304B\u3089\u3001").concat(upper, "/Expensify\u30AB\u30FC\u30C9\u3092\u6301\u305F\u306A\u3044\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u307E\u3067\u3002");
                },
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
            unlockTheFeatures: 'あなたに合ったプランで必要な機能をアンロックしましょう。',
            viewOurPricing: '料金ページをご覧ください',
            forACompleteFeatureBreakdown: '各プランの機能の詳細な内訳については、こちらをご覧ください。',
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年間サブスクリプション',
            taxExempt: '税免除ステータスを申請する',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '免税ステータス',
            payPerUse: '従量課金',
            subscriptionSize: 'サブスクリプションサイズ',
            headsUp: '注意: 今すぐサブスクリプションサイズを設定しない場合、初月のアクティブメンバー数に自動的に設定されます。その後、次の12ヶ月間は少なくともこのメンバー数分の料金を支払うことになります。サブスクリプションサイズはいつでも増やすことができますが、サブスクリプションが終了するまで減らすことはできません。',
            zeroCommitment: '割引された年間サブスクリプション料金でのゼロコミットメント',
        },
        subscriptionSize: {
            title: 'サブスクリプションサイズ',
            yourSize: 'ご利用のサブスクリプションサイズは、特定の月にアクティブなメンバーによって埋められる空席の数です。',
            eachMonth: '毎月、あなたのサブスクリプションは上記で設定されたアクティブメンバー数までをカバーします。サブスクリプションのサイズを増やすたびに、その新しいサイズで新たに12ヶ月のサブスクリプションが開始されます。',
            note: '注: アクティブメンバーとは、会社のワークスペースに関連付けられた経費データを作成、編集、提出、承認、払い戻し、またはエクスポートした人を指します。',
            confirmDetails: '新しい年間サブスクリプションの詳細を確認してください:',
            subscriptionSize: 'サブスクリプションサイズ',
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " \u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC/\u6708");
            },
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年間サブスクリプション中はダウングレードできません。',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "\u3042\u306A\u305F\u306F\u3059\u3067\u306B\u3001".concat(date, "\u307E\u3067\u6BCE\u6708").concat(size, "\u306E\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC\u306E\u5E74\u9593\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u30B5\u30A4\u30BA\u306B\u30B3\u30DF\u30C3\u30C8\u3057\u3066\u3044\u307E\u3059\u3002\u81EA\u52D5\u66F4\u65B0\u3092\u7121\u52B9\u306B\u3059\u308B\u3053\u3068\u3067\u3001").concat(date, "\u306B\u5F93\u91CF\u8AB2\u91D1\u5236\u306E\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u306B\u5207\u308A\u66FF\u3048\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002");
            },
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
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u30BF\u30A4\u30D7: ".concat(subscriptionType, ", \u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u30B5\u30A4\u30BA: ").concat(subscriptionSize, ", \u81EA\u52D5\u66F4\u65B0: ").concat(autoRenew, ", \u5E74\u9593\u30B7\u30FC\u30C8\u306E\u81EA\u52D5\u5897\u52A0: ").concat(autoIncrease);
            },
            none: 'none',
            on: 'on',
            off: 'オフ',
            annual: '年次',
            autoRenew: '自動更新',
            autoIncrease: '年間シートの自動増加',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "\u30A2\u30AF\u30C6\u30A3\u30D6\u30E1\u30F3\u30D0\u30FC1\u4EBA\u3042\u305F\u308A\u3001\u6700\u5927".concat(amountWithCurrency, "/\u6708\u3092\u7BC0\u7D04");
            },
            automaticallyIncrease: 'アクティブメンバーがサブスクリプションのサイズを超えた場合、年間シート数を自動的に増やします。注：これにより、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensifyの改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由は何ですか？',
            renewsOn: function (_a) {
                var date = _a.date;
                return "".concat(date, "\u306B\u66F4\u65B0\u3055\u308C\u307E\u3059\u3002");
            },
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
                preventFutureActivity: {
                    part1: '今後のアクティビティと請求を防ぎたい場合は、',
                    link: 'ワークスペースを削除する',
                    part2: 'ワークスペースを削除すると、現在のカレンダー月に発生した未払いの活動に対して請求されることに注意してください。',
                },
            },
            requestSubmitted: {
                title: 'リクエストが送信されました',
                subtitle: {
                    part1: 'ご購読のキャンセルにご興味をお持ちいただきありがとうございます。リクエストを確認し、まもなくチャットを通じてご連絡いたします。',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: "\u65E9\u671F\u30AD\u30E3\u30F3\u30BB\u30EB\u3092\u30EA\u30AF\u30A8\u30B9\u30C8\u3059\u308B\u3053\u3068\u306B\u3088\u308A\u3001Expensify \u304C Expensify \u306E\u4E0B\u3067\u305D\u306E\u3088\u3046\u306A\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u627F\u8A8D\u3059\u308B\u7FA9\u52D9\u3092\u8CA0\u308F\u306A\u3044\u3053\u3068\u3092\u8A8D\u3081\u3001\u540C\u610F\u3057\u307E\u3059\u3002<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">\u5229\u7528\u898F\u7D04</a>\u307E\u305F\u306F\u3001\u79C1\u3068Expensify\u306E\u9593\u306E\u4ED6\u306E\u9069\u7528\u3055\u308C\u308B\u30B5\u30FC\u30D3\u30B9\u5951\u7D04\u306B\u57FA\u3065\u304D\u3001Expensify\u304C\u305D\u306E\u3088\u3046\u306A\u8981\u6C42\u3092\u8A31\u53EF\u3059\u308B\u304B\u3069\u3046\u304B\u306B\u3064\u3044\u3066\u306E\u552F\u4E00\u306E\u88C1\u91CF\u6A29\u3092\u4FDD\u6301\u3057\u3066\u3044\u308B\u3053\u3068\u3002"),
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
    },
    delegate: {
        switchAccount: 'アカウントを切り替える:',
        copilotDelegatedAccess: 'Copilot: 委任されたアクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにする。',
        addCopilot: 'コパイロットを追加',
        membersCanAccessYourAccount: 'これらのメンバーはあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'これらのアカウントには、アカウントスイッチャーを通じてアクセスできます。',
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return '満杯';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return '限定';
                default:
                    return '';
            }
        },
        genericError: 'おっと、何か問題が発生しました。もう一度お試しください。',
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "".concat(delegator, "\u306B\u4EE3\u308F\u3063\u3066");
        },
        accessLevel: 'アクセスレベル',
        confirmCopilot: '以下であなたのコパイロットを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。フルアクセスと限定アクセスの両方で、コパイロットはすべての会話と経費を閲覧できます。',
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'あなたのアカウントで、他のメンバーがあなたに代わってすべての操作を行うことを許可します。チャット、提出、承認、支払い、設定の更新などが含まれます。';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return '別のメンバーに、承認、支払い、拒否、保留を除く、あなたのアカウントでほとんどの操作を代行させることができます。';
                default:
                    return '';
            }
        },
        removeCopilot: 'コパイロットを削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'あなたであることを確認しましょう',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "".concat(contactMethod, "\u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u3001\u30B3\u30D1\u30A4\u30ED\u30C3\u30C8\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u30021\uFF5E2\u5206\u4EE5\u5185\u306B\u5C4A\u304F\u306F\u305A\u3067\u3059\u3002");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "\u30B3\u30D1\u30A4\u30ED\u30C3\u30C8\u3092\u66F4\u65B0\u3059\u308B\u305F\u3081\u306B\u3001".concat(contactMethod, "\u306B\u9001\u4FE1\u3055\u308C\u305F\u30DE\u30B8\u30C3\u30AF\u30B3\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        },
        notAllowed: 'ちょっと待ってください…',
        noAccessMessage: 'コパイロットとして、このページにアクセスする権限がありません。申し訳ありません！',
        notAllowedMessageStart: "As a",
        notAllowedMessageHyperLinked: 'コパイロット',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "".concat(accountOwnerEmail, "\u3001\u3053\u306E\u64CD\u4F5C\u3092\u884C\u3046\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u7533\u3057\u8A33\u3042\u308A\u307E\u305B\u3093\uFF01");
        },
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
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "".concat(propertyName, " \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "\u7121\u52B9\u306A\u30D7\u30ED\u30D1\u30C6\u30A3: ".concat(propertyName, " - \u671F\u5F85\u3055\u308C\u308B\u578B: ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "\u7121\u52B9\u306A\u5024 - \u671F\u5F85\u3055\u308C\u308B\u5024: ".concat(expectedValues);
        },
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
        title: 'チャットの速度で旅行と経費を管理',
        subtitle: '新しいExpensifyは、素晴らしい自動化機能に加えて、驚くべきコラボレーション機能を備えています。',
        confirmText: '行きましょう！',
        features: {
            chat: '<strong>任意の経費</strong>、レポート、またはワークスペースで直接チャット',
            scanReceipt: '<strong>領収書をスキャン</strong>して払い戻しを受ける',
            crossPlatform: '<strong>すべて</strong>を携帯電話やブラウザから行う',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: '始めましょう',
            part2: 'ここにいます！',
        },
        saveSearchTooltip: {
            part1: '保存した検索の名前を変更する',
            part2: 'ここにいます！',
        },
        bottomNavInboxTooltip: {
            part1: '何を確認しますか？',
            part2: 'あなたの注意が必要です',
            part3: 'および',
            part4: '経費についてチャットする。',
        },
        workspaceChatTooltip: {
            part1: 'とチャット',
            part2: '承認者',
        },
        globalCreateTooltip: {
            part1: '経費を作成',
            part2: ', チャットを開始,',
            part3: 'その他。',
            part4: '試してみてください！',
        },
        GBRRBRChat: {
            part1: 'あなたは🟢を見るでしょう',
            part2: '取るべき行動',
            part3: '、\nおよび 🔴 に',
            part4: 'レビューする項目。',
        },
        accountSwitcher: {
            part1: 'アクセスする',
            part2: 'Copilotアカウント',
            part3: 'ここ',
        },
        expenseReportsFilter: {
            part1: 'ようこそ！すべてのあなたの',
            part2: '会社のレポート',
            part3: 'here.',
        },
        scanTestTooltip: {
            part1: 'Scanの動作を確認しますか？',
            part2: 'テスト領収書を試してみてください！',
            part3: '私たちの〜を選んでください',
            part4: 'テストマネージャー',
            part5: '試してみてください！',
            part6: '今、',
            part7: '経費を提出する',
            part8: 'そして魔法が起こるのを見てください！',
            tryItOut: '試してみてください',
            noThanks: '結構です',
        },
        outstandingFilter: {
            part1: '以下の条件に一致する経費をフィルタリング',
            part2: '承認が必要です',
        },
        scanTestDriveTooltip: {
            part1: 'この領収書を送信先',
            part2: 'テストドライブを完了してください！',
        },
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
            slots: '利用可能な時間',
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
            description: '製品ツアーをすばやく見て、すぐに追いつきましょう。途中で止まる必要はありません！',
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
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, "\u304CExpensify\u306E\u8A66\u7528\u306B\u3042\u306A\u305F\u3092\u62DB\u5F85\u3057\u307E\u3057\u305F\n\u3053\u3093\u306B\u3061\u306F\uFF01\u79C1\u306FExpensify\u3092\u8A66\u7528\u3059\u308B\u305F\u3081\u306E*3\u30F6\u6708\u7121\u6599*\u3092\u624B\u306B\u5165\u308C\u307E\u3057\u305F\u3002\u3053\u308C\u306F\u3001\u7D4C\u8CBB\u3092\u51E6\u7406\u3059\u308B\u6700\u901F\u306E\u65B9\u6CD5\u3067\u3059\u3002\n\n\u3053\u3061\u3089\u304C\u305D\u306E\u4ED5\u7D44\u307F\u3092\u793A\u3059*\u30C6\u30B9\u30C8\u9818\u53CE\u66F8*\u3067\u3059\uFF1A");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
