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
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
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
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "Endere\u00E7o linha ".concat(lineNumber);
        },
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
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "Nenhum resultado encontrado correspondente a \"".concat(searchString, "\"");
        },
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
            phoneNumber: "Por favor, insira um n\u00FAmero de telefone v\u00E1lido, com o c\u00F3digo do pa\u00EDs (ex.: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
            fieldRequired: 'Este campo é obrigatório',
            requestModified: 'Esta solicitação está sendo modificada por outro membro',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "Limite de caracteres excedido (".concat(length, "/").concat(limit, ")");
            },
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
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
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
        letsDoThis: "Vamos fazer isso!",
        letsStart: "Vamos come\u00E7ar",
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
        chooseFiles: 'Escolher arquivos',
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
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "Precisa de algo espec\u00EDfico? Converse com seu gerente de conta, ".concat(accountManagerDisplayName, ".");
        },
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
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "O tamanho do anexo \u00E9 maior que o limite de ".concat(maxUploadSizeInMB, " MB");
        },
        attachmentTooSmall: 'Anexo é muito pequeno',
        sizeNotMet: 'O tamanho do anexo deve ser maior que 240 bytes',
        wrongFileType: 'Tipo de arquivo inválido',
        notAllowedExtension: 'Este tipo de arquivo não é permitido. Por favor, tente um tipo de arquivo diferente.',
        folderNotAllowedMessage: 'Não é permitido fazer upload de uma pasta. Por favor, tente um arquivo diferente.',
        protectedPDFNotSupported: 'PDF protegido por senha não é suportado',
        attachmentImageResized: 'Esta imagem foi redimensionada para visualização. Baixe para resolução completa.',
        attachmentImageTooLarge: 'Esta imagem é muito grande para pré-visualizar antes de fazer o upload.',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "Voc\u00EA pode enviar at\u00E9 ".concat(fileLimit, " arquivos de uma vez.");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Os arquivos excedem ".concat(maxUploadSizeInMB, " MB. Por favor, tente novamente.");
        },
        someFilesCantBeUploaded: 'Alguns arquivos não podem ser enviados',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Os arquivos devem ter menos de ".concat(maxUploadSizeInMB, " MB. Arquivos maiores n\u00E3o ser\u00E3o enviados.");
        },
        maxFileLimitExceeded: 'Você pode enviar até 30 recibos por vez. Os extras não serão enviados.',
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "Arquivos ".concat(fileType, " n\u00E3o s\u00E3o suportados. Apenas os tipos de arquivo suportados ser\u00E3o enviados.");
        },
        learnMoreAboutSupportedFiles: 'Saiba mais sobre formatos suportados.',
        passwordProtected: 'PDFs protegidos por senha não são suportados. Apenas arquivos suportados serão enviados.',
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
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "O comprimento m\u00E1ximo do coment\u00E1rio \u00E9 de ".concat(formattedMaxLength, " caracteres.");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "O comprimento m\u00E1ximo do t\u00EDtulo da tarefa \u00E9 de ".concat(formattedMaxLength, " caracteres.");
        },
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
        loggedInAs: function (_a) {
            var email = _a.email;
            return "Voc\u00EA est\u00E1 conectado como ".concat(email, ". Clique em \"Abrir link\" no prompt para entrar no aplicativo de desktop com esta conta.");
        },
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
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: 'Envie uma despesa, indique seu chefe',
            subtitleText: 'Quer que seu chefe use o Expensify também? Basta enviar uma despesa para ele e nós cuidaremos do resto.',
        },
        _a),
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
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, ", \u00E9 sempre \u00F3timo ver um novo rosto por aqui!");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(login, ". Ele deve chegar dentro de um ou dois minutos.");
        },
    },
    login: {
        hero: {
            header: 'Viagens e despesas, na velocidade do chat',
            body: 'Bem-vindo à próxima geração do Expensify, onde suas viagens e despesas se movem mais rapidamente com a ajuda de um chat contextual em tempo real.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "Voc\u00EA j\u00E1 est\u00E1 conectado como ".concat(email, ".");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "N\u00E3o quer entrar com ".concat(provider, "?");
        },
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
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "S\u00E3o ".concat(time, " para ").concat(user);
        },
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
        editAction: function (_a) {
            var action = _a.action;
            return "Editar ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar');
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "Excluir ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar');
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "Tem certeza de que deseja excluir este ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'despesa' : 'comentar', "?");
        },
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
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "Este chat \u00E9 com todos os membros do Expensify no dom\u00EDnio ".concat(domainRoom, ".");
        },
        beginningOfChatHistoryDomainRoomPartTwo: 'Use-o para conversar com colegas, compartilhar dicas e fazer perguntas.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Este chat é com',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: 'Use-o para conversar sobre a configuração do espaço de trabalho e mais.',
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "Este chat \u00E9 com todos em ".concat(workspaceName, ".");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "Use isso para os an\u00FAncios mais importantes.",
        beginningOfChatHistoryUserRoomPartOne: 'Esta sala de bate-papo é para qualquer coisa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "Este chat \u00E9 para faturas entre",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". Use o bot\u00E3o + para enviar uma fatura.",
        beginningOfChatHistory: 'Este chat é com',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Aqui é onde',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'enviará despesas para',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usar o botão +.',
        beginningOfChatHistorySelfDM: 'Este é o seu espaço pessoal. Use-o para anotações, tarefas, rascunhos e lembretes.',
        beginningOfChatHistorySystemDM: 'Bem-vindo! Vamos configurá-lo.',
        chatWithAccountManager: 'Converse com o seu gerente de conta aqui',
        sayHello: 'Diga olá!',
        yourSpace: 'Seu espaço',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "Bem-vindo(a) ao ".concat(roomName, "!");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "Use o bot\u00E3o + para ".concat(additionalText, " uma despesa.");
        },
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
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'Esta sala de bate-papo foi arquivada.',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "Este chat n\u00E3o est\u00E1 mais ativo porque ".concat(displayName, " encerrou sua conta.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "Este chat n\u00E3o est\u00E1 mais ativo porque ".concat(oldDisplayName, " uniu sua conta com ").concat(displayName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "Este chat n\u00E3o est\u00E1 mais ativo porque <strong>voc\u00EA</strong> n\u00E3o \u00E9 mais um membro do espa\u00E7o de trabalho ".concat(policyName, ".")
                : "Este chat n\u00E3o est\u00E1 mais ativo porque ".concat(displayName, " n\u00E3o \u00E9 mais um membro do espa\u00E7o de trabalho ").concat(policyName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Este chat n\u00E3o est\u00E1 mais ativo porque ".concat(policyName, " n\u00E3o \u00E9 mais um espa\u00E7o de trabalho ativo.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Este chat n\u00E3o est\u00E1 mais ativo porque ".concat(policyName, " n\u00E3o \u00E9 mais um espa\u00E7o de trabalho ativo.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'Esta reserva está arquivada.',
        _b),
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
        column: function (_a) {
            var name = _a.name;
            return "Coluna ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! Um campo obrigat\u00F3rio (\"".concat(fieldName, "\") n\u00E3o foi mapeado. Por favor, revise e tente novamente.");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! Voc\u00EA mapeou um \u00FAnico campo (\"".concat(fieldName, "\") para v\u00E1rias colunas. Por favor, revise e tente novamente.");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! O campo (\"".concat(fieldName, "\") cont\u00E9m um ou mais valores vazios. Por favor, revise e tente novamente.");
        },
        importSuccessfulTitle: 'Importação bem-sucedida',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "".concat(categories, " categorias foram adicionadas.") : '1 categoria foi adicionada.');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return 'Nenhum membro foi adicionado ou atualizado.';
            }
            if (added && updated) {
                return "".concat(added, " membro").concat(added > 1 ? 's' : '', " adicionado, ").concat(updated, " membro").concat(updated > 1 ? 's' : '', " atualizado.");
            }
            if (updated) {
                return updated > 1 ? "".concat(updated, " membros foram atualizados.") : '1 membro foi atualizado.';
            }
            return added > 1 ? "".concat(added, " membros foram adicionados.") : '1 membro foi adicionado.';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "".concat(tags, " tags foram adicionados.") : '1 tag foi adicionado.');
        },
        importMultiLevelTagsSuccessfulDescription: 'Tags de múltiplos níveis foram adicionadas.',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return rates > 1 ? "".concat(rates, " taxas de di\u00E1rias foram adicionadas.") : '1 taxa de diária foi adicionada.';
        },
        importFailedTitle: 'Importação falhou',
        importFailedDescription: 'Por favor, certifique-se de que todos os campos estão preenchidos corretamente e tente novamente. Se o problema persistir, entre em contato com o Concierge.',
        importDescription: 'Escolha quais campos mapear da sua planilha clicando no menu suspenso ao lado de cada coluna importada abaixo.',
        sizeNotMet: 'O tamanho do arquivo deve ser maior que 0 bytes',
        invalidFileMessage: 'O arquivo que você enviou está vazio ou contém dados inválidos. Por favor, certifique-se de que o arquivo está formatado corretamente e contém as informações necessárias antes de enviá-lo novamente.',
        importSpreadsheet: 'Importar planilha',
        downloadCSV: 'Baixar CSV',
    },
    receipt: {
        upload: 'Fazer upload de recibo',
        uploadMultiple: 'Fazer upload de recibos',
        dragReceiptBeforeEmail: 'Arraste um recibo para esta página, encaminhe um recibo para',
        dragReceiptsBeforeEmail: 'Arraste recibos para esta página, encaminhe recibos para',
        dragReceiptAfterEmail: 'ou escolha um arquivo para enviar abaixo.',
        dragReceiptsAfterEmail: 'ou escolha arquivos para enviar abaixo.',
        chooseReceipt: 'Escolha um recibo para enviar ou encaminhe um recibo para',
        chooseReceipts: 'Escolha recibos para enviar ou encaminhe recibos para',
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
        allowLocationFromSetting: "O acesso \u00E0 localiza\u00E7\u00E3o nos ajuda a manter seu fuso hor\u00E1rio e moeda precisos onde quer que voc\u00EA v\u00E1. Por favor, permita o acesso \u00E0 localiza\u00E7\u00E3o nas configura\u00E7\u00F5es de permiss\u00E3o do seu dispositivo.",
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
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Pagar ".concat(name !== null && name !== void 0 ? name : 'alguém');
        },
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
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "Aprovar ".concat(formattedAmount) : 'Aprovar');
        },
        approved: 'Aprovado',
        cash: 'Dinheiro',
        card: 'Cartão',
        original: 'Original',
        split: 'Dividir',
        splitExpense: 'Dividir despesa',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(amount, " de ").concat(merchant);
        },
        addSplit: 'Adicionar divisão',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "O valor total \u00E9 ".concat(amount, " maior que a despesa original.");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "O valor total \u00E9 ".concat(amount, " a menos que a despesa original.");
        },
        splitExpenseZeroAmount: 'Por favor, insira um valor válido antes de continuar.',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "Editar ".concat(amount, " para ").concat(merchant);
        },
        removeSplit: 'Remover divisão',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Pagar ".concat(name !== null && name !== void 0 ? name : 'alguém');
        },
        expense: 'Despesa',
        categorize: 'Categorizar',
        share: 'Compartilhar',
        participants: 'Participantes',
        createExpense: 'Criar despesa',
        trackDistance: 'Rastrear distância',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "Criar ".concat(expensesNumber, " despesas");
        },
        addExpense: 'Adicionar despesa',
        chooseRecipient: 'Escolher destinatário',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "Criar despesa de ".concat(amount);
        },
        confirmDetails: 'Confirmar detalhes',
        pay: 'Pagar',
        cancelPayment: 'Cancelar pagamento',
        cancelPaymentConfirmation: 'Tem certeza de que deseja cancelar este pagamento?',
        viewDetails: 'Ver detalhes',
        pending: 'Pendente',
        canceled: 'Cancelado',
        posted: 'Publicado',
        deleteReceipt: 'Excluir recibo',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "excluiu uma despesa neste relat\u00F3rio, ".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "moveu uma despesa".concat(reportName ? "de ".concat(reportName) : '');
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "moveu esta despesa".concat(reportName ? "para <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '');
        },
        unreportedTransaction: 'movei esta despesa para o seu espaço pessoal',
        pendingMatchWithCreditCard: 'Recibo pendente de correspondência com transação do cartão',
        pendingMatch: 'Partida pendente',
        pendingMatchWithCreditCardDescription: 'Recibo pendente de correspondência com transação do cartão. Marcar como dinheiro para cancelar.',
        markAsCash: 'Marcar como dinheiro',
        routePending: 'Rota pendente...',
        receiptScanning: function () { return ({
            one: 'Escaneando recibo...',
            other: 'Digitalização de recibos...',
        }); },
        scanMultipleReceipts: 'Digitalizar vários recibos',
        scanMultipleReceiptsDescription: 'Tire fotos de todos os seus recibos de uma vez, depois confirme os detalhes você mesmo ou deixe o SmartScan cuidar disso.',
        receiptScanInProgress: 'Digitalização de recibo em andamento',
        receiptScanInProgressDescription: 'Digitalização do recibo em andamento. Verifique mais tarde ou insira os detalhes agora.',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? 'Despesas duplicadas potenciais identificadas. Revise as duplicatas para permitir o envio.'
                : 'Despesas duplicadas potenciais identificadas. Revise os duplicados para permitir a aprovação.';
        },
        receiptIssuesFound: function () { return ({
            one: 'Problema encontrado',
            other: 'Problemas encontrados',
        }); },
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
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " escaneando"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " pendentes"));
            }
            return {
                one: statusText.length > 0 ? "1 despesa (".concat(statusText.join(', '), ")") : "1 despesa",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " despesas (").concat(statusText.join(', '), ")") : "".concat(count, " despesas")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 despesa',
                other: function (count) { return "".concat(count, " despesas"); },
            };
        },
        deleteExpense: function () { return ({
            one: 'Excluir despesa',
            other: 'Excluir despesas',
        }); },
        deleteConfirmation: function () { return ({
            one: 'Tem certeza de que deseja excluir esta despesa?',
            other: 'Tem certeza de que deseja excluir estas despesas?',
        }); },
        deleteReport: 'Excluir relatório',
        deleteReportConfirmation: 'Tem certeza de que deseja excluir este relatório?',
        settledExpensify: 'Pago',
        done: 'Concluído',
        settledElsewhere: 'Pago em outro lugar',
        individual: 'Individual',
        business: 'Negócio',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Pague ".concat(formattedAmount, " com Expensify") : "Pague com Expensify");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Pagar ".concat(formattedAmount, " como indiv\u00EDduo") : "Pagar como indiv\u00EDduo");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "Pagar ".concat(formattedAmount);
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Pague ".concat(formattedAmount, " como uma empresa") : "Pagar como empresa");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Pague ".concat(formattedAmount, " em outro lugar") : "Pague em outro lugar");
        },
        nextStep: 'Próximos passos',
        finished: 'Concluído',
        flip: 'Inverter',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "Enviar fatura de ".concat(amount);
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "Enviar ".concat(amount);
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "para ".concat(comment) : '');
        },
        submitted: "enviado",
        automaticallySubmitted: "enviado via <a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">adiar envios</a>"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "rastreamento ".concat(formattedAmount).concat(comment ? "para ".concat(comment) : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "dividir ".concat(amount);
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "dividir ".concat(formattedAmount).concat(comment ? "para ".concat(comment) : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "Sua parte ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " deve ").concat(amount).concat(comment ? "para ".concat(comment) : '');
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " deve:");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', " pagou ").concat(amount);
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " pagou:");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, " gastou ").concat(amount);
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " gastou:");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " aprovou:");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " aprovou ").concat(amount);
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "pago ".concat(amount);
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "pago ".concat(amount, ". Adicione uma conta banc\u00E1ria para receber seu pagamento.");
        },
        automaticallyApproved: "aprovado via <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regras do workspace</a>"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "aprovado ".concat(amount);
        },
        approvedMessage: "aprovado",
        unapproved: "n\u00E3o aprovado",
        automaticallyForwarded: "aprovado via <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regras do workspace</a>"),
        forwarded: "aprovado",
        rejectedThisReport: 'rejeitou este relatório',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "come\u00E7ou a acertar as contas. O pagamento est\u00E1 em espera at\u00E9 que ".concat(submitterDisplayName, " adicione uma conta banc\u00E1ria.");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', " cancelou o pagamento");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "cancelou o pagamento de ".concat(amount, ", porque ").concat(submitterDisplayName, " n\u00E3o ativou sua Expensify Wallet dentro de 30 dias");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, " adicionou uma conta banc\u00E1ria. O pagamento de ").concat(amount, " foi realizado.");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pago em outro lugar");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pagou com Expensify");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pagou com Expensify via <a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regras do workspace</a>");
        },
        noReimbursableExpenses: 'Este relatório possui um valor inválido',
        pendingConversionMessage: 'O total será atualizado quando você estiver online novamente.',
        changedTheExpense: 'alterou a despesa',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "o ".concat(valueName, " para ").concat(newValueToDisplay);
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "defina o ".concat(translatedChangedField, " para ").concat(newMerchant, ", o que definiu o valor para ").concat(newAmountToDisplay);
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "o ".concat(valueName, " (anteriormente ").concat(oldValueToDisplay, ")");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "o ".concat(valueName, " para ").concat(newValueToDisplay, " (anteriormente ").concat(oldValueToDisplay, ")");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "alterou o ".concat(translatedChangedField, " para ").concat(newMerchant, " (anteriormente ").concat(oldMerchant, "), o que atualizou o valor para ").concat(newAmountToDisplay, " (anteriormente ").concat(oldAmountToDisplay, ")");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "para ".concat(comment) : 'despesa');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "Relat\u00F3rio de Fatura n\u00BA ".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " enviado").concat(comment ? "para ".concat(comment) : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "moveu a despesa do espa\u00E7o pessoal para ".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "conversar com ".concat(reportName));
        },
        movedToPersonalSpace: 'movido despesa para o espaço pessoal',
        tagSelection: 'Selecione uma tag para organizar melhor seus gastos.',
        categorySelection: 'Selecione uma categoria para organizar melhor seus gastos.',
        error: {
            invalidCategoryLength: 'O nome da categoria excede 255 caracteres. Por favor, reduza-o ou escolha uma categoria diferente.',
            invalidTagLength: 'O nome da tag excede 255 caracteres. Por favor, reduza-o ou escolha uma tag diferente.',
            invalidAmount: 'Por favor, insira um valor válido antes de continuar.',
            invalidIntegerAmount: 'Por favor, insira um valor em dólares inteiros antes de continuar.',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "O valor m\u00E1ximo do imposto \u00E9 ".concat(amount);
            },
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
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "come\u00E7ou a acertar. O pagamento est\u00E1 em espera at\u00E9 que ".concat(submitterDisplayName, " ative sua carteira.");
        },
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
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "Este relat\u00F3rio j\u00E1 foi exportado para ".concat(connectionName, ". Alter\u00E1-lo pode levar a discrep\u00E2ncias de dados. Tem certeza de que deseja reabrir este relat\u00F3rio?");
        },
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
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'Esta despesa está em espera. Você quer aprovar mesmo assim?',
            other: 'Essas despesas estão em espera. Você quer aprovar mesmo assim?',
        }); },
        confirmPay: 'Confirmar valor do pagamento',
        confirmPayAmount: 'Pague o que não está em espera, ou pague o relatório inteiro.',
        confirmPayAllHoldAmount: function () { return ({
            one: 'Esta despesa está em espera. Você quer pagar mesmo assim?',
            other: 'Essas despesas estão em espera. Você quer pagar mesmo assim?',
        }); },
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
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "Este relat\u00F3rio j\u00E1 foi exportado para ".concat(accountingIntegration, ". Alter\u00E1-lo pode levar a discrep\u00E2ncias de dados. Tem certeza de que deseja desaprovar este relat\u00F3rio?");
        },
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
        firstDayText: function () { return ({
            one: "Primeiro dia: 1 hora",
            other: function (count) { return "Primeiro dia: ".concat(count.toFixed(2), " horas"); },
        }); },
        lastDayText: function () { return ({
            one: "\u00DAltimo dia: 1 hora",
            other: function (count) { return "\u00DAltimo dia: ".concat(count.toFixed(2), " horas"); },
        }); },
        tripLengthText: function () { return ({
            one: "Viagem: 1 dia inteiro",
            other: function (count) { return "Viagem: ".concat(count, " dias completos"); },
        }); },
        dates: 'Datas',
        rates: 'Taxas',
        submitsTo: function (_a) {
            var name = _a.name;
            return "Envia para ".concat(name);
        },
        moveExpenses: function () { return ({ one: 'Mover despesa', other: 'Mover despesas' }); },
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
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "A imagem selecionada excede o tamanho m\u00E1ximo de upload de ".concat(maxUploadSizeInMB, " MB.");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "Por favor, carregue uma imagem maior que ".concat(minHeightInPx, "x").concat(minWidthInPx, " pixels e menor que ").concat(maxHeightInPx, "x").concat(maxWidthInPx, " pixels.");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "A foto de perfil deve ser de um dos seguintes tipos: ".concat(allowedExtensions.join(', '), ".");
        },
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
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(contactMethod, ". Ele deve chegar em um ou dois minutos.");
        },
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
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "O tamanho do log excede o limite de ".concat(size, " MB. Por favor, use \"Salvar log\" para baixar o arquivo de log.");
            },
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
            lossOfUnsubmittedData: "A fus\u00E3o de suas contas \u00E9 irrevers\u00EDvel e resultar\u00E1 na perda de quaisquer despesas n\u00E3o enviadas para",
            enterMagicCode: "Para continuar, por favor, insira o c\u00F3digo m\u00E1gico enviado para",
            errors: {
                incorrectMagicCode: 'Código mágico incorreto ou inválido. Por favor, tente novamente ou solicite um novo código.',
                fallback: 'Algo deu errado. Por favor, tente novamente mais tarde.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Contas mescladas!',
            successfullyMergedAllData: {
                beforeFirstEmail: "Voc\u00EA mesclou com sucesso todos os dados de",
                beforeSecondEmail: "em",
                afterSecondEmail: ". A partir de agora, voc\u00EA pode usar qualquer login para esta conta.",
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
            afterLink: "para assist\u00EAncia.",
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
        compromisedDescription: 'Notou algo estranho em sua conta? Relatar isso bloqueará imediatamente sua conta, interromperá novas transações do Cartão Expensify e impedirá alterações na conta.',
        domainAdminsDescription: 'Para administradores de domínio: Isso também pausa toda a atividade do Cartão Expensify e ações administrativas em seus domínios.',
        areYouSure: 'Tem certeza de que deseja bloquear sua conta Expensify?',
        ourTeamWill: 'Nossa equipe investigará e removerá qualquer acesso não autorizado. Para recuperar o acesso, será necessário trabalhar com o Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Falha ao bloquear a conta',
        failedToLockAccountDescription: "N\u00E3o conseguimos bloquear sua conta. Por favor, converse com o Concierge para resolver este problema.",
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
        whatIsTwoFactorAuth: 'A autenticação de dois fatores (2FA) ajuda a manter sua conta segura. Ao fazer login, você precisará inserir um código gerado pelo seu aplicativo autenticador preferido.',
        disableTwoFactorAuth: 'Desativar a autenticação de dois fatores',
        explainProcessToRemove: 'Para desativar a autenticação de dois fatores (2FA), insira um código válido do seu aplicativo de autenticação.',
        disabled: 'A autenticação de dois fatores está agora desativada',
        noAuthenticatorApp: 'Você não precisará mais de um aplicativo autenticador para fazer login no Expensify.',
        stepCodes: 'Códigos de recuperação',
        keepCodesSafe: 'Mantenha esses códigos de recuperação em segurança!',
        codesLoseAccess: 'Se você perder o acesso ao seu aplicativo autenticador e não tiver esses códigos, perderá o acesso à sua conta.\n\nNota: Configurar a autenticação de dois fatores irá desconectá-lo de todas as outras sessões ativas.',
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
        twoFactorAuthIsRequiredForAdminsDescription: 'Sua conexão de contabilidade com a Xero requer o uso de autenticação de dois fatores. Para continuar usando o Expensify, por favor, ative-a.',
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
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Voc\u00EA pode gastar at\u00E9 ".concat(formattedLimit, " neste cart\u00E3o, e o limite ser\u00E1 redefinido \u00E0 medida que suas despesas enviadas forem aprovadas.");
            },
        },
        fixedLimit: {
            name: 'Limite fixo',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Voc\u00EA pode gastar at\u00E9 ".concat(formattedLimit, " neste cart\u00E3o, e ent\u00E3o ele ser\u00E1 desativado.");
            },
        },
        monthlyLimit: {
            name: 'Limite mensal',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Voc\u00EA pode gastar at\u00E9 ".concat(formattedLimit, " neste cart\u00E3o por m\u00EAs. O limite ser\u00E1 redefinido no primeiro dia de cada m\u00EAs do calend\u00E1rio.");
            },
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
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "Adicionado \u00E0 Carteira ".concat(platform);
        },
        cardDetailsLoadingFailure: 'Ocorreu um erro ao carregar os detalhes do cartão. Por favor, verifique sua conexão com a internet e tente novamente.',
        validateCardTitle: 'Vamos garantir que é você',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(contactMethod, " para visualizar os detalhes do seu cart\u00E3o. Ele deve chegar dentro de um ou dois minutos.");
        },
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
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> j\u00E1 aprova relat\u00F3rios para <strong>").concat(name2, "</strong>. Por favor, escolha um aprovador diferente para evitar um fluxo de trabalho circular.");
        },
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
        description: 'Se os detalhes do seu cartão virtual forem roubados ou comprometidos, desativaremos permanentemente o seu cartão existente e forneceremos um novo cartão virtual e número.',
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
            throttled: 'Você digitou incorretamente os últimos 4 dígitos do seu Cartão Expensify muitas vezes. Se você tem certeza de que os números estão corretos, entre em contato com o Concierge para resolver. Caso contrário, tente novamente mais tarde.',
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
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'Instantâneo (Cartão de débito)',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% de taxa (").concat(minAmount, " m\u00EDnimo)");
        },
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
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "em ".concat(policyName);
        },
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
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "Chat em grupo de ".concat(displayName);
        },
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
        phrase5: "A transmiss\u00E3o de dinheiro \u00E9 fornecida por ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " (NMLS ID:2017010) de acordo com seu"),
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
            unableToResetPassword: 'Não conseguimos alterar sua senha. Isso provavelmente se deve a um link de redefinição de senha expirado em um e-mail antigo de redefinição de senha. Enviamos um novo link para que você possa tentar novamente. Verifique sua Caixa de Entrada e sua pasta de Spam; ele deve chegar em apenas alguns minutos.',
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
        notYou: function (_a) {
            var user = _a.user;
            return "N\u00E3o \u00E9 ".concat(user, "?");
        },
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
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "Algu\u00E9m do ".concat(domain, " j\u00E1 criou um espa\u00E7o de trabalho. Por favor, insira o c\u00F3digo m\u00E1gico enviado para ").concat(email, ".");
        },
        joinAWorkspace: 'Participar de um espaço de trabalho',
        listOfWorkspaces: 'Aqui está a lista de espaços de trabalho que você pode ingressar. Não se preocupe, você sempre pode ingressar neles mais tarde, se preferir.',
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " membro").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'Onde você trabalha?',
        errorSelection: 'Selecione uma opção para continuar',
        purpose: (_c = {
                title: 'O que você quer fazer hoje?',
                errorContinue: 'Por favor, pressione continuar para configurar',
                errorBackButton: 'Por favor, finalize as perguntas de configuração para começar a usar o aplicativo'
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = 'Ser reembolsado pelo meu empregador',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = 'Gerenciar as despesas da minha equipe',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = 'Acompanhe e planeje despesas',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = 'Converse e divida despesas com amigos',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = 'Algo mais',
            _c),
        employees: (_d = {
                title: 'Quantos funcionários você tem?'
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10 funcionários',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50 funcionários',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100 funcionários',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1.000 funcionários',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = 'Mais de 1.000 funcionários',
            _d),
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
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(workEmail, ". Ele deve chegar em um ou dois minutos.");
            },
        },
        workEmailValidationError: {
            publicEmail: 'Por favor, insira um e-mail de trabalho válido de um domínio privado, por exemplo, mitch@company.com.',
            offline: 'Não conseguimos adicionar seu e-mail de trabalho, pois você parece estar offline.',
        },
        mergeBlockScreen: {
            title: 'Não foi possível adicionar o e-mail de trabalho',
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "N\u00E3o conseguimos adicionar ".concat(workEmail, ". Por favor, tente novamente mais tarde em Configura\u00E7\u00F5es ou converse com o Concierge para obter orienta\u00E7\u00E3o.");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Fa\u00E7a um [test drive](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Fa\u00E7a um tour r\u00E1pido pelo produto](".concat(testDriveURL, ") para ver por que o Expensify \u00E9 a maneira mais r\u00E1pida de fazer suas despesas.");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Fa\u00E7a um [test drive](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Fa\u00E7a um test drive](".concat(testDriveURL, ") conosco e sua equipe ganha *3 meses gr\u00E1tis de Expensify!*");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "[Crie](".concat(workspaceConfirmationLink, ") um espa\u00E7o de trabalho");
                },
                description: 'Crie um espaço de trabalho e configure as definições com a ajuda do seu especialista em configuração!',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Crie um [espa\u00E7o de trabalho](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*Crie um espaço de trabalho* para rastrear despesas, digitalizar recibos, conversar e muito mais.\n' +
                        '\n' +
                        '1. Clique em *Espaços de trabalho* > *Novo espaço de trabalho*.\n' +
                        '\n' +
                        "*Seu novo espa\u00E7o de trabalho est\u00E1 pronto!* [Confira](".concat(workspaceSettingsLink, ").");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "Configure [categorias](".concat(workspaceCategoriesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*Configure categorias* para que sua equipe possa categorizar despesas para relatórios fáceis.\n' +
                        '\n' +
                        '1. Clique em *Espaços de trabalho*.\n' +
                        '3. Selecione seu espaço de trabalho.\n' +
                        '4. Clique em *Categorias*.\n' +
                        '5. Desative quaisquer categorias que você não precise.\n' +
                        '6. Adicione suas próprias categorias no canto superior direito.\n' +
                        '\n' +
                        "[Leve-me para as configura\u00E7\u00F5es de categoria do espa\u00E7o de trabalho](".concat(workspaceCategoriesLink, ").\n") +
                        '\n' +
                        "![Configurar categorias](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Envie uma despesa',
                description: '*Envie uma despesa* inserindo um valor ou digitalizando um recibo.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar despesa*.\n' +
                    '3. Insira um valor ou digitalize um recibo.\n' +
                    "4. Adicione o e-mail ou n\u00FAmero de telefone do seu chefe.\n" +
                    '5. Clique em *Criar*.\n' +
                    '\n' +
                    'E pronto!',
            },
            adminSubmitExpenseTask: {
                title: 'Envie uma despesa',
                description: '*Envie uma despesa* inserindo um valor ou digitalizando um recibo.\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar despesa*.\n' +
                    '3. Insira um valor ou digitalize um recibo.\n' +
                    '4. Confirme os detalhes.\n' +
                    '5. Clique em *Criar*.\n' +
                    '\n' +
                    "E pronto!",
            },
            trackExpenseTask: {
                title: 'Rastreie uma despesa',
                description: '*Rastreie uma despesa* em qualquer moeda, com ou sem recibo.\n' +
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
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Conecte-se".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' ao', " [").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'seu' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Conecte-se".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? ' ao seu' : ' ao', " ").concat(integrationName, " para categoriza\u00E7\u00E3o autom\u00E1tica de despesas e sincroniza\u00E7\u00E3o que torna o fechamento do m\u00EAs muito f\u00E1cil.\n") +
                        '\n' +
                        '1. Clique em *Configurações*.\n' +
                        '2. Vá para *Espaços de trabalho*.\n' +
                        '3. Selecione seu espaço de trabalho.\n' +
                        '4. Clique em *Contabilidade*.\n' +
                        "5. Encontre ".concat(integrationName, ".\n") +
                        '6. Clique em *Conectar*.\n' +
                        '\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[Leve-me para a contabilidade](".concat(workspaceAccountingLink, ").\n\n![Conecte-se ao ").concat(integrationName, "](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[Leve-me para a contabilidade](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Conecte [seu cart\u00E3o corporativo](".concat(corporateCardLink, ")");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Conecte seu cart\u00E3o corporativo para importar e categorizar despesas automaticamente.\n" +
                        '\n' +
                        '1. Clique em *Espaços de trabalho*.\n' +
                        '2. Selecione seu espaço de trabalho.\n' +
                        '3. Clique em *Cartões corporativos*.\n' +
                        '4. Siga as instruções para conectar seu cartão.\n' +
                        '\n' +
                        "[Leve-me para conectar meus cart\u00F5es corporativos](".concat(corporateCardLink, ").");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Convide [sua equipe](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Convide sua equipe* para o Expensify para que eles possam começar a rastrear despesas hoje mesmo.\n' +
                        '\n' +
                        '1. Clique em *Espaços de trabalho*.\n' +
                        '3. Selecione seu espaço de trabalho.\n' +
                        '4. Clique em *Membros* > *Convidar membro*.\n' +
                        '5. Insira e-mails ou números de telefone. \n' +
                        '6. Adicione uma mensagem de convite personalizada, se desejar!\n' +
                        '\n' +
                        "[Leve-me para os membros do espa\u00E7o de trabalho](".concat(workspaceMembersLink, ").\n") +
                        '\n' +
                        "![Convide sua equipe](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configure [categorias](".concat(workspaceCategoriesLink, ") e [tags](").concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*Configure categorias e tags* para que sua equipe possa categorizar despesas para relatórios fáceis.\n' +
                        '\n' +
                        "Importe-as automaticamente [conectando seu software de contabilidade](".concat(workspaceAccountingLink, "), ou configure-as manualmente nas [configura\u00E7\u00F5es do seu espa\u00E7o de trabalho](").concat(workspaceCategoriesLink, ").");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configure [tags](".concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return 'Use tags para adicionar detalhes extras de despesas, como projetos, clientes, locais e departamentos. Se você precisar de vários níveis de tags, pode fazer upgrade para o plano Control.\n' +
                        '\n' +
                        '1. Clique em *Espaços de trabalho*.\n' +
                        '3. Selecione seu espaço de trabalho.\n' +
                        '4. Clique em *Mais recursos*.\n' +
                        '5. Habilite *Tags*.\n' +
                        '6. Navegue até *Tags* no editor do espaço de trabalho.\n' +
                        '7. Clique em *+ Adicionar tag* para criar as suas.\n' +
                        '\n' +
                        "[Leve-me para mais recursos](".concat(workspaceMoreFeaturesLink, ").\n") +
                        '\n' +
                        "![Configurar tags](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Convide seu [contador](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Convide seu contador* para colaborar no seu espaço de trabalho e gerenciar as despesas da sua empresa.\n' +
                        '\n' +
                        '1. Clique em *Espaços de trabalho*.\n' +
                        '2. Selecione seu espaço de trabalho.\n' +
                        '3. Clique em *Membros*.\n' +
                        '4. Clique em *Convidar membro*.\n' +
                        '5. Insira o e-mail do seu contador.\n' +
                        '\n' +
                        "[Convide seu contador agora](".concat(workspaceMembersLink, ").");
                },
            },
            startChatTask: {
                title: 'Iniciar um bate-papo',
                description: '*Inicie um bate-papo* com qualquer pessoa usando seu e-mail ou número de telefone.\n' +
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
                description: '*Divida despesas* com uma ou mais pessoas.\n' +
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
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Revise suas [configura\u00E7\u00F5es de espa\u00E7o de trabalho](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return 'Veja como revisar e atualizar as configurações do seu espaço de trabalho:\n' +
                        '1. Clique na aba de configurações.\n' +
                        '2. Clique em *Espaços de trabalho* > [Seu espaço de trabalho].\n' +
                        "[V\u00E1 para o seu espa\u00E7o de trabalho](".concat(workspaceSettingsLink, "). Vamos rastre\u00E1-los na sala #admins.");
                },
            },
            createReportTask: {
                title: 'Crie seu primeiro relatório',
                description: 'Veja como criar um relatório:\n' +
                    '\n' +
                    '1. Clique no botão verde *+*.\n' +
                    '2. Escolha *Criar relatório*.\n' +
                    '3. Clique em *Adicionar despesa*.\n' +
                    '4. Adicione sua primeira despesa.\n' +
                    '\n' +
                    'E pronto!',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return (testDriveURL ? "Fa\u00E7a um [test drive](".concat(testDriveURL, ")") : 'Faça um test drive');
            },
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'Meu recibo de test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Ser reembolsado é tão fácil quanto enviar uma mensagem. Vamos ver o básico.',
            onboardingPersonalSpendMessage: 'Veja como rastrear seus gastos em poucos cliques.',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "Aqui est\u00E1 uma lista de tarefas que eu recomendaria para uma empresa do seu tamanho com ".concat(onboardingCompanySize, " remetentes:");
            },
            onboardingTrackWorkspaceMessage: '# Vamos configurar você\n👋 Estou aqui para ajudar! Para você começar, adaptei as configurações do seu espaço de trabalho para microempreendedores individuais e empresas semelhantes. Você pode ajustar seu espaço de trabalho clicando no link abaixo!\n\nVeja como rastrear seus gastos em poucos cliques:',
            onboardingChatSplitMessage: 'Dividir contas com amigos é tão fácil quanto enviar uma mensagem. Veja como.',
            onboardingAdminMessage: 'Aprenda a gerenciar o espaço de trabalho da sua equipe como administrador e enviar suas próprias despesas.',
            onboardingLookingAroundMessage: 'O Expensify é mais conhecido por despesas, viagens e gerenciamento de cartões corporativos, mas fazemos muito mais do que isso. Diga-me o que lhe interessa e eu o ajudarei a começar.',
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
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "A data deve ser anterior a ".concat(dateString);
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "A data deve ser ap\u00F3s ".concat(dateString);
            },
            hasInvalidCharacter: 'O nome pode incluir apenas caracteres latinos',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "Formato de c\u00F3digo postal incorreto".concat(zipFormat ? "Formato aceit\u00E1vel: ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "Por favor, certifique-se de que o n\u00FAmero de telefone \u00E9 v\u00E1lido (por exemplo, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link foi reenviado',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "Enviei um link m\u00E1gico de login para ".concat(login, ". Por favor, verifique seu ").concat(loginType, " para entrar.");
        },
        resendLink: 'Reenviar link',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "Para validar ".concat(secondaryLogin, ", por favor, reenvie o c\u00F3digo m\u00E1gico das Configura\u00E7\u00F5es da Conta de ").concat(primaryLogin, ".");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "Se voc\u00EA n\u00E3o tiver mais acesso a ".concat(primaryLogin, ", por favor, desvincule suas contas.");
        },
        unlink: 'Desvincular',
        linkSent: 'Link enviado!',
        successfullyUnlinkedLogin: 'Login secundário desvinculado com sucesso!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "Nosso provedor de e-mail suspendeu temporariamente os e-mails para ".concat(login, " devido a problemas de entrega. Para desbloquear seu login, siga estas etapas:");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "Confirme que ".concat(login, " est\u00E1 escrito corretamente e \u00E9 um endere\u00E7o de e-mail real e v\u00E1lido para entrega.");
        },
        emailAliases: 'Os aliases de e-mail, como "expenses@domain.com", devem ter acesso à sua própria caixa de entrada de e-mail para que seja um login válido do Expensify.',
        ensureYourEmailClient: 'Certifique-se de que seu cliente de e-mail permita e-mails de expensify.com.',
        youCanFindDirections: 'Você pode encontrar instruções sobre como concluir esta etapa',
        helpConfigure: 'mas você pode precisar que o seu departamento de TI ajude a configurar as suas configurações de e-mail.',
        onceTheAbove: 'Depois de concluir as etapas acima, por favor entre em contato com',
        toUnblock: 'para desbloquear seu login.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "N\u00E3o conseguimos entregar mensagens SMS para ".concat(login, ", ent\u00E3o suspendemos temporariamente. Por favor, tente validar seu n\u00FAmero:");
        },
        validationSuccess: 'Seu número foi validado! Clique abaixo para enviar um novo código mágico de login.',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'Por favor, aguarde um momento antes de tentar novamente.';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? 'dia' : 'dias'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? 'hora' : 'horas'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? 'minuto' : 'minutos'));
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
            return "Aguarde! Voc\u00EA precisa esperar ".concat(timeText, " antes de tentar validar seu n\u00FAmero novamente.");
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
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "Ops... ".concat(isBreakLine ? '\n' : '', "Algo deu errado");
        },
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
        untilTime: function (_a) {
            var time = _a.time;
            return "At\u00E9 ".concat(time);
        },
        date: 'Data',
        time: 'Tempo',
        clearAfter: 'Limpar após',
        whenClearStatus: 'Quando devemos limpar seu status?',
        vacationDelegate: 'Delegado de férias',
        setVacationDelegate: "Defina um delegado de f\u00E9rias para aprovar relat\u00F3rios em seu nome enquanto estiver fora do escrit\u00F3rio.",
        vacationDelegateError: 'Ocorreu um erro ao atualizar seu delegado de férias.',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "como delegado de f\u00E9rias de ".concat(managerName);
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "para ".concat(submittedToName, " como delegado de f\u00E9rias de ").concat(vacationDelegateName);
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "Voc\u00EA est\u00E1 designando ".concat(nameOrEmail, " como seu delegado de f\u00E9rias. Essa pessoa ainda n\u00E3o est\u00E1 em todos os seus espa\u00E7os de trabalho. Se voc\u00EA continuar, um e-mail ser\u00E1 enviado para todos os administradores dos seus espa\u00E7os solicitando a inclus\u00E3o dela.");
        },
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "Etapa ".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
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
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "Para conectar uma conta banc\u00E1ria, por favor <a href=\"".concat(contactMethodRoute, "\">adicione um e-mail como seu login principal</a> e tente novamente. Voc\u00EA pode adicionar seu n\u00FAmero de telefone como um login secund\u00E1rio.");
        },
        hasBeenThrottledError: 'Ocorreu um erro ao adicionar sua conta bancária. Por favor, aguarde alguns minutos e tente novamente.',
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "Ops! Parece que a moeda do seu espa\u00E7o de trabalho est\u00E1 definida para uma moeda diferente de USD. Para continuar, por favor v\u00E1 para <a href=\"".concat(workspaceRoute, "\">suas configura\u00E7\u00F5es de espa\u00E7o de trabalho</a> para definir para USD e tentar novamente.");
        },
        error: {
            youNeedToSelectAnOption: 'Por favor, selecione uma opção para continuar',
            noBankAccountAvailable: 'Desculpe, não há nenhuma conta bancária disponível.',
            noBankAccountSelected: 'Por favor, escolha uma conta',
            taxID: 'Por favor, insira um número de identificação fiscal válido.',
            website: 'Por favor, insira um site válido',
            zipCode: "Por favor, insira um c\u00F3digo postal v\u00E1lido usando o formato: ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
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
            tooManyAttempts: 'Devido a um alto número de tentativas de login, esta opção foi desativada por 24 horas. Por favor, tente novamente mais tarde ou insira os detalhes manualmente.',
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
        errorMessageInvalidPhone: "Por favor, insira um n\u00FAmero de telefone v\u00E1lido sem par\u00EAnteses ou tra\u00E7os. Se voc\u00EA estiver fora dos EUA, inclua o c\u00F3digo do seu pa\u00EDs (ex.: ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
        errorMessageInvalidEmail: 'E-mail inválido',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " j\u00E1 \u00E9 membro de ").concat(name);
        },
    },
    onfidoStep: {
        acceptTerms: 'Ao continuar com a solicitação para ativar sua Expensify Wallet, você confirma que leu, entendeu e aceita',
        facialScan: 'Política e Autorização de Varredura Facial da Onfido',
        tryAgain: 'Tente novamente',
        verifyIdentity: 'Verificar identidade',
        letsVerifyIdentity: 'Vamos verificar sua identidade',
        butFirst: "Mas primeiro, a parte chata. Leia as informa\u00E7\u00F5es legais na pr\u00F3xima etapa e clique em \"Aceitar\" quando estiver pronto.",
        genericError: 'Ocorreu um erro ao processar esta etapa. Por favor, tente novamente.',
        cameraPermissionsNotGranted: 'Ativar acesso à câmera',
        cameraRequestMessage: 'Precisamos de acesso à sua câmera para concluir a verificação da conta bancária. Por favor, habilite em Configurações > New Expensify.',
        microphonePermissionsNotGranted: 'Ativar acesso ao microfone',
        microphoneRequestMessage: 'Precisamos de acesso ao seu microfone para concluir a verificação da conta bancária. Por favor, habilite em Configurações > New Expensify.',
        originalDocumentNeeded: 'Por favor, envie uma imagem original do seu documento de identidade em vez de uma captura de tela ou imagem escaneada.',
        documentNeedsBetterQuality: 'Seu documento de identificação parece estar danificado ou com recursos de segurança ausentes. Por favor, faça o upload de uma imagem original de um documento de identificação não danificado que esteja totalmente visível.',
        imageNeedsBetterQuality: 'Há um problema com a qualidade da imagem do seu documento de identidade. Por favor, envie uma nova imagem onde todo o seu documento possa ser visto claramente.',
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
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "A Expensify Wallet \u00E9 emitida por ".concat(walletProgram, ".");
            },
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
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
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
            fdicInsuranceBancorp2: 'para detalhes.',
            contactExpensifyPayments: "Entre em contato com ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " ligando para +1 833-400-0904, ou por e-mail em"),
            contactExpensifyPayments2: 'ou faça login em',
            generalInformation: 'Para informações gerais sobre contas pré-pagas, visite',
            generalInformation2: 'Se você tiver uma reclamação sobre uma conta pré-paga, ligue para o Bureau de Proteção Financeira do Consumidor pelo 1-855-411-2372 ou visite',
            printerFriendlyView: 'Ver versão para impressão',
            automated: 'Automatizado',
            liveAgent: 'Agente ao vivo',
            instant: 'Instantâneo',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "Min ".concat(amount);
            },
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
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'Qual é o Número de Identificação do Empregador (EIN)?';
                case CONST_1.default.COUNTRY.CA:
                    return 'Qual é o Número Comercial (BN)?';
                case CONST_1.default.COUNTRY.GB:
                    return 'Qual é o Número de Registro de IVA (VRN)?';
                case CONST_1.default.COUNTRY.AU:
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
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Volume de pagamento anual em ".concat(currencyCode);
        },
        averageReimbursementAmount: 'Valor médio de reembolso',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Valor m\u00E9dio de reembolso em ".concat(currencyCode);
        },
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
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return 'Por favor, informe um Número de Identificação do Empregador (EIN) válido';
                    case CONST_1.default.COUNTRY.CA:
                        return 'Por favor, informe um Número Comercial (BN) válido';
                    case CONST_1.default.COUNTRY.GB:
                        return 'Por favor, informe um Número de Registro de IVA (VRN) válido';
                    case CONST_1.default.COUNTRY.AU:
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
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "Voc\u00EA possui 25% ou mais de ".concat(companyName, "?");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "Algum indiv\u00EDduo possui 25% ou mais de ".concat(companyName, "?");
        },
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
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "Existem outras pessoas que possuem 25% ou mais de ".concat(companyName, "?");
        },
        owners: 'Proprietários',
        addCertified: 'Adicione um organograma certificado que mostre os proprietários beneficiários',
        regulationRequiresChart: 'A regulamentação exige que coletemos uma cópia certificada do organograma de propriedade que mostre cada indivíduo ou entidade que possua 25% ou mais do negócio.',
        uploadEntity: 'Carregar gráfico de propriedade da entidade',
        noteEntity: 'Nota: O gráfico de propriedade da entidade deve ser assinado pelo seu contador, consultor jurídico ou ser autenticado.',
        certified: 'Gráfico de propriedade de entidade certificada',
        selectCountry: 'Selecionar país',
        findCountry: 'Encontrar país',
        address: 'Endereço',
        chooseFile: 'Escolher arquivo',
        uploadDocuments: 'Carregar documentação adicional',
        pleaseUpload: 'Por favor, envie documentação adicional abaixo para nos ajudar a verificar sua identidade como proprietário direto ou indireto de 25% ou mais da entidade empresarial.',
        acceptedFiles: 'Formatos de arquivo aceitos: PDF, PNG, JPEG. O tamanho total do arquivo para cada seção não pode exceder 5 MB.',
        proofOfBeneficialOwner: 'Prova de beneficiário final',
        proofOfBeneficialOwnerDescription: 'Por favor, forneça uma declaração assinada e um organograma de um contador público, notário ou advogado verificando a propriedade de 25% ou mais do negócio. Deve estar datado dos últimos três meses e incluir o número da licença do signatário.',
        copyOfID: 'Cópia do documento de identidade do proprietário beneficiário',
        copyOfIDDescription: 'Exemplos: Passaporte, carteira de motorista, etc.',
        proofOfAddress: 'Comprovante de endereço para o proprietário beneficiário',
        proofOfAddressDescription: 'Exemplos: conta de luz, contrato de aluguel, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: 'Por favor, faça o upload de um vídeo de uma visita ao local ou de uma chamada gravada com o oficial responsável pela assinatura. O oficial deve fornecer: nome completo, data de nascimento, nome da empresa, número de registro, número do código fiscal, endereço registrado, natureza do negócio e finalidade da conta.',
    },
    validationStep: {
        headerTitle: 'Validar conta bancária',
        buttonText: 'Concluir configuração',
        maxAttemptsReached: 'A validação para esta conta bancária foi desativada devido a muitas tentativas incorretas.',
        description: "Dentro de 1-2 dias \u00FAteis, enviaremos tr\u00EAs (3) pequenas transa\u00E7\u00F5es para sua conta banc\u00E1ria de um nome como \"Expensify, Inc. Validation\".",
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
        description: "Dentro de 1-2 dias \u00FAteis, enviaremos tr\u00EAs (3) pequenas transa\u00E7\u00F5es para sua conta banc\u00E1ria de um nome como \"Expensify, Inc. Validation\".",
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
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "Voc\u00EA \u00E9 um diretor ou executivo s\u00EAnior na ".concat(companyName, "?");
        },
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
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "Digite o e-mail do diretor ou executivo s\u00EAnior da ".concat(companyName);
        },
        regulationRequiresOneMoreDirector: 'A regulamentação exige pelo menos mais um diretor ou executivo sênior como signatário.',
        hangTight: 'Aguarde...',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "Digite os e-mails de dois diretores ou executivos seniores da ".concat(companyName);
        },
        sendReminder: 'Enviar um lembrete',
        chooseFile: 'Escolher arquivo',
        weAreWaiting: 'Estamos aguardando que outros verifiquem suas identidades como diretores ou executivos seniores da empresa.',
        id: 'Cópia do RG',
        proofOfDirectors: 'Prova de diretor(es)',
        proofOfDirectorsDescription: 'Exemplos: Perfil Corporativo da Oncorp ou Registro de Negócios.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale para Signatários, Usuários Autorizados e Proprietários Beneficiários.',
        PDSandFSG: 'Documentação de divulgação PDS + FSG',
        PDSandFSGDescription: 'Nossa parceria com a Corpay utiliza uma conexão API para aproveitar sua vasta rede de parceiros bancários internacionais para viabilizar Reembolsos Globais na Expensify. De acordo com a regulamentação australiana, estamos fornecendo a você o Guia de Serviços Financeiros (FSG) e a Declaração de Divulgação de Produto (PDS) da Corpay.\n\nPor favor, leia os documentos FSG e PDS cuidadosamente, pois eles contêm detalhes completos e informações importantes sobre os produtos e serviços oferecidos pela Corpay. Guarde esses documentos para referência futura.',
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
        thanksFor: 'Obrigado por esses detalhes. Um agente de suporte dedicado agora revisará suas informações. Entraremos em contato se precisarmos de mais alguma coisa de você, mas, enquanto isso, sinta-se à vontade para nos contatar caso tenha alguma dúvida.',
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
            defaultWorkspaceError: 'Você precisa definir um espaço de trabalho padrão para habilitar o Expensify Travel. Vá para Configurações > Espaços de Trabalho > clique nos três pontos verticais ao lado de um espaço de trabalho > Definir como espaço de trabalho padrão, depois tente novamente!',
        },
        flight: 'Voo',
        flightDetails: {
            passenger: 'Passageiro',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>Voc\u00EA tem uma <strong>escala de ".concat(layover, "</strong> antes deste voo</muted-text-label>");
            },
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
            restrictionPrefix: "Voc\u00EA n\u00E3o tem permiss\u00E3o para habilitar o Expensify Travel para o dom\u00EDnio",
            restrictionSuffix: "Voc\u00EA precisar\u00E1 pedir a algu\u00E9m desse dom\u00EDnio para habilitar a viagem.",
            accountantInvitationPrefix: "Se voc\u00EA \u00E9 contador, considere se juntar ao",
            accountantInvitationLink: "Programa de contadores ExpensifyApproved!",
            accountantInvitationSuffix: "para habilitar viagens para este dom\u00EDnio.",
        },
        publicDomainError: {
            title: 'Comece com o Expensify Travel',
            message: "Voc\u00EA precisar\u00E1 usar seu e-mail de trabalho (por exemplo, nome@empresa.com) com o Expensify Travel, n\u00E3o seu e-mail pessoal (por exemplo, nome@gmail.com).",
        },
        blockedFeatureModal: {
            title: 'Expensify Travel foi desativado',
            message: "Seu administrador desativou o Expensify Travel. Por favor, siga a pol\u00EDtica de reservas da sua empresa para arranjos de viagem.",
        },
        verifyCompany: {
            title: 'Comece a viajar hoje!',
            message: "Por favor, entre em contato com seu gerente de conta ou com salesteam@expensify.com para obter uma demonstra\u00E7\u00E3o de viagem e ativ\u00E1-la para sua empresa.",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "Seu voo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") em ").concat(startDate, " foi reservado. C\u00F3digo de confirma\u00E7\u00E3o: ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Sua passagem para o voo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") em ").concat(startDate, " foi anulada.");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu bilhete para o voo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") em ").concat(startDate, " foi reembolsado ou trocado.");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu voo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") em ").concat(startDate, " foi cancelado pela companhia a\u00E9rea.");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "A companhia a\u00E9rea prop\u00F4s uma altera\u00E7\u00E3o de hor\u00E1rio para o voo ".concat(airlineCode, "; estamos aguardando confirma\u00E7\u00E3o.");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "Mudan\u00E7a de hor\u00E1rio confirmada: voo ".concat(airlineCode, " agora parte em ").concat(startDate, ".");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu voo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") em ").concat(startDate, " foi atualizado.");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "Sua classe de cabine foi atualizada para ".concat(cabinClass, " no voo ").concat(airlineCode, ".");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Sua assento no voo ".concat(airlineCode, " foi confirmado.");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Sua atribui\u00E7\u00E3o de assento no voo ".concat(airlineCode, " foi alterada.");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Sua atribui\u00E7\u00E3o de assento no voo ".concat(airlineCode, " foi removida.");
            },
            paymentDeclined: 'O pagamento para sua reserva aérea falhou. Por favor, tente novamente.',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Voc\u00EA cancelou sua reserva de ".concat(type, " ").concat(id, ".");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "O fornecedor cancelou sua reserva de ".concat(type, " ").concat(id, ".");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Sua reserva de ".concat(type, " foi remarcada. Novo n\u00FAmero de confirma\u00E7\u00E3o: ").concat(id, ".");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "Sua reserva de ".concat(type, " foi atualizada. Revise os novos detalhes no itiner\u00E1rio.");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu bilhete de trem de ".concat(origin, " \u2192 ").concat(destination, " em ").concat(startDate, " foi reembolsado. Um cr\u00E9dito ser\u00E1 processado.");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu bilhete de trem de ".concat(origin, " \u2192 ").concat(destination, " em ").concat(startDate, " foi trocado.");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Seu bilhete de trem de ".concat(origin, " \u2192 ").concat(destination, " em ").concat(startDate, " foi atualizado.");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "Sua reserva de ".concat(type, " foi atualizada.");
            },
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
            selected: function () { return ({
                one: '1 selecionado',
                other: function (count) { return "".concat(count, " selecionado(s)"); },
            }); },
            settlementFrequency: 'Frequência de liquidação',
            setAsDefault: 'Definir como espaço de trabalho padrão',
            defaultNote: "Os recibos enviados para ".concat(CONST_1.default.EMAIL.RECEIPTS, " aparecer\u00E3o neste espa\u00E7o de trabalho."),
            deleteConfirmation: 'Tem certeza de que deseja excluir este espaço de trabalho?',
            deleteWithCardsConfirmation: 'Tem certeza de que deseja excluir este espaço de trabalho? Isso removerá todos os feeds de cartões e cartões atribuídos.',
            unavailable: 'Espaço de trabalho indisponível',
            memberNotFound: 'Membro não encontrado. Para convidar um novo membro para o espaço de trabalho, por favor, use o botão de convite acima.',
            notAuthorized: "Voc\u00EA n\u00E3o tem acesso a esta p\u00E1gina. Se voc\u00EA est\u00E1 tentando entrar neste espa\u00E7o de trabalho, basta pedir ao propriet\u00E1rio do espa\u00E7o de trabalho para adicion\u00E1-lo como membro. Algo mais? Entre em contato com ".concat(CONST_1.default.EMAIL.CONCIERGE, "."),
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
            markAsExported: 'Marcar como exportado manualmente',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "Exportar para ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            letsDoubleCheck: 'Vamos verificar se tudo está correto.',
            lineItemLevel: 'Nível de item linha',
            reportLevel: 'Nível de relatório',
            topLevel: 'Nível superior',
            appliedOnExport: 'Não importado para o Expensify, aplicado na exportação',
            shareNote: {
                header: 'Compartilhe seu espaço de trabalho com outros membros',
                content: {
                    firstPart: 'Compartilhe este código QR ou copie o link abaixo para facilitar que os membros solicitem acesso ao seu espaço de trabalho. Todas as solicitações para ingressar no espaço de trabalho aparecerão na',
                    secondPart: 'espaço para sua revisão.',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "Conectar a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            createNewConnection: 'Criar nova conexão',
            reuseExistingConnection: 'Reutilizar conexão existente',
            existingConnections: 'Conexões existentes',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "Como voc\u00EA j\u00E1 se conectou ao ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " antes, voc\u00EA pode optar por reutilizar uma conex\u00E3o existente ou criar uma nova.");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - \u00DAltima sincroniza\u00E7\u00E3o em ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "N\u00E3o \u00E9 poss\u00EDvel conectar a ".concat(connectionName, " devido a um erro de autentica\u00E7\u00E3o.");
            },
            learnMore: 'Saiba mais.',
            memberAlternateText: 'Os membros podem enviar e aprovar relatórios.',
            adminAlternateText: 'Os administradores têm acesso total de edição a todos os relatórios e configurações do espaço de trabalho.',
            auditorAlternateText: 'Os auditores podem visualizar e comentar nos relatórios.',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return 'Administração';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST_1.default.POLICY.ROLE.USER:
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
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "Despesas de ".concat(displayName);
            },
        },
        perDiem: {
            subtitle: 'Defina taxas de diárias para controlar os gastos diários dos funcionários.',
            amount: 'Quantia',
            deleteRates: function () { return ({
                one: 'Taxa de exclusão',
                other: 'Excluir tarifas',
            }); },
            deletePerDiemRate: 'Excluir taxa de diária',
            findPerDiemRate: 'Encontrar a taxa de diária',
            areYouSureDelete: function () { return ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas taxas?',
            }); },
            emptyList: {
                title: 'Per diem',
                subtitle: 'Defina taxas de diárias para controlar os gastos diários dos funcionários. Importe taxas de uma planilha para começar.',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "Uma taxa com o valor ".concat(rate, " j\u00E1 existe");
                },
            },
            importPerDiemRates: 'Importar taxas de diária',
            editPerDiemRate: 'Editar taxa de diárias',
            editPerDiemRates: 'Editar taxas de diárias',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "Atualizar este destino ir\u00E1 alter\u00E1-lo para todas as subtarifas de ".concat(destination, " por diem.");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "Atualizar esta moeda ir\u00E1 alter\u00E1-la para todas as subtarifas de per diem de ".concat(destination, ".");
            },
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
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Desktop.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                    _e),
            },
            exportCheckDescription: 'Vamos criar um cheque detalhado para cada relatório do Expensify e enviá-lo a partir da conta bancária abaixo.',
            exportJournalEntryDescription: 'Criaremos uma entrada de diário detalhada para cada relatório do Expensify e a postaremos na conta abaixo.',
            exportVendorBillDescription: 'Criaremos uma fatura de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, publicaremos no primeiro dia do próximo período aberto.',
            deepDiveExpensifyCard: 'As transações do Cartão Expensify serão exportadas automaticamente para uma "Conta de Responsabilidade do Cartão Expensify" criada com',
            deepDiveExpensifyCardIntegration: 'nossa integração.',
            outOfPocketTaxEnabledDescription: 'O QuickBooks Desktop não suporta impostos em exportações de lançamentos contábeis. Como você tem impostos habilitados no seu espaço de trabalho, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Cartão de crédito',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Fatura do fornecedor',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Lançamento contábil',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Verificar',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = 'Vamos criar um cheque detalhado para cada relatório do Expensify e enviá-lo a partir da conta bancária abaixo.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de crédito a qualquer fornecedor correspondente no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Crédito Diversos' para associação.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Criaremos uma fatura detalhada do fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no dia 1º do próximo período aberto.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Escolha onde exportar as transações do cartão de crédito.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = 'Escolha de onde enviar os cheques.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'As contas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Cheques estão indisponíveis quando locais estão habilitados. Por favor, escolha uma opção de exportação diferente.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
                _f),
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
            locationsLineItemsRestrictionDescription: 'O QuickBooks Online não suporta Localizações no nível de linha para Cheques ou Faturas de Fornecedores. Se você gostaria de ter localizações no nível de linha, certifique-se de estar usando Lançamentos Contábeis e despesas de Cartão de Crédito/Débito.',
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
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o QuickBooks Online.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                    _g),
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
            exportVendorBillDescription: 'Criaremos uma fatura de fornecedor detalhada para cada relatório do Expensify e a adicionaremos à conta abaixo. Se este período estiver fechado, publicaremos no primeiro dia do próximo período aberto.',
            account: 'Conta',
            accountDescription: 'Escolha onde postar lançamentos contábeis.',
            accountsPayable: 'Contas a pagar',
            accountsPayableDescription: 'Escolha onde criar contas de fornecedores.',
            bankAccount: 'Conta bancária',
            notConfigured: 'Não configurado',
            bankAccountDescription: 'Escolha de onde enviar os cheques.',
            creditCardAccount: 'Conta de cartão de crédito',
            companyCardsLocationEnabledDescription: 'O QuickBooks Online não oferece suporte a locais nas exportações de contas a pagar de fornecedores. Como você tem locais habilitados no seu espaço de trabalho, essa opção de exportação não está disponível.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online não suporta impostos em exportações de lançamentos contábeis. Como você tem impostos ativados no seu espaço de trabalho, esta opção de exportação não está disponível.',
            outOfPocketTaxEnabledError: 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
            advancedConfig: {
                autoSyncDescription: 'A Expensify sincronizará automaticamente com o QuickBooks Online todos os dias.',
                inviteEmployees: 'Convidar funcionários',
                inviteEmployeesDescription: 'Importar registros de funcionários do QuickBooks Online e convidar funcionários para este espaço de trabalho.',
                createEntities: 'Auto-criar entidades',
                createEntitiesDescription: 'A Expensify criará automaticamente fornecedores no QuickBooks Online se eles ainda não existirem e criará automaticamente clientes ao exportar faturas.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da conta será criado na conta do QuickBooks Online abaixo.',
                qboBillPaymentAccount: 'Conta de pagamento de fatura do QuickBooks',
                qboInvoiceCollectionAccount: 'Conta de cobrança de faturas do QuickBooks',
                accountSelectDescription: 'Escolha de onde pagar as contas e nós criaremos o pagamento no QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Escolha onde receber os pagamentos de faturas e criaremos o pagamento no QuickBooks Online.',
            },
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'Cartão de débito',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Cartão de crédito',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Fatura do fornecedor',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Lançamento contábil',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Verificar',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de débito a quaisquer fornecedores correspondentes no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Débito Diversos' para associação.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Vamos corresponder automaticamente o nome do comerciante na transação do cartão de crédito a qualquer fornecedor correspondente no QuickBooks. Se não existirem fornecedores, criaremos um fornecedor 'Cartão de Crédito Diversos' para associação.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Criaremos uma fatura detalhada do fornecedor para cada relatório do Expensify com a data da última despesa e a adicionaremos à conta abaixo. Se este período estiver fechado, lançaremos no dia 1º do próximo período aberto.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'Escolha onde exportar as transações do cartão de débito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Escolha onde exportar as transações do cartão de crédito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Escolha um fornecedor para aplicar a todas as transações de cartão de crédito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'As contas de fornecedores não estão disponíveis quando os locais estão ativados. Por favor, escolha uma opção de exportação diferente.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Cheques estão indisponíveis quando locais estão habilitados. Por favor, escolha uma opção de exportação diferente.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'As entradas de diário não estão disponíveis quando os impostos estão ativados. Por favor, escolha uma opção de exportação diferente.',
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Escolha uma conta válida para exportação de fatura do fornecedor',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Escolha uma conta válida para exportação de lançamento contábil',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Escolha uma conta válida para exportação de cheques',
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Para usar a exportação de fatura de fornecedor, configure uma conta a pagar no QuickBooks Online.',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Para usar a exportação de lançamentos contábeis, configure uma conta de diário no QuickBooks Online',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Para usar a exportação de cheques, configure uma conta bancária no QuickBooks Online',
                _k),
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: 'Adicione a conta no QuickBooks Online e sincronize a conexão novamente.',
            accountingMethods: {
                label: 'Quando Exportar',
                description: 'Escolha quando exportar as despesas:',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Acumulação',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Dinheiro',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Despesas do próprio bolso serão exportadas quando aprovadas em definitivo',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Despesas do próprio bolso serão exportadas quando pagas',
                    _m),
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
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Mapear ".concat(categoryName, " do Xero para");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "Escolha onde mapear ".concat(categoryName, " ao exportar para Xero.");
            },
            customers: 'Refaturar clientes',
            customersDescription: 'Escolha se deseja refaturar clientes no Expensify. Seus contatos de clientes do Xero podem ser marcados em despesas e serão exportados para o Xero como uma fatura de venda.',
            taxesDescription: 'Escolha como lidar com os impostos do Xero no Expensify.',
            notImported: 'Não importado',
            notConfigured: 'Não configurado',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Contato padrão do Xero',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'Tags',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'Campos do relatório',
                _o),
            exportDescription: 'Configure como os dados do Expensify são exportados para o Xero.',
            purchaseBill: 'Fatura de compra',
            exportDeepDiveCompanyCard: 'As despesas exportadas serão lançadas como transações bancárias na conta bancária do Xero abaixo, e as datas das transações corresponderão às datas no seu extrato bancário.',
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
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o Xero.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                    _p),
            },
            invoiceStatus: {
                label: 'Status da fatura de compra',
                description: 'Use este status ao exportar faturas de compra para Xero.',
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = 'Rascunho',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = 'Aguardando aprovação',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = 'Aguardando pagamento',
                    _q),
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
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para Sage Intacct.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: 'Defina como as despesas fora do bolso são exportadas para o Sage Intacct.',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = 'Relatórios de despesas',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Faturas de fornecedores',
                    _s),
            },
            nonReimbursableExpenses: {
                description: 'Defina como as compras com cartão corporativo são exportadas para o Sage Intacct.',
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'Cartões de crédito',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Faturas de fornecedores',
                    _t),
            },
            creditCardAccount: 'Conta de cartão de crédito',
            defaultVendor: 'Fornecedor padrão',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "Defina um fornecedor padr\u00E3o que ser\u00E1 aplicado \u00E0s despesas reembols\u00E1veis ".concat(isReimbursable ? '' : 'não-', " que n\u00E3o t\u00EAm um fornecedor correspondente no Sage Intacct.");
            },
            exportDescription: 'Configure como os dados do Expensify são exportados para o Sage Intacct.',
            exportPreferredExporterNote: 'O exportador preferido pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões de empresa individuais nas Configurações de Domínio.',
            exportPreferredExporterSubNote: 'Uma vez definido, o exportador preferido verá os relatórios para exportação em sua conta.',
            noAccountsFound: 'Nenhuma conta encontrada',
            noAccountsFoundDescription: "Por favor, adicione a conta no Sage Intacct e sincronize a conex\u00E3o novamente.",
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify irá sincronizar automaticamente com Sage Intacct todos os dias.',
            inviteEmployees: 'Convidar funcionários',
            inviteEmployeesDescription: 'Importe registros de funcionários do Sage Intacct e convide funcionários para este espaço de trabalho. Seu fluxo de aprovação será padrão para aprovação do gerente e pode ser configurado ainda mais na página de Membros.',
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
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = 'Entrada única e detalhada para cada relatório',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = 'Entrada única para cada despesa',
                    _u),
            },
            invoiceItem: {
                label: 'Item de fatura',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: 'Crie um para mim',
                        description: 'Vamos criar um "item de linha de fatura do Expensify" para você ao exportar (se ainda não existir um).',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: 'Selecionar existente',
                        description: 'Vamos vincular as faturas do Expensify ao item selecionado abaixo.',
                    },
                    _v),
            },
            exportDate: {
                label: 'Data de exportação',
                description: 'Use esta data ao exportar relatórios para NetSuite.',
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data da última despesa',
                        description: 'Data da despesa mais recente no relatório.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: 'Data de exportação',
                        description: 'Data em que o relatório foi exportado para o NetSuite.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data de envio',
                        description: 'Data em que o relatório foi enviado para aprovação.',
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: 'Relatórios de despesas',
                        reimbursableDescription: 'Despesas do próprio bolso serão exportadas como relatórios de despesas para o NetSuite.',
                        nonReimbursableDescription: 'Despesas de cartão corporativo serão exportadas como relatórios de despesas para NetSuite.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: 'Faturas de fornecedores',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: 'Lançamentos contábeis',
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
                autoSyncDescription: 'A Expensify sincronizará automaticamente com o NetSuite todos os dias.',
                reimbursedReportsDescription: 'Sempre que um relatório for pago usando Expensify ACH, o pagamento correspondente da fatura será criado na conta do NetSuite abaixo.',
                reimbursementsAccount: 'Conta de reembolsos',
                reimbursementsAccountDescription: 'Escolha a conta bancária que você usará para reembolsos, e nós criaremos o pagamento associado no NetSuite.',
                collectionsAccount: 'Conta de cobranças',
                collectionsAccountDescription: 'Uma vez que uma fatura é marcada como paga no Expensify e exportada para o NetSuite, ela aparecerá na conta abaixo.',
                approvalAccount: 'Conta de aprovação A/P',
                approvalAccountDescription: 'Escolha a conta contra a qual as transações serão aprovadas no NetSuite. Se você estiver sincronizando relatórios reembolsados, esta também será a conta contra a qual os pagamentos de faturas serão criados.',
                defaultApprovalAccount: 'NetSuite padrão',
                inviteEmployees: 'Convide funcionários e defina aprovações',
                inviteEmployeesDescription: 'Importe registros de funcionários do NetSuite e convide funcionários para este workspace. Seu fluxo de aprovação será padrão para aprovação do gerente e pode ser configurado na página *Membros*.',
                autoCreateEntities: 'Auto-criar funcionários/fornecedores',
                enableCategories: 'Habilitar categorias recém-importadas',
                customFormID: 'ID do formulário personalizado',
                customFormIDDescription: 'Por padrão, o Expensify criará lançamentos usando o formulário de transação preferido definido no NetSuite. Alternativamente, você pode designar um formulário de transação específico a ser usado.',
                customFormIDReimbursable: 'Despesa do próprio bolso',
                customFormIDNonReimbursable: 'Despesa com cartão corporativo',
                exportReportsTo: {
                    label: 'Nível de aprovação do relatório de despesas',
                    description: 'Depois que um relatório de despesas é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de postar.',
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'Preferência padrão do NetSuite',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'Apenas aprovado pelo supervisor',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = 'Apenas contabilidade aprovada',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = 'Supervisor e contabilidade aprovados',
                        _y),
                },
                accountingMethods: {
                    label: 'Quando Exportar',
                    description: 'Escolha quando exportar as despesas:',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Acumulação',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Dinheiro',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Despesas do próprio bolso serão exportadas quando aprovadas em definitivo',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Despesas do próprio bolso serão exportadas quando pagas',
                        _0),
                },
                exportVendorBillsTo: {
                    label: 'Nível de aprovação de fatura do fornecedor',
                    description: 'Uma vez que uma fatura de fornecedor é aprovada no Expensify e exportada para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de postar.',
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'Preferência padrão do NetSuite',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = 'Aguardando aprovação',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = 'Aprovado para postagem',
                        _1),
                },
                exportJournalsTo: {
                    label: 'Nível de aprovação de lançamento contábil',
                    description: 'Depois que um lançamento contábil é aprovado no Expensify e exportado para o NetSuite, você pode definir um nível adicional de aprovação no NetSuite antes de lançá-lo.',
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'Preferência padrão do NetSuite',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = 'Aguardando aprovação',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = 'Aprovado para postagem',
                        _2),
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
                        description: 'No NetSuite, vá para *Setup > Users/Roles > Access Tokens* > crie um token de acesso para o aplicativo "Expensify" e para o papel "Expensify Integration" ou "Administrator".\n\n*Importante:* Certifique-se de salvar o *Token ID* e o *Token Secret* desta etapa. Você precisará deles para a próxima etapa.',
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
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('e'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'Importar grupos de impostos do NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Escolha uma opção abaixo:',
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Importado como ".concat(importedTypes.join('e'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "Por favor, insira o ".concat(fieldName);
                    },
                    customSegments: {
                        title: 'Segmentos/registros personalizados',
                        addText: 'Adicionar segmento/registro personalizado',
                        recordTitle: 'Segmento/registro personalizado',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
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
                            customSegmentNameFooter: "Voc\u00EA pode encontrar nomes de segmentos personalizados no NetSuite na p\u00E1gina *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customRecordNameFooter: "Voc\u00EA pode encontrar nomes de registros personalizados no NetSuite inserindo o \"Campo de Coluna de Transa\u00E7\u00E3o\" na pesquisa global.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentInternalIDTitle: 'Qual é o ID interno?',
                            customSegmentInternalIDFooter: "Primeiro, certifique-se de que voc\u00EA ativou os IDs internos no NetSuite em *Home > Set Preferences > Show Internal ID.*\n\nVoc\u00EA pode encontrar IDs internos de segmentos personalizados no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique no hyperlink ao lado de *Custom Record Type*.\n4. Encontre o ID interno na tabela na parte inferior.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordInternalIDFooter: "Voc\u00EA pode encontrar os IDs internos de registros personalizados no NetSuite seguindo estas etapas:\n\n1. Digite \"Transaction Line Fields\" na busca global.\n2. Clique em um registro personalizado.\n3. Encontre o ID interno no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentScriptIDTitle: 'Qual é o ID do script?',
                            customSegmentScriptIDFooter: "Voc\u00EA pode encontrar IDs de script de segmento personalizado no NetSuite em:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clique em um segmento personalizado.\n3. Clique na guia *Application and Sourcing* perto da parte inferior, ent\u00E3o:\n    a. Se voc\u00EA quiser exibir o segmento personalizado como uma *tag* (no n\u00EDvel do item de linha) no Expensify, clique na subguia *Transaction Columns* e use o *Field ID*.\n    b. Se voc\u00EA quiser exibir o segmento personalizado como um *report field* (no n\u00EDvel do relat\u00F3rio) no Expensify, clique na subguia *Transactions* e use o *Field ID*.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordScriptIDTitle: 'Qual é o ID da coluna de transação?',
                            customRecordScriptIDFooter: "Voc\u00EA pode encontrar IDs de script de registro personalizado no NetSuite em:\n\n1. Digite \"Transaction Line Fields\" na pesquisa global.\n2. Clique em um registro personalizado.\n3. Encontre o ID do script no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentMappingTitle: 'Como este segmento personalizado deve ser exibido no Expensify?',
                            customRecordMappingTitle: 'Como este registro personalizado deve ser exibido no Expensify?',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "Um segmento/registro personalizado com este ".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), " j\u00E1 existe");
                            },
                        },
                    },
                    customLists: {
                        title: 'Listas personalizadas',
                        addText: 'Adicionar lista personalizada',
                        recordTitle: 'Lista personalizada',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
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
                            transactionFieldIDFooter: "Voc\u00EA pode encontrar os IDs dos campos de transa\u00E7\u00E3o no NetSuite seguindo estas etapas:\n\n1. Digite \"Transaction Line Fields\" na pesquisa global.\n2. Clique em uma lista personalizada.\n3. Encontre o ID do campo de transa\u00E7\u00E3o no lado esquerdo.\n\n_Para instru\u00E7\u00F5es mais detalhadas, [visite nosso site de ajuda](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            mappingTitle: 'Como essa lista personalizada deve ser exibida no Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "Uma lista personalizada com este ID de campo de transa\u00E7\u00E3o j\u00E1 existe",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'NetSuite employee default',
                        description: 'Não importado para o Expensify, aplicado na exportação',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "Se voc\u00EA usar ".concat(importField, " no NetSuite, aplicaremos o padr\u00E3o definido no registro do funcion\u00E1rio ao exportar para Relat\u00F3rio de Despesas ou Lan\u00E7amento Cont\u00E1bil.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'Tags',
                        description: 'Nível de item linha',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " ser\u00E1 selecion\u00E1vel para cada despesa individual no relat\u00F3rio de um funcion\u00E1rio.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'Campos do relatório',
                        description: 'Nível de relatório',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " sele\u00E7\u00E3o ser\u00E1 aplicada a todas as despesas no relat\u00F3rio de um funcion\u00E1rio.");
                        },
                    },
                    _3),
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
            userDimensionsAdded: function () { return ({
                one: '1 UDD adicionado',
                other: function (count) { return "".concat(count, " UDDs adicionados"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departamentos';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locais';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clientes';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
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
                yourCardProvider: "Quem \u00E9 o emissor do seu cart\u00E3o?",
                whoIsYourBankAccount: 'Qual é o seu banco?',
                whereIsYourBankLocated: 'Onde está localizado o seu banco?',
                howDoYouWantToConnect: 'Como você deseja se conectar ao seu banco?',
                learnMoreAboutOptions: {
                    text: 'Saiba mais sobre estes',
                    linkText: 'opções.',
                },
                commercialFeedDetails: 'Requer configuração com seu banco. Isso é normalmente usado por empresas maiores e geralmente é a melhor opção se você se qualificar.',
                commercialFeedPlaidDetails: "Requer configura\u00E7\u00E3o com seu banco, mas n\u00F3s iremos gui\u00E1-lo. Isso geralmente \u00E9 limitado a empresas maiores.",
                directFeedDetails: 'A abordagem mais simples. Conecte-se imediatamente usando suas credenciais principais. Este método é o mais comum.',
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "Ative seu feed ".concat(provider);
                    },
                    heading: 'Temos uma integração direta com o emissor do seu cartão e podemos importar seus dados de transação para o Expensify de forma rápida e precisa.\n\nPara começar, simplesmente:',
                    visa: 'Temos integrações globais com a Visa, embora a elegibilidade varie de acordo com o banco e o programa do cartão.\n\nPara começar, simplesmente:',
                    mastercard: 'Temos integrações globais com a Mastercard, embora a elegibilidade varie de acordo com o banco e o programa do cartão.\n\nPara começar, simplesmente:',
                    vcf: "1. Visite [este artigo de ajuda](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") para obter instru\u00E7\u00F5es detalhadas sobre como configurar seus Cart\u00F5es Comerciais Visa.\n\n2. [Entre em contato com seu banco](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") para verificar se eles oferecem suporte a um feed comercial para o seu programa e pe\u00E7a para ativ\u00E1-lo.\n\n3. *Assim que o feed estiver ativado e voc\u00EA tiver seus detalhes, continue para a pr\u00F3xima tela.*"),
                    gl1025: "1. Visite [este artigo de ajuda](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, ") para descobrir se a American Express pode habilitar um feed comercial para o seu programa.\n\n2. Assim que o feed for habilitado, a Amex enviar\u00E1 uma carta de produ\u00E7\u00E3o.\n\n3. *Assim que tiver as informa\u00E7\u00F5es do feed, continue para a pr\u00F3xima tela.*"),
                    cdf: "1. Visite [este artigo de ajuda](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") para obter instru\u00E7\u00F5es detalhadas sobre como configurar seus cart\u00F5es comerciais Mastercard.\n\n2. [Contate seu banco](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") para verificar se eles oferecem suporte a um feed comercial para o seu programa e pe\u00E7a para ativ\u00E1-lo.\n\n3. *Depois que o feed estiver ativado e voc\u00EA tiver seus detalhes, continue para a pr\u00F3xima tela.*"),
                    stripe: "1. Visite o Dashboard do Stripe e v\u00E1 para [Configura\u00E7\u00F5es](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ").\n\n2. Em Integra\u00E7\u00F5es de Produto, clique em Ativar ao lado de Expensify.\n\n3. Assim que o feed estiver ativado, clique em Enviar abaixo e n\u00F3s trabalharemos para adicion\u00E1-lo."),
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
                        title: "Qual \u00E9 o nome do arquivo de entrega Amex?",
                        fileNameLabel: 'Nome do arquivo de entrega',
                        helpLabel: 'Onde encontro o nome do arquivo de entrega?',
                    },
                    cdf: {
                        title: "Qual \u00E9 o ID de distribui\u00E7\u00E3o do Mastercard?",
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
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = 'Último dia do mês',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = 'Último dia útil do mês',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'Dia personalizado do mês',
                _4),
            assignCard: 'Atribuir cartão',
            findCard: 'Encontrar cartão',
            cardNumber: 'Número do cartão',
            commercialFeed: 'Feed comercial',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "Cart\u00F5es ".concat(feedName);
            },
            directFeed: 'Feed direto',
            whoNeedsCardAssigned: 'Quem precisa de um cartão atribuído?',
            chooseCard: 'Escolha um cartão',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "Escolha um cart\u00E3o para ".concat(assignee, " do feed de cart\u00F5es ").concat(feed, ".");
            },
            noActiveCards: 'Nenhum cartão ativo neste feed',
            somethingMightBeBroken: 'Ou algo pode estar quebrado. De qualquer forma, se você tiver alguma dúvida, apenas',
            contactConcierge: 'contatar Concierge',
            chooseTransactionStartDate: 'Escolha uma data de início para a transação',
            startDateDescription: 'Importaremos todas as transações a partir desta data. Se nenhuma data for especificada, iremos o mais longe possível conforme permitido pelo seu banco.',
            fromTheBeginning: 'Desde o início',
            customStartDate: 'Data de início personalizada',
            customCloseDate: 'Data de fechamento personalizada',
            letsDoubleCheck: 'Vamos verificar se tudo está correto.',
            confirmationDescription: 'Começaremos a importar transações imediatamente.',
            cardholder: 'Titular do cartão',
            card: 'Cartão',
            cardName: 'Nome do cartão',
            brokenConnectionErrorFirstPart: "A conex\u00E3o do feed do cart\u00E3o est\u00E1 quebrada. Por favor,",
            brokenConnectionErrorLink: 'faça login no seu banco',
            brokenConnectionErrorSecondPart: 'para que possamos estabelecer a conexão novamente.',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "atribuiu ".concat(assignee, " um ").concat(link, "! As transa\u00E7\u00F5es importadas aparecer\u00E3o neste chat.");
            },
            companyCard: 'cartão corporativo',
            chooseCardFeed: 'Escolher feed de cartão',
            ukRegulation: 'A Expensify, Inc. é um agente da Plaid Financial Ltd., uma instituição de pagamento autorizada e regulada pela Financial Conduct Authority sob as Payment Services Regulations 2017 (Número de Referência da Empresa: 804718). A Plaid fornece a você serviços de informações de conta regulados através da Expensify Limited como seu agente.',
        },
        expensifyCard: {
            issueAndManageCards: 'Emita e gerencie seus Cartões Expensify',
            getStartedIssuing: 'Comece emitindo seu primeiro cartão virtual ou físico.',
            verificationInProgress: 'Verificação em andamento...',
            verifyingTheDetails: 'Estamos verificando alguns detalhes. Concierge informará você quando os Cartões Expensify estiverem prontos para serem emitidos.',
            disclaimer: 'O Expensify Visa® Commercial Card é emitido pelo The Bancorp Bank, N.A., Membro FDIC, de acordo com uma licença da Visa U.S.A. Inc. e pode não ser aceito em todos os comerciantes que aceitam cartões Visa. Apple® e o logotipo da Apple® são marcas registradas da Apple Inc., registradas nos EUA e em outros países. App Store é uma marca de serviço da Apple Inc. Google Play e o logotipo do Google Play são marcas registradas da Google LLC.',
            issueCard: 'Emitir cartão',
            findCard: 'Encontrar cartão',
            newCard: 'Novo cartão',
            name: 'Nome',
            lastFour: 'Últimos 4',
            limit: 'Limite',
            currentBalance: 'Saldo atual',
            currentBalanceDescription: 'O saldo atual é a soma de todas as transações postadas no Expensify Card que ocorreram desde a última data de liquidação.',
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "O saldo ser\u00E1 liquidado em ".concat(settlementDate);
            },
            settleBalance: 'Liquidar saldo',
            cardLimit: 'Limite do cartão',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: 'Solicitar aumento de limite',
            remainingLimitDescription: 'Consideramos vários fatores ao calcular seu limite restante: seu tempo como cliente, as informações relacionadas ao negócio que você forneceu durante o cadastro e o dinheiro disponível na sua conta bancária empresarial. Seu limite restante pode flutuar diariamente.',
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
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se voc\u00EA alterar o limite deste cart\u00E3o para ".concat(limit, ", novas transa\u00E7\u00F5es ser\u00E3o recusadas at\u00E9 que voc\u00EA aprove mais despesas no cart\u00E3o.");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se voc\u00EA alterar o limite deste cart\u00E3o para ".concat(limit, ", novas transa\u00E7\u00F5es ser\u00E3o recusadas at\u00E9 o pr\u00F3ximo m\u00EAs.");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se voc\u00EA alterar o limite deste cart\u00E3o para ".concat(limit, ", novas transa\u00E7\u00F5es ser\u00E3o recusadas.");
            },
            changeCardLimitType: 'Alterar tipo de limite do cartão',
            changeLimitType: 'Alterar tipo de limite',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Se voc\u00EA alterar o tipo de limite deste cart\u00E3o para Limite Inteligente, novas transa\u00E7\u00F5es ser\u00E3o recusadas porque o limite n\u00E3o aprovado de ".concat(limit, " j\u00E1 foi atingido.");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Se voc\u00EA mudar o tipo de limite deste cart\u00E3o para Mensal, novas transa\u00E7\u00F5es ser\u00E3o recusadas porque o limite mensal de ".concat(limit, " j\u00E1 foi atingido.");
            },
            addShippingDetails: 'Adicionar detalhes de envio',
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "emitiu um Cart\u00E3o Expensify para ".concat(assignee, "! O cart\u00E3o chegar\u00E1 em 2-3 dias \u00FAteis.");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "emitiu um Cart\u00E3o Expensify para ".concat(assignee, "! O cart\u00E3o ser\u00E1 enviado assim que os detalhes de envio forem adicionados.");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "emitiu ".concat(assignee, " um ").concat(link, " virtual! O cart\u00E3o pode ser usado imediatamente.");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, " adicionou os detalhes de envio. O Cart\u00E3o Expensify chegar\u00E1 em 2-3 dias \u00FAteis.");
            },
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
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "Todas as despesas devem ser categorizadas para exportar para ".concat(connectionName, ".");
            },
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
                description: "Pelo menos uma categoria deve permanecer habilitada porque seu espa\u00E7o de trabalho requer categorias.",
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
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return (integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " exporta\u00E7\u00E3o") : "exporta\u00E7\u00E3o ".concat(integration));
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "Escolha a conta ".concat(integration, " para onde as transa\u00E7\u00F5es devem ser exportadas.");
                },
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
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "Remover feed ".concat(feedName);
                },
                removeCardFeedDescription: 'Tem certeza de que deseja remover este feed de cartão? Isso desatribuirá todos os cartões.',
                error: {
                    feedNameRequired: 'O nome do feed do cartão é obrigatório',
                    statementCloseDateRequired: 'Favor selecionar uma data de fechamento do extrato.',
                },
                corporate: 'Restringir a exclusão de transações',
                personal: 'Permitir excluir transações',
                setFeedNameDescription: 'Dê ao feed do cartão um nome único para que você possa diferenciá-lo dos outros.',
                setTransactionLiabilityDescription: 'Quando ativado, os portadores de cartão podem excluir transações de cartão. Novas transações seguirão esta regra.',
                emptyAddedFeedTitle: 'Atribuir cartões corporativos',
                emptyAddedFeedDescription: 'Comece atribuindo seu primeiro cartão a um membro.',
                pendingFeedTitle: "Estamos analisando sua solicita\u00E7\u00E3o...",
                pendingFeedDescription: "Atualmente, estamos revisando os detalhes do seu feed. Assim que isso for conclu\u00EDdo, entraremos em contato com voc\u00EA via",
                pendingBankTitle: 'Verifique a janela do seu navegador',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "Por favor, conecte-se ao ".concat(bankName, " atrav\u00E9s da janela do navegador que acabou de abrir. Se nenhuma tiver sido aberta,");
                },
                pendingBankLink: 'por favor, clique aqui',
                giveItNameInstruction: 'Dê um nome ao cartão que o diferencie dos outros.',
                updating: 'Atualizando...',
                noAccountsFound: 'Nenhuma conta encontrada',
                defaultCard: 'Cartão padrão',
                downgradeTitle: "N\u00E3o \u00E9 poss\u00EDvel rebaixar o espa\u00E7o de trabalho",
                downgradeSubTitleFirstPart: "Este espa\u00E7o de trabalho n\u00E3o pode ser rebaixado porque v\u00E1rios feeds de cart\u00E3o est\u00E3o conectados (excluindo os Cart\u00F5es Expensify). Por favor,",
                downgradeSubTitleMiddlePart: "manter apenas um feed de cart\u00E3o",
                downgradeSubTitleLastPart: 'para prosseguir.',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "Por favor, adicione a conta em ".concat(connection, " e sincronize a conex\u00E3o novamente.");
                },
                expensifyCardBannerTitle: 'Obtenha o Cartão Expensify',
                expensifyCardBannerSubtitle: 'Aproveite o cashback em todas as compras nos EUA, até 50% de desconto na sua fatura do Expensify, cartões virtuais ilimitados e muito mais.',
                expensifyCardBannerLearnMoreButton: 'Saiba mais',
                statementCloseDateTitle: 'Statement close date',
                statementCloseDateDescription: 'Informe-nos quando o extrato do seu cartão for encerrado e criaremos um extrato correspondente na Expensify.',
            },
            workflows: {
                title: 'Fluxos de Trabalho',
                subtitle: 'Configure como os gastos são aprovados e pagos.',
                disableApprovalPrompt: 'Os cartões Expensify deste espaço de trabalho atualmente dependem de aprovação para definir seus Limites Inteligentes. Por favor, altere os tipos de limite de quaisquer cartões Expensify com Limites Inteligentes antes de desativar as aprovações.',
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
                featureEnabledText: 'Os Cartões Expensify neste espaço de trabalho dependem de fluxos de aprovação para definir seus Limites Inteligentes.\n\nPor favor, altere os tipos de limite de quaisquer cartões com Limites Inteligentes antes de desativar os fluxos de trabalho.',
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
            importMultiLevelTagsSupportingText: "Aqui est\u00E1 uma pr\u00E9via das suas tags. Se tudo estiver correto, clique abaixo para import\u00E1-las.",
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
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "Encontramos *".concat(columnCounts, " colunas* na sua planilha. Selecione *Nome* ao lado da coluna que cont\u00E9m os nomes das tags. Voc\u00EA tamb\u00E9m pode selecionar *Ativado* ao lado da coluna que define o status das tags.");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'Não é possível excluir ou desativar todas as tags',
                description: "Pelo menos uma tag deve permanecer habilitada porque seu espa\u00E7o de trabalho exige tags.",
            },
            cannotMakeAllTagsOptional: {
                title: 'Não é possível tornar todas as tags opcionais',
                description: "Pelo menos uma etiqueta deve permanecer obrigat\u00F3ria porque as configura\u00E7\u00F5es do seu espa\u00E7o de trabalho exigem etiquetas.",
            },
            tagCount: function () { return ({
                one: '1 Dia',
                other: function (count) { return "".concat(count, " Tags"); },
            }); },
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
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "Tem certeza de que deseja excluir ".concat(taxAmount, " impostos?");
            },
            actions: {
                delete: 'Taxa de exclusão',
                deleteMultiple: 'Excluir tarifas',
                enable: 'Habilitar taxa',
                disable: 'Desativar taxa',
                enableTaxRates: function () { return ({
                    one: 'Habilitar taxa',
                    other: 'Habilitar taxas',
                }); },
                disableTaxRates: function () { return ({
                    one: 'Desativar taxa',
                    other: 'Desativar taxas',
                }); },
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
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "Meu Espa\u00E7o de Trabalho em Grupo".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "Workspace de ".concat(userName).concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: 'Ocorreu um erro ao remover um membro do espaço de trabalho, por favor, tente novamente.',
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "Tem certeza de que deseja remover ".concat(memberName, "?"),
                    other: 'Tem certeza de que deseja remover esses membros?',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " \u00E9 um aprovador neste espa\u00E7o de trabalho. Quando voc\u00EA deixar de compartilhar este espa\u00E7o de trabalho com ele, n\u00F3s o substituiremos no fluxo de aprova\u00E7\u00E3o pelo propriet\u00E1rio do espa\u00E7o de trabalho, ").concat(ownerName, ".");
            },
            removeMembersTitle: function () { return ({
                one: 'Remover membro',
                other: 'Remover membros',
            }); },
            findMember: 'Encontrar membro',
            removeWorkspaceMemberButtonTitle: 'Remover do espaço de trabalho',
            removeGroupMemberButtonTitle: 'Remover do grupo',
            removeRoomMemberButtonTitle: 'Remover do chat',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "Tem certeza de que deseja remover ".concat(memberName, "?");
            },
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
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "Adicionado pelo login secund\u00E1rio ".concat(secondaryLogin, ".");
            },
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
            subtitle: 'Conecte-se ao seu sistema de contabilidade para codificar transações com seu plano de contas, fazer a correspondência automática de pagamentos e manter suas finanças sincronizadas.',
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
            errorODIntegration: 'Há um erro com uma conexão que foi configurada no Expensify Classic.',
            goToODToFix: 'Vá para o Expensify Classic para resolver este problema.',
            goToODToSettings: 'Vá para o Expensify Classic para gerenciar suas configurações.',
            setup: 'Conectar',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "\u00DAltima sincroniza\u00E7\u00E3o ".concat(relativeDate);
            },
            notSync: 'Não sincronizado',
            import: 'Importar',
            export: 'Exportar',
            advanced: 'Avançado',
            other: 'Outro',
            syncNow: 'Sincronizar agora',
            disconnect: 'Desconectar',
            reinstall: 'Reinstalar conector',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integração';
                return "Desconectar ".concat(integrationName);
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Conectar ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'integração contábil');
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Não é possível conectar ao QuickBooks Online';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Não é possível conectar ao Xero';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Não é possível conectar ao NetSuite';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
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
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'Importado',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'Importado como tags',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'Importado',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'Não importado',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'Não importado',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'Importado como campos de relatório',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'NetSuite employee default',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'esta integração';
                return "Tem certeza de que deseja desconectar ".concat(integrationName, "?");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Tem certeza de que deseja conectar ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'esta integração contábil', "? Isso remover\u00E1 quaisquer conex\u00F5es cont\u00E1beis existentes.");
            },
            enterCredentials: 'Insira suas credenciais',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
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
                            return "Tradu\u00E7\u00E3o ausente para a etapa: ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: 'Exportador preferido',
            exportPreferredExporterNote: 'O exportador preferido pode ser qualquer administrador do espaço de trabalho, mas também deve ser um Administrador de Domínio se você definir contas de exportação diferentes para cartões de empresa individuais nas Configurações de Domínio.',
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
            saveHoursOnReconciliation: 'Economize horas na reconciliação de cada período contábil ao permitir que a Expensify reconcilie continuamente os extratos e liquidações do Cartão Expensify em seu nome.',
            enableContinuousReconciliation: 'Para ativar a Reconciliação Contínua, por favor, ative',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Escolha a conta bancária na qual os pagamentos do seu Expensify Card serão reconciliados.',
                accountMatches: 'Certifique-se de que esta conta corresponde à sua',
                settlementAccount: 'Conta de liquidação do Cartão Expensify',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "(terminando em ".concat(lastFourPAN, ") para que a Reconcilia\u00E7\u00E3o Cont\u00EDnua funcione corretamente.");
                },
            },
        },
        export: {
            notReadyHeading: 'Não está pronto para exportar',
            notReadyDescription: 'Relatórios de despesas rascunho ou pendentes não podem ser exportados para o sistema contábil. Por favor, aprove ou pague essas despesas antes de exportá-las.',
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
            invoiceBalanceSubtitle: 'Este é o seu saldo atual de recebimento de pagamentos de faturas. Ele será transferido automaticamente para sua conta bancária se você tiver adicionado uma.',
            bankAccountsSubtitle: 'Adicione uma conta bancária para fazer e receber pagamentos de faturas.',
        },
        invite: {
            member: 'Convidar membro',
            members: 'Convidar membros',
            invitePeople: 'Convidar novos membros',
            genericFailureMessage: 'Ocorreu um erro ao convidar o membro para o espaço de trabalho. Por favor, tente novamente.',
            pleaseEnterValidLogin: "Por favor, certifique-se de que o e-mail ou n\u00FAmero de telefone \u00E9 v\u00E1lido (por exemplo, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
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
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, " solicitou para entrar em ").concat(workspaceName);
            },
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
            deleteRates: function () { return ({
                one: 'Taxa de exclusão',
                other: 'Excluir tarifas',
            }); },
            enableRates: function () { return ({
                one: 'Habilitar taxa',
                other: 'Habilitar taxas',
            }); },
            disableRates: function () { return ({
                one: 'Desativar taxa',
                other: 'Desativar taxas',
            }); },
            enableRate: 'Habilitar taxa',
            status: 'Status',
            unit: 'Unidade',
            taxFeatureNotEnabledMessage: 'Os impostos devem estar ativados no espaço de trabalho para usar este recurso. Vá para',
            changePromptMessage: 'para fazer essa alteração.',
            deleteDistanceRate: 'Excluir taxa de distância',
            areYouSureDelete: function () { return ({
                one: 'Tem certeza de que deseja excluir esta taxa?',
                other: 'Tem certeza de que deseja excluir essas taxas?',
            }); },
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
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "A moeda padr\u00E3o n\u00E3o pode ser alterada porque este espa\u00E7o de trabalho est\u00E1 vinculado a uma conta banc\u00E1ria em ".concat(currency, ".");
            },
            save: 'Salvar',
            genericFailureMessage: 'Ocorreu um erro ao atualizar o espaço de trabalho. Por favor, tente novamente.',
            avatarUploadFailureMessage: 'Ocorreu um erro ao enviar o avatar. Por favor, tente novamente.',
            addressContext: 'Um Endereço de Espaço de Trabalho é necessário para habilitar o Expensify Travel. Por favor, insira um endereço associado ao seu negócio.',
        },
        bankAccount: {
            continueWithSetup: 'Continuar configuração',
            youAreAlmostDone: 'Você está quase terminando de configurar sua conta bancária, o que permitirá emitir cartões corporativos, reembolsar despesas, coletar faturas e pagar contas.',
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
            updateCurrencyPrompt: 'Parece que seu espaço de trabalho está atualmente configurado para uma moeda diferente de USD. Por favor, clique no botão abaixo para atualizar sua moeda para USD agora.',
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
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "A conta propriet\u00E1ria deste espa\u00E7o de trabalho (".concat(email, ") tem um saldo pendente de um m\u00EAs anterior.\n\nVoc\u00EA deseja transferir este valor (").concat(amount, ") para assumir a cobran\u00E7a deste espa\u00E7o de trabalho? Seu cart\u00E3o de pagamento ser\u00E1 cobrado imediatamente.");
            },
            subscriptionTitle: 'Assumir assinatura anual',
            subscriptionButtonText: 'Transferir assinatura',
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "Assumir este espa\u00E7o de trabalho ir\u00E1 mesclar sua assinatura anual com sua assinatura atual. Isso aumentar\u00E1 o tamanho da sua assinatura em ".concat(usersCount, " membros, tornando o novo tamanho da sua assinatura ").concat(finalCount, ". Voc\u00EA gostaria de continuar?");
            },
            duplicateSubscriptionTitle: 'Alerta de assinatura duplicada',
            duplicateSubscriptionButtonText: 'Continuar',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "Parece que voc\u00EA pode estar tentando assumir a cobran\u00E7a dos espa\u00E7os de trabalho de ".concat(email, ", mas para isso, voc\u00EA precisa ser um administrador em todos os espa\u00E7os de trabalho deles primeiro.\n\nClique em \"Continuar\" se voc\u00EA quiser apenas assumir a cobran\u00E7a do espa\u00E7o de trabalho ").concat(workspaceName, ".\n\nSe voc\u00EA quiser assumir a cobran\u00E7a de toda a assinatura deles, pe\u00E7a para que eles o adicionem como administrador em todos os espa\u00E7os de trabalho antes de assumir a cobran\u00E7a.");
            },
            hasFailedSettlementsTitle: 'Não é possível transferir a propriedade',
            hasFailedSettlementsButtonText: 'Entendi',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "Voc\u00EA n\u00E3o pode assumir a cobran\u00E7a porque ".concat(email, " tem um acerto de cart\u00E3o Expensify em atraso. Por favor, pe\u00E7a para que eles entrem em contato com concierge@expensify.com para resolver o problema. Depois, voc\u00EA poder\u00E1 assumir a cobran\u00E7a deste espa\u00E7o de trabalho.");
            },
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
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "Os seguintes relat\u00F3rios j\u00E1 foram exportados para ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], ":\n\n").concat(reportName, "\n\nTem certeza de que deseja export\u00E1-los novamente?");
            },
            confirmText: 'Sim, exportar novamente',
            cancelText: 'Cancelar',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'Campos do relatório',
                    description: "Os campos de relat\u00F3rio permitem que voc\u00EA especifique detalhes no n\u00EDvel do cabe\u00E7alho, distintos das tags que se referem a despesas em itens de linha individuais. Esses detalhes podem abranger nomes espec\u00EDficos de projetos, informa\u00E7\u00F5es de viagens de neg\u00F3cios, locais e mais.",
                    onlyAvailableOnPlan: 'Os campos de relatório estão disponíveis apenas no plano Control, a partir de',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Aproveite a sincroniza\u00E7\u00E3o automatizada e reduza as entradas manuais com a integra\u00E7\u00E3o Expensify + NetSuite. Obtenha insights financeiros detalhados e em tempo real com suporte a segmentos nativos e personalizados, incluindo mapeamento de projetos e clientes.",
                onlyAvailableOnPlan: 'Nossa integração com o NetSuite está disponível apenas no plano Control, a partir de',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Aproveite a sincroniza\u00E7\u00E3o autom\u00E1tica e reduza as entradas manuais com a integra\u00E7\u00E3o Expensify + Sage Intacct. Obtenha insights financeiros detalhados e em tempo real com dimens\u00F5es definidas pelo usu\u00E1rio, al\u00E9m de codifica\u00E7\u00E3o de despesas por departamento, classe, localiza\u00E7\u00E3o, cliente e projeto (trabalho).",
                onlyAvailableOnPlan: 'Nossa integração com o Sage Intacct está disponível apenas no plano Control, a partir de',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Aproveite a sincroniza\u00E7\u00E3o automatizada e reduza entradas manuais com a integra\u00E7\u00E3o Expensify + QuickBooks Desktop. Obtenha efici\u00EAncia m\u00E1xima com uma conex\u00E3o bidirecional em tempo real e codifica\u00E7\u00E3o de despesas por classe, item, cliente e projeto.",
                onlyAvailableOnPlan: 'Nossa integração com o QuickBooks Desktop está disponível apenas no plano Control, a partir de',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: 'Advanced Approvals',
                description: "Se voc\u00EA deseja adicionar mais camadas de aprova\u00E7\u00E3o ao processo \u2013 ou apenas garantir que as maiores despesas recebam uma segunda an\u00E1lise \u2013 n\u00F3s temos a solu\u00E7\u00E3o. As aprova\u00E7\u00F5es avan\u00E7adas ajudam voc\u00EA a implementar as verifica\u00E7\u00F5es corretas em cada n\u00EDvel para manter os gastos da sua equipe sob controle.",
                onlyAvailableOnPlan: 'As aprovações avançadas estão disponíveis apenas no plano Control, que começa em',
            },
            _6.categories = {
                title: 'Categorias',
                description: "As categorias ajudam voc\u00EA a organizar melhor as despesas para acompanhar onde est\u00E1 gastando seu dinheiro. Use nossa lista de categorias sugeridas ou crie as suas pr\u00F3prias.",
                onlyAvailableOnPlan: 'As categorias estão disponíveis no plano Collect, a partir de',
            },
            _6.glCodes = {
                title: 'códigos GL',
                description: "Adicione c\u00F3digos GL \u00E0s suas categorias e tags para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas de contabilidade e folha de pagamento.",
                onlyAvailableOnPlan: 'Os códigos GL estão disponíveis apenas no plano Control, a partir de',
            },
            _6.glAndPayrollCodes = {
                title: 'Códigos GL & Payroll',
                description: "Adicione c\u00F3digos GL e de Folha de Pagamento \u00E0s suas categorias para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas cont\u00E1beis e de folha de pagamento.",
                onlyAvailableOnPlan: 'Os códigos GL e de folha de pagamento estão disponíveis apenas no plano Control, a partir de',
            },
            _6.taxCodes = {
                title: 'Códigos fiscais',
                description: "Adicione c\u00F3digos fiscais aos seus impostos para facilitar a exporta\u00E7\u00E3o de despesas para seus sistemas de contabilidade e folha de pagamento.",
                onlyAvailableOnPlan: 'Os códigos fiscais estão disponíveis apenas no plano Control, a partir de',
            },
            _6.companyCards = {
                title: 'Cartões ilimitados da empresa',
                description: "Precisa adicionar mais feeds de cart\u00E3o? Desbloqueie cart\u00F5es corporativos ilimitados para sincronizar transa\u00E7\u00F5es de todos os principais emissores de cart\u00E3o.",
                onlyAvailableOnPlan: 'Isso está disponível apenas no plano Control, a partir de',
            },
            _6.rules = {
                title: 'Regras',
                description: "As regras funcionam em segundo plano e mant\u00EAm seus gastos sob controle, para que voc\u00EA n\u00E3o precise se preocupar com pequenos detalhes.\n\nExija detalhes de despesas como recibos e descri\u00E7\u00F5es, defina limites e padr\u00F5es, e automatize aprova\u00E7\u00F5es e pagamentos \u2013 tudo em um s\u00F3 lugar.",
                onlyAvailableOnPlan: 'As regras estão disponíveis apenas no plano Control, a partir de',
            },
            _6.perDiem = {
                title: 'Per diem',
                description: 'Per diem é uma ótima maneira de manter seus custos diários em conformidade e previsíveis sempre que seus funcionários viajarem. Aproveite recursos como taxas personalizadas, categorias padrão e detalhes mais granulares, como destinos e subtaxas.',
                onlyAvailableOnPlan: 'Per diem estão disponíveis apenas no plano Control, a partir de',
            },
            _6.travel = {
                title: 'Viagem',
                description: 'Expensify Travel é uma nova plataforma de reserva e gestão de viagens corporativas que permite aos membros reservar acomodações, voos, transporte e mais.',
                onlyAvailableOnPlan: 'Viagens estão disponíveis no plano Collect, a partir de',
            },
            _6.multiLevelTags = {
                title: 'Tags multiníveis',
                description: 'As Tags de Múltiplos Níveis ajudam você a rastrear despesas com maior precisão. Atribua várias tags a cada item de linha — como departamento, cliente ou centro de custo — para capturar o contexto completo de cada despesa. Isso permite relatórios mais detalhados, fluxos de trabalho de aprovação e exportações contábeis.',
                onlyAvailableOnPlan: 'As tags de múltiplos níveis estão disponíveis apenas no plano Control, a partir de',
            },
            _6.pricing = {
                perActiveMember: 'por membro ativo por mês.',
                perMember: 'por membro por mês.',
            },
            _6.note = {
                upgradeWorkspace: 'Atualize seu espaço de trabalho para acessar este recurso, ou',
                learnMore: 'saiba mais',
                aboutOurPlans: 'sobre nossos planos e preços.',
            },
            _6.upgradeToUnlock = 'Desbloquear este recurso',
            _6.completed = {
                headline: "Voc\u00EA atualizou seu espa\u00E7o de trabalho!",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "Voc\u00EA atualizou com sucesso ".concat(policyName, " para o plano Control!");
                },
                categorizeMessage: "Voc\u00EA atualizou com sucesso para um workspace no plano Collect. Agora voc\u00EA pode categorizar suas despesas!",
                travelMessage: "Voc\u00EA atualizou com sucesso para um espa\u00E7o de trabalho no plano Collect. Agora voc\u00EA pode come\u00E7ar a reservar e gerenciar viagens!",
                viewSubscription: 'Ver sua assinatura',
                moreDetails: 'para mais detalhes.',
                gotIt: 'Entendi, obrigado',
            },
            _6.commonFeatures = {
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
            _6),
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
                    multiWorkspaceNote: 'Você precisará rebaixar todos os seus espaços de trabalho antes do seu primeiro pagamento mensal para começar uma assinatura na taxa Collect. Clique',
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
            description2: function (_a) {
                var date = _a.date;
                return "Veja sua an\u00E1lise abaixo para ".concat(date, ":");
            },
            subscription: 'Atenção! Esta ação encerrará sua assinatura do Expensify, excluirá este espaço de trabalho e removerá todos os membros do espaço de trabalho. Se você quiser manter este espaço de trabalho e apenas se remover, peça a outro administrador para assumir a cobrança primeiro.',
            genericFailureMessage: 'Ocorreu um erro ao pagar sua conta. Por favor, tente novamente.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "A\u00E7\u00F5es no espa\u00E7o de trabalho ".concat(workspaceName, " est\u00E3o atualmente restritas");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "O propriet\u00E1rio do espa\u00E7o de trabalho, ".concat(workspaceOwnerName, ", precisar\u00E1 adicionar ou atualizar o cart\u00E3o de pagamento registrado para desbloquear novas atividades do espa\u00E7o de trabalho.");
            },
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
                maxExpenseAgeDays: function () { return ({
                    one: '1 dia',
                    other: function (count) { return "".concat(count, " dias"); },
                }); },
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
                prohibitedDefaultDescription: 'Marque qualquer recibo onde apareçam álcool, jogos de azar ou outros itens restritos. Despesas com recibos onde esses itens aparecem exigirão revisão manual.',
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
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "Por favor, insira um valor menor que ".concat(currency !== null && currency !== void 0 ? currency : '', "20.000");
                },
                autoPayApprovedReportsLockedSubtitle: 'Vá para mais recursos e ative os fluxos de trabalho, depois adicione pagamentos para desbloquear este recurso.',
                autoPayReportsUnderTitle: 'Relatórios de pagamento automático abaixo de',
                autoPayReportsUnderDescription: 'Relatórios de despesas totalmente compatíveis abaixo deste valor serão pagos automaticamente.',
                unlockFeatureGoToSubtitle: 'Ir para',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "e habilite fluxos de trabalho, depois adicione ".concat(featureName, " para desbloquear este recurso.");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "e ative ".concat(featureName, " para desbloquear este recurso.");
                },
            },
            categoryRules: {
                title: 'Regras de categoria',
                approver: 'Aprovador',
                requireDescription: 'Requer descrição',
                descriptionHint: 'Dica de descrição',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Lembre os funcion\u00E1rios de fornecer informa\u00E7\u00F5es adicionais para gastos com \u201C".concat(categoryName, "\u201D. Esta dica aparece no campo de descri\u00E7\u00E3o das despesas.");
                },
                descriptionHintLabel: 'Dica',
                descriptionHintSubtitle: 'Dica profissional: Quanto mais curto, melhor!',
                maxAmount: 'Valor máximo',
                flagAmountsOver: 'Sinalizar valores acima de',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Aplica-se \u00E0 categoria \u201C".concat(categoryName, "\u201D.");
                },
                flagAmountsOverSubtitle: 'Isso substitui o valor máximo para todas as despesas.',
                expenseLimitTypes: {
                    expense: 'Despesa individual',
                    expenseSubtitle: 'Marcar valores de despesas por categoria. Esta regra substitui a regra geral do espaço de trabalho para o valor máximo de despesa.',
                    daily: 'Total da categoria',
                    dailySubtitle: 'Marcar o total de gastos por categoria em cada relatório de despesas.',
                },
                requireReceiptsOver: 'Exigir recibos acima de',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " Padr\u00E3o");
                    },
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
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "Voc\u00EA se comprometeu com 1 membro ativo no plano Control at\u00E9 que sua assinatura anual termine em ".concat(annualSubscriptionEndDate, ". Voc\u00EA pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ").concat(annualSubscriptionEndDate, " desativando a renova\u00E7\u00E3o autom\u00E1tica em"),
                    other: "Voc\u00EA se comprometeu com ".concat(count, " membros ativos no plano Control at\u00E9 que sua assinatura anual termine em ").concat(annualSubscriptionEndDate, ". Voc\u00EA pode mudar para a assinatura de pagamento por uso e fazer downgrade para o plano Collect a partir de ").concat(annualSubscriptionEndDate, " desativando a renova\u00E7\u00E3o autom\u00E1tica em"),
                });
            },
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
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, " \u00E9 uma sala padr\u00E3o em todos os espa\u00E7os de trabalho. Por favor, escolha outro nome.");
        },
        roomNameInvalidError: 'Os nomes das salas podem incluir apenas letras minúsculas, números e hífens.',
        pleaseEnterRoomName: 'Por favor, insira um nome para a sala',
        pleaseSelectWorkspace: 'Por favor, selecione um espaço de trabalho',
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport ? "".concat(actor, " renomeado para \"").concat(newName, "\" (anteriormente \"").concat(oldName, "\")") : "".concat(actor, " renomeou esta sala para \"").concat(newName, "\" (anteriormente \"").concat(oldName, "\")");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "Sala renomeada para ".concat(newName);
        },
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
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "adicionou ".concat(approverName, " (").concat(approverEmail, ") como aprovador para o ").concat(field, " \"").concat(name, "\"");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "removeu ".concat(approverName, " (").concat(approverEmail, ") como aprovador para o ").concat(field, " \"").concat(name, "\"");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "alterou o aprovador para o ".concat(field, " \"").concat(name, "\" para ").concat(formatApprover(newApproverName, newApproverEmail), " (anteriormente ").concat(formatApprover(oldApproverName, oldApproverEmail), ")");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "adicionou a categoria \"".concat(categoryName, "\"");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "removeu a categoria \"".concat(categoryName, "\"");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? 'disabled' : 'habilitado', " a categoria \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "adicionou o c\u00F3digo de folha de pagamento \"".concat(newValue, "\" \u00E0 categoria \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "removeu o c\u00F3digo de folha de pagamento \"".concat(oldValue, "\" da categoria \"").concat(categoryName, "\"");
            }
            return "alterou o c\u00F3digo de folha de pagamento da categoria \"".concat(categoryName, "\" para \"").concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "adicionou o c\u00F3digo GL \"".concat(newValue, "\" \u00E0 categoria \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "removeu o c\u00F3digo GL \"".concat(oldValue, "\" da categoria \"").concat(categoryName, "\"");
            }
            return "alterou o c\u00F3digo GL da categoria \u201C".concat(categoryName, "\u201D para \u201C").concat(newValue, "\u201D (anteriormente \u201C").concat(oldValue, "\u201C)");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "alterou a descri\u00E7\u00E3o da categoria \"".concat(categoryName, "\" para ").concat(!oldValue ? 'obrigatório' : 'não é necessário', " (anteriormente ").concat(!oldValue ? 'não é necessário' : 'obrigatório', ")");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "adicionou um valor m\u00E1ximo de ".concat(newAmount, " \u00E0 categoria \"").concat(categoryName, "\"");
            }
            if (oldAmount && !newAmount) {
                return "removeu o valor m\u00E1ximo de ".concat(oldAmount, " da categoria \"").concat(categoryName, "\"");
            }
            return "alterou o valor m\u00E1ximo da categoria \"".concat(categoryName, "\" para ").concat(newAmount, " (anteriormente ").concat(oldAmount, ")");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "adicionou um tipo de limite de ".concat(newValue, " \u00E0 categoria \"").concat(categoryName, "\"");
            }
            return "alterou o tipo de limite da categoria \"".concat(categoryName, "\" para ").concat(newValue, " (anteriormente ").concat(oldValue, ")");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "atualizou a categoria \"".concat(categoryName, "\" alterando Recibos para ").concat(newValue);
            }
            return "alterou a categoria \"".concat(categoryName, "\" para ").concat(newValue, " (anteriormente ").concat(oldValue, ")");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "renomeou a categoria \"".concat(oldName, "\" para \"").concat(newName, "\"");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "removeu a dica de descri\u00E7\u00E3o \"".concat(oldValue, "\" da categoria \"").concat(categoryName, "\"");
            }
            return !oldValue
                ? "adicionou a dica de descri\u00E7\u00E3o \"".concat(newValue, "\" \u00E0 categoria \"").concat(categoryName, "\"")
                : "alterou a dica de descri\u00E7\u00E3o da categoria \"".concat(categoryName, "\" para \u201C").concat(newValue, "\u201D (anteriormente \u201C").concat(oldValue, "\u201D)");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "alterou o nome da lista de tags para \"".concat(newName, "\" (anteriormente \"").concat(oldName, "\")");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "adicionou a tag \"".concat(tagName, "\" \u00E0 lista \"").concat(tagListName, "\"");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "atualizou a lista de tags \"".concat(tagListName, "\" alterando a tag \"").concat(oldName, "\" para \"").concat(newName, "\"");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? 'habilitado' : 'disabled', " a tag \"").concat(tagName, "\" na lista \"").concat(tagListName, "\"");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "removeu a tag \"".concat(tagName, "\" da lista \"").concat(tagListName, "\"");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "removidos \"".concat(count, "\" tags da lista \"").concat(tagListName, "\"");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "atualizou a tag \"".concat(tagName, "\" na lista \"").concat(tagListName, "\" alterando o ").concat(updatedField, " para \"").concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
            }
            return "atualizou a tag \"".concat(tagName, "\" na lista \"").concat(tagListName, "\" adicionando um ").concat(updatedField, " de \"").concat(newValue, "\"");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "alterou o ".concat(customUnitName, " ").concat(updatedField, " para \"").concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "Rastreamento de impostos ".concat(newValue ? 'habilitado' : 'disabled', " em taxas de dist\u00E2ncia");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "adicionou uma nova taxa \"".concat(customUnitName, "\" \"").concat(rateName, "\"");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "alterou a taxa do ".concat(customUnitName, " ").concat(updatedField, " \"").concat(customUnitRateName, "\" para \"").concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "alterou a al\u00EDquota de imposto na taxa de dist\u00E2ncia \"".concat(customUnitRateName, "\" para \"").concat(newValue, " (").concat(newTaxPercentage, ")\" (anteriormente \"").concat(oldValue, " (").concat(oldTaxPercentage, ")\")");
            }
            return "adicionou a taxa de imposto \"".concat(newValue, " (").concat(newTaxPercentage, ")\" \u00E0 taxa de dist\u00E2ncia \"").concat(customUnitRateName, "\"");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "alterou a parte recuper\u00E1vel do imposto na taxa de dist\u00E2ncia \"".concat(customUnitRateName, "\" para \"").concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
            }
            return "adicionou uma parte recuper\u00E1vel de impostos de \"".concat(newValue, "\" \u00E0 taxa de dist\u00E2ncia \"").concat(customUnitRateName, "\"");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "removeu a taxa \"".concat(rateName, "\" de \"").concat(customUnitName, "\"");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "adicionado campo de relat\u00F3rio ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "defina o valor padr\u00E3o do campo de relat\u00F3rio \"".concat(fieldName, "\" para \"").concat(defaultValue, "\"");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "adicionou a op\u00E7\u00E3o \"".concat(optionName, "\" ao campo do relat\u00F3rio \"").concat(fieldName, "\"");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "removeu a op\u00E7\u00E3o \"".concat(optionName, "\" do campo de relat\u00F3rio \"").concat(fieldName, "\"");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? 'habilitado' : 'disabled', " a op\u00E7\u00E3o \"").concat(optionName, "\" para o campo do relat\u00F3rio \"").concat(fieldName, "\"");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? 'habilitado' : 'disabled', " todas as op\u00E7\u00F5es para o campo de relat\u00F3rio \"").concat(fieldName, "\"");
            }
            return "".concat(allEnabled ? 'habilitado' : 'disabled', " a op\u00E7\u00E3o \"").concat(optionName, "\" para o campo do relat\u00F3rio \"").concat(fieldName, "\", tornando todas as op\u00E7\u00F5es ").concat(allEnabled ? 'habilitado' : 'disabled');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "removido campo de relat\u00F3rio ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "atualizado \"Prevenir autoaprova\u00E7\u00E3o\" para \"".concat(newValue === 'true' ? 'Ativado' : 'Desativado', "\" (anteriormente \"").concat(oldValue === 'true' ? 'Ativado' : 'Desativado', "\")");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "alterou o valor m\u00E1ximo exigido para despesas com recibo para ".concat(newValue, " (anteriormente ").concat(oldValue, ")");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "alterou o valor m\u00E1ximo de despesa para viola\u00E7\u00F5es para ".concat(newValue, " (anteriormente ").concat(oldValue, ")");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "atualizado \"Idade m\u00E1xima da despesa (dias)\" para \"".concat(newValue, "\" (anteriormente \"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\")");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "defina a data de envio do relat\u00F3rio mensal para \"".concat(newValue, "\"");
            }
            return "atualizou a data de envio do relat\u00F3rio mensal para \"".concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "atualizou \"Refaturar despesas para clientes\" para \"".concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "transformado \"Aplicar t\u00EDtulos padr\u00E3o de relat\u00F3rios\" ".concat(value ? 'em' : 'desligado');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "atualizou o nome deste espa\u00E7o de trabalho para \"".concat(newName, "\" (anteriormente \"").concat(oldName, "\")");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription
                ? "defina a descri\u00E7\u00E3o deste espa\u00E7o de trabalho para \"".concat(newDescription, "\"")
                : "atualizou a descri\u00E7\u00E3o deste espa\u00E7o de trabalho para \"".concat(newDescription, "\" (anteriormente \"").concat(oldDescription, "\")");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('e');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "removeu voc\u00EA do fluxo de aprova\u00E7\u00E3o e do chat de despesas de ".concat(joinedNames, ". Relat\u00F3rios enviados anteriormente continuar\u00E3o dispon\u00EDveis para aprova\u00E7\u00E3o na sua Caixa de Entrada."),
                other: "removeu voc\u00EA dos fluxos de aprova\u00E7\u00E3o e chats de despesas de ".concat(joinedNames, ". Relat\u00F3rios enviados anteriormente continuar\u00E3o dispon\u00EDveis para aprova\u00E7\u00E3o na sua Caixa de Entrada."),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "atualizou seu papel em ".concat(policyName, " de ").concat(oldRole, " para usu\u00E1rio. Voc\u00EA foi removido de todos os chats de despesas de remetentes, exceto o seu pr\u00F3prio.");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "atualizou a moeda padr\u00E3o para ".concat(newCurrency, " (anteriormente ").concat(oldCurrency, ")");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "atualizou a frequ\u00EAncia de relat\u00F3rios autom\u00E1ticos para \"".concat(newFrequency, "\" (anteriormente \"").concat(oldFrequency, "\")");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "atualizou o modo de aprova\u00E7\u00E3o para \"".concat(newValue, "\" (anteriormente \"").concat(oldValue, "\")");
        },
        upgradedWorkspace: 'atualizou este espaço de trabalho para o plano Control',
        downgradedWorkspace: 'rebaixou este espaço de trabalho para o plano Collect',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "alterou a taxa de relat\u00F3rios encaminhados aleatoriamente para aprova\u00E7\u00E3o manual para ".concat(Math.round(newAuditRate * 100), "% (anteriormente ").concat(Math.round(oldAuditRate * 100), "%)");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "alterou o limite de aprova\u00E7\u00E3o manual para todas as despesas para ".concat(newLimit, " (anteriormente ").concat(oldLimit, ")");
        },
    },
    roomMembersPage: {
        memberNotFound: 'Membro não encontrado.',
        useInviteButton: 'Para convidar um novo membro para o chat, por favor, use o botão de convite acima.',
        notAuthorized: "Voc\u00EA n\u00E3o tem acesso a esta p\u00E1gina. Se voc\u00EA est\u00E1 tentando entrar nesta sala, pe\u00E7a a um membro da sala para adicion\u00E1-lo. Algo mais? Entre em contato com ".concat(CONST_1.default.EMAIL.CONCIERGE),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "Tem certeza de que deseja remover ".concat(memberName, " da sala?"),
                other: 'Tem certeza de que deseja remover os membros selecionados da sala?',
            });
        },
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
            created: function (_a) {
                var title = _a.title;
                return "tarefa para ".concat(title);
            },
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
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "Extrato de ".concat(monthName, " ").concat(year);
        },
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
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Antes de ".concat(date !== null && date !== void 0 ? date : '');
                },
                after: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Ap\u00F3s ".concat(date !== null && date !== void 0 ? date : '');
                },
                on: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "On ".concat(date !== null && date !== void 0 ? date : '');
                },
                presets: (_7 = {},
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = 'Nunca',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = 'No mês passado',
                    _7),
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
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Menos de ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Maior que ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "Entre ".concat(greaterThan, " e ").concat(lessThan);
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartões individuais',
                closedCards: 'Cartões fechados',
                cardFeeds: 'Feeds de cartão',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "Todos os ".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "All CSV Imported Cards".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
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
            qrMessage: 'Verifique sua pasta de fotos ou downloads para uma cópia do seu código QR. Dica: Adicione-o a uma apresentação para que seu público possa escanear e se conectar diretamente com você.',
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
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "A nova vers\u00E3o estar\u00E1 dispon\u00EDvel em breve.".concat(!isSilentUpdating ? 'Nós notificaremos você quando estivermos prontos para atualizar.' : '');
            },
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
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "alterado ".concat(fieldName, " de ").concat(oldValue, " para ").concat(newValue);
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "alterado ".concat(fieldName, " para ").concat(newValue);
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "alterou o espa\u00E7o de trabalho para ".concat(toPolicyName).concat(fromPolicyName ? "(anteriormente ".concat(fromPolicyName, ")") : '');
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "alterado o tipo de ".concat(oldType, " para ").concat(newType);
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "enviei este relat\u00F3rio para ".concat(delegateUser, " j\u00E1 que ").concat(originalManager, " est\u00E1 de f\u00E9rias");
                },
                exportedToCSV: "exportado para CSV",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "exportado para ".concat(label);
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "exportado para ".concat(label, " via");
                    },
                    automaticActionTwo: 'configurações de contabilidade',
                    manual: function (_a) {
                        var label = _a.label;
                        return "marcou este relat\u00F3rio como exportado manualmente para ".concat(label, ".");
                    },
                    automaticActionThree: 'e criou com sucesso um registro para',
                    reimburseableLink: 'despesas do próprio bolso',
                    nonReimbursableLink: 'despesas com cartão corporativo',
                    pending: function (_a) {
                        var label = _a.label;
                        return "iniciou a exporta\u00E7\u00E3o deste relat\u00F3rio para ".concat(label, "...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "falha ao exportar este relat\u00F3rio para ".concat(label, " (\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\")");
                },
                managerAttachReceipt: "adicionou um recibo",
                managerDetachReceipt: "removeu um recibo",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pago ".concat(currency).concat(amount, " em outro lugar");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pagou ".concat(currency).concat(amount, " via integra\u00E7\u00E3o");
                },
                outdatedBankAccount: "n\u00E3o foi poss\u00EDvel processar o pagamento devido a um problema com a conta banc\u00E1ria do pagador",
                reimbursementACHBounce: "n\u00E3o foi poss\u00EDvel processar o pagamento, pois o pagador n\u00E3o tem fundos suficientes",
                reimbursementACHCancelled: "cancelou o pagamento",
                reimbursementAccountChanged: "n\u00E3o foi poss\u00EDvel processar o pagamento, pois o pagador mudou de conta banc\u00E1ria",
                reimbursementDelayed: "processou o pagamento, mas ele est\u00E1 atrasado em mais 1-2 dias \u00FAteis",
                selectedForRandomAudit: "selecionado aleatoriamente para revis\u00E3o",
                selectedForRandomAuditMarkdown: "[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) para revis\u00E3o",
                share: function (_a) {
                    var to = _a.to;
                    return "membro convidado ".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "membro removido ".concat(to);
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pago ".concat(currency).concat(amount);
                },
                takeControl: "assumiu o controle",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Ocorreu um problema ao sincronizar com ".concat(label).concat(errorMessage ? " (\"".concat(errorMessage, "\")") : '', ". Corrija o problema nas <a href=\"").concat(workspaceAccountingLink, "\">configura\u00E7\u00F5es do workspace</a>.");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "adicionado ".concat(email, " como ").concat(role === 'member' ? 'a' : 'um/uma', " ").concat(role);
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "atualizou o papel de ".concat(email, " para ").concat(newRole, " (anteriormente ").concat(currentRole, ")");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "removeu o campo personalizado 1 de ".concat(email, " (anteriormente \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "adicionado \"".concat(newValue, "\" ao campo personalizado 1 de ").concat(email)
                        : "alterou o campo personalizado 1 de ".concat(email, " para \"").concat(newValue, "\" (anteriormente \"").concat(previousValue, "\")");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "removeu o campo personalizado 2 de ".concat(email, " (anteriormente \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "adicionado \"".concat(newValue, "\" ao campo personalizado 2 de ").concat(email)
                        : "alterou o campo personalizado 2 de ".concat(email, " para \"").concat(newValue, "\" (anteriormente \"").concat(previousValue, "\")");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " saiu do workspace");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "removeu ".concat(role, " ").concat(email);
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "removeu a conex\u00E3o com ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "conectado a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                leftTheChat: 'saiu do chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " para ").concat(dayCount, " ").concat(dayCount === 1 ? 'dia' : 'dias', " at\u00E9 ").concat(date);
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(summary, " de ").concat(timePeriod, " em ").concat(date);
        },
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
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
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
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "De ".concat(reportName).concat(workspaceName ? "em ".concat(workspaceName) : '');
        },
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
        joinExpensifyOrg: 'Junte-se à Expensify.org para eliminar a injustiça ao redor do mundo. A atual campanha "Professores Unidos" apoia educadores em todos os lugares dividindo os custos de materiais escolares essenciais.',
        iKnowATeacher: 'Eu conheço um professor(a)',
        iAmATeacher: 'Sou professor(a)',
        getInTouch: 'Excelente! Por favor, compartilhe as informações deles para que possamos entrar em contato.',
        introSchoolPrincipal: 'Introdução ao diretor da sua escola',
        schoolPrincipalVerifyExpense: 'A Expensify.org divide o custo dos materiais escolares essenciais para que estudantes de famílias de baixa renda possam ter uma melhor experiência de aprendizado. Seu diretor será solicitado a verificar suas despesas.',
        principalFirstName: 'Nome principal',
        principalLastName: 'Sobrenome do diretor',
        principalWorkEmail: 'Email principal de trabalho',
        updateYourEmail: 'Atualize seu endereço de e-mail',
        updateEmail: 'Atualizar endereço de e-mail',
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "Antes de prosseguir, certifique-se de definir seu e-mail escolar como seu m\u00E9todo de contato padr\u00E3o. Voc\u00EA pode fazer isso em Configura\u00E7\u00F5es > Perfil > <a href=\"".concat(contactMethodsRoute, "\">M\u00E9todos de contato</a>.");
        },
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
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'Iniciar um chat,',
            buttonText2: 'indique um amigo.',
            header: 'Inicie um chat, indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta iniciar um chat com eles e nós cuidaremos do resto.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: 'Enviar uma despesa,',
            buttonText2: 'indique seu chefe.',
            header: 'Envie uma despesa, indique seu chefe',
            body: 'Quer que seu chefe use o Expensify também? Basta enviar uma despesa para ele e nós cuidaremos do resto.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: 'Indique um amigo',
            header: 'Indique um amigo',
            body: 'Quer que seus amigos usem o Expensify também? Basta conversar, pagar ou dividir uma despesa com eles e nós cuidaremos do resto. Ou simplesmente compartilhe seu link de convite!',
        },
        _8.copyReferralLink = 'Copiar link de convite',
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'Converse com seu especialista em configuração em',
            phrase2: 'para ajuda',
        },
        _9.default = {
            phrase1: 'Mensagem',
            phrase2: 'para ajuda com a configuração',
        },
        _9),
    violations: {
        allTagLevelsRequired: 'Todas as tags são obrigatórias',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, " rejeitou esta despesa com o coment\u00E1rio \"").concat(rejectReason, "\"");
        },
        billableExpense: 'Faturável não é mais válido',
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Receipt required".concat(formattedLimit ? "acima de ".concat(formattedLimit) : '');
        },
        categoryOutOfPolicy: 'Categoria não é mais válida',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "Aplicado ".concat(surcharge, "% de sobretaxa de convers\u00E3o");
        },
        customUnitOutOfPolicy: 'Taxa não válida para este workspace',
        duplicatedTransaction: 'Duplicar',
        fieldRequired: 'Os campos do relatório são obrigatórios',
        futureDate: 'Data futura não permitida',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "Marcado em ".concat(invoiceMarkup, "%");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "Data anterior a ".concat(maxAge, " dias");
        },
        missingCategory: 'Categoria ausente',
        missingComment: 'Descrição necessária para a categoria selecionada',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Faltando ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return 'O valor difere da distância calculada';
                case 'card':
                    return 'Quantia maior que a transação do cartão';
                default:
                    if (displayPercentVariance) {
                        return "Quantia ".concat(displayPercentVariance, "% maior que o recibo escaneado");
                    }
                    return 'Quantia maior que o recibo escaneado';
            }
        },
        modifiedDate: 'A data difere do recibo digitalizado',
        nonExpensiworksExpense: 'Despesa não Expensiworks',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Despesa excede o limite de aprova\u00E7\u00E3o autom\u00E1tica de ".concat(formattedLimit);
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Quantia acima do limite de ".concat(formattedLimit, "/pessoa da categoria");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Quantia acima do limite de ".concat(formattedLimit, "/pessoa");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Quantia acima do limite de ".concat(formattedLimit, "/pessoa");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Quantia acima do limite di\u00E1rio de ".concat(formattedLimit, "/pessoa para a categoria");
        },
        receiptNotSmartScanned: 'Detalhes da despesa e recibo adicionados manualmente. Por favor, verifique os detalhes. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Saiba mais</a> sobre auditoria automática para todos os recibos.',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = 'Recibo necessário';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += 'sobre';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'limite de categoria';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = 'Despesa proibida:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " \u00E1lcool");
                case 'gambling':
                    return "".concat(preMessage, " jogos de azar");
                case 'tobacco':
                    return "".concat(preMessage, " tabaco");
                case 'adultEntertainment':
                    return "".concat(preMessage, " entretenimento adulto");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " despesas incidentais de hotel");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'Revisão necessária',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Não é possível associar automaticamente o recibo devido a uma conexão bancária interrompida.';
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "N\u00E3o \u00E9 poss\u00EDvel associar automaticamente o recibo devido a uma conex\u00E3o banc\u00E1ria interrompida que ".concat(email, " precisa corrigir.")
                    : 'Não é possível associar automaticamente o recibo devido a uma conexão bancária interrompida que você precisa corrigir.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? "Pe\u00E7a a ".concat(member, " para marcar como dinheiro ou espere 7 dias e tente novamente.") : 'Aguardando a fusão com a transação do cartão.';
            }
            return '';
        },
        brokenConnection530Error: 'Recibo pendente devido a conexão bancária interrompida',
        adminBrokenConnectionError: 'Recibo pendente devido a uma conexão bancária interrompida. Por favor, resolva em',
        memberBrokenConnectionError: 'Recibo pendente devido a uma conexão bancária interrompida. Por favor, peça a um administrador do espaço de trabalho para resolver.',
        markAsCashToIgnore: 'Marcar como dinheiro para ignorar e solicitar pagamento.',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "Falha na digitaliza\u00E7\u00E3o do recibo.".concat(canEdit ? 'Insira os detalhes manualmente.' : '');
        },
        receiptGeneratedWithAI: 'Recibo potencial gerado por IA',
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Faltando ".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag', " n\u00E3o \u00E9 mais v\u00E1lido");
        },
        taxAmountChanged: 'O valor do imposto foi modificado',
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : 'Imposto', " n\u00E3o \u00E9 mais v\u00E1lido");
        },
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
        confirmDetails: "Confirme os detalhes que voc\u00EA est\u00E1 mantendo",
        confirmDuplicatesInfo: "As solicita\u00E7\u00F5es duplicadas que voc\u00EA n\u00E3o mantiver ser\u00E3o mantidas para o membro excluir.",
        hold: 'Esta despesa foi colocada em espera',
        resolvedDuplicates: 'resolvido o duplicado',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "".concat(fieldName, " \u00E9 obrigat\u00F3rio");
        },
        _10),
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
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Preciso de um recurso que está disponível apenas no Expensify Classic.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Não entendo como usar o New Expensify.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Eu entendo como usar o New Expensify, mas eu prefiro o Expensify Classic.',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Que recurso você precisa que não está disponível no Novo Expensify?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'O que você está tentando fazer?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Por que você prefere o Expensify Classic?',
            _12),
        responsePlaceholder: 'Sua resposta',
        thankYou: 'Obrigado pelo feedback!',
        thankYouSubtitle: 'Suas respostas nos ajudarão a construir um produto melhor para realizar tarefas. Muito obrigado!',
        goToExpensifyClassic: 'Mudar para Expensify Classic',
        offlineTitle: 'Parece que você está preso aqui...',
        offline: 'Parece que você está offline. Infelizmente, o Expensify Classic não funciona offline, mas o Novo Expensify funciona. Se você preferir usar o Expensify Classic, tente novamente quando tiver uma conexão com a internet.',
        quickTip: 'Dica rápida...',
        quickTipSubTitle: 'Você pode ir direto para o Expensify Classic visitando expensify.com. Adicione aos favoritos para um atalho fácil!',
        bookACall: 'Agendar uma chamada',
        noThanks: 'Não, obrigado.',
        bookACallTitle: 'Gostaria de falar com um gerente de produto?',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = 'Conversando diretamente em despesas e relatórios',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'Capacidade de fazer tudo no celular',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'Viagem e despesas na velocidade do chat',
            _13),
        bookACallTextTop: 'Ao mudar para o Expensify Classic, você perderá:',
        bookACallTextBottom: 'Estamos ansiosos para fazer uma ligação com você para entender o motivo. Você pode agendar uma chamada com um dos nossos gerentes de produto sêniores para discutir suas necessidades.',
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
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "Teste gratuito: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'dia' : 'dias', " restantes");
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Atualize seu cart\u00E3o de pagamento at\u00E9 ".concat(date, " para continuar usando todos os seus recursos favoritos.");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Seu pagamento não pôde ser processado',
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "Sua cobran\u00E7a de ".concat(date, " no valor de ").concat(purchaseAmountOwed, " n\u00E3o p\u00F4de ser processada. Por favor, adicione um cart\u00E3o de pagamento para quitar o valor devido.")
                        : 'Por favor, adicione um cartão de pagamento para quitar o valor devido.';
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Seu pagamento est\u00E1 atrasado. Por favor, pague sua fatura at\u00E9 ".concat(date, " para evitar a interrup\u00E7\u00E3o do servi\u00E7o.");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Suas informações de pagamento estão desatualizadas',
                subtitle: 'Seu pagamento está atrasado. Por favor, pague sua fatura.',
            },
            billingDisputePending: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "Voc\u00EA contestou a cobran\u00E7a de ".concat(amountOwed, " no cart\u00E3o com final ").concat(cardEnding, ". Sua conta ser\u00E1 bloqueada at\u00E9 que a disputa seja resolvida com seu banco.");
                },
            },
            cardAuthenticationRequired: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "Seu cart\u00E3o de pagamento n\u00E3o foi totalmente autenticado. Por favor, complete o processo de autentica\u00E7\u00E3o para ativar seu cart\u00E3o de pagamento com final ".concat(cardEnding, ".");
                },
            },
            insufficientFunds: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Seu cart\u00E3o de pagamento foi recusado devido a fundos insuficientes. Por favor, tente novamente ou adicione um novo cart\u00E3o de pagamento para quitar seu saldo pendente de ".concat(amountOwed, ".");
                },
            },
            cardExpired: {
                title: 'Não foi possível cobrar no seu cartão',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Seu cart\u00E3o de pagamento expirou. Por favor, adicione um novo cart\u00E3o de pagamento para quitar seu saldo pendente de ".concat(amountOwed, ".");
                },
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
                subtitle: 'Antes de tentar novamente, por favor, ligue diretamente para o seu banco para autorizar cobranças da Expensify e remover quaisquer bloqueios. Caso contrário, tente adicionar um cartão de pagamento diferente.',
            },
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "Voc\u00EA contestou a cobran\u00E7a de ".concat(amountOwed, " no cart\u00E3o com final ").concat(cardEnding, ". Sua conta ser\u00E1 bloqueada at\u00E9 que a disputa seja resolvida com seu banco.");
            },
            preTrial: {
                title: 'Inicie uma avaliação gratuita',
                subtitleStart: 'Como próximo passo,',
                subtitleLink: 'complete sua lista de verificação de configuração',
                subtitleEnd: 'para que sua equipe possa começar a registrar despesas.',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "Teste: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'dia' : 'dias', " restantes!");
                },
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            trialEnded: {
                title: 'Seu teste gratuito terminou',
                subtitle: 'Adicione um cartão de pagamento para continuar usando todos os seus recursos favoritos.',
            },
            earlyDiscount: {
                claimOffer: 'Resgatar oferta',
                noThanks: 'Não, obrigado.',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>".concat(discountType, "% de desconto no seu primeiro ano!</strong> Basta adicionar um cart\u00E3o de pagamento e iniciar uma assinatura anual.");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "Oferta por tempo limitado: ".concat(discountType, "% de desconto no seu primeiro ano!");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "Reivindicar dentro de ".concat(days > 0 ? "".concat(days, "d :") : '').concat(hours, "h : ").concat(minutes, "m : ").concat(seconds, "s");
                },
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Adicione um cartão para pagar sua assinatura do Expensify.',
            addCardButton: 'Adicionar cartão de pagamento',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "Sua pr\u00F3xima data de pagamento \u00E9 ".concat(nextPaymentDate, ".");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "Cart\u00E3o com final ".concat(cardNumber);
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "Nome: ".concat(name, ", Validade: ").concat(expiration, ", Moeda: ").concat(currency);
            },
            changeCard: 'Alterar cartão de pagamento',
            changeCurrency: 'Alterar moeda de pagamento',
            cardNotFound: 'Nenhum cartão de pagamento adicionado',
            retryPaymentButton: 'Tentar novamente o pagamento',
            authenticatePayment: 'Autenticar pagamento',
            requestRefund: 'Solicitar reembolso',
            requestRefundModal: {
                full: 'Obter um reembolso é fácil, basta rebaixar sua conta antes da próxima data de cobrança e você receberá um reembolso. <br /> <br /> Atenção: Rebaixar sua conta significa que seu(s) espaço(s) de trabalho será(ão) excluído(s). Esta ação não pode ser desfeita, mas você sempre pode criar um novo espaço de trabalho se mudar de ideia.',
                confirm: 'Excluir espaço(s) de trabalho e rebaixar',
            },
            viewPaymentHistory: 'Ver histórico de pagamentos',
        },
        yourPlan: {
            title: 'Seu plano',
            exploreAllPlans: 'Explore todos os planos',
            customPricing: 'Preços personalizados',
            asLowAs: function (_a) {
                var price = _a.price;
                return "a partir de ".concat(price, " por membro ativo/m\u00EAs");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " por membro/m\u00EAs");
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " por membro por m\u00EAs");
            },
            perMemberMonth: 'por membro/mês',
            collect: {
                title: 'Coletar',
                description: 'O plano para pequenas empresas que oferece despesas, viagens e chat.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membro ativo com o Expensify Card, ").concat(upper, "/membro ativo sem o Expensify Card.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membro ativo com o Expensify Card, ").concat(upper, "/membro ativo sem o Expensify Card.");
                },
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
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membro ativo com o Expensify Card, ").concat(upper, "/membro ativo sem o Expensify Card.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membro ativo com o Expensify Card, ").concat(upper, "/membro ativo sem o Expensify Card.");
                },
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
            headsUp: 'Atenção: Se você não definir o tamanho da sua assinatura agora, nós a definiremos automaticamente com base no número de membros ativos do seu primeiro mês. Você estará então comprometido a pagar por pelo menos esse número de membros pelos próximos 12 meses. Você pode aumentar o tamanho da sua assinatura a qualquer momento, mas não pode diminuí-la até que sua assinatura termine.',
            zeroCommitment: 'Zero compromisso na taxa de assinatura anual com desconto',
        },
        subscriptionSize: {
            title: 'Tamanho da assinatura',
            yourSize: 'O tamanho da sua assinatura é o número de vagas disponíveis que podem ser preenchidas por qualquer membro ativo em um determinado mês.',
            eachMonth: 'Todo mês, sua assinatura cobre até o número de membros ativos definido acima. Sempre que você aumentar o tamanho da sua assinatura, começará uma nova assinatura de 12 meses nesse novo tamanho.',
            note: 'Nota: Um membro ativo é qualquer pessoa que tenha criado, editado, enviado, aprovado, reembolsado ou exportado dados de despesas vinculados ao espaço de trabalho da sua empresa.',
            confirmDetails: 'Confirme os detalhes da sua nova assinatura anual:',
            subscriptionSize: 'Tamanho da assinatura',
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " membros ativos/m\u00EAs");
            },
            subscriptionRenews: 'Assinatura renova-se',
            youCantDowngrade: 'Você não pode fazer downgrade durante sua assinatura anual.',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "Voc\u00EA j\u00E1 se comprometeu com uma assinatura anual de ".concat(size, " membros ativos por m\u00EAs at\u00E9 ").concat(date, ". Voc\u00EA pode mudar para uma assinatura de pagamento por uso em ").concat(date, " desativando a renova\u00E7\u00E3o autom\u00E1tica.");
            },
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
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "Tipo de assinatura: ".concat(subscriptionType, ", Tamanho da assinatura: ").concat(subscriptionSize, ", Renova\u00E7\u00E3o autom\u00E1tica: ").concat(autoRenew, ", Aumento autom\u00E1tico de assentos anuais: ").concat(autoIncrease);
            },
            none: 'none',
            on: 'em',
            off: 'desligado',
            annual: 'Anual',
            autoRenew: 'Renovação automática',
            autoIncrease: 'Aumento automático de assentos anuais',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "Economize at\u00E9 ".concat(amountWithCurrency, "/m\u00EAs por membro ativo");
            },
            automaticallyIncrease: 'Aumente automaticamente seus assentos anuais para acomodar membros ativos que excedam o tamanho da sua assinatura. Nota: Isso estenderá a data de término da sua assinatura anual.',
            disableAutoRenew: 'Desativar renovação automática',
            helpUsImprove: 'Ajude-nos a melhorar o Expensify',
            whatsMainReason: 'Qual é o principal motivo para você desativar a renovação automática?',
            renewsOn: function (_a) {
                var date = _a.date;
                return "Renova em ".concat(date, ".");
            },
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
            acknowledgement: "Ao solicitar o cancelamento antecipado, reconhe\u00E7o e concordo que a Expensify n\u00E3o tem obriga\u00E7\u00E3o de atender a tal solicita\u00E7\u00E3o sob a Expensify.<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">Termos de Servi\u00E7o</a>ou outro acordo de servi\u00E7os aplic\u00E1vel entre mim e a Expensify e que a Expensify mant\u00E9m a discri\u00E7\u00E3o exclusiva em rela\u00E7\u00E3o \u00E0 concess\u00E3o de qualquer solicita\u00E7\u00E3o desse tipo."),
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
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Cheio';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitado';
                default:
                    return '';
            }
        },
        genericError: 'Ops, algo deu errado. Por favor, tente novamente.',
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "em nome de ".concat(delegator);
        },
        accessLevel: 'Nível de acesso',
        confirmCopilot: 'Confirme seu copiloto abaixo.',
        accessLevelDescription: 'Escolha um nível de acesso abaixo. Tanto o acesso Completo quanto o Limitado permitem que copilotos vejam todas as conversas e despesas.',
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Permitir que outro membro realize todas as ações em sua conta, em seu nome. Inclui bate-papo, envios, aprovações, pagamentos, atualizações de configurações e mais.';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Permita que outro membro execute a maioria das ações em sua conta, em seu nome. Exclui aprovações, pagamentos, rejeições e bloqueios.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Remover copilot',
        removeCopilotConfirmation: 'Tem certeza de que deseja remover este copiloto?',
        changeAccessLevel: 'Alterar nível de acesso',
        makeSureItIsYou: 'Vamos garantir que é você',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(contactMethod, " para adicionar um copiloto. Ele deve chegar em um ou dois minutos.");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Por favor, insira o c\u00F3digo m\u00E1gico enviado para ".concat(contactMethod, " para atualizar seu copiloto.");
        },
        notAllowed: 'Não tão rápido...',
        noAccessMessage: 'Como copiloto, você não tem acesso a esta página. Desculpe!',
        notAllowedMessageStart: "Como um(a)",
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "para ".concat(accountOwnerEmail, ", voc\u00EA n\u00E3o tem permiss\u00E3o para realizar esta a\u00E7\u00E3o. Desculpe!");
        },
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
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "Faltando ".concat(propertyName);
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "Propriedade inv\u00E1lida: ".concat(propertyName, " - Esperado: ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "Valor inv\u00E1lido - Esperado: ".concat(expectedValues);
        },
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
                description: '<muted-text>Ganhe <strong>3 meses gratuitos de Expensify</strong> para sua equipe! Basta inserir o e-mail do seu chefe abaixo e enviar uma despesa de teste.</muted-text>',
                email: 'Digite o e-mail do seu chefe',
                error: 'Esse membro possui um espaço de trabalho, por favor insira um novo membro para testar.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Você está atualmente testando o Expensify',
            readyForTheRealThing: 'Pronto para a coisa real?',
            getStarted: 'Comece agora',
        },
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, " convidou voc\u00EA para experimentar o Expensify\nEi! Acabei de conseguir *3 meses gr\u00E1tis* para testarmos o Expensify, a maneira mais r\u00E1pida de lidar com despesas.\n\nAqui est\u00E1 um *recibo de teste* para mostrar como funciona:");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
