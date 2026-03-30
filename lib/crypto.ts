/**
 * Sanctuary Cryptography Utility (Web Crypto API + IndexedDB)
 * Optimized Hybrid E2EE Implementation (AES-256-GCM + RSA-OAEP)
 * Compatibility version for existing keys.
 */

const DB_NAME = "sanctuary-crypto-v2";
const STORE_NAME = "secure-vault";

let keyGenPromise: Promise<string> | null = null;

// --- IndexedDB Management ---
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getLocalKeyPair(userId: string): Promise<{ privateKey: CryptoKey, publicKey: string } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(userId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function saveLocalKeyPair(userId: string, privateKey: CryptoKey, publicKey: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ privateKey, publicKey }, userId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Key Management ---
export async function ensureKeys(userId: string): Promise<string> {
  if (keyGenPromise) return keyGenPromise;

  keyGenPromise = (async () => {
    try {
      const existing = await getLocalKeyPair(userId);
      if (existing) return existing.publicKey;

      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"] // Standard usages for maximum compatibility
      );

      const exportedPublic = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const publicKeyStr = JSON.stringify(exportedPublic);
      
      await saveLocalKeyPair(userId, keyPair.privateKey, publicKeyStr);
      return publicKeyStr;
    } finally {
      keyGenPromise = null;
    }
  })();

  return keyGenPromise;
}

export async function importPublicKey(jwkString: string): Promise<CryptoKey> {
  try {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"] // Standard usage is most compatible
    );
  } catch (e: any) {
    throw new Error(`Public Key Invalid: ${e.message}`);
  }
}

// --- Hybrid Encryption ---

export async function encryptMessage(
  content: string,
  recipientPublicKeyJwk: string,
  senderPublicKeyJwk: string
) {
  try {
     // 1. Generate random AES key for payload
     const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
     );

     const iv = window.crypto.getRandomValues(new Uint8Array(12));
     const encodedContent = new TextEncoder().encode(content);
     const ciphertextBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as any } as any,
        aesKey,
        encodedContent as any
     );

     // 2. Export AES key to encrypt it asymmetrically (Hybrid Pattern)
     const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

     // 3. Encrypt AES key for Recipient
     const recipientKey = await importPublicKey(recipientPublicKeyJwk);
     const wrappedForRecipient = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        recipientKey,
        rawAesKey as any
     );

     // 4. Encrypt AES key for Sender
     const senderKey = await importPublicKey(senderPublicKeyJwk);
     const wrappedForSender = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderKey,
        rawAesKey as any
     );

     return {
        ciphertext: b64Encode(ciphertextBuffer),
        encryptedKey: b64Encode(wrappedForRecipient),
        senderEncryptedKey: b64Encode(wrappedForSender),
        iv: b64Encode(iv),
     };
  } catch (e: any) {
     console.error("Encryption stage failure:", e);
     throw new Error(`Encryption Failed: ${e.message}`);
  }
}

// --- Hybrid Decryption ---

export async function decryptMessage(
  ciphertext: string,
  wrappedAesKey: string,
  iv: string,
  userId: string
): Promise<string> {
  const localData = await getLocalKeyPair(userId);
  if (!localData) throw new Error("Local secure key missing. Please refresh.");

  const privateKey = localData.privateKey;

  try {
    // 1. Decrypt AES key with RSA private key
    const wrappedKeyBuffer = b64Decode(wrappedAesKey);
    const aesKeyRaw = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      wrappedKeyBuffer as any
    );

    // 2. Import recovered AES key
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      aesKeyRaw as any,
      { name: "AES-GCM" } as any,
      false,
      ["decrypt"]
    );

    // 3. Decrypt payload
    const ciphertextBuffer = b64Decode(ciphertext);
    const ivBuffer = b64Decode(iv);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer as any } as any,
      aesKey,
      ciphertextBuffer as any
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e: any) {
    console.error("Decryption stage failure:", e);
    throw new Error(`Decryption Failed: ${e.message}`);
  }
}

// --- Helpers ---
function b64Encode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function b64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
