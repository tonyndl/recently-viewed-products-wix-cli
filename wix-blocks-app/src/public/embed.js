import { fetch } from "wix-fetch";

export async function firstLaunch_p(instance) {
  let appID = "b2f7d72d-6a8a-4dd2-bade-f237268658bc",
    appSecret = "7f60e61f-c76b-401a-80f3-de0fc50578ec";
  const url = "https://www.wixapis.com/oauth2/token";
  const data = {
    grantType: "client_credentials",
    client_id: appID,
    client_secret: appSecret,
    instance_id: instance,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      embed(data.access_token, instance);
    })
    .catch((error) => console.error("Error:", error));
}

async function embed(auth, instance) {
  const url = "https://www.wixapis.com/apps/v1/scripts";
  const data = {
    properties: {
      parameters: { instanceId: instance },
    },
  };
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}
