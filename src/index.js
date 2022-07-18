import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import { AppProvider } from './state/app.js'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

// Configuration object constructed.
const config = {
    auth: {
        clientId: 'b7da93bc-25db-4dc8-b8a2-96c96ea2ad02',
		redirectUri: "http://localhost:3007",
		postLogoutRedirectUri: "http://localhost:3007",
		scopes: [],
    }
};

// create PublicClientApplication instance
const publicClientApplication = new PublicClientApplication(config);

ReactDOM.render(
	<MsalProvider instance={publicClientApplication}>
		<AppProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AppProvider>
	</MsalProvider>,
	document.getElementById('root')
);
