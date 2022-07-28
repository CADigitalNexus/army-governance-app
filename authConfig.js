
export const msalConfig = {
    auth: {
      clientId: "b7da93bc-25db-4dc8-b8a2-96c96ea2ad02",
      authority: "https://login.microsoftonline.com/de0d2b78-9d6b-4c0f-a3a0-42271ce9bb8b", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: "https://localhost:3007",
      postLogoutRedirectUri: "https://localhost:3007"
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };

export const msalLocalConfig = {
  auth: {
    clientId: "b7da93bc-25db-4dc8-b8a2-96c96ea2ad02",
    authority: "https://login.microsoftonline.com/de0d2b78-9d6b-4c0f-a3a0-42271ce9bb8b", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: "http://localhost:3007",
    postLogoutRedirectUri: "http://localhost:3007"
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read", "openid", "profile", "calendars.read"]
  };

  let start_datetime = new Date()
  console.log('start_datetime', start_datetime)
  let start = start_datetime.toISOString()
  console.log('start', start)
  let end_datetime = start_datetime.setDate(start_datetime.getDate() + 30)
  console.log('end_datetime', end_datetime)
  let anotherDate = new Date(end_datetime)
  console.log('another date', anotherDate)
  let end = anotherDate.toISOString()
  console.log('end', end)

  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
      graphMePhotoEndpoint: "https://graph.microsoft.com/v1.0/me/photos/48x48/$value",
      graphMeCalendarEndpoint: `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start}&endDateTime=${end}`,
  };