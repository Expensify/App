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
    AdminCanceledRequestParams,
    AirlineParams,
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
    BillingBannerOwnerAmountOwedOverdueParams,
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
    CurrencyCodeParams,
    CurrencyInputDisabledTextParams,
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
    DemotedFromWorkspaceParams,
    DidSplitAmountMessageParams,
    DuplicateTransactionParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EmployeeInviteMessageParams,
    EnterMagicCodeParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FlightParams,
    FormattedMaxLengthParams,
    GoBackMessageParams,
    GoToRoomParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfulDescriptionParams,
    ImportPerDiemRatesSuccessfulDescriptionParams,
    ImportTagsSuccessfulDescriptionParams,
    IncorrectZipFormatParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
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
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
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
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    RailTicketParams,
    ReconciliationWorksParams,
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
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
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
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
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
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
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
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
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
const translations = {
    common: {
        count: 'Contar',
        cancel: 'Cancelar',
        dismiss: 'Dispensar',
        yes: 'Sim',
        no: 'N\u00E3o',
        ok: 'OK',
        notNow: 'Agora n\u00E3o',
        learnMore: 'Saiba mais.',
        buttonConfirm: 'Entendi',
        name: 'Nome',
        attachment: 'Anexo',
        attachments: 'Anexos',
        center: 'Centro',
        from: 'De',
        to: 'Para',
        in: 'Em',
        optional: 'Opcional',
        new: 'Novo',
        search: 'Pesquisar',
        reports: 'Relat\u00F3rios',
        find: 'Encontrar',
        searchWithThreeDots: 'Pesquisar...',
        next: 'Pr\u00F3ximo',
        previous: 'Anterior',
        goBack: 'Voltar',
        create: 'Criar',
        add: 'Adicionar',
        resend: 'Reenviar',
        save: 'Salvar',
        select: 'Selecionar',
        deselect: 'Desmarcar',
        selectMultiple: 'Selecionar m\u00FAltiplos',
        saveChanges: 'Salvar altera\u00E7\u00F5es',
        submit: 'Enviar',
        rotate: 'Girar',
        zoom: 'Zoom',
        password: 'Senha',
        magicCode: 'C\u00F3digo m\u00E1gico',
        twoFactorCode: 'C\u00F3digo de dois fatores',
        workspaces: 'Espa\u00E7os de Trabalho',
        inbox: 'Caixa de entrada',
        group: 'Grupo',
        profile: 'Perfil',
        referral: 'Indica\u00E7\u00E3o',
        payments: 'Pagamentos',
        approvals: 'Aprova\u00E7\u00F5es',
        wallet: 'Carteira',
        preferences: 'Prefer\u00EAncias',
        view: 'Visualizar',
        review: (reviewParams?: ReviewParams) => `Revisar${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'N\u00E3o',
        signIn: 'Entrar',
        signInWithGoogle: 'Entrar com o Google',
        signInWithApple: 'Entrar com Apple',
        signInWith: 'Entrar com',
        continue: 'Continuar',
        firstName: 'Primeiro nome',
        lastName: 'Sobrenome',
        scanning: 'Digitalizando',
        addCardTermsOfService: 'Termos de Servi\u00E7o do Expensify',
        perPerson: 'por pessoa',
        phone: 'Telefone',
        phoneNumber: 'N\u00FAmero de telefone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'e',
        or: 'ou',
        details: 'Detalhes',
        privacy: 'Privacidade',
        privacyPolicy: 'Pol\u00EDtica de Privacidade',
        hidden: 'Oculto',
        visible: 'Vis\u00EDvel',
        delete: 'Excluir',
        archived: 'arquivado',
        contacts: 'Contatos',
        recents: 'Recentes',
        close: 'Fechar',
        download: 'Download',
        downloading: 'Baixando',
        uploading: 'Carregando',
        pin: 'Pin',
        unPin: 'Desafixar',
        back: 'Voltar',
        saveAndContinue: 'Salvar e continuar',
        settings: 'Configura\u00E7\u00F5es',
        termsOfService: 'Termos de Servi\u00E7o',
        members: 'Membros',
        invite: 'Convidar',
        here: 'aqui',
        date: 'Data',
        dob: 'Data de nascimento',
        currentYear: 'Ano atual',
        currentMonth: 'M\u00EAs atual',
        ssnLast4: '\u00DAltimos 4 d\u00EDgitos do SSN',
        ssnFull9: 'Nove d\u00EDgitos completos do SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Linha de endere\u00E7o ${lineNumber}`,
        personalAddress: 'Endere\u00E7o pessoal',
        companyAddress: 'Endere\u00E7o da empresa',
        noPO: 'Sem caixas postais ou endere\u00E7os de entrega de correspond\u00EAncia, por favor.',
        city: 'Cidade',
        state: 'Estado',
        streetAddress: 'Endere\u00E7o residencial',
        stateOrProvince: 'Estado / Prov\u00EDncia',
        country: 'Pa\u00EDs',
        zip: 'C\u00F3digo postal',
        zipPostCode: 'CEP / C\u00F3digo Postal',
        whatThis: 'O que \u00E9 isso?',
        iAcceptThe: 'Eu aceito o',
        remove: 'Remover',
        admin: 'Administra\u00E7\u00E3o',
        owner: 'Propriet\u00E1rio',
        dateFormat: 'YYYY-MM-DD',
        send: 'Enviar',
        na: 'N/A',
        noResultsFound: 'Nenhum resultado encontrado',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Nenhum resultado encontrado correspondente a "${searchString}"`,
        recentDestinations: 'Destinos recentes',
        timePrefix: '\u00C9',
        conjunctionFor: 'para',
        todayAt: 'Hoje \u00E0s',
        tomorrowAt: 'Amanh\u00E3 \u00E0s',
        yesterdayAt: 'Ontem \u00E0s',
        conjunctionAt: 'em',
        conjunctionTo: 'para',
        genericErrorMessage: 'Ops... algo deu errado e sua solicita\u00E7\u00E3o n\u00E3o p\u00F4de ser conclu\u00EDda. Por favor, tente novamente mais tarde.',
        percentage: 'Porcentagem',
        error: {
            invalidAmount: 'Quantia inv\u00E1lida',
            acceptTerms: 'Voc\u00EA deve aceitar os Termos de Servi\u00E7o para continuar',
            phoneNumber: `Por favor, insira um n\u00FAmero de telefone v\u00E1lido, com o c\u00F3digo do pa\u00EDs (ex.: ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Este campo \u00E9 obrigat\u00F3rio',
            requestModified: 'Esta solicita\u00E7\u00E3o est\u00E1 sendo modificada por outro membro.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite de caracteres excedido (${length}/${limit})`,
            dateInvalid: 'Por favor, selecione uma data v\u00E1lida',
            invalidDateShouldBeFuture: 'Por favor, escolha hoje ou uma data futura',
            invalidTimeShouldBeFuture: 'Por favor, escolha um hor\u00E1rio pelo menos um minuto \u00E0 frente.',
            invalidCharacter: 'Caractere inv\u00E1lido',
            enterMerchant: 'Digite o nome de um comerciante',
            enterAmount: 'Insira um valor',
            missingMerchantName: 'Nome do comerciante ausente',
            missingAmount: 'Quantia ausente',
            missingDate: 'Data ausente',
            enterDate: 'Insira uma data',
            invalidTimeRange: 'Por favor, insira um hor\u00E1rio usando o formato de 12 horas (por exemplo, 2:30 PM)',
            pleaseCompleteForm: 'Por favor, preencha o formul\u00E1rio acima para continuar.',
            pleaseSelectOne: 'Por favor, selecione uma op\u00E7\u00E3o acima',
            invalidRateError: 'Por favor, insira uma taxa v\u00E1lida',
            lowRateError: 'A taxa deve ser maior que 0',
            email: 'Por favor, insira um endere\u00E7o de e-mail v\u00E1lido.',
            login: 'Ocorreu um erro ao fazer login. Por favor, tente novamente.',
        },
        comma: 'v\u00EDrgula',
        semicolon: 'semicolon',
        please: 'Por favor',
        contactUs: 'contate-nos',
        pleaseEnterEmailOrPhoneNumber: 'Por favor, insira um e-mail ou n\u00FAmero de telefone',
        fixTheErrors: 'corrija os erros',
        inTheFormBeforeContinuing: 'no formul\u00E1rio antes de continuar',
        confirm: 'Confirmar',
        reset: 'Redefinir',
        done: 'Conclu\u00EDdo',
        more: 'Mais',
        debitCard: 'Cart\u00E3o de d\u00E9bito',
        bankAccount: 'Conta banc\u00E1ria',
        personalBankAccount: 'Conta banc\u00E1ria pessoal',
        businessBankAccount: 'Conta banc\u00E1ria empresarial',
        join: 'Participar',
        leave: 'Sair',
        decline: 'Recusar',
        transferBalance: 'Transferir saldo',
        cantFindAddress: 'N\u00E3o consegue encontrar seu endere\u00E7o?',
        enterManually: 'Digite manualmente',
        message: 'Mensagem',
        leaveThread: 'Sair da conversa',
        you: 'Voc\u00EA',
        youAfterPreposition: 'voc\u00EA',
        your: 'seu/sua/seus/suas (dependendo do contexto)',
        conciergeHelp: 'Por favor, entre em contato com o Concierge para obter ajuda.',
        youAppearToBeOffline: 'Parece que voc\u00EA est\u00E1 offline.',
        thisFeatureRequiresInternet: 'Este recurso requer uma conex\u00E3o ativa com a internet.',
        attachmentWillBeAvailableOnceBackOnline: 'O anexo estar\u00E1 dispon\u00EDvel assim que voltar online.',
        errorOccurredWhileTryingToPlayVideo: 'Ocorreu um erro ao tentar reproduzir este v\u00EDdeo.',
        areYouSure: 'Voc\u00EA tem certeza?',
        verify: 'Verificar',
        yesContinue: 'Sim, continue.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Descri\u00E7\u00E3o',
        title: 'T\u00EDtulo',
        assignee: 'Cession\u00E1rio',
        createdBy: 'Criado por',
        with: 'com',
        shareCode: 'Compartilhar c\u00F3digo',
        share: 'Compartilhar',
        per: 'por',
        mi: 'milha',
        km: 'quil\u00F4metro',
        copied: 'Copiado!',
        someone: 'Algu\u00E9m',
        total: 'Total',
        edit: 'Editar',
        letsDoThis: `Vamos fazer isso!`,
        letsStart: `Vamos come\u00E7ar`,
        showMore: 'Mostrar mais',
        merchant: 'Comerciante',
        category: 'Categoria',
        report: 'Relat\u00F3rio',
        billable: 'Fatur\u00E1vel',
        nonBillable: 'N\u00E3o fatur\u00E1vel',
        tag: 'Tag',
        receipt: 'Recibo',
        verified: 'Verificado',
        replace: 'Substituir',
        distance: 'Dist\u00E2ncia',
        mile: 'milha',
        miles: 'milhas',
        kilometer: 'quil\u00F4metro',
        kilometers: 'quil\u00F4metros',
        recent: 'Recente',
        all: 'Todos',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Selecione uma moeda',
        card: 'Cart\u00E3o',
        whyDoWeAskForThis: 'Por que pedimos isso?',
        required: 'Obrigat\u00F3rio',
        showing: 'Mostrando',
        of: 'de',
        default: 'Padr\u00E3o',
        update: 'Atualizar',
        member: 'Membro',
        auditor: 'Auditor',
        role: 'Fun\u00E7\u00E3o',
        currency: 'Moeda',
        rate: 'Avaliar',
        emptyLHN: {
            title: 'Woohoo! Tudo em dia.',
            subtitleText1: 'Encontre um chat usando o',
            subtitleText2: 'bot\u00E3o acima, ou crie algo usando o',
            subtitleText3: 'bot\u00E3o abaixo.',
        },
        businessName: 'Nome da empresa',
        clear: 'Limpar',
        type: 'Tipo',
        action: 'A\u00E7\u00E3o',
        expenses: 'Despesas',
        tax: 'Imposto',
        shared: 'Compartilhado',
        drafts: 'Rascunhos',
        finished: 'Conclu\u00EDdo',
        upgrade: 'Atualizar',
        downgradeWorkspace: 'Rebaixar espa\u00E7o de trabalho',
        companyID: 'ID da Empresa',
        userID: 'ID do Usu\u00E1rio',
        disable: 'Desativar',
        export: 'Exportar',
        initialValue: 'Valor inicial',
        currentDate: 'Data atual',
        value: 'Valor',
        downloadFailedTitle: 'Falha no download',
        downloadFailedDescription: 'N\u00E3o foi poss\u00EDvel concluir o seu download. Por favor, tente novamente mais tarde.',
        filterLogs: 'Filtrar Logs',
        network: 'Rede',
        reportID: 'ID do Relat\u00F3rio',
        longID: 'ID longo',
        bankAccounts: 'Contas banc\u00E1rias',
        chooseFile: 'Escolher arquivo',
        dropTitle: 'Deixe ir',
        dropMessage: 'Solte seu arquivo aqui',
        ignore: 'Ignore',
        enabled: 'Habilitado',
        disabled: 'Desativado',
        import: 'Importar',
        offlinePrompt: 'Voc\u00EA n\u00E3o pode realizar esta a\u00E7\u00E3o no momento.',
        outstanding: 'Excepcional',
        chats: 'Chats',
        tasks: 'Tarefas',
        unread: 'N\u00E3o lido',
        sent: 'Enviado',
        links: 'Links',
        days: 'dias',
        rename: 'Renomear',
        address: 'Endere\u00E7o',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pular',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Precisa de algo espec\u00EDfico? Converse com seu gerente de conta, ${accountManagerDisplayName}.`,
        chatNow: 'Converse agora',
        workEmail: 'E-mail de trabalho',
        destination: 'Destino',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Validar',
        downloadAsPDF: 'Baixar como PDF',
        downloadAsCSV: 'Baixar como CSV',
        help: 'Ajuda',
        expenseReports: 'Relat\u00F3rios de Despesas',
        rateOutOfPolicy: 'Taxa fora da pol\u00EDtica',
        reimbursable: 'Reembols\u00E1vel',
        editYourProfile: 'Edite seu perfil',
        comments: 'Coment\u00E1rios',
        sharedIn: 'Compartilhado em',
        unreported: 'N\u00E3o reportado',
        explore: 'Explorar',
        todo: 'A fazer',
        invoice: 'Fatura',
        expense: 'Despesa',
        chat: 'Conversa',
        task: 'Tarefa',
        trip: 'Viagem',
        apply: 'Aplicar',
        status: 'Status',
        on: 'Em',
        before: 'Antes',
        after: 'Depois',
        reschedule: 'Reagendar',
        general: 'Geral',
        never: 'Nunca',
        workspacesTabTitle: 'Espa\u00E7os de Trabalho',
        getTheApp: 'Obtenha o app',
        scanReceiptsOnTheGo: 'Digitalize recibos do seu telefone',
    },
    supportalNoAccess: {
        title: 'N\u00E3o t\u00E3o r\u00E1pido',
        description: 'Voc\u00EA n\u00E3o est\u00E1 autorizado a realizar esta a\u00E7\u00E3o quando o suporte est\u00E1 conectado.',
    },
    lockedAccount: {
        title: 'Conta Bloqueada',
        description:
            'Voc\u00EA n\u00E3o tem permiss\u00E3o para completar esta a\u00E7\u00E3o, pois esta conta foi bloqueada. Por favor, entre em contato com concierge@expensify.com para os pr\u00F3ximos passos.',
    },
    location: {
        useCurrent: 'Usar localiza\u00E7\u00E3o atual',
        notFound: 'N\u00E3o conseguimos encontrar sua localiza\u00E7\u00E3o. Por favor, tente novamente ou insira um endere\u00E7o manualmente.',
        permissionDenied: 'Parece que voc\u00EA negou o acesso \u00E0 sua localiza\u00E7\u00E3o.',
        please: 'Por favor',
        allowPermission: 'permitir acesso \u00E0 localiza\u00E7\u00E3o nas configura\u00E7\u00F5es',
        tryAgain: 'e tente novamente.',
    },
    contact: {
        importContacts: 'Importar contatos',
        importContactsTitle: 'Importe seus contatos',
        importContactsText: 'Importe contatos do seu telefone para que suas pessoas favoritas estejam sempre a um toque de dist\u00E2ncia.',
        importContactsExplanation: 'para que suas pessoas favoritas estejam sempre a um toque de dist\u00E2ncia.',
        importContactsNativeText: 'S\u00F3 mais um passo! D\u00EA-nos o sinal verde para importar seus contatos.',
    },
    anonymousReportFooter: {
        logoTagline: 'Participe da discuss\u00E3o.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acesso \u00E0 c\u00E2mera',
        expensifyDoesNotHaveAccessToCamera: 'O Expensify n\u00E3o pode tirar fotos sem acesso \u00E0 sua c\u00E2mera. Toque em configura\u00E7\u00F5es para atualizar as permiss\u00F5es.',
        attachmentError: 'Erro de anexo',
        errorWhileSelectingAttachment: 'Ocorreu um erro ao selecionar um anexo. Por favor, tente novamente.',
        errorWhileSelectingCorruptedAttachment: 'Ocorreu um erro ao selecionar um anexo corrompido. Por favor, tente outro arquivo.',
        takePhoto: 'Tirar foto',
        chooseFromGallery: 'Escolher da galeria',
        chooseDocument: 'Escolher arquivo',
        attachmentTooLarge: 'Anexo \u00E9 muito grande',
        sizeExceeded: 'O tamanho do anexo \u00E9 maior que o limite de 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `O tamanho do anexo \u00E9 maior que o limite de ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anexo \u00E9 muito pequeno',
        sizeNotMet: 'O tamanho do anexo deve ser maior que 240 bytes',
        wrongFileType: 'Tipo de arquivo inv\u00E1lido',
        notAllowedExtension: 'Este tipo de arquivo n\u00E3o \u00E9 permitido. Por favor, tente um tipo de arquivo diferente.',
        folderNotAllowedMessage: 'N\u00E3o \u00E9 permitido fazer upload de uma pasta. Por favor, tente um arquivo diferente.',
        protectedPDFNotSupported: 'PDF protegido por senha n\u00E3o \u00E9 suportado',
        attachmentImageResized: 'Esta imagem foi redimensionada para visualiza\u00E7\u00E3o. Baixe para resolu\u00E7\u00E3o completa.',
        attachmentImageTooLarge: 'Esta imagem \u00E9 muito grande para visualizar antes de fazer o upload.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Voc\u00EA pode enviar at\u00E9 ${fileLimit} arquivos por vez.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Os arquivos excedem ${maxUploadSizeInMB} MB. Por favor, tente novamente.`,
    },
    dropzone: {
        addAttachments: 'Adicionar anexos',
        scanReceipts: 'Digitalizar recibos',
        replaceReceipt: 'Substituir recibo',
    },
    filePicker: {
        fileError: 'Erro de arquivo',
        errorWhileSelectingFile: 'Ocorreu um erro ao selecionar um arquivo. Por favor, tente novamente.',
    },
    connectionComplete: {
        title: 'Conex\u00E3o conclu\u00EDda',
        supportingText: 'Voc\u00EA pode fechar esta janela e voltar para o aplicativo Expensify.',
    },
    avatarCropModal: {
        title: 'Editar foto',
        description: 'Arraste, amplie e gire sua imagem como quiser.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nenhuma extens\u00E3o encontrada para o tipo MIME',
        problemGettingImageYouPasted: 'Houve um problema ao obter a imagem que voc\u00EA colou.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `O comprimento m\u00E1ximo do coment\u00E1rio \u00E9 de ${formattedMaxLength} caracteres.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `O comprimento m\u00E1ximo do t\u00EDtulo da tarefa \u00E9 de ${formattedMaxLength} caracteres.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Atualizar aplicativo',
        updatePrompt:
            'Uma nova vers\u00E3o deste aplicativo est\u00E1 dispon\u00EDvel.  \nAtualize agora ou reinicie o aplicativo mais tarde para baixar as \u00FAltimas altera\u00E7\u00F5es.',
    },
    deeplinkWrapper: {
        launching: 'Iniciando Expensify',
        expired: 'Sua sess\u00E3o expirou.',
        signIn: 'Por favor, fa\u00E7a login novamente.',
        redirectedToDesktopApp: 'Redirecionamos voc\u00EA para o aplicativo de desktop.',
        youCanAlso: 'Voc\u00EA tamb\u00E9m pode',
        openLinkInBrowser: 'abra este link no seu navegador',
        loggedInAs: ({email}: LoggedInAsParams) => `Voc\u00EA est\u00E1 conectado como ${email}. Clique em "Abrir link" no prompt para fazer login no aplicativo de desktop com esta conta.`,
        doNotSeePrompt: 'N\u00E3o consegue ver o prompt?',
        tryAgain: 'Tente novamente',
        or: ', ou',
        continueInWeb: 'continuar para o aplicativo web',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\nvoc\u00EA est\u00E1 conectado!',
        successfulSignInDescription: 'Volte para a sua aba original para continuar.',
        title: 'Aqui est\u00E1 o seu c\u00F3digo m\u00E1gico',
        description: 'Por favor, insira o c\u00F3digo do dispositivo onde ele foi originalmente solicitado.',
        doNotShare: 'N\u00E3o compartilhe seu c\u00F3digo com ningu\u00E9m.  \nA Expensify nunca pedir\u00E1 por ele!',
        or: ', ou',
        signInHere: 'basta entrar aqui',
        expiredCodeTitle: 'C\u00F3digo m\u00E1gico expirado',
        expiredCodeDescription: 'Volte para o dispositivo original e solicite um novo c\u00F3digo',
        successfulNewCodeRequest: 'C\u00F3digo solicitado. Por favor, verifique seu dispositivo.',
        tfaRequiredTitle: 'Autentica\u00E7\u00E3o de dois fatores\nnecess\u00E1ria',
        tfaRequiredDescription: 'Por favor, insira o c\u00F3digo de autentica\u00E7\u00E3o de dois fatores onde voc\u00EA est\u00E1 tentando fazer login.',
        requestOneHere: 'solicite um aqui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pago por',
        whatsItFor: 'Para que serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, e-mail ou n\u00FAmero de telefone',
        findMember: 'Encontrar um membro',
        searchForSomeone: 'Procurar por algu\u00E9m',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Envie uma despesa, indique seu chefe',
            subtitleText: 'Quer que seu chefe use o Expensify tamb\u00E9m? Basta enviar uma despesa para eles e n\u00F3s cuidaremos do resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Agendar uma chamada',
    },
    hello: 'Ol\u00E1',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Comece abaixo.',
        anotherLoginPageIsOpen: 'Outra p\u00E1gina de login est\u00E1 aberta.',
        anotherLoginPageIsOpenExplanation: 'Voc\u00EA abriu a p\u00E1gina de login em uma aba separada. Por favor, fa\u00E7a o login a partir dessa aba.',
        welcome: 'Bem-vindo!',
        welcomeWithoutExclamation: 'Bem-vindo',
        phrase2: 'Dinheiro fala. E agora que bate-papo e pagamentos est\u00E3o em um s\u00F3 lugar, tamb\u00E9m \u00E9 f\u00E1cil.',
        phrase3: 'Seus pagamentos chegam at\u00E9 voc\u00EA t\u00E3o r\u00E1pido quanto voc\u00EA consegue se expressar.',
        enterPassword: 'Por favor, insira sua senha',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, \u00E9 sempre \u00F3timo ver um novo rosto por aqui!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${login}. Ele deve chegar em um ou dois minutos.`,
    },
    login: {
        hero: {
            header: 'Viagens e despesas, na velocidade do chat',
            body: 'Bem-vindo \u00E0 pr\u00F3xima gera\u00E7\u00E3o do Expensify, onde suas viagens e despesas s\u00E3o aceleradas com a ajuda de um chat contextual em tempo real.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Voc\u00EA j\u00E1 est\u00E1 conectado como ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `N\u00E3o quer entrar com ${provider}?`,
        continueWithMyCurrentSession: 'Continuar com minha sess\u00E3o atual',
        redirectToDesktopMessage: 'Vamos redirecion\u00E1-lo para o aplicativo de desktop assim que voc\u00EA terminar de fazer login.',
        signInAgreementMessage: 'Ao fazer login, voc\u00EA concorda com o/a/as/os',
        termsOfService: 'Termos de Servi\u00E7o',
        privacy: 'Privacidade',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continue fazendo login com single sign-on:',
        orContinueWithMagicCode: 'Voc\u00EA tamb\u00E9m pode entrar com um c\u00F3digo m\u00E1gico',
        useSingleSignOn: 'Usar single sign-on',
        useMagicCode: 'Use magic code',
        launching: 'Iniciando...',
        oneMoment: 'Um momento enquanto redirecionamos voc\u00EA para o portal de login \u00FAnico da sua empresa.',
    },
    reportActionCompose: {
        dropToUpload: 'Solte para enviar',
        sendAttachment: 'Enviar anexo',
        addAttachment: 'Adicionar anexo',
        writeSomething: 'Escreva algo...',
        blockedFromConcierge: 'Comunica\u00E7\u00E3o est\u00E1 bloqueada',
        fileUploadFailed: 'Falha no upload. Arquivo n\u00E3o \u00E9 suportado.',
        localTime: ({user, time}: LocalTimeParams) => `S\u00E3o ${time} para ${user}`,
        edited: '(editar)',
        emoji: 'Emoji',
        collapse: 'Recolher',
        expand: 'Expandir',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copiar para a \u00E1rea de transfer\u00EAncia',
        copied: 'Copiado!',
        copyLink: 'Copiar link',
        copyURLToClipboard: 'Copiar URL para a \u00E1rea de transfer\u00EAncia',
        copyEmailToClipboard: 'Copiar e-mail para a \u00E1rea de transfer\u00EAncia',
        markAsUnread: 'Marcar como n\u00E3o lida',
        markAsRead: 'Marcar como lido',
        editAction: ({action}: EditActionParams) => `Editar ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'coment\u00E1rio'}`,
        deleteAction: ({action}: DeleteActionParams) => `Excluir ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'coment\u00E1rio'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `Tem certeza de que deseja excluir este ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'coment\u00E1rio'}?`,
        onlyVisible: 'Vis\u00EDvel apenas para',
        replyInThread: 'Responder no t\u00F3pico',
        joinThread: 'Participar da conversa',
        leaveThread: 'Sair da conversa',
        copyOnyxData: 'Copiar dados Onyx',
        flagAsOffensive: 'Marcar como ofensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Adicionar rea\u00E7\u00E3o',
        reactedWith: 'reagiu com',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Voc\u00EA perdeu a festa em',
        beginningOfArchivedRoomPartTwo: ', n\u00E3o h\u00E1 nada para ver aqui.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Este chat \u00E9 com todos os membros da Expensify no dom\u00EDnio ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Use-o para conversar com colegas, compartilhar dicas e fazer perguntas.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Este chat \u00E9 com',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'Use-o para conversar sobre a configura\u00E7\u00E3o do espa\u00E7o de trabalho e mais.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Este chat \u00E9 com todos em ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Use isso para os an\u00FAncios mais importantes.`,
        beginningOfChatHistoryUserRoomPartOne: 'Esta sala de bate-papo \u00E9 para qualquer coisa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Este chat \u00E9 para faturas entre`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use o bot\u00E3o + para enviar uma fatura.`,
        beginningOfChatHistory: 'Este chat \u00E9 com',
        beginningOfChatHistoryPolicyExpenseChatPartOne: '\u00C9 aqui onde',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'enviar\u00E1 despesas para',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usar o bot\u00E3o +.',
        beginningOfChatHistorySelfDM: 'Este \u00E9 o seu espa\u00E7o pessoal. Use-o para anota\u00E7\u00F5es, tarefas, rascunhos e lembretes.',
        beginningOfChatHistorySystemDM: 'Bem-vindo! Vamos configur\u00E1-lo.',
        chatWithAccountManager: 'Converse com o seu gerente de contas aqui',
        sayHello: 'Diga ol\u00E1!',
        yourSpace: 'Seu espa\u00E7o',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bem-vindo(a) ao ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Use o bot\u00E3o + para ${additionalText} uma despesa.`,
        askConcierge: 'Fa\u00E7a perguntas e obtenha suporte em tempo real 24/7.',
        conciergeSupport: 'Suporte 24/7',
        create: 'criar',
        iouTypes: {
            pay: 'pagar',
            split: 'dividir',
            submit: 'enviar',
            track: 'rastrear',
            invoice: 'fatura',
        },
    },
    adminOnlyCanPost: 'Somente administradores podem enviar mensagens nesta sala.',
    reportAction: {
        asCopilot: 'como copiloto para',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notificar todos nesta conversa',
    },
    newMessages: 'Novas mensagens',
    youHaveBeenBanned: 'Nota: Voc\u00EA foi banido de conversar neste canal.',
    reportTypingIndicator: {
        isTyping: 'est\u00E1 digitando...',
        areTyping: 'est\u00E3o digitando...',
        multipleMembers: 'V\u00E1rios membros',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Esta sala de bate-papo foi arquivada.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Este chat n\u00E3o est\u00E1 mais ativo porque ${displayName} encerrou sua conta.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Este chat n\u00E3o est\u00E1 mais ativo porque ${oldDisplayName} uniu sua conta com ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Este chat n\u00E3o est\u00E1 mais ativo porque <strong>voc\u00EA</strong> n\u00E3o \u00E9 mais um membro do espa\u00E7o de trabalho ${policyName}.`
                : `Este chat n\u00E3o est\u00E1 mais ativo porque ${displayName} n\u00E3o \u00E9 mais um membro do espa\u00E7o de trabalho ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat n\u00E3o est\u00E1 mais ativo porque ${policyName} n\u00E3o \u00E9 mais um espa\u00E7o de trabalho ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat n\u00E3o est\u00E1 mais ativo porque ${policyName} n\u00E3o \u00E9 mais um espa\u00E7o de trabalho ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Esta reserva est\u00E1 arquivada.',
    },
    writeCapabilityPage: {
        label: 'Quem pode postar',
        writeCapability: {
            all: 'Todos os membros',
            admins: 'Apenas administradores',
        },
    },
    sidebarScreen: {
        buttonFind: 'Encontre algo...',
        buttonMySettings: 'Minhas configura\u00E7\u00F5es',
        fabNewChat: 'Iniciar chat',
        fabNewChatExplained: 'Iniciar chat (A\u00E7\u00E3o flutuante)',
        chatPinned: 'Conversa fixada',
        draftedMessage: 'Mensagem rascunhada',
        listOfChatMessages: 'Lista de mensagens de chat',
        listOfChats: 'Lista de conversas',
        saveTheWorld: 'Salvar o mundo',
        tooltip: 'Comece aqui!',
        redirectToExpensifyClassicModal: {
            title: 'Em breve',
            description: 'Estamos ajustando mais alguns detalhes do Novo Expensify para acomodar sua configura\u00E7\u00E3o espec\u00EDfica. Enquanto isso, acesse o Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Assinatura',
        domains: 'Dom\u00EDnios',
    },
    tabSelector: {
        chat: 'Conversa',
        room: 'Sala',
        distance: 'Dist\u00E2ncia',
        manual: 'Manual',
        scan: 'Escanear',
    },
    spreadsheet: {
        upload: 'Carregar uma planilha',
        dragAndDrop: 'Arraste e solte sua planilha aqui, ou escolha um arquivo abaixo. Formatos suportados: .csv, .txt, .xls e .xlsx.',
        chooseSpreadsheet: 'Selecione um arquivo de planilha para importar. Formatos suportados: .csv, .txt, .xls e .xlsx.',
        fileContainsHeader: 'O arquivo cont\u00E9m cabe\u00E7alhos de coluna',
        column: ({name}: SpreadSheetColumnParams) => `Coluna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ops! Um campo obrigat\u00F3rio ("${fieldName}") n\u00E3o foi mapeado. Por favor, revise e tente novamente.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Ops! Voc\u00EA mapeou um \u00FAnico campo ("${fieldName}") para v\u00E1rias colunas. Por favor, revise e tente novamente.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ops! O campo ("${fieldName}") cont\u00E9m um ou mais valores vazios. Por favor, revise e tente novamente.`,
        importSuccessfulTitle: 'Importa\u00E7\u00E3o bem-sucedida',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} categorias foram adicionadas.` : '1 categoria foi adicionada.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Nenhum membro foi adicionado ou atualizado.';
            }
            if (added && updated) {
                return `${added} membro${added > 1 ? 's' : ''} adicionado, ${updated} membro${updated > 1 ? 's' : ''} atualizado.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membros foram atualizados.` : '1 membro foi atualizado.';
            }
            return added > 1 ? `${added} membros foram adicionados.` : '1 membro foi adicionado.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} tags foram adicionadas.` : '1 tag foi adicionado.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags de m\u00FAltiplos n\u00EDveis foram adicionadas.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `As taxas de ${rates} por dia foram adicionadas.` : '1 taxa de di\u00E1ria foi adicionada.',
        importFailedTitle: 'Importa\u00E7\u00E3o falhou',
        importFailedDescription:
            'Por favor, certifique-se de que todos os campos est\u00E3o preenchidos corretamente e tente novamente. Se o problema persistir, entre em contato com o Concierge.',
        importDescription: 'Escolha quais campos mapear da sua planilha clicando no menu suspenso ao lado de cada coluna importada abaixo.',
        sizeNotMet: 'O tamanho do arquivo deve ser maior que 0 bytes',
        invalidFileMessage:
            'O arquivo que voc\u00EA enviou est\u00E1 vazio ou cont\u00E9m dados inv\u00E1lidos. Por favor, certifique-se de que o arquivo est\u00E1 formatado corretamente e cont\u00E9m as informa\u00E7\u00F5es necess\u00E1rias antes de envi\u00E1-lo novamente.',
        importSpreadsheet: 'Importar planilha',
        downloadCSV: 'Baixar CSV',
    },
    receipt: {
        upload: 'Carregar recibo',
        dragReceiptBeforeEmail: 'Arraste um recibo para esta p\u00E1gina, encaminhe um recibo para',
        dragReceiptAfterEmail: 'ou escolha um arquivo para enviar abaixo.',
        chooseReceipt: 'Escolha um recibo para enviar ou encaminhe um recibo para',
        takePhoto: 'Tire uma foto',
        cameraAccess: 'O acesso \u00E0 c\u00E2mera \u00E9 necess\u00E1rio para tirar fotos dos recibos.',
        deniedCameraAccess: 'O acesso \u00E0 c\u00E2mera ainda n\u00E3o foi concedido, por favor siga',
        deniedCameraAccessInstructions: 'essas instru\u00E7\u00F5es',
        cameraErrorTitle: 'Erro de c\u00E2mera',
        cameraErrorMessage: 'Ocorreu um erro ao tirar a foto. Por favor, tente novamente.',
        locationAccessTitle: 'Permitir acesso \u00E0 localiza\u00E7\u00E3o',
        locationAccessMessage: 'O acesso \u00E0 localiza\u00E7\u00E3o nos ajuda a manter seu fuso hor\u00E1rio e moeda precisos onde quer que voc\u00EA v\u00E1.',
        locationErrorTitle: 'Permitir acesso \u00E0 localiza\u00E7\u00E3o',
        locationErrorMessage: 'O acesso \u00E0 localiza\u00E7\u00E3o nos ajuda a manter seu fuso hor\u00E1rio e moeda precisos onde quer que voc\u00EA v\u00E1.',
        allowLocationFromSetting: `O acesso \u00E0 localiza\u00E7\u00E3o nos ajuda a manter seu fuso hor\u00E1rio e moeda precisos onde quer que voc\u00EA v\u00E1. Por favor, permita o acesso \u00E0 localiza\u00E7\u00E3o nas configura\u00E7\u00F5es de permiss\u00E3o do seu dispositivo.`,
        dropTitle: 'Deixe ir',
        dropMessage: 'Solte seu arquivo aqui',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'obturador',
        gallery: 'galeria',
        deleteReceipt: 'Excluir recibo',
        deleteConfirmation: 'Tem certeza de que deseja excluir este recibo?',
        addReceipt: 'Adicionar recibo',
    },
    quickAction: {
        scanReceipt: 'Digitalizar recibo',
        recordDistance: 'Rastrear dist\u00E2ncia',
        requestMoney: 'Criar despesa',
        perDiem: 'Criar per diem',
        splitBill: 'Dividir despesa',
        splitScan: 'Dividir recibo',
        splitDistance: 'Dividir dist\u00E2ncia',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'algu\u00E9m'}`,
        assignTask: 'Atribuir tarefa',
        header: 'A\u00E7\u00E3o r\u00E1pida',
        noLongerHaveReportAccess: 'Voc\u00EA n\u00E3o tem mais acesso ao seu destino de a\u00E7\u00E3o r\u00E1pida anterior. Escolha um novo abaixo.',
        updateDestination: 'Atualizar destino',
        createReport: 'Criar relat\u00F3rio',
    },
    iou: {
        amount: 'Quantia',
        taxAmount: 'Valor do imposto',
        taxRate: 'Taxa de imposto',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Aprovar ${formattedAmount}` : 'Aprovar'),
        approved: 'Aprovado',
        cash: 'Dinheiro',
        card: 'Cart\u00E3o',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir despesa',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        addSplit: 'Adicionar divis\u00E3o',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total \u00E9 ${amount} maior que a despesa original.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total \u00E9 ${amount} a menos que a despesa original.`,
        splitExpenseZeroAmount: 'Por favor, insira um valor v\u00E1lido antes de continuar.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Editar ${amount} para ${merchant}`,
        removeSplit: 'Remover divis\u00E3o',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'algu\u00E9m'}`,
        expense: 'Despesa',
        categorize: 'Categorizar',
        share: 'Compartilhar',
        participants: 'Participantes',
        createExpense: 'Criar despesa',
        addExpense: 'Adicionar despesa',
        chooseRecipient: 'Escolher destinat\u00E1rio',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Criar despesa de ${amount}`,
        confirmDetails: 'Confirmar detalhes',
        pay: 'Pagar',
        cancelPayment: 'Cancelar pagamento',
        cancelPaymentConfirmation: 'Tem certeza de que deseja cancelar este pagamento?',
        viewDetails: 'Ver detalhes',
        pending: 'Pendente',
        canceled: 'Cancelado',
        posted: 'Postado',
        deleteReceipt: 'Excluir recibo',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `excluiu uma despesa neste relat\u00F3rio, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `moveu uma despesa${reportName ? `de ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `moveu esta despesa${reportName ? `para <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'movei esta despesa para o seu espa\u00E7o pessoal',
        pendingMatchWithCreditCard: 'Recibo pendente de correspond\u00EAncia com transa\u00E7\u00E3o do cart\u00E3o',
        pendingMatch: 'Correspond\u00EAncia pendente',
        pendingMatchWithCreditCardDescription: 'Recibo pendente de correspond\u00EAncia com transa\u00E7\u00E3o no cart\u00E3o. Marcar como dinheiro para cancelar.',
        markAsCash: 'Marcar como dinheiro',
        routePending: 'Rota pendente...',
        receiptScanning: () => ({
            one: 'Digitaliza\u00E7\u00E3o de recibo...',
            other: 'Escaneando recibos...',
        }),
        scanMultipleReceipts: 'Digitalizar v\u00E1rios recibos',
        scanMultipleReceiptsDescription: 'Tire fotos de todos os seus recibos de uma vez, depois confirme os detalhes voc\u00EA mesmo ou deixe o SmartScan cuidar disso.',
        receiptScanInProgress: 'Digitaliza\u00E7\u00E3o do recibo em andamento',
        receiptScanInProgressDescription: 'Digitaliza\u00E7\u00E3o do recibo em andamento. Verifique mais tarde ou insira os detalhes agora.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Despesas duplicadas potenciais identificadas. Revise as duplicatas para permitir o envio.'
                : 'Despesas duplicadas potenciais identificadas. Revise as duplicatas para permitir a aprova\u00E7\u00E3o.',
        receiptIssuesFound: () => ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }),
        fieldPending: 'Pendente...',
        defaultRate: 'Taxa padr\u00E3o',
        receiptMissingDetails: 'Recibo faltando detalhes',
        missingAmount: 'Quantia ausente',
        missingMerchant: 'Comerciante ausente',
        receiptStatusTitle: 'Escaneando\u2026',
        receiptStatusText: 'Somente voc\u00EA pode ver este recibo enquanto ele est\u00E1 sendo digitalizado. Verifique mais tarde ou insira os detalhes agora.',
        receiptScanningFailed: 'A digitaliza\u00E7\u00E3o do recibo falhou. Por favor, insira os detalhes manualmente.',
        transactionPendingDescription: 'Transa\u00E7\u00E3o pendente. Pode levar alguns dias para ser lan\u00E7ada.',
        companyInfo: 'Informa\u00E7\u00F5es da empresa',
        companyInfoDescription: 'Precisamos de mais alguns detalhes antes que voc\u00EA possa enviar sua primeira fatura.',
        yourCompanyName: 'Nome da sua empresa',
        yourCompanyWebsite: 'O site da sua empresa',
        yourCompanyWebsiteNote: 'Se voc\u00EA n\u00E3o tiver um site, pode fornecer o perfil da sua empresa no LinkedIn ou em redes sociais.',
        invalidDomainError: 'Voc\u00EA inseriu um dom\u00EDnio inv\u00E1lido. Para continuar, insira um dom\u00EDnio v\u00E1lido.',
        publicDomainError: 'Voc\u00EA entrou em um dom\u00EDnio p\u00FAblico. Para continuar, por favor, insira um dom\u00EDnio privado.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} escaneando`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} pendentes`);
            }
            return {
                one: statusText.length > 0 ? `1 despesa (${statusText.join(', ')})` : `1 despesa`,
                other: (count: number) => (statusText.length > 0 ? `${count} despesas (${statusText.join(', ')})` : `${count} despesas`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 despesa',
                other: (count: number) => `${count} despesas`,
            };
        },
        deleteExpense: () => ({
            one: 'Excluir despesa',
            other: 'Excluir despesas',
        }),
        deleteConfirmation: () => ({
            one: 'Tem certeza de que deseja excluir esta despesa?',
            other: 'Tem certeza de que deseja excluir estas despesas?',
        }),
        deleteReport: 'Excluir relat\u00F3rio',
        deleteReportConfirmation: 'Tem certeza de que deseja excluir este relat\u00F3rio?',
        settledExpensify: 'Pago',
        done: 'Conclu\u00EDdo',
        settledElsewhere: 'Pago em outro lugar',
        individual: 'Individual',
        business: 'Neg\u00F3cio',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pague ${formattedAmount} com Expensify` : `Pagar com Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como indiv\u00EDduo` : `Pagar como indiv\u00EDduo`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pagar ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como empresa` : `Pagar como uma empresa`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pague ${formattedAmount} em outro lugar` : `Pague em outro lugar`),
        nextStep: 'Pr\u00F3ximos passos',
        finished: 'Conclu\u00EDdo',
        sendInvoice: ({amount}: RequestAmountParams) => `Enviar fatura de ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Enviar ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `para ${comment}` : ''}`,
        submitted: `enviado`,
        automaticallySubmitted: `enviado via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">envios atrasados</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `acompanhando ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `dividir ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `dividir ${formattedAmount}${comment ? `para ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Sua parte ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} deve ${amount}${comment ? `para ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} deve:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''} pagou ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} pagou:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} gastou ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} gastou:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} aprovou:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} aprovou ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `pago ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `pago ${amount}. Adicione uma conta banc\u00E1ria para receber seu pagamento.`,
        automaticallyApproved: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do espa\u00E7o de trabalho</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `aprovado ${amount}`,
        approvedMessage: `aprovado`,
        unapproved: `n\u00E3o aprovado`,
        automaticallyForwarded: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do espa\u00E7o de trabalho</a>`,
        forwarded: `aprovado`,
        rejectedThisReport: 'rejeitou este relat\u00F3rio',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `come\u00E7ou a acertar. O pagamento est\u00E1 em espera at\u00E9 que ${submitterDisplayName} adicione uma conta banc\u00E1ria.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} cancelou o pagamento`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `cancelou o pagamento de ${amount}, porque ${submitterDisplayName} n\u00E3o ativou sua Expensify Wallet dentro de 30 dias`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} adicionou uma conta banc\u00E1ria. O pagamento de ${amount} foi realizado.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}pago em outro lugar`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''} pagou com Expensify`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} pagou com Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do espa\u00E7o de trabalho</a>`,
        noReimbursableExpenses: 'Este relat\u00F3rio tem um valor inv\u00E1lido',
        pendingConversionMessage: 'O total ser\u00E1 atualizado quando voc\u00EA estiver online novamente',
        changedTheExpense: 'alterou a despesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `o ${valueName} para ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `defina o ${translatedChangedField} para ${newMerchant}, o que definiu o valor para ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `o ${valueName} (anteriormente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `o ${valueName} para ${newValueToDisplay} (anteriormente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `alterou o ${translatedChangedField} para ${newMerchant} (anteriormente ${oldMerchant}), o que atualizou o valor para ${newAmountToDisplay} (anteriormente ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `para ${comment}` : 'despesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Relat\u00F3rio de Fatura n\u00BA ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} enviado${comment ? `para ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `moveu a despesa do espa\u00E7o pessoal para ${workspaceName ?? `conversar com ${reportName}`}`,
        movedToPersonalSpace: 'movido despesa para o espa\u00E7o pessoal',
        tagSelection: 'Selecione uma tag para organizar melhor seus gastos.',
        categorySelection: 'Selecione uma categoria para organizar melhor seus gastos.',
        error: {
            invalidCategoryLength: 'O nome da categoria excede 255 caracteres. Por favor, reduza-o ou escolha uma categoria diferente.',
            invalidTagLength: 'O nome da tag excede 255 caracteres. Por favor, encurte-o ou escolha uma tag diferente.',
            invalidAmount: 'Por favor, insira um valor v\u00E1lido antes de continuar.',
            invalidIntegerAmount: 'Por favor, insira um valor em d\u00F3lares inteiros antes de continuar.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `O valor m\u00E1ximo de imposto \u00E9 ${amount}`,
            invalidSplit: 'A soma das divis\u00F5es deve ser igual ao valor total',
            invalidSplitParticipants: 'Por favor, insira um valor maior que zero para pelo menos dois participantes.',
            invalidSplitYourself: 'Por favor, insira um valor diferente de zero para sua divis\u00E3o.',
            noParticipantSelected: 'Por favor, selecione um participante',
            other: 'Erro inesperado. Por favor, tente novamente mais tarde.',
            genericCreateFailureMessage: 'Erro inesperado ao enviar esta despesa. Por favor, tente novamente mais tarde.',
            genericCreateInvoiceFailureMessage: 'Erro inesperado ao enviar esta fatura. Por favor, tente novamente mais tarde.',
            genericHoldExpenseFailureMessage: 'Erro inesperado ao manter esta despesa. Por favor, tente novamente mais tarde.',
            genericUnholdExpenseFailureMessage: 'Erro inesperado ao retirar esta despesa da espera. Por favor, tente novamente mais tarde.',
            receiptDeleteFailureError: 'Erro inesperado ao excluir este recibo. Por favor, tente novamente mais tarde.',
            receiptFailureMessage: 'Houve um erro ao enviar seu recibo. Por favor,',
            receiptFailureMessageShort: 'Houve um erro ao enviar seu recibo.',
            tryAgainMessage: 'tente novamente',
            saveFileMessage: 'salvar o recibo',
            uploadLaterMessage: 'para enviar mais tarde.',
            genericDeleteFailureMessage: 'Erro inesperado ao excluir esta despesa. Por favor, tente novamente mais tarde.',
            genericEditFailureMessage: 'Erro inesperado ao editar esta despesa. Por favor, tente novamente mais tarde.',
            genericSmartscanFailureMessage: 'A transa\u00E7\u00E3o est\u00E1 com campos faltando',
            duplicateWaypointsErrorMessage: 'Por favor, remova os pontos de passagem duplicados',
            atLeastTwoDifferentWaypoints: 'Por favor, insira pelo menos dois endere\u00E7os diferentes.',
            splitExpenseMultipleParticipantsErrorMessage:
                'Uma despesa n\u00E3o pode ser dividida entre um espa\u00E7o de trabalho e outros membros. Por favor, atualize sua sele\u00E7\u00E3o.',
            invalidMerchant: 'Por favor, insira um comerciante v\u00E1lido',
            atLeastOneAttendee: 'Pelo menos um participante deve ser selecionado',
            invalidQuantity: 'Por favor, insira uma quantidade v\u00E1lida.',
            quantityGreaterThanZero: 'A quantidade deve ser maior que zero',
            invalidSubrateLength: 'Deve haver pelo menos uma subcategoria',
            invalidRate: 'Taxa n\u00E3o v\u00E1lida para este espa\u00E7o de trabalho. Por favor, selecione uma taxa dispon\u00EDvel no espa\u00E7o de trabalho.',
        },
        dismissReceiptError: 'Dispensar erro',
        dismissReceiptErrorConfirmation: 'Aten\u00E7\u00E3o! Ignorar este erro remover\u00E1 seu recibo enviado completamente. Voc\u00EA tem certeza?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `come\u00E7ou a acertar. O pagamento est\u00E1 em espera at\u00E9 que ${submitterDisplayName} ative sua carteira.`,
        enableWallet: 'Ativar carteira',
        hold: 'Aguardar',
        unhold: 'Remover reten\u00E7\u00E3o',
        holdExpense: 'Reter despesa',
        unholdExpense: 'Desbloquear despesa',
        heldExpense: 'retido esta despesa',
        unheldExpense: 'desbloqueou esta despesa',
        moveUnreportedExpense: 'Mover despesa n\u00E3o relatada',
        addUnreportedExpense: 'Adicionar despesa n\u00E3o relatada',
        createNewExpense: 'Criar nova despesa',
        selectUnreportedExpense: 'Selecione pelo menos uma despesa para adicionar ao relat\u00F3rio.',
        emptyStateUnreportedExpenseTitle: 'Nenhuma despesa n\u00E3o relatada',
        emptyStateUnreportedExpenseSubtitle: 'Parece que voc\u00EA n\u00E3o tem despesas n\u00E3o relatadas. Tente criar uma abaixo.',
        addUnreportedExpenseConfirm: 'Adicionar ao relat\u00F3rio',
        explainHold: 'Explique por que voc\u00EA est\u00E1 retendo esta despesa.',
        undoSubmit: 'Desfazer envio',
        retracted: 'retra\u00EDdo',
        undoClose: 'Desfazer fechamento',
        reopened: 'reaberto',
        reopenReport: 'Reabrir relat\u00F3rio',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Este relat\u00F3rio j\u00E1 foi exportado para ${connectionName}. Alter\u00E1-lo pode levar a discrep\u00E2ncias de dados. Tem certeza de que deseja reabrir este relat\u00F3rio?`,
        reason: 'Motivo',
        holdReasonRequired: '\u00C9 necess\u00E1rio fornecer um motivo ao segurar.',
        expenseWasPutOnHold: 'Despesa foi colocada em espera',
        expenseOnHold: 'Esta despesa foi colocada em espera. Por favor, revise os coment\u00E1rios para os pr\u00F3ximos passos.',
        expensesOnHold: 'Todas as despesas foram suspensas. Por favor, revise os coment\u00E1rios para os pr\u00F3ximos passos.',
        expenseDuplicate: 'Esta despesa tem detalhes semelhantes a outra. Por favor, revise os duplicados para continuar.',
        someDuplicatesArePaid: 'Alguns desses duplicados j\u00E1 foram aprovados ou pagos.',
        reviewDuplicates: 'Revisar duplicatas',
        keepAll: 'Manter todos os',
        confirmApprove: 'Confirmar valor de aprova\u00E7\u00E3o',
        confirmApprovalAmount: 'Aprovar apenas despesas em conformidade, ou aprovar o relat\u00F3rio inteiro.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Esta despesa est\u00E1 em espera. Voc\u00EA quer aprovar mesmo assim?',
            other: 'Essas despesas est\u00E3o em espera. Voc\u00EA quer aprovar mesmo assim?',
        }),
        confirmPay: 'Confirmar valor do pagamento',
        confirmPayAmount: 'Pague o que n\u00E3o est\u00E1 em espera, ou pague o relat\u00F3rio inteiro.',
        confirmPayAllHoldAmount: () => ({
            one: 'Esta despesa est\u00E1 em espera. Voc\u00EA quer pagar mesmo assim?',
            other: 'Essas despesas est\u00E3o em espera. Voc\u00EA quer pagar mesmo assim?',
        }),
        payOnly: 'Pagar apenas',
        approveOnly: 'Aprovar apenas',
        holdEducationalTitle: 'Esta solicita\u00E7\u00E3o est\u00E1 em andamento',
        holdEducationalText: 'aguarde',
        whatIsHoldExplain: 'Colocar em espera \u00E9 como apertar "pausa" em uma despesa para solicitar mais detalhes antes da aprova\u00E7\u00E3o ou pagamento.',
        holdIsLeftBehind: 'Despesas retidas s\u00E3o movidas para outro relat\u00F3rio ap\u00F3s aprova\u00E7\u00E3o ou pagamento.',
        unholdWhenReady: 'Os aprovadores podem liberar despesas quando estiverem prontas para aprova\u00E7\u00E3o ou pagamento.',
        changePolicyEducational: {
            title: 'Voc\u00EA moveu este relat\u00F3rio!',
            description: 'Verifique novamente estes itens, que tendem a mudar ao mover relat\u00F3rios para um novo espa\u00E7o de trabalho.',
            reCategorize: '<strong>Recategorize quaisquer despesas</strong> para cumprir as regras do espa\u00E7o de trabalho.',
            workflows: 'Este relat\u00F3rio pode agora estar sujeito a um <strong>fluxo de aprova\u00E7\u00E3o</strong> diferente.',
        },
        changeWorkspace: 'Alterar espa\u00E7o de trabalho',
        set: 'set',
        changed: 'alterado',
        removed: 'removido',
        transactionPending: 'Transa\u00E7\u00E3o pendente.',
        chooseARate: 'Selecione uma taxa de reembolso por milha ou quil\u00F4metro para o espa\u00E7o de trabalho',
        unapprove: 'Desaprovar',
        unapproveReport: 'Desaprovar relat\u00F3rio',
        headsUp: 'Aten\u00E7\u00E3o!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Este relat\u00F3rio j\u00E1 foi exportado para ${accountingIntegration}. Alter\u00E1-lo pode levar a discrep\u00E2ncias de dados. Tem certeza de que deseja desaprovar este relat\u00F3rio?`,
        reimbursable: 'reembols\u00E1vel',
        nonReimbursable: 'n\u00E3o reembols\u00E1vel',
        bookingPending: 'Esta reserva est\u00E1 pendente',
        bookingPendingDescription: 'Esta reserva est\u00E1 pendente porque ainda n\u00E3o foi paga.',
        bookingArchived: 'Esta reserva est\u00E1 arquivada',
        bookingArchivedDescription: 'Esta reserva est\u00E1 arquivada porque a data da viagem j\u00E1 passou. Adicione uma despesa para o valor final, se necess\u00E1rio.',
        attendees: 'Participantes',
        whoIsYourAccountant: 'Quem \u00E9 o seu contador?',
        paymentComplete: 'Pagamento conclu\u00EDdo',
        time: 'Tempo',
        startDate: 'Data de in\u00EDcio',
        endDate: 'Data de t\u00E9rmino',
        startTime: 'Hora de in\u00EDcio',
        endTime: 'Hora de t\u00E9rmino',
        deleteSubrate: 'Excluir subrate',
        deleteSubrateConfirmation: 'Tem certeza de que deseja excluir esta subtarifa?',
        quantity: 'Quantidade',
        subrateSelection: 'Selecione uma sub-taxa e insira uma quantidade.',
        qty: 'Qtd.',
        firstDayText: () => ({
            one: `Primeiro dia: 1 hora`,
            other: (count: number) => `Primeiro dia: ${count.toFixed(2)} horas`,
        }),
        lastDayText: () => ({
            one: `\u00DAltimo dia: 1 hora`,
            other: (count: number) => `\u00DAltimo dia: ${count.toFixed(2)} horas`,
        }),
        tripLengthText: () => ({
            one: `Viagem: 1 dia completo`,
            other: (count: number) => `Viagem: ${count} dias completos`,
        }),
        dates: 'Datas',
        rates: 'Taxas',
        submitsTo: ({name}: SubmitsToParams) => `Envia para ${name}`,
        moveExpenses: () => ({one: 'Mover despesa', other: 'Mover despesas'}),
    },
    share: {
        shareToExpensify: 'Compartilhar no Expensify',
        messageInputLabel: 'Mensagem',
    },
    notificationPreferencesPage: {
        header: 'Prefer\u00EAncias de notifica\u00E7\u00E3o',
        label: 'Notificar-me sobre novas mensagens',
        notificationPreferences: {
            always: 'Imediatamente',
            daily: 'Di\u00E1rio',
            mute: 'Silenciar',
            hidden: 'Oculto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'O n\u00FAmero n\u00E3o foi validado. Clique no bot\u00E3o para reenviar o link de valida\u00E7\u00E3o via mensagem de texto.',
        emailHasNotBeenValidated: 'O e-mail n\u00E3o foi validado. Clique no bot\u00E3o para reenviar o link de valida\u00E7\u00E3o por mensagem de texto.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carregar foto',
        removePhoto: 'Remover foto',
        editImage: 'Editar foto',
        viewPhoto: 'Ver foto',
        imageUploadFailed: 'Falha no upload da imagem',
        deleteWorkspaceError: 'Desculpe, houve um problema inesperado ao excluir o avatar do seu espa\u00E7o de trabalho.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `A imagem selecionada excede o tamanho m\u00E1ximo de upload de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Por favor, envie uma imagem maior que ${minHeightInPx}x${minWidthInPx} pixels e menor que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `A foto de perfil deve ser de um dos seguintes tipos: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Fundo do Modal',
    },
    profilePage: {
        profile: 'Perfil',
        preferredPronouns: 'Pronomes preferidos',
        selectYourPronouns: 'Selecione seus pronomes',
        selfSelectYourPronoun: 'Selecione seu pronome',
        emailAddress: 'Endere\u00E7o de e-mail',
        setMyTimezoneAutomatically: 'Definir meu fuso hor\u00E1rio automaticamente',
        timezone: 'Fuso hor\u00E1rio',
        invalidFileMessage: 'Arquivo inv\u00E1lido. Por favor, tente uma imagem diferente.',
        avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Por favor, tente novamente.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizando',
        profileAvatar: 'Avatar do perfil',
        publicSection: {
            title: 'P\u00FAblico',
            subtitle: 'Esses detalhes s\u00E3o exibidos no seu perfil p\u00FAblico. Qualquer pessoa pode v\u00EA-los.',
        },
        privateSection: {
            title: 'Privado',
            subtitle: 'Esses detalhes s\u00E3o usados para viagens e pagamentos. Eles nunca s\u00E3o exibidos no seu perfil p\u00FAblico.',
        },
    },
    securityPage: {
        title: 'Op\u00E7\u00F5es de seguran\u00E7a',
        subtitle: 'Habilite a autentica\u00E7\u00E3o de dois fatores para manter sua conta segura.',
        goToSecurity: 'Voltar para a p\u00E1gina de seguran\u00E7a',
    },
    shareCodePage: {
        title: 'Seu c\u00F3digo',
        subtitle: 'Convide membros para o Expensify compartilhando seu c\u00F3digo QR pessoal ou link de refer\u00EAncia.',
    },
    pronounsPage: {
        pronouns: 'Pronomes',
        isShownOnProfile: 'Seus pronomes s\u00E3o exibidos no seu perfil.',
        placeholderText: 'Pesquise para ver as op\u00E7\u00F5es',
    },
    contacts: {
        contactMethod: 'M\u00E9todo de contato',
        contactMethods: 'M\u00E9todos de contato',
        featureRequiresValidate: 'Este recurso requer que voc\u00EA valide sua conta.',
        validateAccount: 'Valide sua conta',
        helpTextBeforeEmail: 'Adicione mais maneiras para as pessoas encontrarem voc\u00EA e encaminharem recibos para',
        helpTextAfterEmail: 'de v\u00E1rios endere\u00E7os de e-mail.',
        pleaseVerify: 'Por favor, verifique este m\u00E9todo de contato',
        getInTouch: 'Sempre que precisarmos entrar em contato com voc\u00EA, usaremos este m\u00E9todo de contato.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${contactMethod}. Ele deve chegar dentro de um ou dois minutos.`,
        setAsDefault: 'Definir como padr\u00E3o',
        yourDefaultContactMethod:
            'Este \u00E9 seu m\u00E9todo de contato padr\u00E3o atual. Antes de poder exclu\u00ED-lo, voc\u00EA precisar\u00E1 escolher outro m\u00E9todo de contato e clicar em "Definir como padr\u00E3o".',
        removeContactMethod: 'Remover m\u00E9todo de contato',
        removeAreYouSure: 'Tem certeza de que deseja remover este m\u00E9todo de contato? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.',
        failedNewContact: 'Falha ao adicionar este m\u00E9todo de contato.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Falha ao enviar um novo c\u00F3digo m\u00E1gico. Por favor, aguarde um pouco e tente novamente.',
            validateSecondaryLogin: 'C\u00F3digo m\u00E1gico incorreto ou inv\u00E1lido. Por favor, tente novamente ou solicite um novo c\u00F3digo.',
            deleteContactMethod: 'Falha ao excluir o m\u00E9todo de contato. Por favor, entre em contato com o Concierge para obter ajuda.',
            setDefaultContactMethod: 'Falha ao definir um novo m\u00E9todo de contato padr\u00E3o. Por favor, entre em contato com o Concierge para obter ajuda.',
            addContactMethod: 'Falha ao adicionar este m\u00E9todo de contato. Por favor, entre em contato com o Concierge para obter ajuda.',
            enteredMethodIsAlreadySubmitted: 'Este m\u00E9todo de contato j\u00E1 existe',
            passwordRequired: 'senha necess\u00E1ria.',
            contactMethodRequired: 'M\u00E9todo de contato \u00E9 obrigat\u00F3rio',
            invalidContactMethod: 'M\u00E9todo de contato inv\u00E1lido',
        },
        newContactMethod: 'Novo m\u00E9todo de contato',
        goBackContactMethods: 'Voltar para m\u00E9todos de contato',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Ele / Dele / Dele',
        heHimHisTheyThemTheirs: 'Ele / Dele / Deles / Eles / Deles / Deles',
        sheHerHers: 'Ela / Dela / Delas',
        sheHerHersTheyThemTheirs: 'Ela / Dela / Deles / Eles / Deles / Deles',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Por / Pers',
        theyThemTheirs: 'Eles / Deles / Delas',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Chame-me pelo meu nome',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nome de exibi\u00E7\u00E3o',
        isShownOnProfile: 'Seu nome de exibi\u00E7\u00E3o \u00E9 mostrado no seu perfil.',
    },
    timezonePage: {
        timezone: 'Fuso hor\u00E1rio',
        isShownOnProfile: 'Seu fuso hor\u00E1rio \u00E9 exibido no seu perfil.',
        getLocationAutomatically: 'Determinar automaticamente sua localiza\u00E7\u00E3o',
    },
    updateRequiredView: {
        updateRequired: 'Atualiza\u00E7\u00E3o necess\u00E1ria',
        pleaseInstall: 'Por favor, atualize para a vers\u00E3o mais recente do New Expensify.',
        pleaseInstallExpensifyClassic: 'Por favor, instale a vers\u00E3o mais recente do Expensify.',
        toGetLatestChanges: 'Para celular ou desktop, baixe e instale a vers\u00E3o mais recente. Para web, atualize seu navegador.',
        newAppNotAvailable: 'O novo aplicativo Expensify n\u00E3o est\u00E1 mais dispon\u00EDvel.',
    },
    initialSettingsPage: {
        about: 'Sobre',
        aboutPage: {
            description:
                'O Novo Aplicativo Expensify \u00E9 desenvolvido por uma comunidade de desenvolvedores de c\u00F3digo aberto de todo o mundo. Ajude-nos a construir o futuro do Expensify.',
            appDownloadLinks: 'Links para download do app',
            viewKeyboardShortcuts: 'Ver atalhos de teclado',
            viewTheCode: 'Ver o c\u00F3digo',
            viewOpenJobs: 'Ver vagas abertas',
            reportABug: 'Relatar um bug',
            troubleshoot: 'Solu\u00E7\u00E3o de problemas',
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
            clearCacheAndRestart: 'Limpar cache e reiniciar',
            viewConsole: 'Ver console de depura\u00E7\u00E3o',
            debugConsole: 'Console de depura\u00E7\u00E3o',
            description: 'Use as ferramentas abaixo para ajudar a solucionar problemas na experi\u00EAncia do Expensify. Se voc\u00EA encontrar algum problema, por favor',
            submitBug: 'enviar um bug',
            confirmResetDescription: 'Todas as mensagens de rascunho n\u00E3o enviadas ser\u00E3o perdidas, mas o restante dos seus dados est\u00E1 seguro.',
            resetAndRefresh: 'Redefinir e atualizar',
            clientSideLogging: 'Registro do lado do cliente',
            noLogsToShare: 'Nenhum registro para compartilhar',
            useProfiling: 'Use o perfilamento',
            profileTrace: 'Rastreamento de perfil',
            releaseOptions: 'Op\u00E7\u00F5es de lan\u00E7amento',
            testingPreferences: 'Testando prefer\u00EAncias',
            useStagingServer: 'Usar Servidor de Staging',
            forceOffline: 'For\u00E7ar offline',
            simulatePoorConnection: 'Simular conex\u00E3o de internet ruim',
            simulateFailingNetworkRequests: 'Simular falhas em requisi\u00E7\u00F5es de rede',
            authenticationStatus: 'Status de autentica\u00E7\u00E3o',
            deviceCredentials: 'Credenciais do dispositivo',
            invalidate: 'Invalidar',
            destroy: 'Destruir',
            maskExportOnyxStateData: 'Mascarar dados sens\u00EDveis dos membros ao exportar o estado do Onyx',
            exportOnyxState: 'Exportar estado Onyx',
            importOnyxState: 'Importar estado Onyx',
            testCrash: 'Teste de falha',
            resetToOriginalState: 'Redefinir para o estado original',
            usingImportedState: 'Voc\u00EA est\u00E1 usando um estado importado. Pressione aqui para limp\u00E1-lo.',
            debugMode: 'Modo de depura\u00E7\u00E3o',
            invalidFile: 'Arquivo inv\u00E1lido',
            invalidFileDescription: 'O arquivo que voc\u00EA est\u00E1 tentando importar n\u00E3o \u00E9 v\u00E1lido. Por favor, tente novamente.',
            invalidateWithDelay: 'Invalidar com atraso',
        },
        debugConsole: {
            saveLog: 'Salvar log',
            shareLog: 'Compartilhar log',
            enterCommand: 'Digite o comando',
            execute: 'Executar',
            noLogsAvailable: 'Nenhum registro dispon\u00EDvel',
            logSizeTooLarge: ({size}: LogSizeParams) => `O tamanho do log excede o limite de ${size} MB. Por favor, use "Salvar log" para baixar o arquivo de log.`,
            logs: 'Logs',
            viewConsole: 'Ver console',
        },
        security: 'Seguran\u00E7a',
        signOut: 'Sair',
        restoreStashed: 'Restaurar login armazenado',
        signOutConfirmationText: 'Voc\u00EA perder\u00E1 todas as altera\u00E7\u00F5es offline se sair.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Leia o',
            phrase2: 'Termos de Servi\u00E7o',
            phrase3: 'e',
            phrase4: 'Privacidade',
        },
        help: 'Ajuda',
        accountSettings: 'Configura\u00E7\u00F5es da conta',
        account: 'Conta',
        general: 'Geral',
    },
    closeAccountPage: {
        closeAccount: 'Fechar conta',
        reasonForLeavingPrompt: 'N\u00F3s odiar\u00EDamos ver voc\u00EA partir! Poderia nos dizer o motivo, para que possamos melhorar?',
        enterMessageHere: 'Digite a mensagem aqui',
        closeAccountWarning: 'Fechar sua conta n\u00E3o pode ser desfeito.',
        closeAccountPermanentlyDeleteData: 'Tem certeza de que deseja excluir sua conta? Isso excluir\u00E1 permanentemente quaisquer despesas pendentes.',
        enterDefaultContactToConfirm: 'Por favor, insira seu m\u00E9todo de contato padr\u00E3o para confirmar que deseja encerrar sua conta. Seu m\u00E9todo de contato padr\u00E3o \u00E9:',
        enterDefaultContact: 'Insira seu m\u00E9todo de contato padr\u00E3o',
        defaultContact: 'M\u00E9todo de contato padr\u00E3o:',
        enterYourDefaultContactMethod: 'Por favor, insira seu m\u00E9todo de contato padr\u00E3o para encerrar sua conta.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Unir contas',
        accountDetails: {
            accountToMergeInto: 'Insira a conta na qual voc\u00EA deseja mesclar',
            notReversibleConsent: 'Eu entendo que isso n\u00E3o \u00E9 revers\u00EDvel.',
        },
        accountValidate: {
            confirmMerge: 'Tem certeza de que deseja mesclar contas?',
            lossOfUnsubmittedData: `A fus\u00E3o das suas contas \u00E9 irrevers\u00EDvel e resultar\u00E1 na perda de quaisquer despesas n\u00E3o enviadas para`,
            enterMagicCode: `Para continuar, por favor, insira o c\u00F3digo m\u00E1gico enviado para`,
            errors: {
                incorrectMagicCode: 'C\u00F3digo m\u00E1gico incorreto ou inv\u00E1lido. Por favor, tente novamente ou solicite um novo c\u00F3digo.',
                fallback: 'Algo deu errado. Por favor, tente novamente mais tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Contas mescladas!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Voc\u00EA uniu com sucesso todos os dados de`,
                beforeSecondEmail: `em`,
                afterSecondEmail: `. A partir de agora, voc\u00EA pode usar qualquer login para esta conta.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Estamos trabalhando nisso',
            limitedSupport: 'Ainda n\u00E3o oferecemos suporte para mesclar contas no Novo Expensify. Por favor, realize essa a\u00E7\u00E3o no Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Sinta-se \u00E0 vontade para',
                linkText: 'entre em contato com o Concierge',
                afterLink: 'se voc\u00EA tiver alguma d\u00FAvida!',
            },
            goToExpensifyClassic: 'Ir para Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Voc\u00EA n\u00E3o pode mesclar',
            beforeDomain: 'porque \u00E9 controlado por',
            afterDomain: '. Por favor',
            linkText: 'entre em contato com o Concierge',
            afterLink: 'para assist\u00EAncia.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Voc\u00EA n\u00E3o pode mesclar',
            afterEmail: 'em outras contas porque o administrador do seu dom\u00EDnio definiu isso como seu login principal. Por favor, mescle outras contas nele em vez disso.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Voc\u00EA n\u00E3o pode mesclar contas porque',
                beforeSecondEmail: 'tem autentica\u00E7\u00E3o de dois fatores (2FA) habilitada. Por favor, desative a 2FA para',
                afterSecondEmail: 'e tente novamente.',
            },
            learnMore: 'Saiba mais sobre como mesclar contas.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Voc\u00EA n\u00E3o pode mesclar',
            afterEmail: 'porque est\u00E1 bloqueado. Por favor,',
            linkText: 'entre em contato com o Concierge',
            afterLink: `para assist\u00EAncia.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Voc\u00EA n\u00E3o pode mesclar contas porque',
                afterEmail: 'n\u00E3o tem uma conta Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Por favor',
                linkText: 'adicionar como m\u00E9todo de contato',
                afterLink: 'em vez disso.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Voc\u00EA n\u00E3o pode mesclar',
            afterEmail: 'em outras contas. Por favor, mescle outras contas nele em vez disso.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Voc\u00EA n\u00E3o pode mesclar',
            afterEmail: 'em outras contas porque \u00E9 o propriet\u00E1rio de faturamento de uma conta faturada. Por favor, mescle outras contas nele em vez disso.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Tente novamente mais tarde',
            description: 'Houve muitas tentativas de mesclar contas. Por favor, tente novamente mais tarde.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Voc\u00EA n\u00E3o pode mesclar em outras contas porque ela n\u00E3o est\u00E1 validada. Por favor, valide a conta e tente novamente.',
        },
        mergeFailureSelfMerge: {
            description: 'Voc\u00EA n\u00E3o pode mesclar uma conta consigo mesma.',
        },
        mergeFailureGenericHeading: 'N\u00E3o \u00E9 poss\u00EDvel mesclar contas',
    },
    lockAccountPage: {
        lockAccount: 'Bloquear conta',
        unlockAccount: 'Desbloquear conta',
        compromisedDescription:
            'Se voc\u00EA suspeitar que sua conta Expensify foi comprometida, voc\u00EA pode bloque\u00E1-la para evitar novas transa\u00E7\u00F5es com o Cart\u00E3o Expensify e impedir altera\u00E7\u00F5es indesejadas na conta.',
        domainAdminsDescriptionPartOne: 'Para administradores de dom\u00EDnio,',
        domainAdminsDescriptionPartTwo: 'esta a\u00E7\u00E3o interrompe toda a atividade do Cart\u00E3o Expensify e a\u00E7\u00F5es administrativas',
        domainAdminsDescriptionPartThree: 'em todo o seu dom\u00EDnio/dom\u00EDnios.',
        warning: `Uma vez que sua conta estiver bloqueada, nossa equipe investigar\u00E1 e remover\u00E1 qualquer acesso n\u00E3o autorizado. Para recuperar o acesso, voc\u00EA precisar\u00E1 trabalhar com o Concierge para proteger sua conta.`,
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Falha ao bloquear a conta',
        failedToLockAccountDescription: `N\u00E3o conseguimos bloquear sua conta. Por favor, converse com o Concierge para resolver este problema.`,
        chatWithConcierge: 'Converse com o Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Conta bloqueada',
        yourAccountIsLocked: 'Sua conta est\u00E1 bloqueada',
        chatToConciergeToUnlock: 'Converse com o Concierge para resolver preocupa\u00E7\u00F5es de seguran\u00E7a e desbloquear sua conta.',
        chatWithConcierge: 'Converse com o Concierge',
    },
    passwordPage: {
        changePassword: 'Alterar senha',
        changingYourPasswordPrompt: 'Alterar sua senha atualizar\u00E1 sua senha tanto para sua conta Expensify.com quanto para sua conta New Expensify.',
        currentPassword: 'Senha atual',
        newPassword: 'Nova senha',
        newPasswordPrompt: 'Sua nova senha deve ser diferente da sua senha antiga e conter pelo menos 8 caracteres, 1 letra mai\u00FAscula, 1 letra min\u00FAscula e 1 n\u00FAmero.',
    },
    twoFactorAuth: {
        headerTitle: 'Autentica\u00E7\u00E3o de dois fatores',
        twoFactorAuthEnabled: 'Autentica\u00E7\u00E3o de dois fatores ativada',
        whatIsTwoFactorAuth:
            'A autentica\u00E7\u00E3o de dois fatores (2FA) ajuda a manter sua conta segura. Ao fazer login, voc\u00EA precisar\u00E1 inserir um c\u00F3digo gerado pelo seu aplicativo autenticador preferido.',
        disableTwoFactorAuth: 'Desativar a autentica\u00E7\u00E3o em duas etapas',
        explainProcessToRemove: 'Para desativar a autentica\u00E7\u00E3o de dois fatores (2FA), insira um c\u00F3digo v\u00E1lido do seu aplicativo de autentica\u00E7\u00E3o.',
        disabled: 'A autentica\u00E7\u00E3o de dois fatores est\u00E1 agora desativada.',
        noAuthenticatorApp: 'Voc\u00EA n\u00E3o precisar\u00E1 mais de um aplicativo autenticador para fazer login no Expensify.',
        stepCodes: 'C\u00F3digos de recupera\u00E7\u00E3o',
        keepCodesSafe: 'Mantenha esses c\u00F3digos de recupera\u00E7\u00E3o seguros!',
        codesLoseAccess:
            'Se voc\u00EA perder o acesso ao seu aplicativo autenticador e n\u00E3o tiver esses c\u00F3digos, perder\u00E1 o acesso \u00E0 sua conta.\n\nNota: Configurar a autentica\u00E7\u00E3o de dois fatores ir\u00E1 desconect\u00E1-lo de todas as outras sess\u00F5es ativas.',
        errorStepCodes: 'Por favor, copie ou baixe os c\u00F3digos antes de continuar.',
        stepVerify: 'Verificar',
        scanCode: 'Escaneie o c\u00F3digo QR usando seu',
        authenticatorApp: 'aplicativo autenticador',
        addKey: 'Ou adicione esta chave secreta ao seu aplicativo autenticador:',
        enterCode: 'Em seguida, insira o c\u00F3digo de seis d\u00EDgitos gerado pelo seu aplicativo autenticador.',
        stepSuccess: 'Conclu\u00EDdo',
        enabled: 'Autentica\u00E7\u00E3o de dois fatores ativada',
        congrats: 'Parab\u00E9ns! Agora voc\u00EA tem essa seguran\u00E7a extra.',
        copy: 'Copiar',
        disable: 'Desativar',
        enableTwoFactorAuth: 'Ativar autentica\u00E7\u00E3o de dois fatores',
        pleaseEnableTwoFactorAuth: 'Por favor, habilite a autentica\u00E7\u00E3o de dois fatores.',
        twoFactorAuthIsRequiredDescription: 'Para fins de seguran\u00E7a, a Xero exige autentica\u00E7\u00E3o de dois fatores para conectar a integra\u00E7\u00E3o.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autentica\u00E7\u00E3o de dois fatores necess\u00E1ria',
        twoFactorAuthIsRequiredForAdminsTitle: 'Por favor, ative a autentica\u00E7\u00E3o de dois fatores.',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Sua conex\u00E3o cont\u00E1bil do Xero requer o uso de autentica\u00E7\u00E3o de dois fatores. Para continuar usando o Expensify, por favor, ative-a.',
        twoFactorAuthCannotDisable: 'N\u00E3o \u00E9 poss\u00EDvel desativar a 2FA',
        twoFactorAuthRequired: 'A autentica\u00E7\u00E3o de dois fatores (2FA) \u00E9 necess\u00E1ria para sua conex\u00E3o Xero e n\u00E3o pode ser desativada.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Por favor, insira seu c\u00F3digo de recupera\u00E7\u00E3o',
            incorrectRecoveryCode: 'C\u00F3digo de recupera\u00E7\u00E3o incorreto. Por favor, tente novamente.',
        },
        useRecoveryCode: 'Usar c\u00F3digo de recupera\u00E7\u00E3o',
        recoveryCode: 'C\u00F3digo de recupera\u00E7\u00E3o',
        use2fa: 'Use o c\u00F3digo de autentica\u00E7\u00E3o de dois fatores',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Por favor, insira seu c\u00F3digo de autentica\u00E7\u00E3o de dois fatores',
            incorrect2fa: 'C\u00F3digo de autentica\u00E7\u00E3o de dois fatores incorreto. Por favor, tente novamente.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Senha atualizada!',
        allSet: 'Tudo pronto. Mantenha sua nova senha segura.',
    },
    privateNotes: {
        title: 'Notas privadas',
        personalNoteMessage: 'Mantenha anota\u00E7\u00F5es sobre este chat aqui. Voc\u00EA \u00E9 a \u00FAnica pessoa que pode adicionar, editar ou visualizar essas anota\u00E7\u00F5es.',
        sharedNoteMessage: 'Mantenha notas sobre este chat aqui. Funcion\u00E1rios da Expensify e outros membros do dom\u00EDnio team.expensify.com podem visualizar estas notas.',
        composerLabel: 'Notas',
        myNote: 'Minha nota',
        error: {
            genericFailureMessage: 'Notas privadas n\u00E3o puderam ser salvas',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Por favor, insira um c\u00F3digo de seguran\u00E7a v\u00E1lido',
        },
        securityCode: 'C\u00F3digo de seguran\u00E7a',
        changeBillingCurrency: 'Alterar moeda de faturamento',
        changePaymentCurrency: 'Alterar moeda de pagamento',
        paymentCurrency: 'Moeda de pagamento',
        paymentCurrencyDescription: 'Selecione uma moeda padronizada para a qual todas as despesas pessoais devem ser convertidas',
        note: 'Nota: Alterar sua moeda de pagamento pode impactar o quanto voc\u00EA pagar\u00E1 pelo Expensify. Consulte nosso',
        noteLink: 'p\u00E1gina de pre\u00E7os',
        noteDetails: 'para mais detalhes.',
    },
    addDebitCardPage: {
        addADebitCard: 'Adicionar um cart\u00E3o de d\u00E9bito',
        nameOnCard: 'Nome no cart\u00E3o',
        debitCardNumber: 'N\u00FAmero do cart\u00E3o de d\u00E9bito',
        expiration: 'Data de validade',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Endere\u00E7o de cobran\u00E7a',
        growlMessageOnSave: 'Seu cart\u00E3o de d\u00E9bito foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Por favor, insira um CEP v\u00E1lido',
            debitCardNumber: 'Por favor, insira um n\u00FAmero de cart\u00E3o de d\u00E9bito v\u00E1lido.',
            expirationDate: 'Por favor, selecione uma data de validade v\u00E1lida',
            securityCode: 'Por favor, insira um c\u00F3digo de seguran\u00E7a v\u00E1lido',
            addressStreet: 'Por favor, insira um endere\u00E7o de cobran\u00E7a v\u00E1lido que n\u00E3o seja uma caixa postal.',
            addressState: 'Por favor, selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cart\u00E3o. Por favor, tente novamente.',
            password: 'Por favor, insira sua senha do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Adicionar cart\u00E3o de pagamento',
        nameOnCard: 'Nome no cart\u00E3o',
        paymentCardNumber: 'N\u00FAmero do cart\u00E3o',
        expiration: 'Data de validade',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Endere\u00E7o de cobran\u00E7a',
        growlMessageOnSave: 'Seu cart\u00E3o de pagamento foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Por favor, insira um CEP v\u00E1lido',
            paymentCardNumber: 'Por favor, insira um n\u00FAmero de cart\u00E3o v\u00E1lido',
            expirationDate: 'Por favor, selecione uma data de validade v\u00E1lida',
            securityCode: 'Por favor, insira um c\u00F3digo de seguran\u00E7a v\u00E1lido',
            addressStreet: 'Por favor, insira um endere\u00E7o de cobran\u00E7a v\u00E1lido que n\u00E3o seja uma caixa postal.',
            addressState: 'Por favor, selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cart\u00E3o. Por favor, tente novamente.',
            password: 'Por favor, insira sua senha do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'M\u00E9todos de pagamento',
        setDefaultConfirmation: 'Tornar m\u00E9todo de pagamento padr\u00E3o',
        setDefaultSuccess: 'M\u00E9todo de pagamento padr\u00E3o definido!',
        deleteAccount: 'Excluir conta',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta conta?',
        error: {
            notOwnerOfBankAccount: 'Ocorreu um erro ao definir esta conta banc\u00E1ria como seu m\u00E9todo de pagamento padr\u00E3o.',
            invalidBankAccount: 'Esta conta banc\u00E1ria est\u00E1 temporariamente suspensa',
            notOwnerOfFund: 'Ocorreu um erro ao definir este cart\u00E3o como seu m\u00E9todo de pagamento padr\u00E3o.',
            setDefaultFailure: 'Algo deu errado. Por favor, converse com o Concierge para obter mais assist\u00EAncia.',
        },
        addBankAccountFailure: 'Ocorreu um erro inesperado ao tentar adicionar sua conta banc\u00E1ria. Por favor, tente novamente.',
        getPaidFaster: 'Receba mais r\u00E1pido',
        addPaymentMethod: 'Adicione um m\u00E9todo de pagamento para enviar e receber pagamentos diretamente no aplicativo.',
        getPaidBackFaster: 'Receba o reembolso mais r\u00E1pido',
        secureAccessToYourMoney: 'Acesso seguro ao seu dinheiro',
        receiveMoney: 'Receba dinheiro na sua moeda local',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Envie e receba dinheiro com amigos. Apenas contas banc\u00E1rias dos EUA.',
        enableWallet: 'Ativar carteira',
        addBankAccountToSendAndReceive: 'Receba reembolso pelas despesas que voc\u00EA enviar para um espa\u00E7o de trabalho.',
        addBankAccount: 'Adicionar conta banc\u00E1ria',
        assignedCards: 'Cart\u00F5es atribu\u00EDdos',
        assignedCardsDescription: 'Estes s\u00E3o cart\u00F5es atribu\u00EDdos por um administrador de espa\u00E7o de trabalho para gerenciar os gastos da empresa.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Estamos revisando suas informa\u00E7\u00F5es. Por favor, volte em alguns minutos!',
        walletActivationFailed: 'Infelizmente, sua carteira n\u00E3o pode ser ativada neste momento. Por favor, converse com o Concierge para obter mais assist\u00EAncia.',
        addYourBankAccount: 'Adicione sua conta banc\u00E1ria',
        addBankAccountBody: 'Vamos conectar sua conta banc\u00E1ria ao Expensify para que seja mais f\u00E1cil do que nunca enviar e receber pagamentos diretamente no aplicativo.',
        chooseYourBankAccount: 'Escolha sua conta banc\u00E1ria',
        chooseAccountBody: 'Certifique-se de selecionar o correto.',
        confirmYourBankAccount: 'Confirme sua conta banc\u00E1ria',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Cart\u00E3o de Viagem Expensify',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite inteligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Voc\u00EA pode gastar at\u00E9 ${formattedLimit} neste cart\u00E3o, e o limite ser\u00E1 redefinido \u00E0 medida que suas despesas enviadas forem aprovadas.`,
        },
        fixedLimit: {
            name: 'Limite fixo',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Voc\u00EA pode gastar at\u00E9 ${formattedLimit} neste cart\u00E3o, e ent\u00E3o ele ser\u00E1 desativado.`,
        },
        monthlyLimit: {
            name: 'Limite mensal',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Voc\u00EA pode gastar at\u00E9 ${formattedLimit} neste cart\u00E3o por m\u00EAs. O limite ser\u00E1 redefinido no 1\u00BA dia de cada m\u00EAs do calend\u00E1rio.`,
        },
        virtualCardNumber: 'N\u00FAmero do cart\u00E3o virtual',
        travelCardCvv: 'CVV do cart\u00E3o de viagem',
        physicalCardNumber: 'N\u00FAmero do cart\u00E3o f\u00EDsico',
        getPhysicalCard: 'Obter cart\u00E3o f\u00EDsico',
        reportFraud: 'Relatar fraude no cart\u00E3o virtual',
        reportTravelFraud: 'Relatar fraude no cart\u00E3o de viagem',
        reviewTransaction: 'Revisar transa\u00E7\u00E3o',
        suspiciousBannerTitle: 'Transa\u00E7\u00E3o suspeita',
        suspiciousBannerDescription: 'Notamos transa\u00E7\u00F5es suspeitas no seu cart\u00E3o. Toque abaixo para revisar.',
        cardLocked: 'Seu cart\u00E3o est\u00E1 temporariamente bloqueado enquanto nossa equipe revisa a conta da sua empresa.',
        cardDetails: {
            cardNumber: 'N\u00FAmero do cart\u00E3o virtual',
            expiration: 'Expira\u00E7\u00E3o',
            cvv: 'CVV',
            address: 'Endere\u00E7o',
            revealDetails: 'Revelar detalhes',
            revealCvv: 'Revelar CVV',
            copyCardNumber: 'Copiar n\u00FAmero do cart\u00E3o',
            updateAddress: 'Atualizar endere\u00E7o',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Adicionado \u00E0 carteira ${platform}`,
        cardDetailsLoadingFailure: 'Ocorreu um erro ao carregar os detalhes do cart\u00E3o. Por favor, verifique sua conex\u00E3o com a internet e tente novamente.',
        validateCardTitle: 'Vamos garantir que \u00E9 voc\u00EA',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${contactMethod} para visualizar os detalhes do seu cart\u00E3o. Ele deve chegar em um ou dois minutos.`,
    },
    workflowsPage: {
        workflowTitle: 'Gasto',
        workflowDescription: 'Configure um fluxo de trabalho desde o momento em que o gasto ocorre, incluindo aprova\u00E7\u00E3o e pagamento.',
        delaySubmissionTitle: 'Atrasar envios',
        delaySubmissionDescription: 'Escolha um cronograma personalizado para enviar despesas, ou deixe desativado para atualiza\u00E7\u00F5es em tempo real sobre gastos.',
        submissionFrequency: 'Frequ\u00EAncia de envio',
        submissionFrequencyDateOfMonth: 'Data do m\u00EAs',
        addApprovalsTitle: 'Adicionar aprova\u00E7\u00F5es',
        addApprovalButton: 'Adicionar fluxo de aprova\u00E7\u00E3o',
        addApprovalTip: 'Esse fluxo de trabalho padr\u00E3o se aplica a todos os membros, a menos que exista um fluxo de trabalho mais espec\u00EDfico.',
        approver: 'Aprovador',
        connectBankAccount: 'Conectar conta banc\u00E1ria',
        addApprovalsDescription: 'Exigir aprova\u00E7\u00E3o adicional antes de autorizar um pagamento.',
        makeOrTrackPaymentsTitle: 'Fazer ou acompanhar pagamentos',
        makeOrTrackPaymentsDescription: 'Adicione um pagador autorizado para pagamentos feitos no Expensify ou acompanhe pagamentos feitos em outro lugar.',
        editor: {
            submissionFrequency: 'Escolha quanto tempo o Expensify deve esperar antes de compartilhar gastos sem erros.',
        },
        frequencyDescription: 'Escolha com que frequ\u00EAncia voc\u00EA gostaria que as despesas fossem enviadas automaticamente ou fa\u00E7a isso manualmente.',
        frequencies: {
            instant: 'Instant\u00E2neo',
            weekly: 'Semanalmente',
            monthly: 'Mensalmente',
            twiceAMonth: 'Duas vezes por m\u00EAs',
            byTrip: 'Por viagem',
            manually: 'Manualmente',
            daily: 'Di\u00E1rio',
            lastDayOfMonth: '\u00DAltimo dia do m\u00EAs',
            lastBusinessDayOfMonth: '\u00DAltimo dia \u00FAtil do m\u00EAs',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Primeiro',
                '2': 'Segundo',
                '3': 'Terceiro',
                '4': 'Quarto',
                '5': 'Quinto',
                '6': 'Sexto',
                '7': 'S\u00E9timo',
                '8': 'Oitavo',
                '9': 'Nono',
                '10': 'D\u00E9cimo',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Este membro j\u00E1 pertence a outro fluxo de aprova\u00E7\u00E3o. Quaisquer atualiza\u00E7\u00F5es aqui ser\u00E3o refletidas l\u00E1 tamb\u00E9m.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> j\u00E1 aprova relat\u00F3rios para <strong>${name2}</strong>. Por favor, escolha um aprovador diferente para evitar um fluxo de trabalho circular.`,
        emptyContent: {
            title: 'Nenhum membro para exibir',
            expensesFromSubtitle: 'Todos os membros do espa\u00E7o de trabalho j\u00E1 pertencem a um fluxo de aprova\u00E7\u00E3o existente.',
            approverSubtitle: 'Todos os aprovadores pertencem a um fluxo de trabalho existente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'O envio atrasado n\u00E3o p\u00F4de ser alterado. Por favor, tente novamente ou entre em contato com o suporte.',
        autoReportingFrequencyErrorMessage: 'A frequ\u00EAncia de envio n\u00E3o p\u00F4de ser alterada. Por favor, tente novamente ou entre em contato com o suporte.',
        monthlyOffsetErrorMessage: 'A frequ\u00EAncia mensal n\u00E3o p\u00F4de ser alterada. Por favor, tente novamente ou entre em contato com o suporte.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmar',
        header: 'Adicione mais aprovadores e confirme.',
        additionalApprover: 'Aprovador adicional',
        submitButton: 'Adicionar fluxo de trabalho',
    },
    workflowsEditApprovalsPage: {
        title: 'Editar fluxo de aprova\u00E7\u00E3o',
        deleteTitle: 'Excluir fluxo de trabalho de aprova\u00E7\u00E3o',
        deletePrompt: 'Tem certeza de que deseja excluir este fluxo de aprova\u00E7\u00E3o? Todos os membros seguir\u00E3o o fluxo de trabalho padr\u00E3o.',
    },
    workflowsExpensesFromPage: {
        title: 'Despesas de',
        header: 'Quando os seguintes membros enviarem despesas:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'O aprovador n\u00E3o p\u00F4de ser alterado. Por favor, tente novamente ou entre em contato com o suporte.',
        header: 'Enviar para este membro para aprova\u00E7\u00E3o:',
    },
    workflowsPayerPage: {
        title: 'Pagador autorizado',
        genericErrorMessage: 'O pagador autorizado n\u00E3o p\u00F4de ser alterado. Por favor, tente novamente.',
        admins: 'Admins',
        payer: 'Pagador',
        paymentAccount: 'Conta de pagamento',
    },
    reportFraudPage: {
        title: 'Relatar fraude no cart\u00E3o virtual',
        description:
            'Se os detalhes do seu cart\u00E3o virtual forem roubados ou comprometidos, desativaremos permanentemente o seu cart\u00E3o existente e forneceremos um novo cart\u00E3o virtual e n\u00FAmero.',
        deactivateCard: 'Desativar cart\u00E3o',
        reportVirtualCardFraud: 'Relatar fraude no cart\u00E3o virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude no cart\u00E3o relatada',
        description:
            'Desativamos permanentemente seu cart\u00E3o existente. Quando voc\u00EA voltar para ver os detalhes do seu cart\u00E3o, ter\u00E1 um novo cart\u00E3o virtual dispon\u00EDvel.',
        buttonText: 'Entendi, obrigado!',
    },
    activateCardPage: {
        activateCard: 'Ativar cart\u00E3o',
        pleaseEnterLastFour: 'Por favor, insira os \u00FAltimos quatro d\u00EDgitos do seu cart\u00E3o.',
        activatePhysicalCard: 'Ativar cart\u00E3o f\u00EDsico',
        error: {
            thatDidNotMatch: 'Isso n\u00E3o corresponde aos \u00FAltimos 4 d\u00EDgitos do seu cart\u00E3o. Por favor, tente novamente.',
            throttled:
                'Voc\u00EA inseriu incorretamente os \u00FAltimos 4 d\u00EDgitos do seu Cart\u00E3o Expensify muitas vezes. Se voc\u00EA tiver certeza de que os n\u00FAmeros est\u00E3o corretos, entre em contato com o Concierge para resolver. Caso contr\u00E1rio, tente novamente mais tarde.',
        },
    },
    getPhysicalCard: {
        header: 'Obter cart\u00E3o f\u00EDsico',
        nameMessage: 'Digite seu nome e sobrenome, pois isso ser\u00E1 exibido no seu cart\u00E3o.',
        legalName: 'Nome legal',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        phoneMessage: 'Digite seu n\u00FAmero de telefone.',
        phoneNumber: 'N\u00FAmero de telefone',
        address: 'Endere\u00E7o',
        addressMessage: 'Insira seu endere\u00E7o de entrega.',
        streetAddress: 'Endere\u00E7o',
        city: 'Cidade',
        state: 'Estado',
        zipPostcode: 'CEP/C\u00F3digo Postal',
        country: 'Pa\u00EDs',
        confirmMessage: 'Por favor, confirme seus dados abaixo.',
        estimatedDeliveryMessage: 'Seu cart\u00E3o f\u00EDsico chegar\u00E1 em 2-3 dias \u00FAteis.',
        next: 'Pr\u00F3ximo',
        getPhysicalCard: 'Obter cart\u00E3o f\u00EDsico',
        shipCard: 'Cart\u00E3o de envio',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instant\u00E2neo (Cart\u00E3o de d\u00E9bito)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% de taxa (${minAmount} m\u00EDnimo)`,
        ach: '1-3 dias \u00FAteis (Conta banc\u00E1ria)',
        achSummary: 'Sem taxa',
        whichAccount: 'Qual conta?',
        fee: 'Taxa',
        transferSuccess: 'Transfer\u00EAncia bem-sucedida!',
        transferDetailBankAccount: 'Seu dinheiro deve chegar nos pr\u00F3ximos 1-3 dias \u00FAteis.',
        transferDetailDebitCard: 'Seu dinheiro deve chegar imediatamente.',
        failedTransfer: 'Seu saldo n\u00E3o est\u00E1 totalmente liquidado. Por favor, transfira para uma conta banc\u00E1ria.',
        notHereSubTitle: 'Por favor, transfira seu saldo da p\u00E1gina da carteira.',
        goToWallet: 'Ir para Carteira',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Escolher conta',
    },
    paymentMethodList: {
        addPaymentMethod: 'Adicionar m\u00E9todo de pagamento',
        addNewDebitCard: 'Adicionar novo cart\u00E3o de d\u00E9bito',
        addNewBankAccount: 'Adicionar nova conta banc\u00E1ria',
        accountLastFour: 'Terminando em',
        cardLastFour: 'Cart\u00E3o terminando em',
        addFirstPaymentMethod: 'Adicione um m\u00E9todo de pagamento para enviar e receber pagamentos diretamente no aplicativo.',
        defaultPaymentMethod: 'Padr\u00E3o',
    },
    preferencesPage: {
        appSection: {
            title: 'Prefer\u00EAncias do aplicativo',
        },
        testSection: {
            title: 'Prefer\u00EAncias de teste',
            subtitle: 'Configura\u00E7\u00F5es para ajudar a depurar e testar o aplicativo no ambiente de teste.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Receba atualiza\u00E7\u00F5es relevantes de recursos e not\u00EDcias do Expensify',
        muteAllSounds: 'Silenciar todos os sons do Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modo de prioridade',
        explainerText: 'Escolha se deseja #focus apenas em conversas n\u00E3o lidas e fixadas, ou mostrar tudo com as conversas mais recentes e fixadas no topo.',
        priorityModes: {
            default: {
                label: 'Mais recente',
                description: 'Mostrar todos os chats ordenados por mais recentes',
            },
            gsd: {
                label: '#focus',
                description: 'Mostrar apenas n\u00E3o lidos em ordem alfab\u00E9tica',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `em ${policyName}`,
        generatingPDF: 'Gerando PDF',
        waitForPDF: 'Por favor, aguarde enquanto geramos o PDF',
        errorPDF: 'Ocorreu um erro ao tentar gerar seu PDF.',
        generatedPDF: 'O PDF do seu relat\u00F3rio foi gerado!',
    },
    reportDescriptionPage: {
        roomDescription: 'Descri\u00E7\u00E3o do quarto',
        roomDescriptionOptional: 'Descri\u00E7\u00E3o do quarto (opcional)',
        explainerText: 'Defina uma descri\u00E7\u00E3o personalizada para a sala.',
    },
    groupChat: {
        lastMemberTitle: 'Aten\u00E7\u00E3o!',
        lastMemberWarning: 'Como voc\u00EA \u00E9 a \u00FAltima pessoa aqui, sair tornar\u00E1 este chat inacess\u00EDvel para todos os membros. Tem certeza de que deseja sair?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Chat em grupo de ${displayName}`,
    },
    languagePage: {
        language: 'Idioma',
        languages: {
            en: {
                label: 'Ingl\u00EAs',
            },
            es: {
                label: 'Portugu\u00EAs (BR)',
            },
        },
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Escuro',
            },
            light: {
                label: 'Luz',
            },
            system: {
                label: 'Usar configura\u00E7\u00F5es do dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Escolha um tema abaixo ou sincronize com as configura\u00E7\u00F5es do seu dispositivo.',
    },
    termsOfUse: {
        phrase1: 'Ao fazer login, voc\u00EA concorda com o/a/as/os',
        phrase2: 'Termos de Servi\u00E7o',
        phrase3: 'e',
        phrase4: 'Privacidade',
        phrase5: `A transmiss\u00E3o de dinheiro \u00E9 fornecida por ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) de acordo com seu`,
        phrase6: 'licen\u00E7as',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'N\u00E3o recebeu um c\u00F3digo m\u00E1gico?',
        enterAuthenticatorCode: 'Por favor, insira seu c\u00F3digo do autenticador',
        enterRecoveryCode: 'Por favor, insira seu c\u00F3digo de recupera\u00E7\u00E3o',
        requiredWhen2FAEnabled: 'Obrigat\u00F3rio quando a autentica\u00E7\u00E3o em duas etapas est\u00E1 ativada',
        requestNewCode: 'Solicitar um novo c\u00F3digo em',
        requestNewCodeAfterErrorOccurred: 'Solicitar um novo c\u00F3digo',
        error: {
            pleaseFillMagicCode: 'Por favor, insira seu c\u00F3digo m\u00E1gico',
            incorrectMagicCode: 'C\u00F3digo m\u00E1gico incorreto ou inv\u00E1lido. Por favor, tente novamente ou solicite um novo c\u00F3digo.',
            pleaseFillTwoFactorAuth: 'Por favor, insira seu c\u00F3digo de autentica\u00E7\u00E3o de dois fatores',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Por favor, preencha todos os campos',
        pleaseFillPassword: 'Por favor, insira sua senha',
        pleaseFillTwoFactorAuth: 'Por favor, insira seu c\u00F3digo de autentica\u00E7\u00E3o em duas etapas',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Digite seu c\u00F3digo de autentica\u00E7\u00E3o de dois fatores para continuar',
        forgot: 'Esqueceu?',
        requiredWhen2FAEnabled: 'Obrigat\u00F3rio quando a autentica\u00E7\u00E3o em duas etapas est\u00E1 ativada',
        error: {
            incorrectPassword: 'Senha incorreta. Por favor, tente novamente.',
            incorrectLoginOrPassword: 'Login ou senha incorretos. Por favor, tente novamente.',
            incorrect2fa: 'C\u00F3digo de autentica\u00E7\u00E3o de dois fatores incorreto. Por favor, tente novamente.',
            twoFactorAuthenticationEnabled: 'Voc\u00EA tem 2FA ativado nesta conta. Por favor, fa\u00E7a login usando seu e-mail ou n\u00FAmero de telefone.',
            invalidLoginOrPassword: 'Login ou senha inv\u00E1lidos. Por favor, tente novamente ou redefina sua senha.',
            unableToResetPassword:
                'N\u00E3o conseguimos alterar sua senha. Isso provavelmente se deve a um link de redefini\u00E7\u00E3o de senha expirado em um e-mail antigo de redefini\u00E7\u00E3o de senha. Enviamos um novo link para que voc\u00EA possa tentar novamente. Verifique sua Caixa de Entrada e sua pasta de Spam; ele deve chegar em apenas alguns minutos.',
            noAccess: 'Voc\u00EA n\u00E3o tem acesso a este aplicativo. Por favor, adicione seu nome de usu\u00E1rio do GitHub para obter acesso.',
            accountLocked: 'Sua conta foi bloqueada ap\u00F3s muitas tentativas sem sucesso. Por favor, tente novamente ap\u00F3s 1 hora.',
            fallback: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefone ou e-mail',
        error: {
            invalidFormatEmailLogin: 'O e-mail inserido \u00E9 inv\u00E1lido. Corrija o formato e tente novamente.',
        },
        cannotGetAccountDetails: 'N\u00E3o foi poss\u00EDvel recuperar os detalhes da conta. Tente fazer login novamente.',
        loginForm: 'Formul\u00E1rio de login',
        notYou: ({user}: NotYouParams) => `N\u00E3o \u00E9 ${user}?`,
    },
    onboarding: {
        welcome: 'Bem-vindo!',
        welcomeSignOffTitleManageTeam: 'Depois de concluir as tarefas acima, podemos explorar mais funcionalidades, como fluxos de trabalho de aprova\u00E7\u00E3o e regras!',
        welcomeSignOffTitle: '\u00C9 \u00F3timo conhec\u00EA-lo!',
        explanationModal: {
            title: 'Bem-vindo ao Expensify',
            description: 'Um aplicativo para gerenciar seus gastos empresariais e pessoais na velocidade do chat. Experimente e nos diga o que acha. Muito mais por vir!',
            secondaryDescription: 'Para voltar para o Expensify Classic, basta tocar na sua foto de perfil > Ir para Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Bem-vindo ao Expensify',
            description: 'Um aplicativo para gerenciar todos os seus gastos comerciais e pessoais em um chat. Feito para o seu neg\u00F3cio, sua equipe e seus amigos.',
        },
        getStarted: 'Come\u00E7ar',
        whatsYourName: 'Qual \u00E9 o seu nome?',
        peopleYouMayKnow: 'Pessoas que voc\u00EA pode conhecer j\u00E1 est\u00E3o aqui! Verifique seu e-mail para se juntar a elas.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Algu\u00E9m do ${domain} j\u00E1 criou um espa\u00E7o de trabalho. Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${email}.`,
        joinAWorkspace: 'Participar de um workspace',
        listOfWorkspaces: 'Aqui est\u00E1 a lista de espa\u00E7os de trabalho que voc\u00EA pode entrar. N\u00E3o se preocupe, voc\u00EA sempre pode entrar neles mais tarde, se preferir.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} \u2022 ${policyOwner}`,
        whereYouWork: 'Onde voc\u00EA trabalha?',
        errorSelection: 'Selecione uma op\u00E7\u00E3o para continuar',
        purpose: {
            title: 'O que voc\u00EA quer fazer hoje?',
            errorContinue: 'Por favor, pressione continuar para configurar',
            errorBackButton: 'Por favor, conclua as perguntas de configura\u00E7\u00E3o para come\u00E7ar a usar o aplicativo',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Receber reembolso do meu empregador',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gerenciar as despesas da minha equipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Acompanhe e orce despesas',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Converse e divida despesas com amigos',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Algo mais',
        },
        employees: {
            title: 'Quantos funcion\u00E1rios voc\u00EA tem?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 funcion\u00E1rios',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 funcion\u00E1rios',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 funcion\u00E1rios',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 funcion\u00E1rios',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mais de 1.000 funcion\u00E1rios',
        },
        accounting: {
            title: 'Voc\u00EA usa algum software de contabilidade?',
            none: 'Nenhum',
        },
        error: {
            requiredFirstName: 'Por favor, insira seu primeiro nome para continuar',
        },
        workEmail: {
            title: 'Qual \u00E9 o seu e-mail de trabalho?',
            subtitle: 'O Expensify funciona melhor quando voc\u00EA conecta seu e-mail de trabalho.',
            explanationModal: {
                descriptionOne: 'Encaminhe para receipts@expensify.com para digitaliza\u00E7\u00E3o',
                descriptionTwo: 'Junte-se aos seus colegas que j\u00E1 est\u00E3o usando o Expensify',
                descriptionThree: 'Aproveite uma experi\u00EAncia mais personalizada',
            },
            addWorkEmail: 'Adicionar e-mail de trabalho',
        },
        workEmailValidation: {
            title: 'Verifique seu e-mail de trabalho',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${workEmail}. Ele deve chegar em um ou dois minutos.`,
        },
        workEmailValidationError: {
            publicEmail: 'Por favor, insira um e-mail de trabalho v\u00E1lido de um dom\u00EDnio privado, por exemplo, mitch@company.com',
            offline: 'N\u00E3o conseguimos adicionar seu e-mail de trabalho, pois voc\u00EA parece estar offline.',
        },
        mergeBlockScreen: {
            title: 'N\u00E3o foi poss\u00EDvel adicionar o e-mail de trabalho',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `N\u00E3o conseguimos adicionar ${workEmail}. Por favor, tente novamente mais tarde em Configura\u00E7\u00F5es ou converse com o Concierge para obter orienta\u00E7\u00E3o.`,
        },
        workspace: {
            title: 'Mantenha-se organizado com um espa\u00E7o de trabalho',
            subtitle: 'Desbloqueie ferramentas poderosas para simplificar o gerenciamento de suas despesas, tudo em um s\u00F3 lugar. Com um espa\u00E7o de trabalho, voc\u00EA pode:',
            explanationModal: {
                descriptionOne: 'Acompanhe e organize recibos',
                descriptionTwo: 'Categorizar e etiquetar despesas',
                descriptionThree: 'Criar e compartilhar relat\u00F3rios',
            },
            price: 'Experimente gr\u00E1tis por 30 dias, depois fa\u00E7a o upgrade por apenas <strong>US$5/m\u00EAs</strong>.',
            createWorkspace: 'Criar espa\u00E7o de trabalho',
        },
        confirmWorkspace: {
            title: 'Confirmar espa\u00E7o de trabalho',
            subtitle: 'Crie um espa\u00E7o de trabalho para rastrear recibos, reembolsar despesas, gerenciar viagens, criar relat\u00F3rios e muito mais \u2014 tudo na velocidade do chat.',
        },
        inviteMembers: {
            title: 'Convidar membros',
            subtitle: 'Gerencie e compartilhe suas despesas com um contador ou inicie um grupo de viagem com amigos.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'N\u00E3o me mostre isso novamente',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'O nome n\u00E3o pode conter as palavras Expensify ou Concierge.',
            hasInvalidCharacter: 'O nome n\u00E3o pode conter uma v\u00EDrgula ou ponto e v\u00EDrgula',
            requiredFirstName: 'O primeiro nome n\u00E3o pode estar vazio',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual \u00E9 o seu nome legal?',
        enterDateOfBirth: 'Qual \u00E9 a sua data de nascimento?',
        enterAddress: 'Qual \u00E9 o seu endere\u00E7o?',
        enterPhoneNumber: 'Qual \u00E9 o seu n\u00FAmero de telefone?',
        personalDetails: 'Detalhes pessoais',
        privateDataMessage: 'Esses detalhes s\u00E3o usados para viagens e pagamentos. Eles nunca s\u00E3o exibidos no seu perfil p\u00FAblico.',
        legalName: 'Nome legal',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        address: 'Endere\u00E7o',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `A data deve ser anterior a ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `A data deve ser posterior a ${dateString}`,
            hasInvalidCharacter: 'O nome pode incluir apenas caracteres latinos',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formato de c\u00F3digo postal incorreto${zipFormat ? `Formato aceit\u00E1vel: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Por favor, certifique-se de que o n\u00FAmero de telefone \u00E9 v\u00E1lido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link foi reenviado',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Enviei um link m\u00E1gico de login para ${login}. Por favor, verifique seu ${loginType} para entrar.`,
        resendLink: 'Reenviar link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Para validar ${secondaryLogin}, por favor, reenvie o c\u00F3digo m\u00E1gico das Configura\u00E7\u00F5es da Conta de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se voc\u00EA n\u00E3o tiver mais acesso a ${primaryLogin}, por favor, desvincule suas contas.`,
        unlink: 'Desvincular',
        linkSent: 'Link enviado!',
        successfullyUnlinkedLogin: 'Login secund\u00E1rio desvinculado com sucesso!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nosso provedor de e-mail suspendeu temporariamente os e-mails para ${login} devido a problemas de entrega. Para desbloquear seu login, siga estas etapas:`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirme que ${login} est\u00E1 escrito corretamente e \u00E9 um endere\u00E7o de e-mail real e v\u00E1lido.`,
        emailAliases:
            'Os aliases de e-mail, como "expenses@domain.com", devem ter acesso \u00E0 sua pr\u00F3pria caixa de entrada de e-mail para que seja um login v\u00E1lido no Expensify.',
        ensureYourEmailClient: 'Certifique-se de que seu cliente de e-mail permita e-mails de expensify.com.',
        youCanFindDirections: 'Voc\u00EA pode encontrar instru\u00E7\u00F5es sobre como completar esta etapa',
        helpConfigure: 'mas voc\u00EA pode precisar que o seu departamento de TI ajude a configurar as suas configura\u00E7\u00F5es de e-mail.',
        onceTheAbove: 'Depois que as etapas acima forem conclu\u00EDdas, por favor entre em contato com',
        toUnblock: 'para desbloquear seu login.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `N\u00E3o conseguimos entregar mensagens SMS para ${login}, ent\u00E3o suspendemos temporariamente. Por favor, tente validar seu n\u00FAmero:`,
        validationSuccess: 'Seu n\u00FAmero foi validado! Clique abaixo para enviar um novo c\u00F3digo m\u00E1gico de login.',
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
                return 'Por favor, aguarde um momento antes de tentar novamente.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'dia' : 'dias'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'hora' : 'horas'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minuto' : 'minutos'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Aguarde! Voc\u00EA precisa esperar ${timeText} antes de tentar validar seu n\u00FAmero novamente.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Participar',
    },
    detailsPage: {
        localTime: 'Hora local',
    },
    newChatPage: {
        startGroup: 'Iniciar grupo',
        addToGroup: 'Adicionar ao grupo',
    },
    yearPickerPage: {
        year: 'Ano',
        selectYear: 'Por favor, selecione um ano',
    },
    focusModeUpdateModal: {
        title: 'Bem-vindo ao modo #focus!',
        prompt: 'Mantenha-se no controle vendo apenas os chats n\u00E3o lidos ou que precisam da sua aten\u00E7\u00E3o. N\u00E3o se preocupe, voc\u00EA pode mudar isso a qualquer momento em',
        settings: 'configura\u00E7\u00F5es',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'O chat que voc\u00EA est\u00E1 procurando n\u00E3o pode ser encontrado.',
        getMeOutOfHere: 'Tire-me daqui',
        iouReportNotFound: 'Os detalhes de pagamento que voc\u00EA est\u00E1 procurando n\u00E3o podem ser encontrados.',
        notHere: 'Hmm... n\u00E3o est\u00E1 aqui',
        pageNotFound: 'Ops, esta p\u00E1gina n\u00E3o pode ser encontrada.',
        noAccess: 'Este chat ou despesa pode ter sido exclu\u00EDdo ou voc\u00EA n\u00E3o tem acesso a ele.\n\nPara qualquer d\u00FAvida, entre em contato com concierge@expensify.com',
        goBackHome: 'Voltar para a p\u00E1gina inicial',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Algo deu errado`,
        subtitle: 'N\u00E3o foi poss\u00EDvel concluir sua solicita\u00E7\u00E3o. Por favor, tente novamente mais tarde.',
    },
    setPasswordPage: {
        enterPassword: 'Digite uma senha',
        setPassword: 'Definir senha',
        newPasswordPrompt: 'Sua senha deve ter pelo menos 8 caracteres, 1 letra mai\u00FAscula, 1 letra min\u00FAscula e 1 n\u00FAmero.',
        passwordFormTitle: 'Bem-vindo de volta ao Novo Expensify! Por favor, defina sua senha.',
        passwordNotSet: 'N\u00E3o conseguimos definir sua nova senha. Enviamos um link de nova senha para voc\u00EA tentar novamente.',
        setPasswordLinkInvalid: 'Este link para definir a senha \u00E9 inv\u00E1lido ou expirou. Um novo est\u00E1 esperando por voc\u00EA na sua caixa de entrada de e-mail!',
        validateAccount: 'Verificar conta',
    },
    statusPage: {
        status: 'Status',
        statusExplanation:
            'Adicione um emoji para dar aos seus colegas e amigos uma maneira f\u00E1cil de saber o que est\u00E1 acontecendo. Voc\u00EA tamb\u00E9m pode adicionar uma mensagem, se quiser!',
        today: 'Hoje',
        clearStatus: 'Limpar status',
        save: 'Salvar',
        message: 'Mensagem',
        timePeriods: {
            never: 'Nunca',
            thirtyMinutes: '30 minutos',
            oneHour: '1 hora',
            afterToday: 'Hoje',
            afterWeek: 'Uma semana',
            custom: 'Customizado',
        },
        untilTomorrow: 'At\u00E9 amanh\u00E3',
        untilTime: ({time}: UntilTimeParams) => `At\u00E9 ${time}`,
        date: 'Data',
        time: 'Tempo',
        clearAfter: 'Limpar ap\u00F3s',
        whenClearStatus: 'Quando devemos limpar seu status?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Etapa ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informa\u00E7\u00F5es banc\u00E1rias',
        confirmBankInfo: 'Confirme as informa\u00E7\u00F5es banc\u00E1rias',
        manuallyAdd: 'Adicione manualmente sua conta banc\u00E1ria',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        accountEnding: 'Conta terminando em',
        thisBankAccount: 'Esta conta banc\u00E1ria ser\u00E1 usada para pagamentos comerciais no seu espa\u00E7o de trabalho.',
        accountNumber: 'N\u00FAmero da conta',
        routingNumber: 'N\u00FAmero de roteamento',
        chooseAnAccountBelow: 'Escolha uma conta abaixo',
        addBankAccount: 'Adicionar conta banc\u00E1ria',
        chooseAnAccount: 'Escolha uma conta',
        connectOnlineWithPlaid: 'Fa\u00E7a login no seu banco',
        connectManually: 'Conectar manualmente',
        desktopConnection: 'Nota: Para se conectar com Chase, Wells Fargo, Capital One ou Bank of America, por favor clique aqui para completar este processo em um navegador.',
        yourDataIsSecure: 'Seus dados est\u00E3o seguros',
        toGetStarted: 'Adicione uma conta banc\u00E1ria para reembolsar despesas, emitir Cart\u00F5es Expensify, coletar pagamentos de faturas e pagar contas, tudo em um s\u00F3 lugar.',
        plaidBodyCopy: 'D\u00EA aos seus funcion\u00E1rios uma maneira mais f\u00E1cil de pagar - e serem reembolsados - por despesas da empresa.',
        checkHelpLine: 'Seu n\u00FAmero de roteamento e n\u00FAmero da conta podem ser encontrados em um cheque da conta.',
        hasPhoneLoginError: {
            phrase1: 'Para conectar uma conta banc\u00E1ria, por favor',
            link: 'adicione um e-mail como seu login principal',
            phrase2: 'e tente novamente. Voc\u00EA pode adicionar seu n\u00FAmero de telefone como um login secund\u00E1rio.',
        },
        hasBeenThrottledError: 'Ocorreu um erro ao adicionar sua conta banc\u00E1ria. Por favor, aguarde alguns minutos e tente novamente.',
        hasCurrencyError: {
            phrase1: 'Ops! Parece que a moeda do seu espa\u00E7o de trabalho est\u00E1 definida para uma moeda diferente de USD. Para continuar, por favor v\u00E1 para',
            link: 'suas configura\u00E7\u00F5es de espa\u00E7o de trabalho',
            phrase2: 'para definir como USD e tentar novamente.',
        },
        error: {
            youNeedToSelectAnOption: 'Por favor, selecione uma op\u00E7\u00E3o para continuar',
            noBankAccountAvailable: 'Desculpe, n\u00E3o h\u00E1 conta banc\u00E1ria dispon\u00EDvel.',
            noBankAccountSelected: 'Por favor, escolha uma conta',
            taxID: 'Por favor, insira um n\u00FAmero de identifica\u00E7\u00E3o fiscal v\u00E1lido.',
            website: 'Por favor, insira um site v\u00E1lido',
            zipCode: `Por favor, insira um c\u00F3digo postal v\u00E1lido usando o formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Por favor, insira um n\u00FAmero de telefone v\u00E1lido.',
            email: 'Por favor, insira um endere\u00E7o de e-mail v\u00E1lido.',
            companyName: 'Por favor, insira um nome comercial v\u00E1lido',
            addressCity: 'Por favor, insira uma cidade v\u00E1lida',
            addressStreet: 'Por favor, insira um endere\u00E7o de rua v\u00E1lido.',
            addressState: 'Por favor, selecione um estado v\u00E1lido',
            incorporationDateFuture: 'A data de incorpora\u00E7\u00E3o n\u00E3o pode estar no futuro',
            incorporationState: 'Por favor, selecione um estado v\u00E1lido',
            industryCode: 'Por favor, insira um c\u00F3digo de classifica\u00E7\u00E3o de ind\u00FAstria v\u00E1lido com seis d\u00EDgitos.',
            restrictedBusiness: 'Por favor, confirme que a empresa n\u00E3o est\u00E1 na lista de empresas restritas.',
            routingNumber: 'Por favor, insira um n\u00FAmero de roteamento v\u00E1lido.',
            accountNumber: 'Por favor, insira um n\u00FAmero de conta v\u00E1lido.',
            routingAndAccountNumberCannotBeSame: 'Os n\u00FAmeros de roteamento e de conta n\u00E3o podem coincidir.',
            companyType: 'Por favor, selecione um tipo de empresa v\u00E1lido',
            tooManyAttempts:
                'Devido a um alto n\u00FAmero de tentativas de login, esta op\u00E7\u00E3o foi desativada por 24 horas. Por favor, tente novamente mais tarde ou insira os detalhes manualmente.',
            address: 'Por favor, insira um endere\u00E7o v\u00E1lido',
            dob: 'Por favor, selecione uma data de nascimento v\u00E1lida.',
            age: 'Deve ter mais de 18 anos de idade',
            ssnLast4: 'Por favor, insira os \u00FAltimos 4 d\u00EDgitos v\u00E1lidos do SSN',
            firstName: 'Por favor, insira um nome v\u00E1lido',
            lastName: 'Por favor, insira um sobrenome v\u00E1lido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Por favor, adicione uma conta de dep\u00F3sito padr\u00E3o ou um cart\u00E3o de d\u00E9bito',
            validationAmounts: 'Os valores de valida\u00E7\u00E3o que voc\u00EA inseriu est\u00E3o incorretos. Por favor, verifique novamente seu extrato banc\u00E1rio e tente novamente.',
            fullName: 'Por favor, insira um nome completo v\u00E1lido',
            ownershipPercentage: 'Por favor, insira um n\u00FAmero percentual v\u00E1lido.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Onde est\u00E1 localizada a sua conta banc\u00E1ria?',
        accountDetailsStepHeader: 'Quais s\u00E3o os detalhes da sua conta?',
        accountTypeStepHeader: 'Que tipo de conta \u00E9 esta?',
        bankInformationStepHeader: 'Quais s\u00E3o os seus dados banc\u00E1rios?',
        accountHolderInformationStepHeader: 'Quais s\u00E3o os detalhes do titular da conta?',
        howDoWeProtectYourData: 'Como protegemos seus dados?',
        currencyHeader: 'Qual \u00E9 a moeda da sua conta banc\u00E1ria?',
        confirmationStepHeader: 'Verifique suas informa\u00E7\u00F5es.',
        confirmationStepSubHeader: 'Verifique os detalhes abaixo e marque a caixa de termos para confirmar.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Digite a senha do Expensify',
        alreadyAdded: 'Esta conta j\u00E1 foi adicionada.',
        chooseAccountLabel: 'Conta',
        successTitle: 'Conta banc\u00E1ria pessoal adicionada!',
        successMessage: 'Parab\u00E9ns, sua conta banc\u00E1ria est\u00E1 configurada e pronta para receber reembolsos.',
    },
    attachmentView: {
        unknownFilename: 'Nome de arquivo desconhecido',
        passwordRequired: 'Por favor, insira uma senha',
        passwordIncorrect: 'Senha incorreta. Por favor, tente novamente.',
        failedToLoadPDF: 'Falha ao carregar o arquivo PDF',
        pdfPasswordForm: {
            title: 'PDF protegido por senha',
            infoText: 'Este PDF est\u00E1 protegido por senha.',
            beforeLinkText: 'Por favor',
            linkText: 'insira a senha',
            afterLinkText: 'para visualiz\u00E1-lo.',
            formLabel: 'Ver PDF',
        },
        attachmentNotFound: 'Anexo n\u00E3o encontrado',
    },
    messages: {
        errorMessageInvalidPhone: `Por favor, insira um n\u00FAmero de telefone v\u00E1lido sem par\u00EAnteses ou tra\u00E7os. Se voc\u00EA estiver fora dos EUA, inclua o c\u00F3digo do seu pa\u00EDs (ex.: ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Email inv\u00E1lido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} j\u00E1 \u00E9 membro de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Ao continuar com a solicita\u00E7\u00E3o para ativar sua Expensify Wallet, voc\u00EA confirma que leu, compreendeu e aceitou',
        facialScan: 'Pol\u00EDtica e Autoriza\u00E7\u00E3o de Varredura Facial da Onfido',
        tryAgain: 'Tente novamente',
        verifyIdentity: 'Verificar identidade',
        letsVerifyIdentity: 'Vamos verificar sua identidade',
        butFirst: `Mas primeiro, a parte chata. Leia as informa\u00E7\u00F5es legais no pr\u00F3ximo passo e clique em "Aceitar" quando estiver pronto.`,
        genericError: 'Ocorreu um erro ao processar esta etapa. Por favor, tente novamente.',
        cameraPermissionsNotGranted: 'Ativar acesso \u00E0 c\u00E2mera',
        cameraRequestMessage:
            'Precisamos de acesso \u00E0 sua c\u00E2mera para concluir a verifica\u00E7\u00E3o da conta banc\u00E1ria. Por favor, habilite em Configura\u00E7\u00F5es > New Expensify.',
        microphonePermissionsNotGranted: 'Ativar acesso ao microfone',
        microphoneRequestMessage:
            'Precisamos de acesso ao seu microfone para concluir a verifica\u00E7\u00E3o da conta banc\u00E1ria. Por favor, habilite em Configura\u00E7\u00F5es > New Expensify.',
        originalDocumentNeeded: 'Por favor, envie uma imagem original do seu documento de identidade em vez de uma captura de tela ou imagem escaneada.',
        documentNeedsBetterQuality:
            'Seu documento de identidade parece estar danificado ou com recursos de seguran\u00E7a ausentes. Por favor, envie uma imagem original de um documento de identidade sem danos que esteja completamente vis\u00EDvel.',
        imageNeedsBetterQuality:
            'H\u00E1 um problema com a qualidade da imagem do seu documento de identidade. Por favor, envie uma nova imagem onde todo o seu documento de identidade possa ser visto claramente.',
        selfieIssue: 'H\u00E1 um problema com sua selfie/v\u00EDdeo. Por favor, envie uma selfie/v\u00EDdeo ao vivo.',
        selfieNotMatching:
            'Sua selfie/v\u00EDdeo n\u00E3o corresponde ao seu documento de identidade. Por favor, envie uma nova selfie/v\u00EDdeo onde seu rosto possa ser visto claramente.',
        selfieNotLive: 'Sua selfie/v\u00EDdeo n\u00E3o parece ser uma foto/v\u00EDdeo ao vivo. Por favor, envie uma selfie/v\u00EDdeo ao vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalhes adicionais',
        helpText: 'Precisamos confirmar as seguintes informa\u00E7\u00F5es antes que voc\u00EA possa enviar e receber dinheiro da sua carteira.',
        helpTextIdologyQuestions: 'Precisamos fazer apenas mais algumas perguntas para finalizar a valida\u00E7\u00E3o da sua identidade.',
        helpLink: 'Saiba mais sobre por que precisamos disso.',
        legalFirstNameLabel: 'Nome legal',
        legalMiddleNameLabel: 'Nome do meio legal',
        legalLastNameLabel: 'Sobrenome legal',
        selectAnswer: 'Por favor, selecione uma resposta para continuar',
        ssnFull9Error: 'Por favor, insira um SSN v\u00E1lido de nove d\u00EDgitos.',
        needSSNFull9: 'Estamos tendo problemas para verificar seu SSN. Por favor, insira os nove d\u00EDgitos completos do seu SSN.',
        weCouldNotVerify: 'N\u00E3o conseguimos verificar',
        pleaseFixIt: 'Por favor, corrija esta informa\u00E7\u00E3o antes de continuar.',
        failedKYCTextBefore: 'N\u00E3o conseguimos verificar sua identidade. Por favor, tente novamente mais tarde ou entre em contato com',
        failedKYCTextAfter: 'se voc\u00EA tiver alguma d\u00FAvida.',
    },
    termsStep: {
        headerTitle: 'Termos e taxas',
        headerTitleRefactor: 'Taxas e termos',
        haveReadAndAgree: 'Li e concordo em receber',
        electronicDisclosures: 'divulga\u00E7\u00F5es eletr\u00F4nicas',
        agreeToThe: 'Eu concordo com o/a',
        walletAgreement: 'Acordo de carteira',
        enablePayments: 'Ativar pagamentos',
        monthlyFee: 'Taxa mensal',
        inactivity: 'Inatividade',
        noOverdraftOrCredit: 'Sem recurso de cheque especial/cr\u00E9dito.',
        electronicFundsWithdrawal: 'Retirada eletr\u00F4nica de fundos',
        standard: 'Padr\u00E3o',
        reviewTheFees: 'D\u00EA uma olhada em algumas taxas.',
        checkTheBoxes: 'Por favor, marque as caixas abaixo.',
        agreeToTerms: 'Concorde com os termos e voc\u00EA estar\u00E1 pronto para come\u00E7ar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `A Expensify Wallet \u00E9 emitida por ${walletProgram}.`,
            perPurchase: 'Por compra',
            atmWithdrawal: 'Saque em caixa eletr\u00F4nico',
            cashReload: 'Recarga em dinheiro',
            inNetwork: 'na rede',
            outOfNetwork: 'fora da rede',
            atmBalanceInquiry: 'Consulta de saldo no caixa eletr\u00F4nico',
            inOrOutOfNetwork: '(dentro da rede ou fora da rede)',
            customerService: 'Atendimento ao cliente',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(ap\u00F3s 12 meses sem transa\u00E7\u00F5es)',
            weChargeOneFee: 'Cobramos 1 outro tipo de taxa. \u00C9:',
            fdicInsurance: 'Seus fundos s\u00E3o eleg\u00EDveis para seguro FDIC.',
            generalInfo: 'Para informa\u00E7\u00F5es gerais sobre contas pr\u00E9-pagas, visite',
            conditionsDetails: 'Para detalhes e condi\u00E7\u00F5es de todas as taxas e servi\u00E7os, visite',
            conditionsPhone: 'ou ligando para +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Uma lista de todas as taxas da Expensify Wallet',
            typeOfFeeHeader: 'Todas as taxas',
            feeAmountHeader: 'Quantia',
            moreDetailsHeader: 'Detalhes',
            openingAccountTitle: 'Abrindo uma conta',
            openingAccountDetails: 'N\u00E3o h\u00E1 taxa para abrir uma conta.',
            monthlyFeeDetails: 'N\u00E3o h\u00E1 taxa mensal.',
            customerServiceTitle: 'Atendimento ao cliente',
            customerServiceDetails: 'N\u00E3o h\u00E1 taxas de servi\u00E7o ao cliente.',
            inactivityDetails: 'N\u00E3o h\u00E1 taxa de inatividade.',
            sendingFundsTitle: 'Enviando fundos para outro titular de conta',
            sendingFundsDetails: 'N\u00E3o h\u00E1 taxa para enviar fundos a outro titular de conta usando seu saldo, conta banc\u00E1ria ou cart\u00E3o de d\u00E9bito.',
            electronicFundsStandardDetails:
                "There's no fee to transfer funds from your Expensify Wallet " +
                'to your bank account using the standard option. This transfer usually completes within 1-3 business' +
                ' days.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                "There's a fee to transfer funds from your Expensify Wallet to " +
                'your linked debit card using the instant transfer option. This transfer usually completes within ' +
                `several minutes. The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                'Your funds are eligible for FDIC insurance. Your funds will be held at or ' +
                `transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution. Once there, your funds are insured up ` +
                `to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements ` +
                `are met and your card is registered. See`,
            fdicInsuranceBancorp2: 'para detalhes.',
            contactExpensifyPayments: `Entre em contato com ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} ligando para +1 833-400-0904, por e-mail em`,
            contactExpensifyPayments2: 'ou entre em',
            generalInformation: 'Para informa\u00E7\u00F5es gerais sobre contas pr\u00E9-pagas, visite',
            generalInformation2:
                'Se voc\u00EA tiver uma reclama\u00E7\u00E3o sobre uma conta pr\u00E9-paga, ligue para o Bureau de Prote\u00E7\u00E3o Financeira do Consumidor pelo n\u00FAmero 1-855-411-2372 ou visite',
            printerFriendlyView: 'Ver vers\u00E3o para impress\u00E3o',
            automated: 'Automatizado',
            liveAgent: 'Agente ao vivo',
            instant: 'Instant\u00E2neo',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Ativar pagamentos',
        activatedTitle: 'Carteira ativada!',
        activatedMessage: 'Parab\u00E9ns, sua carteira est\u00E1 configurada e pronta para fazer pagamentos.',
        checkBackLaterTitle: 'S\u00F3 um minuto...',
        checkBackLaterMessage: 'Ainda estamos revisando suas informa\u00E7\u00F5es. Por favor, verifique novamente mais tarde.',
        continueToPayment: 'Continuar para o pagamento',
        continueToTransfer: 'Continuar a transferir',
    },
    companyStep: {
        headerTitle: 'Informa\u00E7\u00F5es da empresa',
        subtitle: 'Quase pronto! Para fins de seguran\u00E7a, precisamos confirmar algumas informa\u00E7\u00F5es:',
        legalBusinessName: 'Nome comercial legal',
        companyWebsite: 'Site da empresa',
        taxIDNumber: 'N\u00FAmero de identifica\u00E7\u00E3o fiscal',
        taxIDNumberPlaceholder: '9 d\u00EDgitos',
        companyType: 'Tipo de empresa',
        incorporationDate: 'Data de incorpora\u00E7\u00E3o',
        incorporationState: 'Estado de incorpora\u00E7\u00E3o',
        industryClassificationCode: 'C\u00F3digo de classifica\u00E7\u00E3o da ind\u00FAstria',
        confirmCompanyIsNot: 'Confirmo que esta empresa n\u00E3o est\u00E1 na',
        listOfRestrictedBusinesses: 'lista de empresas restritas',
        incorporationDatePlaceholder: 'Data de in\u00EDcio (aaaa-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empres\u00E1rio individual',
            OTHER: 'Outro',
        },
        industryClassification: 'Em qual setor a empresa est\u00E1 classificada?',
        industryClassificationCodePlaceholder: 'Pesquisar c\u00F3digo de classifica\u00E7\u00E3o da ind\u00FAstria',
    },
    requestorStep: {
        headerTitle: 'Informa\u00E7\u00F5es pessoais',
        learnMore: 'Saiba mais',
        isMyDataSafe: 'Meus dados est\u00E3o seguros?',
    },
    personalInfoStep: {
        personalInfo: 'Informa\u00E7\u00F5es pessoais',
        enterYourLegalFirstAndLast: 'Qual \u00E9 o seu nome legal?',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        legalName: 'Nome legal',
        enterYourDateOfBirth: 'Qual \u00E9 a sua data de nascimento?',
        enterTheLast4: 'Quais s\u00E3o os \u00FAltimos quatro d\u00EDgitos do seu N\u00FAmero de Seguro Social?',
        dontWorry: 'N\u00E3o se preocupe, n\u00E3o fazemos nenhuma verifica\u00E7\u00E3o de cr\u00E9dito pessoal!',
        last4SSN: '\u00DAltimos 4 do SSN',
        enterYourAddress: 'Qual \u00E9 o seu endere\u00E7o?',
        address: 'Endere\u00E7o',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        byAddingThisBankAccount: 'Ao adicionar esta conta banc\u00E1ria, voc\u00EA confirma que leu, entendeu e aceitou',
        whatsYourLegalName: 'Qual \u00E9 o seu nome legal?',
        whatsYourDOB: 'Qual \u00E9 a sua data de nascimento?',
        whatsYourAddress: 'Qual \u00E9 o seu endere\u00E7o?',
        whatsYourSSN: 'Quais s\u00E3o os \u00FAltimos quatro d\u00EDgitos do seu N\u00FAmero de Seguro Social?',
        noPersonalChecks: 'N\u00E3o se preocupe, n\u00E3o fazemos verifica\u00E7\u00F5es de cr\u00E9dito pessoal aqui!',
        whatsYourPhoneNumber: 'Qual \u00E9 o seu n\u00FAmero de telefone?',
        weNeedThisToVerify: 'Precisamos disso para verificar sua carteira.',
    },
    businessInfoStep: {
        businessInfo: 'Informa\u00E7\u00F5es da empresa',
        enterTheNameOfYourBusiness: 'Qual \u00E9 o nome da sua empresa?',
        businessName: 'Nome legal da empresa',
        enterYourCompanyTaxIdNumber: 'Qual \u00E9 o n\u00FAmero do CNPJ da sua empresa?',
        taxIDNumber: 'N\u00FAmero de identifica\u00E7\u00E3o fiscal',
        taxIDNumberPlaceholder: '9 d\u00EDgitos',
        enterYourCompanyWebsite: 'Qual \u00E9 o site da sua empresa?',
        companyWebsite: 'Site da empresa',
        enterYourCompanyPhoneNumber: 'Qual \u00E9 o n\u00FAmero de telefone da sua empresa?',
        enterYourCompanyAddress: 'Qual \u00E9 o endere\u00E7o da sua empresa?',
        selectYourCompanyType: 'Que tipo de empresa \u00E9 essa?',
        companyType: 'Tipo de empresa',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empres\u00E1rio individual',
            OTHER: 'Outro',
        },
        selectYourCompanyIncorporationDate: 'Qual \u00E9 a data de incorpora\u00E7\u00E3o da sua empresa?',
        incorporationDate: 'Data de incorpora\u00E7\u00E3o',
        incorporationDatePlaceholder: 'Data de in\u00EDcio (aaaa-mm-dd)',
        incorporationState: 'Estado de incorpora\u00E7\u00E3o',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Em qual estado sua empresa foi incorporada?',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        companyAddress: 'Endere\u00E7o da empresa',
        listOfRestrictedBusinesses: 'lista de empresas restritas',
        confirmCompanyIsNot: 'Confirmo que esta empresa n\u00E3o est\u00E1 na',
        businessInfoTitle: 'Informa\u00E7\u00F5es comerciais',
        legalBusinessName: 'Nome comercial legal',
        whatsTheBusinessName: 'Qual \u00E9 o nome da empresa?',
        whatsTheBusinessAddress: 'Qual \u00E9 o endere\u00E7o comercial?',
        whatsTheBusinessContactInformation: 'Qual \u00E9 a informa\u00E7\u00E3o de contato comercial?',
        whatsTheBusinessRegistrationNumber: 'Qual \u00E9 o n\u00FAmero de registro da empresa?',
        whatsTheBusinessTaxIDEIN: 'Qual \u00E9 o n\u00FAmero de identifica\u00E7\u00E3o fiscal/EIN/VAT/GST da empresa?',
        whatsThisNumber: 'Qual \u00E9 este n\u00FAmero?',
        whereWasTheBusinessIncorporated: 'Onde a empresa foi incorporada?',
        whatTypeOfBusinessIsIt: 'Que tipo de neg\u00F3cio \u00E9?',
        whatsTheBusinessAnnualPayment: 'Qual \u00E9 o volume anual de pagamentos da empresa?',
        whatsYourExpectedAverageReimbursements: 'Qual \u00E9 o valor m\u00E9dio de reembolso que voc\u00EA espera?',
        registrationNumber: 'N\u00FAmero de registro',
        taxIDEIN: 'N\u00FAmero de ID Fiscal/EIN',
        businessAddress: 'Endere\u00E7o comercial',
        businessType: 'Tipo de neg\u00F3cio',
        incorporation: 'Incorpora\u00E7\u00E3o',
        incorporationCountry: 'Pa\u00EDs de incorpora\u00E7\u00E3o',
        incorporationTypeName: 'Tipo de incorpora\u00E7\u00E3o',
        businessCategory: 'Categoria de neg\u00F3cios',
        annualPaymentVolume: 'Volume de pagamento anual',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume de pagamento anual em ${currencyCode}`,
        averageReimbursementAmount: 'Valor m\u00E9dio de reembolso',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Valor m\u00E9dio de reembolso em ${currencyCode}`,
        selectIncorporationType: 'Selecione o tipo de incorpora\u00E7\u00E3o',
        selectBusinessCategory: 'Selecione a categoria de neg\u00F3cio',
        selectAnnualPaymentVolume: 'Selecione o volume de pagamento anual',
        selectIncorporationCountry: 'Selecione o pa\u00EDs de incorpora\u00E7\u00E3o',
        selectIncorporationState: 'Selecione o estado de incorpora\u00E7\u00E3o',
        selectAverageReimbursement: 'Selecione o valor m\u00E9dio de reembolso',
        findIncorporationType: 'Encontrar tipo de incorpora\u00E7\u00E3o',
        findBusinessCategory: 'Encontrar categoria de neg\u00F3cios',
        findAnnualPaymentVolume: 'Encontrar volume de pagamento anual',
        findIncorporationState: 'Encontrar estado de incorpora\u00E7\u00E3o',
        findAverageReimbursement: 'Encontrar valor m\u00E9dio de reembolso',
        error: {
            registrationNumber: 'Por favor, forne\u00E7a um n\u00FAmero de registro v\u00E1lido.',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Voc\u00EA possui 25% ou mais de',
        doAnyIndividualOwn25percent: 'Algum indiv\u00EDduo possui 25% ou mais de',
        areThereMoreIndividualsWhoOwn25percent: 'Existem mais indiv\u00EDduos que possuem 25% ou mais de',
        regulationRequiresUsToVerifyTheIdentity: 'A regulamenta\u00E7\u00E3o exige que verifiquemos a identidade de qualquer indiv\u00EDduo que possua mais de 25% do neg\u00F3cio.',
        companyOwner: 'Propriet\u00E1rio de empresa',
        enterLegalFirstAndLastName: 'Qual \u00E9 o nome legal do propriet\u00E1rio?',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        enterTheDateOfBirthOfTheOwner: 'Qual \u00E9 a data de nascimento do propriet\u00E1rio?',
        enterTheLast4: 'Quais s\u00E3o os \u00FAltimos 4 d\u00EDgitos do N\u00FAmero de Seguro Social do propriet\u00E1rio?',
        last4SSN: '\u00DAltimos 4 do SSN',
        dontWorry: 'N\u00E3o se preocupe, n\u00E3o fazemos nenhuma verifica\u00E7\u00E3o de cr\u00E9dito pessoal!',
        enterTheOwnersAddress: 'Qual \u00E9 o endere\u00E7o do propriet\u00E1rio?',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        legalName: 'Nome legal',
        address: 'Endere\u00E7o',
        byAddingThisBankAccount: 'Ao adicionar esta conta banc\u00E1ria, voc\u00EA confirma que leu, entendeu e aceitou',
        owners: 'Propriet\u00E1rios',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informa\u00E7\u00F5es do propriet\u00E1rio',
        businessOwner: 'Propriet\u00E1rio de empresa',
        signerInfo: 'Informa\u00E7\u00F5es do assinante',
        doYouOwn: ({companyName}: CompanyNameParams) => `Voc\u00EA possui 25% ou mais de ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Algum indiv\u00EDduo possui 25% ou mais de ${companyName}?`,
        regulationsRequire: 'Os regulamentos exigem que verifiquemos a identidade de qualquer indiv\u00EDduo que possua mais de 25% do neg\u00F3cio.',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        whatsTheOwnersName: 'Qual \u00E9 o nome legal do propriet\u00E1rio?',
        whatsYourName: 'Qual \u00E9 o seu nome legal?',
        whatPercentage: 'Qual a porcentagem do neg\u00F3cio que pertence ao propriet\u00E1rio?',
        whatsYoursPercentage: 'Qual porcentagem do neg\u00F3cio voc\u00EA possui?',
        ownership: 'Propriedade',
        whatsTheOwnersDOB: 'Qual \u00E9 a data de nascimento do propriet\u00E1rio?',
        whatsYourDOB: 'Qual \u00E9 a sua data de nascimento?',
        whatsTheOwnersAddress: 'Qual \u00E9 o endere\u00E7o do propriet\u00E1rio?',
        whatsYourAddress: 'Qual \u00E9 o seu endere\u00E7o?',
        whatAreTheLast: 'Quais s\u00E3o os \u00FAltimos 4 d\u00EDgitos do N\u00FAmero de Seguro Social do propriet\u00E1rio?',
        whatsYourLast: 'Quais s\u00E3o os \u00FAltimos 4 d\u00EDgitos do seu N\u00FAmero de Seguro Social?',
        dontWorry: 'N\u00E3o se preocupe, n\u00E3o fazemos nenhuma verifica\u00E7\u00E3o de cr\u00E9dito pessoal!',
        last4: '\u00DAltimos 4 do SSN',
        whyDoWeAsk: 'Por que pedimos isso?',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        legalName: 'Nome legal',
        ownershipPercentage: 'Porcentagem de propriedade',
        areThereOther: ({companyName}: CompanyNameParams) => `Existem outras pessoas que possuem 25% ou mais de ${companyName}?`,
        owners: 'Propriet\u00E1rios',
        addCertified: 'Adicione um organograma certificado que mostre os propriet\u00E1rios benefici\u00E1rios',
        regulationRequiresChart:
            'A regulamenta\u00E7\u00E3o exige que coletemos uma c\u00F3pia certificada do organograma de propriedade que mostra cada indiv\u00EDduo ou entidade que possui 25% ou mais do neg\u00F3cio.',
        uploadEntity: 'Carregar gr\u00E1fico de propriedade da entidade',
        noteEntity: 'Nota: O gr\u00E1fico de propriedade da entidade deve ser assinado pelo seu contador, consultor jur\u00EDdico ou autenticado em cart\u00F3rio.',
        certified: 'Gr\u00E1fico de propriedade da entidade certificada',
        selectCountry: 'Selecionar pa\u00EDs',
        findCountry: 'Encontrar pa\u00EDs',
        address: 'Endere\u00E7o',
        chooseFile: 'Escolher arquivo',
        uploadDocuments: 'Carregar documenta\u00E7\u00E3o adicional',
        pleaseUpload:
            'Por favor, envie documenta\u00E7\u00E3o adicional abaixo para nos ajudar a verificar sua identidade como propriet\u00E1rio direto ou indireto de 25% ou mais da entidade empresarial.',
        acceptedFiles: 'Formatos de arquivo aceitos: PDF, PNG, JPEG. O tamanho total do arquivo para cada se\u00E7\u00E3o n\u00E3o pode exceder 5 MB.',
        proofOfBeneficialOwner: 'Prova de benefici\u00E1rio final',
        proofOfBeneficialOwnerDescription:
            'Por favor, forne\u00E7a uma declara\u00E7\u00E3o assinada e um organograma de um contador p\u00FAblico, not\u00E1rio ou advogado verificando a propriedade de 25% ou mais do neg\u00F3cio. Deve estar datado dos \u00FAltimos tr\u00EAs meses e incluir o n\u00FAmero da licen\u00E7a do signat\u00E1rio.',
        copyOfID: 'C\u00F3pia do documento de identidade do propriet\u00E1rio benefici\u00E1rio',
        copyOfIDDescription: 'Exemplos: Passaporte, carteira de motorista, etc.',
        proofOfAddress: 'Comprovante de endere\u00E7o para o benefici\u00E1rio final',
        proofOfAddressDescription: 'Exemplos: Conta de servi\u00E7os, contrato de aluguel, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Por favor, envie um v\u00EDdeo de uma visita ao local ou uma chamada gravada com o respons\u00E1vel pela assinatura. O respons\u00E1vel deve fornecer: nome completo, data de nascimento, nome da empresa, n\u00FAmero de registro, n\u00FAmero do c\u00F3digo fiscal, endere\u00E7o registrado, natureza do neg\u00F3cio e finalidade da conta.',
    },
    validationStep: {
        headerTitle: 'Validar conta banc\u00E1ria',
        buttonText: 'Concluir configura\u00E7\u00E3o',
        maxAttemptsReached: 'A valida\u00E7\u00E3o para esta conta banc\u00E1ria foi desativada devido a muitas tentativas incorretas.',
        description: `Dentro de 1-2 dias \u00FAteis, enviaremos tr\u00EAs (3) pequenas transa\u00E7\u00F5es para sua conta banc\u00E1ria com um nome como "Expensify, Inc. Validation".`,
        descriptionCTA: 'Por favor, insira o valor de cada transa\u00E7\u00E3o nos campos abaixo. Exemplo: 1,51.',
        reviewingInfo: 'Obrigado! Estamos revisando suas informa\u00E7\u00F5es e entraremos em contato em breve. Por favor, verifique seu chat com o Concierge.',
        forNextStep: 'para os pr\u00F3ximos passos para concluir a configura\u00E7\u00E3o da sua conta banc\u00E1ria.',
        letsChatCTA: 'Sim, vamos conversar',
        letsChatText: 'Quase l\u00E1! Precisamos da sua ajuda para verificar algumas \u00FAltimas informa\u00E7\u00F5es pelo chat. Pronto?',
        letsChatTitle: 'Vamos conversar!',
        enable2FATitle: 'Previna fraudes, ative a autentica\u00E7\u00E3o de dois fatores (2FA)',
        enable2FAText:
            'Levamos sua seguran\u00E7a a s\u00E9rio. Por favor, configure a autentica\u00E7\u00E3o de dois fatores (2FA) agora para adicionar uma camada extra de prote\u00E7\u00E3o \u00E0 sua conta.',
        secureYourAccount: 'Proteja sua conta',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informa\u00E7\u00F5es adicionais',
        checkAllThatApply: 'Marque todas as op\u00E7\u00F5es aplic\u00E1veis, caso contr\u00E1rio, deixe em branco.',
        iOwnMoreThan25Percent: 'Eu possuo mais de 25% de',
        someoneOwnsMoreThan25Percent: 'Outra pessoa possui mais de 25% de',
        additionalOwner: 'Propriet\u00E1rio adicional benefici\u00E1rio',
        removeOwner: 'Remover este benefici\u00E1rio final',
        addAnotherIndividual: 'Adicione outra pessoa que possua mais de 25% de',
        agreement: 'Acordo:',
        termsAndConditions: 'termos e condi\u00E7\u00F5es',
        certifyTrueAndAccurate: 'Eu certifico que as informa\u00E7\u00F5es fornecidas s\u00E3o verdadeiras e precisas.',
        error: {
            certify: 'Deve certificar que as informa\u00E7\u00F5es s\u00E3o verdadeiras e precisas',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Concluir verifica\u00E7\u00E3o',
        confirmAgreements: 'Por favor, confirme os acordos abaixo.',
        certifyTrueAndAccurate: 'Eu certifico que as informa\u00E7\u00F5es fornecidas s\u00E3o verdadeiras e precisas.',
        certifyTrueAndAccurateError: 'Por favor, certifique-se de que as informa\u00E7\u00F5es s\u00E3o verdadeiras e precisas.',
        isAuthorizedToUseBankAccount: 'Estou autorizado a usar esta conta banc\u00E1ria empresarial para despesas comerciais.',
        isAuthorizedToUseBankAccountError: 'Voc\u00EA deve ser um respons\u00E1vel de controle com autoriza\u00E7\u00E3o para operar a conta banc\u00E1ria da empresa.',
        termsAndConditions: 'termos e condi\u00E7\u00F5es',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Conectar conta banc\u00E1ria',
        finishButtonText: 'Concluir configura\u00E7\u00E3o',
        validateYourBankAccount: 'Valide sua conta banc\u00E1ria',
        validateButtonText: 'Validar',
        validationInputLabel: 'Transa\u00E7\u00E3o',
        maxAttemptsReached: 'A valida\u00E7\u00E3o para esta conta banc\u00E1ria foi desativada devido a muitas tentativas incorretas.',
        description: `Dentro de 1-2 dias \u00FAteis, enviaremos tr\u00EAs (3) pequenas transa\u00E7\u00F5es para sua conta banc\u00E1ria com um nome como "Expensify, Inc. Validation".`,
        descriptionCTA: 'Por favor, insira o valor de cada transa\u00E7\u00E3o nos campos abaixo. Exemplo: 1,51.',
        reviewingInfo: 'Obrigado! Estamos revisando suas informa\u00E7\u00F5es e entraremos em contato em breve. Por favor, verifique seu chat com o Concierge.',
        forNextSteps: 'para os pr\u00F3ximos passos para concluir a configura\u00E7\u00E3o da sua conta banc\u00E1ria.',
        letsChatCTA: 'Sim, vamos conversar',
        letsChatText: 'Quase l\u00E1! Precisamos da sua ajuda para verificar algumas \u00FAltimas informa\u00E7\u00F5es pelo chat. Pronto?',
        letsChatTitle: 'Vamos conversar!',
        enable2FATitle: 'Previna fraudes, ative a autentica\u00E7\u00E3o de dois fatores (2FA)',
        enable2FAText:
            'Levamos sua seguran\u00E7a a s\u00E9rio. Por favor, configure a autentica\u00E7\u00E3o de dois fatores (2FA) agora para adicionar uma camada extra de prote\u00E7\u00E3o \u00E0 sua conta.',
        secureYourAccount: 'Proteja sua conta',
    },
    countryStep: {
        confirmBusinessBank: 'Confirme a moeda e o pa\u00EDs da conta banc\u00E1ria empresarial',
        confirmCurrency: 'Confirmar moeda e pa\u00EDs',
        yourBusiness: 'A moeda da conta banc\u00E1ria da sua empresa deve corresponder \u00E0 moeda do seu espa\u00E7o de trabalho.',
        youCanChange: 'Voc\u00EA pode alterar a moeda do seu espa\u00E7o de trabalho no seu',
        findCountry: 'Encontrar pa\u00EDs',
        selectCountry: 'Selecionar pa\u00EDs',
    },
    bankInfoStep: {
        whatAreYour: 'Quais s\u00E3o os detalhes da sua conta banc\u00E1ria empresarial?',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 certo.',
        thisBankAccount: 'Esta conta banc\u00E1ria ser\u00E1 usada para pagamentos comerciais no seu espa\u00E7o de trabalho.',
        accountNumber: 'N\u00FAmero da conta',
        accountHolderNameDescription: 'Nome completo do assinante autorizado',
    },
    signerInfoStep: {
        signerInfo: 'Informa\u00E7\u00F5es do assinante',
        areYouDirector: ({companyName}: CompanyNameParams) => `Voc\u00EA \u00E9 um diretor ou executivo s\u00EAnior na ${companyName}?`,
        regulationRequiresUs: 'A regulamenta\u00E7\u00E3o exige que verifiquemos se o signat\u00E1rio tem autoridade para realizar esta a\u00E7\u00E3o em nome da empresa.',
        whatsYourName: 'Qual \u00E9 o seu nome legal?',
        fullName: 'Nome completo legal',
        whatsYourJobTitle: 'Qual \u00E9 o seu cargo?',
        jobTitle: 'T\u00EDtulo do cargo',
        whatsYourDOB: 'Qual \u00E9 a sua data de nascimento?',
        uploadID: 'Carregue o documento de identidade e comprovante de endere\u00E7o',
        personalAddress: 'Comprovante de endere\u00E7o pessoal (por exemplo, conta de servi\u00E7o p\u00FAblico)',
        letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
        legalName: 'Nome legal',
        proofOf: 'Comprovante de endere\u00E7o pessoal',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Digite o e-mail do diretor ou executivo s\u00EAnior da ${companyName}`,
        regulationRequiresOneMoreDirector: 'A regulamenta\u00E7\u00E3o exige pelo menos mais um diretor ou executivo s\u00EAnior como assinante.',
        hangTight: 'Aguarde...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Insira os e-mails de dois diretores ou executivos seniores na ${companyName}`,
        sendReminder: 'Enviar um lembrete',
        chooseFile: 'Escolher arquivo',
        weAreWaiting: 'Estamos aguardando que outros verifiquem suas identidades como diretores ou executivos seniores da empresa.',
        id: 'C\u00F3pia do RG',
        proofOfDirectors: 'Prova de diretor(es)',
        proofOfDirectorsDescription: 'Exemplos: Perfil Corporativo Oncorp ou Registro de Neg\u00F3cios.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale para Signat\u00E1rios, Usu\u00E1rios Autorizados e Propriet\u00E1rios Benefici\u00E1rios.',
        PDSandFSG: 'Documenta\u00E7\u00E3o de divulga\u00E7\u00E3o PDS + FSG',
        PDSandFSGDescription:
            'Nossa parceria com a Corpay utiliza uma conex\u00E3o API para aproveitar sua vasta rede de parceiros banc\u00E1rios internacionais para viabilizar Reembolsos Globais no Expensify. Conforme a regulamenta\u00E7\u00E3o australiana, estamos fornecendo a voc\u00EA o Guia de Servi\u00E7os Financeiros (FSG) e a Declara\u00E7\u00E3o de Divulga\u00E7\u00E3o de Produto (PDS) da Corpay.\n\nPor favor, leia os documentos FSG e PDS com aten\u00E7\u00E3o, pois eles cont\u00EAm detalhes completos e informa\u00E7\u00F5es importantes sobre os produtos e servi\u00E7os oferecidos pela Corpay. Guarde esses documentos para refer\u00EAncia futura.',
        pleaseUpload: 'Por favor, envie documenta\u00E7\u00E3o adicional abaixo para nos ajudar a verificar sua identidade como diretor ou executivo s\u00EAnior da entidade empresarial.',
    },
    agreementsStep: {
        agreements: 'Acordos',
        pleaseConfirm: 'Por favor, confirme os acordos abaixo',
        regulationRequiresUs: 'A regulamenta\u00E7\u00E3o exige que verifiquemos a identidade de qualquer indiv\u00EDduo que possua mais de 25% do neg\u00F3cio.',
        iAmAuthorized: 'Estou autorizado a usar a conta banc\u00E1ria empresarial para despesas comerciais.',
        iCertify: 'Certifico que as informa\u00E7\u00F5es fornecidas s\u00E3o verdadeiras e precisas.',
        termsAndConditions: 'termos e condi\u00E7\u00F5es',
        accept: 'Aceitar e adicionar conta banc\u00E1ria',
        iConsentToThe: 'Eu concordo com o',
        privacyNotice: 'aviso de privacidade',
        error: {
            authorized: 'Voc\u00EA deve ser um respons\u00E1vel de controle com autoriza\u00E7\u00E3o para operar a conta banc\u00E1ria da empresa.',
            certify: 'Por favor, certifique-se de que as informa\u00E7\u00F5es s\u00E3o verdadeiras e precisas.',
            consent: 'Por favor, consinta com o aviso de privacidade',
        },
    },
    finishStep: {
        connect: 'Conectar conta banc\u00E1ria',
        letsFinish: 'Vamos terminar no chat!',
        thanksFor:
            'Obrigado por esses detalhes. Um agente de suporte dedicado agora revisar\u00E1 suas informa\u00E7\u00F5es. Voltaremos a entrar em contato se precisarmos de mais alguma coisa, mas, enquanto isso, sinta-se \u00E0 vontade para nos contatar se tiver alguma d\u00FAvida.',
        iHaveA: 'Eu tenho uma pergunta',
        enable2FA: 'Ative a autentica\u00E7\u00E3o de dois fatores (2FA) para prevenir fraudes',
        weTake: 'Levamos sua seguran\u00E7a a s\u00E9rio. Por favor, configure a autentica\u00E7\u00E3o de dois fatores (2FA) agora para adicionar uma camada extra de prote\u00E7\u00E3o \u00E0 sua conta.',
        secure: 'Proteja sua conta',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Um momento',
        explanationLine: 'Estamos analisando suas informa\u00E7\u00F5es. Voc\u00EA poder\u00E1 continuar com os pr\u00F3ximos passos em breve.',
    },
    session: {
        offlineMessageRetry: 'Parece que voc\u00EA est\u00E1 offline. Por favor, verifique sua conex\u00E3o e tente novamente.',
    },
    travel: {
        header: 'Reservar viagem',
        title: 'Viaje com intelig\u00EAncia',
        subtitle: 'Use o Expensify Travel para obter as melhores ofertas de viagem e gerenciar todas as suas despesas de neg\u00F3cios em um s\u00F3 lugar.',
        features: {
            saveMoney: 'Economize nas suas reservas',
            alerts: 'Receba atualiza\u00E7\u00F5es e alertas em tempo real',
        },
        bookTravel: 'Reservar viagem',
        bookDemo: 'Agendar demonstra\u00E7\u00E3o',
        bookADemo: 'Agendar uma demonstra\u00E7\u00E3o',
        toLearnMore: 'para saber mais.',
        termsAndConditions: {
            header: 'Antes de continuarmos...',
            title: 'Termos e condi\u00E7\u00F5es',
            subtitle: 'Por favor, concorde com o Expensify Travel',
            termsAndConditions: 'termos e condi\u00E7\u00F5es',
            travelTermsAndConditions: 'termos e condi\u00E7\u00F5es',
            agree: 'Eu concordo com o',
            error: 'Voc\u00EA deve concordar com os termos e condi\u00E7\u00F5es do Expensify Travel para continuar.',
            defaultWorkspaceError:
                'Voc\u00EA precisa definir um espa\u00E7o de trabalho padr\u00E3o para habilitar o Expensify Travel. V\u00E1 para Configura\u00E7\u00F5es > Espa\u00E7os de Trabalho > clique nos tr\u00EAs pontos verticais ao lado de um espa\u00E7o de trabalho > Definir como espa\u00E7o de trabalho padr\u00E3o, e ent\u00E3o tente novamente!',
        },
        flight: 'Voo',
        flightDetails: {
            passenger: 'Passageiro',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Voc\u00EA tem uma <strong>conex\u00E3o de ${layover}</strong> antes deste voo</muted-text-label>`,
            takeOff: 'Decolagem',
            landing: 'Landing',
            seat: 'Assento',
            class: 'Classe da Cabine',
            recordLocator: 'Localizador de registro',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Economia',
                premiumEconomy: 'Premium Economy',
                business: 'Neg\u00F3cio',
                first: 'Primeiro',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Convidado',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Tipo de quarto',
            cancellation: 'Pol\u00EDtica de cancelamento',
            cancellationUntil: 'Cancelamento gratuito at\u00E9',
            confirmation: 'N\u00FAmero de confirma\u00E7\u00E3o',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'N\u00E3o reembols\u00E1vel',
                freeCancellationUntil: 'Cancelamento gratuito at\u00E9',
                partiallyRefundable: 'Parcialmente reembols\u00E1vel',
            },
        },
        car: 'Carro',
        carDetails: {
            rentalCar: 'Aluguel de carro',
            pickUp: 'Pick-up',
            dropOff: 'Entrega',
            driver: 'Motorista',
            carType: 'Tipo de carro',
            cancellation: 'Pol\u00EDtica de cancelamento',
            cancellationUntil: 'Cancelamento gratuito at\u00E9',
            freeCancellation: 'Cancelamento gratuito',
            confirmation: 'N\u00FAmero de confirma\u00E7\u00E3o',
        },
        train: 'Trilho',
        trainDetails: {
            passenger: 'Passageiro',
            departs: 'Parte',
            arrives: 'Chega',
            coachNumber: 'N\u00FAmero do treinador',
            seat: 'Assento',
            fareDetails: 'Detalhes da tarifa',
            confirmation: 'N\u00FAmero de confirma\u00E7\u00E3o',
        },
        viewTrip: 'Ver viagem',
        modifyTrip: 'Modificar viagem',
        tripSupport: 'Suporte de viagem',
        tripDetails: 'Detalhes da viagem',
        viewTripDetails: 'Ver detalhes da viagem',
        trip: 'Viagem',
        trips: 'Viagens',
        tripSummary: 'Resumo da viagem',
        departs: 'Parte',
        errorMessage: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        phoneError: {
            phrase1: 'Por favor',
            link: 'adicione um e-mail de trabalho como seu login principal',
            phrase2: 'para reservar viagens.',
        },
        domainSelector: {
            title: 'Dom\u00EDnio',
            subtitle: 'Escolha um dom\u00EDnio para a configura\u00E7\u00E3o do Expensify Travel.',
            recommended: 'Recomendado',
        },
        domainPermissionInfo: {
            title: 'Dom\u00EDnio',
            restrictionPrefix: `Voc\u00EA n\u00E3o tem permiss\u00E3o para ativar o Expensify Travel para o dom\u00EDnio`,
            restrictionSuffix: `Voc\u00EA precisar\u00E1 pedir a algu\u00E9m desse dom\u00EDnio para habilitar viagens.`,
            accountantInvitationPrefix: `Se voc\u00EA \u00E9 um contador, considere se juntar ao`,
            accountantInvitationLink: `Programa de contadores ExpensifyApproved!`,
            accountantInvitationSuffix: `para habilitar viagens para este dom\u00EDnio.`,
        },
        publicDomainError: {
            title: 'Comece com o Expensify Travel',
            message: `Voc\u00EA precisar\u00E1 usar seu e-mail de trabalho (por exemplo, nome@empresa.com) com o Expensify Travel, n\u00E3o seu e-mail pessoal (por exemplo, nome@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel foi desativado',
            message: `Seu administrador desativou o Expensify Travel. Por favor, siga a pol\u00EDtica de reservas da sua empresa para as provid\u00EAncias de viagem.`,
        },
        verifyCompany: {
            title: 'Comece a viajar hoje!',
            message: `Por favor, entre em contato com seu gerente de conta ou salesteam@expensify.com para obter uma demonstra\u00E7\u00E3o de viagem e ativ\u00E1-la para sua empresa.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Seu voo ${airlineCode} (${origin} \u2192 ${destination}) em ${startDate} foi reservado. C\u00F3digo de confirma\u00E7\u00E3o: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Seu bilhete para o voo ${airlineCode} (${origin} \u2192 ${destination}) em ${startDate} foi anulado.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Seu bilhete para o voo ${airlineCode} (${origin} \u2192 ${destination}) em ${startDate} foi reembolsado ou trocado.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Seu voo ${airlineCode} (${origin} \u2192 ${destination}) em ${startDate} foi cancelado pela companhia a\u00E9rea.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `A companhia a\u00E9rea prop\u00F4s uma altera\u00E7\u00E3o de hor\u00E1rio para o voo ${airlineCode}; estamos aguardando confirma\u00E7\u00E3o.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Mudan\u00E7a de hor\u00E1rio confirmada: voo ${airlineCode} agora parte em ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Seu voo ${airlineCode} (${origin} \u2192 ${destination}) em ${startDate} foi atualizado.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Sua classe de cabine foi atualizada para ${cabinClass} no voo ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Sua assento no voo ${airlineCode} foi confirmado.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Sua atribui\u00E7\u00E3o de assento no voo ${airlineCode} foi alterada.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Sua atribui\u00E7\u00E3o de assento no voo ${airlineCode} foi removida.`,
            paymentDeclined: 'O pagamento da sua reserva de voo falhou. Por favor, tente novamente.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Voc\u00EA cancelou sua reserva de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `O fornecedor cancelou sua reserva de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Sua reserva de ${type} foi remarcada. Nova confirma\u00E7\u00E3o n\u00BA:${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada. Revise os novos detalhes no itiner\u00E1rio.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Seu bilhete de trem de ${origin} \u2192 ${destination} em ${startDate} foi reembolsado. Um cr\u00E9dito ser\u00E1 processado.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Seu bilhete de trem de ${origin} \u2192 ${destination} em ${startDate} foi trocado.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Sua passagem de trem de ${origin} \u2192 ${destination} em ${startDate} foi atualizada.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada.`,
        },
    },
    workspace: {
        common: {
            card: 'Cart\u00F5es',
            expensifyCard: 'Expensify Card',
            companyCards: 'Cart\u00F5es corporativos',
            workflows: 'Fluxos de trabalho',
            workspace: 'Espa\u00E7o de trabalho',
            findWorkspace: 'Encontrar espaço de trabalho',
            edit: 'Editar espa\u00E7o de trabalho',
            enabled: 'Habilitado',
            disabled: 'Desativado',
            everyone: 'Todos',
            delete: 'Excluir espa\u00E7o de trabalho',
            settings: 'Configura\u00E7\u00F5es',
            reimburse: 'Reembolsos',
            categories: 'Categorias',
            tags: 'Tags',
            customField1: 'Campo personalizado 1',
            customField2: 'Campo personalizado 2',
            customFieldHint: 'Adicione uma codifica\u00E7\u00E3o personalizada que se aplique a todos os gastos deste membro.',
            reportFields: 'Campos do relat\u00F3rio',
            reportTitle: 'T\u00EDtulo do relat\u00F3rio',
            reportField: 'Campo do relat\u00F3rio',
            taxes: 'Impostos',
            bills: 'Faturas',
            invoices: 'Faturas',
            travel: 'Viagem',
            members: 'Membros',
            accounting: 'Contabilidade',
            rules: 'Regras',
            displayedAs: 'Exibido como',
            plan: 'Plano',
            profile: 'Vis\u00E3o geral',
            bankAccount: 'Conta banc\u00E1ria',
            connectBankAccount: 'Conectar conta banc\u00E1ria',
            testTransactions: 'Testar transa\u00E7\u00F5es',
            issueAndManageCards: 'Emitir e gerenciar cart\u00F5es',
            reconcileCards: 'Conciliar cart\u00F5es',
            selected: () => ({
                one: '1 selecionado',
                other: (count: number) => `${count} selecionados`,
            }),
            settlementFrequency: 'Frequ\u00EAncia de liquida\u00E7\u00E3o',
            setAsDefault: 'Definir como espa\u00E7o de trabalho padr\u00E3o',
            defaultNote: `Os recibos enviados para ${CONST.EMAIL.RECEIPTS} aparecer\u00E3o neste espa\u00E7o de trabalho.`,
            deleteConfirmation: 'Tem certeza de que deseja excluir este espa\u00E7o de trabalho?',
            deleteWithCardsConfirmation: 'Tem certeza de que deseja excluir este espa\u00E7o de trabalho? Isso remover\u00E1 todos os feeds de cart\u00F5es e cart\u00F5es atribu\u00EDdos.',
            unavailable: 'Espa\u00E7o de trabalho indispon\u00EDvel',
            memberNotFound: 'Membro n\u00E3o encontrado. Para convidar um novo membro para o espa\u00E7o de trabalho, por favor, use o bot\u00E3o de convite acima.',
            notAuthorized: `Voc\u00EA n\u00E3o tem acesso a esta p\u00E1gina. Se voc\u00EA est\u00E1 tentando entrar neste espa\u00E7o de trabalho, pe\u00E7a ao propriet\u00E1rio do espa\u00E7o de trabalho para adicion\u00E1-lo como membro. Algo mais? Entre em contato com ${CONST.EMAIL.CONCIERGE}.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Ir para a sala ${roomName}`,
            goToWorkspace: 'Ir para o espa\u00E7o de trabalho',
            goToWorkspaces: 'Ir para espa\u00E7os de trabalho',
            clearFilter: 'Limpar filtro',
            workspaceName: 'Nome do workspace',
            workspaceOwner: 'Propriet\u00E1rio',
            workspaceType: 'Tipo de espa\u00E7o de trabalho',
            workspaceAvatar: 'Avatar do espa\u00E7o de trabalho',
            mustBeOnlineToViewMembers: 'Voc\u00EA precisa estar online para visualizar os membros deste workspace.',
            moreFeatures: 'Mais recursos',
            requested: 'Solicitado',
            distanceRates: 'Taxas de dist\u00E2ncia',
            defaultDescription: 'Um lugar para todos os seus recibos e despesas.',
            descriptionHint: 'Compartilhar informa\u00E7\u00F5es sobre este espa\u00E7o de trabalho com todos os membros.',
            welcomeNote: 'Por favor, use o Expensify para enviar seus recibos para reembolso, obrigado!',
            subscription: 'Assinatura',
            markAsEntered: 'Marcar como inserido manualmente',
            markAsExported: 'Marcar como exportado manualmente',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportar para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
            lineItemLevel: 'N\u00EDvel de item detalhado',
            reportLevel: 'N\u00EDvel de relat\u00F3rio',
            topLevel: 'N\u00EDvel superior',
            appliedOnExport: 'N\u00E3o importado para o Expensify, aplicado na exporta\u00E7\u00E3o',
            shareNote: {
                header: 'Compartilhe seu espa\u00E7o de trabalho com outros membros',
                content: {
                    firstPart:
                        'Compartilhe este c\u00F3digo QR ou copie o link abaixo para facilitar que os membros solicitem acesso ao seu espa\u00E7o de trabalho. Todas as solicita\u00E7\u00F5es para ingressar no espa\u00E7o de trabalho aparecer\u00E3o na',
                    secondPart: 'espa\u00E7o para sua revis\u00E3o.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Conectar-se a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Criar nova conex\u00E3o',
            reuseExistingConnection: 'Reutilizar conex\u00E3o existente',
            existingConnections: 'Conex\u00F5es existentes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Como voc\u00EA j\u00E1 se conectou ao ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} antes, voc\u00EA pode optar por reutilizar uma conex\u00E3o existente ou criar uma nova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - \u00DAltima sincroniza\u00E7\u00E3o em ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `N\u00E3o \u00E9 poss\u00EDvel conectar a ${connectionName} devido a um erro de autentica\u00E7\u00E3o`,
            learnMore: 'Saiba mais.',
            memberAlternateText: 'Os membros podem enviar e aprovar relat\u00F3rios.',
            adminAlternateText: 'Os administradores t\u00EAm acesso total de edi\u00E7\u00E3o a todos os relat\u00F3rios e configura\u00E7\u00F5es do espa\u00E7o de trabalho.',
            auditorAlternateText: 'Auditores podem visualizar e comentar em relat\u00F3rios.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administra\u00E7\u00E3o';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membro';
                    default:
                        return 'Membro';
                }
            },
            frequency: {
                manual: 'Manualmente',
                instant: 'Instant\u00E2neo',
                immediate: 'Di\u00E1rio',
                trip: 'Por viagem',
                weekly: 'Semanalmente',
                semimonthly: 'Duas vezes por m\u00EAs',
                monthly: 'Mensalmente',
            },
            planType: 'Tipo de plano',
            submitExpense: 'Envie suas despesas abaixo:',
            defaultCategory: 'Categoria padr\u00E3o',
            viewTransactions: 'Ver transa\u00E7\u00F5es',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Despesas de ${displayName}`,
        },
        perDiem: {
            subtitle: 'Defina taxas de di\u00E1ria para controlar os gastos di\u00E1rios dos funcion\u00E1rios.',
            amount: 'Quantia',
            deleteRates: () => ({
                one: 'Excluir taxa',
                other: 'Excluir tarifas',
            }),
            deletePerDiemRate: 'Excluir taxa de di\u00E1ria',
            findPerDiemRate: 'Encontrar taxa de di\u00E1ria',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas tarifas?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Defina taxas de di\u00E1rias para controlar os gastos di\u00E1rios dos funcion\u00E1rios. Importe taxas de uma planilha para come\u00E7ar.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Uma taxa com o valor ${rate} j\u00E1 existe.`,
            },
            importPerDiemRates: 'Importar taxas de di\u00E1rias',
            editPerDiemRate: 'Editar taxa de di\u00E1rias',
            editPerDiemRates: 'Editar taxas de di\u00E1rias',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Atualizar este destino ir\u00E1 alter\u00E1-lo para todas as subtarifas de ${destination} por di\u00E1rias.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Atualizar esta moeda ir\u00E1 alter\u00E1-la para todas as subtaxas de di\u00E1rias de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Defina como as despesas fora do bolso s\u00E3o exportadas para o QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marcar cheques como "imprimir depois"',
            exportDescription: 'Configure como os dados do Expensify s\u00E3o exportados para o QuickBooks Desktop.',
            date: 'Data de exporta\u00E7\u00E3o',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transa\u00E7\u00F5es do Cart\u00E3o Expensify como',
            account: 'Conta',
            accountDescription: 'Escolha onde postar lan\u00E7amentos cont\u00E1beis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedores.',
            bankAccount: 'Conta banc\u00E1ria',
            notConfigured: 'N\u00E3o configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cart\u00E3o de cr\u00E9dito',
            exportDate: {
                label: 'Data de exporta\u00E7\u00E3o',
                description: 'Use esta data ao exportar relat\u00F3rios para o QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da \u00FAltima despesa',
                        description: 'Data da despesa mais recente no relat\u00F3rio.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exporta\u00E7\u00E3o',
                        description: 'Data em que o relat\u00F3rio foi exportado para o QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relat\u00F3rio foi enviado para aprova\u00E7\u00E3o.',
                    },
                },
            },
            exportCheckDescription: 'Criaremos um cheque detalhado para cada relat\u00F3rio do Expensify e o enviaremos da conta banc\u00E1ria abaixo.',
            exportJournalEntryDescription: 'Criaremos um lan\u00E7amento cont\u00E1bil detalhado para cada relat\u00F3rio do Expensify e o publicaremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma fatura detalhada do fornecedor para cada relat\u00F3rio do Expensify e a adicionaremos \u00E0 conta abaixo. Se este per\u00EDodo estiver fechado, lan\u00E7aremos no primeiro dia do pr\u00F3ximo per\u00EDodo aberto.',
            deepDiveExpensifyCard:
                'As transa\u00E7\u00F5es do Cart\u00E3o Expensify ser\u00E3o exportadas automaticamente para uma "Conta de Responsabilidade do Cart\u00E3o Expensify" criada com',
            deepDiveExpensifyCardIntegration: 'nossa integra\u00E7\u00E3o.',
            outOfPocketTaxEnabledDescription:
                'O QuickBooks Desktop n\u00E3o suporta impostos em exporta\u00E7\u00F5es de lan\u00E7amentos cont\u00E1beis. Como voc\u00EA tem impostos habilitados no seu espa\u00E7o de trabalho, essa op\u00E7\u00E3o de exporta\u00E7\u00E3o n\u00E3o est\u00E1 dispon\u00EDvel.',
            outOfPocketTaxEnabledError:
                'As entradas de di\u00E1rio n\u00E3o est\u00E3o dispon\u00EDveis quando os impostos est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cart\u00E3o de cr\u00E9dito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura do fornecedor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lan\u00E7amento cont\u00E1bil',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Descri\u00E7\u00E3o`]:
                    'Criaremos um cheque detalhado para cada relat\u00F3rio do Expensify e o enviaremos da conta banc\u00E1ria abaixo.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descri\u00E7\u00E3o`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transa\u00E7\u00E3o do cart\u00E3o de cr\u00E9dito a quaisquer fornecedores correspondentes no QuickBooks. Se n\u00E3o existirem fornecedores, criaremos um fornecedor 'Cart\u00E3o de Cr\u00E9dito Diversos' para associa\u00E7\u00E3o.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descri\u00E7\u00E3o`]:
                    'Criaremos uma fatura detalhada do fornecedor para cada relat\u00F3rio do Expensify com a data da \u00FAltima despesa e a adicionaremos \u00E0 conta abaixo. Se este per\u00EDodo estiver fechado, lan\u00E7aremos no dia 1\u00BA do pr\u00F3ximo per\u00EDodo aberto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descri\u00E7\u00E3oDaConta`]:
                    'Escolha onde exportar as transa\u00E7\u00F5es do cart\u00E3o de cr\u00E9dito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descri\u00E7\u00E3oDaConta`]:
                    'Escolha um fornecedor para aplicar a todas as transa\u00E7\u00F5es de cart\u00E3o de cr\u00E9dito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Descri\u00E7\u00E3oDaConta`]: 'Escolha de onde enviar os cheques.',
                [`Erro de ${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}`]:
                    'As faturas de fornecedores n\u00E3o est\u00E3o dispon\u00EDveis quando os locais est\u00E3o habilitados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Erro`]:
                    'Cheques est\u00E3o indispon\u00EDveis quando locais est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Erro`]:
                    'As entradas de di\u00E1rio n\u00E3o est\u00E3o dispon\u00EDveis quando os impostos est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Desktop e sincronize a conex\u00E3o novamente',
            qbdSetup: 'Configura\u00E7\u00E3o do QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'N\u00E3o \u00E9 poss\u00EDvel conectar a partir deste dispositivo',
                body1: 'Voc\u00EA precisar\u00E1 configurar essa conex\u00E3o a partir do computador que hospeda o arquivo da sua empresa no QuickBooks Desktop.',
                body2: 'Depois de conectado, voc\u00EA poder\u00E1 sincronizar e exportar de qualquer lugar.',
            },
            setupPage: {
                title: 'Abra este link para conectar',
                body: 'Para concluir a configura\u00E7\u00E3o, abra o seguinte link no computador onde o QuickBooks Desktop est\u00E1 em execu\u00E7\u00E3o.',
                setupErrorTitle: 'Algo deu errado',
                setupErrorBody1: 'A conex\u00E3o com o QuickBooks Desktop n\u00E3o est\u00E1 funcionando no momento. Por favor, tente novamente mais tarde ou',
                setupErrorBody2: 'se o problema persistir.',
                setupErrorBodyContactConcierge: 'entre em contato com o Concierge',
            },
            importDescription: 'Escolha quais configura\u00E7\u00F5es de codifica\u00E7\u00E3o importar do QuickBooks Desktop para o Expensify.',
            classes: 'Classes',
            items: 'Itens',
            customers: 'Clientes/projetos',
            exportCompanyCardsDescription: 'Defina como as compras com cart\u00E3o corporativo s\u00E3o exportadas para o QuickBooks Desktop.',
            defaultVendorDescription: 'Defina um fornecedor padr\u00E3o que ser\u00E1 aplicado a todas as transa\u00E7\u00F5es de cart\u00E3o de cr\u00E9dito ao exportar.',
            accountsDescription: 'Seu plano de contas do QuickBooks Desktop ser\u00E1 importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'Categorias ativadas estar\u00E3o dispon\u00EDveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Desktop no Expensify.',
            tagsDisplayedAsDescription: 'N\u00EDvel de item de linha',
            reportFieldsDisplayedAsDescription: 'N\u00EDvel de relat\u00F3rio',
            customersDescription: 'Escolha como lidar com clientes/projetos do QuickBooks Desktop no Expensify.',
            advancedConfig: {
                autoSyncDescription: 'O Expensify ir\u00E1 sincronizar automaticamente com o QuickBooks Desktop todos os dias.',
                createEntities: 'Criar entidades automaticamente',
                createEntitiesDescription: 'A Expensify criar\u00E1 automaticamente fornecedores no QuickBooks Desktop se eles ainda n\u00E3o existirem.',
            },
            itemsDescription: 'Escolha como lidar com os itens do QuickBooks Desktop no Expensify.',
        },
        qbo: {
            connectedTo: 'Conectado a',
            importDescription: 'Escolha quais configura\u00E7\u00F5es de codifica\u00E7\u00E3o importar do QuickBooks Online para o Expensify.',
            classes: 'Classes',
            locations: 'Localiza\u00E7\u00F5es',
            customers: 'Clientes/projetos',
            accountsDescription: 'Seu plano de contas do QuickBooks Online ser\u00E1 importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'Categorias ativadas estar\u00E3o dispon\u00EDveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Online no Expensify.',
            customersDescription: 'Escolha como lidar com clientes/projetos do QuickBooks Online no Expensify.',
            locationsDescription: 'Escolha como lidar com locais do QuickBooks Online no Expensify.',
            taxesDescription: 'Escolha como lidar com os impostos do QuickBooks Online no Expensify.',
            locationsLineItemsRestrictionDescription:
                'O QuickBooks Online n\u00E3o suporta Localiza\u00E7\u00F5es no n\u00EDvel de linha para Cheques ou Faturas de Fornecedores. Se voc\u00EA gostaria de ter localiza\u00E7\u00F5es no n\u00EDvel de linha, certifique-se de estar usando Lan\u00E7amentos Cont\u00E1beis e despesas de Cart\u00E3o de Cr\u00E9dito/D\u00E9bito.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online n\u00E3o suporta impostos em lan\u00E7amentos cont\u00E1beis. Por favor, altere sua op\u00E7\u00E3o de exporta\u00E7\u00E3o para fatura do fornecedor ou cheque.',
            exportDescription: 'Configure como os dados do Expensify s\u00E3o exportados para o QuickBooks Online.',
            date: 'Data de exporta\u00E7\u00E3o',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transa\u00E7\u00F5es do Cart\u00E3o Expensify como',
            deepDiveExpensifyCard:
                'As transa\u00E7\u00F5es do Cart\u00E3o Expensify ser\u00E3o exportadas automaticamente para uma "Conta de Responsabilidade do Cart\u00E3o Expensify" criada com',
            deepDiveExpensifyCardIntegration: 'nossa integra\u00E7\u00E3o.',
            exportDate: {
                label: 'Data de exporta\u00E7\u00E3o',
                description: 'Use esta data ao exportar relat\u00F3rios para o QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da \u00FAltima despesa',
                        description: 'Data da despesa mais recente no relat\u00F3rio.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exporta\u00E7\u00E3o',
                        description: 'Data em que o relat\u00F3rio foi exportado para o QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relat\u00F3rio foi enviado para aprova\u00E7\u00E3o.',
                    },
                },
            },
            receivable: 'Contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Arquivo de contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Use esta conta ao exportar faturas para o QuickBooks Online.',
            exportCompanyCardsDescription: 'Defina como as compras com cart\u00E3o corporativo s\u00E3o exportadas para o QuickBooks Online.',
            vendor: 'Fornecedor',
            defaultVendorDescription: 'Defina um fornecedor padr\u00E3o que ser\u00E1 aplicado a todas as transa\u00E7\u00F5es de cart\u00E3o de cr\u00E9dito ao exportar.',
            exportOutOfPocketExpensesDescription: 'Defina como as despesas fora do bolso s\u00E3o exportadas para o QuickBooks Online.',
            exportCheckDescription: 'Criaremos um cheque detalhado para cada relat\u00F3rio do Expensify e o enviaremos da conta banc\u00E1ria abaixo.',
            exportJournalEntryDescription: 'Criaremos um lan\u00E7amento cont\u00E1bil detalhado para cada relat\u00F3rio do Expensify e o publicaremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma fatura detalhada do fornecedor para cada relat\u00F3rio do Expensify e a adicionaremos \u00E0 conta abaixo. Se este per\u00EDodo estiver fechado, lan\u00E7aremos no primeiro dia do pr\u00F3ximo per\u00EDodo aberto.',
            account: 'Conta',
            accountDescription: 'Escolha onde postar lan\u00E7amentos cont\u00E1beis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedores.',
            bankAccount: 'Conta banc\u00E1ria',
            notConfigured: 'N\u00E3o configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cart\u00E3o de cr\u00E9dito',
            companyCardsLocationEnabledDescription:
                'O QuickBooks Online n\u00E3o suporta locais em exporta\u00E7\u00F5es de faturas de fornecedores. Como voc\u00EA tem locais habilitados no seu espa\u00E7o de trabalho, essa op\u00E7\u00E3o de exporta\u00E7\u00E3o n\u00E3o est\u00E1 dispon\u00EDvel.',
            outOfPocketTaxEnabledDescription:
                'O QuickBooks Online n\u00E3o suporta impostos em exporta\u00E7\u00F5es de lan\u00E7amentos cont\u00E1beis. Como voc\u00EA tem impostos habilitados no seu espa\u00E7o de trabalho, essa op\u00E7\u00E3o de exporta\u00E7\u00E3o n\u00E3o est\u00E1 dispon\u00EDvel.',
            outOfPocketTaxEnabledError:
                'As entradas de di\u00E1rio n\u00E3o est\u00E3o dispon\u00EDveis quando os impostos est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
            advancedConfig: {
                autoSyncDescription: 'Expensify ir\u00E1 sincronizar automaticamente com o QuickBooks Online todos os dias.',
                inviteEmployees: 'Convidar funcion\u00E1rios',
                inviteEmployeesDescription: 'Importar registros de funcion\u00E1rios do QuickBooks Online e convidar funcion\u00E1rios para este espa\u00E7o de trabalho.',
                createEntities: 'Criar entidades automaticamente',
                createEntitiesDescription:
                    'A Expensify criar\u00E1 automaticamente fornecedores no QuickBooks Online se eles ainda n\u00E3o existirem e criar\u00E1 automaticamente clientes ao exportar faturas.',
                reimbursedReportsDescription:
                    'Sempre que um relat\u00F3rio for pago usando Expensify ACH, o pagamento correspondente da conta ser\u00E1 criado na conta QuickBooks Online abaixo.',
                qboBillPaymentAccount: 'Conta de pagamento de fatura do QuickBooks',
                qboInvoiceCollectionAccount: 'Conta de cobran\u00E7as de faturas do QuickBooks',
                accountSelectDescription: 'Escolha de onde pagar as contas e criaremos o pagamento no QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e criaremos o pagamento no QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Cart\u00E3o de d\u00E9bito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cart\u00E3o de cr\u00E9dito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura do fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lan\u00E7amento cont\u00E1bil',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Descri\u00E7\u00E3o`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transa\u00E7\u00E3o do cart\u00E3o de d\u00E9bito a qualquer fornecedor correspondente no QuickBooks. Se n\u00E3o existirem fornecedores, criaremos um fornecedor 'Cart\u00E3o de D\u00E9bito Diversos' para associa\u00E7\u00E3o.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descri\u00E7\u00E3o`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transa\u00E7\u00E3o do cart\u00E3o de cr\u00E9dito a quaisquer fornecedores correspondentes no QuickBooks. Se n\u00E3o existirem fornecedores, criaremos um fornecedor 'Cart\u00E3o de Cr\u00E9dito Diversos' para associa\u00E7\u00E3o.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descri\u00E7\u00E3o`]:
                    'Criaremos uma fatura detalhada do fornecedor para cada relat\u00F3rio do Expensify com a data da \u00FAltima despesa e a adicionaremos \u00E0 conta abaixo. Se este per\u00EDodo estiver fechado, lan\u00E7aremos no dia 1\u00BA do pr\u00F3ximo per\u00EDodo aberto.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Descri\u00E7\u00E3oDaConta`]:
                    'Escolha para onde exportar as transa\u00E7\u00F5es do cart\u00E3o de d\u00E9bito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Descri\u00E7\u00E3oDaConta`]:
                    'Escolha onde exportar as transa\u00E7\u00F5es do cart\u00E3o de cr\u00E9dito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Descri\u00E7\u00E3oDaConta`]:
                    'Escolha um fornecedor para aplicar a todas as transa\u00E7\u00F5es de cart\u00E3o de cr\u00E9dito.',
                [`Erro de ${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}`]:
                    'As faturas de fornecedores n\u00E3o est\u00E3o dispon\u00EDveis quando os locais est\u00E3o habilitados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Erro`]:
                    'Cheques est\u00E3o indispon\u00EDveis quando locais est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Erro`]:
                    'As entradas de di\u00E1rio n\u00E3o est\u00E3o dispon\u00EDveis quando os impostos est\u00E3o ativados. Por favor, escolha uma op\u00E7\u00E3o de exporta\u00E7\u00E3o diferente.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Escolha uma conta v\u00E1lida para exporta\u00E7\u00E3o de fatura de fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Escolha uma conta v\u00E1lida para exporta\u00E7\u00E3o de lan\u00E7amento cont\u00E1bil',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Escolha uma conta v\u00E1lida para exporta\u00E7\u00E3o de cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Para usar a exporta\u00E7\u00E3o de contas a pagar de fornecedores, configure uma conta de contas a pagar no QuickBooks Online.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]:
                    'Para usar a exporta\u00E7\u00E3o de lan\u00E7amentos cont\u00E1beis, configure uma conta de di\u00E1rio no QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Para usar a exporta\u00E7\u00E3o de cheques, configure uma conta banc\u00E1ria no QuickBooks Online.',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Online e sincronize a conex\u00E3o novamente.',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Acumula\u00E7\u00E3o',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Despesas fora do bolso ser\u00E3o exportadas quando aprovadas definitivamente',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas fora do bolso ser\u00E3o exportadas quando pagas',
                },
            },
        },
        workspaceList: {
            joinNow: 'Junte-se agora',
            askToJoin: 'Pedir para participar',
        },
        xero: {
            organization: 'Organiza\u00E7\u00E3o Xero',
            organizationDescription: 'Escolha a organiza\u00E7\u00E3o Xero da qual voc\u00EA gostaria de importar dados.',
            importDescription: 'Escolha quais configura\u00E7\u00F5es de codifica\u00E7\u00E3o importar do Xero para o Expensify.',
            accountsDescription: 'Seu plano de contas do Xero ser\u00E1 importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'Categorias ativadas estar\u00E3o dispon\u00EDveis para os membros selecionarem ao criar suas despesas.',
            trackingCategories: 'Categorias de rastreamento',
            trackingCategoriesDescription: 'Escolha como lidar com as categorias de rastreamento do Xero no Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapear ${categoryName} do Xero para`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Escolha onde mapear ${categoryName} ao exportar para Xero.`,
            customers: 'Refaturar clientes',
            customersDescription:
                'Escolha se deseja refaturar os clientes no Expensify. Seus contatos de clientes do Xero podem ser vinculados a despesas e ser\u00E3o exportados para o Xero como uma fatura de vendas.',
            taxesDescription: 'Escolha como lidar com os impostos do Xero no Expensify.',
            notImported: 'N\u00E3o importado',
            notConfigured: 'N\u00E3o configurado',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contato padr\u00E3o do Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campos do relat\u00F3rio',
            },
            exportDescription: 'Configure como os dados do Expensify s\u00E3o exportados para o Xero.',
            purchaseBill: 'Fatura de compra',
            exportDeepDiveCompanyCard:
                'Despesas exportadas ser\u00E3o lan\u00E7adas como transa\u00E7\u00F5es banc\u00E1rias na conta banc\u00E1ria do Xero abaixo, e as datas das transa\u00E7\u00F5es corresponder\u00E3o \u00E0s datas no seu extrato banc\u00E1rio.',
            bankTransactions: 'Transa\u00E7\u00F5es banc\u00E1rias',
            xeroBankAccount: 'Conta banc\u00E1ria Xero',
            xeroBankAccountDescription: 'Escolha onde as despesas ser\u00E3o registradas como transa\u00E7\u00F5es banc\u00E1rias.',
            exportExpensesDescription: 'Os relat\u00F3rios ser\u00E3o exportados como uma nota fiscal de compra com a data e o status selecionados abaixo.',
            purchaseBillDate: 'Data de emiss\u00E3o da fatura de compra',
            exportInvoices: 'Exportar faturas como',
            salesInvoice: 'Fatura de venda',
            exportInvoicesDescription: 'As faturas de vendas sempre exibem a data em que a fatura foi enviada.',
            advancedConfig: {
                autoSyncDescription: 'A Expensify sincronizar\u00E1 automaticamente com o Xero todos os dias.',
                purchaseBillStatusTitle: 'Status da fatura de compra',
                reimbursedReportsDescription: 'Sempre que um relat\u00F3rio for pago usando Expensify ACH, o pagamento da fatura correspondente ser\u00E1 criado na conta Xero abaixo.',
                xeroBillPaymentAccount: 'Conta de pagamento de faturas Xero',
                xeroInvoiceCollectionAccount: 'Conta de cobran\u00E7as de faturas do Xero',
                xeroBillPaymentAccountDescription: 'Escolha de onde pagar as contas e criaremos o pagamento no Xero.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e n\u00F3s criaremos o pagamento no Xero.',
            },
            exportDate: {
                label: 'Data de emiss\u00E3o da fatura de compra',
                description: 'Use esta data ao exportar relat\u00F3rios para Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da \u00FAltima despesa',
                        description: 'Data da despesa mais recente no relat\u00F3rio.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exporta\u00E7\u00E3o',
                        description: 'Data em que o relat\u00F3rio foi exportado para Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relat\u00F3rio foi enviado para aprova\u00E7\u00E3o.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status da fatura de compra',
                description: 'Use este status ao exportar faturas de compra para Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Rascunho',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Aguardando aprova\u00E7\u00E3o',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Aguardando pagamento',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Por favor, adicione a conta no Xero e sincronize a conex\u00E3o novamente.',
        },
        sageIntacct: {
            preferredExporter: 'Exportador preferido',
            taxSolution: 'Solu\u00E7\u00E3o fiscal',
            notConfigured: 'N\u00E3o configurado',
            exportDate: {
                label: 'Data de exporta\u00E7\u00E3o',
                description: 'Use esta data ao exportar relat\u00F3rios para Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da \u00FAltima despesa',
                        description: 'Data da despesa mais recente no relat\u00F3rio.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exporta\u00E7\u00E3o',
                        description: 'Data em que o relat\u00F3rio foi exportado para Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relat\u00F3rio foi enviado para aprova\u00E7\u00E3o.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Defina como as despesas fora do bolso s\u00E3o exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Relat\u00F3rios de despesas',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faturas de fornecedores',
                },
            },
            nonReimbursableExpenses: {
                description: 'Defina como as compras com cart\u00E3o corporativo s\u00E3o exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cart\u00F5es de cr\u00E9dito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faturas de fornecedores',
                },
            },
            creditCardAccount: 'Conta de cart\u00E3o de cr\u00E9dito',
            defaultVendor: 'Fornecedor padr\u00E3o',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Defina um fornecedor padr\u00E3o que ser\u00E1 aplicado \u00E0s despesas reembols\u00E1veis ${isReimbursable ? '' : 'n\u00E3o-'} que n\u00E3o t\u00EAm um fornecedor correspondente no Sage Intacct.`,
            exportDescription: 'Configure como os dados do Expensify s\u00E3o exportados para o Sage Intacct.',
            exportPreferredExporterNote:
                'O exportador preferido pode ser qualquer administrador do espa\u00E7o de trabalho, mas tamb\u00E9m deve ser um Administrador de Dom\u00EDnio se voc\u00EA definir contas de exporta\u00E7\u00E3o diferentes para cart\u00F5es corporativos individuais nas Configura\u00E7\u00F5es de Dom\u00EDnio.',
            exportPreferredExporterSubNote: 'Uma vez configurado, o exportador preferido ver\u00E1 os relat\u00F3rios para exporta\u00E7\u00E3o em sua conta.',
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: `Por favor, adicione a conta no Sage Intacct e sincronize a conex\u00E3o novamente.`,
            autoSync: 'Sincroniza\u00E7\u00E3o autom\u00E1tica',
            autoSyncDescription: 'A Expensify ir\u00E1 sincronizar automaticamente com o Sage Intacct todos os dias.',
            inviteEmployees: 'Convidar funcion\u00E1rios',
            inviteEmployeesDescription:
                'Importe registros de funcion\u00E1rios do Sage Intacct e convide funcion\u00E1rios para este espa\u00E7o de trabalho. Seu fluxo de aprova\u00E7\u00E3o ser\u00E1 padr\u00E3o para aprova\u00E7\u00E3o do gerente e pode ser configurado ainda mais na p\u00E1gina de Membros.',
            syncReimbursedReports: 'Sincronizar relat\u00F3rios reembolsados',
            syncReimbursedReportsDescription:
                'Sempre que um relat\u00F3rio for pago usando Expensify ACH, o pagamento da fatura correspondente ser\u00E1 criado na conta Sage Intacct abaixo.',
            paymentAccount: 'Conta de pagamento Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Subsidi\u00E1ria',
            subsidiarySelectDescription: 'Escolha a subsidi\u00E1ria no NetSuite da qual voc\u00EA gostaria de importar dados.',
            exportDescription: 'Configure como os dados do Expensify s\u00E3o exportados para o NetSuite.',
            exportInvoices: 'Exportar faturas para',
            journalEntriesTaxPostingAccount: 'Lan\u00E7amentos cont\u00E1beis na conta de postagem de impostos',
            journalEntriesProvTaxPostingAccount: 'Lan\u00E7amentos cont\u00E1beis na conta de postagem de imposto provincial',
            foreignCurrencyAmount: 'Exportar valor em moeda estrangeira',
            exportToNextOpenPeriod: 'Exportar para o pr\u00F3ximo per\u00EDodo aberto',
            nonReimbursableJournalPostingAccount: 'Conta de lan\u00E7amento de di\u00E1rio n\u00E3o reembols\u00E1vel',
            reimbursableJournalPostingAccount: 'Conta de lan\u00E7amento de di\u00E1rio reembols\u00E1vel',
            journalPostingPreference: {
                label: 'Prefer\u00EAncia de lan\u00E7amento de lan\u00E7amentos cont\u00E1beis',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrada \u00FAnica e detalhada para cada relat\u00F3rio',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Entrada \u00FAnica para cada despesa',
                },
            },
            invoiceItem: {
                label: 'Item de fatura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Crie um para mim',
                        description: 'Criaremos um "item de linha de fatura do Expensify" para voc\u00EA ao exportar (se ainda n\u00E3o existir um).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Selecionar existente',
                        description: 'Vamos vincular faturas do Expensify ao item selecionado abaixo.',
                    },
                },
            },
            exportDate: {
                label: 'Data de exporta\u00E7\u00E3o',
                description: 'Use esta data ao exportar relat\u00F3rios para o NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da \u00FAltima despesa',
                        description: 'Data da despesa mais recente no relat\u00F3rio.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exporta\u00E7\u00E3o',
                        description: 'Data em que o relat\u00F3rio foi exportado para o NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relat\u00F3rio foi enviado para aprova\u00E7\u00E3o.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Relat\u00F3rios de despesas',
                        reimbursableDescription: 'Despesas fora do bolso ser\u00E3o exportadas como relat\u00F3rios de despesas para o NetSuite.',
                        nonReimbursableDescription: 'As despesas do cart\u00E3o corporativo ser\u00E3o exportadas como relat\u00F3rios de despesas para o NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Faturas de fornecedores',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Lan\u00E7amentos cont\u00E1beis',
                        reimbursableDescription:
                            'Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription:
                            'Company card expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify ir\u00E1 sincronizar automaticamente com o NetSuite todos os dias.',
                reimbursedReportsDescription: 'Sempre que um relat\u00F3rio for pago usando Expensify ACH, o pagamento correspondente da fatura ser\u00E1 criado na conta NetSuite abaixo.',
                reimbursementsAccount: 'Conta de reembolsos',
                reimbursementsAccountDescription: 'Escolha a conta banc\u00E1ria que voc\u00EA usar\u00E1 para reembolsos, e n\u00F3s criaremos o pagamento associado no NetSuite.',
                collectionsAccount: 'Conta de cobran\u00E7as',
                collectionsAccountDescription: 'Uma vez que uma fatura \u00E9 marcada como paga no Expensify e exportada para o NetSuite, ela aparecer\u00E1 na conta abaixo.',
                approvalAccount: 'Conta de aprova\u00E7\u00E3o A/P',
                approvalAccountDescription:
                    'Escolha a conta contra a qual as transa\u00E7\u00F5es ser\u00E3o aprovadas no NetSuite. Se voc\u00EA estiver sincronizando relat\u00F3rios reembolsados, esta tamb\u00E9m \u00E9 a conta contra a qual os pagamentos de faturas ser\u00E3o criados.',
                defaultApprovalAccount: 'NetSuite padr\u00E3o',
                inviteEmployees: 'Convide funcion\u00E1rios e defina aprova\u00E7\u00F5es',
                inviteEmployeesDescription:
                    'Importe registros de funcion\u00E1rios do NetSuite e convide funcion\u00E1rios para este espa\u00E7o de trabalho. Seu fluxo de aprova\u00E7\u00E3o ser\u00E1 padr\u00E3o para aprova\u00E7\u00E3o do gerente e pode ser configurado ainda mais na p\u00E1gina *Membros*.',
                autoCreateEntities: 'Criar automaticamente funcion\u00E1rios/fornecedores',
                enableCategories: 'Habilitar categorias rec\u00E9m-importadas',
                customFormID: 'ID do formul\u00E1rio personalizado',
                customFormIDDescription:
                    'Por padr\u00E3o, o Expensify criar\u00E1 lan\u00E7amentos usando o formul\u00E1rio de transa\u00E7\u00E3o preferido definido no NetSuite. Alternativamente, voc\u00EA pode designar um formul\u00E1rio de transa\u00E7\u00E3o espec\u00EDfico para ser usado.',
                customFormIDReimbursable: 'Despesa do pr\u00F3prio bolso',
                customFormIDNonReimbursable: 'Despesa com cart\u00E3o corporativo',
                exportReportsTo: {
                    label: 'N\u00EDvel de aprova\u00E7\u00E3o do relat\u00F3rio de despesas',
                    description:
                        'Depois que um relat\u00F3rio de despesas \u00E9 aprovado no Expensify e exportado para o NetSuite, voc\u00EA pode definir um n\u00EDvel adicional de aprova\u00E7\u00E3o no NetSuite antes de postar.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Prefer\u00EAncia padr\u00E3o do NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Apenas supervisor aprovado',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Apenas contabilidade aprovada',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor e contabilidade aprovaram',
                    },
                },
                accountingMethods: {
                    label: 'Quando Exportar',
                    description: 'Escolha quando exportar as despesas:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Acumula\u00E7\u00E3o',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Despesas fora do bolso ser\u00E3o exportadas quando aprovadas definitivamente',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas fora do bolso ser\u00E3o exportadas quando pagas',
                    },
                },
                exportVendorBillsTo: {
                    label: 'N\u00EDvel de aprova\u00E7\u00E3o de fatura do fornecedor',
                    description:
                        'Depois que uma fatura de fornecedor \u00E9 aprovada no Expensify e exportada para o NetSuite, voc\u00EA pode definir um n\u00EDvel adicional de aprova\u00E7\u00E3o no NetSuite antes de postar.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Prefer\u00EAncia padr\u00E3o do NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Aguardando aprova\u00E7\u00E3o',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprovado para postagem',
                    },
                },
                exportJournalsTo: {
                    label: 'N\u00EDvel de aprova\u00E7\u00E3o de lan\u00E7amento cont\u00E1bil',
                    description:
                        'Depois que um lan\u00E7amento cont\u00E1bil \u00E9 aprovado no Expensify e exportado para o NetSuite, voc\u00EA pode definir um n\u00EDvel adicional de aprova\u00E7\u00E3o no NetSuite antes de lan\u00E7\u00E1-lo.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Prefer\u00EAncia padr\u00E3o do NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Aguardando aprova\u00E7\u00E3o',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprovado para postagem',
                    },
                },
                error: {
                    customFormID: 'Por favor, insira um ID de formul\u00E1rio personalizado num\u00E9rico v\u00E1lido.',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Por favor, adicione a conta no NetSuite e sincronize a conex\u00E3o novamente.',
            noVendorsFound: 'Nenhum fornecedor encontrado',
            noVendorsFoundDescription: 'Por favor, adicione fornecedores no NetSuite e sincronize a conex\u00E3o novamente.',
            noItemsFound: 'Nenhum item de fatura encontrado',
            noItemsFoundDescription: 'Por favor, adicione itens de fatura no NetSuite e sincronize a conex\u00E3o novamente.',
            noSubsidiariesFound: 'Nenhuma subsidi\u00E1ria encontrada',
            noSubsidiariesFoundDescription: 'Por favor, adicione uma subsidi\u00E1ria no NetSuite e sincronize a conex\u00E3o novamente.',
            tokenInput: {
                title: 'Configura\u00E7\u00E3o do NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Instale o pacote Expensify',
                        description: 'No NetSuite, v\u00E1 para *Customization > SuiteBundler > Search & Install Bundles* > procure por "Expensify" > instale o pacote.',
                    },
                    enableTokenAuthentication: {
                        title: 'Ativar autentica\u00E7\u00E3o baseada em token',
                        description: 'No NetSuite, v\u00E1 para *Setup > Company > Enable Features > SuiteCloud* > habilite *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Ativar servi\u00E7os web SOAP',
                        description: 'No NetSuite, v\u00E1 para *Setup > Company > Enable Features > SuiteCloud* > habilite *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Criar um token de acesso',
                        description:
                            'No NetSuite, v\u00E1 para *Setup > Users/Roles > Access Tokens* > crie um token de acesso para o aplicativo "Expensify" e para o papel "Expensify Integration" ou "Administrator".\n\n*Importante:* Certifique-se de salvar o *Token ID* e o *Token Secret* desta etapa. Voc\u00EA precisar\u00E1 deles para a pr\u00F3xima etapa.',
                    },
                    enterCredentials: {
                        title: 'Insira suas credenciais do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'No NetSuite, v\u00E1 para *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorias de despesas',
                expenseCategoriesDescription: 'Suas categorias de despesas do NetSuite ser\u00E3o importadas para o Expensify como categorias.',
                crossSubsidiaryCustomers: 'Clientes/projetos entre subsidi\u00E1rias',
                importFields: {
                    departments: {
                        title: 'Departamentos',
                        subtitle: 'Escolha como lidar com os *departamentos* do NetSuite no Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Escolha como lidar com *classes* no Expensify.',
                    },
                    locations: {
                        title: 'Localiza\u00E7\u00F5es',
                        subtitle: 'Escolha como lidar com *locais* no Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clientes/projetos',
                    subtitle: 'Escolha como lidar com *clientes* e *projetos* do NetSuite no Expensify.',
                    importCustomers: 'Importar clientes',
                    importJobs: 'Importar projetos',
                    customers: 'clientes',
                    jobs: 'projetos',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importar grupos de impostos do NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Escolha uma op\u00E7\u00E3o abaixo:',
                    label: ({importedTypes}: ImportedTypesParams) => `Importado como ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Por favor, insira o ${fieldName}`,
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Adicionar segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Ver instru\u00E7\u00F5es detalhadas',
                        helpText: 'sobre a configura\u00E7\u00E3o de segmentos/registros personalizados.',
                        emptyTitle: 'Adicionar um segmento personalizado ou registro personalizado',
                        fields: {
                            segmentName: 'Nome',
                            internalID: 'ID Interno',
                            scriptID: 'ID do Script',
                            customRecordScriptID: 'ID da coluna de transa\u00E7\u00E3o',
                            mapping: 'Exibido como',
                        },
                        removeTitle: 'Remover segmento/registro personalizado',
                        removePrompt: 'Tem certeza de que deseja remover este segmento/registro personalizado?',
                        addForm: {
                            customSegmentName: 'nome do segmento personalizado',
                            customRecordName: 'nome do registro personalizado',
                            segmentTitle: 'Segmento personalizado',
                            customSegmentAddTitle: 'Adicionar segmento personalizado',
                            customRecordAddTitle: 'Adicionar registro personalizado',
                            recordTitle: 'Registro personalizado',
                            segmentRecordType: 'Voc\u00EA quer adicionar um segmento personalizado ou um registro personalizado?',
                            customSegmentNameTitle: 'Qual \u00E9 o nome do segmento personalizado?',
                            customRecordNameTitle: 'Qual \u00E9 o nome do registro personalizado?',
                            customSegmentNameFooter: `Voc\u00EA pode encontrar nomes de segmentos personalizados no NetSuite na p\u00E1gina *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Voc\u00EA pode encontrar nomes de registros personalizados no NetSuite inserindo o "Campo de Coluna de Transa\u00E7\u00E3o" na pesquisa global.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Qual \u00E9 o ID interno?',
                            customSegmentInternalIDFooter: `Primeiro, certifique-se de que voc\u00EA ativou os IDs internos no NetSuite em *Home > Set Preferences > Show Internal ID.*\n\nVoc\u00EA pode encontrar IDs internos de segmentos personalizados no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique no hyperlink ao lado de *Custom Record Type*.\n4. Encontre o ID interno na tabela na parte inferior.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Voc\u00EA pode encontrar IDs internos de registros personalizados no NetSuite seguindo estas etapas:\n\n1. Digite "Transaction Line Fields" na pesquisa global.\n2. Clique em um registro personalizado.\n3. Encontre o ID interno no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Qual \u00E9 o ID do script?',
                            customSegmentScriptIDFooter: `Voc\u00EA pode encontrar IDs de script de segmento personalizado no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique na aba *Application and Sourcing* perto da parte inferior, ent\u00E3o:\n    a. Se voc\u00EA quiser exibir o segmento personalizado como uma *tag* (no n\u00EDvel do item de linha) no Expensify, clique na sub-aba *Transaction Columns* e use o *Field ID*.\n    b. Se voc\u00EA quiser exibir o segmento personalizado como um *campo de relat\u00F3rio* (no n\u00EDvel do relat\u00F3rio) no Expensify, clique na sub-aba *Transactions* e use o *Field ID*.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Qual \u00E9 o ID da coluna de transa\u00E7\u00E3o?',
                            customRecordScriptIDFooter: `Voc\u00EA pode encontrar IDs de script de registro personalizado no NetSuite em:\n\n1. Digite "Transaction Line Fields" na pesquisa global.\n2. Clique em um registro personalizado.\n3. Encontre o ID do script no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Como esse segmento personalizado deve ser exibido no Expensify?',
                            customRecordMappingTitle: 'Como esse registro personalizado deve ser exibido no Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Um segmento/registro personalizado com este ${fieldName?.toLowerCase()} j\u00E1 existe`,
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Adicionar lista personalizada',
                        recordTitle: 'Lista personalizada',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Ver instru\u00E7\u00F5es detalhadas',
                        helpText: 'sobre a configura\u00E7\u00E3o de listas personalizadas.',
                        emptyTitle: 'Adicionar uma lista personalizada',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID Interno',
                            transactionFieldID: 'ID do campo de transa\u00E7\u00E3o',
                            mapping: 'Exibido como',
                        },
                        removeTitle: 'Remover lista personalizada',
                        removePrompt: 'Tem certeza de que deseja remover esta lista personalizada?',
                        addForm: {
                            listNameTitle: 'Escolha uma lista personalizada',
                            transactionFieldIDTitle: 'Qual \u00E9 o ID do campo de transa\u00E7\u00E3o?',
                            transactionFieldIDFooter: `Voc\u00EA pode encontrar os IDs dos campos de transa\u00E7\u00E3o no NetSuite seguindo estas etapas:\n\n1. Digite "Transaction Line Fields" na pesquisa global.\n2. Clique em uma lista personalizada.\n3. Encontre o ID do campo de transa\u00E7\u00E3o no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Como essa lista personalizada deve ser exibida no Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Uma lista personalizada com este ID de campo de transa\u00E7\u00E3o j\u00E1 existe.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Padr\u00E3o de funcion\u00E1rio do NetSuite',
                        description: 'N\u00E3o importado para o Expensify, aplicado na exporta\u00E7\u00E3o',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Se voc\u00EA usar ${importField} no NetSuite, aplicaremos o padr\u00E3o definido no registro do funcion\u00E1rio ao exportar para Relat\u00F3rio de Despesas ou Lan\u00E7amento Cont\u00E1bil.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'N\u00EDvel de item detalhado',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} estar\u00E1 selecion\u00E1vel para cada despesa individual no relat\u00F3rio de um funcion\u00E1rio.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campos do relat\u00F3rio',
                        description: 'N\u00EDvel de relat\u00F3rio',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `A sele\u00E7\u00E3o ${startCase(importField)} ser\u00E1 aplicada a todas as despesas no relat\u00F3rio de um funcion\u00E1rio.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configura\u00E7\u00E3o do Sage Intacct',
            prerequisitesTitle: 'Antes de se conectar...',
            downloadExpensifyPackage: 'Baixe o pacote Expensify para Sage Intacct',
            followSteps: 'Siga os passos em nossas instru\u00E7\u00F5es de Como fazer: Conectar ao Sage Intacct',
            enterCredentials: 'Insira suas credenciais do Sage Intacct',
            entity: 'Entidade',
            employeeDefault: 'Padr\u00E3o de funcion\u00E1rio Sage Intacct',
            employeeDefaultDescription: 'O departamento padr\u00E3o do funcion\u00E1rio ser\u00E1 aplicado \u00E0s suas despesas no Sage Intacct, se existir um.',
            displayedAsTagDescription: 'O departamento ser\u00E1 selecion\u00E1vel para cada despesa individual no relat\u00F3rio de um funcion\u00E1rio.',
            displayedAsReportFieldDescription: 'A sele\u00E7\u00E3o de departamento ser\u00E1 aplicada a todas as despesas no relat\u00F3rio de um funcion\u00E1rio.',
            toggleImportTitleFirstPart: 'Escolha como lidar com Sage Intacct',
            toggleImportTitleSecondPart: 'no Expensify.',
            expenseTypes: 'Tipos de despesas',
            expenseTypesDescription: 'Seus tipos de despesas do Sage Intacct ser\u00E3o importados para o Expensify como categorias.',
            accountTypesDescription: 'Seu plano de contas do Sage Intacct ser\u00E1 importado para o Expensify como categorias.',
            importTaxDescription: 'Importar a al\u00EDquota de imposto sobre compras do Sage Intacct.',
            userDefinedDimensions: 'Dimens\u00F5es definidas pelo usu\u00E1rio',
            addUserDefinedDimension: 'Adicionar dimens\u00E3o definida pelo usu\u00E1rio',
            integrationName: 'Nome da integra\u00E7\u00E3o',
            dimensionExists: 'J\u00E1 existe uma dimens\u00E3o com esse nome.',
            removeDimension: 'Remover dimens\u00E3o definida pelo usu\u00E1rio',
            removeDimensionPrompt: 'Tem certeza de que deseja remover esta dimens\u00E3o definida pelo usu\u00E1rio?',
            userDefinedDimension: 'Dimens\u00E3o definida pelo usu\u00E1rio',
            addAUserDefinedDimension: 'Adicionar uma dimens\u00E3o definida pelo usu\u00E1rio',
            detailedInstructionsLink: 'Ver instru\u00E7\u00F5es detalhadas',
            detailedInstructionsRestOfSentence: 'sobre a adi\u00E7\u00E3o de dimens\u00F5es definidas pelo usu\u00E1rio.',
            userDimensionsAdded: () => ({
                one: '1 UDD adicionado',
                other: (count: number) => `${count} UDDs adicionados`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamentos';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locais';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clientes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projetos (trabalhos)';
                    default:
                        return 'mapeamentos';
                }
            },
        },
        type: {
            free: 'Gr\u00E1tis',
            control: 'Controle',
            collect: 'Coletar',
        },
        companyCards: {
            addCards: 'Adicionar cart\u00F5es',
            selectCards: 'Selecionar cart\u00F5es',
            addNewCard: {
                other: 'Outro',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Cart\u00F5es Comerciais Visa',
                    stripe: 'Cart\u00F5es Stripe',
                },
                yourCardProvider: `Quem \u00E9 o emissor do seu cart\u00E3o?`,
                whoIsYourBankAccount: 'Qual \u00E9 o seu banco?',
                whereIsYourBankLocated: 'Onde est\u00E1 localizado o seu banco?',
                howDoYouWantToConnect: 'Como voc\u00EA deseja se conectar ao seu banco?',
                learnMoreAboutOptions: {
                    text: 'Saiba mais sobre estes',
                    linkText: 'op\u00E7\u00F5es.',
                },
                commercialFeedDetails:
                    'Requer configura\u00E7\u00E3o com seu banco. Isso \u00E9 tipicamente usado por empresas maiores e \u00E9 frequentemente a melhor op\u00E7\u00E3o se voc\u00EA se qualificar.',
                commercialFeedPlaidDetails: `Requer configura\u00E7\u00E3o com seu banco, mas n\u00F3s vamos te guiar. Isso geralmente \u00E9 limitado a empresas maiores.`,
                directFeedDetails: 'A abordagem mais simples. Conecte-se imediatamente usando suas credenciais principais. Este m\u00E9todo \u00E9 o mais comum.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Ative seu feed ${provider}`,
                    heading:
                        'Temos uma integra\u00E7\u00E3o direta com o emissor do seu cart\u00E3o e podemos importar seus dados de transa\u00E7\u00E3o para o Expensify de forma r\u00E1pida e precisa.\n\nPara come\u00E7ar, simplesmente:',
                    visa: 'Temos integra\u00E7\u00F5es globais com a Visa, embora a elegibilidade varie de acordo com o banco e o programa do cart\u00E3o.\n\nPara come\u00E7ar, simplesmente:',
                    mastercard:
                        'Temos integra\u00E7\u00F5es globais com a Mastercard, embora a elegibilidade varie de acordo com o banco e o programa do cart\u00E3o.\n\nPara come\u00E7ar, simplesmente:',
                    vcf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para instru\u00E7\u00F5es detalhadas sobre como configurar seus Cart\u00F5es Comerciais Visa.\n\n2. [Entre em contato com seu banco](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para verificar se eles oferecem suporte a um feed comercial para o seu programa e pe\u00E7a para ativ\u00E1-lo.\n\n3. *Assim que o feed estiver ativado e voc\u00EA tiver os detalhes, continue para a pr\u00F3xima tela.*`,
                    gl1025: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) para descobrir se a American Express pode habilitar um feed comercial para o seu programa.\n\n2. Assim que o feed estiver habilitado, a Amex enviar\u00E1 uma carta de produ\u00E7\u00E3o para voc\u00EA.\n\n3. *Assim que tiver as informa\u00E7\u00F5es do feed, continue para a pr\u00F3xima tela.*`,
                    cdf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para instru\u00E7\u00F5es detalhadas sobre como configurar seus cart\u00F5es Mastercard Commercial.\n\n2. [Contate seu banco](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para verificar se eles oferecem suporte a um feed comercial para o seu programa e pe\u00E7a para ativ\u00E1-lo.\n\n3. *Assim que o feed estiver ativado e voc\u00EA tiver seus detalhes, continue para a pr\u00F3xima tela.*`,
                    stripe: `1. Visite o Dashboard do Stripe e v\u00E1 para [Configura\u00E7\u00F5es](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Em Integra\u00E7\u00F5es de Produto, clique em Ativar ao lado de Expensify.\n\n3. Uma vez que o feed esteja ativado, clique em Enviar abaixo e n\u00F3s trabalharemos para adicion\u00E1-lo.`,
                },
                whatBankIssuesCard: 'Qual banco emite esses cart\u00F5es?',
                enterNameOfBank: 'Digite o nome do banco',
                feedDetails: {
                    vcf: {
                        title: 'Quais s\u00E3o os detalhes do feed Visa?',
                        processorLabel: 'ID do Processador',
                        bankLabel: 'ID da institui\u00E7\u00E3o financeira (banco)',
                        companyLabel: 'ID da Empresa',
                        helpLabel: 'Onde encontro esses IDs?',
                    },
                    gl1025: {
                        title: `Qual \u00E9 o nome do arquivo de entrega Amex?`,
                        fileNameLabel: 'Nome do arquivo de entrega',
                        helpLabel: 'Onde posso encontrar o nome do arquivo de entrega?',
                    },
                    cdf: {
                        title: `Qual \u00E9 o ID de distribui\u00E7\u00E3o do Mastercard?`,
                        distributionLabel: 'ID de Distribui\u00E7\u00E3o',
                        helpLabel: 'Onde encontro o ID de distribui\u00E7\u00E3o?',
                    },
                },
                amexCorporate: 'Selecione esta op\u00E7\u00E3o se a frente dos seus cart\u00F5es disser "Corporate"',
                amexBusiness: 'Selecione esta op\u00E7\u00E3o se a frente dos seus cart\u00F5es disser "Business"',
                amexPersonal: 'Selecione esta op\u00E7\u00E3o se seus cart\u00F5es forem pessoais',
                error: {
                    pleaseSelectProvider: 'Por favor, selecione um provedor de cart\u00E3o antes de continuar.',
                    pleaseSelectBankAccount: 'Por favor, selecione uma conta banc\u00E1ria antes de continuar.',
                    pleaseSelectBank: 'Por favor, selecione um banco antes de continuar.',
                    pleaseSelectCountry: 'Por favor, selecione um pa\u00EDs antes de continuar.',
                    pleaseSelectFeedType: 'Por favor, selecione um tipo de feed antes de continuar.',
                },
            },
            assignCard: 'Atribuir cart\u00E3o',
            findCard: 'Encontrar cart\u00E3o',
            cardNumber: 'N\u00FAmero do cart\u00E3o',
            commercialFeed: 'Feed comercial',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Cart\u00F5es ${feedName}`,
            directFeed: 'Feed direto',
            whoNeedsCardAssigned: 'Quem precisa de um cart\u00E3o atribu\u00EDdo?',
            chooseCard: 'Escolha um cart\u00E3o',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Escolha um cart\u00E3o para ${assignee} do feed de cart\u00F5es ${feed}.`,
            noActiveCards: 'Nenhum cart\u00E3o ativo neste feed',
            somethingMightBeBroken: 'Ou algo pode estar quebrado. De qualquer forma, se voc\u00EA tiver alguma d\u00FAvida, apenas',
            contactConcierge: 'contatar Concierge',
            chooseTransactionStartDate: 'Escolha uma data de in\u00EDcio para a transa\u00E7\u00E3o',
            startDateDescription: 'Importaremos todas as transa\u00E7\u00F5es a partir desta data. Se nenhuma data for especificada, iremos o mais longe que seu banco permitir.',
            fromTheBeginning: 'Desde o in\u00EDcio',
            customStartDate: 'Data de in\u00EDcio personalizada',
            letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
            confirmationDescription: 'Come\u00E7aremos a importar transa\u00E7\u00F5es imediatamente.',
            cardholder: 'Titular do cart\u00E3o',
            card: 'Cart\u00E3o',
            cardName: 'Nome do cart\u00E3o',
            brokenConnectionErrorFirstPart: `A conex\u00E3o do feed do cart\u00E3o est\u00E1 quebrada. Por favor,`,
            brokenConnectionErrorLink: 'fa\u00E7a login no seu banco',
            brokenConnectionErrorSecondPart: 'para que possamos estabelecer a conex\u00E3o novamente.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `atribuiu ${assignee} um ${link}! As transa\u00E7\u00F5es importadas aparecer\u00E3o neste chat.`,
            companyCard: 'cart\u00E3o corporativo',
            chooseCardFeed: 'Escolher feed do cart\u00E3o',
            ukRegulation:
                'A Expensify Limited \u00E9 um agente da Plaid Financial Ltd., uma institui\u00E7\u00E3o de pagamento autorizada e regulamentada pela Financial Conduct Authority sob as Payment Services Regulations 2017 (N\u00FAmero de Refer\u00EAncia da Empresa: 804718). A Plaid fornece a voc\u00EA servi\u00E7os de informa\u00E7\u00F5es de conta regulamentados atrav\u00E9s da Expensify Limited como seu agente.',
        },
        expensifyCard: {
            issueAndManageCards: 'Emita e gerencie seus Cart\u00F5es Expensify',
            getStartedIssuing: 'Comece emitindo seu primeiro cart\u00E3o virtual ou f\u00EDsico.',
            verificationInProgress: 'Verifica\u00E7\u00E3o em andamento...',
            verifyingTheDetails: 'Estamos verificando alguns detalhes. Concierge avisar\u00E1 quando os Cart\u00F5es Expensify estiverem prontos para serem emitidos.',
            disclaimer:
                'O Expensify Visa\u00AE Commercial Card \u00E9 emitido pelo The Bancorp Bank, N.A., Membro FDIC, de acordo com uma licen\u00E7a da Visa U.S.A. Inc. e pode n\u00E3o ser aceito em todos os comerciantes que aceitam cart\u00F5es Visa. Apple\u00AE e o logotipo da Apple\u00AE s\u00E3o marcas registradas da Apple Inc., registradas nos EUA e em outros pa\u00EDses. App Store \u00E9 uma marca de servi\u00E7o da Apple Inc. Google Play e o logotipo do Google Play s\u00E3o marcas registradas da Google LLC.',
            issueCard: 'Emitir cart\u00E3o',
            findCard: 'Encontrar cart\u00E3o',
            newCard: 'Novo cart\u00E3o',
            name: 'Nome',
            lastFour: '\u00DAltimos 4',
            limit: 'Limite',
            currentBalance: 'Saldo atual',
            currentBalanceDescription: 'O saldo atual \u00E9 a soma de todas as transa\u00E7\u00F5es do Expensify Card que ocorreram desde a \u00FAltima data de liquida\u00E7\u00E3o.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `O saldo ser\u00E1 liquidado em ${settlementDate}`,
            settleBalance: 'Liquidar saldo',
            cardLimit: 'Limite do cart\u00E3o',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: 'Solicitar aumento de limite',
            remainingLimitDescription:
                'Consideramos v\u00E1rios fatores ao calcular seu limite restante: seu tempo como cliente, as informa\u00E7\u00F5es relacionadas ao neg\u00F3cio que voc\u00EA forneceu durante o cadastro e o dinheiro dispon\u00EDvel na conta banc\u00E1ria da sua empresa. Seu limite restante pode flutuar diariamente.',
            earnedCashback: 'Dinheiro de volta',
            earnedCashbackDescription: 'O saldo de cashback \u00E9 baseado nos gastos mensais liquidados do Cart\u00E3o Expensify em todo o seu espa\u00E7o de trabalho.',
            issueNewCard: 'Emitir novo cart\u00E3o',
            finishSetup: 'Concluir configura\u00E7\u00E3o',
            chooseBankAccount: 'Escolher conta banc\u00E1ria',
            chooseExistingBank: 'Escolha uma conta banc\u00E1ria empresarial existente para pagar o saldo do seu Cart\u00E3o Expensify, ou adicione uma nova conta banc\u00E1ria',
            accountEndingIn: 'Conta terminando em',
            addNewBankAccount: 'Adicionar uma nova conta banc\u00E1ria',
            settlementAccount: 'Conta de liquida\u00E7\u00E3o',
            settlementAccountDescription: 'Escolha uma conta para pagar o saldo do seu Cart\u00E3o Expensify.',
            settlementAccountInfoPt1: 'Certifique-se de que esta conta corresponde \u00E0 sua',
            settlementAccountInfoPt2: 'para que a Reconcilia\u00E7\u00E3o Cont\u00EDnua funcione corretamente.',
            reconciliationAccount: 'Conta de reconcilia\u00E7\u00E3o',
            settlementFrequency: 'Frequ\u00EAncia de liquida\u00E7\u00E3o',
            settlementFrequencyDescription: 'Escolha com que frequ\u00EAncia voc\u00EA pagar\u00E1 o saldo do seu Cart\u00E3o Expensify.',
            settlementFrequencyInfo:
                'Se voc\u00EA quiser mudar para liquida\u00E7\u00E3o mensal, precisar\u00E1 conectar sua conta banc\u00E1ria via Plaid e ter um hist\u00F3rico de saldo positivo de 90 dias.',
            frequency: {
                daily: 'Di\u00E1rio',
                monthly: 'Mensalmente',
            },
            cardDetails: 'Detalhes do cart\u00E3o',
            virtual: 'Virtual',
            physical: 'F\u00EDsico',
            deactivate: 'Desativar cart\u00E3o',
            changeCardLimit: 'Alterar limite do cart\u00E3o',
            changeLimit: 'Alterar limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se voc\u00EA alterar o limite deste cart\u00E3o para ${limit}, novas transa\u00E7\u00F5es ser\u00E3o recusadas at\u00E9 que voc\u00EA aprove mais despesas no cart\u00E3o.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se voc\u00EA alterar o limite deste cart\u00E3o para ${limit}, novas transa\u00E7\u00F5es ser\u00E3o recusadas at\u00E9 o pr\u00F3ximo m\u00EAs.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Se voc\u00EA alterar o limite deste cart\u00E3o para ${limit}, novas transa\u00E7\u00F5es ser\u00E3o recusadas.`,
            changeCardLimitType: 'Alterar tipo de limite do cart\u00E3o',
            changeLimitType: 'Alterar tipo de limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se voc\u00EA alterar o tipo de limite deste cart\u00E3o para Limite Inteligente, novas transa\u00E7\u00F5es ser\u00E3o recusadas porque o limite n\u00E3o aprovado de ${limit} j\u00E1 foi atingido.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se voc\u00EA alterar o tipo de limite deste cart\u00E3o para Mensal, novas transa\u00E7\u00F5es ser\u00E3o recusadas porque o limite mensal de ${limit} j\u00E1 foi atingido.`,
            addShippingDetails: 'Adicionar detalhes de envio',
            issuedCard: ({assignee}: AssigneeParams) => `emitiu um Cart\u00E3o Expensify para ${assignee}! O cart\u00E3o chegar\u00E1 em 2-3 dias \u00FAteis.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `emitiu um Cart\u00E3o Expensify para ${assignee}! O cart\u00E3o ser\u00E1 enviado assim que os detalhes de envio forem adicionados.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `emitiu ${assignee} um ${link} virtual! O cart\u00E3o pode ser usado imediatamente.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} adicionou os detalhes de envio. O Cart\u00E3o Expensify chegar\u00E1 em 2-3 dias \u00FAteis.`,
            verifyingHeader: 'Verificando',
            bankAccountVerifiedHeader: 'Conta banc\u00E1ria verificada',
            verifyingBankAccount: 'Verificando conta banc\u00E1ria...',
            verifyingBankAccountDescription: 'Por favor, aguarde enquanto confirmamos se esta conta pode ser usada para emitir Cart\u00F5es Expensify.',
            bankAccountVerified: 'Conta banc\u00E1ria verificada!',
            bankAccountVerifiedDescription: 'Agora voc\u00EA pode emitir Cart\u00F5es Expensify para os membros do seu espa\u00E7o de trabalho.',
            oneMoreStep: 'Mais um passo...',
            oneMoreStepDescription:
                'Parece que precisamos verificar manualmente sua conta banc\u00E1ria. Por favor, v\u00E1 at\u00E9 o Concierge onde suas instru\u00E7\u00F5es est\u00E3o esperando por voc\u00EA.',
            gotIt: 'Entendi',
            goToConcierge: 'Ir para o Concierge',
        },
        categories: {
            deleteCategories: 'Excluir categorias',
            deleteCategoriesPrompt: 'Tem certeza de que deseja excluir essas categorias?',
            deleteCategory: 'Excluir categoria',
            deleteCategoryPrompt: 'Tem certeza de que deseja excluir esta categoria?',
            disableCategories: 'Desativar categorias',
            disableCategory: 'Desativar categoria',
            enableCategories: 'Ativar categorias',
            enableCategory: 'Ativar categoria',
            defaultSpendCategories: 'Categorias de despesas padr\u00E3o',
            spendCategoriesDescription:
                'Personalize como os gastos com comerciantes s\u00E3o categorizados para transa\u00E7\u00F5es de cart\u00E3o de cr\u00E9dito e recibos digitalizados.',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a categoria, por favor, tente novamente.',
            categoryName: 'Nome da categoria',
            requiresCategory: 'Os membros devem categorizar todas as despesas',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Todas as despesas devem ser categorizadas para exportar para ${connectionName}.`,
            subtitle: 'Obtenha uma melhor vis\u00E3o geral de onde o dinheiro est\u00E1 sendo gasto. Use nossas categorias padr\u00E3o ou adicione as suas pr\u00F3prias.',
            emptyCategories: {
                title: 'Voc\u00EA n\u00E3o criou nenhuma categoria',
                subtitle: 'Adicione uma categoria para organizar seus gastos.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Suas categorias est\u00E3o sendo importadas de uma conex\u00E3o cont\u00E1bil. V\u00E1 para',
                subtitle2: 'contabilidade',
                subtitle3: 'para fazer quaisquer altera\u00E7\u00F5es.',
            },
            updateFailureMessage: 'Ocorreu um erro ao atualizar a categoria, por favor, tente novamente.',
            createFailureMessage: 'Ocorreu um erro ao criar a categoria, por favor, tente novamente.',
            addCategory: 'Adicionar categoria',
            editCategory: 'Editar categoria',
            editCategories: 'Editar categorias',
            findCategory: 'Encontrar categoria',
            categoryRequiredError: 'Nome da categoria \u00E9 obrigat\u00F3rio',
            existingCategoryError: 'J\u00E1 existe uma categoria com este nome',
            invalidCategoryName: 'Nome de categoria inv\u00E1lido',
            importedFromAccountingSoftware: 'As categorias abaixo s\u00E3o importadas do seu',
            payrollCode: 'C\u00F3digo de folha de pagamento',
            updatePayrollCodeFailureMessage: 'Ocorreu um erro ao atualizar o c\u00F3digo da folha de pagamento, por favor, tente novamente.',
            glCode: 'C\u00F3digo GL',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o c\u00F3digo GL, por favor, tente novamente.',
            importCategories: 'Importar categorias',
            cannotDeleteOrDisableAllCategories: {
                title: 'N\u00E3o \u00E9 poss\u00EDvel excluir ou desativar todas as categorias',
                description: `Pelo menos uma categoria deve permanecer habilitada porque seu espa\u00E7o de trabalho requer categorias.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Use os bot\u00F5es abaixo para ativar mais recursos \u00E0 medida que voc\u00EA cresce. Cada recurso aparecer\u00E1 no menu de navega\u00E7\u00E3o para personaliza\u00E7\u00E3o adicional.',
            spendSection: {
                title: 'Gasto',
                subtitle: 'Ative a funcionalidade que ajuda a expandir sua equipe.',
            },
            manageSection: {
                title: 'Gerenciar',
                subtitle: 'Adicione controles que ajudem a manter os gastos dentro do or\u00E7amento.',
            },
            earnSection: {
                title: 'Ganhar',
                subtitle: 'Otimize sua receita e receba pagamentos mais rapidamente.',
            },
            organizeSection: {
                title: 'Organizar',
                subtitle: 'Agrupe e analise os gastos, registre todos os impostos pagos.',
            },
            integrateSection: {
                title: 'Integrar',
                subtitle: 'Conecte o Expensify a produtos financeiros populares.',
            },
            distanceRates: {
                title: 'Taxas de dist\u00E2ncia',
                subtitle: 'Adicione, atualize e aplique tarifas.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Defina taxas de di\u00E1rias para controlar os gastos di\u00E1rios dos funcion\u00E1rios.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Obtenha insights e controle sobre os gastos.',
                disableCardTitle: 'Desativar Expensify Card',
                disableCardPrompt: 'Voc\u00EA n\u00E3o pode desativar o Expensify Card porque ele j\u00E1 est\u00E1 em uso. Entre em contato com o Concierge para os pr\u00F3ximos passos.',
                disableCardButton: 'Converse com o Concierge',
                feed: {
                    title: 'Obtenha o Cart\u00E3o Expensify',
                    subTitle: 'Simplifique as despesas do seu neg\u00F3cio e economize at\u00E9 50% na sua fatura do Expensify, al\u00E9m de:',
                    features: {
                        cashBack: 'Dinheiro de volta em cada compra nos EUA',
                        unlimited: 'Cart\u00F5es virtuais ilimitados',
                        spend: 'Controles de gastos e limites personalizados',
                    },
                    ctaTitle: 'Emitir novo cart\u00E3o',
                },
            },
            companyCards: {
                title: 'Cart\u00F5es corporativos',
                subtitle: 'Importar despesas de cart\u00F5es corporativos existentes.',
                feed: {
                    title: 'Importar cart\u00F5es corporativos',
                    features: {
                        support: 'Suporte para todos os principais provedores de cart\u00E3o',
                        assignCards: 'Atribuir cart\u00F5es para toda a equipe',
                        automaticImport: 'Importa\u00E7\u00E3o autom\u00E1tica de transa\u00E7\u00F5es',
                    },
                },
                disableCardTitle: 'Desativar cart\u00F5es corporativos',
                disableCardPrompt:
                    'Voc\u00EA n\u00E3o pode desativar os cart\u00F5es corporativos porque esse recurso est\u00E1 em uso. Entre em contato com o Concierge para os pr\u00F3ximos passos.',
                disableCardButton: 'Converse com o Concierge',
                cardDetails: 'Detalhes do cart\u00E3o',
                cardNumber: 'N\u00FAmero do cart\u00E3o',
                cardholder: 'Titular do cart\u00E3o',
                cardName: 'Nome do cart\u00E3o',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} exporta\u00E7\u00E3o` : `exporta\u00E7\u00E3o ${integration}`,
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Escolha a conta ${integration} para onde as transa\u00E7\u00F5es devem ser exportadas.`,
                integrationExportTitlePart: 'Selecione um diferente',
                integrationExportTitleLinkPart: 'op\u00E7\u00E3o de exporta\u00E7\u00E3o',
                integrationExportTitleSecondPart: 'para alterar as contas dispon\u00EDveis.',
                lastUpdated: '\u00DAltima atualiza\u00E7\u00E3o',
                transactionStartDate: 'Data de in\u00EDcio da transa\u00E7\u00E3o',
                updateCard: 'Atualizar cart\u00E3o',
                unassignCard: 'Desatribuir cart\u00E3o',
                unassign: 'Desatribuir',
                unassignCardDescription: 'Desatribuir este cart\u00E3o remover\u00E1 todas as transa\u00E7\u00F5es em relat\u00F3rios de rascunho da conta do titular do cart\u00E3o.',
                assignCard: 'Atribuir cart\u00E3o',
                cardFeedName: 'Nome do feed do cart\u00E3o',
                cardFeedNameDescription: 'D\u00EA ao feed do cart\u00E3o um nome \u00FAnico para que voc\u00EA possa diferenci\u00E1-lo dos outros.',
                cardFeedTransaction: 'Excluir transa\u00E7\u00F5es',
                cardFeedTransactionDescription:
                    'Escolha se os portadores de cart\u00E3o podem excluir transa\u00E7\u00F5es de cart\u00E3o. Novas transa\u00E7\u00F5es seguir\u00E3o essas regras.',
                cardFeedRestrictDeletingTransaction: 'Restringir a exclus\u00E3o de transa\u00E7\u00F5es',
                cardFeedAllowDeletingTransaction: 'Permitir excluir transa\u00E7\u00F5es',
                removeCardFeed: 'Remover feed do cart\u00E3o',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Remover feed ${feedName}`,
                removeCardFeedDescription: 'Tem certeza de que deseja remover este feed de cart\u00F5es? Isso desatribuir\u00E1 todos os cart\u00F5es.',
                error: {
                    feedNameRequired: 'O nome do feed do cart\u00E3o \u00E9 obrigat\u00F3rio',
                },
                corporate: 'Restringir a exclus\u00E3o de transa\u00E7\u00F5es',
                personal: 'Permitir excluir transa\u00E7\u00F5es',
                setFeedNameDescription: 'D\u00EA um nome \u00FAnico ao feed do cart\u00E3o para que voc\u00EA possa diferenci\u00E1-lo dos outros.',
                setTransactionLiabilityDescription:
                    'Quando ativado, os portadores de cart\u00E3o podem excluir transa\u00E7\u00F5es do cart\u00E3o. Novas transa\u00E7\u00F5es seguir\u00E3o esta regra.',
                emptyAddedFeedTitle: 'Atribuir cart\u00F5es corporativos',
                emptyAddedFeedDescription: 'Comece atribuindo seu primeiro cart\u00E3o a um membro.',
                pendingFeedTitle: `Estamos analisando sua solicita\u00E7\u00E3o...`,
                pendingFeedDescription: `Atualmente, estamos revisando os detalhes do seu feed. Assim que isso for conclu\u00EDdo, entraremos em contato com voc\u00EA via`,
                pendingBankTitle: 'Verifique a janela do seu navegador',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `Conecte-se ao ${bankName} atrav\u00E9s da janela do navegador que acabou de abrir. Se uma n\u00E3o abriu,`,
                pendingBankLink: 'por favor, clique aqui.',
                giveItNameInstruction: 'D\u00EA ao cart\u00E3o um nome que o diferencie dos outros.',
                updating: 'Atualizando...',
                noAccountsFound: 'Nenhuma conta encontrada',
                defaultCard: 'Cart\u00E3o padr\u00E3o',
                downgradeTitle: `N\u00E3o \u00E9 poss\u00EDvel rebaixar o espa\u00E7o de trabalho`,
                downgradeSubTitleFirstPart: `Este espa\u00E7o de trabalho n\u00E3o pode ser rebaixado porque m\u00FAltiplos feeds de cart\u00E3o est\u00E3o conectados (excluindo os Cart\u00F5es Expensify). Por favor,`,
                downgradeSubTitleMiddlePart: `manter apenas um feed de cart\u00E3o`,
                downgradeSubTitleLastPart: 'para prosseguir.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Por favor, adicione a conta em ${connection} e sincronize a conex\u00E3o novamente.`,
                expensifyCardBannerTitle: 'Obtenha o Cart\u00E3o Expensify',
                expensifyCardBannerSubtitle:
                    'Aproveite cashback em todas as compras nos EUA, at\u00E9 50% de desconto na sua fatura do Expensify, cart\u00F5es virtuais ilimitados e muito mais.',
                expensifyCardBannerLearnMoreButton: 'Saiba mais',
            },
            workflows: {
                title: 'Fluxos de trabalho',
                subtitle: 'Configure como os gastos s\u00E3o aprovados e pagos.',
                disableApprovalPrompt:
                    'Os Cart\u00F5es Expensify deste espa\u00E7o de trabalho atualmente dependem de aprova\u00E7\u00E3o para definir seus Limites Inteligentes. Por favor, altere os tipos de limite de quaisquer Cart\u00F5es Expensify com Limites Inteligentes antes de desativar as aprova\u00E7\u00F5es.',
            },
            invoices: {
                title: 'Faturas',
                subtitle: 'Envie e receba faturas.',
            },
            categories: {
                title: 'Categorias',
                subtitle: 'Acompanhe e organize os gastos.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classifique custos e acompanhe despesas fatur\u00E1veis.',
            },
            taxes: {
                title: 'Impostos',
                subtitle: 'Documente e recupere impostos eleg\u00EDveis.',
            },
            reportFields: {
                title: 'Campos do relat\u00F3rio',
                subtitle: 'Configurar campos personalizados para gastos.',
            },
            connections: {
                title: 'Contabilidade',
                subtitle: 'Sincronize seu plano de contas e mais.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'N\u00E3o t\u00E3o r\u00E1pido...',
                featureEnabledText: 'Para ativar ou desativar esse recurso, voc\u00EA precisar\u00E1 alterar suas configura\u00E7\u00F5es de importa\u00E7\u00E3o cont\u00E1bil.',
                disconnectText: 'Para desativar a contabilidade, voc\u00EA precisar\u00E1 desconectar sua conex\u00E3o cont\u00E1bil do seu espa\u00E7o de trabalho.',
                manageSettings: 'Gerenciar configura\u00E7\u00F5es',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'N\u00E3o t\u00E3o r\u00E1pido...',
                featureEnabledText:
                    'Os Cart\u00F5es Expensify neste espa\u00E7o de trabalho dependem de fluxos de aprova\u00E7\u00E3o para definir seus Limites Inteligentes.\n\nPor favor, altere os tipos de limite de quaisquer cart\u00F5es com Limites Inteligentes antes de desativar os fluxos de trabalho.',
                confirmText: 'Ir para Expensify Cards',
            },
            rules: {
                title: 'Regras',
                subtitle: 'Exigir recibos, sinalizar gastos altos e mais.',
            },
        },
        reportFields: {
            addField: 'Adicionar campo',
            delete: 'Excluir campo',
            deleteFields: 'Excluir campos',
            findReportField: 'Encontrar campo do relat\u00F3rio',
            deleteConfirmation: 'Tem certeza de que deseja excluir este campo de relat\u00F3rio?',
            deleteFieldsConfirmation: 'Tem certeza de que deseja excluir esses campos de relat\u00F3rio?',
            emptyReportFields: {
                title: 'Voc\u00EA n\u00E3o criou nenhum campo de relat\u00F3rio',
                subtitle: 'Adicione um campo personalizado (texto, data ou lista suspensa) que aparece nos relat\u00F3rios.',
            },
            subtitle: 'Os campos de relat\u00F3rio se aplicam a todos os gastos e podem ser \u00FAteis quando voc\u00EA deseja solicitar informa\u00E7\u00F5es adicionais.',
            disableReportFields: 'Desativar campos do relat\u00F3rio',
            disableReportFieldsConfirmation: 'Tem certeza? Campos de texto e data ser\u00E3o exclu\u00EDdos, e listas ser\u00E3o desativadas.',
            importedFromAccountingSoftware: 'Os campos do relat\u00F3rio abaixo s\u00E3o importados do seu',
            textType: 'Texto',
            dateType: 'Data',
            dropdownType: 'Lista',
            textAlternateText: 'Adicione um campo para entrada de texto livre.',
            dateAlternateText: 'Adicione um calend\u00E1rio para sele\u00E7\u00E3o de data.',
            dropdownAlternateText: 'Adicione uma lista de op\u00E7\u00F5es para escolher.',
            nameInputSubtitle: 'Escolha um nome para o campo do relat\u00F3rio.',
            typeInputSubtitle: 'Escolha qual tipo de campo de relat\u00F3rio usar.',
            initialValueInputSubtitle: 'Insira um valor inicial para exibir no campo do relat\u00F3rio.',
            listValuesInputSubtitle: 'Esses valores aparecer\u00E3o no menu suspenso do campo do seu relat\u00F3rio. Valores habilitados podem ser selecionados pelos membros.',
            listInputSubtitle: 'Esses valores aparecer\u00E3o na lista de campos do seu relat\u00F3rio. Valores habilitados podem ser selecionados pelos membros.',
            deleteValue: 'Excluir valor',
            deleteValues: 'Excluir valores',
            disableValue: 'Desativar valor',
            disableValues: 'Desativar valores',
            enableValue: 'Ativar valor',
            enableValues: 'Habilitar valores',
            emptyReportFieldsValues: {
                title: 'Voc\u00EA n\u00E3o criou nenhum valor de lista',
                subtitle: 'Adicione valores personalizados para aparecer nos relat\u00F3rios.',
            },
            deleteValuePrompt: 'Tem certeza de que deseja excluir este valor da lista?',
            deleteValuesPrompt: 'Tem certeza de que deseja excluir esses valores da lista?',
            listValueRequiredError: 'Por favor, insira um nome de valor de lista',
            existingListValueError: 'J\u00E1 existe um valor de lista com este nome',
            editValue: 'Editar valor',
            listValues: 'Listar valores',
            addValue: 'Adicionar valor',
            existingReportFieldNameError: 'Um campo de relat\u00F3rio com este nome j\u00E1 existe',
            reportFieldNameRequiredError: 'Por favor, insira um nome de campo de relat\u00F3rio',
            reportFieldTypeRequiredError: 'Por favor, escolha um tipo de campo de relat\u00F3rio',
            reportFieldInitialValueRequiredError: 'Por favor, escolha um valor inicial para o campo do relat\u00F3rio',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o campo do relat\u00F3rio. Por favor, tente novamente.',
        },
        tags: {
            tagName: 'Nome da tag',
            requiresTag: 'Os membros devem etiquetar todas as despesas',
            trackBillable: 'Acompanhar despesas fatur\u00E1veis',
            customTagName: 'Nome de tag personalizada',
            enableTag: 'Ativar tag',
            enableTags: 'Ativar tags',
            disableTag: 'Desativar tag',
            disableTags: 'Desativar tags',
            addTag: 'Adicionar tag',
            editTag: 'Editar tag',
            editTags: 'Editar tags',
            findTag: 'Encontrar tag',
            subtitle: 'As etiquetas adicionam maneiras mais detalhadas de classificar custos.',
            requireTag: 'Exigir tag',
            requireTags: 'Exigir tags',
            notRequireTags: 'Não exigir',

            dependentMultiLevelTagsSubtitle: {
                phrase1: ' Você está usando ',
                phrase2: 'tags dependentes',
                phrase3: '. Você pode ',
                phrase4: 'reimportar uma planilha',
                phrase5: ' para atualizar suas tags.',
            },

            emptyTags: {
                title: 'Voc\u00EA n\u00E3o criou nenhuma tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Adicione uma tag para rastrear projetos, locais, departamentos e mais.',
                subtitle1: 'Importe uma planilha para adicionar tags para rastrear projetos, locais, departamentos e mais.',
                subtitle2: 'Saiba mais',
                subtitle3: 'sobre formata\u00E7\u00E3o de arquivos de tags.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Seus tags est\u00E3o sendo importados de uma conex\u00E3o cont\u00E1bil. V\u00E1 para',
                subtitle2: 'contabilidade',
                subtitle3: 'para fazer quaisquer altera\u00E7\u00F5es.',
            },
            deleteTag: 'Excluir tag',
            deleteTags: 'Excluir tags',
            deleteTagConfirmation: 'Tem certeza de que deseja excluir esta tag?',
            deleteTagsConfirmation: 'Tem certeza de que deseja excluir essas tags?',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a tag, por favor, tente novamente.',
            tagRequiredError: 'O nome da tag \u00E9 obrigat\u00F3rio',
            existingTagError: 'Uma tag com este nome j\u00E1 existe',
            invalidTagNameError: 'O nome da tag n\u00E3o pode ser 0. Por favor, escolha um valor diferente.',
            genericFailureMessage: 'Ocorreu um erro ao atualizar a tag, por favor, tente novamente.',
            importedFromAccountingSoftware: 'As tags abaixo s\u00E3o importadas do seu',
            glCode: 'C\u00F3digo GL',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o c\u00F3digo GL, por favor, tente novamente.',
            tagRules: 'Regras de tag',
            approverDescription: 'Aprovador',
            importTags: 'Importar tags',
            importTagsSupportingText: 'Codifique suas despesas com um tipo de etiqueta ou v\u00E1rias.',
            configureMultiLevelTags: 'Configure sua lista de tags para marca\u00E7\u00E3o em m\u00FAltiplos n\u00EDveis.',
            importMultiLevelTagsSupportingText: `Aqui est\u00E1 uma pr\u00E9via das suas tags. Se tudo estiver correto, clique abaixo para import\u00E1-las.`,
            importMultiLevelTags: {
                firstRowTitle: 'A primeira linha \u00E9 o t\u00EDtulo de cada lista de tags',
                independentTags: 'Essas s\u00E3o tags independentes',
                glAdjacentColumn: 'H\u00E1 um c\u00F3digo GL na coluna adjacente',
            },
            tagLevel: {
                singleLevel: '\u00DAnico n\u00EDvel de tags',
                multiLevel: 'Tags multin\u00EDveis',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Alternar N\u00EDveis de Tag',
                prompt1: 'Mudar os n\u00EDveis de tag apagar\u00E1 todas as tags atuais.',
                prompt2: 'Sugerimos que voc\u00EA primeiro',
                prompt3: 'baixar um backup',
                prompt4: 'exportando suas tags.',
                prompt5: 'Saiba mais',
                prompt6: 'sobre os n\u00EDveis de tag.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Encontramos *${columnCounts} colunas* na sua planilha. Selecione *Nome* ao lado da coluna que cont\u00E9m os nomes das tags. Voc\u00EA tamb\u00E9m pode selecionar *Ativado* ao lado da coluna que define o status das tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'N\u00E3o \u00E9 poss\u00EDvel excluir ou desativar todas as tags',
                description: `Pelo menos uma tag deve permanecer habilitada porque seu espa\u00E7o de trabalho requer tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'N\u00E3o \u00E9 poss\u00EDvel tornar todas as tags opcionais',
                description: `Pelo menos uma etiqueta deve permanecer obrigat\u00F3ria porque as configura\u00E7\u00F5es do seu espa\u00E7o de trabalho exigem etiquetas.`,
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Adicione nomes de impostos, taxas e defina padr\u00F5es.',
            addRate: 'Adicionar taxa',
            workspaceDefault: 'Moeda padr\u00E3o do espa\u00E7o de trabalho',
            foreignDefault: 'Moeda estrangeira padr\u00E3o',
            customTaxName: 'Nome personalizado do imposto',
            value: 'Valor',
            taxReclaimableOn: 'Imposto recuper\u00E1vel em',
            taxRate: 'Taxa de imposto',
            findTaxRate: 'Encontrar taxa de imposto',
            error: {
                taxRateAlreadyExists: 'Este nome de imposto j\u00E1 est\u00E1 em uso',
                taxCodeAlreadyExists: 'Este c\u00F3digo fiscal j\u00E1 est\u00E1 em uso',
                valuePercentageRange: 'Por favor, insira uma porcentagem v\u00E1lida entre 0 e 100',
                customNameRequired: 'Nome do imposto personalizado \u00E9 obrigat\u00F3rio',
                deleteFailureMessage: 'Ocorreu um erro ao excluir a taxa de imposto. Por favor, tente novamente ou pe\u00E7a ajuda ao Concierge.',
                updateFailureMessage: 'Ocorreu um erro ao atualizar a taxa de imposto. Por favor, tente novamente ou pe\u00E7a ajuda ao Concierge.',
                createFailureMessage: 'Ocorreu um erro ao criar a taxa de imposto. Por favor, tente novamente ou pe\u00E7a ajuda ao Concierge.',
                updateTaxClaimableFailureMessage: 'A parte reembols\u00E1vel deve ser menor que o valor da taxa de dist\u00E2ncia',
            },
            deleteTaxConfirmation: 'Tem certeza de que deseja excluir este imposto?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Tem certeza de que deseja excluir os impostos de ${taxAmount}?`,
            actions: {
                delete: 'Excluir taxa',
                deleteMultiple: 'Excluir tarifas',
                enable: 'Habilitar taxa',
                disable: 'Desativar taxa',
                enableTaxRates: () => ({
                    one: 'Habilitar taxa',
                    other: 'Ativar tarifas',
                }),
                disableTaxRates: () => ({
                    one: 'Desativar taxa',
                    other: 'Desativar tarifas',
                }),
            },
            importedFromAccountingSoftware: 'Os impostos abaixo s\u00E3o importados do seu',
            taxCode: 'C\u00F3digo fiscal',
            updateTaxCodeFailureMessage: 'Ocorreu um erro ao atualizar o c\u00F3digo fiscal, por favor, tente novamente.',
        },
        emptyWorkspace: {
            title: 'Criar um espa\u00E7o de trabalho',
            subtitle: 'Crie um espa\u00E7o de trabalho para rastrear recibos, reembolsar despesas, gerenciar viagens, enviar faturas e muito mais \u2014 tudo na velocidade do chat.',
            createAWorkspaceCTA: 'Come\u00E7ar',
            features: {
                trackAndCollect: 'Acompanhe e colete recibos',
                reimbursements: 'Reembolsar funcion\u00E1rios',
                companyCards: 'Gerenciar cart\u00F5es da empresa',
            },
            notFound: 'Nenhum espa\u00E7o de trabalho encontrado',
            description:
                'As salas s\u00E3o um \u00F3timo lugar para discutir e trabalhar com v\u00E1rias pessoas. Para come\u00E7ar a colaborar, crie ou entre em um espa\u00E7o de trabalho.',
        },
        new: {
            newWorkspace: 'Novo espa\u00E7o de trabalho',
            getTheExpensifyCardAndMore: 'Obtenha o Cart\u00E3o Expensify e mais',
            confirmWorkspace: 'Confirmar Espa\u00E7o de Trabalho',
            myGroupWorkspace: 'Meu Espa\u00E7o de Trabalho em Grupo',
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Espa\u00E7o de Trabalho de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Ocorreu um erro ao remover um membro do espa\u00E7o de trabalho, por favor, tente novamente.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Tem certeza de que deseja remover ${memberName}?`,
                other: 'Tem certeza de que deseja remover esses membros?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} \u00E9 um aprovador neste espa\u00E7o de trabalho. Quando voc\u00EA deixar de compartilhar este espa\u00E7o de trabalho com ele, n\u00F3s o substituiremos no fluxo de aprova\u00E7\u00E3o pelo propriet\u00E1rio do espa\u00E7o de trabalho, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Remover membro',
                other: 'Remover membros',
            }),
            findMember: 'Encontrar membro',
            removeWorkspaceMemberButtonTitle: 'Remover do espa\u00E7o de trabalho',
            removeGroupMemberButtonTitle: 'Remover do grupo',
            removeRoomMemberButtonTitle: 'Remover do chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Tem certeza de que deseja remover ${memberName}?`,
            removeMemberTitle: 'Remover membro',
            transferOwner: 'Transferir propriet\u00E1rio',
            makeMember: 'Tornar membro',
            makeAdmin: 'Tornar administrador',
            makeAuditor: 'Fazer auditor',
            selectAll: 'Selecionar tudo',
            error: {
                genericAdd: 'Houve um problema ao adicionar este membro ao espa\u00E7o de trabalho',
                cannotRemove: 'Voc\u00EA n\u00E3o pode remover a si mesmo ou o propriet\u00E1rio do espa\u00E7o de trabalho',
                genericRemove: 'Houve um problema ao remover esse membro do espa\u00E7o de trabalho',
            },
            addedWithPrimary: 'Alguns membros foram adicionados com seus logins prim\u00E1rios.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Adicionado pelo login secund\u00E1rio ${secondaryLogin}.`,
            membersListTitle: 'Diret\u00F3rio de todos os membros do espa\u00E7o de trabalho.',
            importMembers: 'Importar membros',
        },
        card: {
            getStartedIssuing: 'Comece emitindo seu primeiro cart\u00E3o virtual ou f\u00EDsico.',
            issueCard: 'Emitir cart\u00E3o',
            issueNewCard: {
                whoNeedsCard: 'Quem precisa de um cart\u00E3o?',
                findMember: 'Encontrar membro',
                chooseCardType: 'Escolha um tipo de cart\u00E3o',
                physicalCard: 'Cart\u00E3o f\u00EDsico',
                physicalCardDescription: '\u00D3timo para quem gasta com frequ\u00EAncia',
                virtualCard: 'Cart\u00E3o virtual',
                virtualCardDescription: 'Instant\u00E2neo e flex\u00EDvel',
                chooseLimitType: 'Escolha um tipo de limite',
                smartLimit: 'Limite Inteligente',
                smartLimitDescription: 'Gastar at\u00E9 um determinado valor antes de exigir aprova\u00E7\u00E3o',
                monthly: 'Mensalmente',
                monthlyDescription: 'Gaste at\u00E9 um certo valor por m\u00EAs',
                fixedAmount: 'Valor fixo',
                fixedAmountDescription: 'Gastar at\u00E9 um certo valor uma vez',
                setLimit: 'Definir um limite',
                cardLimitError: 'Por favor, insira um valor menor que $21,474,836',
                giveItName: 'D\u00EA um nome a isso',
                giveItNameInstruction: 'Torne-o \u00FAnico o suficiente para diferenci\u00E1-lo de outros cart\u00F5es. Casos de uso espec\u00EDficos s\u00E3o ainda melhores!',
                cardName: 'Nome do cart\u00E3o',
                letsDoubleCheck: 'Vamos verificar se tudo est\u00E1 correto.',
                willBeReady: 'Este cart\u00E3o estar\u00E1 pronto para uso imediatamente.',
                cardholder: 'Titular do cart\u00E3o',
                cardType: 'Tipo de cart\u00E3o',
                limit: 'Limite',
                limitType: 'Tipo de limite',
                name: 'Nome',
            },
            deactivateCardModal: {
                deactivate: 'Desativar',
                deactivateCard: 'Desativar cart\u00E3o',
                deactivateConfirmation: 'Desativar este cart\u00E3o recusar\u00E1 todas as transa\u00E7\u00F5es futuras e n\u00E3o poder\u00E1 ser desfeito.',
            },
        },
        accounting: {
            settings: 'configura\u00E7\u00F5es',
            title: 'Conex\u00F5es',
            subtitle:
                'Conecte-se ao seu sistema de contabilidade para categorizar transa\u00E7\u00F5es com seu plano de contas, fazer a correspond\u00EAncia autom\u00E1tica de pagamentos e manter suas finan\u00E7as sincronizadas.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Converse com seu especialista em configura\u00E7\u00E3o.',
            talkYourAccountManager: 'Converse com o seu gerente de conta.',
            talkToConcierge: 'Converse com o Concierge.',
            needAnotherAccounting: 'Precisa de outro software de contabilidade?',
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
            errorODIntegration: 'H\u00E1 um erro com uma conex\u00E3o que foi configurada no Expensify Classic.',
            goToODToFix: 'V\u00E1 para o Expensify Classic para resolver este problema.',
            goToODToSettings: 'V\u00E1 para o Expensify Classic para gerenciar suas configura\u00E7\u00F5es.',
            setup: 'Conectar',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `\u00DAltima sincroniza\u00E7\u00E3o ${relativeDate}`,
            notSync: 'N\u00E3o sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avan\u00E7ado',
            other: 'Outro',
            syncNow: 'Sincronizar agora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar conector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integra\u00E7\u00E3o';
                return `Desconectar ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integra\u00E7\u00E3o cont\u00E1bil'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'N\u00E3o \u00E9 poss\u00EDvel conectar ao QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'N\u00E3o \u00E9 poss\u00EDvel conectar ao Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'N\u00E3o \u00E9 poss\u00EDvel conectar ao NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'N\u00E3o \u00E9 poss\u00EDvel conectar ao QuickBooks Desktop';
                    default: {
                        return 'N\u00E3o \u00E9 poss\u00EDvel conectar \u00E0 integra\u00E7\u00E3o';
                    }
                }
            },
            accounts: 'Plano de contas',
            taxes: 'Impostos',
            imported: 'Importado',
            notImported: 'N\u00E3o importado',
            importAsCategory: 'Importado como categorias',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importado como tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'N\u00E3o importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'N\u00E3o importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importado como campos de relat\u00F3rio',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Padr\u00E3o de funcion\u00E1rio do NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'esta integra\u00E7\u00E3o';
                return `Tem certeza de que deseja desconectar ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Tem certeza de que deseja conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'esta integra\u00E7\u00E3o cont\u00E1bil'}? Isso remover\u00E1 quaisquer conex\u00F5es cont\u00E1beis existentes.`,
            enterCredentials: 'Insira suas credenciais',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importando clientes';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importando funcion\u00E1rios';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importando contas';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importando classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importando locais';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Processando dados importados';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizando relat\u00F3rios reembolsados e pagamentos de contas';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importando c\u00F3digos de imposto';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verificando a conex\u00E3o com o QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importando dados do QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importando dados do Xero';
                        case 'startingImportQBO':
                            return 'Importando dados do QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importando dados do QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importando t\u00EDtulo';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importando certificado de aprova\u00E7\u00E3o';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importando dimens\u00F5es';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importando pol\u00EDtica de salvamento';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Ainda sincronizando dados com o QuickBooks... Por favor, certifique-se de que o Web Connector est\u00E1 em execu\u00E7\u00E3o';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizando dados do QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Carregando dados';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Atualizando categorias';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Atualizando clientes/projetos';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Atualizando lista de pessoas';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Atualizando campos do relat\u00F3rio';
                        case 'jobDone':
                            return 'Aguardando o carregamento dos dados importados';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizando plano de contas';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizando categorias';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizando clientes';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marcando relat\u00F3rios do Expensify como reembolsados';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marcando faturas e contas do Xero como pagas';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizando categorias de rastreamento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizando contas banc\u00E1rias';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizando taxas de imposto';
                        case 'xeroCheckConnection':
                            return 'Verificando conex\u00E3o com Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizando dados do Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicializando conex\u00E3o com NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importando clientes';
                        case 'netSuiteSyncInitData':
                            return 'Recuperando dados do NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importando impostos';
                        case 'netSuiteSyncImportItems':
                            return 'Importando itens';
                        case 'netSuiteSyncData':
                            return 'Importando dados para o Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizando contas';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizando moedas';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizando categorias';
                        case 'netSuiteSyncReportFields':
                            return 'Importando dados como campos de relat\u00F3rio do Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importando dados como tags do Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Atualizando informa\u00E7\u00F5es de conex\u00E3o';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcando relat\u00F3rios do Expensify como reembolsados';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcando faturas e contas do NetSuite como pagas';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importando fornecedores';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importando subsidi\u00E1rias';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importando fornecedores';
                        case 'intacctCheckConnection':
                            return 'Verificando a conex\u00E3o com o Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importando dimens\u00F5es do Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importando dados do Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Tradu\u00E7\u00E3o ausente para a etapa: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote:
                'O exportador preferido pode ser qualquer administrador do espa\u00E7o de trabalho, mas tamb\u00E9m deve ser um Administrador de Dom\u00EDnio se voc\u00EA definir contas de exporta\u00E7\u00E3o diferentes para cart\u00F5es corporativos individuais nas Configura\u00E7\u00F5es de Dom\u00EDnio.',
            exportPreferredExporterSubNote: 'Uma vez configurado, o exportador preferido ver\u00E1 os relat\u00F3rios para exporta\u00E7\u00E3o em sua conta.',
            exportAs: 'Exportar como',
            exportOutOfPocket: 'Exportar despesas do pr\u00F3prio bolso como',
            exportCompanyCard: 'Exportar despesas do cart\u00E3o corporativo como',
            exportDate: 'Data de exporta\u00E7\u00E3o',
            defaultVendor: 'Fornecedor padr\u00E3o',
            autoSync: 'Sincroniza\u00E7\u00E3o autom\u00E1tica',
            autoSyncDescription: 'Sincronize NetSuite e Expensify automaticamente, todos os dias. Exporte o relat\u00F3rio finalizado em tempo real.',
            reimbursedReports: 'Sincronizar relat\u00F3rios reembolsados',
            cardReconciliation: 'Reconcilia\u00E7\u00E3o de cart\u00E3o',
            reconciliationAccount: 'Conta de reconcilia\u00E7\u00E3o',
            continuousReconciliation: 'Reconcilia\u00E7\u00E3o Cont\u00EDnua',
            saveHoursOnReconciliation:
                'Economize horas na reconcilia\u00E7\u00E3o de cada per\u00EDodo cont\u00E1bil ao ter a Expensify reconciliando continuamente os extratos e liquida\u00E7\u00F5es do Cart\u00E3o Expensify em seu nome.',
            enableContinuousReconciliation: 'Para habilitar a Reconcilia\u00E7\u00E3o Cont\u00EDnua, por favor, ative',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Escolha a conta banc\u00E1ria na qual os pagamentos do seu Expensify Card ser\u00E3o reconciliados.',
                accountMatches: 'Certifique-se de que esta conta corresponda \u00E0 sua',
                settlementAccount: 'Conta de liquida\u00E7\u00E3o do Cart\u00E3o Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(terminando em ${lastFourPAN}) para que a Reconcilia\u00E7\u00E3o Cont\u00EDnua funcione corretamente.`,
            },
        },
        export: {
            notReadyHeading: 'N\u00E3o est\u00E1 pronto para exportar',
            notReadyDescription:
                'Relat\u00F3rios de despesas rascunho ou pendentes n\u00E3o podem ser exportados para o sistema cont\u00E1bil. Por favor, aprove ou pague essas despesas antes de export\u00E1-las.',
        },
        invoices: {
            sendInvoice: 'Enviar fatura',
            sendFrom: 'Enviar de',
            invoicingDetails: 'Detalhes de faturamento',
            invoicingDetailsDescription: 'Esta informa\u00E7\u00E3o aparecer\u00E1 em suas faturas.',
            companyName: 'Nome da empresa',
            companyWebsite: 'Site da empresa',
            paymentMethods: {
                personal: 'Pessoal',
                business: 'Neg\u00F3cio',
                chooseInvoiceMethod: 'Escolha um m\u00E9todo de pagamento abaixo:',
                addBankAccount: 'Adicionar conta banc\u00E1ria',
                payingAsIndividual: 'Pagando como indiv\u00EDduo',
                payingAsBusiness: 'Pagando como uma empresa',
            },
            invoiceBalance: 'Saldo da fatura',
            invoiceBalanceSubtitle:
                'Este \u00E9 o seu saldo atual de recebimentos de faturas. Ele ser\u00E1 transferido automaticamente para sua conta banc\u00E1ria se voc\u00EA tiver adicionado uma.',
            bankAccountsSubtitle: 'Adicione uma conta banc\u00E1ria para fazer e receber pagamentos de faturas.',
        },
        invite: {
            member: 'Convidar membro',
            members: 'Convidar membros',
            invitePeople: 'Convidar novos membros',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o espa\u00E7o de trabalho. Por favor, tente novamente.',
            pleaseEnterValidLogin: `Por favor, certifique-se de que o e-mail ou n\u00FAmero de telefone \u00E9 v\u00E1lido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'usu\u00E1rio',
            users: 'usu\u00E1rios',
            invited: 'convidado',
            removed: 'removido',
            to: 'para',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmar detalhes',
            inviteMessagePrompt: 'Torne seu convite ainda mais especial adicionando uma mensagem abaixo!',
            personalMessagePrompt: 'Mensagem',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o espa\u00E7o de trabalho. Por favor, tente novamente.',
            inviteNoMembersError: 'Por favor, selecione pelo menos um membro para convidar',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} solicitou para entrar em ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! N\u00E3o t\u00E3o r\u00E1pido...',
            workspaceNeeds: 'Um espa\u00E7o de trabalho precisa de pelo menos uma tarifa de dist\u00E2ncia habilitada.',
            distance: 'Dist\u00E2ncia',
            centrallyManage: 'Gerencie taxas centralmente, acompanhe em milhas ou quil\u00F4metros e defina uma categoria padr\u00E3o.',
            rate: 'Avaliar',
            addRate: 'Adicionar taxa',
            findRate: 'Encontrar taxa',
            trackTax: 'Acompanhar imposto',
            deleteRates: () => ({
                one: 'Excluir taxa',
                other: 'Excluir tarifas',
            }),
            enableRates: () => ({
                one: 'Habilitar taxa',
                other: 'Ativar tarifas',
            }),
            disableRates: () => ({
                one: 'Desativar taxa',
                other: 'Desativar tarifas',
            }),
            enableRate: 'Habilitar taxa',
            status: 'Status',
            unit: 'Unidade',
            taxFeatureNotEnabledMessage: 'Os impostos devem estar habilitados no espa\u00E7o de trabalho para usar este recurso. V\u00E1 para',
            changePromptMessage: 'para fazer essa altera\u00E7\u00E3o.',
            deleteDistanceRate: 'Excluir taxa de dist\u00E2ncia',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas tarifas?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Descri\u00E7\u00E3o',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valor inicial',
            nameInputHelpText: 'Este \u00E9 o nome que voc\u00EA ver\u00E1 no seu espa\u00E7o de trabalho.',
            nameIsRequiredError: 'Voc\u00EA precisar\u00E1 dar um nome ao seu espa\u00E7o de trabalho',
            currencyInputLabel: 'Moeda padr\u00E3o',
            currencyInputHelpText: 'Todas as despesas neste espa\u00E7o de trabalho ser\u00E3o convertidas para esta moeda.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `A moeda padr\u00E3o n\u00E3o pode ser alterada porque este espa\u00E7o de trabalho est\u00E1 vinculado a uma conta banc\u00E1ria em ${currency}.`,
            save: 'Salvar',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o espa\u00E7o de trabalho. Por favor, tente novamente.',
            avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Por favor, tente novamente.',
            addressContext:
                'Um Endere\u00E7o de Espa\u00E7o de Trabalho \u00E9 necess\u00E1rio para habilitar o Expensify Travel. Por favor, insira um endere\u00E7o associado ao seu neg\u00F3cio.',
        },
        bankAccount: {
            continueWithSetup: 'Continuar configura\u00E7\u00E3o',
            youAreAlmostDone:
                'Voc\u00EA est\u00E1 quase terminando de configurar sua conta banc\u00E1ria, o que permitir\u00E1 emitir cart\u00F5es corporativos, reembolsar despesas, coletar faturas e pagar contas.',
            streamlinePayments: 'Simplifique pagamentos',
            connectBankAccountNote: 'Nota: Contas banc\u00E1rias pessoais n\u00E3o podem ser usadas para pagamentos em espa\u00E7os de trabalho.',
            oneMoreThing: 'Mais uma coisa!',
            allSet: 'Tudo pronto!',
            accountDescriptionWithCards: 'Esta conta banc\u00E1ria ser\u00E1 usada para emitir cart\u00F5es corporativos, reembolsar despesas, cobrar faturas e pagar contas.',
            letsFinishInChat: 'Vamos terminar no chat!',
            finishInChat: 'Concluir no chat',
            almostDone: 'Quase pronto!',
            disconnectBankAccount: 'Desconectar conta banc\u00E1ria',
            startOver: 'Recome\u00E7ar',
            updateDetails: 'Atualizar detalhes',
            yesDisconnectMyBankAccount: 'Sim, desconectar minha conta banc\u00E1ria',
            yesStartOver: 'Sim, come\u00E7ar de novo.',
            disconnectYour: 'Desconectar seu',
            bankAccountAnyTransactions: 'conta banc\u00E1ria. Quaisquer transa\u00E7\u00F5es pendentes para esta conta ainda ser\u00E3o conclu\u00EDdas.',
            clearProgress: 'Recome\u00E7ar ir\u00E1 apagar o progresso que voc\u00EA fez at\u00E9 agora.',
            areYouSure: 'Voc\u00EA tem certeza?',
            workspaceCurrency: 'Moeda do espa\u00E7o de trabalho',
            updateCurrencyPrompt:
                'Parece que seu espa\u00E7o de trabalho est\u00E1 atualmente configurado para uma moeda diferente de USD. Por favor, clique no bot\u00E3o abaixo para atualizar sua moeda para USD agora.',
            updateToUSD: 'Atualizar para USD',
            updateWorkspaceCurrency: 'Atualizar moeda do espa\u00E7o de trabalho',
            workspaceCurrencyNotSupported: 'Moeda do espa\u00E7o de trabalho n\u00E3o suportada',
            yourWorkspace: 'Sua \u00E1rea de trabalho est\u00E1 configurada para uma moeda n\u00E3o suportada. Veja o',
            listOfSupportedCurrencies: 'lista de moedas suportadas',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transferir propriet\u00E1rio',
            addPaymentCardTitle: 'Insira seu cart\u00E3o de pagamento para transferir a propriedade',
            addPaymentCardButtonText: 'Aceitar os termos e adicionar cart\u00E3o de pagamento',
            addPaymentCardReadAndAcceptTextPart1: 'Ler e aceitar',
            addPaymentCardReadAndAcceptTextPart2: 'pol\u00EDtica para adicionar seu cart\u00E3o',
            addPaymentCardTerms: 'termos',
            addPaymentCardPrivacy: 'privacidade',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Compat\u00EDvel com PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Criptografia de n\u00EDvel banc\u00E1rio',
            addPaymentCardRedundant: 'Infraestrutura redundante',
            addPaymentCardLearnMore: 'Saiba mais sobre nosso(a)',
            addPaymentCardSecurity: 'seguran\u00E7a',
            amountOwedTitle: 'Saldo pendente',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Esta conta tem um saldo pendente de um m\u00EAs anterior.\n\nVoc\u00EA quer quitar o saldo e assumir a cobran\u00E7a deste espa\u00E7o de trabalho?',
            ownerOwesAmountTitle: 'Saldo pendente',
            ownerOwesAmountButtonText: 'Transferir saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `A conta propriet\u00E1ria deste espa\u00E7o de trabalho (${email}) tem um saldo pendente de um m\u00EAs anterior.\n\nVoc\u00EA deseja transferir este valor (${amount}) para assumir a cobran\u00E7a deste espa\u00E7o de trabalho? Seu cart\u00E3o de pagamento ser\u00E1 cobrado imediatamente.`,
            subscriptionTitle: 'Assumir assinatura anual',
            subscriptionButtonText: 'Transferir assinatura',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Assumir este espa\u00E7o de trabalho ir\u00E1 mesclar sua assinatura anual com sua assinatura atual. Isso aumentar\u00E1 o tamanho da sua assinatura em ${usersCount} membros, tornando o novo tamanho da sua assinatura ${finalCount}. Gostaria de continuar?`,
            duplicateSubscriptionTitle: 'Alerta de assinatura duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Parece que voc\u00EA pode estar tentando assumir a cobran\u00E7a dos espa\u00E7os de trabalho de ${email}, mas, para isso, voc\u00EA precisa ser um administrador em todos os espa\u00E7os de trabalho deles primeiro.\n\nClique em "Continuar" se voc\u00EA quiser apenas assumir a cobran\u00E7a do espa\u00E7o de trabalho ${workspaceName}.\n\nSe voc\u00EA quiser assumir a cobran\u00E7a de toda a assinatura deles, pe\u00E7a para que eles o adicionem como administrador em todos os espa\u00E7os de trabalho deles antes de assumir a cobran\u00E7a.`,
            hasFailedSettlementsTitle: 'N\u00E3o \u00E9 poss\u00EDvel transferir a propriedade',
            hasFailedSettlementsButtonText: 'Entendi',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Voc\u00EA n\u00E3o pode assumir a cobran\u00E7a porque ${email} tem uma liquida\u00E7\u00E3o pendente do Expensify Card. Por favor, pe\u00E7a para que entrem em contato com concierge@expensify.com para resolver o problema. Depois, voc\u00EA poder\u00E1 assumir a cobran\u00E7a deste workspace.`,
            failedToClearBalanceTitle: 'Falha ao limpar saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'N\u00E3o conseguimos quitar o saldo. Por favor, tente novamente mais tarde.',
            successTitle: 'Woohoo! Tudo pronto.',
            successDescription: 'Voc\u00EA agora \u00E9 o propriet\u00E1rio deste espa\u00E7o de trabalho.',
            errorTitle: 'Ops! N\u00E3o t\u00E3o r\u00E1pido...',
            errorDescriptionPartOne: 'Houve um problema ao transferir a propriedade deste espa\u00E7o de trabalho. Tente novamente, ou',
            errorDescriptionPartTwo: 'entre em contato com o Concierge',
            errorDescriptionPartThree: 'para ajuda.',
        },
        exportAgainModal: {
            title: 'Cuidado!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Os seguintes relat\u00F3rios j\u00E1 foram exportados para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nTem certeza de que deseja export\u00E1-los novamente?`,
            confirmText: 'Sim, exportar novamente',
            cancelText: 'Cancelar',
        },
        upgrade: {
            reportFields: {
                title: 'Campos do relat\u00F3rio',
                description: `Os campos de relat\u00F3rio permitem que voc\u00EA especifique detalhes no n\u00EDvel do cabe\u00E7alho, distintos das tags que se referem a despesas em itens de linha individuais. Esses detalhes podem incluir nomes espec\u00EDficos de projetos, informa\u00E7\u00F5es sobre viagens de neg\u00F3cios, locais e mais.`,
                onlyAvailableOnPlan: 'Os campos de relat\u00F3rio est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Aproveite a sincroniza\u00E7\u00E3o automatizada e reduza entradas manuais com a integra\u00E7\u00E3o Expensify + NetSuite. Obtenha insights financeiros detalhados e em tempo real com suporte a segmentos nativos e personalizados, incluindo mapeamento de projetos e clientes.`,
                onlyAvailableOnPlan: 'Nossa integra\u00E7\u00E3o com o NetSuite est\u00E1 dispon\u00EDvel apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Aproveite a sincroniza\u00E7\u00E3o automatizada e reduza as entradas manuais com a integra\u00E7\u00E3o Expensify + Sage Intacct. Obtenha insights financeiros detalhados e em tempo real com dimens\u00F5es definidas pelo usu\u00E1rio, al\u00E9m de codifica\u00E7\u00E3o de despesas por departamento, classe, localiza\u00E7\u00E3o, cliente e projeto (trabalho).`,
                onlyAvailableOnPlan: 'Nossa integra\u00E7\u00E3o com o Sage Intacct est\u00E1 dispon\u00EDvel apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Aproveite a sincroniza\u00E7\u00E3o automatizada e reduza as entradas manuais com a integra\u00E7\u00E3o Expensify + QuickBooks Desktop. Alcance efici\u00EAncia m\u00E1xima com uma conex\u00E3o bidirecional em tempo real e codifica\u00E7\u00E3o de despesas por classe, item, cliente e projeto.`,
                onlyAvailableOnPlan: 'Nossa integra\u00E7\u00E3o com o QuickBooks Desktop est\u00E1 dispon\u00EDvel apenas no plano Control, a partir de',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Aprova\u00E7\u00F5es Avan\u00E7adas',
                description: `Se voc\u00EA quiser adicionar mais camadas de aprova\u00E7\u00E3o ao processo \u2013 ou apenas garantir que as maiores despesas recebam outra revis\u00E3o \u2013 n\u00F3s temos a solu\u00E7\u00E3o. As aprova\u00E7\u00F5es avan\u00E7adas ajudam voc\u00EA a implementar os controles adequados em cada n\u00EDvel para manter os gastos de sua equipe sob controle.`,
                onlyAvailableOnPlan: 'Aprova\u00E7\u00F5es avan\u00E7adas est\u00E3o dispon\u00EDveis apenas no plano Control, que come\u00E7a em',
            },
            categories: {
                title: 'Categorias',
                description: `Categorias ajudam voc\u00EA a organizar melhor as despesas para acompanhar onde est\u00E1 gastando seu dinheiro. Use nossa lista de categorias sugeridas ou crie as suas pr\u00F3prias.`,
                onlyAvailableOnPlan: 'As categorias est\u00E3o dispon\u00EDveis no plano Collect, come\u00E7ando em',
            },
            glCodes: {
                title: 'c\u00F3digos GL',
                description: `Adicione c\u00F3digos GL \u00E0s suas categorias e tags para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: 'Os c\u00F3digos GL est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            glAndPayrollCodes: {
                title: 'C\u00F3digos GL e de Folha de Pagamento',
                description: `Adicione c\u00F3digos GL e de Folha de Pagamento \u00E0s suas categorias para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: 'Os c\u00F3digos de GL e Folha de Pagamento est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            taxCodes: {
                title: 'C\u00F3digos fiscais',
                description: `Adicione c\u00F3digos fiscais aos seus impostos para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: 'Os c\u00F3digos fiscais est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            companyCards: {
                title: 'Cart\u00F5es da empresa ilimitados',
                description: `Precisa adicionar mais feeds de cart\u00E3o? Desbloqueie cart\u00F5es corporativos ilimitados para sincronizar transa\u00E7\u00F5es de todos os principais emissores de cart\u00E3o.`,
                onlyAvailableOnPlan: 'Isso est\u00E1 dispon\u00EDvel apenas no plano Control, a partir de',
            },
            rules: {
                title: 'Regras',
                description: `As regras funcionam em segundo plano e mant\u00EAm seus gastos sob controle para que voc\u00EA n\u00E3o precise se preocupar com os pequenos detalhes.\n\nExija detalhes de despesas como recibos e descri\u00E7\u00F5es, defina limites e padr\u00F5es, e automatize aprova\u00E7\u00F5es e pagamentos \u2013 tudo em um s\u00F3 lugar.`,
                onlyAvailableOnPlan: 'As regras est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Per diem \u00E9 uma \u00F3tima maneira de manter seus custos di\u00E1rios em conformidade e previs\u00EDveis sempre que seus funcion\u00E1rios viajarem. Aproveite recursos como taxas personalizadas, categorias padr\u00E3o e detalhes mais granulares, como destinos e subtaxas.',
                onlyAvailableOnPlan: 'Per diem est\u00E1 dispon\u00EDvel apenas no plano Control, a partir de',
            },
            travel: {
                title: 'Viagem',
                description:
                    'Expensify Travel \u00E9 uma nova plataforma corporativa de reserva e gest\u00E3o de viagens que permite aos membros reservar acomoda\u00E7\u00F5es, voos, transporte e mais.',
                onlyAvailableOnPlan: 'Viagens est\u00E3o dispon\u00EDveis no plano Collect, a partir de',
            },
            multiLevelTags: {
                title: 'Tags multin\u00EDveis',
                description:
                    'As Tags de M\u00FAltiplos N\u00EDveis ajudam voc\u00EA a rastrear despesas com maior precis\u00E3o. Atribua v\u00E1rias tags a cada item de linha\u2014como departamento, cliente ou centro de custo\u2014para capturar o contexto completo de cada despesa. Isso permite relat\u00F3rios mais detalhados, fluxos de trabalho de aprova\u00E7\u00E3o e exporta\u00E7\u00F5es cont\u00E1beis.',
                onlyAvailableOnPlan: 'As tags em v\u00E1rios n\u00EDveis est\u00E3o dispon\u00EDveis apenas no plano Control, a partir de',
            },
            pricing: {
                perActiveMember: 'por membro ativo por m\u00EAs.',
                perMember: 'por membro por m\u00EAs.',
            },
            note: {
                upgradeWorkspace: 'Atualize seu espa\u00E7o de trabalho para acessar este recurso, ou',
                learnMore: 'saiba mais',
                aboutOurPlans: 'sobre nossos planos e pre\u00E7os.',
            },
            upgradeToUnlock: 'Desbloqueie este recurso',
            completed: {
                headline: `Voc\u00EA atualizou seu espa\u00E7o de trabalho!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Voc\u00EA atualizou com sucesso ${policyName} para o plano Control!`,
                categorizeMessage: `Voc\u00EA atualizou com sucesso para um workspace no plano Collect. Agora voc\u00EA pode categorizar suas despesas!`,
                travelMessage: `Voc\u00EA atualizou com sucesso para um espa\u00E7o de trabalho no plano Collect. Agora voc\u00EA pode come\u00E7ar a reservar e gerenciar viagens!`,
                viewSubscription: 'Ver sua assinatura',
                moreDetails: 'para mais detalhes.',
                gotIt: 'Entendi, obrigado',
            },
            commonFeatures: {
                title: 'Fa\u00E7a upgrade para o plano Control',
                note: 'Desbloqueie nossos recursos mais poderosos, incluindo:',
                benefits: {
                    startsAt: 'O plano Control come\u00E7a em',
                    perMember: 'por membro ativo por m\u00EAs.',
                    learnMore: 'Saiba mais',
                    pricing: 'sobre nossos planos e pre\u00E7os.',
                    benefit1: 'Conex\u00F5es avan\u00E7adas de contabilidade (NetSuite, Sage Intacct e mais)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprova\u00E7\u00E3o em m\u00FAltiplos n\u00EDveis',
                    benefit4: 'Controles de seguran\u00E7a aprimorados',
                    toUpgrade: 'Para atualizar, clique',
                    selectWorkspace: 'selecione um espa\u00E7o de trabalho e altere o tipo de plano para',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Fazer downgrade para o plano Collect',
                note: 'Se voc\u00EA fizer o downgrade, perder\u00E1 acesso a esses recursos e mais:',
                benefits: {
                    note: 'Para uma compara\u00E7\u00E3o completa dos nossos planos, confira nosso',
                    pricingPage: 'p\u00E1gina de pre\u00E7os',
                    confirm: 'Tem certeza de que deseja fazer o downgrade e remover suas configura\u00E7\u00F5es?',
                    warning: 'Isso n\u00E3o pode ser desfeito.',
                    benefit1: 'Conex\u00F5es de contabilidade (exceto QuickBooks Online e Xero)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprova\u00E7\u00E3o em m\u00FAltiplos n\u00EDveis',
                    benefit4: 'Controles de seguran\u00E7a aprimorados',
                    headsUp: 'Aten\u00E7\u00E3o!',
                    multiWorkspaceNote:
                        'Voc\u00EA precisar\u00E1 fazer o downgrade de todos os seus espa\u00E7os de trabalho antes do seu primeiro pagamento mensal para iniciar uma assinatura na taxa Collect. Clique',
                    selectStep: '> selecione cada espa\u00E7o de trabalho > altere o tipo de plano para',
                },
            },
            completed: {
                headline: 'Seu espa\u00E7o de trabalho foi rebaixado',
                description: 'Voc\u00EA tem outros espa\u00E7os de trabalho no plano Control. Para ser cobrado na taxa Collect, voc\u00EA deve rebaixar todos os espa\u00E7os de trabalho.',
                gotIt: 'Entendi, obrigado',
            },
        },
        payAndDowngrade: {
            title: 'Pagar e rebaixar',
            headline: 'Seu pagamento final',
            description1: 'Sua fatura final para esta assinatura ser\u00E1',
            description2: ({date}: DateParams) => `Veja seu detalhamento abaixo para ${date}:`,
            subscription:
                'Aten\u00E7\u00E3o! Esta a\u00E7\u00E3o encerrar\u00E1 sua assinatura do Expensify, excluir\u00E1 este workspace e remover\u00E1 todos os membros do workspace. Se voc\u00EA quiser manter este workspace e apenas se remover, pe\u00E7a para outro administrador assumir a cobran\u00E7a primeiro.',
            genericFailureMessage: 'Ocorreu um erro ao pagar sua conta. Por favor, tente novamente.',
        },
        restrictedAction: {
            restricted: 'Restrito',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) =>
                `As a\u00E7\u00F5es no espa\u00E7o de trabalho ${workspaceName} est\u00E3o atualmente restritas.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `O propriet\u00E1rio do espa\u00E7o de trabalho, ${workspaceOwnerName}, precisar\u00E1 adicionar ou atualizar o cart\u00E3o de pagamento registrado para desbloquear novas atividades do espa\u00E7o de trabalho.`,
            youWillNeedToAddOrUpdatePaymentCard:
                'Voc\u00EA precisar\u00E1 adicionar ou atualizar o cart\u00E3o de pagamento registrado para desbloquear novas atividades do espa\u00E7o de trabalho.',
            addPaymentCardToUnlock: 'Adicione um cart\u00E3o de pagamento para desbloquear!',
            addPaymentCardToContinueUsingWorkspace: 'Adicione um cart\u00E3o de pagamento para continuar usando este espa\u00E7o de trabalho',
            pleaseReachOutToYourWorkspaceAdmin: 'Por favor, entre em contato com o administrador do seu espa\u00E7o de trabalho para qualquer d\u00FAvida.',
            chatWithYourAdmin: 'Converse com seu administrador',
            chatInAdmins: 'Converse em #admins',
            addPaymentCard: 'Adicionar cart\u00E3o de pagamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Despesas',
                subtitle: 'Defina controles de gastos e padr\u00F5es para despesas individuais. Voc\u00EA tamb\u00E9m pode criar regras para',
                receiptRequiredAmount: 'Valor necess\u00E1rio para o recibo',
                receiptRequiredAmountDescription: 'Exigir recibos quando o gasto exceder este valor, a menos que seja substitu\u00EDdo por uma regra de categoria.',
                maxExpenseAmount: 'Valor m\u00E1ximo da despesa',
                maxExpenseAmountDescription: 'Marcar gastos que excedam este valor, a menos que sejam substitu\u00EDdos por uma regra de categoria.',
                maxAge: 'Idade m\u00E1xima',
                maxExpenseAge: 'Idade m\u00E1xima da despesa',
                maxExpenseAgeDescription: 'Sinalizar despesas mais antigas que um n\u00FAmero espec\u00EDfico de dias.',
                maxExpenseAgeDays: () => ({
                    one: '1 dia',
                    other: (count: number) => `${count} dias`,
                }),
                billableDefault: 'Padr\u00E3o fatur\u00E1vel',
                billableDefaultDescription:
                    'Escolha se as despesas em dinheiro e cart\u00E3o de cr\u00E9dito devem ser fatur\u00E1veis por padr\u00E3o. Despesas fatur\u00E1veis s\u00E3o ativadas ou desativadas em',
                billable: 'Fatur\u00E1vel',
                billableDescription: 'Despesas s\u00E3o mais frequentemente refaturadas para clientes.',
                nonBillable: 'N\u00E3o fatur\u00E1vel',
                nonBillableDescription: 'Despesas s\u00E3o ocasionalmente refaturadas para clientes.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceipts s\u00E3o criados automaticamente',
                eReceiptsHintLink: 'para a maioria das transa\u00E7\u00F5es de cr\u00E9dito em USD',
                attendeeTracking: 'Rastreamento de participantes',
                attendeeTrackingHint: 'Acompanhe o custo por pessoa para cada despesa.',
                prohibitedDefaultDescription:
                    'Marque qualquer recibo onde apare\u00E7am \u00E1lcool, jogos de azar ou outros itens restritos. Despesas com recibos onde esses itens apare\u00E7am precisar\u00E3o de revis\u00E3o manual.',
                prohibitedExpenses: 'Despesas proibidas',
                alcohol: '\u00C1lcool',
                hotelIncidentals: 'Despesas incidentais do hotel',
                gambling: 'Jogos de azar',
                tobacco: 'Tabaco',
                adultEntertainment: 'Entretenimento adulto',
            },
            expenseReportRules: {
                examples: 'Exemplos:',
                title: 'Relat\u00F3rios de despesas',
                subtitle: 'Automatize a conformidade, as aprova\u00E7\u00F5es e o pagamento de relat\u00F3rios de despesas.',
                customReportNamesSubtitle: 'Personalize os t\u00EDtulos dos relat\u00F3rios usando nosso',
                customNameTitle: 'T\u00EDtulo padr\u00E3o do relat\u00F3rio',
                customNameDescription: 'Escolha um nome personalizado para relat\u00F3rios de despesas usando nosso',
                customNameDescriptionLink: 'f\u00F3rmulas extensivas',
                customNameInputLabel: 'Nome',
                customNameEmailPhoneExample: 'E-mail ou telefone do membro: {report:submit:from}',
                customNameStartDateExample: 'Data de in\u00EDcio do relat\u00F3rio: {report:startdate}',
                customNameWorkspaceNameExample: 'Nome do espa\u00E7o de trabalho: {report:workspacename}',
                customNameReportIDExample: 'ID do Relat\u00F3rio: {report:id}',
                customNameTotalExample: 'Total: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Impedir que os membros alterem os nomes dos relat\u00F3rios personalizados',
                preventSelfApprovalsTitle: 'Prevenir autoaprova\u00E7\u00F5es',
                preventSelfApprovalsSubtitle: 'Impedir que os membros do espa\u00E7o de trabalho aprovem seus pr\u00F3prios relat\u00F3rios de despesas.',
                autoApproveCompliantReportsTitle: 'Aprovar automaticamente relat\u00F3rios em conformidade',
                autoApproveCompliantReportsSubtitle: 'Configure quais relat\u00F3rios de despesas s\u00E3o eleg\u00EDveis para aprova\u00E7\u00E3o autom\u00E1tica.',
                autoApproveReportsUnderTitle: 'Aprovar automaticamente relat\u00F3rios abaixo de',
                autoApproveReportsUnderDescription: 'Relat\u00F3rios de despesas totalmente compat\u00EDveis abaixo deste valor ser\u00E3o aprovados automaticamente.',
                randomReportAuditTitle: 'Auditoria aleat\u00F3ria de relat\u00F3rio',
                randomReportAuditDescription: 'Exigir que alguns relat\u00F3rios sejam aprovados manualmente, mesmo que sejam eleg\u00EDveis para aprova\u00E7\u00E3o autom\u00E1tica.',
                autoPayApprovedReportsTitle: 'Relat\u00F3rios aprovados para pagamento autom\u00E1tico',
                autoPayApprovedReportsSubtitle: 'Configure quais relat\u00F3rios de despesas s\u00E3o eleg\u00EDveis para pagamento autom\u00E1tico.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Por favor, insira um valor menor que ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'V\u00E1 para mais recursos e ative os fluxos de trabalho, depois adicione pagamentos para desbloquear este recurso.',
                autoPayReportsUnderTitle: 'Relat\u00F3rios de pagamento autom\u00E1tico sob',
                autoPayReportsUnderDescription: 'Relat\u00F3rios de despesas totalmente em conformidade abaixo deste valor ser\u00E3o pagos automaticamente.',
                unlockFeatureGoToSubtitle: 'Ir para',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) => `e habilite fluxos de trabalho, depois adicione ${featureName} para desbloquear este recurso.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `e habilite ${featureName} para desbloquear este recurso.`,
            },
            categoryRules: {
                title: 'Regras de categoria',
                approver: 'Aprovador',
                requireDescription: 'Requer descri\u00E7\u00E3o',
                descriptionHint: 'Dica de descri\u00E7\u00E3o',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Lembre os funcion\u00E1rios de fornecer informa\u00E7\u00F5es adicionais para gastos de \u201C${categoryName}\u201D. Esta dica aparece no campo de descri\u00E7\u00E3o das despesas.`,
                descriptionHintLabel: 'Dica',
                descriptionHintSubtitle: 'Dica profissional: Quanto mais curto, melhor!',
                maxAmount: 'Valor m\u00E1ximo',
                flagAmountsOver: 'Sinalizar valores acima de',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Aplica-se \u00E0 categoria \u201C${categoryName}\u201D.`,
                flagAmountsOverSubtitle: 'Isso substitui o valor m\u00E1ximo para todas as despesas.',
                expenseLimitTypes: {
                    expense: 'Despesa individual',
                    expenseSubtitle: 'Sinalizar valores de despesas por categoria. Esta regra substitui a regra geral do espa\u00E7o de trabalho para o valor m\u00E1ximo de despesa.',
                    daily: 'Total da categoria',
                    dailySubtitle: 'Sinalizar o total de gastos por categoria por relat\u00F3rio de despesas.',
                },
                requireReceiptsOver: 'Exigir recibos acima de',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Padr\u00E3o`,
                    never: 'Nunca exigir recibos',
                    always: 'Sempre exigir recibos',
                },
                defaultTaxRate: 'Taxa de imposto padr\u00E3o',
                goTo: 'Ir para',
                andEnableWorkflows: 'e habilite fluxos de trabalho, depois adicione aprova\u00E7\u00F5es para desbloquear este recurso.',
            },
            customRules: {
                title: 'Regras personalizadas',
                subtitle: 'Descri\u00E7\u00E3o',
                description: 'Inserir regras personalizadas para relat\u00F3rios de despesas',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Coletar',
                    description: 'Para equipes que buscam automatizar seus processos.',
                },
                corporate: {
                    label: 'Controle',
                    description: 'Para organiza\u00E7\u00F5es com requisitos avan\u00E7ados.',
                },
            },
            description: 'Escolha um plano que seja ideal para voc\u00EA. Para uma lista detalhada de recursos e pre\u00E7os, confira nosso',
            subscriptionLink: 'tipos de planos e p\u00E1gina de ajuda de pre\u00E7os',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Voc\u00EA se comprometeu com 1 membro ativo no plano Control at\u00E9 que sua assinatura anual termine em ${annualSubscriptionEndDate}. Voc\u00EA pode mudar para a assinatura de pagamento por uso e fazer o downgrade para o plano Collect a partir de ${annualSubscriptionEndDate} desativando a renova\u00E7\u00E3o autom\u00E1tica em`,
                other: `Voc\u00EA se comprometeu com ${count} membros ativos no plano Control at\u00E9 que sua assinatura anual termine em ${annualSubscriptionEndDate}. Voc\u00EA pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ${annualSubscriptionEndDate} desativando a renova\u00E7\u00E3o autom\u00E1tica em`,
            }),
            subscriptions: 'Assinaturas',
        },
    },
    getAssistancePage: {
        title: 'Obter assist\u00EAncia',
        subtitle: 'Estamos aqui para abrir seu caminho para a grandeza!',
        description: 'Escolha entre as op\u00E7\u00F5es de suporte abaixo:',
        chatWithConcierge: 'Converse com o Concierge',
        scheduleSetupCall: 'Agendar uma chamada de configura\u00E7\u00E3o',
        scheduleACall: 'Agendar chamada',
        questionMarkButtonTooltip: 'Obtenha assist\u00EAncia da nossa equipe',
        exploreHelpDocs: 'Explorar documentos de ajuda',
        registerForWebinar: 'Registrar-se para o webinar',
        onboardingHelp: 'Ajuda com a integra\u00E7\u00E3o',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Alterar tom de pele padr\u00E3o',
        headers: {
            frequentlyUsed: 'Usado com Frequ\u00EAncia',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Pessoas e Corpo',
            animalsAndNature: 'Animais e Natureza',
            foodAndDrink: 'Comidas e Bebidas',
            travelAndPlaces: 'Viagem e Lugares',
            activities: 'Atividades',
            objects: 'Objetos',
            symbols: 'S\u00EDmbolos',
            flags: 'Bandeiras',
        },
    },
    newRoomPage: {
        newRoom: 'Nova sala',
        groupName: 'Nome do grupo',
        roomName: 'Nome da sala',
        visibility: 'Visibilidade',
        restrictedDescription: 'As pessoas no seu espa\u00E7o de trabalho podem encontrar esta sala',
        privateDescription: 'Pessoas convidadas para esta sala podem encontr\u00E1-la',
        publicDescription: 'Qualquer pessoa pode encontrar esta sala',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Qualquer pessoa pode encontrar esta sala',
        createRoom: 'Criar sala',
        roomAlreadyExistsError: 'J\u00E1 existe uma sala com este nome',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName} \u00E9 uma sala padr\u00E3o em todos os espa\u00E7os de trabalho. Por favor, escolha outro nome.`,
        roomNameInvalidError: 'Os nomes das salas podem incluir apenas letras min\u00FAsculas, n\u00FAmeros e h\u00EDfens.',
        pleaseEnterRoomName: 'Por favor, insira um nome para a sala',
        pleaseSelectWorkspace: 'Por favor, selecione um espa\u00E7o de trabalho',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}renomeado para "${newName}" (anteriormente "${oldName}")` : `${actor}renomeou esta sala para "${newName}" (anteriormente "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Sala renomeada para ${newName}`,
        social: 'social',
        selectAWorkspace: 'Selecione um espa\u00E7o de trabalho',
        growlMessageOnRenameError: 'N\u00E3o foi poss\u00EDvel renomear a sala do espa\u00E7o de trabalho. Verifique sua conex\u00E3o e tente novamente.',
        visibilityOptions: {
            restricted: 'Espa\u00E7o de trabalho', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privado',
            public: 'P\u00FAblico',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'An\u00FAncio P\u00FAblico',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Enviar e Fechar',
        submitAndApprove: 'Enviar e Aprovar',
        advanced: 'AVAN\u00C7ADO',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `adicionado ${approverName} (${approverEmail}) como aprovador para o ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) => `removeu ${approverName} (${approverEmail}) como aprovador do ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `alterou o aprovador para o ${field} "${name}" para ${formatApprover(newApproverName, newApproverEmail)} (anteriormente ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `adicionou a categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `removeu a categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'desativado' : 'habilitado'} a categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o c\u00F3digo de folha de pagamento "${newValue}" \u00E0 categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o c\u00F3digo de folha de pagamento "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o c\u00F3digo de folha de pagamento da categoria "${categoryName}" para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o c\u00F3digo GL "${newValue}" \u00E0 categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o c\u00F3digo GL "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o c\u00F3digo GL da categoria \u201C${categoryName}\u201D para \u201C${newValue}\u201D (anteriormente \u201C${oldValue}\u201C)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `alterou a descri\u00E7\u00E3o da categoria "${categoryName}" para ${!oldValue ? 'obrigat\u00F3rio' : 'n\u00E3o obrigat\u00F3rio'} (anteriormente ${!oldValue ? 'n\u00E3o obrigat\u00F3rio' : 'obrigat\u00F3rio'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `adicionou um valor m\u00E1ximo de ${newAmount} \u00E0 categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `removeu o valor m\u00E1ximo de ${oldAmount} da categoria "${categoryName}"`;
            }
            return `alterou o valor m\u00E1ximo da categoria "${categoryName}" para ${newAmount} (anteriormente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `adicionou um tipo de limite de ${newValue} \u00E0 categoria "${categoryName}"`;
            }
            return `alterou o tipo de limite da categoria "${categoryName}" para ${newValue} (anteriormente ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `atualizou a categoria "${categoryName}" alterando Recibos para ${newValue}`;
            }
            return `alterou a categoria "${categoryName}" para ${newValue} (anteriormente ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `renomeou a categoria "${oldName}" para "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `removeu a dica de descri\u00E7\u00E3o "${oldValue}" da categoria "${categoryName}"`;
            }
            return !oldValue
                ? `adicionou a dica de descri\u00E7\u00E3o "${newValue}" \u00E0 categoria "${categoryName}"`
                : `alterou a dica de descri\u00E7\u00E3o da categoria "${categoryName}" para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `alterou o nome da lista de tags para "${newName}" (anteriormente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `adicionou a tag "${tagName}" \u00E0 lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `atualizou a lista de tags "${tagListName}" alterando a tag "${oldName}" para "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'habilitado' : 'desativado'} a tag "${tagName}" na lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `removeu a tag "${tagName}" da lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `removido(s) "${count}" tag(s) da lista "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `atualizou a tag "${tagName}" na lista "${tagListName}" alterando o ${updatedField} para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `atualizou a tag "${tagName}" na lista "${tagListName}" adicionando um ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `alterou o ${customUnitName} ${updatedField} para "${newValue}" (anteriormente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Rastreamento de impostos ${newValue ? 'habilitado' : 'desativado'} em taxas de dist\u00E2ncia`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `adicionou uma nova tarifa "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `alterou a taxa do ${customUnitName} ${updatedField} "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `alterou a taxa de imposto na taxa de dist\u00E2ncia "${customUnitRateName}" para "${newValue} (${newTaxPercentage})" (anteriormente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `adicionou a taxa "${newValue} (${newTaxPercentage})" \u00E0 taxa de dist\u00E2ncia "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `alterou a parte recuper\u00E1vel do imposto na taxa de dist\u00E2ncia "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `adicionou uma parte recuper\u00E1vel de imposto de "${newValue}" \u00E0 taxa de dist\u00E2ncia "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `removeu a taxa "${rateName}" de "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `adicionado campo de relat\u00F3rio ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `defina o valor padr\u00E3o do campo de relat\u00F3rio "${fieldName}" para "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `adicionou a op\u00E7\u00E3o "${optionName}" ao campo do relat\u00F3rio "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `removeu a op\u00E7\u00E3o "${optionName}" do campo de relat\u00F3rio "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'habilitado' : 'desativado'} a op\u00E7\u00E3o "${optionName}" para o campo do relat\u00F3rio "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'habilitado' : 'desativado'} todas as op\u00E7\u00F5es para o campo de relat\u00F3rio "${fieldName}"`;
            }
            return `${allEnabled ? 'habilitado' : 'desativado'} a op\u00E7\u00E3o "${optionName}" para o campo de relat\u00F3rio "${fieldName}", tornando todas as op\u00E7\u00F5es ${allEnabled ? 'habilitado' : 'desativado'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `removido o campo de relat\u00F3rio ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `atualizado "Prevenir autoaprova\u00E7\u00E3o" para "${newValue === 'true' ? 'Habilitado' : 'Desativado'}" (anteriormente "${oldValue === 'true' ? 'Habilitado' : 'Desativado'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou o valor m\u00E1ximo exigido para despesas com recibo para ${newValue} (anteriormente ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou o valor m\u00E1ximo de despesa para viola\u00E7\u00F5es para ${newValue} (anteriormente ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizado "Idade m\u00E1xima da despesa (dias)" para "${newValue}" (anteriormente "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")"`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `defina a data de envio do relat\u00F3rio mensal para "${newValue}"`;
            }
            return `atualizou a data de envio do relat\u00F3rio mensal para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizado "Re-faturar despesas para clientes" para "${newValue}" (anteriormente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `ativou "Aplicar t\u00EDtulos padr\u00E3o de relat\u00F3rios" ${value ? 'on' : 'desligado'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `atualizou o nome deste espa\u00E7o de trabalho para "${newName}" (anteriormente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `defina a descri\u00E7\u00E3o deste espa\u00E7o de trabalho para "${newDescription}"`
                : `atualizou a descri\u00E7\u00E3o deste espa\u00E7o de trabalho para "${newDescription}" (anteriormente "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('e');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `removeu voc\u00EA do fluxo de aprova\u00E7\u00E3o e do chat de despesas de ${joinedNames}. Relat\u00F3rios enviados anteriormente permanecer\u00E3o dispon\u00EDveis para aprova\u00E7\u00E3o na sua Caixa de Entrada.`,
                other: `removeu voc\u00EA dos fluxos de aprova\u00E7\u00E3o e dos chats de despesas de ${joinedNames}. Relat\u00F3rios enviados anteriormente permanecer\u00E3o dispon\u00EDveis para aprova\u00E7\u00E3o na sua Caixa de Entrada.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `atualizou seu papel em ${policyName} de ${oldRole} para usu\u00E1rio. Voc\u00EA foi removido de todos os chats de despesas de remetentes, exceto o seu pr\u00F3prio.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `atualizou a moeda padr\u00E3o para ${newCurrency} (anteriormente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `atualizou a frequ\u00EAncia de relat\u00F3rios autom\u00E1ticos para "${newFrequency}" (anteriormente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `atualizou o modo de aprova\u00E7\u00E3o para "${newValue}" (anteriormente "${oldValue}")`,
        upgradedWorkspace: 'atualizou este espa\u00E7o de trabalho para o plano Control',
        downgradedWorkspace: 'rebaixou este espa\u00E7o de trabalho para o plano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `alterou a taxa de relat\u00F3rios encaminhados aleatoriamente para aprova\u00E7\u00E3o manual para ${Math.round(newAuditRate * 100)}% (anteriormente ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `alterou o limite de aprova\u00E7\u00E3o manual para todas as despesas para ${newLimit} (anteriormente ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Membro n\u00E3o encontrado.',
        useInviteButton: 'Para convidar um novo membro para o chat, por favor, use o bot\u00E3o de convite acima.',
        notAuthorized: `Voc\u00EA n\u00E3o tem acesso a esta p\u00E1gina. Se voc\u00EA est\u00E1 tentando entrar nesta sala, pe\u00E7a a um membro da sala para adicion\u00E1-lo. Algo mais? Entre em contato com ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Tem certeza de que deseja remover ${memberName} da sala?`,
            other: 'Tem certeza de que deseja remover os membros selecionados da sala?',
        }),
        error: {
            genericAdd: 'Houve um problema ao adicionar este membro \u00E0 sala',
        },
    },
    newTaskPage: {
        assignTask: 'Atribuir tarefa',
        assignMe: 'Atribuir a mim',
        confirmTask: 'Confirmar tarefa',
        confirmError: 'Por favor, insira um t\u00EDtulo e selecione um destino para compartilhamento',
        descriptionOptional: 'Descri\u00E7\u00E3o (opcional)',
        pleaseEnterTaskName: 'Por favor, insira um t\u00EDtulo',
        pleaseEnterTaskDestination: 'Por favor, selecione onde voc\u00EA deseja compartilhar esta tarefa.',
    },
    task: {
        task: 'Tarefa',
        title: 'T\u00EDtulo',
        description: 'Descri\u00E7\u00E3o',
        assignee: 'Cession\u00E1rio',
        completed: 'Conclu\u00EDdo',
        action: 'Completo',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tarefa para ${title}`,
            completed: 'marcado como conclu\u00EDdo',
            canceled: 'tarefa exclu\u00EDda',
            reopened: 'marcado como incompleto',
            error: 'Voc\u00EA n\u00E3o tem permiss\u00E3o para realizar a a\u00E7\u00E3o solicitada.',
        },
        markAsComplete: 'Marcar como conclu\u00EDdo',
        markAsIncomplete: 'Marcar como incompleto',
        assigneeError: 'Ocorreu um erro ao atribuir esta tarefa. Por favor, tente outro respons\u00E1vel.',
        genericCreateTaskFailureMessage: 'Houve um erro ao criar esta tarefa. Por favor, tente novamente mais tarde.',
        deleteTask: 'Excluir tarefa',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta tarefa?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Extrato de ${monthName} de ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Atalhos de teclado',
        subtitle: 'Economize tempo com estes atalhos de teclado \u00FAteis:',
        shortcuts: {
            openShortcutDialog: 'Abre a caixa de di\u00E1logo de atalhos do teclado',
            markAllMessagesAsRead: 'Marcar todas as mensagens como lidas',
            escape: 'Escapar di\u00E1logos',
            search: 'Abrir di\u00E1logo de busca',
            newChat: 'Nova tela de chat',
            copy: 'Copiar coment\u00E1rio',
            openDebug: 'Abrir a caixa de di\u00E1logo de prefer\u00EAncias de teste',
        },
    },
    guides: {
        screenShare: 'Compartilhar tela',
        screenShareRequest: 'A Expensify est\u00E1 convidando voc\u00EA para um compartilhamento de tela',
    },
    search: {
        resultsAreLimited: 'Os resultados da pesquisa s\u00E3o limitados.',
        viewResults: 'Ver resultados',
        resetFilters: 'Redefinir filtros',
        searchResults: {
            emptyResults: {
                title: 'Nada para mostrar',
                subtitle: 'Tente ajustar seus crit\u00E9rios de busca ou criar algo com o bot\u00E3o verde +.',
            },
            emptyExpenseResults: {
                title: 'Voc\u00EA ainda n\u00E3o criou nenhuma despesa ainda',
                subtitle: 'Crie uma despesa ou fa\u00E7a um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o bot\u00E3o verde abaixo para criar uma despesa.',
            },
            emptyReportResults: {
                title: 'Voc\u00EA ainda n\u00E3o criou nenhum relat\u00F3rio',
                subtitle: 'Crie um relat\u00F3rio ou fa\u00E7a um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o bot\u00E3o verde abaixo para criar um relat\u00F3rio.',
            },
            emptyInvoiceResults: {
                title: 'Voc\u00EA ainda n\u00E3o criou nenhuma fatura ainda',
                subtitle: 'Envie uma fatura ou fa\u00E7a um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o bot\u00E3o verde abaixo para enviar uma fatura.',
            },
            emptyTripResults: {
                title: 'Nenhuma viagem para exibir',
                subtitle: 'Comece reservando sua primeira viagem abaixo.',
                buttonText: 'Reservar uma viagem',
            },
            emptySubmitResults: {
                title: 'Nenhuma despesa para enviar',
                subtitle: 'Voc\u00EA est\u00E1 liberado. D\u00EA uma volta da vit\u00F3ria!',
                buttonText: 'Criar relat\u00F3rio',
            },
            emptyApproveResults: {
                title: 'Nenhuma despesa para aprovar',
                subtitle: 'Zero despesas. M\u00E1ximo relaxamento. Bem feito!',
            },
            emptyPayResults: {
                title: 'Nenhuma despesa a pagar',
                subtitle: 'Parab\u00E9ns! Voc\u00EA cruzou a linha de chegada.',
            },
            emptyExportResults: {
                title: 'Nenhuma despesa para exportar',
                subtitle: 'Hora de relaxar, bom trabalho.',
            },
        },
        saveSearch: 'Salvar pesquisa',
        deleteSavedSearch: 'Excluir pesquisa salva',
        deleteSavedSearchConfirm: 'Tem certeza de que deseja excluir esta pesquisa?',
        searchName: 'Pesquisar nome',
        savedSearchesMenuItemTitle: 'Salvo',
        groupedExpenses: 'despesas agrupadas',
        bulkActions: {
            approve: 'Aprovar',
            pay: 'Pagar',
            delete: 'Excluir',
            hold: 'Aguardar',
            unhold: 'Remover reten\u00E7\u00E3o',
            noOptionsAvailable: 'Nenhuma op\u00E7\u00E3o dispon\u00EDvel para o grupo de despesas selecionado.',
        },
        filtersHeader: 'Filtros',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Antes de ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Depois de ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
            },
            status: 'Status',
            keyword: 'Palavra-chave',
            hasKeywords: 'Tem palavras-chave',
            currency: 'Moeda',
            link: 'Link',
            pinned: 'Fixado',
            unread: 'N\u00E3o lido',
            completed: 'Conclu\u00EDdo',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Menos de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maior que ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Entre ${greaterThan} e ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cart\u00F5es individuais',
                closedCards: 'Cart\u00F5es fechados',
                cardFeeds: 'Feeds de cart\u00E3o',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Todos ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Todos os Cart\u00F5es Importados CSV${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Atual',
            past: 'Passado',
            submitted: 'Data de envio',
            approved: 'Data aprovada',
            paid: 'Data de pagamento',
            exported: 'Data exportada',
            posted: 'Data de postagem',
            billable: 'Fatur\u00E1vel',
            reimbursable: 'Reembols\u00E1vel',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Este relat\u00F3rio n\u00E3o possui despesas.',
            emptyStateSubtitle: 'Voc\u00EA pode adicionar despesas a este relat\u00F3rio usando o bot\u00E3o acima.',
        },
        noCategory: 'Sem categoria',
        noTag: 'Sem etiqueta',
        expenseType: 'Tipo de despesa',
        recentSearches: 'Pesquisas recentes',
        recentChats: 'Chats recentes',
        searchIn: 'Pesquisar em',
        searchPlaceholder: 'Procure por algo',
        suggestions: 'Sugest\u00F5es',
        exportSearchResults: {
            title: 'Criar exporta\u00E7\u00E3o',
            description: 'Uau, isso \u00E9 um monte de itens! Vamos agrup\u00E1-los, e o Concierge enviar\u00E1 um arquivo para voc\u00EA em breve.',
        },
        exportAll: {
            selectAllMatchingItems: 'Selecione todos os itens correspondentes',
            allMatchingItemsSelected: 'Todos os itens correspondentes selecionados',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, algo deu errado!',
        body: {
            helpTextMobile: 'Por favor, feche e reabra o aplicativo, ou mude para',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Se o problema persistir, entre em contato com',
        },
        refresh: 'Atualizar',
    },
    fileDownload: {
        success: {
            title: 'Baixado!',
            message: 'Anexo baixado com sucesso!',
            qrMessage:
                'Verifique sua pasta de fotos ou downloads para uma c\u00F3pia do seu c\u00F3digo QR. Dica: Adicione-o a uma apresenta\u00E7\u00E3o para que seu p\u00FAblico possa escanear e se conectar diretamente com voc\u00EA.',
        },
        generalError: {
            title: 'Erro de anexo',
            message: 'N\u00E3o \u00E9 poss\u00EDvel baixar o anexo',
        },
        permissionError: {
            title: 'Acesso ao armazenamento',
            message: 'O Expensify n\u00E3o pode salvar anexos sem acesso ao armazenamento. Toque em configura\u00E7\u00F5es para atualizar as permiss\u00F5es.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Novo Expensify',
        about: 'Sobre o New Expensify',
        update: 'Atualizar New Expensify',
        checkForUpdates: 'Verificar atualiza\u00E7\u00F5es',
        toggleDevTools: 'Alternar Ferramentas de Desenvolvedor',
        viewShortcuts: 'Ver atalhos de teclado',
        services: 'Servi\u00E7os',
        hide: 'Ocultar New Expensify',
        hideOthers: 'Ocultar Outros',
        showAll: 'Mostrar tudo',
        quit: 'Sair do New Expensify',
        fileMenu: 'Arquivo',
        closeWindow: 'Fechar Janela',
        editMenu: 'Editar',
        undo: 'Desfazer',
        redo: 'Refazer',
        cut: 'Cortar',
        copy: 'Copiar',
        paste: 'Colar',
        pasteAndMatchStyle: 'Colar e Combinar Estilo',
        pasteAsPlainText: 'Colar como Texto Simples',
        delete: 'Excluir',
        selectAll: 'Selecionar Tudo',
        speechSubmenu: 'Discurso',
        startSpeaking: 'Comece a Falar',
        stopSpeaking: 'Pare de Falar',
        viewMenu: 'Visualizar',
        reload: 'Recarregar',
        forceReload: 'For\u00E7ar Recarregamento',
        resetZoom: 'Tamanho Real',
        zoomIn: 'Aumentar',
        zoomOut: 'Reduzir Zoom',
        togglefullscreen: 'Alternar Tela Cheia',
        historyMenu: 'Hist\u00F3rico',
        back: 'Voltar',
        forward: 'Encaminhar',
        windowMenu: 'Janela',
        minimize: 'Minimizar',
        zoom: 'Zoom',
        front: 'Trazer Tudo para Frente',
        helpMenu: 'Ajuda',
        learnMore: 'Saiba mais',
        documentation: 'Documenta\u00E7\u00E3o',
        communityDiscussions: 'Discuss\u00F5es da Comunidade',
        searchIssues: 'Pesquisar Problemas',
    },
    historyMenu: {
        forward: 'Encaminhar',
        back: 'Voltar',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Atualiza\u00E7\u00E3o dispon\u00EDvel',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `A nova vers\u00E3o estar\u00E1 dispon\u00EDvel em breve.${!isSilentUpdating ? 'N\u00F3s notificaremos voc\u00EA quando estivermos prontos para atualizar.' : ''}`,
            soundsGood: 'Parece bom',
        },
        notAvailable: {
            title: 'Atualiza\u00E7\u00E3o indispon\u00EDvel',
            message: 'N\u00E3o h\u00E1 atualiza\u00E7\u00F5es dispon\u00EDveis no momento. Por favor, verifique novamente mais tarde!',
            okay: 'Okay',
        },
        error: {
            title: 'Falha na verifica\u00E7\u00E3o de atualiza\u00E7\u00E3o',
            message: 'N\u00E3o conseguimos verificar se h\u00E1 uma atualiza\u00E7\u00E3o. Por favor, tente novamente em breve.',
        },
    },
    report: {
        newReport: {
            createReport: 'Criar relat\u00F3rio',
            chooseWorkspace: 'Escolha um espa\u00E7o de trabalho para este relat\u00F3rio.',
        },
        genericCreateReportFailureMessage: 'Erro inesperado ao criar este chat. Por favor, tente novamente mais tarde.',
        genericAddCommentFailureMessage: 'Erro inesperado ao postar o coment\u00E1rio. Por favor, tente novamente mais tarde.',
        genericUpdateReportFieldFailureMessage: 'Erro inesperado ao atualizar o campo. Por favor, tente novamente mais tarde.',
        genericUpdateReportNameEditFailureMessage: 'Erro inesperado ao renomear o relat\u00F3rio. Por favor, tente novamente mais tarde.',
        noActivityYet: 'Nenhuma atividade ainda',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `alterado ${fieldName} de ${oldValue} para ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `alterado ${fieldName} para ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `alterou o espa\u00E7o de trabalho para ${toPolicyName}${fromPolicyName ? `(anteriormente ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `alterado o tipo de ${oldType} para ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) =>
                    `enviei este relat\u00F3rio para ${delegateUser} j\u00E1 que ${originalManager} est\u00E1 de f\u00E9rias`,
                exportedToCSV: `exportado para CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `exportado para ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportado para ${label} via`,
                    automaticActionTwo: 'configura\u00E7\u00F5es de contabilidade',
                    manual: ({label}: ExportedToIntegrationParams) => `marcou este relat\u00F3rio como exportado manualmente para ${label}.`,
                    automaticActionThree: 'e criou com sucesso um registro para',
                    reimburseableLink: 'despesas do pr\u00F3prio bolso',
                    nonReimbursableLink: 'despesas com cart\u00E3o corporativo',
                    pending: ({label}: ExportedToIntegrationParams) => `iniciou a exporta\u00E7\u00E3o deste relat\u00F3rio para ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `falha ao exportar este relat\u00F3rio para ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `adicionou um recibo`,
                managerDetachReceipt: `removeu um recibo`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pago ${currency}${amount} em outro lugar`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagou ${currency}${amount} via integra\u00E7\u00E3o`,
                outdatedBankAccount: `n\u00E3o foi poss\u00EDvel processar o pagamento devido a um problema com a conta banc\u00E1ria do pagador`,
                reimbursementACHBounce: `n\u00E3o foi poss\u00EDvel processar o pagamento, pois o pagador n\u00E3o possui fundos suficientes`,
                reimbursementACHCancelled: `cancelou o pagamento`,
                reimbursementAccountChanged: `n\u00E3o foi poss\u00EDvel processar o pagamento, pois o pagador mudou de conta banc\u00E1ria`,
                reimbursementDelayed: `processou o pagamento, mas est\u00E1 atrasado por mais 1-2 dias \u00FAteis`,
                selectedForRandomAudit: `selecionado aleatoriamente para revis\u00E3o`,
                selectedForRandomAuditMarkdown: `[selecionado aleatoriamente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revis\u00E3o`,
                share: ({to}: ShareParams) => `membro convidado ${to}`,
                unshare: ({to}: UnshareParams) => `membro removido ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `pago ${currency}${amount}`,
                takeControl: `assumiu o controle`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `falha ao sincronizar com ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `adicionado ${email} como ${role === 'member' ? 'a' : 'um/uma'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `atualizou o papel de ${email} para ${newRole} (anteriormente ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removeu o campo personalizado 1 de ${email} (anteriormente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `adicionado "${newValue}" ao campo personalizado 1 de ${email}`
                        : `alterou o campo personalizado 1 de ${email} para "${newValue}" (anteriormente "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removeu o campo personalizado 2 de ${email} (anteriormente "${previousValue}")`;
                    }
                    return !previousValue
                        ? `adicionado "${newValue}" ao campo personalizado 2 de ${email}`
                        : `alterou o campo personalizado 2 de ${email} para "${newValue}" (anteriormente "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} saiu do workspace`,
                removeMember: ({email, role}: AddEmployeeParams) => `removido ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removeu a conex\u00E3o com ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'saiu do chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} para ${dayCount} ${dayCount === 1 ? 'dia' : 'dias'} at\u00E9 ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} de ${timePeriod} em ${date}`,
    },
    footer: {
        features: 'Recursos',
        expenseManagement: 'Gerenciamento de Despesas',
        spendManagement: 'Gest\u00E3o de Despesas',
        expenseReports: 'Relat\u00F3rios de Despesas',
        companyCreditCard: 'Cart\u00E3o de Cr\u00E9dito Corporativo',
        receiptScanningApp: 'Aplicativo de Digitaliza\u00E7\u00E3o de Recibos',
        billPay: 'Pagamento de Contas',
        invoicing: 'Faturamento',
        CPACard: 'Cart\u00E3o CPA',
        payroll: 'Folha de Pagamento',
        travel: 'Viagem',
        resources: 'Recursos',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Suporte',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Termos de Servi\u00E7o',
        privacy: 'Privacidade',
        learnMore: 'Saiba mais',
        aboutExpensify: 'Sobre a Expensify',
        blog: 'Blog',
        jobs: 'Trabalhos',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Rela\u00E7\u00F5es com Investidores',
        getStarted: 'Come\u00E7ar',
        createAccount: 'Criar uma Nova Conta',
        logIn: 'Entrar',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Navegar de volta para a lista de conversas',
        chatWelcomeMessage: 'Mensagem de boas-vindas do chat',
        navigatesToChat: 'Navega para um chat',
        newMessageLineIndicator: 'Indicador de nova linha de mensagem',
        chatMessage: 'Mensagem de chat',
        lastChatMessagePreview: 'Pr\u00E9via da \u00FAltima mensagem do chat',
        workspaceName: 'Nome do workspace',
        chatUserDisplayNames: 'Nomes de exibi\u00E7\u00E3o dos membros do chat',
        scrollToNewestMessages: 'Rolar para as mensagens mais recentes',
        preStyledText: 'Texto pr\u00E9-formatado',
        viewAttachment: 'Ver anexo',
    },
    parentReportAction: {
        deletedReport: 'Relat\u00F3rio deletado',
        deletedMessage: 'Mensagem exclu\u00EDda',
        deletedExpense: 'Despesa exclu\u00EDda',
        reversedTransaction: 'Transa\u00E7\u00E3o revertida',
        deletedTask: 'Tarefa exclu\u00EDda',
        hiddenMessage: 'Mensagem oculta',
    },
    threads: {
        thread: 'T\u00F3pico',
        replies: 'Respostas',
        reply: 'Responder',
        from: 'De',
        in: 'em',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `em ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copiar URL',
        copied: 'Copiado!',
    },
    moderation: {
        flagDescription: 'Todas as mensagens sinalizadas ser\u00E3o enviadas para um moderador para revis\u00E3o.',
        chooseAReason: 'Escolha um motivo para sinalizar abaixo:',
        spam: 'Spam',
        spamDescription: 'Promo\u00E7\u00E3o n\u00E3o solicitada e fora de t\u00F3pico',
        inconsiderate: 'Inconsiderado',
        inconsiderateDescription: 'Frase insultuosa ou desrespeitosa, com inten\u00E7\u00F5es question\u00E1veis',
        intimidation: 'Intimida\u00E7\u00E3o',
        intimidationDescription: 'Perseguir agressivamente uma agenda apesar de obje\u00E7\u00F5es v\u00E1lidas',
        bullying: 'Bullying',
        bullyingDescription: 'Alvejando um indiv\u00EDduo para obter obedi\u00EAncia',
        harassment: 'Ass\u00E9dio',
        harassmentDescription: 'Comportamento racista, mis\u00F3gino ou amplamente discriminat\u00F3rio',
        assault: 'Assalto',
        assaultDescription: 'Ataque emocional especificamente direcionado com a inten\u00E7\u00E3o de causar dano',
        flaggedContent: 'Esta mensagem foi sinalizada por violar as regras da nossa comunidade e o conte\u00FAdo foi ocultado.',
        hideMessage: 'Ocultar mensagem',
        revealMessage: 'Revelar mensagem',
        levelOneResult: 'Envia um aviso an\u00F4nimo e a mensagem \u00E9 reportada para revis\u00E3o.',
        levelTwoResult: 'Mensagem oculta do canal, al\u00E9m de aviso an\u00F4nimo e mensagem relatada para revis\u00E3o.',
        levelThreeResult: 'Mensagem removida do canal, al\u00E9m de um aviso an\u00F4nimo, e a mensagem foi relatada para revis\u00E3o.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Convide-os',
        nothing: 'N\u00E3o fa\u00E7a nada',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Aceitar',
        decline: 'Recusar',
    },
    actionableMentionTrackExpense: {
        submit: 'Enviar para algu\u00E9m',
        categorize: 'Categorize it',
        share: 'Compartilhar com meu contador',
        nothing: 'Nada por enquanto',
    },
    teachersUnitePage: {
        teachersUnite: 'Professores Unidos',
        joinExpensifyOrg:
            'Junte-se \u00E0 Expensify.org na elimina\u00E7\u00E3o da injusti\u00E7a ao redor do mundo. A atual campanha "Teachers Unite" apoia educadores em todos os lugares dividindo os custos de materiais escolares essenciais.',
        iKnowATeacher: 'Eu conhe\u00E7o um professor',
        iAmATeacher: 'Eu sou professor(a)',
        getInTouch: 'Excelente! Por favor, compartilhe as informa\u00E7\u00F5es deles para que possamos entrar em contato.',
        introSchoolPrincipal: 'Introdu\u00E7\u00E3o ao seu diretor escolar',
        schoolPrincipalVerifyExpense:
            'Expensify.org divide o custo de materiais escolares essenciais para que estudantes de fam\u00EDlias de baixa renda possam ter uma melhor experi\u00EAncia de aprendizado. Seu diretor ser\u00E1 solicitado a verificar suas despesas.',
        principalFirstName: 'Nome do principal',
        principalLastName: 'Sobrenome do principal',
        principalWorkEmail: 'Email principal de trabalho',
        updateYourEmail: 'Atualize seu endere\u00E7o de e-mail',
        updateEmail: 'Atualizar endere\u00E7o de e-mail',
        contactMethods: 'M\u00E9todos de contato.',
        schoolMailAsDefault:
            'Antes de prosseguir, certifique-se de definir seu e-mail escolar como seu m\u00E9todo de contato padr\u00E3o. Voc\u00EA pode fazer isso em Configura\u00E7\u00F5es > Perfil >',
        error: {
            enterPhoneEmail: 'Insira um e-mail ou n\u00FAmero de telefone v\u00E1lido',
            enterEmail: 'Digite um e-mail',
            enterValidEmail: 'Digite um e-mail v\u00E1lido',
            tryDifferentEmail: 'Por favor, tente um email diferente',
        },
    },
    cardTransactions: {
        notActivated: 'N\u00E3o ativado',
        outOfPocket: 'Despesa do pr\u00F3prio bolso',
        companySpend: 'Gastos da empresa',
    },
    distance: {
        addStop: 'Adicionar parada',
        deleteWaypoint: 'Excluir ponto de refer\u00EAncia',
        deleteWaypointConfirmation: 'Tem certeza de que deseja excluir este ponto de refer\u00EAncia?',
        address: 'Endere\u00E7o',
        waypointDescription: {
            start: 'Come\u00E7ar',
            stop: 'Parar',
        },
        mapPending: {
            title: 'Mapa pendente',
            subtitle: 'O mapa ser\u00E1 gerado quando voc\u00EA voltar a ficar online',
            onlineSubtitle: 'Um momento enquanto configuramos o mapa',
            errorTitle: 'Erro no mapa',
            errorSubtitle: 'Houve um erro ao carregar o mapa. Por favor, tente novamente.',
        },
        error: {
            selectSuggestedAddress: 'Por favor, selecione um endere\u00E7o sugerido ou use a localiza\u00E7\u00E3o atual',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Relatar perda / dano do cart\u00E3o f\u00EDsico',
        screenTitle: 'Boletim perdido ou danificado',
        nextButtonLabel: 'Pr\u00F3ximo',
        reasonTitle: 'Por que voc\u00EA precisa de um novo cart\u00E3o?',
        cardDamaged: 'Meu cart\u00E3o foi danificado',
        cardLostOrStolen: 'Meu cart\u00E3o foi perdido ou roubado',
        confirmAddressTitle: 'Por favor, confirme o endere\u00E7o de correspond\u00EAncia para o seu novo cart\u00E3o.',
        cardDamagedInfo: 'Seu novo cart\u00E3o chegar\u00E1 em 2-3 dias \u00FAteis. Seu cart\u00E3o atual continuar\u00E1 funcionando at\u00E9 que voc\u00EA ative o novo.',
        cardLostOrStolenInfo: 'Seu cart\u00E3o atual ser\u00E1 permanentemente desativado assim que seu pedido for feito. A maioria dos cart\u00F5es chega em alguns dias \u00FAteis.',
        address: 'Endere\u00E7o',
        deactivateCardButton: 'Desativar cart\u00E3o',
        shipNewCardButton: 'Enviar novo cart\u00E3o',
        addressError: 'Endere\u00E7o \u00E9 obrigat\u00F3rio',
        reasonError: 'Motivo \u00E9 obrigat\u00F3rio',
    },
    eReceipt: {
        guaranteed: 'eReceipt Garantido',
        transactionDate: 'Data da transa\u00E7\u00E3o',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Iniciar um chat,',
            buttonText2: 'indique um amigo.',
            header: 'Inicie um chat, indique um amigo',
            body: 'Quer que seus amigos usem o Expensify tamb\u00E9m? Basta iniciar um chat com eles e n\u00F3s cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Enviar uma despesa,',
            buttonText2: 'indique seu chefe.',
            header: 'Envie uma despesa, indique seu chefe',
            body: 'Quer que seu chefe use o Expensify tamb\u00E9m? Basta enviar uma despesa para eles e n\u00F3s cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify tamb\u00E9m? Basta conversar, pagar ou dividir uma despesa com eles e n\u00F3s cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Indique um amigo',
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify tamb\u00E9m? Basta conversar, pagar ou dividir uma despesa com eles e n\u00F3s cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        copyReferralLink: 'Copiar link de convite',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Converse com seu especialista de configura\u00E7\u00E3o em',
            phrase2: 'para ajuda',
        },
        default: {
            phrase1: 'Mensagem',
            phrase2: 'para ajuda com a configura\u00E7\u00E3o',
        },
    },
    violations: {
        allTagLevelsRequired: 'Todas as tags s\u00E3o obrigat\u00F3rias',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `${rejectedBy} rejeitou esta despesa com o coment\u00E1rio "${rejectReason}"`,
        billableExpense: 'Fatur\u00E1vel n\u00E3o \u00E9 mais v\u00E1lido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Recibo necess\u00E1rio${formattedLimit ? `acima de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria n\u00E3o \u00E9 mais v\u00E1lida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Aplicado ${surcharge}% de taxa de convers\u00E3o`,
        customUnitOutOfPolicy: 'Taxa n\u00E3o v\u00E1lida para este espa\u00E7o de trabalho',
        duplicatedTransaction: 'Duplicar',
        fieldRequired: 'Os campos do relat\u00F3rio s\u00E3o obrigat\u00F3rios',
        futureDate: 'Data futura n\u00E3o permitida',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marcado em ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data mais antiga que ${maxAge} dias`,
        missingCategory: 'Categoria ausente',
        missingComment: 'Descri\u00E7\u00E3o necess\u00E1ria para a categoria selecionada',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Faltando ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'O valor difere da dist\u00E2ncia calculada';
                case 'card':
                    return 'Valor maior que a transa\u00E7\u00E3o do cart\u00E3o';
                default:
                    if (displayPercentVariance) {
                        return `Quantia ${displayPercentVariance}% maior que o recibo escaneado`;
                    }
                    return 'Quantia maior que o recibo escaneado';
            }
        },
        modifiedDate: 'Data difere do recibo escaneado',
        nonExpensiworksExpense: 'Despesa n\u00E3o-Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Despesa excede o limite de aprova\u00E7\u00E3o autom\u00E1tica de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa na categoria`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Quantia acima do limite di\u00E1rio de ${formattedLimit}/pessoa para a categoria`,
        receiptNotSmartScanned:
            'Detalhes da despesa e recibo adicionados manualmente. Por favor, verifique os detalhes. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Saiba mais</a> sobre auditoria autom\u00E1tica para todos os recibos.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Recibo necess\u00E1rio';
            if (formattedLimit ?? category) {
                message += 'sobre';
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += 'limite de categoria';
                }
            }
            return message;
        },
        prohibitedExpense: ({prohibitedExpenseType}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Despesa proibida:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return `${preMessage} \u00E1lcool`;
                case 'gambling':
                    return `${preMessage} jogos de azar`;
                case 'tobacco':
                    return `${preMessage} tabaco`;
                case 'adultEntertainment':
                    return `${preMessage} entretenimento adulto`;
                case 'hotelIncidentals':
                    return `${preMessage} despesas incidentais de hotel`;
                default:
                    return `${preMessage}${prohibitedExpenseType}`;
            }
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Revis\u00E3o necess\u00E1ria',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `N\u00E3o \u00E9 poss\u00EDvel corresponder automaticamente o recibo devido a uma conex\u00E3o banc\u00E1ria quebrada que ${email} precisa corrigir.`
                    : 'N\u00E3o \u00E9 poss\u00EDvel corresponder automaticamente o recibo devido a uma conex\u00E3o banc\u00E1ria interrompida que voc\u00EA precisa corrigir.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Pe\u00E7a para ${member} marcar como dinheiro ou espere 7 dias e tente novamente.` : 'Aguardando a fus\u00E3o com a transa\u00E7\u00E3o do cart\u00E3o.';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendente devido a conex\u00E3o banc\u00E1ria interrompida',
        adminBrokenConnectionError: 'Recibo pendente devido a uma conex\u00E3o banc\u00E1ria interrompida. Por favor, resolva em',
        memberBrokenConnectionError:
            'Recibo pendente devido a uma conex\u00E3o banc\u00E1ria interrompida. Por favor, pe\u00E7a a um administrador do espa\u00E7o de trabalho para resolver.',
        markAsCashToIgnore: 'Marcar como dinheiro para ignorar e solicitar pagamento.',
        smartscanFailed: ({canEdit = true}) => `Falha na digitaliza\u00E7\u00E3o do recibo.${canEdit ? 'Insira os detalhes manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Recibo potencial gerado por IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Faltando ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} n\u00E3o \u00E9 mais v\u00E1lido`,
        taxAmountChanged: 'O valor do imposto foi modificado',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Imposto'} n\u00E3o \u00E9 mais v\u00E1lido`,
        taxRateChanged: 'A al\u00EDquota de imposto foi modificada',
        taxRequired: 'Taxa de imposto ausente',
        none: 'Nenhum',
        taxCodeToKeep: 'Escolha qual c\u00F3digo de imposto manter',
        tagToKeep: 'Escolha qual tag manter',
        isTransactionReimbursable: 'Escolha se a transa\u00E7\u00E3o \u00E9 reembols\u00E1vel',
        merchantToKeep: 'Escolha qual comerciante manter',
        descriptionToKeep: 'Escolha qual descri\u00E7\u00E3o manter',
        categoryToKeep: 'Escolha qual categoria manter',
        isTransactionBillable: 'Escolha se a transa\u00E7\u00E3o \u00E9 fatur\u00E1vel',
        keepThisOne: 'Mantenha este',
        confirmDetails: `Confirme os detalhes que voc\u00EA est\u00E1 mantendo`,
        confirmDuplicatesInfo: `As solicita\u00E7\u00F5es duplicadas que voc\u00EA n\u00E3o mantiver ser\u00E3o mantidas para o membro excluir.`,
        hold: 'Esta despesa foi colocada em espera',
        resolvedDuplicates: 'resolveu o duplicado',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} \u00E9 obrigat\u00F3rio`,
    },
    violationDismissal: {
        rter: {
            manual: 'marcou este recibo como dinheiro vivo',
        },
        duplicatedTransaction: {
            manual: 'resolveu o duplicado',
        },
    },
    videoPlayer: {
        play: 'Jogar',
        pause: 'Pausar',
        fullscreen: 'Tela cheia',
        playbackSpeed: 'Velocidade de reprodu\u00E7\u00E3o',
        expand: 'Expandir',
        mute: 'Silenciar',
        unmute: 'Ativar som',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Antes de voc\u00EA ir',
        reasonPage: {
            title: 'Por favor, diga-nos por que voc\u00EA est\u00E1 saindo',
            subtitle: 'Antes de voc\u00EA ir, por favor nos diga por que gostaria de mudar para o Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Preciso de um recurso que est\u00E1 dispon\u00EDvel apenas no Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'N\u00E3o entendo como usar o New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Eu entendo como usar o New Expensify, mas eu prefiro o Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Que recurso voc\u00EA precisa que n\u00E3o est\u00E1 dispon\u00EDvel no New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'O que voc\u00EA est\u00E1 tentando fazer?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Por que voc\u00EA prefere o Expensify Classic?',
        },
        responsePlaceholder: 'Sua resposta',
        thankYou: 'Obrigado pelo feedback!',
        thankYouSubtitle: 'Suas respostas nos ajudar\u00E3o a construir um produto melhor para realizar tarefas. Muito obrigado!',
        goToExpensifyClassic: 'Mudar para o Expensify Classic',
        offlineTitle: 'Parece que voc\u00EA est\u00E1 preso aqui...',
        offline:
            'Parece que voc\u00EA est\u00E1 offline. Infelizmente, o Expensify Classic n\u00E3o funciona offline, mas o Novo Expensify funciona. Se preferir usar o Expensify Classic, tente novamente quando tiver uma conex\u00E3o com a internet.',
        quickTip: 'Dica r\u00E1pida...',
        quickTipSubTitle: 'Voc\u00EA pode ir direto para o Expensify Classic visitando expensify.com. Adicione aos favoritos para um atalho f\u00E1cil!',
        bookACall: 'Agendar uma chamada',
        noThanks: 'N\u00E3o, obrigado.',
        bookACallTitle: 'Voc\u00EA gostaria de falar com um gerente de produto?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Conversando diretamente em despesas e relat\u00F3rios',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacidade de fazer tudo no celular',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viagem e despesas na velocidade do chat',
        },
        bookACallTextTop: 'Ao mudar para o Expensify Classic, voc\u00EA perder\u00E1:',
        bookACallTextBottom:
            'Ficar\u00EDamos empolgados em fazer uma liga\u00E7\u00E3o com voc\u00EA para entender o motivo. Voc\u00EA pode agendar uma chamada com um de nossos gerentes de produto s\u00EAnior para discutir suas necessidades.',
        takeMeToExpensifyClassic: 'Leve-me para o Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Ocorreu um erro ao carregar mais mensagens',
        tryAgain: 'Tente novamente',
    },
    systemMessage: {
        mergedWithCashTransaction: 'correspondeu um recibo a esta transa\u00E7\u00E3o',
    },
    subscription: {
        authenticatePaymentCard: 'Autenticar cart\u00E3o de pagamento',
        mobileReducedFunctionalityMessage: 'Voc\u00EA n\u00E3o pode fazer altera\u00E7\u00F5es na sua assinatura no aplicativo m\u00F3vel.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Teste gratuito: ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'} restantes`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Suas informa\u00E7\u00F5es de pagamento est\u00E3o desatualizadas',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Atualize seu cart\u00E3o de pagamento at\u00E9 ${date} para continuar usando todos os seus recursos favoritos.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'N\u00E3o foi poss\u00EDvel processar seu pagamento',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Sua cobran\u00E7a de ${date} no valor de ${purchaseAmountOwed} n\u00E3o p\u00F4de ser processada. Por favor, adicione um cart\u00E3o de pagamento para quitar o valor devido.`
                        : 'Por favor, adicione um cart\u00E3o de pagamento para quitar o valor devido.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Suas informa\u00E7\u00F5es de pagamento est\u00E3o desatualizadas',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Seu pagamento est\u00E1 atrasado. Por favor, pague sua fatura at\u00E9 ${date} para evitar a interrup\u00E7\u00E3o do servi\u00E7o.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Suas informa\u00E7\u00F5es de pagamento est\u00E3o desatualizadas',
                subtitle: 'Seu pagamento est\u00E1 atrasado. Por favor, pague sua fatura.',
            },
            billingDisputePending: {
                title: 'N\u00E3o foi poss\u00EDvel cobrar no seu cart\u00E3o',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Voc\u00EA contestou a cobran\u00E7a de ${amountOwed} no cart\u00E3o que termina em ${cardEnding}. Sua conta ser\u00E1 bloqueada at\u00E9 que a disputa seja resolvida com seu banco.`,
            },
            cardAuthenticationRequired: {
                title: 'N\u00E3o foi poss\u00EDvel cobrar no seu cart\u00E3o',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Seu cart\u00E3o de pagamento n\u00E3o foi totalmente autenticado. Por favor, complete o processo de autentica\u00E7\u00E3o para ativar seu cart\u00E3o de pagamento com final ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'N\u00E3o foi poss\u00EDvel cobrar no seu cart\u00E3o',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Seu cart\u00E3o de pagamento foi recusado devido a fundos insuficientes. Por favor, tente novamente ou adicione um novo cart\u00E3o de pagamento para liquidar seu saldo pendente de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'N\u00E3o foi poss\u00EDvel cobrar no seu cart\u00E3o',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Seu cart\u00E3o de pagamento expirou. Por favor, adicione um novo cart\u00E3o de pagamento para quitar seu saldo pendente de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Seu cart\u00E3o est\u00E1 prestes a expirar',
                subtitle:
                    'Seu cart\u00E3o de pagamento expirar\u00E1 no final deste m\u00EAs. Clique no menu de tr\u00EAs pontos abaixo para atualiz\u00E1-lo e continuar usando todos os seus recursos favoritos.',
            },
            retryBillingSuccess: {
                title: 'Sucesso!',
                subtitle: 'Seu cart\u00E3o foi cobrado com sucesso.',
            },
            retryBillingError: {
                title: 'N\u00E3o foi poss\u00EDvel cobrar no seu cart\u00E3o',
                subtitle:
                    'Antes de tentar novamente, por favor, ligue diretamente para o seu banco para autorizar cobran\u00E7as do Expensify e remover quaisquer bloqueios. Caso contr\u00E1rio, tente adicionar um cart\u00E3o de pagamento diferente.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Voc\u00EA contestou a cobran\u00E7a de ${amountOwed} no cart\u00E3o que termina em ${cardEnding}. Sua conta ser\u00E1 bloqueada at\u00E9 que a disputa seja resolvida com seu banco.`,
            preTrial: {
                title: 'Iniciar um teste gratuito',
                subtitleStart: 'Como pr\u00F3ximo passo,',
                subtitleLink: 'complete sua lista de verifica\u00E7\u00E3o de configura\u00E7\u00E3o',
                subtitleEnd: 'para que sua equipe possa come\u00E7ar a registrar despesas.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Teste: ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'} restantes!`,
                subtitle: 'Adicione um cart\u00E3o de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            trialEnded: {
                title: 'Sua avalia\u00E7\u00E3o gratuita terminou',
                subtitle: 'Adicione um cart\u00E3o de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            earlyDiscount: {
                claimOffer: 'Resgatar oferta',
                noThanks: 'N\u00E3o, obrigado.',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de desconto no seu primeiro ano!`,
                    phrase2: `Basta adicionar um cart\u00E3o de pagamento e iniciar uma assinatura anual.`,
                },
                onboardingChatTitle: {
                    phrase1: 'Oferta por tempo limitado:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `${discountType}% de desconto no seu primeiro ano!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Reivindicar em ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Adicione um cart\u00E3o para pagar sua assinatura do Expensify.',
            addCardButton: 'Adicionar cart\u00E3o de pagamento',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Sua pr\u00F3xima data de pagamento \u00E9 ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Cart\u00E3o com final ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nome: ${name}, Expira\u00E7\u00E3o: ${expiration}, Moeda: ${currency}`,
            changeCard: 'Alterar cart\u00E3o de pagamento',
            changeCurrency: 'Alterar moeda de pagamento',
            cardNotFound: 'Nenhum cart\u00E3o de pagamento adicionado',
            retryPaymentButton: 'Tentar pagamento novamente',
            authenticatePayment: 'Autenticar pagamento',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                phrase1: 'Obter um reembolso \u00E9 f\u00E1cil, basta fazer o downgrade da sua conta antes da pr\u00F3xima data de cobran\u00E7a e voc\u00EA receber\u00E1 um reembolso.',
                phrase2:
                    'Aten\u00E7\u00E3o: Rebaixar sua conta significa que seu(s) espa\u00E7o(s) de trabalho ser\u00E1(\u00E3o) exclu\u00EDdo(s). Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita, mas voc\u00EA sempre pode criar um novo espa\u00E7o de trabalho se mudar de ideia.',
                confirm: 'Excluir espa\u00E7o(s) de trabalho e rebaixar',
            },
            viewPaymentHistory: 'Ver hist\u00F3rico de pagamentos',
        },
        yourPlan: {
            title: 'Seu plano',
            exploreAllPlans: 'Explore todos os planos',
            customPricing: 'Pre\u00E7o personalizado',
            asLowAs: ({price}: YourPlanPriceValueParams) => `a partir de ${price} por membro ativo/m\u00EAs`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro/m\u00EAs`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro por m\u00EAs`,
            perMemberMonth: 'por membro/m\u00EAs',
            collect: {
                title: 'Coletar',
                description: 'O plano para pequenas empresas que oferece despesas, viagens e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Digitaliza\u00E7\u00E3o de recibo',
                benefit2: 'Reembolsos',
                benefit3: 'Gerenciamento de cart\u00F5es corporativos',
                benefit4: 'Aprova\u00E7\u00F5es de despesas e viagens',
                benefit5: 'Reserva de viagem e regras',
                benefit6: 'Integra\u00E7\u00F5es QuickBooks/Xero',
                benefit7: 'Conversar sobre despesas, relat\u00F3rios e salas',
                benefit8: 'Suporte humano e de IA',
            },
            control: {
                title: 'Controle',
                description: 'Despesas, viagens e chat para grandes empresas.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Tudo no plano Collect',
                benefit2: 'Fluxos de aprova\u00E7\u00E3o em m\u00FAltiplos n\u00EDveis',
                benefit3: 'Regras de despesas personalizadas',
                benefit4: 'Integra\u00E7\u00F5es ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integra\u00E7\u00F5es de RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Insights e relat\u00F3rios personalizados',
                benefit8: 'Or\u00E7amento',
            },
            thisIsYourCurrentPlan: 'Este \u00E9 o seu plano atual',
            downgrade: 'Rebaixar para Collect',
            upgrade: 'Atualize para Control',
            addMembers: 'Adicionar membros',
            saveWithExpensifyTitle: 'Economize com o Cart\u00E3o Expensify',
            saveWithExpensifyDescription: 'Use nosso calculador de economia para ver como o cashback do Expensify Card pode reduzir sua fatura do Expensify.',
            saveWithExpensifyButton: 'Saiba mais',
        },
        compareModal: {
            comparePlans: 'Comparar Planos',
            unlockTheFeatures: 'Desbloqueie os recursos de que voc\u00EA precisa com o plano certo para voc\u00EA.',
            viewOurPricing: 'Veja nossa p\u00E1gina de pre\u00E7os',
            forACompleteFeatureBreakdown: 'para uma an\u00E1lise completa dos recursos de cada um dos nossos planos.',
        },
        details: {
            title: 'Detalhes da assinatura',
            annual: 'Assinatura anual',
            taxExempt: 'Solicitar status de isen\u00E7\u00E3o de impostos',
            taxExemptEnabled: 'Isento de impostos',
            taxExemptStatus: 'Status de isen\u00E7\u00E3o de impostos',
            payPerUse: 'Pagamento por uso',
            subscriptionSize: 'Tamanho da assinatura',
            headsUp:
                'Aten\u00E7\u00E3o: Se voc\u00EA n\u00E3o definir o tamanho da sua assinatura agora, n\u00F3s a definiremos automaticamente com base no n\u00FAmero de membros ativos do seu primeiro m\u00EAs. Voc\u00EA estar\u00E1 ent\u00E3o comprometido a pagar por pelo menos esse n\u00FAmero de membros pelos pr\u00F3ximos 12 meses. Voc\u00EA pode aumentar o tamanho da sua assinatura a qualquer momento, mas n\u00E3o pode diminu\u00ED-lo at\u00E9 que sua assinatura termine.',
            zeroCommitment: 'Zero compromisso na taxa de assinatura anual com desconto',
        },
        subscriptionSize: {
            title: 'Tamanho da assinatura',
            yourSize: 'O tamanho da sua assinatura \u00E9 o n\u00FAmero de vagas dispon\u00EDveis que podem ser preenchidas por qualquer membro ativo em um determinado m\u00EAs.',
            eachMonth:
                'A cada m\u00EAs, sua assinatura cobre at\u00E9 o n\u00FAmero de membros ativos definido acima. Sempre que voc\u00EA aumentar o tamanho da sua assinatura, come\u00E7ar\u00E1 uma nova assinatura de 12 meses nesse novo tamanho.',
            note: 'Nota: Um membro ativo \u00E9 qualquer pessoa que tenha criado, editado, enviado, aprovado, reembolsado ou exportado dados de despesas vinculados ao espa\u00E7o de trabalho da sua empresa.',
            confirmDetails: 'Confirme os detalhes da sua nova assinatura anual:',
            subscriptionSize: 'Tamanho da assinatura',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membros ativos/m\u00EAs`,
            subscriptionRenews: 'Assinatura renova-se',
            youCantDowngrade: 'Voc\u00EA n\u00E3o pode fazer downgrade durante sua assinatura anual.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Voc\u00EA j\u00E1 se comprometeu com uma assinatura anual de ${size} membros ativos por m\u00EAs at\u00E9 ${date}. Voc\u00EA pode mudar para uma assinatura de pagamento por uso em ${date} desativando a renova\u00E7\u00E3o autom\u00E1tica.`,
            error: {
                size: 'Por favor, insira um tamanho de assinatura v\u00E1lido',
                sameSize: 'Por favor, insira um n\u00FAmero diferente do tamanho atual da sua assinatura.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Adicionar cart\u00E3o de pagamento',
            enterPaymentCardDetails: 'Insira os detalhes do seu cart\u00E3o de pagamento',
            security: 'A Expensify \u00E9 compat\u00EDvel com PCI-DSS, usa criptografia em n\u00EDvel banc\u00E1rio e utiliza infraestrutura redundante para proteger seus dados.',
            learnMoreAboutSecurity: 'Saiba mais sobre nossa seguran\u00E7a.',
        },
        subscriptionSettings: {
            title: 'Configura\u00E7\u00F5es de assinatura',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo de assinatura: ${subscriptionType}, Tamanho da assinatura: ${subscriptionSize}, Renova\u00E7\u00E3o autom\u00E1tica: ${autoRenew}, Aumento autom\u00E1tico de assentos anuais: ${autoIncrease}`,
            none: 'nenhum',
            on: 'on',
            off: 'desligado',
            annual: 'Anual',
            autoRenew: 'Renova\u00E7\u00E3o autom\u00E1tica',
            autoIncrease: 'Aumentar automaticamente as vagas anuais',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Economize at\u00E9 ${amountWithCurrency}/m\u00EAs por membro ativo`,
            automaticallyIncrease:
                'Aumente automaticamente seus assentos anuais para acomodar membros ativos que excedam o tamanho da sua assinatura. Nota: Isso estender\u00E1 a data de t\u00E9rmino da sua assinatura anual.',
            disableAutoRenew: 'Desativar renova\u00E7\u00E3o autom\u00E1tica',
            helpUsImprove: 'Ajude-nos a melhorar o Expensify',
            whatsMainReason: 'Qual \u00E9 o principal motivo para voc\u00EA desativar a renova\u00E7\u00E3o autom\u00E1tica?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renova em ${date}.`,
            pricingConfiguration: 'O pre\u00E7o depende da configura\u00E7\u00E3o. Para o menor pre\u00E7o, escolha uma assinatura anual e obtenha o Expensify Card.',
            learnMore: {
                part1: 'Saiba mais em nosso',
                pricingPage: 'p\u00E1gina de pre\u00E7os',
                part2: 'ou converse com nossa equipe no seu',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Pre\u00E7o estimado',
            changesBasedOn: 'Isso muda com base no uso do seu Cart\u00E3o Expensify e nas op\u00E7\u00F5es de assinatura abaixo.',
        },
        requestEarlyCancellation: {
            title: 'Solicitar cancelamento antecipado',
            subtitle: 'Qual \u00E9 o principal motivo pelo qual voc\u00EA est\u00E1 solicitando o cancelamento antecipado?',
            subscriptionCanceled: {
                title: 'Assinatura cancelada',
                subtitle: 'Sua assinatura anual foi cancelada.',
                info: 'Se voc\u00EA quiser continuar usando seu(s) espa\u00E7o(s) de trabalho em uma base de pagamento por uso, est\u00E1 tudo certo.',
                preventFutureActivity: {
                    part1: 'Se voc\u00EA quiser evitar atividades e cobran\u00E7as futuras, voc\u00EA deve',
                    link: 'excluir seu(s) espa\u00E7o(s) de trabalho',
                    part2: '. Observe que, ao excluir seu(s) espa\u00E7o(s) de trabalho, voc\u00EA ser\u00E1 cobrado por qualquer atividade pendente que tenha ocorrido durante o m\u00EAs calend\u00E1rio atual.',
                },
            },
            requestSubmitted: {
                title: 'Solicita\u00E7\u00E3o enviada',
                subtitle: {
                    part1: 'Obrigado por nos informar que voc\u00EA est\u00E1 interessado em cancelar sua assinatura. Estamos revisando sua solicita\u00E7\u00E3o e entraremos em contato em breve atrav\u00E9s do seu chat com',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: {
                part1: 'Ao solicitar o cancelamento antecipado, reconhe\u00E7o e concordo que a Expensify n\u00E3o tem obriga\u00E7\u00E3o de conceder tal solicita\u00E7\u00E3o sob a Expensify.',
                link: 'Termos de Servi\u00E7o',
                part2: 'ou outro contrato de servi\u00E7os aplic\u00E1vel entre mim e a Expensify, e que a Expensify mant\u00E9m total discri\u00E7\u00E3o em rela\u00E7\u00E3o \u00E0 concess\u00E3o de qualquer solicita\u00E7\u00E3o desse tipo.',
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'A funcionalidade precisa de melhorias',
        tooExpensive: 'Muito caro',
        inadequateSupport: 'Suporte ao cliente inadequado',
        businessClosing: 'Empresa fechando, reduzindo ou adquirida',
        additionalInfoTitle: 'Para qual software voc\u00EA est\u00E1 se mudando e por qu\u00EA?',
        additionalInfoInputLabel: 'Sua resposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'defina a descri\u00E7\u00E3o do quarto para:',
        clearRoomDescription: 'limpou a descri\u00E7\u00E3o da sala',
    },
    delegate: {
        switchAccount: 'Alternar contas:',
        copilotDelegatedAccess: 'Copilot: Acesso delegado',
        copilotDelegatedAccessDescription: 'Permitir que outros membros acessem sua conta.',
        addCopilot: 'Adicionar copiloto',
        membersCanAccessYourAccount: 'Esses membros podem acessar sua conta:',
        youCanAccessTheseAccounts: 'Voc\u00EA pode acessar essas contas atrav\u00E9s do alternador de contas:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Cheio';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitado';
                default:
                    return '';
            }
        },
        genericError: 'Ops, algo deu errado. Por favor, tente novamente.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `em nome de ${delegator}`,
        accessLevel: 'N\u00EDvel de acesso',
        confirmCopilot: 'Confirme seu copiloto abaixo.',
        accessLevelDescription: 'Escolha um n\u00EDvel de acesso abaixo. Tanto o acesso Completo quanto o Limitado permitem que copilotos vejam todas as conversas e despesas.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permitir que outro membro execute todas as a\u00E7\u00F5es em sua conta, em seu nome. Inclui chat, envios, aprova\u00E7\u00F5es, pagamentos, atualiza\u00E7\u00F5es de configura\u00E7\u00F5es e mais.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permitir que outro membro execute a maioria das a\u00E7\u00F5es em sua conta, em seu nome. Exclui aprova\u00E7\u00F5es, pagamentos, rejei\u00E7\u00F5es e bloqueios.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Remover copilot',
        removeCopilotConfirmation: 'Tem certeza de que deseja remover este copiloto?',
        changeAccessLevel: 'Alterar n\u00EDvel de acesso',
        makeSureItIsYou: 'Vamos garantir que \u00E9 voc\u00EA',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${contactMethod} para adicionar um copiloto. Ele deve chegar em um ou dois minutos.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Por favor, insira o c\u00F3digo m\u00E1gico enviado para ${contactMethod} para atualizar seu copiloto.`,
        notAllowed: 'N\u00E3o t\u00E3o r\u00E1pido...',
        noAccessMessage: 'Como copiloto, voc\u00EA n\u00E3o tem acesso a esta p\u00E1gina. Desculpe!',
        notAllowedMessageStart: `Como um(a)`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `para ${accountOwnerEmail}, voc\u00EA n\u00E3o tem permiss\u00E3o para realizar esta a\u00E7\u00E3o. Desculpe!`,
        copilotAccess: 'Acesso ao Copilot',
    },
    debug: {
        debug: 'Depurar',
        details: 'Detalhes',
        JSON: 'JSON',
        reportActions: 'A\u00E7\u00F5es',
        reportActionPreview: 'Visualizar',
        nothingToPreview: 'Nada para visualizar',
        editJson: 'Editar JSON:',
        preview: 'Visualizar:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Faltando ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriedade inv\u00E1lida: ${propertyName} - Esperado: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valor inv\u00E1lido - Esperado: ${expectedValues}`,
        missingValue: 'Valor ausente',
        createReportAction: 'Criar A\u00E7\u00E3o de Relat\u00F3rio',
        reportAction: 'A\u00E7\u00E3o de Relat\u00F3rio',
        report: 'Relat\u00F3rio',
        transaction: 'Transa\u00E7\u00E3o',
        violations: 'Viola\u00E7\u00F5es',
        transactionViolation: 'Viola\u00E7\u00E3o de Transa\u00E7\u00E3o',
        hint: 'As altera\u00E7\u00F5es de dados n\u00E3o ser\u00E3o enviadas para o backend',
        textFields: 'Campos de texto',
        numberFields: 'Campos num\u00E9ricos',
        booleanFields: 'Campos booleanos',
        constantFields: 'Campos constantes',
        dateTimeFields: 'Campos DateTime',
        date: 'Data',
        time: 'Tempo',
        none: 'Nenhum',
        visibleInLHN: 'Vis\u00EDvel no LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Ver Relat\u00F3rio',
        viewTransaction: 'Ver transa\u00E7\u00E3o',
        createTransactionViolation: 'Criar viola\u00E7\u00E3o de transa\u00E7\u00E3o',
        reasonVisibleInLHN: {
            hasDraftComment: 'Tem coment\u00E1rio rascunho',
            hasGBR: 'Possui GBR',
            hasRBR: 'Possui RBR',
            pinnedByUser: 'Fixado por membro',
            hasIOUViolations: 'Tem viola\u00E7\u00F5es de IOU',
            hasAddWorkspaceRoomErrors: 'Tem erros ao adicionar a sala do espa\u00E7o de trabalho',
            isUnread: 'Est\u00E1 n\u00E3o lido (modo de foco)',
            isArchived: 'Est\u00E1 arquivado (modo mais recente)',
            isSelfDM: '\u00C9 auto DM',
            isFocused: 'Est\u00E1 temporariamente focado',
        },
        reasonGBR: {
            hasJoinRequest: 'Tem solicita\u00E7\u00E3o de ingresso (sala de administra\u00E7\u00E3o)',
            isUnreadWithMention: 'Est\u00E1 n\u00E3o lido com men\u00E7\u00E3o',
            isWaitingForAssigneeToCompleteAction: 'Est\u00E1 aguardando o respons\u00E1vel concluir a a\u00E7\u00E3o',
            hasChildReportAwaitingAction: 'Possui relat\u00F3rio infantil aguardando a\u00E7\u00E3o',
            hasMissingInvoiceBankAccount: 'Est\u00E1 faltando a conta banc\u00E1ria da fatura',
        },
        reasonRBR: {
            hasErrors: 'Tem erros nos dados do relat\u00F3rio ou das a\u00E7\u00F5es do relat\u00F3rio',
            hasViolations: 'Tem viola\u00E7\u00F5es',
            hasTransactionThreadViolations: 'Tem viola\u00E7\u00F5es no encadeamento de transa\u00E7\u00F5es',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'H\u00E1 um relat\u00F3rio aguardando a\u00E7\u00E3o',
            theresAReportWithErrors: 'H\u00E1 um relat\u00F3rio com erros',
            theresAWorkspaceWithCustomUnitsErrors: 'H\u00E1 um espa\u00E7o de trabalho com erros de unidades personalizadas',
            theresAProblemWithAWorkspaceMember: 'H\u00E1 um problema com um membro do espa\u00E7o de trabalho',
            theresAProblemWithAWorkspaceQBOExport: 'Houve um problema com a configura\u00E7\u00E3o de exporta\u00E7\u00E3o da conex\u00E3o do espa\u00E7o de trabalho.',
            theresAProblemWithAContactMethod: 'H\u00E1 um problema com um m\u00E9todo de contato',
            aContactMethodRequiresVerification: 'Um m\u00E9todo de contato requer verifica\u00E7\u00E3o',
            theresAProblemWithAPaymentMethod: 'H\u00E1 um problema com um m\u00E9todo de pagamento',
            theresAProblemWithAWorkspace: 'H\u00E1 um problema com um espa\u00E7o de trabalho',
            theresAProblemWithYourReimbursementAccount: 'H\u00E1 um problema com sua conta de reembolso',
            theresABillingProblemWithYourSubscription: 'H\u00E1 um problema de cobran\u00E7a com sua assinatura',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Sua assinatura foi renovada com sucesso',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Houve um problema durante a sincroniza\u00E7\u00E3o da conex\u00E3o do espa\u00E7o de trabalho',
            theresAProblemWithYourWallet: 'H\u00E1 um problema com sua carteira',
            theresAProblemWithYourWalletTerms: 'H\u00E1 um problema com os termos da sua carteira',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fa\u00E7a um test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Viagens e despesas, na velocidade do chat',
        subtitle: 'O novo Expensify tem a mesma \u00F3tima automa\u00E7\u00E3o, mas agora com uma colabora\u00E7\u00E3o incr\u00EDvel:',
        confirmText: 'Vamos l\u00E1!',
        features: {
            chat: '<strong>Converse diretamente em qualquer despesa</strong>, relat\u00F3rio ou espa\u00E7o de trabalho',
            scanReceipt: '<strong>Escaneie recibos</strong> e receba o reembolso',
            crossPlatform: 'Fa\u00E7a <strong>tudo</strong> do seu telefone ou navegador',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Come\u00E7ar',
            part2: 'aqui!',
        },
        saveSearchTooltip: {
            part1: 'Renomeie suas buscas salvas',
            part2: 'aqui!',
        },
        bottomNavInboxTooltip: {
            part1: 'Verificar o qu\u00EA?',
            part2: 'precisa da sua aten\u00E7\u00E3o',
            part3: 'e',
            part4: 'conversar sobre despesas.',
        },
        workspaceChatTooltip: {
            part1: 'Converse com',
            part2: 'aprovadores',
        },
        globalCreateTooltip: {
            part1: 'Criar despesas',
            part2: ', come\u00E7ar a conversar,',
            part3: 'e mais.',
            part4: 'Experimente!',
        },
        GBRRBRChat: {
            part1: 'Voc\u00EA ver\u00E1 \uD83D\uDFE2 em',
            part2: 'a\u00E7\u00F5es a serem tomadas',
            part3: ',\ne \uD83D\uDD34 em',
            part4: 'itens para revisar.',
        },
        accountSwitcher: {
            part1: 'Acesse seu',
            part2: 'Contas Copilot',
            part3: 'aqui',
        },
        expenseReportsFilter: {
            part1: 'Bem-vindo! Encontre todos os seus',
            part2: 'relat\u00F3rios da empresa',
            part3: 'aqui.',
        },
        scanTestTooltip: {
            part1: 'Quer ver como o Scan funciona?',
            part2: 'Experimente um recibo de teste!',
            part3: 'Escolha nosso(a)',
            part4: 'gerente de teste',
            part5: 'para experimentar!',
            part6: 'Agora,',
            part7: 'envie sua despesa',
            part8: 'e veja a m\u00E1gica acontecer!',
            tryItOut: 'Experimente',
            noThanks: 'N\u00E3o, obrigado.',
        },
        outstandingFilter: {
            part1: 'Filtrar por despesas\nque',
            part2: 'precisa de aprova\u00E7\u00E3o',
        },
        scanTestDriveTooltip: {
            part1: 'Enviar este recibo para',
            part2: 'complete o test drive!',
        },
    },
    discardChangesConfirmation: {
        title: 'Descartar altera\u00E7\u00F5es?',
        body: 'Tem certeza de que deseja descartar as altera\u00E7\u00F5es feitas?',
        confirmText: 'Descartar altera\u00E7\u00F5es',
    },
    scheduledCall: {
        book: {
            title: 'Agendar chamada',
            description: 'Encontre um hor\u00E1rio que funcione para voc\u00EA.',
            slots: 'Hor\u00E1rios dispon\u00EDveis para',
        },
        confirmation: {
            title: 'Confirmar chamada',
            description:
                'Certifique-se de que os detalhes abaixo est\u00E3o corretos para voc\u00EA. Assim que voc\u00EA confirmar a chamada, enviaremos um convite com mais informa\u00E7\u00F5es.',
            setupSpecialist: 'Seu especialista em configura\u00E7\u00E3o',
            meetingLength: 'Dura\u00E7\u00E3o da reuni\u00E3o',
            dateTime: 'Data e hora',
            minutes: '30 minutos',
        },
        callScheduled: 'Chamada agendada',
    },
    autoSubmitModal: {
        title: 'Tudo claro e enviado!',
        description: 'Todos os avisos e viola\u00E7\u00F5es foram resolvidos, ent\u00E3o:',
        submittedExpensesTitle: 'Estas despesas foram enviadas',
        submittedExpensesDescription: 'Essas despesas foram enviadas para o seu aprovador, mas ainda podem ser editadas at\u00E9 serem aprovadas.',
        pendingExpensesTitle: 'Despesas pendentes foram movidas',
        pendingExpensesDescription: 'Quaisquer despesas pendentes do cart\u00E3o foram movidas para um relat\u00F3rio separado at\u00E9 serem registradas.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Fa\u00E7a um test drive de 2 minutos',
        },
        modal: {
            title: 'Leve-nos para um test drive',
            description: 'Fa\u00E7a um r\u00E1pido tour pelo produto para se atualizar rapidamente. Sem paradas necess\u00E1rias!',
            confirmText: 'Iniciar test drive',
            helpText: 'Pular',
            employee: {
                description:
                    '<muted-text>Obtenha <strong>3 meses gr\u00E1tis de Expensify</strong> para sua equipe! Basta inserir o e-mail do seu chefe abaixo e enviar uma despesa de teste para ele.</muted-text>',
                email: 'Digite o e-mail do seu chefe',
                error: 'Esse membro possui um espa\u00E7o de trabalho, por favor insira um novo membro para testar.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Voc\u00EA est\u00E1 atualmente testando o Expensify',
            readyForTheRealThing: 'Pronto para o desafio real?',
            getStarted: 'Come\u00E7ar',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} convidou voc\u00EA para experimentar o Expensify\nEi! Acabei de conseguir *3 meses gr\u00E1tis* para testarmos o Expensify, a maneira mais r\u00E1pida de fazer despesas.\n\nAqui est\u00E1 um *recibo de teste* para mostrar como funciona:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
