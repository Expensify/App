import type {MultifactorAuthenticationAPIParams} from '@components/MultifactorAuthentication/config/types';

type UnblockCardPINParams = Omit<MultifactorAuthenticationAPIParams<'UNBLOCK-CARD-PIN'>, 'isOfflinePINMarket'>;

export default UnblockCardPINParams;
