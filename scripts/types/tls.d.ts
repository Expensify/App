/** Bun and Node 26 implement tls.getCACertificates, but the repo's @types/node predates it. */
declare module 'tls' {
    function getCACertificates(type?: 'default' | 'system' | 'bundled' | 'extra'): string[];
}

export {};
