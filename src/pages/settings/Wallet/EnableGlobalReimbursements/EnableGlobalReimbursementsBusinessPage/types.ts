import type {SubPageProps} from '@hooks/useSubPage/types';

import type {Country} from '@src/CONST';

type BusinessInfoSubPageProps = SubPageProps & {currency: string; country: Country | ''};

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export type {BusinessInfoSubPageProps};
