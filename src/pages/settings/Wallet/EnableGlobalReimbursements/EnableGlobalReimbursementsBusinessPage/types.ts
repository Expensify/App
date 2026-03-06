import type {SubPageProps} from '@hooks/useSubPage/types';
import type {Country} from '@src/CONST';

type BusinessInfoSubPageProps = SubPageProps & {currency: string; country: Country | ''};

export type {BusinessInfoSubPageProps};
