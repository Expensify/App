import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ExperienceCookieValue = ValueOf<typeof CONST.EXPERIENCE_COOKIE.VALUES>;

/** Writes `experience=<value>` on the shared cookie domain. Returns false, without writing anything, on any host other than the one that serves both products. */
type WriteExperienceCookie = (value: ExperienceCookieValue) => boolean;

/** Deletes the host-only and the shared-domain `experience` cookie. Returns false, without writing anything, on any host other than the one that serves both products. */
type ClearExperienceCookie = () => boolean;

export type {ClearExperienceCookie, WriteExperienceCookie};
