import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import { AppProvider } from './state/app.js'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig, msalLocalConfig } from '../authConfig';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// create PublicClientApplication instance
let msalInstance
if(process.env.ENV == 'localhost'){
	msalInstance = new PublicClientApplication(msalLocalConfig);
} else {
	msalInstance = new PublicClientApplication(msalConfig);
}

ReactDOM.render(
	
		<AppProvider>
			<BrowserRouter>
				<MsalProvider instance={msalInstance}>
					<App />
				</MsalProvider>
			</BrowserRouter>
		</AppProvider>
	,
	document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();