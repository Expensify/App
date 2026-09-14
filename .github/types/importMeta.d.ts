// Node 24+ provides import.meta.main. @types/node 20 doesn't declare it yet.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ImportMeta {
    main?: boolean;
}
