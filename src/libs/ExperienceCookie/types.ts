import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ExperienceCookieValue = ValueOf<typeof CONST.EXPERIENCE_COOKIE.VALUES>;

/** Writes `experience=<value>` on the shared cookie domain. Returns false, without writing anything, off the HybridWeb host. */
type WriteExperienceCookie = (value: ExperienceCookieValue) => boolean;

/** Deletes the host-only and the shared-domain `experience` cookie. Returns false, without writing anything, off the HybridWeb host. */
type ClearExperienceCookie = () => boolean;

export type {ClearExperienceCookie, ExperienceCookieValue, WriteExperienceCookie};
