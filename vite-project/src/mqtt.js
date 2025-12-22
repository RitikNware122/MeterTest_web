import mqtt from "mqtt";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";

const REGION = "ap-south-1";
const IOT_ENDPOINT = "ar7fthu9bpn11-ats.iot.ap-south-1.amazonaws.com";
const IDENTITY_POOL_ID = "ap-south-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"; // 🔴 replace

async function getSignedUrl() {
  const credentials = await fromCognitoIdentityPool({
    identityPoolId: IDENTITY_POOL_ID,
    clientConfig: { region: REGION }
  })();

  const signer = new SignatureV4({
    credentials,
    region: REGION,
    service: "iotdevicegateway",
    sha256: Sha256
  });

  const request = {
    method: "GET",
    protocol: "wss:",
    hostname: IOT_ENDPOINT,
    path: "/mqtt",
    headers: {
      host: IOT_ENDPOINT
    }
  };

  return signer.presign(request).then(r =>
    `wss://${IOT_ENDPOINT}${r.path}?${new URLSearchParams(r.query).toString()}`
  );
}

export async function createMqttClient() {
  const url = await getSignedUrl();

  return mqtt.connect(url, {
    clientId: "react-gateway-" + Math.random().toString(16).slice(2),
    protocol: "wss",
    keepalive: 60,
    reconnectPeriod: 3000,
    clean: true
  });
}
