const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');

class FileParserService {
    /**
     * Extracts text from a file based on its mime type or extension
     * @param {string} filePath - Path to the file
     * @param {string} mimeType - Mime type of the file
     * @returns {Promise<string>} - Extracted text
     */
    async extractText(filePath, mimeType) {
        console.log(`📄 Extracting text from: ${filePath} (${mimeType})`);

        try {
            if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
                return await this.parsePdf(filePath);
            } else if (
                mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                filePath.endsWith('.docx') ||
                mimeType === 'application/msword' || 
                filePath.endsWith('.doc')
            ) {
                return await this.parseDocx(filePath);
            } else {
                // Fallback to textract for other formats
                return await this.parseWithTextract(filePath);
            }
        } catch (error) {
            console.error('❌ Text extraction failed:', error);
            return `[Error extracting text: ${error.message}]`;
        }
    }

    async parsePdf(filePath) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        // Clean up text: remove excessive whitespace
        return data.text.replace(/\s+/g, ' ').trim();
    }

    async parseDocx(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value.replace(/\s+/g, ' ').trim();
        } catch (error) {
            console.warn('⚠️ Mammoth failed, trying textract for DOC/DOCX:', error.message);
            return await this.parseWithTextract(filePath);
        }
    }

    async parseWithTextract(filePath) {
        return new Promise((resolve, reject) => {
            textract.fromFileWithPath(filePath, (error, text) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(text.replace(/\s+/g, ' ').trim());
                }
            });
        });
    }
}

module.exports = new FileParserService();
