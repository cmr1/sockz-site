export function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function importRsaKey(pem) {
  const pemParts = pem.split('-----');
  const pemContents = pemParts.slice(2, -2)[0];
  const binaryDerString = window.atob(pemContents);
  const binaryDer = str2ab(binaryDerString);

  return window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["encrypt"]
  );
}

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAoSovo91G2AhCIWSBfe7z
3vjfuKvp+V+qlOPWBo/XZ/mXnjo3E5kEsYbyNi35VVgMBycFiRaCg7EzL3fd7ha/
d7Fv1fpEDJJ3QGst67o7VfheBJ3iCtngibTabvDF4jBPJDinX14pLzthb6Og9d6B
i9O1qybWQU96HgE7DKmV6P8NsXhQkoitEDjB1hto2keZNdo7VydWAaUE48PckHCb
ulEdlQdXWpSBLfaInbfz31z6Ry8ZtX5DfvHhqvkUu/KKj5vzjrWZfgUL2/mPfdAN
rXJCKJMez2SnNlJYE8VrOYz+fxHWpA002fPwzJ5srF5QtGR0+WEjQxHWgKi+w2NJ
o16SCiG1KxPb662EWfm+aVwdRbnHskB7BXOA42Eboz7Jej3uas9SfvQh9jIsUfyu
1b6aywTVrNWbeGEM241OO5MRyY0eM8cvCS81nyttZ0Wj1has+HLJW9qFuNEasWFZ
k4+JnCyjVEB+yCbDK90DVV6KXtjO5ydy0ayfKBkZd4M6tzikJhuBHFyC6iUFDGGw
81tGrWR0C3qe/CuXwnOjLIJhDkixG2V2o2jRuM4opATwzwftKevPS12hoGOQe/aZ
010pABX4dmeaaWKq8n2GW9T/twudFLuXxRTPpUI03amneJ6locHR/xFja4jdj9Hk
mKHTtXqVTmmm9HpY7kMyp0ECAwEAAQ==
-----END PUBLIC KEY-----`;
