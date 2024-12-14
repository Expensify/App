{ValueOf} türünü 'type-fest'ten içe aktar;
{dismissProductTraining} öğesini '@libs/actions/Welcome' konumundan içe aktarın;
CONST'ı '@src/CONST'dan içe aktar;
{TranslationPaths} türünü '@src/languages/types' dizininden içe aktar;

sabit {
    KONSİYERJ_LHN_GBR,
    YENİDEN ADLANDIRILMIŞ_ARAMA,
    ÇALIŞMA ALANI_SOHBET_OLUŞTUR,
    HIZLI_İŞLEM_DÜĞMESİ,
    ARAMA_FİLTRE_DÜĞMESİ_ARAÇ_İPUCU,
    ALT_NAV_GİRİŞ_KUTUSU_İPUCU,
    LHN_WORKSPACE_CHAT_ARAÇ İPUCU,
    GLOBAL_OLUŞTURMA_ARAÇ_İPUCU,
} = CONST.ÜRÜN_EĞİTİMİ_ARAÇ_İPUCU_ADLARI;

tür ProductTrainingTooltipName = ValueOf<typeof CONST.PRODUCT_TRAINING_TOOLTIP_NAMES>;

tip ShouldShowConditionProps = {
    DarDüzenKullanılmalı mı?: boolean;
};

tip Araç İpucu Verileri = {
    içerik: Dizi<{text: TranslationPaths; isBold: boolean}>;
    onHideTooltip: () => void;
    adı: ProductTrainingTooltipName;
    öncelik: sayı;
    shouldShow: (özellikler: ShouldShowConditionProps) => boolean;
};

sabit Araç İpucu Verisi oluştur = (
    adı: ProductTrainingTooltipName,
    içerik: Dizi<{text: TranslationPaths; isBold: boolean}>,
    öncelik: sayı,
    shouldShow: (özellikler: ShouldShowConditionProps) => boolean
): Araç İpucu Verileri => ({
    içerik,
    onHideTooltip: () => ceaseProductTraining(name),
    isim,
    öncelik,
    Göstermeli,
});

sabit ARAÇ İPUÇLARI: Kayıt<ÜrünEğitimiAraçİpucuAdı, AraçİpucuVerisi> = {
    [CONCIERGE_LHN_GBR]: Araç İpucu Verisi oluştur(
        KONSİYERJ_LHN_GBR,
        [
            {text: 'productTrainingTooltip.conciergeLHNGBR.part1', isBold: false},
            {text: 'productTrainingTooltip.conciergeLHNGBR.part2', isBold: true},
        ],
        1300,
        ({shouldUseNarrowLayout = false}) => shouldUseNarrowLayout
    ),
    [RENAME_SAVED_SEARCH]: createTooltipData(
        YENİDEN ADLANDIRILMIŞ_ARAMA,
        [
            {text: 'productTrainingTooltip.saveSearchTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.saveSearchTooltip.part2', isBold: false},
        ],
        1250,
        ({shouldUseNarrowLayout = false}) => !shouldUseNarrowLayout
    ),
    [GLOBAL_CREATE_TOOLTIP]: Araç İpucu Verisi oluştur(
        GLOBAL_OLUŞTURMA_ARAÇ_İPUCU,
        [
            {metin: 'ürünEğitimAraçİpucu.globalOluşturAraçİpucu.part1', isBold: true},
            {metin: 'ürünEğitimAraçİpucu.globalOluşturAraçİpucu.part2', isBold: false},
            {metin: 'ürünEğitimAraçİpucu.globalOluşturAraçİpucu.part3', isBold: false},
        ],
        1200,
        () => doğru
    ),
    [HIZLI_İŞLEM_DÜĞMESİ]: createTooltipData(
        HIZLI_İŞLEM_DÜĞMESİ,
        [
            {metin: 'ürünEğitimAraçİpucu.hızlıAksiyonDüğmesi.bölüm1', isBold: doğru},
            {metin: 'ürünEğitimAraçİpucu.hızlıAksiyonDüğmesi.bölüm2', isBold: false},
        ],
        1150,
        () => doğru
    ),
    [WORKSPACE_CHAT_CREATE]: createTooltipData(
        ÇALIŞMA ALANI_SOHBET_OLUŞTUR,
        [
            {metin: 'ürünEğitimAraçİpucu.çalışmaAlanıSohbetOluştur.part1', isBold: true},
            {text: 'productTrainingTooltip.workspaceChatCreate.part2', isBold: false},
        ],
        1100,
        () => doğru
    ),
    [ARAMA_FİLTRE_DÜĞMESİ_ARAÇ_İPUCU]: createTooltipData(
        ARAMA_FİLTRE_DÜĞMESİ_ARAÇ_İPUCU,
        [
            {metin: 'ürünEğitimAraçİpucu.aramaFiltresiDüğmesiAraçİpucu.bölüm1', isBold: doğru},
            {metin: 'ürünEğitimAraçİpucu.aramaFiltresiDüğmesiAraçİpucu.bölüm2', isBold: false},
        ],
        1000,
        () => doğru
    ),
    [ALT_NAV_GİRİŞ_KUTUSU_ARAÇ_İPUCU]: createTooltipData(
        ALT_NAV_GİRİŞ_KUTUSU_İPUCU,
        [
            {metin: 'ürünEğitimAraçİpucu.bottomNavInboxAraçİpucu.part1', isBold: true},
            {metin: 'ürünEğitimAraçİpucu.altGezintiGelenKutusuAraçİpucu.bölüm2', isBold: false},
            {metin: 'ürünEğitimAraçİpucu.altGezintiGelenKutusuAraçİpucu.bölüm3', isBold: false},
        ],
        900,
        () => doğru
    ),
    [LHN_WORKSPACE_CHAT_TOOLTIP]: Araç ipucu verisi oluştur(
        LHN_WORKSPACE_CHAT_ARAÇ İPUCU,
        [
            {text: 'productTrainingTooltip.workspaceChatTooltip.part1', isBold: true},
            {text: 'productTrainingTooltip.workspaceChatTooltip.part2', isBold: false},
            {text: 'productTrainingTooltip.workspaceChatTooltip.part3', isBold: false},
        ],
        800,
        () => doğru
    ),
};

varsayılan İPUÇLARI'nı dışa aktar;
dışa aktarma türü {ProductTrainingTooltipName};
