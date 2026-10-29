const createDownloadLink = (href: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.style.display = 'none';
    link.download = fileName;
    document.body.appendChild(link);

    try {
        link.click();
    } finally {
        // The browser reads the Blob URL asynchronously after click(), so wait until the current task finishes before revoking it.
        setTimeout(() => URL.revokeObjectURL(href), 0);
        link.remove();
    }
};

export default createDownloadLink;
