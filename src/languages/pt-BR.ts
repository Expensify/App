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
import type {OnboardingCompanySize, OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
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
    BankAccountLastFourParams,
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
    BusinessBankAccountParams,
    BusinessTaxIDParams,
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
    ContactMethodParams,
    ContactMethodsRouteParams,
    CreateExpensesParams,
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
    SubmittedToVacationDelegateParams,
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
    VacationDelegateParams,
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
        count: 'Contagem',
        cancel: 'Cancelar',
        dismiss: 'Dispensar',
        yes: 'Sim',
        no: 'Não',
        ok: 'OK',
        notNow: 'Agora não',
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
        reports: 'Relatórios',
        find: 'Encontrar',
        searchWithThreeDots: 'Pesquisar...',
        next: 'Próximo',
        previous: 'Anterior',
        goBack: 'Voltar',
        create: 'Criar',
        add: 'Adicionar',
        resend: 'Reenviar',
        save: 'Salvar',
        select: 'Selecionar',
        deselect: 'Desmarcar',
        selectMultiple: 'Selecionar múltiplos',
        saveChanges: 'Salvar alterações',
        submit: 'Enviar',
        rotate: 'Girar',
        zoom: 'Zoom',
        password: 'Senha',
        magicCode: 'Magic code',
        twoFactorCode: 'Código de dois fatores',
        workspaces: 'Workspaces',
        inbox: 'Caixa de entrada',
        success: 'Sucesso',
        group: 'Grupo',
        profile: 'Perfil',
        referral: 'Indicação',
        payments: 'Pagamentos',
        approvals: 'Aprovações',
        wallet: 'Carteira',
        preferences: 'Preferências',
        view: 'Visualizar',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Não',
        signIn: 'Entrar',
        signInWithGoogle: 'Entrar com Google',
        signInWithApple: 'Entrar com Apple',
        signInWith: 'Entrar com',
        continue: 'Continuar',
        firstName: 'Primeiro nome',
        lastName: 'Sobrenome',
        scanning: 'Escaneando',
        addCardTermsOfService: 'Termos de Serviço da Expensify',
        perPerson: 'por pessoa',
        phone: 'Telefone',
        phoneNumber: 'Número de telefone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'e',
        or: 'ou',
        details: 'Detalhes',
        privacy: 'Privacidade',
        privacyPolicy: 'Política de Privacidade',
        hidden: 'Hidden',
        visible: 'Visível',
        delete: 'Excluir',
        archived: 'arquivado',
        contacts: 'Contatos',
        recents: 'Recentes',
        close: 'Fechar',
        download: 'Baixar',
        downloading: 'Baixando',
        uploading: 'Carregando',
        pin: 'Pin',
        unPin: 'Desafixar',
        back: 'Voltar',
        saveAndContinue: 'Salvar e continuar',
        settings: 'Configurações',
        termsOfService: 'Termos de Serviço',
        members: 'Membros',
        invite: 'Convidar',
        here: 'aqui',
        date: 'Data',
        dob: 'Data de nascimento',
        currentYear: 'Ano atual',
        currentMonth: 'Mês atual',
        ssnLast4: 'Últimos 4 dígitos do SSN',
        ssnFull9: 'Número completo de 9 dígitos do SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Endereço linha ${lineNumber}`,
        personalAddress: 'Endereço pessoal',
        companyAddress: 'Endereço da empresa',
        noPO: 'Sem caixas postais ou endereços de entrega, por favor.',
        city: 'Cidade',
        state: 'Estado',
        streetAddress: 'Endereço residencial',
        stateOrProvince: 'Estado / Província',
        country: 'País',
        zip: 'Código postal',
        zipPostCode: 'CEP / Código Postal',
        whatThis: 'O que é isso?',
        iAcceptThe: 'Eu aceito o',
        remove: 'Remover',
        admin: 'Administração',
        owner: 'Proprietário',
        dateFormat: 'YYYY-MM-DD',
        send: 'Enviar',
        na: 'N/A',
        noResultsFound: 'Nenhum resultado encontrado',
        noResultsFoundMatching: ({searchString}: {searchString: string}) => `Nenhum resultado encontrado correspondente a "${searchString}"`,
        recentDestinations: 'Destinos recentes',
        timePrefix: 'É',
        conjunctionFor: 'para',
        todayAt: 'Hoje às',
        tomorrowAt: 'Amanhã às',
        yesterdayAt: 'Ontem às',
        conjunctionAt: 'em',
        conjunctionTo: 'para',
        genericErrorMessage: 'Ops... algo deu errado e sua solicitação não pôde ser concluída. Por favor, tente novamente mais tarde.',
        percentage: 'Porcentagem',
        error: {
            invalidAmount: 'Quantia inválida',
            acceptTerms: 'Você deve aceitar os Termos de Serviço para continuar',
            phoneNumber: `Por favor, insira um número de telefone válido, com o código do país (ex.: ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Este campo é obrigatório',
            requestModified: 'Esta solicitação está sendo modificada por outro membro',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite de caracteres excedido (${length}/${limit})`,
            dateInvalid: 'Por favor, selecione uma data válida',
            invalidDateShouldBeFuture: 'Por favor, escolha hoje ou uma data futura',
            invalidTimeShouldBeFuture: 'Por favor, escolha um horário pelo menos um minuto à frente.',
            invalidCharacter: 'Caractere inválido',
            enterMerchant: 'Digite o nome de um comerciante',
            enterAmount: 'Insira um valor',
            missingMerchantName: 'Nome do comerciante ausente',
            missingAmount: 'Quantia faltante',
            missingDate: 'Data ausente',
            enterDate: 'Insira uma data',
            invalidTimeRange: 'Por favor, insira um horário usando o formato de 12 horas (por exemplo, 14:30).',
            pleaseCompleteForm: 'Por favor, complete o formulário acima para continuar.',
            pleaseSelectOne: 'Por favor, selecione uma opção acima',
            invalidRateError: 'Por favor, insira uma taxa válida',
            lowRateError: 'A taxa deve ser maior que 0',
            email: 'Por favor, insira um endereço de e-mail válido.',
            login: 'Ocorreu um erro ao fazer login. Por favor, tente novamente.',
        },
        comma: 'vírgula',
        semicolon: 'semicolon',
        please: 'Por favor',
        contactUs: 'entre em contato conosco',
        pleaseEnterEmailOrPhoneNumber: 'Por favor, insira um e-mail ou número de telefone',
        fixTheErrors: 'corrigir os erros',
        inTheFormBeforeContinuing: 'no formulário antes de continuar',
        confirm: 'Confirmar',
        reset: 'Redefinir',
        done: 'Concluído',
        more: 'Mais',
        debitCard: 'Cartão de débito',
        bankAccount: 'Conta bancária',
        personalBankAccount: 'Conta bancária pessoal',
        businessBankAccount: 'Conta bancária empresarial',
        join: 'Participar',
        leave: 'Sair',
        decline: 'Recusar',
        transferBalance: 'Transferir saldo',
        cantFindAddress: 'Não consegue encontrar seu endereço?',
        enterManually: 'Insira manualmente',
        message: 'Mensagem',
        leaveThread: 'Sair do tópico',
        you: 'Você',
        youAfterPreposition: 'você',
        your: 'seu/sua/seus/suas (dependendo do contexto)',
        conciergeHelp: 'Por favor, entre em contato com o Concierge para obter ajuda.',
        youAppearToBeOffline: 'Você parece estar offline.',
        thisFeatureRequiresInternet: 'Este recurso requer uma conexão ativa com a internet.',
        attachmentWillBeAvailableOnceBackOnline: 'O anexo ficará disponível assim que estiver online novamente.',
        errorOccurredWhileTryingToPlayVideo: 'Ocorreu um erro ao tentar reproduzir este vídeo.',
        areYouSure: 'Você tem certeza?',
        verify: 'Verificar',
        yesContinue: 'Sim, continue.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Descrição',
        title: 'Título',
        assignee: 'Cessionário',
        createdBy: 'Criado por',
        with: 'com',
        shareCode: 'Compartilhar código',
        share: 'Compartilhar',
        per: 'por',
        mi: 'milha',
        km: 'quilômetro',
        copied: 'Copiado!',
        someone: 'Alguém',
        total: 'Total',
        edit: 'Editar',
        letsDoThis: `Vamos fazer isso!`,
        letsStart: `Vamos começar`,
        showMore: 'Mostrar mais',
        merchant: 'Comerciante',
        category: 'Categoria',
        report: 'Relatório',
        billable: 'Faturável',
        nonBillable: 'Não faturável',
        tag: 'Tag',
        receipt: 'Recibo',
        verified: 'Verificado',
        replace: 'Substituir',
        distance: 'Distância',
        mile: 'milha',
        miles: 'milhas',
        kilometer: 'quilômetro',
        kilometers: 'quilômetros',
        recent: 'Recente',
        all: 'Todos',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Selecione uma moeda',
        card: 'Cartão',
        whyDoWeAskForThis: 'Por que pedimos isso?',
        required: 'Obrigatório',
        showing: 'Mostrando',
        of: 'of',
        default: 'Padrão',
        update: 'Atualizar',
        member: 'Membro',
        auditor: 'Auditor',
        role: 'Função',
        currency: 'Moeda',
        rate: 'Avaliar',
        emptyLHN: {
            title: 'Woohoo! Tudo em dia.',
            subtitleText1: 'Encontre um chat usando o',
            subtitleText2: 'botão acima, ou crie algo usando o',
            subtitleText3: 'botão abaixo.',
        },
        businessName: 'Nome da empresa',
        clear: 'Limpar',
        type: 'Tipo',
        action: 'Ação',
        expenses: 'Despesas',
        tax: 'Imposto',
        shared: 'Compartilhado',
        drafts: 'Rascunhos',
        finished: 'Concluído',
        upgrade: 'Atualizar',
        downgradeWorkspace: 'Reduzir espaço de trabalho',
        companyID: 'ID da Empresa',
        userID: 'ID do Usuário',
        disable: 'Desativar',
        export: 'Exportar',
        basicExport: 'Exporta\u00E7\u00E3o b\u00E1sica',
        initialValue: 'Valor inicial',
        currentDate: 'Data atual',
        value: 'Valor',
        downloadFailedTitle: 'Falha no download',
        downloadFailedDescription: 'Não foi possível concluir o seu download. Por favor, tente novamente mais tarde.',
        filterLogs: 'Filtrar Logs',
        network: 'Network',
        reportID: 'ID do Relatório',
        longID: 'ID longo',
        bankAccounts: 'Contas bancárias',
        chooseFile: 'Escolher arquivo',
        dropTitle: 'Deixe ir',
        dropMessage: 'Solte seu arquivo aqui',
        ignore: 'Ignore',
        enabled: 'Ativado',
        disabled: 'Desativado',
        import: 'Importar',
        offlinePrompt: 'Você não pode realizar esta ação no momento.',
        outstanding: 'Excelente',
        chats: 'Chats',
        tasks: 'Tarefas',
        unread: 'Não lido',
        sent: 'Enviado',
        links: 'Links',
        days: 'dias',
        rename: 'Renomear',
        address: 'Endereço',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pular',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) => `Precisa de algo específico? Converse com seu gerente de conta, ${accountManagerDisplayName}.`,
        chatNow: 'Converse agora',
        workEmail: 'E-mail de trabalho',
        destination: 'Destino',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Validar',
        downloadAsPDF: 'Baixar como PDF',
        downloadAsCSV: 'Baixar como CSV',
        help: 'Ajuda',
        expenseReports: 'Relatórios de Despesas',
        rateOutOfPolicy: 'Taxa fora da política',
        reimbursable: 'Reembolsável',
        editYourProfile: 'Edite seu perfil',
        comments: 'Comentários',
        sharedIn: 'Compartilhado em',
        unreported: 'Não reportado',
        explore: 'Explorar',
        todo: 'A fazer',
        invoice: 'Fatura',
        expense: 'Despesa',
        chat: 'Bate-papo',
        task: 'Tarefa',
        trip: 'Viagem',
        apply: 'Aplicar',
        status: 'Status',
        on: 'Em',
        before: 'Antes',
        after: 'Depois',
        reschedule: 'Reagendar',
        general: 'Geral',
        workspacesTabTitle: 'Workspaces',
        getTheApp: 'Obtenha o aplicativo',
        scanReceiptsOnTheGo: 'Digitalize recibos com seu celular',
        headsUp: 'Atenção!',
    },
    supportalNoAccess: {
        title: 'Não tão rápido',
        description: 'Você não está autorizado a realizar esta ação quando o suporte estiver conectado.',
    },
    lockedAccount: {
        title: 'Conta Bloqueada',
        description: 'Você não tem permissão para concluir esta ação, pois esta conta foi bloqueada. Entre em contato com concierge@expensify.com para os próximos passos.',
    },
    location: {
        useCurrent: 'Usar localização atual',
        notFound: 'Não conseguimos encontrar sua localização. Por favor, tente novamente ou insira um endereço manualmente.',
        permissionDenied: 'Parece que você negou o acesso à sua localização.',
        please: 'Por favor',
        allowPermission: 'permitir acesso à localização nas configurações',
        tryAgain: 'e tente novamente.',
    },
    contact: {
        importContacts: 'Importar contatos',
        importContactsTitle: 'Importe seus contatos',
        importContactsText: 'Importe contatos do seu telefone para que suas pessoas favoritas estejam sempre a um toque de distância.',
        importContactsExplanation: 'para que suas pessoas favoritas estejam sempre a um toque de distância.',
        importContactsNativeText: 'Só mais um passo! Dê-nos o sinal verde para importar seus contatos.',
    },
    anonymousReportFooter: {
        logoTagline: 'Participe da discussão.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Acesso à câmera',
        expensifyDoesNotHaveAccessToCamera: 'O Expensify não pode tirar fotos sem acesso à sua câmera. Toque em configurações para atualizar as permissões.',
        attachmentError: 'Erro de anexo',
        errorWhileSelectingAttachment: 'Ocorreu um erro ao selecionar um anexo. Por favor, tente novamente.',
        errorWhileSelectingCorruptedAttachment: 'Ocorreu um erro ao selecionar um anexo corrompido. Por favor, tente outro arquivo.',
        takePhoto: 'Tirar foto',
        chooseFromGallery: 'Escolher da galeria',
        chooseDocument: 'Escolher arquivo',
        attachmentTooLarge: 'Anexo é muito grande',
        sizeExceeded: 'O tamanho do anexo é maior que o limite de 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `O tamanho do anexo é maior que o limite de ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anexo é muito pequeno',
        sizeNotMet: 'O tamanho do anexo deve ser maior que 240 bytes',
        wrongFileType: 'Tipo de arquivo inválido',
        notAllowedExtension: 'Este tipo de arquivo não é permitido. Por favor, tente um tipo de arquivo diferente.',
        folderNotAllowedMessage: 'Não é permitido fazer upload de uma pasta. Por favor, tente um arquivo diferente.',
        protectedPDFNotSupported: 'PDF protegido por senha não é suportado',
        attachmentImageResized: 'Esta imagem foi redimensionada para visualização. Baixe para resolução completa.',
        attachmentImageTooLarge: 'Esta imagem é muito grande para pré-visualizar antes de fazer o upload.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Você pode enviar até ${fileLimit} arquivos de uma vez.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Os arquivos excedem ${maxUploadSizeInMB} MB. Por favor, tente novamente.`,
    },
    dropzone: {
        addAttachments: 'Adicionar anexos',
        scanReceipts: 'Escanear recibos',
        replaceReceipt: 'Substituir recibo',
    },
    filePicker: {
        fileError: 'Erro de arquivo',
        errorWhileSelectingFile: 'Ocorreu um erro ao selecionar um arquivo. Por favor, tente novamente.',
    },
    connectionComplete: {
        title: 'Conexão concluída',
        supportingText: 'Você pode fechar esta janela e voltar para o aplicativo Expensify.',
    },
    avatarCropModal: {
        title: 'Editar foto',
        description: 'Arraste, amplie e gire sua imagem como quiser.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nenhuma extensão encontrada para o tipo mime',
        problemGettingImageYouPasted: 'Houve um problema ao obter a imagem que você colou.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `O comprimento máximo do comentário é de ${formattedMaxLength} caracteres.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `O comprimento máximo do título da tarefa é de ${formattedMaxLength} caracteres.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Atualizar aplicativo',
        updatePrompt: 'Uma nova versão deste aplicativo está disponível.  \nAtualize agora ou reinicie o aplicativo mais tarde para baixar as últimas alterações.',
    },
    deeplinkWrapper: {
        launching: 'Lançando Expensify',
        expired: 'Sua sessão expirou.',
        signIn: 'Por favor, faça login novamente.',
        redirectedToDesktopApp: 'Redirecionamos você para o aplicativo de desktop.',
        youCanAlso: 'Você também pode',
        openLinkInBrowser: 'abra este link no seu navegador',
        loggedInAs: ({email}: LoggedInAsParams) => `Você está conectado como ${email}. Clique em "Abrir link" no prompt para entrar no aplicativo de desktop com esta conta.`,
        doNotSeePrompt: 'Não consegue ver o prompt?',
        tryAgain: 'Tente novamente',
        or: ', ou',
        continueInWeb: 'continuar para o aplicativo web',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra, você está conectado!',
        successfulSignInDescription: 'Volte para a sua aba original para continuar.',
        title: 'Aqui está o seu código mágico',
        description: 'Por favor, insira o código do dispositivo onde ele foi originalmente solicitado.',
        doNotShare: 'Não compartilhe seu código com ninguém. A Expensify nunca irá pedi-lo!',
        or: ', ou',
        signInHere: 'basta entrar aqui',
        expiredCodeTitle: 'Código mágico expirado',
        expiredCodeDescription: 'Volte para o dispositivo original e solicite um novo código.',
        successfulNewCodeRequest: 'Código solicitado. Por favor, verifique seu dispositivo.',
        tfaRequiredTitle: 'Autenticação de dois fatores\nnecessária',
        tfaRequiredDescription: 'Por favor, insira o código de autenticação de dois fatores onde você está tentando fazer login.',
        requestOneHere: 'solicite um aqui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pago por',
        whatsItFor: 'Para que serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, e-mail ou número de telefone',
        findMember: 'Encontrar um membro',
        searchForSomeone: 'Procurar por alguém',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Envie uma despesa, indique seu chefe',
            subtitleText: 'Quer que seu chefe use o Expensify também? Basta enviar uma despesa para ele e nós cuidaremos do resto.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Agendar uma chamada',
    },
    hello: 'Olá',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Comece abaixo.',
        anotherLoginPageIsOpen: 'Outra página de login está aberta.',
        anotherLoginPageIsOpenExplanation: 'Você abriu a página de login em uma aba separada. Por favor, faça login a partir dessa aba.',
        welcome: 'Bem-vindo!',
        welcomeWithoutExclamation: 'Bem-vindo',
        phrase2: 'Dinheiro fala. E agora que bate-papo e pagamentos estão no mesmo lugar, também é fácil.',
        phrase3: 'Seus pagamentos chegam até você tão rápido quanto você consegue se expressar.',
        enterPassword: 'Por favor, insira sua senha',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, é sempre ótimo ver um novo rosto por aqui!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Por favor, insira o código mágico enviado para ${login}. Ele deve chegar dentro de um ou dois minutos.`,
    },
    login: {
        hero: {
            header: 'Viagens e despesas, na velocidade do chat',
            body: 'Bem-vindo à próxima geração do Expensify, onde suas viagens e despesas se movem mais rapidamente com a ajuda de um chat contextual em tempo real.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Você já está conectado como ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Não quer entrar com ${provider}?`,
        continueWithMyCurrentSession: 'Continuar com minha sessão atual',
        redirectToDesktopMessage: 'Vamos redirecioná-lo para o aplicativo de desktop assim que você terminar de fazer login.',
        signInAgreementMessage: 'Ao fazer login, você concorda com o/a/as/os',
        termsOfService: 'Termos de Serviço',
        privacy: 'Privacidade',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continue fazendo login com single sign-on:',
        orContinueWithMagicCode: 'Você também pode entrar com um código mágico',
        useSingleSignOn: 'Usar login único',
        useMagicCode: 'Use o código mágico',
        launching: 'Lançando...',
        oneMoment: 'Um momento enquanto redirecionamos você para o portal de login único da sua empresa.',
    },
    reportActionCompose: {
        dropToUpload: 'Solte para enviar',
        sendAttachment: 'Enviar anexo',
        addAttachment: 'Adicionar anexo',
        writeSomething: 'Escreva algo...',
        blockedFromConcierge: 'Comunicação está bloqueada',
        fileUploadFailed: 'Falha no upload. Arquivo não é suportado.',
        localTime: ({user, time}: LocalTimeParams) => `São ${time} para ${user}`,
        edited: '(editado)',
        emoji: 'Emoji',
        collapse: 'Recolher',
        expand: 'Expandir',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copiar para a área de transferência',
        copied: 'Copiado!',
        copyLink: 'Copiar link',
        copyURLToClipboard: 'Copiar URL para a área de transferência',
        copyEmailToClipboard: 'Copiar e-mail para a área de transferência',
        markAsUnread: 'Marcar como não lida',
        markAsRead: 'Marcar como lido',
        editAction: ({action}: EditActionParams) => `Editar ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar'}`,
        deleteAction: ({action}: DeleteActionParams) => `Excluir ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) =>
            `Tem certeza de que deseja excluir este ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar'}?`,
        onlyVisible: 'Apenas visível para',
        replyInThread: 'Responder no tópico',
        joinThread: 'Participar do tópico',
        leaveThread: 'Sair do tópico',
        copyOnyxData: 'Copiar dados Onyx',
        flagAsOffensive: 'Marcar como ofensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Adicionar reação',
        reactedWith: 'reagiu com',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Você perdeu a festa em',
        beginningOfArchivedRoomPartTwo: ', não há nada para ver aqui.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) => `Este chat é com todos os membros do Expensify no domínio ${domainRoom}.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Use-o para conversar com colegas, compartilhar dicas e fazer perguntas.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Este chat é com',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) => ` ${workspaceName} `,
        beginningOfChatHistoryAdminRoomPartTwo: 'Use-o para conversar sobre a configuração do espaço de trabalho e mais.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) => `Este chat é com todos em ${workspaceName}.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: `Use isso para os anúncios mais importantes.`,
        beginningOfChatHistoryUserRoomPartOne: 'Esta sala de bate-papo é para qualquer coisa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: `Este chat é para faturas entre`,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use o botão + para enviar uma fatura.`,
        beginningOfChatHistory: 'Este chat é com',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Aqui é onde',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'enviará despesas para',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usar o botão +.',
        beginningOfChatHistorySelfDM: 'Este é o seu espaço pessoal. Use-o para anotações, tarefas, rascunhos e lembretes.',
        beginningOfChatHistorySystemDM: 'Bem-vindo! Vamos configurá-lo.',
        chatWithAccountManager: 'Converse com o seu gerente de conta aqui',
        sayHello: 'Diga olá!',
        yourSpace: 'Seu espaço',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bem-vindo(a) ao ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Use o botão + para ${additionalText} uma despesa.`,
        askConcierge: 'Faça perguntas e receba suporte em tempo real 24/7.',
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
    adminOnlyCanPost: 'Apenas administradores podem enviar mensagens nesta sala.',
    reportAction: {
        asCopilot: 'como copiloto para',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notificar todos nesta conversa',
    },
    newMessages: 'Novas mensagens',
    youHaveBeenBanned: 'Nota: Você foi banido de conversar neste canal.',
    reportTypingIndicator: {
        isTyping: 'está digitando...',
        areTyping: 'estão digitando...',
        multipleMembers: 'Múltiplos membros',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Esta sala de bate-papo foi arquivada.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Este chat não está mais ativo porque ${displayName} encerrou sua conta.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Este chat não está mais ativo porque ${oldDisplayName} uniu sua conta com ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Este chat não está mais ativo porque <strong>você</strong> não é mais um membro do espaço de trabalho ${policyName}.`
                : `Este chat não está mais ativo porque ${displayName} não é mais um membro do espaço de trabalho ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat não está mais ativo porque ${policyName} não é mais um espaço de trabalho ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Este chat não está mais ativo porque ${policyName} não é mais um espaço de trabalho ativo.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Esta reserva está arquivada.',
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
        buttonMySettings: 'Minhas configurações',
        fabNewChat: 'Iniciar chat',
        fabNewChatExplained: 'Iniciar chat (Ação flutuante)',
        chatPinned: 'Conversa fixada',
        draftedMessage: 'Mensagem rascunhada',
        listOfChatMessages: 'Lista de mensagens de chat',
        listOfChats: 'Lista de conversas',
        saveTheWorld: 'Salve o mundo',
        tooltip: 'Comece aqui!',
        redirectToExpensifyClassicModal: {
            title: 'Em breve',
            description: 'Estamos ajustando mais alguns detalhes do Novo Expensify para acomodar sua configuração específica. Enquanto isso, acesse o Expensify Clássico.',
        },
    },
    allSettingsScreen: {
        subscription: 'Assinatura',
        domains: 'Domínios',
    },
    tabSelector: {
        chat: 'Bate-papo',
        room: 'Sala',
        distance: 'Distância',
        manual: 'Manual',
        scan: 'Digitalizar',
    },
    spreadsheet: {
        upload: 'Carregar uma planilha',
        dragAndDrop: 'Arraste e solte sua planilha aqui ou escolha um arquivo abaixo. Formatos suportados: .csv, .txt, .xls e .xlsx.',
        chooseSpreadsheet: 'Selecione um arquivo de planilha para importar. Formatos suportados: .csv, .txt, .xls e .xlsx.',
        fileContainsHeader: 'O arquivo contém cabeçalhos de coluna',
        column: ({name}: SpreadSheetColumnParams) => `Coluna ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ops! Um campo obrigatório ("${fieldName}") não foi mapeado. Por favor, revise e tente novamente.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Ops! Você mapeou um único campo ("${fieldName}") para várias colunas. Por favor, revise e tente novamente.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ops! O campo ("${fieldName}") contém um ou mais valores vazios. Por favor, revise e tente novamente.`,
        importSuccessfulTitle: 'Importação bem-sucedida',
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
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} tags foram adicionados.` : '1 tag foi adicionado.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags de múltiplos níveis foram adicionadas.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} taxas de diárias foram adicionadas.` : '1 taxa de diária foi adicionada.',
        importFailedTitle: 'Importação falhou',
        importFailedDescription:
            'Por favor, certifique-se de que todos os campos estão preenchidos corretamente e tente novamente. Se o problema persistir, entre em contato com o Concierge.',
        importDescription: 'Escolha quais campos mapear da sua planilha clicando no menu suspenso ao lado de cada coluna importada abaixo.',
        sizeNotMet: 'O tamanho do arquivo deve ser maior que 0 bytes',
        invalidFileMessage:
            'O arquivo que você enviou está vazio ou contém dados inválidos. Por favor, certifique-se de que o arquivo está formatado corretamente e contém as informações necessárias antes de enviá-lo novamente.',
        importSpreadsheet: 'Importar planilha',
        downloadCSV: 'Baixar CSV',
    },
    receipt: {
        upload: 'Fazer upload de recibo',
        dragReceiptBeforeEmail: 'Arraste um recibo para esta página, encaminhe um recibo para',
        dragReceiptAfterEmail: 'ou escolha um arquivo para enviar abaixo.',
        chooseReceipt: 'Escolha um recibo para enviar ou encaminhe um recibo para',
        takePhoto: 'Tire uma foto',
        cameraAccess: 'O acesso à câmera é necessário para tirar fotos dos recibos.',
        deniedCameraAccess: 'O acesso à câmera ainda não foi concedido, por favor siga',
        deniedCameraAccessInstructions: 'essas instruções',
        cameraErrorTitle: 'Erro de câmera',
        cameraErrorMessage: 'Ocorreu um erro ao tirar a foto. Por favor, tente novamente.',
        locationAccessTitle: 'Permitir acesso à localização',
        locationAccessMessage: 'O acesso à localização nos ajuda a manter seu fuso horário e moeda precisos onde quer que você vá.',
        locationErrorTitle: 'Permitir acesso à localização',
        locationErrorMessage: 'O acesso à localização nos ajuda a manter seu fuso horário e moeda precisos onde quer que você vá.',
        allowLocationFromSetting: `O acesso à localização nos ajuda a manter seu fuso horário e moeda precisos onde quer que você vá. Por favor, permita o acesso à localização nas configurações de permissão do seu dispositivo.`,
        dropTitle: 'Deixe ir',
        dropMessage: 'Solte seu arquivo aqui',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'obturador',
        gallery: 'galeria',
        deleteReceipt: 'Excluir recibo',
        deleteConfirmation: 'Tem certeza de que deseja excluir este recibo?',
        addReceipt: 'Adicionar recibo',
        scanFailed: 'O recibo não pôde ser escaneado, pois está faltando o comerciante, a data ou o valor.',
    },
    quickAction: {
        scanReceipt: 'Escanear recibo',
        recordDistance: 'Rastrear distância',
        requestMoney: 'Criar despesa',
        perDiem: 'Criar per diem',
        splitBill: 'Dividir despesa',
        splitScan: 'Dividir recibo',
        splitDistance: 'Dividir distância',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'alguém'}`,
        assignTask: 'Atribuir tarefa',
        header: 'Ação rápida',
        noLongerHaveReportAccess: 'Você não tem mais acesso ao seu destino de ação rápida anterior. Escolha um novo abaixo.',
        updateDestination: 'Atualizar destino',
        createReport: 'Criar relatório',
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
        card: 'Cartão',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir despesa',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        addSplit: 'Adicionar divisão',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total é ${amount} maior que a despesa original.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `O valor total é ${amount} a menos que a despesa original.`,
        splitExpenseZeroAmount: 'Por favor, insira um valor válido antes de continuar.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Editar ${amount} para ${merchant}`,
        removeSplit: 'Remover divisão',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pagar ${name ?? 'alguém'}`,
        expense: 'Despesa',
        categorize: 'Categorizar',
        share: 'Compartilhar',
        participants: 'Participantes',
        createExpense: 'Criar despesa',
        trackDistance: 'Rastrear distância',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Criar ${expensesNumber} despesas`,
        addExpense: 'Adicionar despesa',
        chooseRecipient: 'Escolher destinatário',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Criar despesa de ${amount}`,
        confirmDetails: 'Confirmar detalhes',
        pay: 'Pagar',
        cancelPayment: 'Cancelar pagamento',
        cancelPaymentConfirmation: 'Tem certeza de que deseja cancelar este pagamento?',
        viewDetails: 'Ver detalhes',
        pending: 'Pendente',
        canceled: 'Cancelado',
        posted: 'Publicado',
        deleteReceipt: 'Excluir recibo',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `excluiu uma despesa neste relatório, ${merchant} - ${amount}`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `moveu uma despesa${reportName ? `de ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `moveu esta despesa${reportName ? `para <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: 'movei esta despesa para o seu espaço pessoal',
        pendingMatchWithCreditCard: 'Recibo pendente de correspondência com transação do cartão',
        pendingMatch: 'Partida pendente',
        pendingMatchWithCreditCardDescription: 'Recibo pendente de correspondência com transação do cartão. Marcar como dinheiro para cancelar.',
        markAsCash: 'Marcar como dinheiro',
        routePending: 'Rota pendente...',
        receiptScanning: () => ({
            one: 'Escaneando recibo...',
            other: 'Digitalização de recibos...',
        }),
        scanMultipleReceipts: 'Digitalizar vários recibos',
        scanMultipleReceiptsDescription: 'Tire fotos de todos os seus recibos de uma vez, depois confirme os detalhes você mesmo ou deixe o SmartScan cuidar disso.',
        receiptScanInProgress: 'Digitalização de recibo em andamento',
        receiptScanInProgressDescription: 'Digitalização do recibo em andamento. Verifique mais tarde ou insira os detalhes agora.',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Despesas duplicadas potenciais identificadas. Revise as duplicatas para permitir o envio.'
                : 'Despesas duplicadas potenciais identificadas. Revise os duplicados para permitir a aprovação.',
        receiptIssuesFound: () => ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }),
        fieldPending: 'Pendente...',
        defaultRate: 'Taxa padrão',
        receiptMissingDetails: 'Recibo faltando detalhes',
        missingAmount: 'Quantia faltante',
        missingMerchant: 'Comerciante ausente',
        receiptStatusTitle: 'Escaneando…',
        receiptStatusText: 'Somente você pode ver este recibo enquanto ele está sendo escaneado. Verifique mais tarde ou insira os detalhes agora.',
        receiptScanningFailed: 'A digitalização do recibo falhou. Por favor, insira os detalhes manualmente.',
        transactionPendingDescription: 'Transação pendente. Pode levar alguns dias para ser registrada.',
        companyInfo: 'Informações da empresa',
        companyInfoDescription: 'Precisamos de mais alguns detalhes antes que você possa enviar sua primeira fatura.',
        yourCompanyName: 'Nome da sua empresa',
        yourCompanyWebsite: 'O site da sua empresa',
        yourCompanyWebsiteNote: 'Se você não tiver um site, pode fornecer o perfil da sua empresa no LinkedIn ou nas redes sociais.',
        invalidDomainError: 'Você inseriu um domínio inválido. Para continuar, insira um domínio válido.',
        publicDomainError: 'Você entrou em um domínio público. Para continuar, por favor, insira um domínio privado.',
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
        deleteReport: 'Excluir relatório',
        deleteReportConfirmation: 'Tem certeza de que deseja excluir este relatório?',
        settledExpensify: 'Pago',
        done: 'Concluído',
        settledElsewhere: 'Pago em outro lugar',
        individual: 'Individual',
        business: 'Negócio',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pague ${formattedAmount} com Expensify` : `Pague com Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como indivíduo` : `Pagar com conta pessoal`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} com carteira` : `Pagar com carteira`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pagar ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pagar ${formattedAmount} como empresa` : `Pagar com conta empresarial`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Marcar ${formattedAmount} como pago` : `Marcar como pago`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Pago ${amount} com conta pessoal ${last4Digits}` : `Pago com conta pessoal`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `Pago ${amount} com conta empresarial ${last4Digits}` : `Pago com conta empresarial`),
        payWithPolicy: ({formattedAmount, policyName}: SettleExpensifyCardParams & {policyName: string}) =>
            formattedAmount ? `Pagar ${formattedAmount} via ${policyName}` : `Pagar via ${policyName}`,
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => `Pago ${amount} com conta bancária ${last4Digits}.`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Conta pessoal • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Conta empresarial • ${lastFour}`,
        nextStep: 'Próximos passos',
        finished: 'Concluído',
        sendInvoice: ({amount}: RequestAmountParams) => `Enviar fatura de ${amount}`,
        submitAmount: ({amount}: RequestAmountParams) => `Enviar ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `para ${comment}` : ''}`,
        submitted: `enviado`,
        automaticallySubmitted: `enviado via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">adiar envios</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `rastreamento ${formattedAmount}${comment ? `para ${comment}` : ''}`,
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
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `pago ${amount}. Adicione uma conta bancária para receber seu pagamento.`,
        automaticallyApproved: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `aprovado ${amount}`,
        approvedMessage: `aprovado`,
        unapproved: `não aprovado`,
        automaticallyForwarded: `aprovado via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        forwarded: `aprovado`,
        rejectedThisReport: 'rejeitou este relatório',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `começou a acertar as contas. O pagamento está em espera até que ${submitterDisplayName} adicione uma conta bancária.`,
        adminCanceledRequest: ({manager}: AdminCanceledRequestParams) => `${manager ? `${manager}: ` : ''} cancelou o pagamento`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `cancelou o pagamento de ${amount}, porque ${submitterDisplayName} não ativou sua Expensify Wallet dentro de 30 dias`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} adicionou uma conta bancária. O pagamento de ${amount} foi realizado.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marcado como pago`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}pago com carteira`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''} pagou com Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">regras do workspace</a>`,
        noReimbursableExpenses: 'Este relatório possui um valor inválido',
        pendingConversionMessage: 'O total será atualizado quando você estiver online novamente.',
        changedTheExpense: 'alterou a despesa',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `o ${valueName} para ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `defina o ${translatedChangedField} para ${newMerchant}, o que definiu o valor para ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `o ${valueName} (anteriormente ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `o ${valueName} para ${newValueToDisplay} (anteriormente ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `alterou o ${translatedChangedField} para ${newMerchant} (anteriormente ${oldMerchant}), o que atualizou o valor para ${newAmountToDisplay} (anteriormente ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `para ${comment}` : 'despesa'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Relatório de Fatura nº ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} enviado${comment ? `para ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `moveu a despesa do espaço pessoal para ${workspaceName ?? `conversar com ${reportName}`}`,
        movedToPersonalSpace: 'movido despesa para o espaço pessoal',
        tagSelection: 'Selecione uma tag para organizar melhor seus gastos.',
        categorySelection: 'Selecione uma categoria para organizar melhor seus gastos.',
        error: {
            invalidCategoryLength: 'O nome da categoria excede 255 caracteres. Por favor, reduza-o ou escolha uma categoria diferente.',
            invalidTagLength: 'O nome da tag excede 255 caracteres. Por favor, reduza-o ou escolha uma tag diferente.',
            invalidAmount: 'Por favor, insira um valor válido antes de continuar.',
            invalidIntegerAmount: 'Por favor, insira um valor em dólares inteiros antes de continuar.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `O valor máximo do imposto é ${amount}`,
            invalidSplit: 'A soma das divisões deve ser igual ao valor total',
            invalidSplitParticipants: 'Por favor, insira um valor maior que zero para pelo menos dois participantes.',
            invalidSplitYourself: 'Por favor, insira um valor diferente de zero para sua divisão.',
            noParticipantSelected: 'Por favor, selecione um participante',
            other: 'Erro inesperado. Por favor, tente novamente mais tarde.',
            genericCreateFailureMessage: 'Erro inesperado ao enviar esta despesa. Por favor, tente novamente mais tarde.',
            genericCreateInvoiceFailureMessage: 'Erro inesperado ao enviar esta fatura. Por favor, tente novamente mais tarde.',
            genericHoldExpenseFailureMessage: 'Erro inesperado ao reter esta despesa. Por favor, tente novamente mais tarde.',
            genericUnholdExpenseFailureMessage: 'Erro inesperado ao remover esta despesa da retenção. Por favor, tente novamente mais tarde.',
            receiptDeleteFailureError: 'Erro inesperado ao excluir este recibo. Por favor, tente novamente mais tarde.',
            receiptFailureMessage: 'Houve um erro ao enviar seu recibo. Por favor,',
            receiptFailureMessageShort: 'Houve um erro ao enviar seu recibo.',
            tryAgainMessage: 'tente novamente',
            saveFileMessage: 'salvar o recibo',
            uploadLaterMessage: 'para enviar mais tarde.',
            genericDeleteFailureMessage: 'Erro inesperado ao excluir esta despesa. Por favor, tente novamente mais tarde.',
            genericEditFailureMessage: 'Erro inesperado ao editar esta despesa. Por favor, tente novamente mais tarde.',
            genericSmartscanFailureMessage: 'A transação está com campos faltando',
            duplicateWaypointsErrorMessage: 'Por favor, remova os pontos de passagem duplicados.',
            atLeastTwoDifferentWaypoints: 'Por favor, insira pelo menos dois endereços diferentes.',
            splitExpenseMultipleParticipantsErrorMessage: 'Uma despesa não pode ser dividida entre um espaço de trabalho e outros membros. Por favor, atualize sua seleção.',
            invalidMerchant: 'Por favor, insira um comerciante válido',
            atLeastOneAttendee: 'Pelo menos um participante deve ser selecionado',
            invalidQuantity: 'Por favor, insira uma quantidade válida',
            quantityGreaterThanZero: 'A quantidade deve ser maior que zero',
            invalidSubrateLength: 'Deve haver pelo menos uma subtarifa',
            invalidRate: 'Taxa não válida para este espaço de trabalho. Por favor, selecione uma taxa disponível no espaço de trabalho.',
        },
        dismissReceiptError: 'Dispensar erro',
        dismissReceiptErrorConfirmation: 'Atenção! Ignorar este erro removerá seu recibo enviado completamente. Tem certeza?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `começou a acertar. O pagamento está em espera até que ${submitterDisplayName} ative sua carteira.`,
        enableWallet: 'Ativar carteira',
        hold: 'Manter',
        unhold: 'Remover retenção',
        holdExpense: 'Reter despesa',
        unholdExpense: 'Desbloquear despesa',
        heldExpense: 'mantido esta despesa',
        unheldExpense: 'liberou esta despesa',
        moveUnreportedExpense: 'Mover despesa não relatada',
        addUnreportedExpense: 'Adicionar despesa não relatada',
        createNewExpense: 'Criar nova despesa',
        selectUnreportedExpense: 'Selecione pelo menos uma despesa para adicionar ao relatório.',
        emptyStateUnreportedExpenseTitle: 'Nenhuma despesa não relatada',
        emptyStateUnreportedExpenseSubtitle: 'Parece que você não tem nenhuma despesa não relatada. Tente criar uma abaixo.',
        addUnreportedExpenseConfirm: 'Adicionar ao relatório',
        explainHold: 'Explique por que você está retendo esta despesa.',
        undoSubmit: 'Desfazer envio',
        retracted: 'retraído',
        undoClose: 'Desfazer fechamento',
        reopened: 'reaberto',
        reopenReport: 'Reabrir relatório',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Este relatório já foi exportado para ${connectionName}. Alterá-lo pode levar a discrepâncias de dados. Tem certeza de que deseja reabrir este relatório?`,
        reason: 'Razão',
        holdReasonRequired: 'É necessário fornecer um motivo ao reter.',
        expenseWasPutOnHold: 'Despesa foi colocada em espera',
        expenseOnHold: 'Esta despesa foi colocada em espera. Por favor, reveja os comentários para os próximos passos.',
        expensesOnHold: 'Todas as despesas foram suspensas. Por favor, revise os comentários para os próximos passos.',
        expenseDuplicate: 'Esta despesa tem detalhes semelhantes a outra. Por favor, revise os duplicados para continuar.',
        someDuplicatesArePaid: 'Alguns desses duplicados já foram aprovados ou pagos.',
        reviewDuplicates: 'Revisar duplicatas',
        keepAll: 'Manter tudo',
        confirmApprove: 'Confirmar valor de aprovação',
        confirmApprovalAmount: 'Aprovar apenas despesas em conformidade, ou aprovar o relatório inteiro.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Esta despesa está em espera. Você quer aprovar mesmo assim?',
            other: 'Essas despesas estão em espera. Você quer aprovar mesmo assim?',
        }),
        confirmPay: 'Confirmar valor do pagamento',
        confirmPayAmount: 'Pague o que não está em espera, ou pague o relatório inteiro.',
        confirmPayAllHoldAmount: () => ({
            one: 'Esta despesa está em espera. Você quer pagar mesmo assim?',
            other: 'Essas despesas estão em espera. Você quer pagar mesmo assim?',
        }),
        payOnly: 'Pagar apenas',
        approveOnly: 'Aprovar apenas',
        holdEducationalTitle: 'Esta solicitação está em andamento',
        holdEducationalText: 'aguarde',
        whatIsHoldExplain: 'Colocar em espera é como apertar "pausa" em uma despesa para solicitar mais detalhes antes da aprovação ou pagamento.',
        holdIsLeftBehind: 'Despesas retidas são movidas para outro relatório após aprovação ou pagamento.',
        unholdWhenReady: 'Os aprovadores podem liberar despesas quando estiverem prontas para aprovação ou pagamento.',
        changePolicyEducational: {
            title: 'Você moveu este relatório!',
            description: 'Verifique novamente esses itens, que tendem a mudar ao mover relatórios para um novo espaço de trabalho.',
            reCategorize: '<strong>Recategorize quaisquer despesas</strong> para cumprir as regras do espaço de trabalho.',
            workflows: 'Este relatório pode agora estar sujeito a um <strong>fluxo de aprovação</strong> diferente.',
        },
        changeWorkspace: 'Alterar espaço de trabalho',
        set: 'set',
        changed: 'alterado',
        removed: 'removido',
        transactionPending: 'Transação pendente.',
        chooseARate: 'Selecione uma taxa de reembolso por milha ou quilômetro para o espaço de trabalho',
        unapprove: 'Desaprovar',
        unapproveReport: 'Desaprovar relatório',
        headsUp: 'Atenção!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Este relatório já foi exportado para ${accountingIntegration}. Alterá-lo pode levar a discrepâncias de dados. Tem certeza de que deseja desaprovar este relatório?`,
        reimbursable: 'reembolsável',
        nonReimbursable: 'não reembolsável',
        bookingPending: 'Esta reserva está pendente',
        bookingPendingDescription: 'Esta reserva está pendente porque ainda não foi paga.',
        bookingArchived: 'Esta reserva está arquivada',
        bookingArchivedDescription: 'Esta reserva está arquivada porque a data da viagem já passou. Adicione uma despesa para o valor final, se necessário.',
        attendees: 'Participantes',
        whoIsYourAccountant: 'Quem é o seu contador?',
        paymentComplete: 'Pagamento concluído',
        time: 'Tempo',
        startDate: 'Data de início',
        endDate: 'Data de término',
        startTime: 'Hora de início',
        endTime: 'Hora de término',
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
            one: `Último dia: 1 hora`,
            other: (count: number) => `Último dia: ${count.toFixed(2)} horas`,
        }),
        tripLengthText: () => ({
            one: `Viagem: 1 dia inteiro`,
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
        header: 'Preferências de notificações',
        label: 'Notifique-me sobre novas mensagens',
        notificationPreferences: {
            always: 'Imediatamente',
            daily: 'Diário',
            mute: 'Silenciar',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'O número não foi validado. Clique no botão para reenviar o link de validação via mensagem de texto.',
        emailHasNotBeenValidated: 'O e-mail não foi validado. Clique no botão para reenviar o link de validação via mensagem de texto.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carregar foto',
        removePhoto: 'Remover foto',
        editImage: 'Editar foto',
        viewPhoto: 'Ver foto',
        imageUploadFailed: 'Falha no upload da imagem',
        deleteWorkspaceError: 'Desculpe, houve um problema inesperado ao excluir o avatar do seu espaço de trabalho.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `A imagem selecionada excede o tamanho máximo de upload de ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Por favor, carregue uma imagem maior que ${minHeightInPx}x${minWidthInPx} pixels e menor que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
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
        emailAddress: 'Endereço de e-mail',
        setMyTimezoneAutomatically: 'Defina meu fuso horário automaticamente',
        timezone: 'Fuso horário',
        invalidFileMessage: 'Arquivo inválido. Por favor, tente uma imagem diferente.',
        avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Por favor, tente novamente.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizando',
        profileAvatar: 'Avatar do perfil',
        publicSection: {
            title: 'Público',
            subtitle: 'Esses detalhes são exibidos no seu perfil público. Qualquer pessoa pode vê-los.',
        },
        privateSection: {
            title: 'Privado',
            subtitle: 'Esses detalhes são usados para viagens e pagamentos. Eles nunca são exibidos no seu perfil público.',
        },
    },
    securityPage: {
        title: 'Opções de segurança',
        subtitle: 'Ative a autenticação de dois fatores para manter sua conta segura.',
        goToSecurity: 'Voltar para a página de segurança',
    },
    shareCodePage: {
        title: 'Seu código',
        subtitle: 'Convide membros para o Expensify compartilhando seu código QR pessoal ou link de indicação.',
    },
    pronounsPage: {
        pronouns: 'Pronomes',
        isShownOnProfile: 'Seus pronomes são exibidos no seu perfil.',
        placeholderText: 'Pesquisar para ver opções',
    },
    contacts: {
        contactMethod: 'Método de contato',
        contactMethods: 'Métodos de contato',
        featureRequiresValidate: 'Este recurso requer que você valide sua conta.',
        validateAccount: 'Valide sua conta',
        helpTextBeforeEmail: 'Adicione mais maneiras para as pessoas encontrarem você e encaminharem recibos para',
        helpTextAfterEmail: 'de vários endereços de e-mail.',
        pleaseVerify: 'Por favor, verifique este método de contato',
        getInTouch: 'Sempre que precisarmos entrar em contato com você, usaremos este método de contato.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Por favor, insira o código mágico enviado para ${contactMethod}. Ele deve chegar em um ou dois minutos.`,
        setAsDefault: 'Definir como padrão',
        yourDefaultContactMethod: 'Este é o seu método de contato padrão atual. Antes de poder excluí-lo, você precisará escolher outro método de contato e clicar em “Definir como padrão”.',
        removeContactMethod: 'Remover método de contato',
        removeAreYouSure: 'Tem certeza de que deseja remover este método de contato? Esta ação não pode ser desfeita.',
        failedNewContact: 'Falha ao adicionar este método de contato.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Falha ao enviar um novo código mágico. Por favor, aguarde um pouco e tente novamente.',
            validateSecondaryLogin: 'Código mágico incorreto ou inválido. Por favor, tente novamente ou solicite um novo código.',
            deleteContactMethod: 'Falha ao excluir o método de contato. Por favor, entre em contato com o Concierge para obter ajuda.',
            setDefaultContactMethod: 'Falha ao definir um novo método de contato padrão. Por favor, entre em contato com o Concierge para obter ajuda.',
            addContactMethod: 'Falha ao adicionar este método de contato. Por favor, entre em contato com o Concierge para obter ajuda.',
            enteredMethodIsAlreadySubmitted: 'Este método de contato já existe',
            passwordRequired: 'senha necessária.',
            contactMethodRequired: 'Método de contato é obrigatório',
            invalidContactMethod: 'Método de contato inválido',
        },
        newContactMethod: 'Novo método de contato',
        goBackContactMethods: 'Voltar para métodos de contato',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Ele / Dele / Seu',
        heHimHisTheyThemTheirs: 'Ele / Dele / Eles / Deles',
        sheHerHers: 'Ela / Dela / Delas',
        sheHerHersTheyThemTheirs: 'Ela / Delas / Eles / Deles',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Eles / Deles / Deles',
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
        headerTitle: 'Nome de exibição',
        isShownOnProfile: 'Seu nome de exibição é mostrado no seu perfil.',
    },
    timezonePage: {
        timezone: 'Fuso horário',
        isShownOnProfile: 'Seu fuso horário é exibido no seu perfil.',
        getLocationAutomatically: 'Determinar automaticamente sua localização',
    },
    updateRequiredView: {
        updateRequired: 'Atualização necessária',
        pleaseInstall: 'Por favor, atualize para a versão mais recente do New Expensify.',
        pleaseInstallExpensifyClassic: 'Por favor, instale a versão mais recente do Expensify.',
        toGetLatestChanges: 'Para celular ou desktop, baixe e instale a versão mais recente. Para web, atualize seu navegador.',
        newAppNotAvailable: 'O novo aplicativo Expensify não está mais disponível.',
    },
    initialSettingsPage: {
        about: 'Sobre',
        aboutPage: {
            description: 'O novo aplicativo Expensify é desenvolvido por uma comunidade de desenvolvedores de código aberto de todo o mundo. Ajude-nos a construir o futuro do Expensify.',
            appDownloadLinks: 'Links para download do app',
            viewKeyboardShortcuts: 'Ver atalhos de teclado',
            viewTheCode: 'Ver o código',
            viewOpenJobs: 'Ver vagas abertas',
            reportABug: 'Relatar um bug',
            troubleshoot: 'Solução de problemas',
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
            viewConsole: 'Ver console de depuração',
            debugConsole: 'Console de depuração',
            description: 'Use as ferramentas abaixo para ajudar a solucionar problemas na experiência do Expensify. Se você encontrar algum problema, por favor',
            submitBug: 'enviar um bug',
            confirmResetDescription: 'Todas as mensagens de rascunho não enviadas serão perdidas, mas o restante dos seus dados está seguro.',
            resetAndRefresh: 'Redefinir e atualizar',
            clientSideLogging: 'Registro no lado do cliente',
            noLogsToShare: 'Sem registros para compartilhar',
            useProfiling: 'Usar perfilamento',
            profileTrace: 'Rastreamento de perfil',
            results: 'Resultados',
            releaseOptions: 'Opções de lançamento',
            testingPreferences: 'Testando preferências',
            useStagingServer: 'Usar Servidor de Staging',
            forceOffline: 'Forçar offline',
            simulatePoorConnection: 'Simular conexão de internet ruim',
            simulateFailingNetworkRequests: 'Simular falhas em solicitações de rede',
            authenticationStatus: 'Status de autenticação',
            deviceCredentials: 'Credenciais do dispositivo',
            invalidate: 'Invalidar',
            destroy: 'Destruir',
            maskExportOnyxStateData: 'Mascarar dados sensíveis dos membros ao exportar o estado do Onyx',
            exportOnyxState: 'Exportar estado do Onyx',
            importOnyxState: 'Importar estado do Onyx',
            testCrash: 'Teste de falha',
            resetToOriginalState: 'Redefinir para o estado original',
            usingImportedState: 'Você está usando um estado importado. Clique aqui para limpá-lo.',
            debugMode: 'Modo de depuração',
            invalidFile: 'Arquivo inválido',
            invalidFileDescription: 'O arquivo que você está tentando importar não é válido. Por favor, tente novamente.',
            invalidateWithDelay: 'Invalidar com atraso',
            recordTroubleshootData: 'Registro de dados de solução de problemas',
        },
        debugConsole: {
            saveLog: 'Salvar log',
            shareLog: 'Compartilhar log',
            enterCommand: 'Digite o comando',
            execute: 'Executar',
            noLogsAvailable: 'Nenhum registro disponível',
            logSizeTooLarge: ({size}: LogSizeParams) => `O tamanho do log excede o limite de ${size} MB. Por favor, use "Salvar log" para baixar o arquivo de log.`,
            logs: 'Logs',
            viewConsole: 'Ver console',
        },
        security: 'Segurança',
        signOut: 'Sair',
        restoreStashed: 'Restaurar login armazenado',
        signOutConfirmationText: 'Você perderá todas as alterações offline se sair.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Leia o',
            phrase2: 'Termos de Serviço',
            phrase3: 'e',
            phrase4: 'Privacidade',
        },
        help: 'Ajuda',
        accountSettings: 'Configurações da conta',
        account: 'Conta',
        general: 'Geral',
    },
    closeAccountPage: {
        closeAccount: 'Fechar conta',
        reasonForLeavingPrompt: 'Nós odiaríamos ver você partir! Poderia nos dizer o motivo, para que possamos melhorar?',
        enterMessageHere: 'Insira a mensagem aqui',
        closeAccountWarning: 'Fechar sua conta não pode ser desfeito.',
        closeAccountPermanentlyDeleteData: 'Tem certeza de que deseja excluir sua conta? Isso excluirá permanentemente quaisquer despesas pendentes.',
        enterDefaultContactToConfirm: 'Por favor, insira seu método de contato padrão para confirmar que deseja encerrar sua conta. Seu método de contato padrão é:',
        enterDefaultContact: 'Insira seu método de contato padrão',
        defaultContact: 'Método de contato padrão:',
        enterYourDefaultContactMethod: 'Por favor, insira seu método de contato padrão para encerrar sua conta.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Mesclar contas',
        accountDetails: {
            accountToMergeInto: 'Insira a conta na qual você deseja mesclar',
            notReversibleConsent: 'Entendo que isso não é reversível.',
        },
        accountValidate: {
            confirmMerge: 'Tem certeza de que deseja mesclar as contas?',
            lossOfUnsubmittedData: `A fusão de suas contas é irreversível e resultará na perda de quaisquer despesas não enviadas para`,
            enterMagicCode: `Para continuar, por favor, insira o código mágico enviado para`,
            errors: {
                incorrectMagicCode: 'Código mágico incorreto ou inválido. Por favor, tente novamente ou solicite um novo código.',
                fallback: 'Algo deu errado. Por favor, tente novamente mais tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Contas mescladas!',
            successfullyMergedAllData: {
                beforeFirstEmail: `Você mesclou com sucesso todos os dados de`,
                beforeSecondEmail: `em`,
                afterSecondEmail: `. A partir de agora, você pode usar qualquer login para esta conta.`,
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Estamos trabalhando nisso',
            limitedSupport: 'Ainda não oferecemos suporte para a fusão de contas no New Expensify. Por favor, realize essa ação no Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Sinta-se à vontade para',
                linkText: 'entre em contato com o Concierge',
                afterLink: 'se você tiver alguma dúvida!',
            },
            goToExpensifyClassic: 'Ir para Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Você não pode mesclar',
            beforeDomain: 'porque é controlado por',
            afterDomain: '. Por favor',
            linkText: 'entre em contato com o Concierge',
            afterLink: 'para assistência.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Você não pode mesclar',
            afterEmail: 'em outras contas porque o administrador do seu domínio definiu como seu login principal. Por favor, mescle outras contas nele.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Você não pode mesclar contas porque',
                beforeSecondEmail: 'tem a autenticação de dois fatores (2FA) ativada. Por favor, desative a 2FA para',
                afterSecondEmail: 'e tente novamente.',
            },
            learnMore: 'Saiba mais sobre como mesclar contas.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Você não pode mesclar',
            afterEmail: 'porque está bloqueado. Por favor,',
            linkText: 'entre em contato com o Concierge',
            afterLink: `para assistência.`,
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Você não pode mesclar contas porque',
                afterEmail: 'não tem uma conta Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Por favor',
                linkText: 'adicione como um método de contato',
                afterLink: 'em vez disso.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Você não pode mesclar',
            afterEmail: 'em outras contas. Por favor, mescle outras contas nela em vez disso.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Você não pode mesclar',
            afterEmail: 'em outras contas porque é o proprietário de faturamento de uma conta faturada. Por favor, mescle outras contas nele em vez disso.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Tente novamente mais tarde',
            description: 'Houve muitas tentativas de mesclar contas. Por favor, tente novamente mais tarde.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Você não pode mesclar em outras contas porque ela não está validada. Por favor, valide a conta e tente novamente.',
        },
        mergeFailureSelfMerge: {
            description: 'Você não pode mesclar uma conta consigo mesma.',
        },
        mergeFailureGenericHeading: 'Não é possível mesclar contas',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Reportar atividade suspeita',
        lockAccount: 'Bloquear conta',
        unlockAccount: 'Desbloquear conta',
        compromisedDescription:
            'Notou algo estranho em sua conta? Relatar isso bloqueará imediatamente sua conta, interromperá novas transações do Cartão Expensify e impedirá alterações na conta.',
        domainAdminsDescription: 'Para administradores de domínio: Isso também pausa toda a atividade do Cartão Expensify e ações administrativas em seus domínios.',
        areYouSure: 'Tem certeza de que deseja bloquear sua conta Expensify?',
        ourTeamWill: 'Nossa equipe investigará e removerá qualquer acesso não autorizado. Para recuperar o acesso, será necessário trabalhar com o Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Falha ao bloquear a conta',
        failedToLockAccountDescription: `Não conseguimos bloquear sua conta. Por favor, converse com o Concierge para resolver este problema.`,
        chatWithConcierge: 'Converse com o Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Conta bloqueada',
        yourAccountIsLocked: 'Sua conta está bloqueada',
        chatToConciergeToUnlock: 'Converse com o Concierge para resolver preocupações de segurança e desbloquear sua conta.',
        chatWithConcierge: 'Converse com o Concierge',
    },
    passwordPage: {
        changePassword: 'Alterar senha',
        changingYourPasswordPrompt: 'Alterar sua senha atualizará sua senha tanto para sua conta Expensify.com quanto para sua conta New Expensify.',
        currentPassword: 'Senha atual',
        newPassword: 'Nova senha',
        newPasswordPrompt: 'Sua nova senha deve ser diferente da sua senha antiga e conter pelo menos 8 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 número.',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticação de dois fatores',
        twoFactorAuthEnabled: 'Autenticação de dois fatores ativada',
        whatIsTwoFactorAuth:
            'A autenticação de dois fatores (2FA) ajuda a manter sua conta segura. Ao fazer login, você precisará inserir um código gerado pelo seu aplicativo autenticador preferido.',
        disableTwoFactorAuth: 'Desativar a autenticação de dois fatores',
        explainProcessToRemove: 'Para desativar a autenticação de dois fatores (2FA), insira um código válido do seu aplicativo de autenticação.',
        disabled: 'A autenticação de dois fatores está agora desativada',
        noAuthenticatorApp: 'Você não precisará mais de um aplicativo autenticador para fazer login no Expensify.',
        stepCodes: 'Códigos de recuperação',
        keepCodesSafe: 'Mantenha esses códigos de recuperação em segurança!',
        codesLoseAccess:
            'Se você perder o acesso ao seu aplicativo autenticador e não tiver esses códigos, perderá o acesso à sua conta.\n\nNota: Configurar a autenticação de dois fatores irá desconectá-lo de todas as outras sessões ativas.',
        errorStepCodes: 'Por favor, copie ou baixe os códigos antes de continuar.',
        stepVerify: 'Verificar',
        scanCode: 'Escaneie o código QR usando seu',
        authenticatorApp: 'aplicativo autenticador',
        addKey: 'Ou adicione esta chave secreta ao seu aplicativo autenticador:',
        enterCode: 'Em seguida, insira o código de seis dígitos gerado pelo seu aplicativo autenticador.',
        stepSuccess: 'Concluído',
        enabled: 'Autenticação de dois fatores ativada',
        congrats: 'Parabéns! Agora você tem essa segurança extra.',
        copy: 'Copiar',
        disable: 'Desativar',
        enableTwoFactorAuth: 'Ativar autenticação de dois fatores',
        pleaseEnableTwoFactorAuth: 'Por favor, habilite a autenticação de dois fatores.',
        twoFactorAuthIsRequiredDescription: 'Para fins de segurança, a Xero exige autenticação de dois fatores para conectar a integração.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticação de dois fatores necessária',
        twoFactorAuthIsRequiredForAdminsTitle: 'Por favor, habilite a autenticação de dois fatores.',
        twoFactorAuthIsRequiredForAdminsDescription:
            'Sua conexão de contabilidade com a Xero requer o uso de autenticação de dois fatores. Para continuar usando o Expensify, por favor, ative-a.',
        twoFactorAuthCannotDisable: 'Não é possível desativar a 2FA',
        twoFactorAuthRequired: 'A autenticação de dois fatores (2FA) é necessária para sua conexão com o Xero e não pode ser desativada.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Por favor, insira seu código de recuperação',
            incorrectRecoveryCode: 'Código de recuperação incorreto. Por favor, tente novamente.',
        },
        useRecoveryCode: 'Usar código de recuperação',
        recoveryCode: 'Código de recuperação',
        use2fa: 'Use o código de autenticação de dois fatores',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Por favor, insira seu código de autenticação de dois fatores',
            incorrect2fa: 'Código de autenticação de dois fatores incorreto. Por favor, tente novamente.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Senha atualizada!',
        allSet: 'Tudo pronto. Mantenha sua nova senha segura.',
    },
    privateNotes: {
        title: 'Notas privadas',
        personalNoteMessage: 'Mantenha notas sobre este chat aqui. Você é a única pessoa que pode adicionar, editar ou visualizar essas notas.',
        sharedNoteMessage: 'Mantenha anotações sobre este chat aqui. Funcionários da Expensify e outros membros do domínio team.expensify.com podem visualizar estas notas.',
        composerLabel: 'Notas',
        myNote: 'Minha nota',
        error: {
            genericFailureMessage: 'Notas privadas não puderam ser salvas',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Por favor, insira um código de segurança válido.',
        },
        securityCode: 'Código de segurança',
        changeBillingCurrency: 'Alterar moeda de cobrança',
        changePaymentCurrency: 'Alterar moeda de pagamento',
        paymentCurrency: 'Moeda de pagamento',
        paymentCurrencyDescription: 'Selecione uma moeda padronizada para a qual todas as despesas pessoais devem ser convertidas.',
        note: 'Nota: Alterar sua moeda de pagamento pode impactar quanto você pagará pelo Expensify. Consulte nosso',
        noteLink: 'página de preços',
        noteDetails: 'para detalhes completos.',
    },
    addDebitCardPage: {
        addADebitCard: 'Adicionar um cartão de débito',
        nameOnCard: 'Nome no cartão',
        debitCardNumber: 'Número do cartão de débito',
        expiration: 'Data de validade',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Endereço de cobrança',
        growlMessageOnSave: 'Seu cartão de débito foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Por favor, insira um CEP válido.',
            debitCardNumber: 'Por favor, insira um número de cartão de débito válido.',
            expirationDate: 'Por favor, selecione uma data de validade válida',
            securityCode: 'Por favor, insira um código de segurança válido.',
            addressStreet: 'Por favor, insira um endereço de cobrança válido que não seja uma caixa postal.',
            addressState: 'Por favor, selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cartão. Por favor, tente novamente.',
            password: 'Por favor, insira sua senha do Expensify.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Adicionar cartão de pagamento',
        nameOnCard: 'Nome no cartão',
        paymentCardNumber: 'Número do cartão',
        expiration: 'Data de validade',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Endereço de cobrança',
        growlMessageOnSave: 'Seu cartão de pagamento foi adicionado com sucesso',
        expensifyPassword: 'Senha do Expensify',
        error: {
            invalidName: 'O nome pode incluir apenas letras',
            addressZipCode: 'Por favor, insira um CEP válido.',
            paymentCardNumber: 'Por favor, insira um número de cartão válido',
            expirationDate: 'Por favor, selecione uma data de validade válida',
            securityCode: 'Por favor, insira um código de segurança válido.',
            addressStreet: 'Por favor, insira um endereço de cobrança válido que não seja uma caixa postal.',
            addressState: 'Por favor, selecione um estado',
            addressCity: 'Por favor, insira uma cidade',
            genericFailureMessage: 'Ocorreu um erro ao adicionar seu cartão. Por favor, tente novamente.',
            password: 'Por favor, insira sua senha do Expensify.',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Métodos de pagamento',
        setDefaultConfirmation: 'Tornar método de pagamento padrão',
        setDefaultSuccess: 'Método de pagamento padrão definido!',
        deleteAccount: 'Excluir conta',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta conta?',
        error: {
            notOwnerOfBankAccount: 'Ocorreu um erro ao definir esta conta bancária como seu método de pagamento padrão.',
            invalidBankAccount: 'Esta conta bancária está temporariamente suspensa',
            notOwnerOfFund: 'Ocorreu um erro ao definir este cartão como seu método de pagamento padrão.',
            setDefaultFailure: 'Algo deu errado. Por favor, converse com o Concierge para obter mais assistência.',
        },
        addBankAccountFailure: 'Ocorreu um erro inesperado ao tentar adicionar sua conta bancária. Por favor, tente novamente.',
        getPaidFaster: 'Receba pagamentos mais rápido',
        addPaymentMethod: 'Adicione um método de pagamento para enviar e receber pagamentos diretamente no aplicativo.',
        getPaidBackFaster: 'Receba o reembolso mais rápido',
        secureAccessToYourMoney: 'Acesso seguro ao seu dinheiro',
        receiveMoney: 'Receba dinheiro na sua moeda local',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Envie e receba dinheiro com amigos. Apenas contas bancárias dos EUA.',
        enableWallet: 'Ativar carteira',
        addBankAccountToSendAndReceive: 'Receba reembolso pelas despesas que você enviar para um espaço de trabalho.',
        addBankAccount: 'Adicionar conta bancária',
        addDebitOrCreditCard: 'Adicionar cartão de débito ou crédito',
        assignedCards: 'Cartões atribuídos',
        assignedCardsDescription: 'Estes são cartões atribuídos por um administrador de espaço de trabalho para gerenciar os gastos da empresa.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Estamos revisando suas informações. Por favor, volte em alguns minutos!',
        walletActivationFailed: 'Infelizmente, sua carteira não pode ser ativada neste momento. Por favor, converse com o Concierge para obter mais assistência.',
        addYourBankAccount: 'Adicione sua conta bancária',
        addBankAccountBody: 'Vamos conectar sua conta bancária ao Expensify para que seja mais fácil do que nunca enviar e receber pagamentos diretamente no aplicativo.',
        chooseYourBankAccount: 'Escolha sua conta bancária',
        chooseAccountBody: 'Certifique-se de selecionar o correto.',
        confirmYourBankAccount: 'Confirme sua conta bancária',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite inteligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Você pode gastar até ${formattedLimit} neste cartão, e o limite será redefinido à medida que suas despesas enviadas forem aprovadas.`,
        },
        fixedLimit: {
            name: 'Limite fixo',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Você pode gastar até ${formattedLimit} neste cartão, e então ele será desativado.`,
        },
        monthlyLimit: {
            name: 'Limite mensal',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Você pode gastar até ${formattedLimit} neste cartão por mês. O limite será redefinido no primeiro dia de cada mês do calendário.`,
        },
        virtualCardNumber: 'Número do cartão virtual',
        travelCardCvv: 'CVV do cartão de viagem',
        physicalCardNumber: 'Número do cartão físico',
        getPhysicalCard: 'Obter cartão físico',
        reportFraud: 'Relatar fraude de cartão virtual',
        reportTravelFraud: 'Reportar fraude no cartão de viagem',
        reviewTransaction: 'Revisar transação',
        suspiciousBannerTitle: 'Transação suspeita',
        suspiciousBannerDescription: 'Notamos transações suspeitas no seu cartão. Toque abaixo para revisar.',
        cardLocked: 'Seu cartão está temporariamente bloqueado enquanto nossa equipe revisa a conta da sua empresa.',
        cardDetails: {
            cardNumber: 'Número do cartão virtual',
            expiration: 'Expiração',
            cvv: 'CVV',
            address: 'Endereço',
            revealDetails: 'Revelar detalhes',
            revealCvv: 'Revelar CVV',
            copyCardNumber: 'Copiar número do cartão',
            updateAddress: 'Atualizar endereço',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Adicionado à Carteira ${platform}`,
        cardDetailsLoadingFailure: 'Ocorreu um erro ao carregar os detalhes do cartão. Por favor, verifique sua conexão com a internet e tente novamente.',
        validateCardTitle: 'Vamos garantir que é você',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Por favor, insira o código mágico enviado para ${contactMethod} para visualizar os detalhes do seu cartão. Ele deve chegar dentro de um ou dois minutos.`,
    },
    workflowsPage: {
        workflowTitle: 'Gastar',
        workflowDescription: 'Configurar um fluxo de trabalho desde o momento em que a despesa ocorre, incluindo aprovação e pagamento.',
        delaySubmissionTitle: 'Atrasar envios',
        delaySubmissionDescription: 'Escolha um cronograma personalizado para enviar despesas ou deixe isso desativado para atualizações em tempo real sobre gastos.',
        submissionFrequency: 'Frequência de envio',
        submissionFrequencyDateOfMonth: 'Data do mês',
        addApprovalsTitle: 'Adicionar aprovações',
        addApprovalButton: 'Adicionar fluxo de trabalho de aprovação',
        addApprovalTip: 'Este fluxo de trabalho padrão se aplica a todos os membros, a menos que exista um fluxo de trabalho mais específico.',
        approver: 'Aprovador',
        connectBankAccount: 'Conectar conta bancária',
        addApprovalsDescription: 'Exigir aprovação adicional antes de autorizar um pagamento.',
        makeOrTrackPaymentsTitle: 'Fazer ou rastrear pagamentos',
        makeOrTrackPaymentsDescription: 'Adicione um pagador autorizado para pagamentos feitos no Expensify ou acompanhe pagamentos feitos em outros lugares.',
        editor: {
            submissionFrequency: 'Escolha quanto tempo o Expensify deve esperar antes de compartilhar despesas sem erros.',
        },
        frequencyDescription: 'Escolha com que frequência você gostaria que as despesas fossem enviadas automaticamente ou faça isso manualmente.',
        frequencies: {
            instant: 'Instantâneo',
            weekly: 'Semanalmente',
            monthly: 'Mensalmente',
            twiceAMonth: 'Duas vezes por mês',
            byTrip: 'Por viagem',
            manually: 'Manualmente',
            daily: 'Diário',
            lastDayOfMonth: 'Último dia do mês',
            lastBusinessDayOfMonth: 'Último dia útil do mês',
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
                '7': 'Sétimo',
                '8': 'Oitavo',
                '9': 'Nono',
                '10': 'Décimo',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Este membro já pertence a outro fluxo de aprovação. Quaisquer atualizações aqui serão refletidas lá também.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> já aprova relatórios para <strong>${name2}</strong>. Por favor, escolha um aprovador diferente para evitar um fluxo de trabalho circular.`,
        emptyContent: {
            title: 'Nenhum membro para exibir',
            expensesFromSubtitle: 'Todos os membros do espaço de trabalho já pertencem a um fluxo de aprovação existente.',
            approverSubtitle: 'Todos os aprovadores pertencem a um fluxo de trabalho existente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'A submissão atrasada não pôde ser alterada. Por favor, tente novamente ou entre em contato com o suporte.',
        autoReportingFrequencyErrorMessage: 'A frequência de envio não pôde ser alterada. Por favor, tente novamente ou entre em contato com o suporte.',
        monthlyOffsetErrorMessage: 'A frequência mensal não pôde ser alterada. Por favor, tente novamente ou entre em contato com o suporte.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmar',
        header: 'Adicione mais aprovadores e confirme.',
        additionalApprover: 'Aprovador adicional',
        submitButton: 'Adicionar fluxo de trabalho',
    },
    workflowsEditApprovalsPage: {
        title: 'Editar fluxo de aprovação',
        deleteTitle: 'Excluir fluxo de trabalho de aprovação',
        deletePrompt: 'Tem certeza de que deseja excluir este fluxo de aprovação? Todos os membros seguirão o fluxo padrão posteriormente.',
    },
    workflowsExpensesFromPage: {
        title: 'Despesas de',
        header: 'Quando os seguintes membros enviarem despesas:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'O aprovador não pôde ser alterado. Por favor, tente novamente ou entre em contato com o suporte.',
        header: 'Enviar para este membro para aprovação:',
    },
    workflowsPayerPage: {
        title: 'Pagador autorizado',
        genericErrorMessage: 'O pagador autorizado não pôde ser alterado. Por favor, tente novamente.',
        admins: 'Admins',
        payer: 'Pagador',
        paymentAccount: 'Conta de pagamento',
    },
    reportFraudPage: {
        title: 'Relatar fraude de cartão virtual',
        description:
            'Se os detalhes do seu cartão virtual forem roubados ou comprometidos, desativaremos permanentemente o seu cartão existente e forneceremos um novo cartão virtual e número.',
        deactivateCard: 'Desativar cartão',
        reportVirtualCardFraud: 'Relatar fraude de cartão virtual',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude no cartão reportada',
        description: 'Desativamos permanentemente seu cartão existente. Quando você voltar para ver os detalhes do seu cartão, terá um novo cartão virtual disponível.',
        buttonText: 'Entendi, obrigado!',
    },
    activateCardPage: {
        activateCard: 'Ativar cartão',
        pleaseEnterLastFour: 'Por favor, insira os últimos quatro dígitos do seu cartão.',
        activatePhysicalCard: 'Ativar cartão físico',
        error: {
            thatDidNotMatch: 'Isso não corresponde aos últimos 4 dígitos do seu cartão. Por favor, tente novamente.',
            throttled:
                'Você digitou incorretamente os últimos 4 dígitos do seu Cartão Expensify muitas vezes. Se você tem certeza de que os números estão corretos, entre em contato com o Concierge para resolver. Caso contrário, tente novamente mais tarde.',
        },
    },
    getPhysicalCard: {
        header: 'Obter cartão físico',
        nameMessage: 'Digite seu nome e sobrenome, pois será exibido no seu cartão.',
        legalName: 'Nome legal',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        phoneMessage: 'Digite seu número de telefone.',
        phoneNumber: 'Número de telefone',
        address: 'Endereço',
        addressMessage: 'Insira seu endereço de entrega.',
        streetAddress: 'Endereço',
        city: 'Cidade',
        state: 'Estado',
        zipPostcode: 'CEP/Código Postal',
        country: 'País',
        confirmMessage: 'Por favor, confirme seus dados abaixo.',
        estimatedDeliveryMessage: 'Seu cartão físico chegará em 2-3 dias úteis.',
        next: 'Próximo',
        getPhysicalCard: 'Obter cartão físico',
        shipCard: 'Enviar cartão',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instantâneo (Cartão de débito)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% de taxa (${minAmount} mínimo)`,
        ach: '1-3 dias úteis (Conta bancária)',
        achSummary: 'Sem taxa',
        whichAccount: 'Qual conta?',
        fee: 'Taxa',
        transferSuccess: 'Transferência bem-sucedida!',
        transferDetailBankAccount: 'Seu dinheiro deve chegar nos próximos 1-3 dias úteis.',
        transferDetailDebitCard: 'Seu dinheiro deve chegar imediatamente.',
        failedTransfer: 'Seu saldo não está totalmente liquidado. Por favor, transfira para uma conta bancária.',
        notHereSubTitle: 'Por favor, transfira seu saldo da página da carteira.',
        goToWallet: 'Ir para Carteira',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Escolher conta',
    },
    paymentMethodList: {
        addPaymentMethod: 'Adicionar método de pagamento',
        addNewDebitCard: 'Adicionar novo cartão de débito',
        addNewBankAccount: 'Adicionar nova conta bancária',
        accountLastFour: 'Terminando em',
        cardLastFour: 'Cartão terminando em',
        addFirstPaymentMethod: 'Adicione um método de pagamento para enviar e receber pagamentos diretamente no aplicativo.',
        defaultPaymentMethod: 'Padrão',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Conta bancária • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'Preferências do aplicativo',
        },
        testSection: {
            title: 'Testar preferências',
            subtitle: 'Configurações para ajudar a depurar e testar o aplicativo em estágio.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Receba atualizações relevantes de recursos e notícias da Expensify',
        muteAllSounds: 'Silenciar todos os sons do Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modo de prioridade',
        explainerText: 'Escolha se deseja #focus apenas em chats não lidos e fixados, ou mostrar tudo com os chats mais recentes e fixados no topo.',
        priorityModes: {
            default: {
                label: 'Mais recente',
                description: 'Mostrar todos os chats ordenados por mais recentes',
            },
            gsd: {
                label: '#foco',
                description: 'Mostrar apenas não lidos ordenados alfabeticamente',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `em ${policyName}`,
        generatingPDF: 'Gerando PDF',
        waitForPDF: 'Por favor, aguarde enquanto geramos o PDF.',
        errorPDF: 'Ocorreu um erro ao tentar gerar seu PDF.',
        generatedPDF: 'Seu PDF de relatório foi gerado!',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrição do quarto',
        roomDescriptionOptional: 'Descrição do quarto (opcional)',
        explainerText: 'Defina uma descrição personalizada para a sala.',
    },
    groupChat: {
        lastMemberTitle: 'Atenção!',
        lastMemberWarning: 'Como você é a última pessoa aqui, sair tornará este chat inacessível para todos os membros. Tem certeza de que deseja sair?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Chat em grupo de ${displayName}`,
    },
    languagePage: {
        language: 'Idioma',
        aiGenerated: 'As traduções para este idioma são geradas automaticamente e podem conter erros.',
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
                label: 'Usar configurações do dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Escolha um tema abaixo ou sincronize com as configurações do seu dispositivo.',
    },
    termsOfUse: {
        phrase1: 'Ao fazer login, você concorda com o/a/as/os',
        phrase2: 'Termos de Serviço',
        phrase3: 'e',
        phrase4: 'Privacidade',
        phrase5: `A transmissão de dinheiro é fornecida por ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) de acordo com seu`,
        phrase6: 'licenças',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Não recebeu um código mágico?',
        enterAuthenticatorCode: 'Por favor, insira seu código do autenticador',
        enterRecoveryCode: 'Por favor, insira seu código de recuperação',
        requiredWhen2FAEnabled: 'Necessário quando a 2FA está ativada',
        requestNewCode: 'Solicitar um novo código em',
        requestNewCodeAfterErrorOccurred: 'Solicitar um novo código',
        error: {
            pleaseFillMagicCode: 'Por favor, insira seu código mágico',
            incorrectMagicCode: 'Código mágico incorreto ou inválido. Por favor, tente novamente ou solicite um novo código.',
            pleaseFillTwoFactorAuth: 'Por favor, insira seu código de autenticação de dois fatores',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Por favor, preencha todos os campos',
        pleaseFillPassword: 'Por favor, insira sua senha',
        pleaseFillTwoFactorAuth: 'Por favor, insira seu código de autenticação de dois fatores',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Insira seu código de autenticação de dois fatores para continuar',
        forgot: 'Esqueceu?',
        requiredWhen2FAEnabled: 'Necessário quando a 2FA está ativada',
        error: {
            incorrectPassword: 'Senha incorreta. Por favor, tente novamente.',
            incorrectLoginOrPassword: 'Login ou senha incorretos. Por favor, tente novamente.',
            incorrect2fa: 'Código de autenticação de dois fatores incorreto. Por favor, tente novamente.',
            twoFactorAuthenticationEnabled: 'Você tem a autenticação em duas etapas ativada nesta conta. Por favor, faça login usando seu e-mail ou número de telefone.',
            invalidLoginOrPassword: 'Login ou senha inválidos. Por favor, tente novamente ou redefina sua senha.',
            unableToResetPassword:
                'Não conseguimos alterar sua senha. Isso provavelmente se deve a um link de redefinição de senha expirado em um e-mail antigo de redefinição de senha. Enviamos um novo link para que você possa tentar novamente. Verifique sua Caixa de Entrada e sua pasta de Spam; ele deve chegar em apenas alguns minutos.',
            noAccess: 'Você não tem acesso a este aplicativo. Por favor, adicione seu nome de usuário do GitHub para obter acesso.',
            accountLocked: 'Sua conta foi bloqueada após muitas tentativas sem sucesso. Por favor, tente novamente após 1 hora.',
            fallback: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefone ou e-mail',
        error: {
            invalidFormatEmailLogin: 'O e-mail inserido é inválido. Por favor, corrija o formato e tente novamente.',
        },
        cannotGetAccountDetails: 'Não foi possível recuperar os detalhes da conta. Por favor, tente entrar novamente.',
        loginForm: 'Formulário de login',
        notYou: ({user}: NotYouParams) => `Não é ${user}?`,
    },
    onboarding: {
        welcome: 'Bem-vindo!',
        welcomeSignOffTitleManageTeam: 'Depois de concluir as tarefas acima, podemos explorar mais funcionalidades, como fluxos de trabalho de aprovação e regras!',
        welcomeSignOffTitle: 'É ótimo conhecê-lo!',
        explanationModal: {
            title: 'Bem-vindo ao Expensify',
            description: 'Um aplicativo para gerenciar seus gastos empresariais e pessoais na velocidade de um chat. Experimente e nos diga o que você acha. Muito mais por vir!',
            secondaryDescription: 'Para voltar para o Expensify Classic, basta tocar na sua foto de perfil > Ir para Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Bem-vindo ao Expensify',
            description: 'Um aplicativo para gerenciar todos os seus gastos empresariais e pessoais em um chat. Feito para o seu negócio, sua equipe e seus amigos.',
        },
        getStarted: 'Comece agora',
        whatsYourName: 'Qual é o seu nome?',
        peopleYouMayKnow: 'Pessoas que você pode conhecer já estão aqui! Verifique seu e-mail para se juntar a elas.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Alguém do ${domain} já criou um espaço de trabalho. Por favor, insira o código mágico enviado para ${email}.`,
        joinAWorkspace: 'Participar de um espaço de trabalho',
        listOfWorkspaces: 'Aqui está a lista de espaços de trabalho que você pode ingressar. Não se preocupe, você sempre pode ingressar neles mais tarde, se preferir.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membro${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Onde você trabalha?',
        errorSelection: 'Selecione uma opção para continuar',
        purpose: {
            title: 'O que você quer fazer hoje?',
            errorContinue: 'Por favor, pressione continuar para configurar',
            errorBackButton: 'Por favor, finalize as perguntas de configuração para começar a usar o aplicativo',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Ser reembolsado pelo meu empregador',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gerenciar as despesas da minha equipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Acompanhe e planeje despesas',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Converse e divida despesas com amigos',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Algo mais',
        },
        employees: {
            title: 'Quantos funcionários você tem?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 funcionários',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mais de 1.000 funcionários',
        },
        accounting: {
            title: 'Você usa algum software de contabilidade?',
            none: 'Nenhum',
        },
        error: {
            requiredFirstName: 'Por favor, insira seu primeiro nome para continuar',
        },
        workEmail: {
            title: 'Qual é o seu e-mail de trabalho?',
            subtitle: 'O Expensify funciona melhor quando você conecta seu e-mail de trabalho.',
            explanationModal: {
                descriptionOne: 'Encaminhe para receipts@expensify.com para digitalização',
                descriptionTwo: 'Junte-se aos seus colegas que já estão usando o Expensify',
                descriptionThree: 'Aproveite uma experiência mais personalizada',
            },
            addWorkEmail: 'Adicionar e-mail de trabalho',
        },
        workEmailValidation: {
            title: 'Verifique seu e-mail de trabalho',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Por favor, insira o código mágico enviado para ${workEmail}. Ele deve chegar em um ou dois minutos.`,
        },
        workEmailValidationError: {
            publicEmail: 'Por favor, insira um e-mail de trabalho válido de um domínio privado, por exemplo, mitch@company.com.',
            offline: 'Não conseguimos adicionar seu e-mail de trabalho, pois você parece estar offline.',
        },
        mergeBlockScreen: {
            title: 'Não foi possível adicionar o e-mail de trabalho',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Não conseguimos adicionar ${workEmail}. Por favor, tente novamente mais tarde em Configurações ou converse com o Concierge para obter orientação.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Faça um [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Faça um tour rápido pelo produto](${testDriveURL}) para ver por que o Expensify é a maneira mais rápida de fazer suas despesas.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Faça um [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Faça um test drive](${testDriveURL}) conosco e sua equipe ganha *3 meses grátis de Expensify!*`,
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Crie](${workspaceConfirmationLink}) um espaço de trabalho`,
                description: 'Crie um espaço de trabalho e configure as definições com a ajuda do seu especialista em configuração!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Crie um [espaço de trabalho](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    '*Crie um espaço de trabalho* para rastrear despesas, digitalizar recibos, conversar e muito mais.\n' +
                    '\n' +
                    '1. Clique em *Espaços de trabalho* > *Novo espaço de trabalho*.\n' +
                    '\n' +
                    `*Seu novo espaço de trabalho está pronto!* [Confira](${workspaceSettingsLink}).`,
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configure [categorias](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    '*Configure categorias* para que sua equipe possa categorizar despesas para relatórios fáceis.\n' +
                    '\n' +
                    '1. Clique em *Espaços de trabalho*.\n' +
                    '3. Selecione seu espaço de trabalho.\n' +
                    '4. Clique em *Categorias*.\n' +
                    '5. Desative quaisquer categorias que você não precise.\n' +
                    '6. Adicione suas próprias categorias no canto superior direito.\n' +
                    '\n' +
                    `[Leve-me para as configurações de categoria do espaço de trabalho](${workspaceCategoriesLink}).\n` +
                    '\n' +
                    `![Configurar categorias](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`,
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Envie uma despesa',
                description:
                    '*Envie uma despesa* inserindo um valor ou digitalizando um recibo.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar despesa*.\n' +
                    '3. Insira um valor ou digitalize um recibo.\n' +
                    `4. Adicione o e-mail ou número de telefone do seu chefe.\n` +
                    '5. Clique em *Criar*.\n' +
                    '\n' +
                    'E pronto!',
            },
            adminSubmitExpenseTask: {
                title: 'Envie uma despesa',
                description:
                    '*Envie uma despesa* inserindo um valor ou digitalizando um recibo.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar despesa*.\n' +
                    '3. Insira um valor ou digitalize um recibo.\n' +
                    '4. Confirme os detalhes.\n' +
                    '5. Clique em *Criar*.\n' +
                    '\n' +
                    `E pronto!`,
            },
            trackExpenseTask: {
                title: 'Rastreie uma despesa',
                description:
                    '*Rastreie uma despesa* em qualquer moeda, com ou sem recibo.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar despesa*.\n' +
                    '3. Insira um valor ou digitalize um recibo.\n' +
                    '4. Escolha seu espaço *pessoal*.\n' +
                    '5. Clique em *Criar*.\n' +
                    '\n' +
                    'E pronto! Sim, é simples assim.',
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Conecte-se${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' ao'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'seu' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    `Conecte-se${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? ' ao seu' : ' ao'} ${integrationName} para categorização automática de despesas e sincronização que torna o fechamento do mês muito fácil.\n` +
                    '\n' +
                    '1. Clique em *Configurações*.\n' +
                    '2. Vá para *Espaços de trabalho*.\n' +
                    '3. Selecione seu espaço de trabalho.\n' +
                    '4. Clique em *Contabilidade*.\n' +
                    `5. Encontre ${integrationName}.\n` +
                    '6. Clique em *Conectar*.\n' +
                    '\n' +
                    `${
                        integrationName && CONST.connectionsVideoPaths[integrationName]
                            ? `[Leve-me para a contabilidade](${workspaceAccountingLink}).\n\n![Conecte-se ao ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                            : `[Leve-me para a contabilidade](${workspaceAccountingLink}).`
                    }`,
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Conecte [seu cartão corporativo](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    `Conecte seu cartão corporativo para importar e categorizar despesas automaticamente.\n` +
                    '\n' +
                    '1. Clique em *Espaços de trabalho*.\n' +
                    '2. Selecione seu espaço de trabalho.\n' +
                    '3. Clique em *Cartões corporativos*.\n' +
                    '4. Siga as instruções para conectar seu cartão.\n' +
                    '\n' +
                    `[Leve-me para conectar meus cartões corporativos](${corporateCardLink}).`,
            },

            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Convide [sua equipe](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Convide sua equipe* para o Expensify para que eles possam começar a rastrear despesas hoje mesmo.\n' +
                    '\n' +
                    '1. Clique em *Espaços de trabalho*.\n' +
                    '3. Selecione seu espaço de trabalho.\n' +
                    '4. Clique em *Membros* > *Convidar membro*.\n' +
                    '5. Insira e-mails ou números de telefone. \n' +
                    '6. Adicione uma mensagem de convite personalizada, se desejar!\n' +
                    '\n' +
                    `[Leve-me para os membros do espaço de trabalho](${workspaceMembersLink}).\n` +
                    '\n' +
                    `![Convide sua equipe](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`,
            },

            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceMoreFeaturesLink}) => `Configure [categorias](${workspaceCategoriesLink}) e [tags](${workspaceMoreFeaturesLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    '*Configure categorias e tags* para que sua equipe possa categorizar despesas para relatórios fáceis.\n' +
                    '\n' +
                    `Importe-as automaticamente [conectando seu software de contabilidade](${workspaceAccountingLink}), ou configure-as manualmente nas [configurações do seu espaço de trabalho](${workspaceCategoriesLink}).`,
            },
            setupTagsTask: {
                title: ({workspaceMoreFeaturesLink}) => `Configure [tags](${workspaceMoreFeaturesLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    'Use tags para adicionar detalhes extras de despesas, como projetos, clientes, locais e departamentos. Se você precisar de vários níveis de tags, pode fazer upgrade para o plano Control.\n' +
                    '\n' +
                    '1. Clique em *Espaços de trabalho*.\n' +
                    '3. Selecione seu espaço de trabalho.\n' +
                    '4. Clique em *Mais recursos*.\n' +
                    '5. Habilite *Tags*.\n' +
                    '6. Navegue até *Tags* no editor do espaço de trabalho.\n' +
                    '7. Clique em *+ Adicionar tag* para criar as suas.\n' +
                    '\n' +
                    `[Leve-me para mais recursos](${workspaceMoreFeaturesLink}).\n` +
                    '\n' +
                    `![Configurar tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`,
            },

            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Convide seu [contador](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    '*Convide seu contador* para colaborar no seu espaço de trabalho e gerenciar as despesas da sua empresa.\n' +
                    '\n' +
                    '1. Clique em *Espaços de trabalho*.\n' +
                    '2. Selecione seu espaço de trabalho.\n' +
                    '3. Clique em *Membros*.\n' +
                    '4. Clique em *Convidar membro*.\n' +
                    '5. Insira o e-mail do seu contador.\n' +
                    '\n' +
                    `[Convide seu contador agora](${workspaceMembersLink}).`,
            },

            startChatTask: {
                title: 'Iniciar um bate-papo',
                description:
                    '*Inicie um bate-papo* com qualquer pessoa usando seu e-mail ou número de telefone.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Iniciar bate-papo*.\n' +
                    '3. Insira um e-mail ou número de telefone.\n' +
                    '\n' +
                    'Se eles ainda não estiverem usando o Expensify, serão convidados automaticamente.\n' +
                    '\n' +
                    'Cada bate-papo também se transformará em um e-mail ou mensagem de texto que eles podem responder diretamente.',
            },

            splitExpenseTask: {
                title: 'Dividir uma despesa',
                description:
                    '*Divida despesas* com uma ou mais pessoas.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Iniciar bate-papo*.\n' +
                    '3. Insira e-mails ou números de telefone.\n' +
                    '4. Clique no botão cinza *+* no bate-papo > *Dividir despesa*.\n' +
                    '5. Crie a despesa selecionando *Manual*, *Digitalizar* ou *Distância*.\n' +
                    '\n' +
                    'Sinta-se à vontade para adicionar mais detalhes, se quiser, ou apenas envie. Vamos te reembolsar!',
            },

            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Revise suas [configurações de espaço de trabalho](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    'Veja como revisar e atualizar as configurações do seu espaço de trabalho:\n' +
                    '1. Clique na aba de configurações.\n' +
                    '2. Clique em *Espaços de trabalho* > [Seu espaço de trabalho].\n' +
                    `[Vá para o seu espaço de trabalho](${workspaceSettingsLink}). Vamos rastreá-los na sala #admins.`,
            },
            createReportTask: {
                title: 'Crie seu primeiro relatório',
                description:
                    'Veja como criar um relatório:\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar relatório*.\n' +
                    '3. Clique em *Adicionar despesa*.\n' +
                    '4. Adicione sua primeira despesa.\n' +
                    '\n' +
                    'E pronto!',
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Faça um [test drive](${testDriveURL})` : 'Faça um test drive'),
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'Meu recibo de test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Ser reembolsado é tão fácil quanto enviar uma mensagem. Vamos ver o básico.',
            onboardingPersonalSpendMessage: 'Veja como rastrear seus gastos em poucos cliques.',
            onboardingMangeTeamMessage: ({onboardingCompanySize}: {onboardingCompanySize?: OnboardingCompanySize}) =>
                `Aqui está uma lista de tarefas que eu recomendaria para uma empresa do seu tamanho com ${onboardingCompanySize} remetentes:`,
            onboardingTrackWorkspaceMessage:
                '# Vamos configurar você\n👋 Estou aqui para ajudar! Para você começar, adaptei as configurações do seu espaço de trabalho para microempreendedores individuais e empresas semelhantes. Você pode ajustar seu espaço de trabalho clicando no link abaixo!\n\nVeja como rastrear seus gastos em poucos cliques:',
            onboardingChatSplitMessage: 'Dividir contas com amigos é tão fácil quanto enviar uma mensagem. Veja como.',
            onboardingAdminMessage: 'Aprenda a gerenciar o espaço de trabalho da sua equipe como administrador e enviar suas próprias despesas.',
            onboardingLookingAroundMessage:
                'O Expensify é mais conhecido por despesas, viagens e gerenciamento de cartões corporativos, mas fazemos muito mais do que isso. Diga-me o que lhe interessa e eu o ajudarei a começar.',
            onboardingTestDriveReceiverMessage: '*Você tem 3 meses grátis! Comece abaixo.*',
        },
        workspace: {
            title: 'Mantenha-se organizado com um espaço de trabalho',
            subtitle: 'Desbloqueie ferramentas poderosas para simplificar o gerenciamento de despesas, tudo em um só lugar. Com um espaço de trabalho, você pode:',
            explanationModal: {
                descriptionOne: 'Acompanhe e organize recibos',
                descriptionTwo: 'Categorizar e etiquetar despesas',
                descriptionThree: 'Criar e compartilhar relatórios',
            },
            price: 'Experimente gratuitamente por 30 dias, depois faça o upgrade por apenas <strong>US$5/mês</strong>.',
            createWorkspace: 'Criar espaço de trabalho',
        },
        confirmWorkspace: {
            title: 'Confirmar espaço de trabalho',
            subtitle: 'Crie um espaço de trabalho para rastrear recibos, reembolsar despesas, gerenciar viagens, criar relatórios e muito mais — tudo na velocidade do chat.',
        },
        inviteMembers: {
            title: 'Convidar membros',
            subtitle: 'Gerencie e compartilhe suas despesas com um contador ou inicie um grupo de viagem com amigos.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Não me mostre isso novamente',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'O nome não pode conter as palavras Expensify ou Concierge',
            hasInvalidCharacter: 'O nome não pode conter uma vírgula ou ponto e vírgula',
            requiredFirstName: 'O nome não pode estar vazio',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual é o seu nome legal?',
        enterDateOfBirth: 'Qual é a sua data de nascimento?',
        enterAddress: 'Qual é o seu endereço?',
        enterPhoneNumber: 'Qual é o seu número de telefone?',
        personalDetails: 'Detalhes pessoais',
        privateDataMessage: 'Esses detalhes são usados para viagens e pagamentos. Eles nunca são exibidos no seu perfil público.',
        legalName: 'Nome legal',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        address: 'Endereço',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `A data deve ser anterior a ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `A data deve ser após ${dateString}`,
            hasInvalidCharacter: 'O nome pode incluir apenas caracteres latinos',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Formato de código postal incorreto${zipFormat ? `Formato aceitável: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Por favor, certifique-se de que o número de telefone é válido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link foi reenviado',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Enviei um link mágico de login para ${login}. Por favor, verifique seu ${loginType} para entrar.`,
        resendLink: 'Reenviar link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Para validar ${secondaryLogin}, por favor, reenvie o código mágico das Configurações da Conta de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Se você não tiver mais acesso a ${primaryLogin}, por favor, desvincule suas contas.`,
        unlink: 'Desvincular',
        linkSent: 'Link enviado!',
        successfullyUnlinkedLogin: 'Login secundário desvinculado com sucesso!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Nosso provedor de e-mail suspendeu temporariamente os e-mails para ${login} devido a problemas de entrega. Para desbloquear seu login, siga estas etapas:`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirme que ${login} está escrito corretamente e é um endereço de e-mail real e válido para entrega.`,
        emailAliases: 'Os aliases de e-mail, como "expenses@domain.com", devem ter acesso à sua própria caixa de entrada de e-mail para que seja um login válido do Expensify.',
        ensureYourEmailClient: 'Certifique-se de que seu cliente de e-mail permita e-mails de expensify.com.',
        youCanFindDirections: 'Você pode encontrar instruções sobre como concluir esta etapa',
        helpConfigure: 'mas você pode precisar que o seu departamento de TI ajude a configurar as suas configurações de e-mail.',
        onceTheAbove: 'Depois de concluir as etapas acima, por favor entre em contato com',
        toUnblock: 'para desbloquear seu login.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Não conseguimos entregar mensagens SMS para ${login}, então suspendemos temporariamente. Por favor, tente validar seu número:`,
        validationSuccess: 'Seu número foi validado! Clique abaixo para enviar um novo código mágico de login.',
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
            return `Aguarde! Você precisa esperar ${timeText} antes de tentar validar seu número novamente.`;
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
        prompt: 'Mantenha-se atualizado vendo apenas os chats não lidos ou que precisam da sua atenção. Não se preocupe, você pode mudar isso a qualquer momento em',
        settings: 'configurações',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'O chat que você está procurando não pode ser encontrado.',
        getMeOutOfHere: 'Me tire daqui',
        iouReportNotFound: 'Os detalhes do pagamento que você está procurando não podem ser encontrados.',
        notHere: 'Hmm... não está aqui',
        pageNotFound: 'Ops, esta página não pode ser encontrada.',
        noAccess: 'Este chat ou despesa pode ter sido excluído ou você não tem acesso a ele.\n\nPara qualquer dúvida, entre em contato com concierge@expensify.com',
        goBackHome: 'Voltar para a página inicial',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ops... ${isBreakLine ? '\n' : ''}Algo deu errado`,
        subtitle: 'Não foi possível concluir sua solicitação. Por favor, tente novamente mais tarde.',
    },
    setPasswordPage: {
        enterPassword: 'Digite uma senha',
        setPassword: 'Definir senha',
        newPasswordPrompt: 'Sua senha deve ter pelo menos 8 caracteres, 1 letra maiúscula, 1 letra minúscula e 1 número.',
        passwordFormTitle: 'Bem-vindo de volta ao Novo Expensify! Por favor, defina sua senha.',
        passwordNotSet: 'Não conseguimos definir sua nova senha. Enviamos um novo link de senha para você tentar novamente.',
        setPasswordLinkInvalid: 'Este link para definir a senha é inválido ou expirou. Um novo está esperando por você na sua caixa de entrada de e-mail!',
        validateAccount: 'Verificar conta',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Adicione um emoji para dar aos seus colegas e amigos uma maneira fácil de saber o que está acontecendo. Você também pode adicionar uma mensagem, se quiser!',
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
        untilTomorrow: 'Até amanhã',
        untilTime: ({time}: UntilTimeParams) => `Até ${time}`,
        date: 'Data',
        time: 'Tempo',
        clearAfter: 'Limpar após',
        whenClearStatus: 'Quando devemos limpar seu status?',
        vacationDelegate: 'Delegado de férias',
        setVacationDelegate: `Defina um delegado de férias para aprovar relatórios em seu nome enquanto estiver fora do escritório.`,
        vacationDelegateError: 'Ocorreu um erro ao atualizar seu delegado de férias.',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `como delegado de férias de ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `para ${submittedToName} como delegado de férias de ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Você está designando ${nameOrEmail} como seu delegado de férias. Essa pessoa ainda não está em todos os seus espaços de trabalho. Se você continuar, um e-mail será enviado para todos os administradores dos seus espaços solicitando a inclusão dela.`,
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
        bankInfo: 'Informações bancárias',
        confirmBankInfo: 'Confirmar informações bancárias',
        manuallyAdd: 'Adicione sua conta bancária manualmente',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        accountEnding: 'Conta terminando em',
        thisBankAccount: 'Esta conta bancária será usada para pagamentos comerciais no seu espaço de trabalho.',
        accountNumber: 'Número da conta',
        routingNumber: 'Número de roteamento',
        chooseAnAccountBelow: 'Escolha uma conta abaixo',
        addBankAccount: 'Adicionar conta bancária',
        chooseAnAccount: 'Escolha uma conta',
        connectOnlineWithPlaid: 'Faça login no seu banco',
        connectManually: 'Conectar manualmente',
        desktopConnection: 'Nota: Para se conectar com Chase, Wells Fargo, Capital One ou Bank of America, por favor clique aqui para completar este processo em um navegador.',
        yourDataIsSecure: 'Seus dados estão seguros',
        toGetStarted: 'Adicione uma conta bancária para reembolsar despesas, emitir Cartões Expensify, coletar pagamentos de faturas e pagar contas, tudo em um só lugar.',
        plaidBodyCopy: 'Dê aos seus funcionários uma maneira mais fácil de pagar - e serem reembolsados - por despesas da empresa.',
        checkHelpLine: 'Seu número de roteamento e número da conta podem ser encontrados em um cheque da conta.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Para conectar uma conta bancária, por favor <a href="${contactMethodRoute}">adicione um e-mail como seu login principal</a> e tente novamente. Você pode adicionar seu número de telefone como um login secundário.`,
        hasBeenThrottledError: 'Ocorreu um erro ao adicionar sua conta bancária. Por favor, aguarde alguns minutos e tente novamente.',
        hasCurrencyError: {
            phrase1: 'Ops! Parece que a moeda do seu espaço de trabalho está definida para uma moeda diferente de USD. Para continuar, por favor vá para',
            link: 'suas configurações de espaço de trabalho',
            phrase2: 'para definir para USD e tentar novamente.',
        },
        error: {
            youNeedToSelectAnOption: 'Por favor, selecione uma opção para continuar',
            noBankAccountAvailable: 'Desculpe, não há nenhuma conta bancária disponível.',
            noBankAccountSelected: 'Por favor, escolha uma conta',
            taxID: 'Por favor, insira um número de identificação fiscal válido.',
            website: 'Por favor, insira um site válido',
            zipCode: `Por favor, insira um código postal válido usando o formato: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Por favor, insira um número de telefone válido.',
            email: 'Por favor, insira um endereço de e-mail válido.',
            companyName: 'Por favor, insira um nome comercial válido.',
            addressCity: 'Por favor, insira uma cidade válida',
            addressStreet: 'Por favor, insira um endereço de rua válido',
            addressState: 'Por favor, selecione um estado válido.',
            incorporationDateFuture: 'A data de incorporação não pode estar no futuro',
            incorporationState: 'Por favor, selecione um estado válido.',
            industryCode: 'Por favor, insira um código de classificação de indústria válido com seis dígitos.',
            restrictedBusiness: 'Por favor, confirme se a empresa não está na lista de empresas restritas.',
            routingNumber: 'Por favor, insira um número de roteamento válido.',
            accountNumber: 'Por favor, insira um número de conta válido.',
            routingAndAccountNumberCannotBeSame: 'Os números de roteamento e de conta não podem coincidir.',
            companyType: 'Por favor, selecione um tipo de empresa válido',
            tooManyAttempts:
                'Devido a um alto número de tentativas de login, esta opção foi desativada por 24 horas. Por favor, tente novamente mais tarde ou insira os detalhes manualmente.',
            address: 'Por favor, insira um endereço válido',
            dob: 'Por favor, selecione uma data de nascimento válida',
            age: 'Deve ter mais de 18 anos de idade',
            ssnLast4: 'Por favor, insira os últimos 4 dígitos válidos do SSN',
            firstName: 'Por favor, insira um nome válido.',
            lastName: 'Por favor, insira um sobrenome válido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Por favor, adicione uma conta de depósito padrão ou cartão de débito.',
            validationAmounts: 'Os valores de validação que você inseriu estão incorretos. Por favor, verifique novamente seu extrato bancário e tente novamente.',
            fullName: 'Por favor, insira um nome completo válido.',
            ownershipPercentage: 'Por favor, insira um número percentual válido',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Onde está localizada a sua conta bancária?',
        accountDetailsStepHeader: 'Quais são os detalhes da sua conta?',
        accountTypeStepHeader: 'Que tipo de conta é esta?',
        bankInformationStepHeader: 'Quais são os seus dados bancários?',
        accountHolderInformationStepHeader: 'Quais são os detalhes do titular da conta?',
        howDoWeProtectYourData: 'Como protegemos seus dados?',
        currencyHeader: 'Qual é a moeda da sua conta bancária?',
        confirmationStepHeader: 'Verifique suas informações.',
        confirmationStepSubHeader: 'Verifique os detalhes abaixo e marque a caixa de termos para confirmar.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Digite a senha do Expensify',
        alreadyAdded: 'Esta conta já foi adicionada.',
        chooseAccountLabel: 'Conta',
        successTitle: 'Conta bancária pessoal adicionada!',
        successMessage: 'Parabéns, sua conta bancária está configurada e pronta para receber reembolsos.',
    },
    attachmentView: {
        unknownFilename: 'Nome de arquivo desconhecido',
        passwordRequired: 'Por favor, insira uma senha',
        passwordIncorrect: 'Senha incorreta. Por favor, tente novamente.',
        failedToLoadPDF: 'Falha ao carregar o arquivo PDF',
        pdfPasswordForm: {
            title: 'PDF protegido por senha',
            infoText: 'Este PDF está protegido por senha.',
            beforeLinkText: 'Por favor',
            linkText: 'insira a senha',
            afterLinkText: 'para visualizá-lo.',
            formLabel: 'Ver PDF',
        },
        attachmentNotFound: 'Anexo não encontrado',
    },
    messages: {
        errorMessageInvalidPhone: `Por favor, insira um número de telefone válido sem parênteses ou traços. Se você estiver fora dos EUA, inclua o código do seu país (ex.: ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'E-mail inválido',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} já é membro de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Ao continuar com a solicitação para ativar sua Expensify Wallet, você confirma que leu, entendeu e aceita',
        facialScan: 'Política e Autorização de Varredura Facial da Onfido',
        tryAgain: 'Tente novamente',
        verifyIdentity: 'Verificar identidade',
        letsVerifyIdentity: 'Vamos verificar sua identidade',
        butFirst: `Mas primeiro, a parte chata. Leia as informações legais na próxima etapa e clique em "Aceitar" quando estiver pronto.`,
        genericError: 'Ocorreu um erro ao processar esta etapa. Por favor, tente novamente.',
        cameraPermissionsNotGranted: 'Ativar acesso à câmera',
        cameraRequestMessage: 'Precisamos de acesso à sua câmera para concluir a verificação da conta bancária. Por favor, habilite em Configurações > New Expensify.',
        microphonePermissionsNotGranted: 'Ativar acesso ao microfone',
        microphoneRequestMessage: 'Precisamos de acesso ao seu microfone para concluir a verificação da conta bancária. Por favor, habilite em Configurações > New Expensify.',
        originalDocumentNeeded: 'Por favor, envie uma imagem original do seu documento de identidade em vez de uma captura de tela ou imagem escaneada.',
        documentNeedsBetterQuality:
            'Seu documento de identificação parece estar danificado ou com recursos de segurança ausentes. Por favor, faça o upload de uma imagem original de um documento de identificação não danificado que esteja totalmente visível.',
        imageNeedsBetterQuality:
            'Há um problema com a qualidade da imagem do seu documento de identidade. Por favor, envie uma nova imagem onde todo o seu documento possa ser visto claramente.',
        selfieIssue: 'Há um problema com sua selfie/vídeo. Por favor, envie uma selfie/vídeo ao vivo.',
        selfieNotMatching: 'Sua selfie/vídeo não corresponde ao seu documento de identidade. Por favor, envie uma nova selfie/vídeo onde seu rosto possa ser visto claramente.',
        selfieNotLive: 'Sua selfie/vídeo não parece ser uma foto/vídeo ao vivo. Por favor, envie uma selfie/vídeo ao vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Detalhes adicionais',
        helpText: 'Precisamos confirmar as seguintes informações antes que você possa enviar e receber dinheiro da sua carteira.',
        helpTextIdologyQuestions: 'Precisamos fazer apenas mais algumas perguntas para finalizar a validação da sua identidade.',
        helpLink: 'Saiba mais sobre por que precisamos disso.',
        legalFirstNameLabel: 'Nome legal',
        legalMiddleNameLabel: 'Nome do meio legal',
        legalLastNameLabel: 'Sobrenome legal',
        selectAnswer: 'Por favor, selecione uma resposta para continuar',
        ssnFull9Error: 'Por favor, insira um SSN válido de nove dígitos.',
        needSSNFull9: 'Estamos tendo problemas para verificar seu SSN. Por favor, insira os nove dígitos completos do seu SSN.',
        weCouldNotVerify: 'Não conseguimos verificar',
        pleaseFixIt: 'Por favor, corrija esta informação antes de continuar.',
        failedKYCTextBefore: 'Não conseguimos verificar sua identidade. Por favor, tente novamente mais tarde ou entre em contato com',
        failedKYCTextAfter: 'se você tiver alguma dúvida.',
    },
    termsStep: {
        headerTitle: 'Termos e taxas',
        headerTitleRefactor: 'Taxas e termos',
        haveReadAndAgree: 'Li e concordo em receber',
        electronicDisclosures: 'divulgações eletrônicas',
        agreeToThe: 'Eu concordo com o/a/as/os',
        walletAgreement: 'Acordo da Wallet',
        enablePayments: 'Habilitar pagamentos',
        monthlyFee: 'Taxa mensal',
        inactivity: 'Inatividade',
        noOverdraftOrCredit: 'Sem recurso de cheque especial/crédito.',
        electronicFundsWithdrawal: 'Retirada eletrônica de fundos',
        standard: 'Padrão',
        reviewTheFees: 'Dê uma olhada em algumas taxas.',
        checkTheBoxes: 'Por favor, marque as caixas abaixo.',
        agreeToTerms: 'Concorde com os termos e você estará pronto para começar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `A Expensify Wallet é emitida por ${walletProgram}.`,
            perPurchase: 'Por compra',
            atmWithdrawal: 'Saque em caixa eletrônico',
            cashReload: 'Recarga de dinheiro',
            inNetwork: 'na rede',
            outOfNetwork: 'fora da rede',
            atmBalanceInquiry: 'Consulta de saldo no caixa eletrônico',
            inOrOutOfNetwork: '(dentro da rede ou fora da rede)',
            customerService: 'Atendimento ao cliente',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(após 12 meses sem transações)',
            weChargeOneFee: 'Cobramos 1 outro tipo de taxa. É:',
            fdicInsurance: 'Seus fundos são elegíveis para seguro FDIC.',
            generalInfo: 'Para informações gerais sobre contas pré-pagas, visite',
            conditionsDetails: 'Para detalhes e condições de todas as taxas e serviços, visite',
            conditionsPhone: 'ou ligando para +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Uma lista de todas as taxas do Expensify Wallet',
            typeOfFeeHeader: 'Todas as taxas',
            feeAmountHeader: 'Quantia',
            moreDetailsHeader: 'Detalhes',
            openingAccountTitle: 'Abrindo uma conta',
            openingAccountDetails: 'Não há taxa para abrir uma conta.',
            monthlyFeeDetails: 'Não há taxa mensal.',
            customerServiceTitle: 'Atendimento ao cliente',
            customerServiceDetails: 'Não há taxas de serviço ao cliente.',
            inactivityDetails: 'Não há taxa de inatividade.',
            sendingFundsTitle: 'Enviando fundos para outro titular de conta',
            sendingFundsDetails: 'Não há taxa para enviar fundos para outro titular de conta usando seu saldo, conta bancária ou cartão de débito.',
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
            contactExpensifyPayments: `Entre em contato com ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} ligando para +1 833-400-0904, ou por e-mail em`,
            contactExpensifyPayments2: 'ou faça login em',
            generalInformation: 'Para informações gerais sobre contas pré-pagas, visite',
            generalInformation2: 'Se você tiver uma reclamação sobre uma conta pré-paga, ligue para o Bureau de Proteção Financeira do Consumidor pelo 1-855-411-2372 ou visite',
            printerFriendlyView: 'Ver versão para impressão',
            automated: 'Automatizado',
            liveAgent: 'Agente ao vivo',
            instant: 'Instantâneo',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Habilitar pagamentos',
        activatedTitle: 'Carteira ativada!',
        activatedMessage: 'Parabéns, sua carteira está configurada e pronta para fazer pagamentos.',
        checkBackLaterTitle: 'Só um minuto...',
        checkBackLaterMessage: 'Ainda estamos revisando suas informações. Por favor, volte mais tarde.',
        continueToPayment: 'Continuar para o pagamento',
        continueToTransfer: 'Continuar a transferir',
    },
    companyStep: {
        headerTitle: 'Informações da empresa',
        subtitle: 'Quase pronto! Por motivos de segurança, precisamos confirmar algumas informações:',
        legalBusinessName: 'Nome comercial legal',
        companyWebsite: 'Site da empresa',
        taxIDNumber: 'Número de identificação fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        companyType: 'Tipo de empresa',
        incorporationDate: 'Data de incorporação',
        incorporationState: 'Estado de incorporação',
        industryClassificationCode: 'Código de classificação da indústria',
        confirmCompanyIsNot: 'Confirmo que esta empresa não está na lista de',
        listOfRestrictedBusinesses: 'lista de negócios restritos',
        incorporationDatePlaceholder: 'Data de início (aaaa-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa individual',
            OTHER: 'Outro',
        },
        industryClassification: 'Em qual setor a empresa está classificada?',
        industryClassificationCodePlaceholder: 'Pesquisar código de classificação da indústria',
    },
    requestorStep: {
        headerTitle: 'Informações pessoais',
        learnMore: 'Saiba mais',
        isMyDataSafe: 'Meus dados estão seguros?',
    },
    personalInfoStep: {
        personalInfo: 'Informações pessoais',
        enterYourLegalFirstAndLast: 'Qual é o seu nome legal?',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        legalName: 'Nome legal',
        enterYourDateOfBirth: 'Qual é a sua data de nascimento?',
        enterTheLast4: 'Quais são os últimos quatro dígitos do seu Número de Seguro Social?',
        dontWorry: 'Não se preocupe, não fazemos nenhuma verificação de crédito pessoal!',
        last4SSN: 'Últimos 4 do SSN',
        enterYourAddress: 'Qual é o seu endereço?',
        address: 'Endereço',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        byAddingThisBankAccount: 'Ao adicionar esta conta bancária, você confirma que leu, entendeu e aceitou',
        whatsYourLegalName: 'Qual é o seu nome legal?',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        whatsYourAddress: 'Qual é o seu endereço?',
        whatsYourSSN: 'Quais são os últimos quatro dígitos do seu Número de Seguro Social?',
        noPersonalChecks: 'Não se preocupe, não fazemos verificações de crédito pessoal aqui!',
        whatsYourPhoneNumber: 'Qual é o seu número de telefone?',
        weNeedThisToVerify: 'Precisamos disso para verificar sua carteira.',
    },
    businessInfoStep: {
        businessInfo: 'Informações da empresa',
        enterTheNameOfYourBusiness: 'Qual é o nome da sua empresa?',
        businessName: 'Nome legal da empresa',
        enterYourCompanyTaxIdNumber: 'Qual é o número de identificação fiscal da sua empresa?',
        taxIDNumber: 'Número de identificação fiscal',
        taxIDNumberPlaceholder: '9 dígitos',
        enterYourCompanyWebsite: 'Qual é o site da sua empresa?',
        companyWebsite: 'Site da empresa',
        enterYourCompanyPhoneNumber: 'Qual é o número de telefone da sua empresa?',
        enterYourCompanyAddress: 'Qual é o endereço da sua empresa?',
        selectYourCompanyType: 'Que tipo de empresa é essa?',
        companyType: 'Tipo de empresa',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Parceria',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Empresa individual',
            OTHER: 'Outro',
        },
        selectYourCompanyIncorporationDate: 'Qual é a data de incorporação da sua empresa?',
        incorporationDate: 'Data de incorporação',
        incorporationDatePlaceholder: 'Data de início (aaaa-mm-dd)',
        incorporationState: 'Estado de incorporação',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Em qual estado sua empresa foi incorporada?',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        companyAddress: 'Endereço da empresa',
        listOfRestrictedBusinesses: 'lista de negócios restritos',
        confirmCompanyIsNot: 'Confirmo que esta empresa não está na lista de',
        businessInfoTitle: 'Informações comerciais',
        legalBusinessName: 'Nome comercial legal',
        whatsTheBusinessName: 'Qual é o nome da empresa?',
        whatsTheBusinessAddress: 'Qual é o endereço comercial?',
        whatsTheBusinessContactInformation: 'Qual é a informação de contato comercial?',
        whatsTheBusinessRegistrationNumber: 'Qual é o número de registro da empresa?',
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Qual é o Número de Identificação do Empregador (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Qual é o Número Comercial (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Qual é o Número de Registro de IVA (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Qual é o Número Comercial Australiano (ABN)?';
                default:
                    return 'Qual é o número de IVA da UE?';
            }
        },
        whatsThisNumber: 'Qual é esse número?',
        whereWasTheBusinessIncorporated: 'Onde a empresa foi incorporada?',
        whatTypeOfBusinessIsIt: 'Que tipo de negócio é?',
        whatsTheBusinessAnnualPayment: 'Qual é o volume anual de pagamentos da empresa?',
        whatsYourExpectedAverageReimbursements: 'Qual é o seu valor médio de reembolso esperado?',
        registrationNumber: 'Número de registro',
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
                    return 'IVA UE';
            }
        },
        businessAddress: 'Endereço comercial',
        businessType: 'Tipo de negócio',
        incorporation: 'Incorporação',
        incorporationCountry: 'País de incorporação',
        incorporationTypeName: 'Tipo de incorporação',
        businessCategory: 'Categoria de negócios',
        annualPaymentVolume: 'Volume de pagamento anual',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume de pagamento anual em ${currencyCode}`,
        averageReimbursementAmount: 'Valor médio de reembolso',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Valor médio de reembolso em ${currencyCode}`,
        selectIncorporationType: 'Selecione o tipo de incorporação',
        selectBusinessCategory: 'Selecione a categoria de negócios',
        selectAnnualPaymentVolume: 'Selecione o volume de pagamento anual',
        selectIncorporationCountry: 'Selecione o país de incorporação',
        selectIncorporationState: 'Selecione o estado de incorporação',
        selectAverageReimbursement: 'Selecionar valor médio de reembolso',
        findIncorporationType: 'Encontrar tipo de incorporação',
        findBusinessCategory: 'Encontrar categoria de negócios',
        findAnnualPaymentVolume: 'Encontre o volume de pagamento anual',
        findIncorporationState: 'Encontrar estado de incorporação',
        findAverageReimbursement: 'Encontrar valor médio de reembolso',
        error: {
            registrationNumber: 'Por favor, forneça um número de registro válido.',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Por favor, informe um Número de Identificação do Empregador (EIN) válido';
                    case CONST.COUNTRY.CA:
                        return 'Por favor, informe um Número Comercial (BN) válido';
                    case CONST.COUNTRY.GB:
                        return 'Por favor, informe um Número de Registro de IVA (VRN) válido';
                    case CONST.COUNTRY.AU:
                        return 'Por favor, informe um Número Comercial Australiano (ABN) válido';
                    default:
                        return 'Por favor, informe um número de IVA da UE válido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Você possui 25% ou mais de',
        doAnyIndividualOwn25percent: 'Algum indivíduo possui 25% ou mais de',
        areThereMoreIndividualsWhoOwn25percent: 'Existem mais indivíduos que possuem 25% ou mais de',
        regulationRequiresUsToVerifyTheIdentity: 'A regulamentação exige que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        companyOwner: 'Proprietário de empresa',
        enterLegalFirstAndLastName: 'Qual é o nome legal do proprietário?',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        enterTheDateOfBirthOfTheOwner: 'Qual é a data de nascimento do proprietário?',
        enterTheLast4: 'Quais são os últimos 4 dígitos do Número de Seguro Social do proprietário?',
        last4SSN: 'Últimos 4 do SSN',
        dontWorry: 'Não se preocupe, não fazemos nenhuma verificação de crédito pessoal!',
        enterTheOwnersAddress: 'Qual é o endereço do proprietário?',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        legalName: 'Nome legal',
        address: 'Endereço',
        byAddingThisBankAccount: 'Ao adicionar esta conta bancária, você confirma que leu, entendeu e aceitou',
        owners: 'Proprietários',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informações do proprietário',
        businessOwner: 'Proprietário de empresa',
        signerInfo: 'Informações do assinante',
        doYouOwn: ({companyName}: CompanyNameParams) => `Você possui 25% ou mais de ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Algum indivíduo possui 25% ou mais de ${companyName}?`,
        regulationsRequire: 'Regulamentos exigem que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        legalFirstName: 'Nome legal',
        legalLastName: 'Sobrenome legal',
        whatsTheOwnersName: 'Qual é o nome legal do proprietário?',
        whatsYourName: 'Qual é o seu nome legal?',
        whatPercentage: 'Qual porcentagem do negócio pertence ao proprietário?',
        whatsYoursPercentage: 'Qual porcentagem do negócio você possui?',
        ownership: 'Propriedade',
        whatsTheOwnersDOB: 'Qual é a data de nascimento do proprietário?',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        whatsTheOwnersAddress: 'Qual é o endereço do proprietário?',
        whatsYourAddress: 'Qual é o seu endereço?',
        whatAreTheLast: 'Quais são os últimos 4 dígitos do Número de Seguro Social do proprietário?',
        whatsYourLast: 'Quais são os últimos 4 dígitos do seu Número de Seguro Social?',
        dontWorry: 'Não se preocupe, não fazemos nenhuma verificação de crédito pessoal!',
        last4: 'Últimos 4 do SSN',
        whyDoWeAsk: 'Por que pedimos isso?',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        legalName: 'Nome legal',
        ownershipPercentage: 'Porcentagem de propriedade',
        areThereOther: ({companyName}: CompanyNameParams) => `Existem outras pessoas que possuem 25% ou mais de ${companyName}?`,
        owners: 'Proprietários',
        addCertified: 'Adicione um organograma certificado que mostre os proprietários beneficiários',
        regulationRequiresChart:
            'A regulamentação exige que coletemos uma cópia certificada do organograma de propriedade que mostre cada indivíduo ou entidade que possua 25% ou mais do negócio.',
        uploadEntity: 'Carregar gráfico de propriedade da entidade',
        noteEntity: 'Nota: O gráfico de propriedade da entidade deve ser assinado pelo seu contador, consultor jurídico ou ser autenticado.',
        certified: 'Gráfico de propriedade de entidade certificada',
        selectCountry: 'Selecionar país',
        findCountry: 'Encontrar país',
        address: 'Endereço',
        chooseFile: 'Escolher arquivo',
        uploadDocuments: 'Carregar documentação adicional',
        pleaseUpload:
            'Por favor, envie documentação adicional abaixo para nos ajudar a verificar sua identidade como proprietário direto ou indireto de 25% ou mais da entidade empresarial.',
        acceptedFiles: 'Formatos de arquivo aceitos: PDF, PNG, JPEG. O tamanho total do arquivo para cada seção não pode exceder 5 MB.',
        proofOfBeneficialOwner: 'Prova de beneficiário final',
        proofOfBeneficialOwnerDescription:
            'Por favor, forneça uma declaração assinada e um organograma de um contador público, notário ou advogado verificando a propriedade de 25% ou mais do negócio. Deve estar datado dos últimos três meses e incluir o número da licença do signatário.',
        copyOfID: 'Cópia do documento de identidade do proprietário beneficiário',
        copyOfIDDescription: 'Exemplos: Passaporte, carteira de motorista, etc.',
        proofOfAddress: 'Comprovante de endereço para o proprietário beneficiário',
        proofOfAddressDescription: 'Exemplos: conta de luz, contrato de aluguel, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Por favor, faça o upload de um vídeo de uma visita ao local ou de uma chamada gravada com o oficial responsável pela assinatura. O oficial deve fornecer: nome completo, data de nascimento, nome da empresa, número de registro, número do código fiscal, endereço registrado, natureza do negócio e finalidade da conta.',
    },
    validationStep: {
        headerTitle: 'Validar conta bancária',
        buttonText: 'Concluir configuração',
        maxAttemptsReached: 'A validação para esta conta bancária foi desativada devido a muitas tentativas incorretas.',
        description: `Dentro de 1-2 dias úteis, enviaremos três (3) pequenas transações para sua conta bancária de um nome como "Expensify, Inc. Validation".`,
        descriptionCTA: 'Por favor, insira o valor de cada transação nos campos abaixo. Exemplo: 1.51.',
        reviewingInfo: 'Obrigado! Estamos revisando suas informações e entraremos em contato em breve. Por favor, verifique seu chat com o Concierge.',
        forNextStep: 'para os próximos passos para concluir a configuração da sua conta bancária.',
        letsChatCTA: 'Sim, vamos conversar',
        letsChatText: 'Quase lá! Precisamos da sua ajuda para verificar algumas últimas informações pelo chat. Pronto?',
        letsChatTitle: 'Vamos conversar!',
        enable2FATitle: 'Prevenir fraudes, habilitar autenticação de dois fatores (2FA)',
        enable2FAText: 'Levamos sua segurança a sério. Por favor, configure a autenticação de dois fatores (2FA) agora para adicionar uma camada extra de proteção à sua conta.',
        secureYourAccount: 'Proteja sua conta',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informações adicionais',
        checkAllThatApply: 'Marque todas as opções aplicáveis, caso contrário, deixe em branco.',
        iOwnMoreThan25Percent: 'Eu possuo mais de 25% de',
        someoneOwnsMoreThan25Percent: 'Outra pessoa possui mais de 25% de',
        additionalOwner: 'Proprietário beneficiário adicional',
        removeOwner: 'Remover este beneficiário final',
        addAnotherIndividual: 'Adicionar outra pessoa que possua mais de 25% de',
        agreement: 'Acordo:',
        termsAndConditions: 'termos e condições',
        certifyTrueAndAccurate: 'Eu certifico que as informações fornecidas são verdadeiras e precisas.',
        error: {
            certify: 'Deve certificar que as informações são verdadeiras e precisas',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Concluir verificação',
        confirmAgreements: 'Por favor, confirme os acordos abaixo.',
        certifyTrueAndAccurate: 'Eu certifico que as informações fornecidas são verdadeiras e precisas.',
        certifyTrueAndAccurateError: 'Por favor, certifique-se de que as informações são verdadeiras e precisas.',
        isAuthorizedToUseBankAccount: 'Estou autorizado a usar esta conta bancária empresarial para despesas comerciais.',
        isAuthorizedToUseBankAccountError: 'Você deve ser um responsável controlador com autorização para operar a conta bancária da empresa.',
        termsAndConditions: 'termos e condições',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Conectar conta bancária',
        finishButtonText: 'Concluir configuração',
        validateYourBankAccount: 'Valide sua conta bancária',
        validateButtonText: 'Validar',
        validationInputLabel: 'Transação',
        maxAttemptsReached: 'A validação para esta conta bancária foi desativada devido a muitas tentativas incorretas.',
        description: `Dentro de 1-2 dias úteis, enviaremos três (3) pequenas transações para sua conta bancária de um nome como "Expensify, Inc. Validation".`,
        descriptionCTA: 'Por favor, insira o valor de cada transação nos campos abaixo. Exemplo: 1.51.',
        reviewingInfo: 'Obrigado! Estamos revisando suas informações e entraremos em contato em breve. Por favor, verifique seu chat com o Concierge.',
        forNextSteps: 'para os próximos passos para concluir a configuração da sua conta bancária.',
        letsChatCTA: 'Sim, vamos conversar',
        letsChatText: 'Quase lá! Precisamos da sua ajuda para verificar algumas últimas informações pelo chat. Pronto?',
        letsChatTitle: 'Vamos conversar!',
        enable2FATitle: 'Prevenir fraudes, habilitar autenticação de dois fatores (2FA)',
        enable2FAText: 'Levamos sua segurança a sério. Por favor, configure a autenticação de dois fatores (2FA) agora para adicionar uma camada extra de proteção à sua conta.',
        secureYourAccount: 'Proteja sua conta',
    },
    countryStep: {
        confirmBusinessBank: 'Confirme a moeda e o país da conta bancária empresarial',
        confirmCurrency: 'Confirmar moeda e país',
        yourBusiness: 'A moeda da sua conta bancária empresarial deve corresponder à moeda do seu espaço de trabalho.',
        youCanChange: 'Você pode alterar a moeda do seu espaço de trabalho no seu',
        findCountry: 'Encontrar país',
        selectCountry: 'Selecionar país',
    },
    bankInfoStep: {
        whatAreYour: 'Quais são os detalhes da sua conta bancária empresarial?',
        letsDoubleCheck: 'Vamos verificar novamente se tudo está certo.',
        thisBankAccount: 'Esta conta bancária será usada para pagamentos comerciais no seu espaço de trabalho.',
        accountNumber: 'Número da conta',
        accountHolderNameDescription: 'Nome completo do signatário autorizado',
    },
    signerInfoStep: {
        signerInfo: 'Informações do assinante',
        areYouDirector: ({companyName}: CompanyNameParams) => `Você é um diretor ou executivo sênior na ${companyName}?`,
        regulationRequiresUs: 'A regulamentação exige que verifiquemos se o assinante tem autoridade para tomar essa ação em nome da empresa.',
        whatsYourName: 'Qual é o seu nome legal?',
        fullName: 'Nome completo legal',
        whatsYourJobTitle: 'Qual é o seu cargo?',
        jobTitle: 'Título do cargo',
        whatsYourDOB: 'Qual é a sua data de nascimento?',
        uploadID: 'Envie um documento de identidade e comprovante de endereço',
        personalAddress: 'Comprovante de endereço pessoal (por exemplo, conta de serviço público)',
        letsDoubleCheck: 'Vamos verificar se tudo está correto.',
        legalName: 'Nome legal',
        proofOf: 'Comprovante de endereço pessoal',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Digite o e-mail do diretor ou executivo sênior da ${companyName}`,
        regulationRequiresOneMoreDirector: 'A regulamentação exige pelo menos mais um diretor ou executivo sênior como signatário.',
        hangTight: 'Aguarde...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Digite os e-mails de dois diretores ou executivos seniores da ${companyName}`,
        sendReminder: 'Enviar um lembrete',
        chooseFile: 'Escolher arquivo',
        weAreWaiting: 'Estamos aguardando que outros verifiquem suas identidades como diretores ou executivos seniores da empresa.',
        id: 'Cópia do RG',
        proofOfDirectors: 'Prova de diretor(es)',
        proofOfDirectorsDescription: 'Exemplos: Perfil Corporativo da Oncorp ou Registro de Negócios.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale para Signatários, Usuários Autorizados e Proprietários Beneficiários.',
        PDSandFSG: 'Documentação de divulgação PDS + FSG',
        PDSandFSGDescription:
            'Nossa parceria com a Corpay utiliza uma conexão API para aproveitar sua vasta rede de parceiros bancários internacionais para viabilizar Reembolsos Globais na Expensify. De acordo com a regulamentação australiana, estamos fornecendo a você o Guia de Serviços Financeiros (FSG) e a Declaração de Divulgação de Produto (PDS) da Corpay.\n\nPor favor, leia os documentos FSG e PDS cuidadosamente, pois eles contêm detalhes completos e informações importantes sobre os produtos e serviços oferecidos pela Corpay. Guarde esses documentos para referência futura.',
        pleaseUpload: 'Por favor, envie documentação adicional abaixo para nos ajudar a verificar sua identidade como diretor ou executivo sênior da entidade empresarial.',
    },
    agreementsStep: {
        agreements: 'Acordos',
        pleaseConfirm: 'Por favor, confirme os acordos abaixo.',
        regulationRequiresUs: 'A regulamentação exige que verifiquemos a identidade de qualquer indivíduo que possua mais de 25% do negócio.',
        iAmAuthorized: 'Estou autorizado a usar a conta bancária empresarial para despesas comerciais.',
        iCertify: 'Certifico que as informações fornecidas são verdadeiras e precisas.',
        termsAndConditions: 'termos e condições',
        accept: 'Aceitar e adicionar conta bancária',
        iConsentToThe: 'Eu consinto com o',
        privacyNotice: 'aviso de privacidade',
        error: {
            authorized: 'Você deve ser um responsável controlador com autorização para operar a conta bancária da empresa.',
            certify: 'Por favor, certifique-se de que as informações são verdadeiras e precisas.',
            consent: 'Por favor, consinta com o aviso de privacidade',
        },
    },
    finishStep: {
        connect: 'Conectar conta bancária',
        letsFinish: 'Vamos terminar no chat!',
        thanksFor:
            'Obrigado por esses detalhes. Um agente de suporte dedicado agora revisará suas informações. Entraremos em contato se precisarmos de mais alguma coisa de você, mas, enquanto isso, sinta-se à vontade para nos contatar caso tenha alguma dúvida.',
        iHaveA: 'Eu tenho uma pergunta',
        enable2FA: 'Ative a autenticação de dois fatores (2FA) para prevenir fraudes',
        weTake: 'Levamos sua segurança a sério. Por favor, configure a autenticação de dois fatores (2FA) agora para adicionar uma camada extra de proteção à sua conta.',
        secure: 'Proteja sua conta',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Um momento',
        explanationLine: 'Estamos analisando suas informações. Você poderá continuar com os próximos passos em breve.',
    },
    session: {
        offlineMessageRetry: 'Parece que você está offline. Verifique sua conexão e tente novamente.',
    },
    travel: {
        header: 'Reservar viagem',
        title: 'Viaje com inteligência',
        subtitle: 'Use o Expensify Travel para obter as melhores ofertas de viagem e gerenciar todas as suas despesas empresariais em um só lugar.',
        features: {
            saveMoney: 'Economize em suas reservas',
            alerts: 'Receba atualizações e alertas em tempo real',
        },
        bookTravel: 'Reservar viagem',
        bookDemo: 'Agendar demonstração',
        bookADemo: 'Agendar uma demonstração',
        toLearnMore: 'para saber mais.',
        termsAndConditions: {
            header: 'Antes de continuarmos...',
            title: 'Termos e condições',
            subtitle: 'Por favor, concorde com o Expensify Travel',
            termsAndConditions: 'termos e condições',
            travelTermsAndConditions: 'termos e condições',
            agree: 'Eu concordo com o',
            error: 'Você deve concordar com os termos e condições do Expensify Travel para continuar.',
            defaultWorkspaceError:
                'Você precisa definir um espaço de trabalho padrão para habilitar o Expensify Travel. Vá para Configurações > Espaços de Trabalho > clique nos três pontos verticais ao lado de um espaço de trabalho > Definir como espaço de trabalho padrão, depois tente novamente!',
        },
        flight: 'Voo',
        flightDetails: {
            passenger: 'Passageiro',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Você tem uma <strong>escala de ${layover}</strong> antes deste voo</muted-text-label>`,
            takeOff: 'Decolagem',
            landing: 'Pouso',
            seat: 'Assento',
            class: 'Classe da Cabine',
            recordLocator: 'Localizador de registro',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Economia',
                premiumEconomy: 'Premium Economy',
                business: 'Negócio',
                first: 'Primeiro',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Convidado',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Tipo de quarto',
            cancellation: 'Política de cancelamento',
            cancellationUntil: 'Cancelamento gratuito até',
            confirmation: 'Número de confirmação',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Não reembolsável',
                freeCancellationUntil: 'Cancelamento gratuito até',
                partiallyRefundable: 'Parcialmente reembolsável',
            },
        },
        car: 'Carro',
        carDetails: {
            rentalCar: 'Aluguel de carro',
            pickUp: 'Pick-up',
            dropOff: 'Entrega',
            driver: 'Driver',
            carType: 'Tipo de carro',
            cancellation: 'Política de cancelamento',
            cancellationUntil: 'Cancelamento gratuito até',
            freeCancellation: 'Cancelamento gratuito',
            confirmation: 'Número de confirmação',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passageiro',
            departs: 'Parte',
            arrives: 'Chega',
            coachNumber: 'Número do coach',
            seat: 'Assento',
            fareDetails: 'Detalhes da tarifa',
            confirmation: 'Número de confirmação',
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
            title: 'Domínio',
            subtitle: 'Escolha um domínio para a configuração do Expensify Travel.',
            recommended: 'Recomendado',
        },
        domainPermissionInfo: {
            title: 'Domínio',
            restrictionPrefix: `Você não tem permissão para habilitar o Expensify Travel para o domínio`,
            restrictionSuffix: `Você precisará pedir a alguém desse domínio para habilitar a viagem.`,
            accountantInvitationPrefix: `Se você é contador, considere se juntar ao`,
            accountantInvitationLink: `Programa de contadores ExpensifyApproved!`,
            accountantInvitationSuffix: `para habilitar viagens para este domínio.`,
        },
        publicDomainError: {
            title: 'Comece com o Expensify Travel',
            message: `Você precisará usar seu e-mail de trabalho (por exemplo, nome@empresa.com) com o Expensify Travel, não seu e-mail pessoal (por exemplo, nome@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel foi desativado',
            message: `Seu administrador desativou o Expensify Travel. Por favor, siga a política de reservas da sua empresa para arranjos de viagem.`,
        },
        verifyCompany: {
            title: 'Comece a viajar hoje!',
            message: `Por favor, entre em contato com seu gerente de conta ou com salesteam@expensify.com para obter uma demonstração de viagem e ativá-la para sua empresa.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi reservado. Código de confirmação: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) => `Sua passagem para o voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi anulada.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Seu bilhete para o voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi reembolsado ou trocado.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi cancelado pela companhia aérea.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `A companhia aérea propôs uma alteração de horário para o voo ${airlineCode}; estamos aguardando confirmação.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Mudança de horário confirmada: voo ${airlineCode} agora parte em ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Seu voo ${airlineCode} (${origin} → ${destination}) em ${startDate} foi atualizado.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Sua classe de cabine foi atualizada para ${cabinClass} no voo ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Sua assento no voo ${airlineCode} foi confirmado.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Sua atribuição de assento no voo ${airlineCode} foi alterada.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Sua atribuição de assento no voo ${airlineCode} foi removida.`,
            paymentDeclined: 'O pagamento para sua reserva aérea falhou. Por favor, tente novamente.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Você cancelou sua reserva de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `O fornecedor cancelou sua reserva de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Sua reserva de ${type} foi remarcada. Novo número de confirmação: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada. Revise os novos detalhes no itinerário.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Seu bilhete de trem de ${origin} → ${destination} em ${startDate} foi reembolsado. Um crédito será processado.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Seu bilhete de trem de ${origin} → ${destination} em ${startDate} foi trocado.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Seu bilhete de trem de ${origin} → ${destination} em ${startDate} foi atualizado.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Sua reserva de ${type} foi atualizada.`,
        },
    },
    workspace: {
        common: {
            card: 'Cartões',
            expensifyCard: 'Expensify Card',
            companyCards: 'Cartões corporativos',
            workflows: 'Fluxos de Trabalho',
            workspace: 'Workspace',
            findWorkspace: 'Encontrar espaço de trabalho',
            edit: 'Editar espaço de trabalho',
            enabled: 'Ativado',
            disabled: 'Desativado',
            everyone: 'Todos',
            delete: 'Excluir espaço de trabalho',
            settings: 'Configurações',
            reimburse: 'Reembolsos',
            categories: 'Categorias',
            tags: 'Tags',
            customField1: 'Campo personalizado 1',
            customField2: 'Campo personalizado 2',
            customFieldHint: 'Adicione uma codificação personalizada que se aplique a todos os gastos deste membro.',
            reportFields: 'Campos do relatório',
            reportTitle: 'Título do relatório',
            reportField: 'Campo de relatório',
            taxes: 'Impostos',
            bills: 'Faturas',
            invoices: 'Faturas',
            travel: 'Viagem',
            members: 'Membros',
            accounting: 'Contabilidade',
            rules: 'Regras',
            displayedAs: 'Exibido como',
            plan: 'Plano',
            profile: 'Visão geral',
            bankAccount: 'Conta bancária',
            connectBankAccount: 'Conectar conta bancária',
            testTransactions: 'Testar transações',
            issueAndManageCards: 'Emitir e gerenciar cartões',
            reconcileCards: 'Conciliar cartões',
            selected: () => ({
                one: '1 selecionado',
                other: (count: number) => `${count} selecionado(s)`,
            }),
            settlementFrequency: 'Frequência de liquidação',
            setAsDefault: 'Definir como espaço de trabalho padrão',
            defaultNote: `Os recibos enviados para ${CONST.EMAIL.RECEIPTS} aparecerão neste espaço de trabalho.`,
            deleteConfirmation: 'Tem certeza de que deseja excluir este espaço de trabalho?',
            deleteWithCardsConfirmation: 'Tem certeza de que deseja excluir este espaço de trabalho? Isso removerá todos os feeds de cartões e cartões atribuídos.',
            unavailable: 'Espaço de trabalho indisponível',
            memberNotFound: 'Membro não encontrado. Para convidar um novo membro para o espaço de trabalho, por favor, use o botão de convite acima.',
            notAuthorized: `Você não tem acesso a esta página. Se você está tentando entrar neste espaço de trabalho, basta pedir ao proprietário do espaço de trabalho para adicioná-lo como membro. Algo mais? Entre em contato com ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ir para o espaço de trabalho',
            goToWorkspaces: 'Ir para espaços de trabalho',
            clearFilter: 'Limpar filtro',
            workspaceName: 'Nome do espaço de trabalho',
            workspaceOwner: 'Proprietário',
            workspaceType: 'Tipo de espaço de trabalho',
            workspaceAvatar: 'Avatar do espaço de trabalho',
            mustBeOnlineToViewMembers: 'Você precisa estar online para visualizar os membros deste espaço de trabalho.',
            moreFeatures: 'Mais recursos',
            requested: 'Solicitado',
            distanceRates: 'Taxas de distância',
            defaultDescription: 'Um lugar para todos os seus recibos e despesas.',
            descriptionHint: 'Compartilhar informações sobre este espaço de trabalho com todos os membros.',
            welcomeNote: 'Por favor, use o Expensify para enviar seus recibos para reembolso, obrigado!',
            subscription: 'Assinatura',
            markAsEntered: 'Marcar como inserido manualmente',
            markAsExported: 'Marcar como exportado',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportar para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vamos verificar se tudo está correto.',
            lineItemLevel: 'Nível de item linha',
            reportLevel: 'Nível de relatório',
            topLevel: 'Nível superior',
            appliedOnExport: 'Não importado para o Expensify, aplicado na exportação',
            shareNote: {
                header: 'Compartilhe seu espaço de trabalho com outros membros',
                content: {
                    firstPart:
                        'Compartilhe este código QR ou copie o link abaixo para facilitar que os membros solicitem acesso ao seu espaço de trabalho. Todas as solicitações para ingressar no espaço de trabalho aparecerão na',
                    secondPart: 'espaço para sua revisão.',
                },
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Conectar a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Criar nova conexão',
            reuseExistingConnection: 'Reutilizar conexão existente',
            existingConnections: 'Conexões existentes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Como você já se conectou ao ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} antes, você pode optar por reutilizar uma conexão existente ou criar uma nova.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Última sincronização em ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Não é possível conectar a ${connectionName} devido a um erro de autenticação.`,
            learnMore: 'Saiba mais.',
            memberAlternateText: 'Os membros podem enviar e aprovar relatórios.',
            adminAlternateText: 'Os administradores têm acesso total de edição a todos os relatórios e configurações do espaço de trabalho.',
            auditorAlternateText: 'Os auditores podem visualizar e comentar nos relatórios.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administração';
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
                instant: 'Instantâneo',
                immediate: 'Diário',
                trip: 'Por viagem',
                weekly: 'Semanalmente',
                semimonthly: 'Duas vezes por mês',
                monthly: 'Mensalmente',
            },
            planType: 'Tipo de plano',
            submitExpense: 'Envie suas despesas abaixo:',
            defaultCategory: 'Categoria padrão',
            viewTransactions: 'Ver transações',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Despesas de ${displayName}`,
        },
        perDiem: {
            subtitle: 'Defina taxas de diárias para controlar os gastos diários dos funcionários.',
            amount: 'Quantia',
            deleteRates: () => ({
                one: 'Taxa de exclusão',
                other: 'Excluir tarifas',
            }),
            deletePerDiemRate: 'Excluir taxa de diária',
            findPerDiemRate: 'Encontrar a taxa de diária',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas taxas?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Defina taxas de diárias para controlar os gastos diários dos funcionários. Importe taxas de uma planilha para começar.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `Uma taxa com o valor ${rate} já existe`,
            },
            importPerDiemRates: 'Importar taxas de diária',
            editPerDiemRate: 'Editar taxa de diárias',
            editPerDiemRates: 'Editar taxas de diárias',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Atualizar este destino irá alterá-lo para todas as subtarifas de ${destination} por diem.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Atualizar esta moeda irá alterá-la para todas as subtarifas de per diem de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Defina como as despesas fora do bolso são exportadas para o QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marcar cheques como "imprimir mais tarde"',
            exportDescription: 'Configure como os dados do Expensify são exportados para o QuickBooks Desktop.',
            date: 'Data de exportação',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transações do Cartão Expensify como',
            account: 'Conta',
            accountDescription: 'Escolha onde postar lançamentos contábeis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedores.',
            bankAccount: 'Conta bancária',
            notConfigured: 'Não configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cartão de crédito',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            exportCheckDescription: 'Vamos criar um cheque detalhado para cada relatório do Expensify e enviá-lo a partir da conta bancária abaixo.',
            exportJournalEntryDescription: 'Criaremos uma entrada de diário detalhada para cada relatório do Expensify e a postaremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma fatura de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, publicaremos no primeiro dia do próximo período aberto.',
            deepDiveExpensifyCard: 'As transações do Cartão Expensify serão exportadas automaticamente para uma "Conta de Responsabilidade do Cartão Expensify" criada com',
            deepDiveExpensifyCardIntegration: 'nossa integração.',
            outOfPocketTaxEnabledDescription:
                'O QuickBooks Desktop não suporta impostos em exportações de lançamentos contábeis. Como você tem impostos habilitados no seu espaço de trabalho, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cartão de crédito',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura do fornecedor',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lançamento contábil',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Vamos criar um cheque detalhado para cada relatório do Expensify e enviá-lo a partir da conta bancária abaixo.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de crédito a qualquer fornecedor correspondente no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Crédito Diversos' para associação.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Criaremos uma fatura detalhada do fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no dia 1º do próximo período aberto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Escolha onde exportar as transações do cartão de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Escolha de onde enviar os cheques.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'As contas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Cheques estão indisponíveis quando locais estão habilitados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Desktop e sincronize a conexão novamente.',
            qbdSetup: 'Configuração do QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Não é possível conectar a partir deste dispositivo',
                body1: 'Você precisará configurar esta conexão a partir do computador que hospeda o arquivo da sua empresa no QuickBooks Desktop.',
                body2: 'Depois de se conectar, você poderá sincronizar e exportar de qualquer lugar.',
            },
            setupPage: {
                title: 'Abra este link para conectar',
                body: 'Para concluir a configuração, abra o seguinte link no computador onde o QuickBooks Desktop está sendo executado.',
                setupErrorTitle: 'Algo deu errado',
                setupErrorBody1: 'A conexão do QuickBooks Desktop não está funcionando no momento. Por favor, tente novamente mais tarde ou',
                setupErrorBody2: 'se o problema persistir.',
                setupErrorBodyContactConcierge: 'entre em contato com o Concierge',
            },
            importDescription: 'Escolha quais configurações de codificação importar do QuickBooks Desktop para o Expensify.',
            classes: 'Classes',
            items: 'Itens',
            customers: 'Clientes/projetos',
            exportCompanyCardsDescription: 'Defina como as compras com cartão corporativo são exportadas para o QuickBooks Desktop.',
            defaultVendorDescription: 'Defina um fornecedor padrão que será aplicado a todas as transações de cartão de crédito ao exportar.',
            accountsDescription: 'Seu plano de contas do QuickBooks Desktop será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Desktop no Expensify.',
            tagsDisplayedAsDescription: 'Nível de item de linha',
            reportFieldsDisplayedAsDescription: 'Nível de relatório',
            customersDescription: 'Escolha como lidar com clientes/projetos do QuickBooks Desktop no Expensify.',
            advancedConfig: {
                autoSyncDescription: 'O Expensify sincronizará automaticamente com o QuickBooks Desktop todos os dias.',
                createEntities: 'Auto-criar entidades',
                createEntitiesDescription: 'A Expensify criará automaticamente fornecedores no QuickBooks Desktop se eles ainda não existirem.',
            },
            itemsDescription: 'Escolha como lidar com itens do QuickBooks Desktop no Expensify.',
        },
        qbo: {
            connectedTo: 'Conectado a',
            importDescription: 'Escolha quais configurações de codificação importar do QuickBooks Online para o Expensify.',
            classes: 'Classes',
            locations: 'Locais',
            customers: 'Clientes/projetos',
            accountsDescription: 'Seu plano de contas do QuickBooks Online será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            classesDescription: 'Escolha como lidar com as classes do QuickBooks Online no Expensify.',
            customersDescription: 'Escolha como lidar com clientes/projetos do QuickBooks Online no Expensify.',
            locationsDescription: 'Escolha como lidar com locais do QuickBooks Online no Expensify.',
            taxesDescription: 'Escolha como lidar com os impostos do QuickBooks Online no Expensify.',
            locationsLineItemsRestrictionDescription:
                'O QuickBooks Online não suporta Localizações no nível de linha para Cheques ou Faturas de Fornecedores. Se você gostaria de ter localizações no nível de linha, certifique-se de estar usando Lançamentos Contábeis e despesas de Cartão de Crédito/Débito.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online não suporta impostos em lançamentos contábeis. Por favor, altere sua opção de exportação para fatura de fornecedor ou cheque.',
            exportDescription: 'Configure como os dados do Expensify são exportados para o QuickBooks Online.',
            date: 'Data de exportação',
            exportInvoices: 'Exportar faturas para',
            exportExpensifyCard: 'Exportar transações do Cartão Expensify como',
            deepDiveExpensifyCard: 'As transações do Cartão Expensify serão exportadas automaticamente para uma "Conta de Responsabilidade do Cartão Expensify" criada com',
            deepDiveExpensifyCardIntegration: 'nossa integração.',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para o QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            receivable: 'Contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Arquivo de contas a receber', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Use esta conta ao exportar faturas para o QuickBooks Online.',
            exportCompanyCardsDescription: 'Defina como as compras com cartão corporativo são exportadas para o QuickBooks Online.',
            vendor: 'Fornecedor',
            defaultVendorDescription: 'Defina um fornecedor padrão que será aplicado a todas as transações de cartão de crédito ao exportar.',
            exportOutOfPocketExpensesDescription: 'Defina como as despesas fora do bolso são exportadas para o QuickBooks Online.',
            exportCheckDescription: 'Vamos criar um cheque detalhado para cada relatório do Expensify e enviá-lo a partir da conta bancária abaixo.',
            exportJournalEntryDescription: 'Criaremos uma entrada de diário detalhada para cada relatório do Expensify e a postaremos na conta abaixo.',
            exportVendorBillDescription:
                'Criaremos uma fatura de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, publicaremos no primeiro dia do próximo período aberto.',
            account: 'Conta',
            accountDescription: 'Escolha onde postar lançamentos contábeis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedores.',
            bankAccount: 'Conta bancária',
            notConfigured: 'Não configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cartão de crédito',
            companyCardsLocationEnabledDescription:
                'O QuickBooks Online não oferece suporte a locais nas exportações de contas a pagar de fornecedores. Como você tem locais habilitados no seu espaço de trabalho, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online não suporta impostos em exportações de lançamentos contábeis. Como você tem impostos ativados no seu espaço de trabalho, esta opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            advancedConfig: {
                autoSyncDescription: 'A Expensify sincronizará automaticamente com o QuickBooks Online todos os dias.',
                inviteEmployees: 'Convidar funcionários',
                inviteEmployeesDescription: 'Importar registros de funcionários do QuickBooks Online e convidar funcionários para este espaço de trabalho.',
                createEntities: 'Auto-criar entidades',
                createEntitiesDescription:
                    'A Expensify criará automaticamente fornecedores no QuickBooks Online se eles ainda não existirem e criará automaticamente clientes ao exportar faturas.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da conta será criado na conta do QuickBooks Online abaixo.',
                qboBillPaymentAccount: 'Conta de pagamento de fatura do QuickBooks',
                qboInvoiceCollectionAccount: 'Conta de cobrança de faturas do QuickBooks',
                accountSelectDescription: 'Escolha de onde pagar as contas e nós criaremos o pagamento no QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e criaremos o pagamento no QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Cartão de débito',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Cartão de crédito',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Fatura do fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Lançamento contábil',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Verificar',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de débito a quaisquer fornecedores correspondentes no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Débito Diversos' para associação.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de crédito a qualquer fornecedor correspondente no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Crédito Diversos' para associação.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Criaremos uma fatura detalhada do fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no dia 1º do próximo período aberto.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Escolha onde exportar as transações do cartão de débito.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Escolha onde exportar as transações do cartão de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'As contas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Cheques estão indisponíveis quando locais estão habilitados. Por favor, escolha uma opção de exportação diferente.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Escolha uma conta válida para exportação de fatura do fornecedor',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Escolha uma conta válida para exportação de lançamento contábil',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Escolha uma conta válida para exportação de cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Para usar a exportação de fatura de fornecedor, configure uma conta a pagar no QuickBooks Online.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Para usar a exportação de lançamentos contábeis, configure uma conta de diário no QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Para usar a exportação de cheques, configure uma conta bancária no QuickBooks Online',
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Online e sincronize a conexão novamente.',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Acumulação',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Despesas do próprio bolso serão exportadas quando aprovadas em definitivo',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas do próprio bolso serão exportadas quando pagas',
                },
            },
        },
        workspaceList: {
            joinNow: 'Junte-se agora',
            askToJoin: 'Pedir para participar',
        },
        xero: {
            organization: 'Organização Xero',
            organizationDescription: 'Escolha a organização Xero da qual você gostaria de importar dados.',
            importDescription: 'Escolha quais configurações de codificação importar do Xero para o Expensify.',
            accountsDescription: 'Seu plano de contas do Xero será importado para o Expensify como categorias.',
            accountsSwitchTitle: 'Escolha importar novas contas como categorias habilitadas ou desabilitadas.',
            accountsSwitchDescription: 'As categorias ativadas estarão disponíveis para os membros selecionarem ao criar suas despesas.',
            trackingCategories: 'Categorias de rastreamento',
            trackingCategoriesDescription: 'Escolha como lidar com as categorias de rastreamento do Xero no Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapear ${categoryName} do Xero para`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Escolha onde mapear ${categoryName} ao exportar para Xero.`,
            customers: 'Refaturar clientes',
            customersDescription:
                'Escolha se deseja refaturar clientes no Expensify. Seus contatos de clientes do Xero podem ser marcados em despesas e serão exportados para o Xero como uma fatura de venda.',
            taxesDescription: 'Escolha como lidar com os impostos do Xero no Expensify.',
            notImported: 'Não importado',
            notConfigured: 'Não configurado',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contato padrão do Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Campos do relatório',
            },
            exportDescription: 'Configure como os dados do Expensify são exportados para o Xero.',
            purchaseBill: 'Fatura de compra',
            exportDeepDiveCompanyCard:
                'As despesas exportadas serão lançadas como transações bancárias na conta bancária do Xero abaixo, e as datas das transações corresponderão às datas no seu extrato bancário.',
            bankTransactions: 'Transações bancárias',
            xeroBankAccount: 'Conta bancária Xero',
            xeroBankAccountDescription: 'Escolha onde as despesas serão registradas como transações bancárias.',
            exportExpensesDescription: 'Os relatórios serão exportados como uma fatura de compra com a data e o status selecionados abaixo.',
            purchaseBillDate: 'Data de emissão da fatura de compra',
            exportInvoices: 'Exportar faturas como',
            salesInvoice: 'Fatura de vendas',
            exportInvoicesDescription: 'As faturas de vendas sempre exibem a data em que a fatura foi enviada.',
            advancedConfig: {
                autoSyncDescription: 'A Expensify sincronizará automaticamente com o Xero todos os dias.',
                purchaseBillStatusTitle: 'Status da fatura de compra',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da conta será criado na conta Xero abaixo.',
                xeroBillPaymentAccount: 'Conta de pagamento de fatura Xero',
                xeroInvoiceCollectionAccount: 'Conta de cobrança de faturas Xero',
                xeroBillPaymentAccountDescription: 'Escolha de onde pagar as contas e criaremos o pagamento no Xero.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e nós criaremos o pagamento no Xero.',
            },
            exportDate: {
                label: 'Data de emissão da fatura de compra',
                description: 'Use esta data ao exportar relatórios para Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status da fatura de compra',
                description: 'Use este status ao exportar faturas de compra para Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Rascunho',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Aguardando aprovação',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Aguardando pagamento',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Por favor, adicione a conta no Xero e sincronize a conexão novamente.',
        },
        sageIntacct: {
            preferredExporter: 'Exportador preferido',
            taxSolution: 'Solução de impostos',
            notConfigured: 'Não configurado',
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Defina como as despesas fora do bolso são exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Relatórios de despesas',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faturas de fornecedores',
                },
            },
            nonReimbursableExpenses: {
                description: 'Defina como as compras com cartão corporativo são exportadas para o Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartões de crédito',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Faturas de fornecedores',
                },
            },
            creditCardAccount: 'Conta de cartão de crédito',
            defaultVendor: 'Fornecedor padrão',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Defina um fornecedor padrão que será aplicado às despesas reembolsáveis ${isReimbursable ? '' : 'não-'} que não têm um fornecedor correspondente no Sage Intacct.`,
            exportDescription: 'Configure como os dados do Expensify são exportados para o Sage Intacct.',
            exportPreferredExporterNote:
                'O exportador preferido pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões de empresa individuais nas Configurações de Domínio.',
            exportPreferredExporterSubNote: 'Uma vez definido, o exportador preferido verá os relatórios para exportação em sua conta.',
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: `Por favor, adicione a conta no Sage Intacct e sincronize a conexão novamente.`,
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify irá sincronizar automaticamente com Sage Intacct todos os dias.',
            inviteEmployees: 'Convidar funcionários',
            inviteEmployeesDescription:
                'Importe registros de funcionários do Sage Intacct e convide funcionários para este espaço de trabalho. Seu fluxo de aprovação será padrão para aprovação do gerente e pode ser configurado ainda mais na página de Membros.',
            syncReimbursedReports: 'Sincronizar relatórios reembolsados',
            syncReimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da fatura será criado na conta Sage Intacct abaixo.',
            paymentAccount: 'Conta de pagamento Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Subsidiária',
            subsidiarySelectDescription: 'Escolha a subsidiária no NetSuite da qual você gostaria de importar dados.',
            exportDescription: 'Configure como os dados do Expensify são exportados para o NetSuite.',
            exportInvoices: 'Exportar faturas para',
            journalEntriesTaxPostingAccount: 'Lançamento contábil na conta de imposto',
            journalEntriesProvTaxPostingAccount: 'Lançamentos contábeis na conta de lançamento de imposto provincial',
            foreignCurrencyAmount: 'Exportar valor em moeda estrangeira',
            exportToNextOpenPeriod: 'Exportar para o próximo período aberto',
            nonReimbursableJournalPostingAccount: 'Conta de lançamento de diário não reembolsável',
            reimbursableJournalPostingAccount: 'Conta de lançamento de diário reembolsável',
            journalPostingPreference: {
                label: 'Preferência de lançamento de lançamentos contábeis',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrada única e detalhada para cada relatório',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Entrada única para cada despesa',
                },
            },
            invoiceItem: {
                label: 'Item de fatura',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Crie um para mim',
                        description: 'Vamos criar um "item de linha de fatura do Expensify" para você ao exportar (se ainda não existir um).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Selecionar existente',
                        description: 'Vamos vincular as faturas do Expensify ao item selecionado abaixo.',
                    },
                },
            },
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Relatórios de despesas',
                        reimbursableDescription: 'Despesas do próprio bolso serão exportadas como relatórios de despesas para o NetSuite.',
                        nonReimbursableDescription: 'Despesas de cartão corporativo serão exportadas como relatórios de despesas para NetSuite.',
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
                        label: 'Lançamentos contábeis',
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
                autoSyncDescription: 'A Expensify sincronizará automaticamente com o NetSuite todos os dias.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da fatura será criado na conta do NetSuite abaixo.',
                reimbursementsAccount: 'Conta de reembolsos',
                reimbursementsAccountDescription: 'Escolha a conta bancária que você usará para reembolsos, e nós criaremos o pagamento associado no NetSuite.',
                collectionsAccount: 'Conta de cobranças',
                collectionsAccountDescription: 'Uma vez que uma fatura é marcada como paga no Expensify e exportada para o NetSuite, ela aparecerá na conta abaixo.',
                approvalAccount: 'Conta de aprovação A/P',
                approvalAccountDescription:
                    'Escolha a conta contra a qual as transações serão aprovadas no NetSuite. Se você estiver sincronizando relatórios reembolsados, esta também será a conta contra a qual os pagamentos de faturas serão criados.',
                defaultApprovalAccount: 'NetSuite padrão',
                inviteEmployees: 'Convide funcionários e defina aprovações',
                inviteEmployeesDescription:
                    'Importe registros de funcionários do NetSuite e convide funcionários para este workspace. Seu fluxo de aprovação será padrão para aprovação do gerente e pode ser configurado na página *Membros*.',
                autoCreateEntities: 'Auto-criar funcionários/fornecedores',
                enableCategories: 'Habilitar categorias recém-importadas',
                customFormID: 'ID do formulário personalizado',
                customFormIDDescription:
                    'Por padrão, o Expensify criará lançamentos usando o formulário de transação preferido definido no NetSuite. Alternativamente, você pode designar um formulário de transação específico a ser usado.',
                customFormIDReimbursable: 'Despesa do próprio bolso',
                customFormIDNonReimbursable: 'Despesa com cartão corporativo',
                exportReportsTo: {
                    label: 'Nível de aprovação do relatório de despesas',
                    description:
                        'Depois que um relatório de despesas é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de postar.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Apenas aprovado pelo supervisor',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Apenas contabilidade aprovada',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor e contabilidade aprovados',
                    },
                },
                accountingMethods: {
                    label: 'Quando Exportar',
                    description: 'Escolha quando exportar as despesas:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Acumulação',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Dinheiro',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Despesas do próprio bolso serão exportadas quando aprovadas em definitivo',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Despesas do próprio bolso serão exportadas quando pagas',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Nível de aprovação de fatura do fornecedor',
                    description:
                        'Uma vez que uma fatura de fornecedor é aprovada no Expensify e exportada para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de postar.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Aguardando aprovação',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Aprovado para postagem',
                    },
                },
                exportJournalsTo: {
                    label: 'Nível de aprovação de lançamento contábil',
                    description:
                        'Depois que um lançamento contábil é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de lançá-lo.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Preferência padrão do NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Aguardando aprovação',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Aprovado para postagem',
                    },
                },
                error: {
                    customFormID: 'Por favor, insira um ID de formulário personalizado numérico válido.',
                },
            },
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Por favor, adicione a conta no NetSuite e sincronize a conexão novamente.',
            noVendorsFound: 'Nenhum fornecedor encontrado',
            noVendorsFoundDescription: 'Por favor, adicione fornecedores no NetSuite e sincronize a conexão novamente.',
            noItemsFound: 'Nenhum item de fatura encontrado',
            noItemsFoundDescription: 'Por favor, adicione itens de fatura no NetSuite e sincronize a conexão novamente.',
            noSubsidiariesFound: 'Nenhuma subsidiária encontrada',
            noSubsidiariesFoundDescription: 'Por favor, adicione uma subsidiária no NetSuite e sincronize a conexão novamente.',
            tokenInput: {
                title: 'Configuração do NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Instale o pacote Expensify',
                        description: 'No NetSuite, vá para *Customization > SuiteBundler > Search & Install Bundles* > procure por "Expensify" > instale o pacote.',
                    },
                    enableTokenAuthentication: {
                        title: 'Habilitar autenticação baseada em token',
                        description: 'No NetSuite, vá para *Setup > Company > Enable Features > SuiteCloud* > habilite a *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Habilitar serviços web SOAP',
                        description: 'No NetSuite, vá para *Setup > Company > Enable Features > SuiteCloud* > habilite *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Criar um token de acesso',
                        description:
                            'No NetSuite, vá para *Setup > Users/Roles > Access Tokens* > crie um token de acesso para o aplicativo "Expensify" e para o papel "Expensify Integration" ou "Administrator".\n\n*Importante:* Certifique-se de salvar o *Token ID* e o *Token Secret* desta etapa. Você precisará deles para a próxima etapa.',
                    },
                    enterCredentials: {
                        title: 'Insira suas credenciais do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'No NetSuite, vá para *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorias de despesas',
                expenseCategoriesDescription: 'Suas categorias de despesas do NetSuite serão importadas para o Expensify como categorias.',
                crossSubsidiaryCustomers: 'Clientes/projetos entre subsidiárias',
                importFields: {
                    departments: {
                        title: 'Departamentos',
                        subtitle: 'Escolha como lidar com os *departments* do NetSuite no Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Escolha como lidar com *classes* no Expensify.',
                    },
                    locations: {
                        title: 'Locais',
                        subtitle: 'Escolha como lidar com *localizações* no Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clientes/projetos',
                    subtitle: 'Escolha como gerenciar *clientes* e *projetos* do NetSuite no Expensify.',
                    importCustomers: 'Importar clientes',
                    importJobs: 'Importar projetos',
                    customers: 'clientes',
                    jobs: 'projetos',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('e')}, ${importType}`,
                },
                importTaxDescription: 'Importar grupos de impostos do NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Escolha uma opção abaixo:',
                    label: ({importedTypes}: ImportedTypesParams) => `Importado como ${importedTypes.join('e')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Por favor, insira o ${fieldName}`,
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Adicionar segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Ver instruções detalhadas',
                        helpText: 'sobre a configuração de segmentos/registros personalizados.',
                        emptyTitle: 'Adicionar um segmento personalizado ou registro personalizado',
                        fields: {
                            segmentName: 'Nome',
                            internalID: 'ID Interno',
                            scriptID: 'Script ID',
                            customRecordScriptID: 'ID da coluna de transação',
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
                            segmentRecordType: 'Você quer adicionar um segmento personalizado ou um registro personalizado?',
                            customSegmentNameTitle: 'Qual é o nome do segmento personalizado?',
                            customRecordNameTitle: 'Qual é o nome do registro personalizado?',
                            customSegmentNameFooter: `Você pode encontrar nomes de segmentos personalizados no NetSuite na página *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Você pode encontrar nomes de registros personalizados no NetSuite inserindo o "Campo de Coluna de Transação" na pesquisa global.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Qual é o ID interno?',
                            customSegmentInternalIDFooter: `Primeiro, certifique-se de que você ativou os IDs internos no NetSuite em *Home > Set Preferences > Show Internal ID.*\n\nVocê pode encontrar IDs internos de segmentos personalizados no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique no hyperlink ao lado de *Custom Record Type*.\n4. Encontre o ID interno na tabela na parte inferior.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Você pode encontrar os IDs internos de registros personalizados no NetSuite seguindo estas etapas:\n\n1. Digite "Transaction Line Fields" na busca global.\n2. Clique em um registro personalizado.\n3. Encontre o ID interno no lado esquerdo.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Qual é o ID do script?',
                            customSegmentScriptIDFooter: `Você pode encontrar IDs de script de segmento personalizado no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique na guia *Application and Sourcing* perto da parte inferior, então:\n    a. Se você quiser exibir o segmento personalizado como uma *tag* (no nível do item de linha) no Expensify, clique na subguia *Transaction Columns* e use o *Field ID*.\n    b. Se você quiser exibir o segmento personalizado como um *report field* (no nível do relatório) no Expensify, clique na subguia *Transactions* e use o *Field ID*.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Qual é o ID da coluna de transação?',
                            customRecordScriptIDFooter: `Você pode encontrar IDs de script de registro personalizado no NetSuite em:\n\n1. Digite "Transaction Line Fields" na pesquisa global.\n2. Clique em um registro personalizado.\n3. Encontre o ID do script no lado esquerdo.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Como este segmento personalizado deve ser exibido no Expensify?',
                            customRecordMappingTitle: 'Como este registro personalizado deve ser exibido no Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Um segmento/registro personalizado com este ${fieldName?.toLowerCase()} já existe`,
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Adicionar lista personalizada',
                        recordTitle: 'Lista personalizada',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Ver instruções detalhadas',
                        helpText: 'sobre a configuração de listas personalizadas.',
                        emptyTitle: 'Adicionar uma lista personalizada',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID Interno',
                            transactionFieldID: 'ID do campo de transação',
                            mapping: 'Exibido como',
                        },
                        removeTitle: 'Remover lista personalizada',
                        removePrompt: 'Tem certeza de que deseja remover esta lista personalizada?',
                        addForm: {
                            listNameTitle: 'Escolha uma lista personalizada',
                            transactionFieldIDTitle: 'Qual é o ID do campo de transação?',
                            transactionFieldIDFooter: `Você pode encontrar os IDs dos campos de transação no NetSuite seguindo estas etapas:\n\n1. Digite "Transaction Line Fields" na pesquisa global.\n2. Clique em uma lista personalizada.\n3. Encontre o ID do campo de transação no lado esquerdo.\n\n_Para instruções mais detalhadas, [visite nosso site de ajuda](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Como essa lista personalizada deve ser exibida no Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Uma lista personalizada com este ID de campo de transação já existe`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite employee default',
                        description: 'Não importado para o Expensify, aplicado na exportação',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Se você usar ${importField} no NetSuite, aplicaremos o padrão definido no registro do funcionário ao exportar para Relatório de Despesas ou Lançamento Contábil.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Nível de item linha',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} será selecionável para cada despesa individual no relatório de um funcionário.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Campos do relatório',
                        description: 'Nível de relatório',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} seleção será aplicada a todas as despesas no relatório de um funcionário.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuração do Sage Intacct',
            prerequisitesTitle: 'Antes de se conectar...',
            downloadExpensifyPackage: 'Baixe o pacote Expensify para Sage Intacct',
            followSteps: 'Siga os passos nas nossas instruções de Como fazer: Conectar ao Sage Intacct',
            enterCredentials: 'Insira suas credenciais do Sage Intacct',
            entity: 'Entity',
            employeeDefault: 'Padrão de funcionário Sage Intacct',
            employeeDefaultDescription: 'O departamento padrão do funcionário será aplicado às suas despesas no Sage Intacct, se existir.',
            displayedAsTagDescription: 'O departamento será selecionável para cada despesa individual no relatório de um funcionário.',
            displayedAsReportFieldDescription: 'A seleção de departamento será aplicada a todas as despesas no relatório de um funcionário.',
            toggleImportTitleFirstPart: 'Escolha como lidar com o Sage Intacct',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Tipos de despesas',
            expenseTypesDescription: 'Seus tipos de despesas do Sage Intacct serão importados para o Expensify como categorias.',
            accountTypesDescription: 'Seu plano de contas do Sage Intacct será importado para o Expensify como categorias.',
            importTaxDescription: 'Importar taxa de imposto de compra do Sage Intacct.',
            userDefinedDimensions: 'Dimensões definidas pelo usuário',
            addUserDefinedDimension: 'Adicionar dimensão definida pelo usuário',
            integrationName: 'Nome da integração',
            dimensionExists: 'Uma dimensão com este nome já existe.',
            removeDimension: 'Remover dimensão definida pelo usuário',
            removeDimensionPrompt: 'Tem certeza de que deseja remover esta dimensão definida pelo usuário?',
            userDefinedDimension: 'Dimensão definida pelo usuário',
            addAUserDefinedDimension: 'Adicionar uma dimensão definida pelo usuário',
            detailedInstructionsLink: 'Ver instruções detalhadas',
            detailedInstructionsRestOfSentence: 'sobre a adição de dimensões definidas pelo usuário.',
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
            free: 'Grátis',
            control: 'Controle',
            collect: 'Coletar',
        },
        companyCards: {
            addCards: 'Adicionar cartões',
            selectCards: 'Selecionar cartões',
            addNewCard: {
                other: 'Outro',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: `Quem é o emissor do seu cartão?`,
                whoIsYourBankAccount: 'Qual é o seu banco?',
                whereIsYourBankLocated: 'Onde está localizado o seu banco?',
                howDoYouWantToConnect: 'Como você deseja se conectar ao seu banco?',
                learnMoreAboutOptions: {
                    text: 'Saiba mais sobre estes',
                    linkText: 'opções.',
                },
                commercialFeedDetails: 'Requer configuração com seu banco. Isso é normalmente usado por empresas maiores e geralmente é a melhor opção se você se qualificar.',
                commercialFeedPlaidDetails: `Requer configuração com seu banco, mas nós iremos guiá-lo. Isso geralmente é limitado a empresas maiores.`,
                directFeedDetails: 'A abordagem mais simples. Conecte-se imediatamente usando suas credenciais principais. Este método é o mais comum.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Ative seu feed ${provider}`,
                    heading:
                        'Temos uma integração direta com o emissor do seu cartão e podemos importar seus dados de transação para o Expensify de forma rápida e precisa.\n\nPara começar, simplesmente:',
                    visa: 'Temos integrações globais com a Visa, embora a elegibilidade varie de acordo com o banco e o programa do cartão.\n\nPara começar, simplesmente:',
                    mastercard: 'Temos integrações globais com a Mastercard, embora a elegibilidade varie de acordo com o banco e o programa do cartão.\n\nPara começar, simplesmente:',
                    vcf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para obter instruções detalhadas sobre como configurar seus Cartões Comerciais Visa.\n\n2. [Entre em contato com seu banco](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) para verificar se eles oferecem suporte a um feed comercial para o seu programa e peça para ativá-lo.\n\n3. *Assim que o feed estiver ativado e você tiver seus detalhes, continue para a próxima tela.*`,
                    gl1025: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) para descobrir se a American Express pode habilitar um feed comercial para o seu programa.\n\n2. Assim que o feed for habilitado, a Amex enviará uma carta de produção.\n\n3. *Assim que tiver as informações do feed, continue para a próxima tela.*`,
                    cdf: `1. Visite [este artigo de ajuda](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para obter instruções detalhadas sobre como configurar seus cartões comerciais Mastercard.\n\n2. [Contate seu banco](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) para verificar se eles oferecem suporte a um feed comercial para o seu programa e peça para ativá-lo.\n\n3. *Depois que o feed estiver ativado e você tiver seus detalhes, continue para a próxima tela.*`,
                    stripe: `1. Visite o Dashboard do Stripe e vá para [Configurações](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Em Integrações de Produto, clique em Ativar ao lado de Expensify.\n\n3. Assim que o feed estiver ativado, clique em Enviar abaixo e nós trabalharemos para adicioná-lo.`,
                },
                whatBankIssuesCard: 'Qual banco emite esses cartões?',
                enterNameOfBank: 'Digite o nome do banco',
                feedDetails: {
                    vcf: {
                        title: 'Quais são os detalhes do feed Visa?',
                        processorLabel: 'ID do Processador',
                        bankLabel: 'ID da instituição financeira (banco)',
                        companyLabel: 'ID da Empresa',
                        helpLabel: 'Onde encontro esses IDs?',
                    },
                    gl1025: {
                        title: `Qual é o nome do arquivo de entrega Amex?`,
                        fileNameLabel: 'Nome do arquivo de entrega',
                        helpLabel: 'Onde encontro o nome do arquivo de entrega?',
                    },
                    cdf: {
                        title: `Qual é o ID de distribuição do Mastercard?`,
                        distributionLabel: 'Distribution ID',
                        helpLabel: 'Onde encontro o ID de distribuição?',
                    },
                },
                amexCorporate: 'Selecione esta opção se a frente dos seus cartões disser "Corporate"',
                amexBusiness: 'Selecione esta opção se a frente dos seus cartões disser "Business"',
                amexPersonal: 'Selecione esta opção se seus cartões forem pessoais',
                error: {
                    pleaseSelectProvider: 'Por favor, selecione um provedor de cartão antes de continuar.',
                    pleaseSelectBankAccount: 'Por favor, selecione uma conta bancária antes de continuar.',
                    pleaseSelectBank: 'Por favor, selecione um banco antes de continuar.',
                    pleaseSelectCountry: 'Por favor, selecione um país antes de continuar.',
                    pleaseSelectFeedType: 'Por favor, selecione um tipo de feed antes de continuar.',
                },
            },
            assignCard: 'Atribuir cartão',
            findCard: 'Encontrar cartão',
            cardNumber: 'Número do cartão',
            commercialFeed: 'Feed comercial',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Cartões ${feedName}`,
            directFeed: 'Feed direto',
            whoNeedsCardAssigned: 'Quem precisa de um cartão atribuído?',
            chooseCard: 'Escolha um cartão',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Escolha um cartão para ${assignee} do feed de cartões ${feed}.`,
            noActiveCards: 'Nenhum cartão ativo neste feed',
            somethingMightBeBroken: 'Ou algo pode estar quebrado. De qualquer forma, se você tiver alguma dúvida, apenas',
            contactConcierge: 'contatar Concierge',
            chooseTransactionStartDate: 'Escolha uma data de início para a transação',
            startDateDescription: 'Importaremos todas as transações a partir desta data. Se nenhuma data for especificada, iremos o mais longe possível conforme permitido pelo seu banco.',
            fromTheBeginning: 'Desde o início',
            customStartDate: 'Data de início personalizada',
            letsDoubleCheck: 'Vamos verificar se tudo está correto.',
            confirmationDescription: 'Começaremos a importar transações imediatamente.',
            cardholder: 'Titular do cartão',
            card: 'Cartão',
            cardName: 'Nome do cartão',
            brokenConnectionErrorFirstPart: `A conexão do feed do cartão está quebrada. Por favor,`,
            brokenConnectionErrorLink: 'faça login no seu banco',
            brokenConnectionErrorSecondPart: 'para que possamos estabelecer a conexão novamente.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `atribuiu ${assignee} um ${link}! As transações importadas aparecerão neste chat.`,
            companyCard: 'cartão corporativo',
            chooseCardFeed: 'Escolher feed de cartão',
            ukRegulation:
                'A Expensify, Inc. é um agente da Plaid Financial Ltd., uma instituição de pagamento autorizada e regulada pela Financial Conduct Authority sob as Payment Services Regulations 2017 (Número de Referência da Empresa: 804718). A Plaid fornece a você serviços de informações de conta regulados através da Expensify Limited como seu agente.',
        },
        expensifyCard: {
            issueAndManageCards: 'Emita e gerencie seus Cartões Expensify',
            getStartedIssuing: 'Comece emitindo seu primeiro cartão virtual ou físico.',
            verificationInProgress: 'Verificação em andamento...',
            verifyingTheDetails: 'Estamos verificando alguns detalhes. Concierge informará você quando os Cartões Expensify estiverem prontos para serem emitidos.',
            disclaimer:
                'O Expensify Visa® Commercial Card é emitido pelo The Bancorp Bank, N.A., Membro FDIC, de acordo com uma licença da Visa U.S.A. Inc. e pode não ser aceito em todos os comerciantes que aceitam cartões Visa. Apple® e o logotipo da Apple® são marcas registradas da Apple Inc., registradas nos EUA e em outros países. App Store é uma marca de serviço da Apple Inc. Google Play e o logotipo do Google Play são marcas registradas da Google LLC.',
            issueCard: 'Emitir cartão',
            findCard: 'Encontrar cartão',
            newCard: 'Novo cartão',
            name: 'Nome',
            lastFour: 'Últimos 4',
            limit: 'Limite',
            currentBalance: 'Saldo atual',
            currentBalanceDescription: 'O saldo atual é a soma de todas as transações postadas no Expensify Card que ocorreram desde a última data de liquidação.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `O saldo será liquidado em ${settlementDate}`,
            settleBalance: 'Liquidar saldo',
            cardLimit: 'Limite do cartão',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: 'Solicitar aumento de limite',
            remainingLimitDescription:
                'Consideramos vários fatores ao calcular seu limite restante: seu tempo como cliente, as informações relacionadas ao negócio que você forneceu durante o cadastro e o dinheiro disponível na sua conta bancária empresarial. Seu limite restante pode flutuar diariamente.',
            earnedCashback: 'Cash back',
            earnedCashbackDescription: 'O saldo de cashback é baseado nos gastos mensais liquidados do Cartão Expensify em todo o seu espaço de trabalho.',
            issueNewCard: 'Emitir novo cartão',
            finishSetup: 'Concluir configuração',
            chooseBankAccount: 'Escolher conta bancária',
            chooseExistingBank: 'Escolha uma conta bancária empresarial existente para pagar o saldo do seu Expensify Card, ou adicione uma nova conta bancária',
            accountEndingIn: 'Conta terminando em',
            addNewBankAccount: 'Adicionar uma nova conta bancária',
            settlementAccount: 'Conta de liquidação',
            settlementAccountDescription: 'Escolha uma conta para pagar o saldo do seu Cartão Expensify.',
            settlementAccountInfoPt1: 'Certifique-se de que esta conta corresponde à sua',
            settlementAccountInfoPt2: 'para que a Reconciliação Contínua funcione corretamente.',
            reconciliationAccount: 'Conta de reconciliação',
            settlementFrequency: 'Frequência de liquidação',
            settlementFrequencyDescription: 'Escolha com que frequência você pagará o saldo do seu Cartão Expensify.',
            settlementFrequencyInfo: 'Se você quiser mudar para liquidação mensal, precisará conectar sua conta bancária via Plaid e ter um histórico de saldo positivo de 90 dias.',
            frequency: {
                daily: 'Diário',
                monthly: 'Mensalmente',
            },
            cardDetails: 'Detalhes do cartão',
            virtual: 'Virtual',
            physical: 'Físico',
            deactivate: 'Desativar cartão',
            changeCardLimit: 'Alterar limite do cartão',
            changeLimit: 'Alterar limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas até que você aprove mais despesas no cartão.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas até o próximo mês.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Se você alterar o limite deste cartão para ${limit}, novas transações serão recusadas.`,
            changeCardLimitType: 'Alterar tipo de limite do cartão',
            changeLimitType: 'Alterar tipo de limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se você alterar o tipo de limite deste cartão para Limite Inteligente, novas transações serão recusadas porque o limite não aprovado de ${limit} já foi atingido.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Se você mudar o tipo de limite deste cartão para Mensal, novas transações serão recusadas porque o limite mensal de ${limit} já foi atingido.`,
            addShippingDetails: 'Adicionar detalhes de envio',
            issuedCard: ({assignee}: AssigneeParams) => `emitiu um Cartão Expensify para ${assignee}! O cartão chegará em 2-3 dias úteis.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `emitiu um Cartão Expensify para ${assignee}! O cartão será enviado assim que os detalhes de envio forem adicionados.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `emitiu ${assignee} um ${link} virtual! O cartão pode ser usado imediatamente.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} adicionou os detalhes de envio. O Cartão Expensify chegará em 2-3 dias úteis.`,
            verifyingHeader: 'Verificando',
            bankAccountVerifiedHeader: 'Conta bancária verificada',
            verifyingBankAccount: 'Verificando conta bancária...',
            verifyingBankAccountDescription: 'Por favor, aguarde enquanto confirmamos se esta conta pode ser usada para emitir Cartões Expensify.',
            bankAccountVerified: 'Conta bancária verificada!',
            bankAccountVerifiedDescription: 'Agora você pode emitir Expensify Cards para os membros do seu espaço de trabalho.',
            oneMoreStep: 'Mais um passo...',
            oneMoreStepDescription: 'Parece que precisamos verificar manualmente sua conta bancária. Por favor, vá até o Concierge onde suas instruções estão esperando por você.',
            gotIt: 'Entendi',
            goToConcierge: 'Ir para o Concierge',
        },
        categories: {
            deleteCategories: 'Excluir categorias',
            deleteCategoriesPrompt: 'Tem certeza de que deseja excluir estas categorias?',
            deleteCategory: 'Excluir categoria',
            deleteCategoryPrompt: 'Tem certeza de que deseja excluir esta categoria?',
            disableCategories: 'Desativar categorias',
            disableCategory: 'Desativar categoria',
            enableCategories: 'Ativar categorias',
            enableCategory: 'Habilitar categoria',
            defaultSpendCategories: 'Categorias de despesas padrão',
            spendCategoriesDescription: 'Personalize como os gastos com comerciantes são categorizados para transações de cartão de crédito e recibos digitalizados.',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a categoria, por favor, tente novamente.',
            categoryName: 'Nome da categoria',
            requiresCategory: 'Os membros devem categorizar todas as despesas',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Todas as despesas devem ser categorizadas para exportar para ${connectionName}.`,
            subtitle: 'Obtenha uma melhor visão geral de onde o dinheiro está sendo gasto. Use nossas categorias padrão ou adicione as suas próprias.',
            emptyCategories: {
                title: 'Você não criou nenhuma categoria',
                subtitle: 'Adicione uma categoria para organizar seus gastos.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Suas categorias estão sendo importadas de uma conexão contábil. Vá para',
                subtitle2: 'contabilidade',
                subtitle3: 'fazer quaisquer alterações.',
            },
            updateFailureMessage: 'Ocorreu um erro ao atualizar a categoria, por favor, tente novamente.',
            createFailureMessage: 'Ocorreu um erro ao criar a categoria, por favor, tente novamente.',
            addCategory: 'Adicionar categoria',
            editCategory: 'Editar categoria',
            editCategories: 'Editar categorias',
            findCategory: 'Encontrar categoria',
            categoryRequiredError: 'O nome da categoria é obrigatório',
            existingCategoryError: 'Já existe uma categoria com este nome',
            invalidCategoryName: 'Nome de categoria inválido',
            importedFromAccountingSoftware: 'As categorias abaixo são importadas do seu',
            payrollCode: 'Código de folha de pagamento',
            updatePayrollCodeFailureMessage: 'Ocorreu um erro ao atualizar o código da folha de pagamento, por favor, tente novamente.',
            glCode: 'Código GL',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o código GL, por favor, tente novamente.',
            importCategories: 'Importar categorias',
            cannotDeleteOrDisableAllCategories: {
                title: 'Não é possível excluir ou desativar todas as categorias',
                description: `Pelo menos uma categoria deve permanecer habilitada porque seu espaço de trabalho requer categorias.`,
            },
        },
        moreFeatures: {
            subtitle: 'Use os toggles abaixo para habilitar mais recursos à medida que você cresce. Cada recurso aparecerá no menu de navegação para personalização adicional.',
            spendSection: {
                title: 'Gastar',
                subtitle: 'Habilite a funcionalidade que ajuda a expandir sua equipe.',
            },
            manageSection: {
                title: 'Gerenciar',
                subtitle: 'Adicione controles que ajudem a manter os gastos dentro do orçamento.',
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
                title: 'Taxas de distância',
                subtitle: 'Adicione, atualize e aplique tarifas.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Defina taxas de diárias para controlar os gastos diários dos funcionários.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Obtenha insights e controle sobre os gastos.',
                disableCardTitle: 'Desativar Expensify Card',
                disableCardPrompt: 'Você não pode desativar o Expensify Card porque ele já está em uso. Entre em contato com o Concierge para os próximos passos.',
                disableCardButton: 'Converse com o Concierge',
                feed: {
                    title: 'Obtenha o Cartão Expensify',
                    subTitle: 'Simplifique as despesas do seu negócio e economize até 50% na sua fatura do Expensify, além de:',
                    features: {
                        cashBack: 'Cashback em todas as compras nos EUA',
                        unlimited: 'Cartões virtuais ilimitados',
                        spend: 'Controles de gastos e limites personalizados',
                    },
                    ctaTitle: 'Emitir novo cartão',
                },
            },
            companyCards: {
                title: 'Cartões corporativos',
                subtitle: 'Importar despesas de cartões corporativos existentes.',
                feed: {
                    title: 'Importar cartões corporativos',
                    features: {
                        support: 'Suporte para todos os principais provedores de cartão',
                        assignCards: 'Atribuir cartões para toda a equipe',
                        automaticImport: 'Importação automática de transações',
                    },
                },
                disableCardTitle: 'Desativar cartões corporativos',
                disableCardPrompt: 'Você não pode desativar cartões da empresa porque esse recurso está em uso. Entre em contato com o Concierge para os próximos passos.',
                disableCardButton: 'Converse com o Concierge',
                cardDetails: 'Detalhes do cartão',
                cardNumber: 'Número do cartão',
                cardholder: 'Titular do cartão',
                cardName: 'Nome do cartão',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} exportação` : `exportação ${integration}`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) => `Escolha a conta ${integration} para onde as transações devem ser exportadas.`,
                integrationExportTitlePart: 'Selecione um diferente',
                integrationExportTitleLinkPart: 'opção de exportação',
                integrationExportTitleSecondPart: 'para alterar as contas disponíveis.',
                lastUpdated: 'Última atualização',
                transactionStartDate: 'Data de início da transação',
                updateCard: 'Atualizar cartão',
                unassignCard: 'Desatribuir cartão',
                unassign: 'Desatribuir',
                unassignCardDescription: 'Desatribuir este cartão removerá todas as transações em relatórios de rascunho da conta do titular do cartão.',
                assignCard: 'Atribuir cartão',
                cardFeedName: 'Nome do feed do cartão',
                cardFeedNameDescription: 'Dê um nome único ao feed do cartão para que você possa distingui-lo dos outros.',
                cardFeedTransaction: 'Excluir transações',
                cardFeedTransactionDescription: 'Escolha se os portadores de cartão podem excluir transações de cartão. Novas transações seguirão essas regras.',
                cardFeedRestrictDeletingTransaction: 'Restringir a exclusão de transações',
                cardFeedAllowDeletingTransaction: 'Permitir excluir transações',
                removeCardFeed: 'Remover feed de cartão',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Remover feed ${feedName}`,
                removeCardFeedDescription: 'Tem certeza de que deseja remover este feed de cartão? Isso desatribuirá todos os cartões.',
                error: {
                    feedNameRequired: 'O nome do feed do cartão é obrigatório',
                },
                corporate: 'Restringir a exclusão de transações',
                personal: 'Permitir excluir transações',
                setFeedNameDescription: 'Dê ao feed do cartão um nome único para que você possa diferenciá-lo dos outros.',
                setTransactionLiabilityDescription: 'Quando ativado, os portadores de cartão podem excluir transações de cartão. Novas transações seguirão esta regra.',
                emptyAddedFeedTitle: 'Atribuir cartões corporativos',
                emptyAddedFeedDescription: 'Comece atribuindo seu primeiro cartão a um membro.',
                pendingFeedTitle: `Estamos analisando sua solicitação...`,
                pendingFeedDescription: `Atualmente, estamos revisando os detalhes do seu feed. Assim que isso for concluído, entraremos em contato com você via`,
                pendingBankTitle: 'Verifique a janela do seu navegador',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Por favor, conecte-se ao ${bankName} através da janela do navegador que acabou de abrir. Se nenhuma tiver sido aberta,`,
                pendingBankLink: 'por favor, clique aqui',
                giveItNameInstruction: 'Dê um nome ao cartão que o diferencie dos outros.',
                updating: 'Atualizando...',
                noAccountsFound: 'Nenhuma conta encontrada',
                defaultCard: 'Cartão padrão',
                downgradeTitle: `Não é possível rebaixar o espaço de trabalho`,
                downgradeSubTitleFirstPart: `Este espaço de trabalho não pode ser rebaixado porque vários feeds de cartão estão conectados (excluindo os Cartões Expensify). Por favor,`,
                downgradeSubTitleMiddlePart: `manter apenas um feed de cartão`,
                downgradeSubTitleLastPart: 'para prosseguir.',
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Por favor, adicione a conta em ${connection} e sincronize a conexão novamente.`,
                expensifyCardBannerTitle: 'Obtenha o Cartão Expensify',
                expensifyCardBannerSubtitle: 'Aproveite o cashback em todas as compras nos EUA, até 50% de desconto na sua fatura do Expensify, cartões virtuais ilimitados e muito mais.',
                expensifyCardBannerLearnMoreButton: 'Saiba mais',
            },
            workflows: {
                title: 'Fluxos de Trabalho',
                subtitle: 'Configure como os gastos são aprovados e pagos.',
                disableApprovalPrompt:
                    'Os cartões Expensify deste espaço de trabalho atualmente dependem de aprovação para definir seus Limites Inteligentes. Por favor, altere os tipos de limite de quaisquer cartões Expensify com Limites Inteligentes antes de desativar as aprovações.',
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
                subtitle: 'Classifique custos e acompanhe despesas faturáveis.',
            },
            taxes: {
                title: 'Impostos',
                subtitle: 'Documente e recupere impostos elegíveis.',
            },
            reportFields: {
                title: 'Campos do relatório',
                subtitle: 'Configurar campos personalizados para despesas.',
            },
            connections: {
                title: 'Contabilidade',
                subtitle: 'Sincronize seu plano de contas e mais.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Não tão rápido...',
                featureEnabledText: 'Para ativar ou desativar este recurso, você precisará alterar suas configurações de importação de contabilidade.',
                disconnectText: 'Para desativar a contabilidade, você precisará desconectar sua conexão contábil do seu espaço de trabalho.',
                manageSettings: 'Gerenciar configurações',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Não tão rápido...',
                featureEnabledText:
                    'Os Cartões Expensify neste espaço de trabalho dependem de fluxos de aprovação para definir seus Limites Inteligentes.\n\nPor favor, altere os tipos de limite de quaisquer cartões com Limites Inteligentes antes de desativar os fluxos de trabalho.',
                confirmText: 'Ir para Cartões Expensify',
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
            findReportField: 'Encontrar campo do relatório',
            deleteConfirmation: 'Tem certeza de que deseja excluir este campo do relatório?',
            deleteFieldsConfirmation: 'Tem certeza de que deseja excluir esses campos de relatório?',
            emptyReportFields: {
                title: 'Você não criou nenhum campo de relatório',
                subtitle: 'Adicione um campo personalizado (texto, data ou lista suspensa) que aparece nos relatórios.',
            },
            subtitle: 'Os campos do relatório se aplicam a todos os gastos e podem ser úteis quando você deseja solicitar informações adicionais.',
            disableReportFields: 'Desativar campos do relatório',
            disableReportFieldsConfirmation: 'Você tem certeza? Campos de texto e data serão excluídos, e listas serão desativadas.',
            importedFromAccountingSoftware: 'Os campos do relatório abaixo são importados do seu',
            textType: 'Texto',
            dateType: 'Data',
            dropdownType: 'Lista',
            textAlternateText: 'Adicione um campo para entrada de texto livre.',
            dateAlternateText: 'Adicione um calendário para seleção de data.',
            dropdownAlternateText: 'Adicione uma lista de opções para escolher.',
            nameInputSubtitle: 'Escolha um nome para o campo do relatório.',
            typeInputSubtitle: 'Escolha qual tipo de campo de relatório usar.',
            initialValueInputSubtitle: 'Insira um valor inicial para mostrar no campo do relatório.',
            listValuesInputSubtitle: 'Esses valores aparecerão no menu suspenso do campo do seu relatório. Os valores habilitados podem ser selecionados pelos membros.',
            listInputSubtitle: 'Esses valores aparecerão na lista de campos do seu relatório. Valores habilitados podem ser selecionados pelos membros.',
            deleteValue: 'Excluir valor',
            deleteValues: 'Excluir valores',
            disableValue: 'Desativar valor',
            disableValues: 'Desativar valores',
            enableValue: 'Ativar valor',
            enableValues: 'Ativar valores',
            emptyReportFieldsValues: {
                title: 'Você não criou nenhum valor de lista',
                subtitle: 'Adicione valores personalizados para aparecerem nos relatórios.',
            },
            deleteValuePrompt: 'Tem certeza de que deseja excluir este valor da lista?',
            deleteValuesPrompt: 'Tem certeza de que deseja excluir esses valores da lista?',
            listValueRequiredError: 'Por favor, insira um nome de valor da lista',
            existingListValueError: 'Um valor de lista com este nome já existe',
            editValue: 'Editar valor',
            listValues: 'Listar valores',
            addValue: 'Adicionar valor',
            existingReportFieldNameError: 'Um campo de relatório com este nome já existe',
            reportFieldNameRequiredError: 'Por favor, insira um nome de campo de relatório',
            reportFieldTypeRequiredError: 'Por favor, escolha um tipo de campo de relatório',
            reportFieldInitialValueRequiredError: 'Por favor, escolha um valor inicial para o campo do relatório',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o campo do relatório. Por favor, tente novamente.',
        },
        tags: {
            tagName: 'Nome da tag',
            requiresTag: 'Os membros devem etiquetar todas as despesas',
            trackBillable: 'Acompanhar despesas faturáveis',
            customTagName: 'Nome de tag personalizada',
            enableTag: 'Habilitar tag',
            enableTags: 'Habilitar tags',
            requireTag: 'Require tag',
            requireTags: 'Exigir tags',
            notRequireTags: 'Não exigir',
            disableTag: 'Desativar tag',
            disableTags: 'Desativar tags',
            addTag: 'Adicionar tag',
            editTag: 'Editar tag',
            editTags: 'Editar tags',
            findTag: 'Find tag',
            subtitle: 'Tags adicionam maneiras mais detalhadas de classificar custos.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Você está usando',
                phrase2: 'tags dependentes',
                phrase3: '. Você pode',
                phrase4: 'reimportar uma planilha',
                phrase5: 'para atualizar suas tags.',
            },
            emptyTags: {
                title: 'Você não criou nenhuma tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Adicione uma tag para rastrear projetos, locais, departamentos e mais.',
                subtitle1: 'Importe uma planilha para adicionar tags para rastrear projetos, locais, departamentos e mais.',
                subtitle2: 'Saiba mais',
                subtitle3: 'sobre arquivos de formatação de tags.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Seus tags estão sendo importados de uma conexão contábil. Vá para',
                subtitle2: 'contabilidade',
                subtitle3: 'fazer quaisquer alterações.',
            },
            deleteTag: 'Excluir tag',
            deleteTags: 'Excluir tags',
            deleteTagConfirmation: 'Tem certeza de que deseja excluir esta tag?',
            deleteTagsConfirmation: 'Tem certeza de que deseja excluir estas tags?',
            deleteFailureMessage: 'Ocorreu um erro ao excluir a tag, por favor, tente novamente.',
            tagRequiredError: 'O nome da tag é obrigatório',
            existingTagError: 'Uma tag com este nome já existe',
            invalidTagNameError: 'O nome da tag não pode ser 0. Por favor, escolha um valor diferente.',
            genericFailureMessage: 'Ocorreu um erro ao atualizar a tag, por favor, tente novamente.',
            importedFromAccountingSoftware: 'As tags abaixo são importadas do seu',
            glCode: 'Código GL',
            updateGLCodeFailureMessage: 'Ocorreu um erro ao atualizar o código GL, por favor, tente novamente.',
            tagRules: 'Regras de tag',
            approverDescription: 'Aprovador',
            importTags: 'Importar tags',
            importTagsSupportingText: 'Codifique suas despesas com um tipo de etiqueta ou várias.',
            configureMultiLevelTags: 'Configure sua lista de tags para marcação em vários níveis.',
            importMultiLevelTagsSupportingText: `Aqui está uma prévia das suas tags. Se tudo estiver correto, clique abaixo para importá-las.`,
            importMultiLevelTags: {
                firstRowTitle: 'A primeira linha é o título de cada lista de tags',
                independentTags: 'Estas são tags independentes',
                glAdjacentColumn: 'Há um código GL na coluna adjacente',
            },
            tagLevel: {
                singleLevel: 'Único nível de tags',
                multiLevel: 'Tags multiníveis',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Alternar Níveis de Tag',
                prompt1: 'Mudar os níveis de tag apagará todas as tags atuais.',
                prompt2: 'Sugerimos que você primeiro',
                prompt3: 'baixar um backup',
                prompt4: 'exportando suas tags.',
                prompt5: 'Saiba mais',
                prompt6: 'sobre os níveis de tag.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Encontramos *${columnCounts} colunas* na sua planilha. Selecione *Nome* ao lado da coluna que contém os nomes das tags. Você também pode selecionar *Ativado* ao lado da coluna que define o status das tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Não é possível excluir ou desativar todas as tags',
                description: `Pelo menos uma tag deve permanecer habilitada porque seu espaço de trabalho exige tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Não é possível tornar todas as tags opcionais',
                description: `Pelo menos uma etiqueta deve permanecer obrigatória porque as configurações do seu espaço de trabalho exigem etiquetas.`,
            },
            tagCount: () => ({
                one: '1 Dia',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Adicione nomes de impostos, taxas e defina padrões.',
            addRate: 'Adicionar taxa',
            workspaceDefault: 'Moeda padrão do espaço de trabalho',
            foreignDefault: 'Moeda estrangeira padrão',
            customTaxName: 'Nome do imposto personalizado',
            value: 'Valor',
            taxReclaimableOn: 'Imposto recuperável em',
            taxRate: 'Taxa de imposto',
            findTaxRate: 'Encontrar taxa de imposto',
            error: {
                taxRateAlreadyExists: 'Este nome de imposto já está em uso',
                taxCodeAlreadyExists: 'Este código fiscal já está em uso',
                valuePercentageRange: 'Por favor, insira uma porcentagem válida entre 0 e 100',
                customNameRequired: 'Nome personalizado do imposto é obrigatório',
                deleteFailureMessage: 'Ocorreu um erro ao excluir a taxa de imposto. Por favor, tente novamente ou peça ajuda ao Concierge.',
                updateFailureMessage: 'Ocorreu um erro ao atualizar a taxa de imposto. Por favor, tente novamente ou peça ajuda ao Concierge.',
                createFailureMessage: 'Ocorreu um erro ao criar a taxa de imposto. Por favor, tente novamente ou peça ajuda ao Concierge.',
                updateTaxClaimableFailureMessage: 'A parte recuperável deve ser menor que o valor da taxa de distância',
            },
            deleteTaxConfirmation: 'Tem certeza de que deseja excluir este imposto?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Tem certeza de que deseja excluir ${taxAmount} impostos?`,
            actions: {
                delete: 'Taxa de exclusão',
                deleteMultiple: 'Excluir tarifas',
                enable: 'Habilitar taxa',
                disable: 'Desativar taxa',
                enableTaxRates: () => ({
                    one: 'Habilitar taxa',
                    other: 'Habilitar taxas',
                }),
                disableTaxRates: () => ({
                    one: 'Desativar taxa',
                    other: 'Desativar taxas',
                }),
            },
            importedFromAccountingSoftware: 'Os impostos abaixo são importados do seu',
            taxCode: 'Código fiscal',
            updateTaxCodeFailureMessage: 'Ocorreu um erro ao atualizar o código de imposto, por favor, tente novamente.',
        },
        emptyWorkspace: {
            title: 'Criar um espaço de trabalho',
            subtitle: 'Crie um espaço de trabalho para rastrear recibos, reembolsar despesas, gerenciar viagens, enviar faturas e muito mais — tudo na velocidade do chat.',
            createAWorkspaceCTA: 'Começar',
            features: {
                trackAndCollect: 'Acompanhe e colete recibos',
                reimbursements: 'Reembolsar funcionários',
                companyCards: 'Gerenciar cartões da empresa',
            },
            notFound: 'Nenhum workspace encontrado',
            description: 'As salas são um ótimo lugar para discutir e trabalhar com várias pessoas. Para começar a colaborar, crie ou entre em um espaço de trabalho.',
        },
        new: {
            newWorkspace: 'Novo workspace',
            getTheExpensifyCardAndMore: 'Obtenha o Expensify Card e mais',
            confirmWorkspace: 'Confirmar Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Meu Espaço de Trabalho em Grupo${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Ocorreu um erro ao remover um membro do espaço de trabalho, por favor, tente novamente.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Tem certeza de que deseja remover ${memberName}?`,
                other: 'Tem certeza de que deseja remover esses membros?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} é um aprovador neste espaço de trabalho. Quando você deixar de compartilhar este espaço de trabalho com ele, nós o substituiremos no fluxo de aprovação pelo proprietário do espaço de trabalho, ${ownerName}.`,
            removeMembersTitle: () => ({
                one: 'Remover membro',
                other: 'Remover membros',
            }),
            findMember: 'Encontrar membro',
            removeWorkspaceMemberButtonTitle: 'Remover do espaço de trabalho',
            removeGroupMemberButtonTitle: 'Remover do grupo',
            removeRoomMemberButtonTitle: 'Remover do chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Tem certeza de que deseja remover ${memberName}?`,
            removeMemberTitle: 'Remover membro',
            transferOwner: 'Transferir proprietário',
            makeMember: 'Tornar membro',
            makeAdmin: 'Tornar administrador',
            makeAuditor: 'Criar auditor',
            selectAll: 'Selecionar tudo',
            error: {
                genericAdd: 'Houve um problema ao adicionar este membro ao espaço de trabalho',
                cannotRemove: 'Você não pode remover a si mesmo ou o proprietário do espaço de trabalho',
                genericRemove: 'Houve um problema ao remover esse membro do espaço de trabalho',
            },
            addedWithPrimary: 'Alguns membros foram adicionados com seus logins primários.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Adicionado pelo login secundário ${secondaryLogin}.`,
            membersListTitle: 'Diretório de todos os membros do espaço de trabalho.',
            importMembers: 'Importar membros',
        },
        card: {
            getStartedIssuing: 'Comece emitindo seu primeiro cartão virtual ou físico.',
            issueCard: 'Emitir cartão',
            issueNewCard: {
                whoNeedsCard: 'Quem precisa de um cartão?',
                findMember: 'Encontrar membro',
                chooseCardType: 'Escolha um tipo de cartão',
                physicalCard: 'Cartão físico',
                physicalCardDescription: 'Ótimo para quem gasta com frequência',
                virtualCard: 'Cartão virtual',
                virtualCardDescription: 'Instantâneo e flexível',
                chooseLimitType: 'Escolha um tipo de limite',
                smartLimit: 'Limite Inteligente',
                smartLimitDescription: 'Gastar até um determinado valor antes de exigir aprovação',
                monthly: 'Mensalmente',
                monthlyDescription: 'Gastar até um certo valor por mês',
                fixedAmount: 'Quantia fixa',
                fixedAmountDescription: 'Gaste até um determinado valor uma vez',
                setLimit: 'Definir um limite',
                cardLimitError: 'Por favor, insira um valor menor que $21.474.836',
                giveItName: 'Dê um nome',
                giveItNameInstruction: 'Torne-o único o suficiente para diferenciá-lo de outros cartões. Casos de uso específicos são ainda melhores!',
                cardName: 'Nome do cartão',
                letsDoubleCheck: 'Vamos verificar se tudo está correto.',
                willBeReady: 'Este cartão estará pronto para uso imediatamente.',
                cardholder: 'Titular do cartão',
                cardType: 'Tipo de cartão',
                limit: 'Limite',
                limitType: 'Tipo de limite',
                name: 'Nome',
            },
            deactivateCardModal: {
                deactivate: 'Desativar',
                deactivateCard: 'Desativar cartão',
                deactivateConfirmation: 'Desativar este cartão recusará todas as transações futuras e não poderá ser desfeito.',
            },
        },
        accounting: {
            settings: 'configurações',
            title: 'Conexões',
            subtitle:
                'Conecte-se ao seu sistema de contabilidade para codificar transações com seu plano de contas, fazer a correspondência automática de pagamentos e manter suas finanças sincronizadas.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Converse com seu especialista de configuração.',
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
            errorODIntegration: 'Há um erro com uma conexão que foi configurada no Expensify Classic.',
            goToODToFix: 'Vá para o Expensify Classic para resolver este problema.',
            goToODToSettings: 'Vá para o Expensify Classic para gerenciar suas configurações.',
            setup: 'Conectar',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Última sincronização ${relativeDate}`,
            notSync: 'Não sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avançado',
            other: 'Outro',
            syncNow: 'Sincronizar agora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar conector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integração';
                return `Desconectar ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'integração contábil'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Não é possível conectar ao QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Não é possível conectar ao Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Não é possível conectar ao NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Não é possível conectar ao QuickBooks Desktop';
                    default: {
                        return 'Não é possível conectar à integração';
                    }
                }
            },
            accounts: 'Plano de contas',
            taxes: 'Impostos',
            imported: 'Importado',
            notImported: 'Não importado',
            importAsCategory: 'Importado como categorias',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importado como tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Não importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Não importado',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importado como campos de relatório',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'esta integração';
                return `Tem certeza de que deseja desconectar ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Tem certeza de que deseja conectar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'esta integração contábil'}? Isso removerá quaisquer conexões contábeis existentes.`,
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
                            return 'Importando funcionários';
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
                            return 'Sincronizando relatórios reembolsados e pagamentos de contas';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importando códigos fiscais';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verificando a conexão com o QuickBooks Online';
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
                            return 'Importando título';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importando certificado de aprovação';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importando dimensões';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importando política de salvamento';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Ainda sincronizando dados com o QuickBooks... Por favor, certifique-se de que o Web Connector está em execução.';
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
                            return 'Atualizando campos do relatório';
                        case 'jobDone':
                            return 'Aguardando o carregamento dos dados importados';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizando plano de contas';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizando categorias';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizando clientes';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marcando relatórios do Expensify como reembolsados';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marcando faturas e contas do Xero como pagas';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizando categorias de rastreamento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizando contas bancárias';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizando taxas de imposto';
                        case 'xeroCheckConnection':
                            return 'Verificando conexão com o Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizando dados do Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicializando conexão com o NetSuite';
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
                            return 'Importando dados como campos de relatório do Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importando dados como tags do Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Atualizando informações de conexão';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marcando relatórios do Expensify como reembolsados';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marcando faturas e contas do NetSuite como pagas';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importando fornecedores';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importando listas personalizadas';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importando subsidiárias';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importando fornecedores';
                        case 'intacctCheckConnection':
                            return 'Verificando conexão com Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importando dimensões do Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importando dados do Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Tradução ausente para a etapa: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote:
                'O exportador preferido pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões de empresa individuais nas Configurações de Domínio.',
            exportPreferredExporterSubNote: 'Uma vez definido, o exportador preferido verá os relatórios para exportação em sua conta.',
            exportAs: 'Exportar como',
            exportOutOfPocket: 'Exportar despesas do próprio bolso como',
            exportCompanyCard: 'Exportar despesas de cartões corporativos como',
            exportDate: 'Data de exportação',
            defaultVendor: 'Fornecedor padrão',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Sincronize NetSuite e Expensify automaticamente, todos os dias. Exporte o relatório finalizado em tempo real.',
            reimbursedReports: 'Sincronizar relatórios reembolsados',
            cardReconciliation: 'Reconciliação de cartão',
            reconciliationAccount: 'Conta de reconciliação',
            continuousReconciliation: 'Reconciliação Contínua',
            saveHoursOnReconciliation:
                'Economize horas na reconciliação de cada período contábil ao permitir que a Expensify reconcilie continuamente os extratos e liquidações do Cartão Expensify em seu nome.',
            enableContinuousReconciliation: 'Para ativar a Reconciliação Contínua, por favor, ative',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Escolha a conta bancária na qual os pagamentos do seu Expensify Card serão reconciliados.',
                accountMatches: 'Certifique-se de que esta conta corresponde à sua',
                settlementAccount: 'Conta de liquidação do Cartão Expensify',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(terminando em ${lastFourPAN}) para que a Reconciliação Contínua funcione corretamente.`,
            },
        },
        export: {
            notReadyHeading: 'Não está pronto para exportar',
            notReadyDescription:
                'Relatórios de despesas rascunho ou pendentes não podem ser exportados para o sistema contábil. Por favor, aprove ou pague essas despesas antes de exportá-las.',
        },
        invoices: {
            sendInvoice: 'Enviar fatura',
            sendFrom: 'Enviar de',
            invoicingDetails: 'Detalhes de faturamento',
            invoicingDetailsDescription: 'Esta informação aparecerá em suas faturas.',
            companyName: 'Nome da empresa',
            companyWebsite: 'Site da empresa',
            paymentMethods: {
                personal: 'Pessoal',
                business: 'Negócio',
                chooseInvoiceMethod: 'Escolha um método de pagamento abaixo:',
                addBankAccount: 'Adicionar conta bancária',
                payingAsIndividual: 'Pagando como indivíduo',
                payingAsBusiness: 'Pagando como uma empresa',
            },
            invoiceBalance: 'Saldo da fatura',
            invoiceBalanceSubtitle:
                'Este é o seu saldo atual de recebimento de pagamentos de faturas. Ele será transferido automaticamente para sua conta bancária se você tiver adicionado uma.',
            bankAccountsSubtitle: 'Adicione uma conta bancária para fazer e receber pagamentos de faturas.',
        },
        invite: {
            member: 'Convidar membro',
            members: 'Convidar membros',
            invitePeople: 'Convidar novos membros',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o espaço de trabalho. Por favor, tente novamente.',
            pleaseEnterValidLogin: `Por favor, certifique-se de que o e-mail ou número de telefone é válido (por exemplo, ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'usuário',
            users: 'usuários',
            invited: 'convidado',
            removed: 'removido',
            to: 'para',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmar detalhes',
            inviteMessagePrompt: 'Torne seu convite ainda mais especial adicionando uma mensagem abaixo!',
            personalMessagePrompt: 'Mensagem',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o espaço de trabalho. Por favor, tente novamente.',
            inviteNoMembersError: 'Por favor, selecione pelo menos um membro para convidar',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} solicitou para entrar em ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Não tão rápido...',
            workspaceNeeds: 'Um espaço de trabalho precisa de pelo menos uma tarifa de distância ativada.',
            distance: 'Distância',
            centrallyManage: 'Gerencie tarifas centralmente, acompanhe em milhas ou quilômetros e defina uma categoria padrão.',
            rate: 'Avaliar',
            addRate: 'Adicionar taxa',
            findRate: 'Encontrar taxa',
            trackTax: 'Acompanhar imposto',
            deleteRates: () => ({
                one: 'Taxa de exclusão',
                other: 'Excluir tarifas',
            }),
            enableRates: () => ({
                one: 'Habilitar taxa',
                other: 'Habilitar taxas',
            }),
            disableRates: () => ({
                one: 'Desativar taxa',
                other: 'Desativar taxas',
            }),
            enableRate: 'Habilitar taxa',
            status: 'Status',
            unit: 'Unidade',
            taxFeatureNotEnabledMessage: 'Os impostos devem estar ativados no espaço de trabalho para usar este recurso. Vá para',
            changePromptMessage: 'para fazer essa alteração.',
            deleteDistanceRate: 'Excluir taxa de distância',
            areYouSureDelete: () => ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas taxas?',
            }),
        },
        editor: {
            descriptionInputLabel: 'Descrição',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valor inicial',
            nameInputHelpText: 'Este é o nome que você verá no seu espaço de trabalho.',
            nameIsRequiredError: 'Você precisará dar um nome ao seu espaço de trabalho',
            currencyInputLabel: 'Moeda padrão',
            currencyInputHelpText: 'Todas as despesas neste espaço de trabalho serão convertidas para esta moeda.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `A moeda padrão não pode ser alterada porque este espaço de trabalho está vinculado a uma conta bancária em ${currency}.`,
            save: 'Salvar',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o espaço de trabalho. Por favor, tente novamente.',
            avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Por favor, tente novamente.',
            addressContext: 'Um Endereço de Espaço de Trabalho é necessário para habilitar o Expensify Travel. Por favor, insira um endereço associado ao seu negócio.',
        },
        bankAccount: {
            continueWithSetup: 'Continuar configuração',
            youAreAlmostDone:
                'Você está quase terminando de configurar sua conta bancária, o que permitirá emitir cartões corporativos, reembolsar despesas, coletar faturas e pagar contas.',
            streamlinePayments: 'Simplifique os pagamentos',
            connectBankAccountNote: 'Nota: Contas bancárias pessoais não podem ser usadas para pagamentos em espaços de trabalho.',
            oneMoreThing: 'Mais uma coisa!',
            allSet: 'Tudo pronto!',
            accountDescriptionWithCards: 'Esta conta bancária será usada para emitir cartões corporativos, reembolsar despesas, cobrar faturas e pagar contas.',
            letsFinishInChat: 'Vamos terminar no chat!',
            finishInChat: 'Concluir no chat',
            almostDone: 'Quase pronto!',
            disconnectBankAccount: 'Desconectar conta bancária',
            startOver: 'Começar de novo',
            updateDetails: 'Atualizar detalhes',
            yesDisconnectMyBankAccount: 'Sim, desconectar minha conta bancária',
            yesStartOver: 'Sim, comece de novo.',
            disconnectYour: 'Desconecte seu',
            bankAccountAnyTransactions: 'conta bancária. Quaisquer transações pendentes para esta conta ainda serão concluídas.',
            clearProgress: 'Recomeçar apagará o progresso que você fez até agora.',
            areYouSure: 'Você tem certeza?',
            workspaceCurrency: 'Moeda do espaço de trabalho',
            updateCurrencyPrompt:
                'Parece que seu espaço de trabalho está atualmente configurado para uma moeda diferente de USD. Por favor, clique no botão abaixo para atualizar sua moeda para USD agora.',
            updateToUSD: 'Atualizar para USD',
            updateWorkspaceCurrency: 'Atualizar moeda do espaço de trabalho',
            workspaceCurrencyNotSupported: 'Moeda do espaço de trabalho não suportada',
            yourWorkspace: 'Seu espaço de trabalho está configurado para uma moeda não suportada. Veja o/a',
            listOfSupportedCurrencies: 'lista de moedas suportadas',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transferir proprietário',
            addPaymentCardTitle: 'Insira seu cartão de pagamento para transferir a propriedade',
            addPaymentCardButtonText: 'Aceitar os termos e adicionar cartão de pagamento',
            addPaymentCardReadAndAcceptTextPart1: 'Ler e aceitar',
            addPaymentCardReadAndAcceptTextPart2: 'política para adicionar seu cartão',
            addPaymentCardTerms: 'termos',
            addPaymentCardPrivacy: 'privacidade',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Compatível com PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Criptografia de nível bancário',
            addPaymentCardRedundant: 'Infraestrutura redundante',
            addPaymentCardLearnMore: 'Saiba mais sobre nosso(a)',
            addPaymentCardSecurity: 'segurança',
            amountOwedTitle: 'Saldo pendente',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Esta conta tem um saldo pendente de um mês anterior.\n\nVocê deseja quitar o saldo e assumir a cobrança deste espaço de trabalho?',
            ownerOwesAmountTitle: 'Saldo pendente',
            ownerOwesAmountButtonText: 'Transferir saldo',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `A conta proprietária deste espaço de trabalho (${email}) tem um saldo pendente de um mês anterior.\n\nVocê deseja transferir este valor (${amount}) para assumir a cobrança deste espaço de trabalho? Seu cartão de pagamento será cobrado imediatamente.`,
            subscriptionTitle: 'Assumir assinatura anual',
            subscriptionButtonText: 'Transferir assinatura',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Assumir este espaço de trabalho irá mesclar sua assinatura anual com sua assinatura atual. Isso aumentará o tamanho da sua assinatura em ${usersCount} membros, tornando o novo tamanho da sua assinatura ${finalCount}. Você gostaria de continuar?`,
            duplicateSubscriptionTitle: 'Alerta de assinatura duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Parece que você pode estar tentando assumir a cobrança dos espaços de trabalho de ${email}, mas para isso, você precisa ser um administrador em todos os espaços de trabalho deles primeiro.\n\nClique em "Continuar" se você quiser apenas assumir a cobrança do espaço de trabalho ${workspaceName}.\n\nSe você quiser assumir a cobrança de toda a assinatura deles, peça para que eles o adicionem como administrador em todos os espaços de trabalho antes de assumir a cobrança.`,
            hasFailedSettlementsTitle: 'Não é possível transferir a propriedade',
            hasFailedSettlementsButtonText: 'Entendi',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Você não pode assumir a cobrança porque ${email} tem um acerto de cartão Expensify em atraso. Por favor, peça para que eles entrem em contato com concierge@expensify.com para resolver o problema. Depois, você poderá assumir a cobrança deste espaço de trabalho.`,
            failedToClearBalanceTitle: 'Falha ao limpar o saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Não conseguimos limpar o saldo. Por favor, tente novamente mais tarde.',
            successTitle: 'Uhu! Tudo pronto.',
            successDescription: 'Você agora é o proprietário deste espaço de trabalho.',
            errorTitle: 'Ops! Não tão rápido...',
            errorDescriptionPartOne: 'Houve um problema ao transferir a propriedade deste espaço de trabalho. Tente novamente, ou',
            errorDescriptionPartTwo: 'entre em contato com o Concierge',
            errorDescriptionPartThree: 'para ajuda.',
        },
        exportAgainModal: {
            title: 'Cuidado!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `Os seguintes relatórios já foram exportados para ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nTem certeza de que deseja exportá-los novamente?`,
            confirmText: 'Sim, exportar novamente',
            cancelText: 'Cancelar',
        },
        upgrade: {
            reportFields: {
                title: 'Campos do relatório',
                description: `Os campos de relatório permitem que você especifique detalhes no nível do cabeçalho, distintos das tags que se referem a despesas em itens de linha individuais. Esses detalhes podem abranger nomes específicos de projetos, informações de viagens de negócios, locais e mais.`,
                onlyAvailableOnPlan: 'Os campos de relatório estão disponíveis apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Aproveite a sincronização automatizada e reduza as entradas manuais com a integração Expensify + NetSuite. Obtenha insights financeiros detalhados e em tempo real com suporte a segmentos nativos e personalizados, incluindo mapeamento de projetos e clientes.`,
                onlyAvailableOnPlan: 'Nossa integração com o NetSuite está disponível apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Aproveite a sincronização automática e reduza as entradas manuais com a integração Expensify + Sage Intacct. Obtenha insights financeiros detalhados e em tempo real com dimensões definidas pelo usuário, além de codificação de despesas por departamento, classe, localização, cliente e projeto (trabalho).`,
                onlyAvailableOnPlan: 'Nossa integração com o Sage Intacct está disponível apenas no plano Control, a partir de',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Aproveite a sincronização automatizada e reduza entradas manuais com a integração Expensify + QuickBooks Desktop. Obtenha eficiência máxima com uma conexão bidirecional em tempo real e codificação de despesas por classe, item, cliente e projeto.`,
                onlyAvailableOnPlan: 'Nossa integração com o QuickBooks Desktop está disponível apenas no plano Control, a partir de',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Advanced Approvals',
                description: `Se você deseja adicionar mais camadas de aprovação ao processo – ou apenas garantir que as maiores despesas recebam uma segunda análise – nós temos a solução. As aprovações avançadas ajudam você a implementar as verificações corretas em cada nível para manter os gastos da sua equipe sob controle.`,
                onlyAvailableOnPlan: 'As aprovações avançadas estão disponíveis apenas no plano Control, que começa em',
            },
            categories: {
                title: 'Categorias',
                description: `As categorias ajudam você a organizar melhor as despesas para acompanhar onde está gastando seu dinheiro. Use nossa lista de categorias sugeridas ou crie as suas próprias.`,
                onlyAvailableOnPlan: 'As categorias estão disponíveis no plano Collect, a partir de',
            },
            glCodes: {
                title: 'códigos GL',
                description: `Adicione códigos GL às suas categorias e tags para facilitar a exportação de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: 'Os códigos GL estão disponíveis apenas no plano Control, a partir de',
            },
            glAndPayrollCodes: {
                title: 'Códigos GL & Payroll',
                description: `Adicione códigos GL e de Folha de Pagamento às suas categorias para facilitar a exportação de despesas para seus sistemas contábeis e de folha de pagamento.`,
                onlyAvailableOnPlan: 'Os códigos GL e de folha de pagamento estão disponíveis apenas no plano Control, a partir de',
            },
            taxCodes: {
                title: 'Códigos fiscais',
                description: `Adicione códigos fiscais aos seus impostos para facilitar a exportação de despesas para seus sistemas de contabilidade e folha de pagamento.`,
                onlyAvailableOnPlan: 'Os códigos fiscais estão disponíveis apenas no plano Control, a partir de',
            },
            companyCards: {
                title: 'Cartões ilimitados da empresa',
                description: `Precisa adicionar mais feeds de cartão? Desbloqueie cartões corporativos ilimitados para sincronizar transações de todos os principais emissores de cartão.`,
                onlyAvailableOnPlan: 'Isso está disponível apenas no plano Control, a partir de',
            },
            rules: {
                title: 'Regras',
                description: `As regras funcionam em segundo plano e mantêm seus gastos sob controle, para que você não precise se preocupar com pequenos detalhes.\n\nExija detalhes de despesas como recibos e descrições, defina limites e padrões, e automatize aprovações e pagamentos – tudo em um só lugar.`,
                onlyAvailableOnPlan: 'As regras estão disponíveis apenas no plano Control, a partir de',
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Per diem é uma ótima maneira de manter seus custos diários em conformidade e previsíveis sempre que seus funcionários viajarem. Aproveite recursos como taxas personalizadas, categorias padrão e detalhes mais granulares, como destinos e subtaxas.',
                onlyAvailableOnPlan: 'Per diem estão disponíveis apenas no plano Control, a partir de',
            },
            travel: {
                title: 'Viagem',
                description: 'Expensify Travel é uma nova plataforma de reserva e gestão de viagens corporativas que permite aos membros reservar acomodações, voos, transporte e mais.',
                onlyAvailableOnPlan: 'Viagens estão disponíveis no plano Collect, a partir de',
            },
            multiLevelTags: {
                title: 'Tags multiníveis',
                description:
                    'As Tags de Múltiplos Níveis ajudam você a rastrear despesas com maior precisão. Atribua várias tags a cada item de linha — como departamento, cliente ou centro de custo — para capturar o contexto completo de cada despesa. Isso permite relatórios mais detalhados, fluxos de trabalho de aprovação e exportações contábeis.',
                onlyAvailableOnPlan: 'As tags de múltiplos níveis estão disponíveis apenas no plano Control, a partir de',
            },
            pricing: {
                perActiveMember: 'por membro ativo por mês.',
                perMember: 'por membro por mês.',
            },
            note: {
                upgradeWorkspace: 'Atualize seu espaço de trabalho para acessar este recurso, ou',
                learnMore: 'saiba mais',
                aboutOurPlans: 'sobre nossos planos e preços.',
            },
            upgradeToUnlock: 'Desbloquear este recurso',
            completed: {
                headline: `Você atualizou seu espaço de trabalho!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `Você atualizou com sucesso ${policyName} para o plano Control!`,
                categorizeMessage: `Você atualizou com sucesso para um workspace no plano Collect. Agora você pode categorizar suas despesas!`,
                travelMessage: `Você atualizou com sucesso para um espaço de trabalho no plano Collect. Agora você pode começar a reservar e gerenciar viagens!`,
                viewSubscription: 'Ver sua assinatura',
                moreDetails: 'para mais detalhes.',
                gotIt: 'Entendi, obrigado',
            },
            commonFeatures: {
                title: 'Faça upgrade para o plano Control',
                note: 'Desbloqueie nossos recursos mais poderosos, incluindo:',
                benefits: {
                    startsAt: 'O plano Control começa em',
                    perMember: 'por membro ativo por mês.',
                    learnMore: 'Saiba mais',
                    pricing: 'sobre nossos planos e preços.',
                    benefit1: 'Conexões avançadas de contabilidade (NetSuite, Sage Intacct e mais)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprovação em múltiplos níveis',
                    benefit4: 'Controles de segurança aprimorados',
                    toUpgrade: 'Para atualizar, clique',
                    selectWorkspace: 'selecione um espaço de trabalho e altere o tipo de plano para',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Fazer downgrade para o plano Collect',
                note: 'Se você fizer o downgrade, perderá acesso a estes recursos e mais:',
                benefits: {
                    note: 'Para uma comparação completa de nossos planos, confira nosso',
                    pricingPage: 'página de preços',
                    confirm: 'Tem certeza de que deseja rebaixar e remover suas configurações?',
                    warning: 'Isso não pode ser desfeito.',
                    benefit1: 'Conexões contábeis (exceto QuickBooks Online e Xero)',
                    benefit2: 'Regras inteligentes de despesas',
                    benefit3: 'Fluxos de aprovação em múltiplos níveis',
                    benefit4: 'Controles de segurança aprimorados',
                    headsUp: 'Atenção!',
                    multiWorkspaceNote:
                        'Você precisará rebaixar todos os seus espaços de trabalho antes do seu primeiro pagamento mensal para começar uma assinatura na taxa Collect. Clique',
                    selectStep: '> selecione cada espaço de trabalho > altere o tipo de plano para',
                },
            },
            completed: {
                headline: 'Seu espaço de trabalho foi rebaixado',
                description: 'Você tem outros espaços de trabalho no plano Control. Para ser cobrado na taxa Collect, você deve rebaixar todos os espaços de trabalho.',
                gotIt: 'Entendi, obrigado',
            },
        },
        payAndDowngrade: {
            title: 'Pagar e rebaixar',
            headline: 'Seu pagamento final',
            description1: 'Sua fatura final para esta assinatura será',
            description2: ({date}: DateParams) => `Veja sua análise abaixo para ${date}:`,
            subscription:
                'Atenção! Esta ação encerrará sua assinatura do Expensify, excluirá este espaço de trabalho e removerá todos os membros do espaço de trabalho. Se você quiser manter este espaço de trabalho e apenas se remover, peça a outro administrador para assumir a cobrança primeiro.',
            genericFailureMessage: 'Ocorreu um erro ao pagar sua conta. Por favor, tente novamente.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Ações no espaço de trabalho ${workspaceName} estão atualmente restritas`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `O proprietário do espaço de trabalho, ${workspaceOwnerName}, precisará adicionar ou atualizar o cartão de pagamento registrado para desbloquear novas atividades do espaço de trabalho.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Você precisará adicionar ou atualizar o cartão de pagamento registrado para desbloquear novas atividades do espaço de trabalho.',
            addPaymentCardToUnlock: 'Adicione um cartão de pagamento para desbloquear!',
            addPaymentCardToContinueUsingWorkspace: 'Adicione um cartão de pagamento para continuar usando este workspace',
            pleaseReachOutToYourWorkspaceAdmin: 'Por favor, entre em contato com o administrador do seu espaço de trabalho para quaisquer perguntas.',
            chatWithYourAdmin: 'Converse com seu administrador',
            chatInAdmins: 'Converse em #admins',
            addPaymentCard: 'Adicionar cartão de pagamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Despesas',
                subtitle: 'Defina controles de gastos e padrões para despesas individuais. Você também pode criar regras para',
                receiptRequiredAmount: 'Valor necessário do recibo',
                receiptRequiredAmountDescription: 'Exigir recibos quando o gasto exceder este valor, a menos que seja substituído por uma regra de categoria.',
                maxExpenseAmount: 'Valor máximo da despesa',
                maxExpenseAmountDescription: 'Marcar gastos que excedam este valor, a menos que sejam substituídos por uma regra de categoria.',
                maxAge: 'Idade máxima',
                maxExpenseAge: 'Idade máxima da despesa',
                maxExpenseAgeDescription: 'Marcar despesas mais antigas que um número específico de dias.',
                maxExpenseAgeDays: () => ({
                    one: '1 dia',
                    other: (count: number) => `${count} dias`,
                }),
                billableDefault: 'Padrão faturável',
                billableDefaultDescription: 'Escolha se as despesas em dinheiro e cartão de crédito devem ser faturáveis por padrão. Despesas faturáveis são ativadas ou desativadas em',
                billable: 'Faturável',
                billableDescription: 'Despesas são mais frequentemente refaturadas para clientes.',
                nonBillable: 'Não faturável',
                nonBillableDescription: 'Despesas são ocasionalmente refaturadas para clientes',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceipts são criados automaticamente',
                eReceiptsHintLink: 'para a maioria das transações de crédito em USD',
                attendeeTracking: 'Rastreamento de participantes',
                attendeeTrackingHint: 'Acompanhe o custo por pessoa para cada despesa.',
                prohibitedDefaultDescription:
                    'Marque qualquer recibo onde apareçam álcool, jogos de azar ou outros itens restritos. Despesas com recibos onde esses itens aparecem exigirão revisão manual.',
                prohibitedExpenses: 'Despesas proibidas',
                alcohol: 'Álcool',
                hotelIncidentals: 'Despesas incidentais do hotel',
                gambling: 'Jogos de azar',
                tobacco: 'Tabaco',
                adultEntertainment: 'Entretenimento adulto',
            },
            expenseReportRules: {
                examples: 'Exemplos:',
                title: 'Relatórios de despesas',
                subtitle: 'Automatize a conformidade, aprovações e pagamentos de relatórios de despesas.',
                customReportNamesSubtitle: 'Personalize os títulos dos relatórios usando nosso',
                customNameTitle: 'Título padrão do relatório',
                customNameDescription: 'Escolha um nome personalizado para relatórios de despesas usando nosso',
                customNameDescriptionLink: 'fórmulas extensivas',
                customNameInputLabel: 'Nome',
                customNameEmailPhoneExample: 'Email ou telefone do membro: {report:submit:from}',
                customNameStartDateExample: 'Data de início do relatório: {report:startdate}',
                customNameWorkspaceNameExample: 'Nome do espaço de trabalho: {report:workspacename}',
                customNameReportIDExample: 'ID do Relatório: {report:id}',
                customNameTotalExample: 'Total: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Impedir que os membros alterem os nomes dos relatórios personalizados',
                preventSelfApprovalsTitle: 'Prevenir autoaprovações',
                preventSelfApprovalsSubtitle: 'Impedir que os membros do espaço de trabalho aprovem seus próprios relatórios de despesas.',
                autoApproveCompliantReportsTitle: 'Aprovar automaticamente relatórios em conformidade',
                autoApproveCompliantReportsSubtitle: 'Configure quais relatórios de despesas são elegíveis para aprovação automática.',
                autoApproveReportsUnderTitle: 'Aprovar automaticamente relatórios abaixo de',
                autoApproveReportsUnderDescription: 'Relatórios de despesas totalmente compatíveis abaixo deste valor serão aprovados automaticamente.',
                randomReportAuditTitle: 'Auditoria de relatório aleatória',
                randomReportAuditDescription: 'Exigir que alguns relatórios sejam aprovados manualmente, mesmo que sejam elegíveis para aprovação automática.',
                autoPayApprovedReportsTitle: 'Relatórios aprovados para pagamento automático',
                autoPayApprovedReportsSubtitle: 'Configure quais relatórios de despesas são elegíveis para pagamento automático.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Por favor, insira um valor menor que ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Vá para mais recursos e ative os fluxos de trabalho, depois adicione pagamentos para desbloquear este recurso.',
                autoPayReportsUnderTitle: 'Relatórios de pagamento automático abaixo de',
                autoPayReportsUnderDescription: 'Relatórios de despesas totalmente compatíveis abaixo deste valor serão pagos automaticamente.',
                unlockFeatureGoToSubtitle: 'Ir para',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) => `e habilite fluxos de trabalho, depois adicione ${featureName} para desbloquear este recurso.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `e ative ${featureName} para desbloquear este recurso.`,
            },
            categoryRules: {
                title: 'Regras de categoria',
                approver: 'Aprovador',
                requireDescription: 'Requer descrição',
                descriptionHint: 'Dica de descrição',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Lembre os funcionários de fornecer informações adicionais para gastos com “${categoryName}”. Esta dica aparece no campo de descrição das despesas.`,
                descriptionHintLabel: 'Dica',
                descriptionHintSubtitle: 'Dica profissional: Quanto mais curto, melhor!',
                maxAmount: 'Valor máximo',
                flagAmountsOver: 'Sinalizar valores acima de',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Aplica-se à categoria “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Isso substitui o valor máximo para todas as despesas.',
                expenseLimitTypes: {
                    expense: 'Despesa individual',
                    expenseSubtitle: 'Marcar valores de despesas por categoria. Esta regra substitui a regra geral do espaço de trabalho para o valor máximo de despesa.',
                    daily: 'Total da categoria',
                    dailySubtitle: 'Marcar o total de gastos por categoria em cada relatório de despesas.',
                },
                requireReceiptsOver: 'Exigir recibos acima de',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Padrão`,
                    never: 'Nunca exigir recibos',
                    always: 'Sempre exigir recibos',
                },
                defaultTaxRate: 'Taxa de imposto padrão',
                goTo: 'Ir para',
                andEnableWorkflows: 'e habilite fluxos de trabalho, depois adicione aprovações para desbloquear este recurso.',
            },
            customRules: {
                title: 'Regras personalizadas',
                subtitle: 'Descrição',
                description: 'Insira regras personalizadas para relatórios de despesas',
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
                    description: 'Para organizações com requisitos avançados.',
                },
            },
            description: 'Escolha um plano que seja ideal para você. Para uma lista detalhada de recursos e preços, confira nosso',
            subscriptionLink: 'tipos de planos e página de ajuda de preços',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Você se comprometeu com 1 membro ativo no plano Control até que sua assinatura anual termine em ${annualSubscriptionEndDate}. Você pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ${annualSubscriptionEndDate} desativando a renovação automática em`,
                other: `Você se comprometeu com ${count} membros ativos no plano Control até que sua assinatura anual termine em ${annualSubscriptionEndDate}. Você pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ${annualSubscriptionEndDate} desativando a renovação automática em`,
            }),
            subscriptions: 'Assinaturas',
        },
    },
    getAssistancePage: {
        title: 'Obter assistência',
        subtitle: 'Estamos aqui para abrir seu caminho para a grandeza!',
        description: 'Escolha entre as opções de suporte abaixo:',
        chatWithConcierge: 'Converse com o Concierge',
        scheduleSetupCall: 'Agendar uma chamada de configuração',
        scheduleACall: 'Agendar chamada',
        questionMarkButtonTooltip: 'Obtenha assistência da nossa equipe',
        exploreHelpDocs: 'Explorar documentos de ajuda',
        registerForWebinar: 'Registrar-se para o webinar',
        onboardingHelp: 'Ajuda de integração',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Alterar o tom de pele padrão',
        headers: {
            frequentlyUsed: 'Frequente Utilização',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'Pessoas e Corpo',
            animalsAndNature: 'Animais e Natureza',
            foodAndDrink: 'Comidas e Bebidas',
            travelAndPlaces: 'Viagens e Lugares',
            activities: 'Atividades',
            objects: 'Objetos',
            symbols: 'Símbolos',
            flags: 'Bandeiras',
        },
    },
    newRoomPage: {
        newRoom: 'Nova sala',
        groupName: 'Nome do grupo',
        roomName: 'Nome da sala',
        visibility: 'Visibilidade',
        restrictedDescription: 'As pessoas no seu espaço de trabalho podem encontrar esta sala',
        privateDescription: 'As pessoas convidadas para esta sala podem encontrá-la',
        publicDescription: 'Qualquer pessoa pode encontrar esta sala',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Qualquer pessoa pode encontrar esta sala',
        createRoom: 'Criar sala',
        roomAlreadyExistsError: 'Uma sala com este nome já existe',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} é uma sala padrão em todos os espaços de trabalho. Por favor, escolha outro nome.`,
        roomNameInvalidError: 'Os nomes das salas podem incluir apenas letras minúsculas, números e hífens.',
        pleaseEnterRoomName: 'Por favor, insira um nome para a sala',
        pleaseSelectWorkspace: 'Por favor, selecione um espaço de trabalho',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} renomeado para "${newName}" (anteriormente "${oldName}")` : `${actor} renomeou esta sala para "${newName}" (anteriormente "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Sala renomeada para ${newName}`,
        social: 'social',
        selectAWorkspace: 'Selecione um espaço de trabalho',
        growlMessageOnRenameError: 'Não foi possível renomear a sala do espaço de trabalho. Verifique sua conexão e tente novamente.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privado',
            public: 'Público',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Anúncio Público',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Enviar e Fechar',
        submitAndApprove: 'Enviar e Aprovar',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `adicionou ${approverName} (${approverEmail}) como aprovador para o ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `removeu ${approverName} (${approverEmail}) como aprovador para o ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `alterou o aprovador para o ${field} "${name}" para ${formatApprover(newApproverName, newApproverEmail)} (anteriormente ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `adicionou a categoria "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `removeu a categoria "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabled' : 'habilitado'} a categoria "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o código de folha de pagamento "${newValue}" à categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o código de folha de pagamento "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o código de folha de pagamento da categoria "${categoryName}" para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `adicionou o código GL "${newValue}" à categoria "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removeu o código GL "${oldValue}" da categoria "${categoryName}"`;
            }
            return `alterou o código GL da categoria “${categoryName}” para “${newValue}” (anteriormente “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `alterou a descrição da categoria "${categoryName}" para ${!oldValue ? 'obrigatório' : 'não é necessário'} (anteriormente ${!oldValue ? 'não é necessário' : 'obrigatório'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `adicionou um valor máximo de ${newAmount} à categoria "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `removeu o valor máximo de ${oldAmount} da categoria "${categoryName}"`;
            }
            return `alterou o valor máximo da categoria "${categoryName}" para ${newAmount} (anteriormente ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `adicionou um tipo de limite de ${newValue} à categoria "${categoryName}"`;
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
                return `removeu a dica de descrição "${oldValue}" da categoria "${categoryName}"`;
            }
            return !oldValue
                ? `adicionou a dica de descrição "${newValue}" à categoria "${categoryName}"`
                : `alterou a dica de descrição da categoria "${categoryName}" para “${newValue}” (anteriormente “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `alterou o nome da lista de tags para "${newName}" (anteriormente "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `adicionou a tag "${tagName}" à lista "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `atualizou a lista de tags "${tagListName}" alterando a tag "${oldName}" para "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'habilitado' : 'disabled'} a tag "${tagName}" na lista "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `removeu a tag "${tagName}" da lista "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `removidos "${count}" tags da lista "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `atualizou a tag "${tagName}" na lista "${tagListName}" alterando o ${updatedField} para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `atualizou a tag "${tagName}" na lista "${tagListName}" adicionando um ${updatedField} de "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `alterou o ${customUnitName} ${updatedField} para "${newValue}" (anteriormente "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Rastreamento de impostos ${newValue ? 'habilitado' : 'disabled'} em taxas de distância`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `adicionou uma nova taxa "${customUnitName}" "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `alterou a taxa do ${customUnitName} ${updatedField} "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `alterou a alíquota de imposto na taxa de distância "${customUnitRateName}" para "${newValue} (${newTaxPercentage})" (anteriormente "${oldValue} (${oldTaxPercentage})")`;
            }
            return `adicionou a taxa de imposto "${newValue} (${newTaxPercentage})" à taxa de distância "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `alterou a parte recuperável do imposto na taxa de distância "${customUnitRateName}" para "${newValue}" (anteriormente "${oldValue}")`;
            }
            return `adicionou uma parte recuperável de impostos de "${newValue}" à taxa de distância "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `removeu a taxa "${rateName}" de "${customUnitName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `adicionado campo de relatório ${fieldType} "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `defina o valor padrão do campo de relatório "${fieldName}" para "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `adicionou a opção "${optionName}" ao campo do relatório "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `removeu a opção "${optionName}" do campo de relatório "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'habilitado' : 'disabled'} a opção "${optionName}" para o campo do relatório "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'habilitado' : 'disabled'} todas as opções para o campo de relatório "${fieldName}"`;
            }
            return `${allEnabled ? 'habilitado' : 'disabled'} a opção "${optionName}" para o campo do relatório "${fieldName}", tornando todas as opções ${allEnabled ? 'habilitado' : 'disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `removido campo de relatório ${fieldType} "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `atualizado "Prevenir autoaprovação" para "${newValue === 'true' ? 'Ativado' : 'Desativado'}" (anteriormente "${oldValue === 'true' ? 'Ativado' : 'Desativado'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou o valor máximo exigido para despesas com recibo para ${newValue} (anteriormente ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `alterou o valor máximo de despesa para violações para ${newValue} (anteriormente ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizado "Idade máxima da despesa (dias)" para "${newValue}" (anteriormente "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `defina a data de envio do relatório mensal para "${newValue}"`;
            }
            return `atualizou a data de envio do relatório mensal para "${newValue}" (anteriormente "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `atualizou "Refaturar despesas para clientes" para "${newValue}" (anteriormente "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `transformado "Aplicar títulos padrão de relatórios" ${value ? 'em' : 'desligado'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `atualizou o nome deste espaço de trabalho para "${newName}" (anteriormente "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `defina a descrição deste espaço de trabalho para "${newDescription}"`
                : `atualizou a descrição deste espaço de trabalho para "${newDescription}" (anteriormente "${oldDescription}")`,
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
                one: `removeu você do fluxo de aprovação e do chat de despesas de ${joinedNames}. Relatórios enviados anteriormente continuarão disponíveis para aprovação na sua Caixa de Entrada.`,
                other: `removeu você dos fluxos de aprovação e chats de despesas de ${joinedNames}. Relatórios enviados anteriormente continuarão disponíveis para aprovação na sua Caixa de Entrada.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `atualizou seu papel em ${policyName} de ${oldRole} para usuário. Você foi removido de todos os chats de despesas de remetentes, exceto o seu próprio.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `atualizou a moeda padrão para ${newCurrency} (anteriormente ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `atualizou a frequência de relatórios automáticos para "${newFrequency}" (anteriormente "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `atualizou o modo de aprovação para "${newValue}" (anteriormente "${oldValue}")`,
        upgradedWorkspace: 'atualizou este espaço de trabalho para o plano Control',
        downgradedWorkspace: 'rebaixou este espaço de trabalho para o plano Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `alterou a taxa de relatórios encaminhados aleatoriamente para aprovação manual para ${Math.round(newAuditRate * 100)}% (anteriormente ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `alterou o limite de aprovação manual para todas as despesas para ${newLimit} (anteriormente ${oldLimit})`,
    },
    roomMembersPage: {
        memberNotFound: 'Membro não encontrado.',
        useInviteButton: 'Para convidar um novo membro para o chat, por favor, use o botão de convite acima.',
        notAuthorized: `Você não tem acesso a esta página. Se você está tentando entrar nesta sala, peça a um membro da sala para adicioná-lo. Algo mais? Entre em contato com ${CONST.EMAIL.CONCIERGE}`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Tem certeza de que deseja remover ${memberName} da sala?`,
            other: 'Tem certeza de que deseja remover os membros selecionados da sala?',
        }),
        error: {
            genericAdd: 'Houve um problema ao adicionar este membro à sala',
        },
    },
    newTaskPage: {
        assignTask: 'Atribuir tarefa',
        assignMe: 'Atribuir a mim',
        confirmTask: 'Confirmar tarefa',
        confirmError: 'Por favor, insira um título e selecione um destino para compartilhar.',
        descriptionOptional: 'Descrição (opcional)',
        pleaseEnterTaskName: 'Por favor, insira um título',
        pleaseEnterTaskDestination: 'Por favor, selecione onde você deseja compartilhar esta tarefa.',
    },
    task: {
        task: 'Tarefa',
        title: 'Título',
        description: 'Descrição',
        assignee: 'Cessionário',
        completed: 'Concluído',
        action: 'Completo',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tarefa para ${title}`,
            completed: 'marcado como concluído',
            canceled: 'tarefa excluída',
            reopened: 'marcado como incompleto',
            error: 'Você não tem permissão para realizar a ação solicitada.',
        },
        markAsComplete: 'Marcar como concluído',
        markAsIncomplete: 'Marcar como incompleto',
        assigneeError: 'Ocorreu um erro ao atribuir esta tarefa. Por favor, tente outro responsável.',
        genericCreateTaskFailureMessage: 'Houve um erro ao criar esta tarefa. Por favor, tente novamente mais tarde.',
        deleteTask: 'Excluir tarefa',
        deleteConfirmation: 'Tem certeza de que deseja excluir esta tarefa?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Extrato de ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Atalhos de teclado',
        subtitle: 'Economize tempo com esses atalhos de teclado úteis:',
        shortcuts: {
            openShortcutDialog: 'Abre o diálogo de atalhos de teclado',
            markAllMessagesAsRead: 'Marcar todas as mensagens como lidas',
            escape: 'Escapar diálogos',
            search: 'Abrir diálogo de pesquisa',
            newChat: 'Nova tela de chat',
            copy: 'Copiar comentário',
            openDebug: 'Abrir a caixa de diálogo de preferências de teste',
        },
    },
    guides: {
        screenShare: 'Compartilhar tela',
        screenShareRequest: 'A Expensify está convidando você para um compartilhamento de tela',
    },
    search: {
        resultsAreLimited: 'Os resultados da pesquisa são limitados.',
        viewResults: 'Ver resultados',
        resetFilters: 'Redefinir filtros',
        searchResults: {
            emptyResults: {
                title: 'Nada para mostrar',
                subtitle: 'Tente ajustar seus critérios de busca ou criar algo com o botão verde +.',
            },
            emptyExpenseResults: {
                title: 'Você ainda não criou nenhuma despesa ainda',
                subtitle: 'Crie uma despesa ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para criar uma despesa.',
            },
            emptyReportResults: {
                title: 'Você ainda não criou nenhum relatório',
                subtitle: 'Crie um relatório ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para criar um relatório.',
            },
            emptyInvoiceResults: {
                title: 'Você ainda não criou nenhuma fatura ainda',
                subtitle: 'Envie uma fatura ou faça um test drive do Expensify para saber mais.',
                subtitleWithOnlyCreateButton: 'Use o botão verde abaixo para enviar uma fatura.',
            },
            emptyTripResults: {
                title: 'Nenhuma viagem para exibir',
                subtitle: 'Comece reservando sua primeira viagem abaixo.',
                buttonText: 'Reservar uma viagem',
            },
            emptySubmitResults: {
                title: 'Nenhuma despesa para enviar',
                subtitle: 'Você está liberado. Dê uma volta da vitória!',
                buttonText: 'Criar relatório',
            },
            emptyApproveResults: {
                title: 'Nenhuma despesa para aprovar',
                subtitle: 'Zero despesas. Máximo relaxamento. Bem feito!',
            },
            emptyPayResults: {
                title: 'Nenhuma despesa a pagar',
                subtitle: 'Parabéns! Você cruzou a linha de chegada.',
            },
            emptyExportResults: {
                title: 'Nenhuma despesa para exportar',
                subtitle: 'Hora de relaxar, bom trabalho.',
            },
            emptyUnapprovedResults: {
                title: 'Nenhuma despesa para aprovar',
                subtitle: 'Zero despesas. Máximo relaxamento. Bem feito!',
            },
        },
        unapproved: 'Não aprovado',
        unapprovedCash: 'Dinheiro não aprovado',
        unapprovedCompanyCards: 'Cartões corporativos não aprovados',
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
            hold: 'Manter',
            unhold: 'Remover retenção',
            noOptionsAvailable: 'Nenhuma opção disponível para o grupo de despesas selecionado.',
        },
        filtersHeader: 'Filtros',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Antes de ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Após ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nunca',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'No mês passado',
                },
            },
            status: 'Status',
            keyword: 'Palavra-chave',
            hasKeywords: 'Tem palavras-chave',
            currency: 'Moeda',
            link: 'Link',
            pinned: 'Fixado',
            unread: 'Não lido',
            completed: 'Concluído',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Menos de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Maior que ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Entre ${greaterThan} e ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartões individuais',
                closedCards: 'Cartões fechados',
                cardFeeds: 'Feeds de cartão',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Todos os ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Atual',
            past: 'Passado',
            submitted: 'Data de envio',
            approved: 'Data aprovada',
            paid: 'Data de pagamento',
            exported: 'Data exportada',
            posted: 'Data de postagem',
            billable: 'Faturável',
            reimbursable: 'Reembolsável',
            groupBy: {
                reports: 'Relatório',
                members: 'Membro',
                cards: 'Cartão',
            },
        },
        groupBy: 'Agrupar por',
        moneyRequestReport: {
            emptyStateTitle: 'Este relatório não possui despesas.',
            emptyStateSubtitle: 'Você pode adicionar despesas a este relatório usando o botão acima.',
        },
        noCategory: 'Sem categoria',
        noTag: 'Sem etiqueta',
        expenseType: 'Tipo de despesa',
        recentSearches: 'Pesquisas recentes',
        recentChats: 'Chats recentes',
        searchIn: 'Pesquisar em',
        searchPlaceholder: 'Pesquisar por algo',
        suggestions: 'Sugestões',
        exportSearchResults: {
            title: 'Criar exportação',
            description: 'Uau, isso é um monte de itens! Vamos agrupá-los, e o Concierge enviará um arquivo para você em breve.',
        },
        exportAll: {
            selectAllMatchingItems: 'Selecione todos os itens correspondentes',
            allMatchingItemsSelected: 'Todos os itens correspondentes selecionados',
        },
    },
    genericErrorPage: {
        title: 'Ops, algo deu errado!',
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
                'Verifique sua pasta de fotos ou downloads para uma cópia do seu código QR. Dica: Adicione-o a uma apresentação para que seu público possa escanear e se conectar diretamente com você.',
        },
        generalError: {
            title: 'Erro de anexo',
            message: 'Anexo não pode ser baixado',
        },
        permissionError: {
            title: 'Acesso ao armazenamento',
            message: 'O Expensify não pode salvar anexos sem acesso ao armazenamento. Toque em configurações para atualizar as permissões.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Novo Expensify',
        about: 'About New Expensify',
        update: 'Atualizar o Novo Expensify',
        checkForUpdates: 'Verificar atualizações',
        toggleDevTools: 'Alternar Ferramentas de Desenvolvedor',
        viewShortcuts: 'Ver atalhos de teclado',
        services: 'Serviços',
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
        speechSubmenu: 'Fala',
        startSpeaking: 'Comece a Falar',
        stopSpeaking: 'Pare de Falar',
        viewMenu: 'Visualizar',
        reload: 'Recarregar',
        forceReload: 'Forçar Recarregamento',
        resetZoom: 'Tamanho Real',
        zoomIn: 'Aproximar',
        zoomOut: 'Reduzir Zoom',
        togglefullscreen: 'Alternar Tela Cheia',
        historyMenu: 'Histórico',
        back: 'Voltar',
        forward: 'Encaminhar',
        windowMenu: 'Janela',
        minimize: 'Minimizar',
        zoom: 'Zoom',
        front: 'Trazer Tudo para Frente',
        helpMenu: 'Ajuda',
        learnMore: 'Saiba mais',
        documentation: 'Documentação',
        communityDiscussions: 'Discussões da Comunidade',
        searchIssues: 'Pesquisar Problemas',
    },
    historyMenu: {
        forward: 'Encaminhar',
        back: 'Voltar',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Atualização disponível',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `A nova versão estará disponível em breve.${!isSilentUpdating ? 'Nós notificaremos você quando estivermos prontos para atualizar.' : ''}`,
            soundsGood: 'Parece bom',
        },
        notAvailable: {
            title: 'Atualização indisponível',
            message: 'Não há atualizações disponíveis no momento. Por favor, verifique novamente mais tarde!',
            okay: 'Okay',
        },
        error: {
            title: 'Falha na verificação de atualização',
            message: 'Não conseguimos verificar uma atualização. Por favor, tente novamente em breve.',
        },
    },
    report: {
        newReport: {
            createReport: 'Criar relatório',
            chooseWorkspace: 'Escolha um espaço de trabalho para este relatório.',
        },
        genericCreateReportFailureMessage: 'Erro inesperado ao criar este chat. Por favor, tente novamente mais tarde.',
        genericAddCommentFailureMessage: 'Erro inesperado ao postar o comentário. Por favor, tente novamente mais tarde.',
        genericUpdateReportFieldFailureMessage: 'Erro inesperado ao atualizar o campo. Por favor, tente novamente mais tarde.',
        genericUpdateReportNameEditFailureMessage: 'Erro inesperado ao renomear o relatório. Por favor, tente novamente mais tarde.',
        noActivityYet: 'Nenhuma atividade ainda',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `alterado ${fieldName} de ${oldValue} para ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `alterado ${fieldName} para ${newValue}`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) =>
                    `alterou o espaço de trabalho para ${toPolicyName}${fromPolicyName ? `(anteriormente ${fromPolicyName})` : ''}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `alterado o tipo de ${oldType} para ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `enviei este relatório para ${delegateUser} já que ${originalManager} está de férias`,
                exportedToCSV: `exportado para CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `exportado para ${label}`,
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportado para ${label} via`,
                    automaticActionTwo: 'configurações de contabilidade',
                    manual: ({label}: ExportedToIntegrationParams) => `marcou este relatório como exportado manualmente para ${label}.`,
                    automaticActionThree: 'e criou com sucesso um registro para',
                    reimburseableLink: 'despesas do próprio bolso',
                    nonReimbursableLink: 'despesas com cartão corporativo',
                    pending: ({label}: ExportedToIntegrationParams) => `iniciou a exportação deste relatório para ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `falha ao exportar este relatório para ${label} ("${errorMessage} ${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `adicionou um recibo`,
                managerDetachReceipt: `removeu um recibo`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `pago ${currency}${amount} em outro lugar`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `pagou ${currency}${amount} via integração`,
                outdatedBankAccount: `não foi possível processar o pagamento devido a um problema com a conta bancária do pagador`,
                reimbursementACHBounce: `não foi possível processar o pagamento, pois o pagador não tem fundos suficientes`,
                reimbursementACHCancelled: `cancelou o pagamento`,
                reimbursementAccountChanged: `não foi possível processar o pagamento, pois o pagador mudou de conta bancária`,
                reimbursementDelayed: `processou o pagamento, mas ele está atrasado em mais 1-2 dias úteis`,
                selectedForRandomAudit: `selecionado aleatoriamente para revisão`,
                selectedForRandomAuditMarkdown: `[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revisão`,
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
                removeMember: ({email, role}: AddEmployeeParams) => `removeu ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removeu a conexão com ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `conectado a ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'saiu do chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} para ${dayCount} ${dayCount === 1 ? 'dia' : 'dias'} até ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} de ${timePeriod} em ${date}`,
    },
    footer: {
        features: 'Recursos',
        expenseManagement: 'Gerenciamento de Despesas',
        spendManagement: 'Gestão de Despesas',
        expenseReports: 'Relatórios de Despesas',
        companyCreditCard: 'Cartão de Crédito Corporativo',
        receiptScanningApp: 'Aplicativo de Digitalização de Recibos',
        billPay: 'Bill Pay',
        invoicing: 'Faturamento',
        CPACard: 'Cartão CPA',
        payroll: 'Folha de pagamento',
        travel: 'Viagem',
        resources: 'Recursos',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Suporte',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Termos de Serviço',
        privacy: 'Privacidade',
        learnMore: 'Saiba Mais',
        aboutExpensify: 'Sobre a Expensify',
        blog: 'Blog',
        jobs: 'Trabalhos',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Começar',
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
        lastChatMessagePreview: 'Visualização da última mensagem do chat',
        workspaceName: 'Nome do espaço de trabalho',
        chatUserDisplayNames: 'Nomes de exibição dos membros do chat',
        scrollToNewestMessages: 'Rolar para as mensagens mais recentes',
        preStyledText: 'Texto pré-formatado',
        viewAttachment: 'Ver anexo',
    },
    parentReportAction: {
        deletedReport: 'Relatório excluído',
        deletedMessage: 'Mensagem deletada',
        deletedExpense: 'Despesa excluída',
        reversedTransaction: 'Transação revertida',
        deletedTask: 'Tarefa excluída',
        hiddenMessage: 'Mensagem oculta',
    },
    threads: {
        thread: 'Tópico',
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
        flagDescription: 'Todas as mensagens sinalizadas serão enviadas para um moderador para revisão.',
        chooseAReason: 'Escolha um motivo para sinalizar abaixo:',
        spam: 'Spam',
        spamDescription: 'Promoção não solicitada e fora de tópico',
        inconsiderate: 'Inconsiderado',
        inconsiderateDescription: 'Frases insultuosas ou desrespeitosas, com intenções questionáveis',
        intimidation: 'Intimidação',
        intimidationDescription: 'Perseguir agressivamente uma agenda apesar de objeções válidas',
        bullying: 'Bullying',
        bullyingDescription: 'Alvejando um indivíduo para obter obediência',
        harassment: 'Assédio',
        harassmentDescription: 'Comportamento racista, misógino ou amplamente discriminatório',
        assault: 'Agressão',
        assaultDescription: 'Ataque emocional especificamente direcionado com a intenção de causar dano',
        flaggedContent: 'Esta mensagem foi marcada como violadora das nossas regras da comunidade e o conteúdo foi ocultado.',
        hideMessage: 'Ocultar mensagem',
        revealMessage: 'Revelar mensagem',
        levelOneResult: 'Envia aviso anônimo e a mensagem é reportada para revisão.',
        levelTwoResult: 'Mensagem oculta do canal, além de aviso anônimo e mensagem reportada para revisão.',
        levelThreeResult: 'Mensagem removida do canal, além de um aviso anônimo, e a mensagem foi relatada para revisão.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Convide-os',
        nothing: 'Não faça nada',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Aceitar',
        decline: 'Recusar',
    },
    actionableMentionTrackExpense: {
        submit: 'Envie para alguém',
        categorize: 'Categorize it',
        share: 'Compartilhar com meu contador',
        nothing: 'Nada por agora',
    },
    teachersUnitePage: {
        teachersUnite: 'Professores Unidos',
        joinExpensifyOrg:
            'Junte-se à Expensify.org para eliminar a injustiça ao redor do mundo. A atual campanha "Professores Unidos" apoia educadores em todos os lugares dividindo os custos de materiais escolares essenciais.',
        iKnowATeacher: 'Eu conheço um professor(a)',
        iAmATeacher: 'Sou professor(a)',
        getInTouch: 'Excelente! Por favor, compartilhe as informações deles para que possamos entrar em contato.',
        introSchoolPrincipal: 'Introdução ao diretor da sua escola',
        schoolPrincipalVerifyExpense:
            'A Expensify.org divide o custo dos materiais escolares essenciais para que estudantes de famílias de baixa renda possam ter uma melhor experiência de aprendizado. Seu diretor será solicitado a verificar suas despesas.',
        principalFirstName: 'Nome principal',
        principalLastName: 'Sobrenome do diretor',
        principalWorkEmail: 'Email principal de trabalho',
        updateYourEmail: 'Atualize seu endereço de e-mail',
        updateEmail: 'Atualizar endereço de e-mail',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Antes de prosseguir, certifique-se de definir seu e-mail escolar como seu método de contato padrão. Você pode fazer isso em Configurações > Perfil > <a href="${contactMethodsRoute}">Métodos de contato</a>.`,
        error: {
            enterPhoneEmail: 'Insira um e-mail ou número de telefone válido',
            enterEmail: 'Digite um e-mail',
            enterValidEmail: 'Insira um e-mail válido',
            tryDifferentEmail: 'Por favor, tente um e-mail diferente.',
        },
    },
    cardTransactions: {
        notActivated: 'Não ativado',
        outOfPocket: 'Despesa do próprio bolso',
        companySpend: 'Gastos da empresa',
    },
    distance: {
        addStop: 'Adicionar parada',
        deleteWaypoint: 'Excluir ponto de referência',
        deleteWaypointConfirmation: 'Tem certeza de que deseja excluir este ponto de referência?',
        address: 'Endereço',
        waypointDescription: {
            start: 'Iniciar',
            stop: 'Pare',
        },
        mapPending: {
            title: 'Mapa pendente',
            subtitle: 'O mapa será gerado quando você voltar a ficar online.',
            onlineSubtitle: 'Um momento enquanto configuramos o mapa',
            errorTitle: 'Erro no mapa',
            errorSubtitle: 'Ocorreu um erro ao carregar o mapa. Por favor, tente novamente.',
        },
        error: {
            selectSuggestedAddress: 'Por favor, selecione um endereço sugerido ou use a localização atual',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Boletim perdido ou danificado',
        nextButtonLabel: 'Próximo',
        reasonTitle: 'Por que você precisa de um novo cartão?',
        cardDamaged: 'Meu cartão foi danificado',
        cardLostOrStolen: 'Meu cartão foi perdido ou roubado',
        confirmAddressTitle: 'Por favor, confirme o endereço de correspondência para o seu novo cartão.',
        cardDamagedInfo: 'Seu novo cartão chegará em 2-3 dias úteis. Seu cartão atual continuará funcionando até que você ative o novo.',
        cardLostOrStolenInfo: 'Seu cartão atual será permanentemente desativado assim que seu pedido for feito. A maioria dos cartões chega em alguns dias úteis.',
        address: 'Endereço',
        deactivateCardButton: 'Desativar cartão',
        shipNewCardButton: 'Enviar novo cartão',
        addressError: 'Endereço é obrigatório',
        reasonError: 'Motivo é obrigatório',
        successTitle: 'Seu novo cartão está a caminho!',
        successDescription: 'Você precisará ativá-lo assim que ele chegar em alguns dias úteis. Enquanto isso, seu cartão virtual já está pronto para uso.',
    },
    eReceipt: {
        guaranteed: 'eReceipt garantido',
        transactionDate: 'Data da transação',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Iniciar um chat,',
            buttonText2: 'indique um amigo.',
            header: 'Inicie um chat, indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta iniciar um chat com eles e nós cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Enviar uma despesa,',
            buttonText2: 'indique seu chefe.',
            header: 'Envie uma despesa, indique seu chefe',
            body: 'Quer que seu chefe use o Expensify também? Basta enviar uma despesa para ele e nós cuidaremos do resto.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Indique um amigo',
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        copyReferralLink: 'Copiar link de convite',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Converse com seu especialista em configuração em',
            phrase2: 'para ajuda',
        },
        default: {
            phrase1: 'Mensagem',
            phrase2: 'para ajuda com a configuração',
        },
    },
    violations: {
        allTagLevelsRequired: 'Todas as tags são obrigatórias',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) => `${rejectedBy} rejeitou esta despesa com o comentário "${rejectReason}"`,
        billableExpense: 'Faturável não é mais válido',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `acima de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categoria não é mais válida',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Aplicado ${surcharge}% de sobretaxa de conversão`,
        customUnitOutOfPolicy: 'Taxa não válida para este workspace',
        duplicatedTransaction: 'Duplicar',
        fieldRequired: 'Os campos do relatório são obrigatórios',
        futureDate: 'Data futura não permitida',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marcado em ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Data anterior a ${maxAge} dias`,
        missingCategory: 'Categoria ausente',
        missingComment: 'Descrição necessária para a categoria selecionada',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Faltando ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'O valor difere da distância calculada';
                case 'card':
                    return 'Quantia maior que a transação do cartão';
                default:
                    if (displayPercentVariance) {
                        return `Quantia ${displayPercentVariance}% maior que o recibo escaneado`;
                    }
                    return 'Quantia maior que o recibo escaneado';
            }
        },
        modifiedDate: 'A data difere do recibo digitalizado',
        nonExpensiworksExpense: 'Despesa não Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Despesa excede o limite de aprovação automática de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa da categoria`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Quantia acima do limite de ${formattedLimit}/pessoa`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Quantia acima do limite diário de ${formattedLimit}/pessoa para a categoria`,
        receiptNotSmartScanned:
            'Detalhes da despesa e recibo adicionados manualmente. Por favor, verifique os detalhes. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Saiba mais</a> sobre auditoria automática para todos os recibos.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Recibo necessário';
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
                    return `${preMessage} álcool`;
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
        reviewRequired: 'Revisão necessária',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Não é possível associar automaticamente o recibo devido a uma conexão bancária interrompida.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Não é possível associar automaticamente o recibo devido a uma conexão bancária interrompida que ${email} precisa corrigir.`
                    : 'Não é possível associar automaticamente o recibo devido a uma conexão bancária interrompida que você precisa corrigir.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Peça a ${member} para marcar como dinheiro ou espere 7 dias e tente novamente.` : 'Aguardando a fusão com a transação do cartão.';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendente devido a conexão bancária interrompida',
        adminBrokenConnectionError: 'Recibo pendente devido a uma conexão bancária interrompida. Por favor, resolva em',
        memberBrokenConnectionError: 'Recibo pendente devido a uma conexão bancária interrompida. Por favor, peça a um administrador do espaço de trabalho para resolver.',
        markAsCashToIgnore: 'Marcar como dinheiro para ignorar e solicitar pagamento.',
        smartscanFailed: ({canEdit = true}) => `Falha na digitalização do recibo.${canEdit ? 'Insira os detalhes manualmente.' : ''}`,
        receiptGeneratedWithAI: 'Recibo potencial gerado por IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Faltando ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} não é mais válido`,
        taxAmountChanged: 'O valor do imposto foi modificado',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Imposto'} não é mais válido`,
        taxRateChanged: 'A alíquota de imposto foi modificada',
        taxRequired: 'Taxa de imposto ausente',
        none: 'Nenhum',
        taxCodeToKeep: 'Escolha qual código de imposto manter',
        tagToKeep: 'Escolha qual tag manter',
        isTransactionReimbursable: 'Escolha se a transação é reembolsável',
        merchantToKeep: 'Escolha qual comerciante manter',
        descriptionToKeep: 'Escolha qual descrição manter',
        categoryToKeep: 'Escolha qual categoria manter',
        isTransactionBillable: 'Escolha se a transação é faturável',
        keepThisOne: 'Keep this one',
        confirmDetails: `Confirme os detalhes que você está mantendo`,
        confirmDuplicatesInfo: `As solicitações duplicadas que você não mantiver serão mantidas para o membro excluir.`,
        hold: 'Esta despesa foi colocada em espera',
        resolvedDuplicates: 'resolvido o duplicado',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} é obrigatório`,
    },
    violationDismissal: {
        rter: {
            manual: 'marcou este recibo como dinheiro vivo',
        },
        duplicatedTransaction: {
            manual: 'resolvido o duplicado',
        },
    },
    videoPlayer: {
        play: 'Jogar',
        pause: 'Pausar',
        fullscreen: 'Tela cheia',
        playbackSpeed: 'Velocidade de reprodução',
        expand: 'Expandir',
        mute: 'Silenciar',
        unmute: 'Reativar som',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Antes de você ir',
        reasonPage: {
            title: 'Por favor, nos diga por que você está saindo',
            subtitle: 'Antes de você ir, por favor nos diga por que gostaria de mudar para o Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Preciso de um recurso que está disponível apenas no Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Não entendo como usar o New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Eu entendo como usar o New Expensify, mas eu prefiro o Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Que recurso você precisa que não está disponível no Novo Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'O que você está tentando fazer?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Por que você prefere o Expensify Classic?',
        },
        responsePlaceholder: 'Sua resposta',
        thankYou: 'Obrigado pelo feedback!',
        thankYouSubtitle: 'Suas respostas nos ajudarão a construir um produto melhor para realizar tarefas. Muito obrigado!',
        goToExpensifyClassic: 'Mudar para Expensify Classic',
        offlineTitle: 'Parece que você está preso aqui...',
        offline:
            'Parece que você está offline. Infelizmente, o Expensify Classic não funciona offline, mas o Novo Expensify funciona. Se você preferir usar o Expensify Classic, tente novamente quando tiver uma conexão com a internet.',
        quickTip: 'Dica rápida...',
        quickTipSubTitle: 'Você pode ir direto para o Expensify Classic visitando expensify.com. Adicione aos favoritos para um atalho fácil!',
        bookACall: 'Agendar uma chamada',
        noThanks: 'Não, obrigado.',
        bookACallTitle: 'Gostaria de falar com um gerente de produto?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Conversando diretamente em despesas e relatórios',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Capacidade de fazer tudo no celular',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Viagem e despesas na velocidade do chat',
        },
        bookACallTextTop: 'Ao mudar para o Expensify Classic, você perderá:',
        bookACallTextBottom:
            'Estamos ansiosos para fazer uma ligação com você para entender o motivo. Você pode agendar uma chamada com um dos nossos gerentes de produto sêniores para discutir suas necessidades.',
        takeMeToExpensifyClassic: 'Leve-me para o Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Ocorreu um erro ao carregar mais mensagens',
        tryAgain: 'Tente novamente',
    },
    systemMessage: {
        mergedWithCashTransaction: 'correspondeu um recibo a esta transação',
    },
    subscription: {
        authenticatePaymentCard: 'Autenticar cartão de pagamento',
        mobileReducedFunctionalityMessage: 'Você não pode fazer alterações na sua assinatura no aplicativo móvel.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Teste gratuito: ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'} restantes`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Atualize seu cartão de pagamento até ${date} para continuar usando todos os seus recursos favoritos.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Seu pagamento não pôde ser processado',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Sua cobrança de ${date} no valor de ${purchaseAmountOwed} não pôde ser processada. Por favor, adicione um cartão de pagamento para quitar o valor devido.`
                        : 'Por favor, adicione um cartão de pagamento para quitar o valor devido.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Seu pagamento está atrasado. Por favor, pague sua fatura até ${date} para evitar a interrupção do serviço.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: 'Seu pagamento está atrasado. Por favor, pague sua fatura.',
            },
            billingDisputePending: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Você contestou a cobrança de ${amountOwed} no cartão com final ${cardEnding}. Sua conta será bloqueada até que a disputa seja resolvida com seu banco.`,
            },
            cardAuthenticationRequired: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Seu cartão de pagamento não foi totalmente autenticado. Por favor, complete o processo de autenticação para ativar seu cartão de pagamento com final ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Seu cartão de pagamento foi recusado devido a fundos insuficientes. Por favor, tente novamente ou adicione um novo cartão de pagamento para quitar seu saldo pendente de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Seu cartão de pagamento expirou. Por favor, adicione um novo cartão de pagamento para quitar seu saldo pendente de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Seu cartão está prestes a expirar em breve',
                subtitle: 'Seu cartão de pagamento expirará no final deste mês. Clique no menu de três pontos abaixo para atualizá-lo e continuar usando todos os seus recursos favoritos.',
            },
            retryBillingSuccess: {
                title: 'Sucesso!',
                subtitle: 'Seu cartão foi cobrado com sucesso.',
            },
            retryBillingError: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle:
                    'Antes de tentar novamente, por favor, ligue diretamente para o seu banco para autorizar cobranças da Expensify e remover quaisquer bloqueios. Caso contrário, tente adicionar um cartão de pagamento diferente.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Você contestou a cobrança de ${amountOwed} no cartão com final ${cardEnding}. Sua conta será bloqueada até que a disputa seja resolvida com seu banco.`,
            preTrial: {
                title: 'Inicie uma avaliação gratuita',
                subtitleStart: 'Como próximo passo,',
                subtitleLink: 'complete sua lista de verificação de configuração',
                subtitleEnd: 'para que sua equipe possa começar a registrar despesas.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Teste: ${numOfDays} ${numOfDays === 1 ? 'dia' : 'dias'} restantes!`,
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            trialEnded: {
                title: 'Seu teste gratuito terminou',
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            earlyDiscount: {
                claimOffer: 'Resgatar oferta',
                noThanks: 'Não, obrigado.',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% de desconto no seu primeiro ano!</strong> Basta adicionar um cartão de pagamento e iniciar uma assinatura anual.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Oferta por tempo limitado: ${discountType}% de desconto no seu primeiro ano!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Reivindicar dentro de ${days > 0 ? `${days}d :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Adicione um cartão para pagar sua assinatura do Expensify.',
            addCardButton: 'Adicionar cartão de pagamento',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Sua próxima data de pagamento é ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Cartão com final ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nome: ${name}, Validade: ${expiration}, Moeda: ${currency}`,
            changeCard: 'Alterar cartão de pagamento',
            changeCurrency: 'Alterar moeda de pagamento',
            cardNotFound: 'Nenhum cartão de pagamento adicionado',
            retryPaymentButton: 'Tentar novamente o pagamento',
            authenticatePayment: 'Autenticar pagamento',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                phrase1: 'Obter um reembolso é fácil, basta rebaixar sua conta antes da próxima data de cobrança e você receberá um reembolso.',
                phrase2:
                    'Atenção: Rebaixar sua conta significa que seu(s) espaço(s) de trabalho será(ão) excluído(s). Esta ação não pode ser desfeita, mas você sempre pode criar um novo espaço de trabalho se mudar de ideia.',
                confirm: 'Excluir espaço(s) de trabalho e rebaixar',
            },
            viewPaymentHistory: 'Ver histórico de pagamentos',
        },
        yourPlan: {
            title: 'Seu plano',
            exploreAllPlans: 'Explore todos os planos',
            customPricing: 'Preços personalizados',
            asLowAs: ({price}: YourPlanPriceValueParams) => `a partir de ${price} por membro ativo/mês`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro/mês`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} por membro por mês`,
            perMemberMonth: 'por membro/mês',
            collect: {
                title: 'Coletar',
                description: 'O plano para pequenas empresas que oferece despesas, viagens e chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Digitalização de recibos',
                benefit2: 'Reembolsos',
                benefit3: 'Gerenciamento de cartões corporativos',
                benefit4: 'Aprovações de despesas e viagens',
                benefit5: 'Reserva de viagem e regras',
                benefit6: 'Integrações QuickBooks/Xero',
                benefit7: 'Converse sobre despesas, relatórios e salas',
                benefit8: 'Suporte humano e de IA',
            },
            control: {
                title: 'Controle',
                description: 'Despesa, viagem e chat para grandes empresas.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membro ativo com o Expensify Card, ${upper}/membro ativo sem o Expensify Card.`,
                benefit1: 'Tudo no plano Collect',
                benefit2: 'Fluxos de aprovação em múltiplos níveis',
                benefit3: 'Regras de despesas personalizadas',
                benefit4: 'Integrações ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrações de RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Insights e relatórios personalizados',
                benefit8: 'Orçamento',
            },
            thisIsYourCurrentPlan: 'Este é o seu plano atual',
            downgrade: 'Fazer downgrade para Collect',
            upgrade: 'Atualizar para Control',
            addMembers: 'Adicionar membros',
            saveWithExpensifyTitle: 'Economize com o Expensify Card',
            saveWithExpensifyDescription: 'Use nosso calculador de economia para ver como o cashback do Expensify Card pode reduzir sua fatura do Expensify.',
            saveWithExpensifyButton: 'Saiba mais',
        },
        compareModal: {
            comparePlans: 'Comparar Planos',
            unlockTheFeatures: 'Desbloqueie os recursos que você precisa com o plano certo para você.',
            viewOurPricing: 'Veja nossa página de preços',
            forACompleteFeatureBreakdown: 'para uma análise completa dos recursos de cada um dos nossos planos.',
        },
        details: {
            title: 'Detalhes da assinatura',
            annual: 'Assinatura anual',
            taxExempt: 'Solicitar status de isenção de impostos',
            taxExemptEnabled: 'Isento de impostos',
            taxExemptStatus: 'Status de isenção de impostos',
            payPerUse: 'Pagamento por uso',
            subscriptionSize: 'Tamanho da assinatura',
            headsUp:
                'Atenção: Se você não definir o tamanho da sua assinatura agora, nós a definiremos automaticamente com base no número de membros ativos do seu primeiro mês. Você estará então comprometido a pagar por pelo menos esse número de membros pelos próximos 12 meses. Você pode aumentar o tamanho da sua assinatura a qualquer momento, mas não pode diminuí-la até que sua assinatura termine.',
            zeroCommitment: 'Zero compromisso na taxa de assinatura anual com desconto',
        },
        subscriptionSize: {
            title: 'Tamanho da assinatura',
            yourSize: 'O tamanho da sua assinatura é o número de vagas disponíveis que podem ser preenchidas por qualquer membro ativo em um determinado mês.',
            eachMonth:
                'Todo mês, sua assinatura cobre até o número de membros ativos definido acima. Sempre que você aumentar o tamanho da sua assinatura, começará uma nova assinatura de 12 meses nesse novo tamanho.',
            note: 'Nota: Um membro ativo é qualquer pessoa que tenha criado, editado, enviado, aprovado, reembolsado ou exportado dados de despesas vinculados ao espaço de trabalho da sua empresa.',
            confirmDetails: 'Confirme os detalhes da sua nova assinatura anual:',
            subscriptionSize: 'Tamanho da assinatura',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membros ativos/mês`,
            subscriptionRenews: 'Assinatura renova-se',
            youCantDowngrade: 'Você não pode fazer downgrade durante sua assinatura anual.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Você já se comprometeu com uma assinatura anual de ${size} membros ativos por mês até ${date}. Você pode mudar para uma assinatura de pagamento por uso em ${date} desativando a renovação automática.`,
            error: {
                size: 'Por favor, insira um tamanho de assinatura válido.',
                sameSize: 'Por favor, insira um número diferente do tamanho atual da sua assinatura.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Adicionar cartão de pagamento',
            enterPaymentCardDetails: 'Insira os detalhes do seu cartão de pagamento',
            security: 'A Expensify está em conformidade com PCI-DSS, usa criptografia de nível bancário e utiliza infraestrutura redundante para proteger seus dados.',
            learnMoreAboutSecurity: 'Saiba mais sobre nossa segurança.',
        },
        subscriptionSettings: {
            title: 'Configurações de assinatura',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Tipo de assinatura: ${subscriptionType}, Tamanho da assinatura: ${subscriptionSize}, Renovação automática: ${autoRenew}, Aumento automático de assentos anuais: ${autoIncrease}`,
            none: 'none',
            on: 'em',
            off: 'desligado',
            annual: 'Anual',
            autoRenew: 'Renovação automática',
            autoIncrease: 'Aumento automático de assentos anuais',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Economize até ${amountWithCurrency}/mês por membro ativo`,
            automaticallyIncrease:
                'Aumente automaticamente seus assentos anuais para acomodar membros ativos que excedam o tamanho da sua assinatura. Nota: Isso estenderá a data de término da sua assinatura anual.',
            disableAutoRenew: 'Desativar renovação automática',
            helpUsImprove: 'Ajude-nos a melhorar o Expensify',
            whatsMainReason: 'Qual é o principal motivo para você desativar a renovação automática?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renova em ${date}.`,
            pricingConfiguration: 'O preço depende da configuração. Para o menor preço, escolha uma assinatura anual e obtenha o Expensify Card.',
            learnMore: {
                part1: 'Saiba mais em nosso',
                pricingPage: 'página de preços',
                part2: 'ou converse com nossa equipe no seu',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Preço estimado',
            changesBasedOn: 'Isso muda com base no uso do seu Expensify Card e nas opções de assinatura abaixo.',
        },
        requestEarlyCancellation: {
            title: 'Solicitar cancelamento antecipado',
            subtitle: 'Qual é o principal motivo pelo qual você está solicitando o cancelamento antecipado?',
            subscriptionCanceled: {
                title: 'Assinatura cancelada',
                subtitle: 'Sua assinatura anual foi cancelada.',
                info: 'Se você quiser continuar usando seu(s) espaço(s) de trabalho em uma base de pagamento por uso, está tudo certo.',
                preventFutureActivity: {
                    part1: 'Se você deseja evitar atividades e cobranças futuras, você deve',
                    link: 'excluir seu(s) espaço(s) de trabalho',
                    part2: '. Observe que, ao excluir seu(s) workspace(s), você será cobrado por qualquer atividade pendente que tenha ocorrido durante o mês corrente.',
                },
            },
            requestSubmitted: {
                title: 'Solicitação enviada',
                subtitle: {
                    part1: 'Obrigado por nos informar que você está interessado em cancelar sua assinatura. Estamos revisando sua solicitação e entraremos em contato em breve através do seu chat com',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: `Ao solicitar o cancelamento antecipado, reconheço e concordo que a Expensify não tem obrigação de atender a tal solicitação sob a Expensify.<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Termos de Serviço</a>ou outro acordo de serviços aplicável entre mim e a Expensify e que a Expensify mantém a discrição exclusiva em relação à concessão de qualquer solicitação desse tipo.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'A funcionalidade precisa de melhorias',
        tooExpensive: 'Muito caro',
        inadequateSupport: 'Suporte ao cliente inadequado',
        businessClosing: 'Empresa fechando, reduzindo ou adquirida',
        additionalInfoTitle: 'Para qual software você está migrando e por quê?',
        additionalInfoInputLabel: 'Sua resposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'defina a descrição da sala para:',
        clearRoomDescription: 'limpou a descrição da sala',
    },
    delegate: {
        switchAccount: 'Alternar contas:',
        copilotDelegatedAccess: 'Copilot: Acesso delegado',
        copilotDelegatedAccessDescription: 'Permitir que outros membros acessem sua conta.',
        addCopilot: 'Adicionar copiloto',
        membersCanAccessYourAccount: 'Esses membros podem acessar sua conta:',
        youCanAccessTheseAccounts: 'Você pode acessar essas contas através do alternador de contas:',
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
        accessLevel: 'Nível de acesso',
        confirmCopilot: 'Confirme seu copiloto abaixo.',
        accessLevelDescription: 'Escolha um nível de acesso abaixo. Tanto o acesso Completo quanto o Limitado permitem que copilotos vejam todas as conversas e despesas.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Permitir que outro membro realize todas as ações em sua conta, em seu nome. Inclui bate-papo, envios, aprovações, pagamentos, atualizações de configurações e mais.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Permita que outro membro execute a maioria das ações em sua conta, em seu nome. Exclui aprovações, pagamentos, rejeições e bloqueios.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Remover copilot',
        removeCopilotConfirmation: 'Tem certeza de que deseja remover este copiloto?',
        changeAccessLevel: 'Alterar nível de acesso',
        makeSureItIsYou: 'Vamos garantir que é você',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Por favor, insira o código mágico enviado para ${contactMethod} para adicionar um copiloto. Ele deve chegar em um ou dois minutos.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Por favor, insira o código mágico enviado para ${contactMethod} para atualizar seu copiloto.`,
        notAllowed: 'Não tão rápido...',
        noAccessMessage: 'Como copiloto, você não tem acesso a esta página. Desculpe!',
        notAllowedMessageStart: `Como um(a)`,
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => `para ${accountOwnerEmail}, você não tem permissão para realizar esta ação. Desculpe!`,
        copilotAccess: 'Acesso ao Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Detalhes',
        JSON: 'JSON',
        reportActions: 'Ações',
        reportActionPreview: 'Visualizar',
        nothingToPreview: 'Nada para visualizar',
        editJson: 'Editar JSON:',
        preview: 'Pré-visualização:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Faltando ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriedade inválida: ${propertyName} - Esperado: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valor inválido - Esperado: ${expectedValues}`,
        missingValue: 'Valor ausente',
        createReportAction: 'Criar Ação de Relatório',
        reportAction: 'Relatar Ação',
        report: 'Relatório',
        transaction: 'Transação',
        violations: 'Violações',
        transactionViolation: 'Violação de Transação',
        hint: 'As alterações de dados não serão enviadas para o backend',
        textFields: 'Campos de texto',
        numberFields: 'Campos numéricos',
        booleanFields: 'Campos booleanos',
        constantFields: 'Campos constantes',
        dateTimeFields: 'Campos DateTime',
        date: 'Data',
        time: 'Tempo',
        none: 'Nenhum',
        visibleInLHN: 'Visível no LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Visualizar Relatório',
        viewTransaction: 'Ver transação',
        createTransactionViolation: 'Criar violação de transação',
        reasonVisibleInLHN: {
            hasDraftComment: 'Tem comentário rascunho',
            hasGBR: 'Possui GBR',
            hasRBR: 'Possui RBR',
            pinnedByUser: 'Fixado por membro',
            hasIOUViolations: 'Possui violações de IOU',
            hasAddWorkspaceRoomErrors: 'Tem erros ao adicionar a sala do espaço de trabalho',
            isUnread: 'Está não lido (modo de foco)',
            isArchived: 'Está arquivado (modo mais recente)',
            isSelfDM: 'É auto DM',
            isFocused: 'Está temporariamente focado',
        },
        reasonGBR: {
            hasJoinRequest: 'Tem solicitação de entrada (sala de administração)',
            isUnreadWithMention: 'Está não lido com menção',
            isWaitingForAssigneeToCompleteAction: 'Está aguardando o responsável concluir a ação',
            hasChildReportAwaitingAction: 'Tem um relatório infantil aguardando ação',
            hasMissingInvoiceBankAccount: 'Falta a conta bancária da fatura',
        },
        reasonRBR: {
            hasErrors: 'Tem erros nos dados do relatório ou nas ações do relatório',
            hasViolations: 'Tem violações',
            hasTransactionThreadViolations: 'Tem violações de thread de transação',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Há um relatório aguardando ação',
            theresAReportWithErrors: 'Há um relatório com erros',
            theresAWorkspaceWithCustomUnitsErrors: 'Há um espaço de trabalho com erros de unidades personalizadas',
            theresAProblemWithAWorkspaceMember: 'Há um problema com um membro do espaço de trabalho',
            theresAProblemWithAWorkspaceQBOExport: 'Houve um problema com a configuração de exportação da conexão do espaço de trabalho.',
            theresAProblemWithAContactMethod: 'Há um problema com um método de contato',
            aContactMethodRequiresVerification: 'Um método de contato requer verificação',
            theresAProblemWithAPaymentMethod: 'Há um problema com um método de pagamento',
            theresAProblemWithAWorkspace: 'Há um problema com um espaço de trabalho',
            theresAProblemWithYourReimbursementAccount: 'Há um problema com sua conta de reembolso',
            theresABillingProblemWithYourSubscription: 'Há um problema de cobrança com a sua assinatura',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Sua assinatura foi renovada com sucesso',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Houve um problema durante a sincronização de conexão do espaço de trabalho',
            theresAProblemWithYourWallet: 'Há um problema com sua carteira',
            theresAProblemWithYourWalletTerms: 'Há um problema com os termos da sua carteira',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faça um test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Viagens e despesas, na velocidade do chat',
        subtitle: 'O novo Expensify tem a mesma ótima automação, mas agora com uma colaboração incrível:',
        confirmText: 'Vamos lá!',
        features: {
            chat: '<strong>Converse diretamente em qualquer despesa</strong>, relatório ou espaço de trabalho',
            scanReceipt: '<strong>Escaneie recibos</strong> e receba o reembolso',
            crossPlatform: 'Faça <strong>tudo</strong> do seu telefone ou navegador',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Comece agora',
            part2: 'aqui!',
        },
        saveSearchTooltip: {
            part1: 'Renomeie suas pesquisas salvas',
            part2: 'aqui!',
        },
        bottomNavInboxTooltip: {
            part1: 'Verificar o quê?',
            part2: 'precisa da sua atenção',
            part3: 'e',
            part4: 'conversar sobre despesas.',
        },
        workspaceChatTooltip: {
            part1: 'Converse com',
            part2: 'aprovadores',
        },
        globalCreateTooltip: {
            part1: 'Criar despesas',
            part2: ', começar a conversar,',
            part3: 'e mais.',
            part4: 'Experimente!',
        },
        GBRRBRChat: {
            part1: 'Você verá 🟢 em',
            part2: 'ações a serem tomadas',
            part3: ',\ne 🔴 em',
            part4: 'itens para revisar.',
        },
        accountSwitcher: {
            part1: 'Acesse seu',
            part2: 'Contas Copilot',
            part3: 'aqui',
        },
        expenseReportsFilter: {
            part1: 'Bem-vindo! Encontre todos os seus',
            part2: 'relatórios da empresa',
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
            part8: 'e veja a mágica acontecer!',
            tryItOut: 'Experimente',
            noThanks: 'Não, obrigado.',
        },
        outstandingFilter: {
            part1: 'Filtrar por despesas que',
            part2: 'precisa de aprovação',
        },
        scanTestDriveTooltip: {
            part1: 'Enviar este recibo para',
            part2: 'complete o test drive!',
        },
    },
    discardChangesConfirmation: {
        title: 'Descartar alterações?',
        body: 'Tem certeza de que deseja descartar as alterações que fez?',
        confirmText: 'Descartar alterações',
    },
    scheduledCall: {
        book: {
            title: 'Agendar chamada',
            description: 'Encontre um horário que funcione para você.',
            slots: 'Horários disponíveis para',
        },
        confirmation: {
            title: 'Confirmar chamada',
            description: 'Certifique-se de que os detalhes abaixo estão corretos para você. Assim que você confirmar a chamada, enviaremos um convite com mais informações.',
            setupSpecialist: 'Seu especialista em configuração',
            meetingLength: 'Duração da reunião',
            dateTime: 'Data e hora',
            minutes: '30 minutos',
        },
        callScheduled: 'Chamada agendada',
    },
    autoSubmitModal: {
        title: 'Tudo pronto e enviado!',
        description: 'Todos os avisos e violações foram resolvidos, então:',
        submittedExpensesTitle: 'Estas despesas foram enviadas',
        submittedExpensesDescription: 'Essas despesas foram enviadas para o seu aprovador, mas ainda podem ser editadas até serem aprovadas.',
        pendingExpensesTitle: 'Despesas pendentes foram movidas',
        pendingExpensesDescription: 'Quaisquer despesas pendentes do cartão foram movidas para um relatório separado até serem lançadas.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faça um test drive de 2 minutos',
        },
        modal: {
            title: 'Faça um test drive conosco',
            description: 'Faça um rápido tour pelo produto para se atualizar rapidamente. Sem paradas necessárias!',
            confirmText: 'Iniciar test drive',
            helpText: 'Pular',
            employee: {
                description:
                    '<muted-text>Ganhe <strong>3 meses gratuitos de Expensify</strong> para sua equipe! Basta inserir o e-mail do seu chefe abaixo e enviar uma despesa de teste.</muted-text>',
                email: 'Digite o e-mail do seu chefe',
                error: 'Esse membro possui um espaço de trabalho, por favor insira um novo membro para testar.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Você está atualmente testando o Expensify',
            readyForTheRealThing: 'Pronto para a coisa real?',
            getStarted: 'Comece agora',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} convidou você para experimentar o Expensify\nEi! Acabei de conseguir *3 meses grátis* para testarmos o Expensify, a maneira mais rápida de lidar com despesas.\n\nAqui está um *recibo de teste* para mostrar como funciona:`,
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof en>;
