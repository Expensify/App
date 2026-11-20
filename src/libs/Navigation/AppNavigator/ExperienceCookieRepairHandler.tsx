import useRepairExperienceCookie from '@hooks/useRepairExperienceCookie';

/** Renders nothing. Its own component, so the repair's Onyx reads re-render only this. */
function ExperienceCookieRepairHandler() {
    useRepairExperienceCookie();

    return null;
}

export default ExperienceCookieRepairHandler;
