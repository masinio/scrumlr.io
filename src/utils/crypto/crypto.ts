export interface JWK {
  jwk: JsonWebKey[];
}

const ENCRYPTION_ALGORITHM: RsaHashedImportParams = {
  name: "RSA-OAEP",
  hash: {name: "SHA-256"},
};

const onStore = (fn_: (store: IDBObjectStore) => void) => {
  const {indexedDB} = window;
  const databaseHandler = indexedDB.open("ScrumlrDB", 1);

  databaseHandler.onupgradeneeded = () => {
    const db = databaseHandler.result;
    db.createObjectStore("ScrumlrObjectStore", {keyPath: "id"});
  };

  databaseHandler.onsuccess = () => {
    const db = databaseHandler.result;
    const tx = db.transaction("ScrumlrObjectStore", "readwrite");
    const store = tx.objectStore("ScrumlrObjectStore");

    fn_(store);

    tx.oncomplete = function () {
      db.close();
    };
  };
};

const generateKeypair = async (extractable = false) => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      ...ENCRYPTION_ALGORITHM,
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    },
    extractable,
    ["encrypt", "decrypt"]
  );
  return keyPair;
};

const exportKeypair = async (keypair: CryptoKeyPair): Promise<JWK> => {
  const publicKey = await window.crypto.subtle.exportKey("jwk", keypair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keypair.privateKey);

  return {
    jwk: [publicKey, privateKey],
  };
};

const importKey = async ({jwk}: JWK, keyOperation: "decrypt" | "encrypt") => {
  const keyData = jwk.find((key) => key.key_ops && key.key_ops.indexOf(keyOperation) >= 0);
  if (keyData) {
    return await window.crypto.subtle.importKey("jwk", keyData, ENCRYPTION_ALGORITHM, false, [keyOperation]);
  }
  throw new Error("JWK does not contain private key");
};
const importPrivateKey = async (jwk: JWK) => importKey(jwk, "decrypt");
const importPublicKey = async (jwk: JWK) => importKey(jwk, "encrypt");

let publicKey: CryptoKey | null = null;
let privateKey: CryptoKey | null = null;

const importKeypair = async (jwk: JWK) => {
  publicKey = await importPublicKey(jwk);
  privateKey = await importPrivateKey(jwk);

  onStore((store) => {
    store.put({id: 1, publicKey, privateKey});
  });
};

export const initializeNewKeypair = async () => {
  const keypair = await generateKeypair(true);
  const jwk = await exportKeypair(keypair);
  await importKeypair(jwk);
};

export const loadKeypair = async () => new Promise((resolve, reject) => {
    if (!publicKey && !privateKey) {
      onStore((store) => {
        const keyData = store.get(1);
        keyData.onsuccess = () => {
          publicKey = keyData.result.publicKey;
          privateKey = keyData.result.privateKey;
          resolve(true);
        };
        keyData.onerror = () => {
          reject(false);
        };
      });
    }
    resolve(true);
  });

const encrypt = async (data: any) => {
  if (!publicKey) {
    throw new Error("Keypair not loaded yet");
  }
  return window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    data
  );
};

const decrypt = async (data: any) => {
  if (!privateKey) {
    throw new Error("Keypair not loaded yet");
  }
  return window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    data
  );
};

const test = async () => {
  await initializeNewKeypair();
  await loadKeypair();

  const encrypted = encrypt("test");
  const decrypted = decrypt(encrypted);

  return decrypted;
};

export default test;
