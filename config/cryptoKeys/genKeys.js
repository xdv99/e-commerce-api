const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// generate key pairs
const keyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// write public key
fs.writeFileSync(path.join(__dirname, "public.pem"), keyPair.publicKey);

// write private key
fs.writeFileSync(path.join(__dirname, "private.pem"), keyPair.privateKey);

console.log("Keys generated successfully");
