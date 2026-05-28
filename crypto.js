// ========== CONFIGURAÇÃO DE CRIPTOGRAFIA ==========
// ATENÇÃO: Guarde esta chave em um local seguro!
// Idealmente, use uma variável de ambiente ou gere a partir da senha do usuário
const ENCRYPTION_KEY = 'PromptServicos2024!@#$%Seguro'; // Mude para uma chave forte!

// Função para criptografar dados
function encryptData(data) {
    try {
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Erro ao criptografar:', error);
        return null;
    }
}

// Função para descriptografar dados
function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedString) {
            throw new Error('Falha na descriptografia');
        }
        
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Erro ao descriptografar:', error);
        return null;
    }
}

// ========== CRIPTOGRAFIA DE CAMPOS ESPECÍFICOS ==========
// Para criptografar apenas campos sensíveis (mais eficiente)
function encryptField(value) {
    return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
}

function decryptField(encryptedValue) {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// ========== GERAR CHAVE BASEADA NO USUÁRIO (MAIS SEGURO) ==========
async function getUserEncryptionKey() {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Usar UID + email para gerar chave única por usuário
    const keyBase = user.uid + user.email + ENCRYPTION_KEY;
    return CryptoJS.SHA256(keyBase).toString();
}