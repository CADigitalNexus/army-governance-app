import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import { AppProvider } from './state/app.js'
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from '../authConfig';

// create PublicClientApplication instance
const msalInstance = new PublicClientApplication(msalConfig);

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
