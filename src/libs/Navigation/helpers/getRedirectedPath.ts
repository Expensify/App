import ROUTES from '@src/ROUTES';

function getRedirectedPath(path: string) {
    return path === '/home-page' ? `${ROUTES.HOME}` : path;
}

export default getRedirectedPath;
