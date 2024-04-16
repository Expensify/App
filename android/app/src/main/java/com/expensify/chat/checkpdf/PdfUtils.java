package com.expensify.chat.checkpdf;

import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class PdfUtils {
    public static boolean isPdfCorrupted(String filePath) {
        try {
            // Read the content of the PDF file into a byte array
            File file = new File(filePath);
            byte[] buffer = new byte[(int) file.length()];
            FileInputStream fis = new FileInputStream(file);
            fis.read(buffer);
            fis.close();

            // Check if the PDF file starts with the "%PDF" header
            String pdfHeader = new String(buffer, 0, 4);
            Log.d("CheckPDF" , !pdfHeader.equals("%PDF")?"true":"false");
            return !pdfHeader.equals("%PDF");
        } catch (IOException e) {
            // Handle IO errors
            e.printStackTrace();
            return true; // Treat IO errors as corrupted PDF files
        }
    }
}