import ROUTES from '@src/ROUTES';

// @TODO: Remove this function when /home-page is no longer used
function getRedirectedPath(path: string) {
    return path === '/home-page' ? `${ROUTES.HOME}` : path;
}

export default getRedirectedPath;
