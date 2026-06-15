/* eslint-disable @typescript-eslint/naming-convention */
type MergeHRProviderEntry = {
    /** Human-readable label used in the UI */
    displayName: string;

    /** Provider logo served from the Merge CDN */
    iconUrl: string;
};

const MERGE_HR_PROVIDERS = {
    'adp-decidium': {
        displayName: 'ADP DECIDIUM',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/ADP_Decidium_Square.png',
    },
    'adp-run': {
        displayName: 'ADP RUN',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/ADP_RUN_Square.png',
    },
    'adp-workforce-now': {
        displayName: 'ADP Workforce Now',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/ADP_Workforce_Now_Square.png',
    },
    bamboohr: {
        displayName: 'BambooHR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/BambooHR_Square_Logo.jpg',
    },
    breathe: {
        displayName: 'Breathe',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Breathe_Square_Logo_FY9Zgjm.jpg',
    },
    'cezanne-hr': {
        displayName: 'Cezanne HR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Cezanne-square.png',
    },
    darwinbox: {
        displayName: 'Darwinbox',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Darwinbox-square.png',
    },
    dayforce: {
        displayName: 'Dayforce',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformDayforce.png',
    },
    'folks-hr': {
        displayName: 'Folks HR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformFolks_square.png',
    },
    fourth: {
        displayName: 'Fourth',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Fourth_square.png',
    },
    freshteam: {
        displayName: 'Freshteam',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Freshteam_Square.png',
    },
    'generic-sftp': {
        displayName: 'Generic SFTP',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/generic_sftp_square_mJ3x0IU.png',
    },
    'hailey-hr': {
        displayName: 'Hailey HR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformHailey_HR.png',
    },
    hibob: {
        displayName: 'HiBob',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformHibob.png',
    },
    'hr-cloud': {
        displayName: 'HR Cloud',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/HR_Cloud_Square_Logo.jpg',
    },
    humaans: {
        displayName: 'Humaans',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Humaans_Square_Logo.jpg',
    },
    'insperity-premier': {
        displayName: 'Insperity Premier',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Platforminsperity_square.png',
    },
    intellihr: {
        displayName: 'IntelliHR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/IntelliHR_Square_Logo.jpg',
    },
    'iris-cascade': {
        displayName: 'IRIS Cascade',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/IRIS_Cascade-square.png',
    },
    jumpcloud: {
        displayName: 'JumpCloud',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Jumpcloud_square.png',
    },
    justworks: {
        displayName: 'Justworks',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Justworks_Square_Logo.jpg',
    },
    kallidus: {
        displayName: 'Kallidus',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Kallidus_square.png',
    },
    keka: {
        displayName: 'Keka',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/keka_square.png',
    },
    kenjo: {
        displayName: 'Kenjo',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformKenjo_square.png',
    },
    lucca: {
        displayName: 'Lucca',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Lucca.jpg',
    },
    namely: {
        displayName: 'Namely',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Namely_Square_Logo.jpg',
    },
    'oracle-cloud-human-capital-management-hcm': {
        displayName: 'Oracle Cloud Human Capital Management (HCM)',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Oracle_square.png',
    },
    paychex: {
        displayName: 'Paychex',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Paychex_Square_Logo.png',
    },
    paycom: {
        displayName: 'Paycom',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformPaycom.png',
    },
    paycor: {
        displayName: 'Paycor',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Platformpaycor_square.png',
    },
    paylocity: {
        displayName: 'Paylocity',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Paylocity_Square_Logo_LGm1Fdn.png',
    },
    peoplehr: {
        displayName: 'PeopleHR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PeopleHR_Access_Square.png',
    },
    rippling: {
        displayName: 'Rippling',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Platformrippling_rR8x3bN.png',
    },
    'sage-hr': {
        displayName: 'Sage HR',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Sage_HR_Square_L3bw47M.png',
    },
    'sap-successfactors': {
        displayName: 'SAP SuccessFactors',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/SuccessFactors_Square_Logo_BcXogF0.jpg',
    },
    simployer: {
        displayName: 'Simployer',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/Simployer_Square.png',
    },
    'ukg-pro': {
        displayName: 'UKG Pro',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/UKG_square.png',
    },
    'ukg-pro-workforce-management': {
        displayName: 'UKG Pro Workforce Management',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/UKG_square_da9Q05B.png',
    },
    'ukg-ready': {
        displayName: 'UKG Ready',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/UKG_square_geaH8qP.png',
    },
    workday: {
        displayName: 'Workday',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformWorkday.png',
    },
    zelt: {
        displayName: 'Zelt',
        iconUrl: 'https://merge-api-public.s3.amazonaws.com/media/PlatformZelt.png',
    },
} as const satisfies Record<string, MergeHRProviderEntry>;

type MergeHRProviderSlug = keyof typeof MERGE_HR_PROVIDERS;

export type {MergeHRProviderSlug};
export default MERGE_HR_PROVIDERS;
