type Category = {
    detect: (changedFiles: Array<{filename: string; status: string}>) => Promise<boolean>;
    items: string[];
};

export default Category;
