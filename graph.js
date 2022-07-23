import { graphConfig } from "./authConfig";

/**
 * Attaches a given access token to a Microsoft Graph API call. Returns information about the user
 */
export async function callMsGraph(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMeEndpoint, options)
        .then(response => {
            console.log('first response', response)
            return response.json()
        }).then(function(myData) {
            let personData = myData
            console.log('personData', personData)
            return personData
        })
        .catch(error => console.log(error));
}

export async function callMsGraphPhoto(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(graphConfig.graphMePhotoEndpoint, options)
        .then(response => {
            console.log('response', response)
            return response.blob()
        }).then(function(myBlob) {
            let objectURL = URL.createObjectURL(myBlob);
            return objectURL
        })
        .catch(error => console.log(error));
}

export async function callMsGraphCalendar(accessToken) {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    let result
    try{
        result = await fetch(graphConfig.graphMeCalendarEndpoint, options)
    } catch (err) {
        console.log('error getting calendar', err)
    }

    return result
}