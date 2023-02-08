import { useEffect, useState } from "react";

import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3AuthCore } from "@web3auth/core";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { UserInfo } from "@web3auth/base";
import "./App.css";
import Web3 from "web3";

const web3auth = new Web3AuthCore({
	clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string,
	web3AuthNetwork: "testnet",
	chainConfig: {
		chainNamespace: CHAIN_NAMESPACES.EIP155, // SOLANA, OTHER
		chainId: "0x5",
	},
});

const openloginAdapter = new OpenloginAdapter({
	adapterSettings: {
		uxMode: "popup",
		loginConfig: {
			jwt: {
				verifier: "mural-web3auth-testnet",
				typeOfLogin: "jwt",
				clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
			},
		},
	},
});

web3auth.configureAdapter(openloginAdapter);

web3auth.init();

function App() {
	const [user, setUser] = useState<Partial<UserInfo> | null>(null);

	const [account, setAccount] = useState("");
	const [balance, setBalance] = useState<string | null>(null);
	const [provider, setProvider] = useState<any>(null);

	const handleConnect = async () => {
		try {
			const provider = await web3auth.connectTo(
				WALLET_ADAPTERS.OPENLOGIN,
				{
					loginProvider: "jwt",
					extraLoginOptions: {
						domain: import.meta.env.VITE_AUTH0_DOMAIN,
						verifierIdField: "sub", // For SMS & Email Passwordless, use "name" as verifierIdField
					},
				}
			);
			setProvider(provider);
			const user = await web3auth.getUserInfo();
			if (user) {
				console.log({ user });
				setUser(user);
			}
		} catch (error) {
			console.log({ error });
			handleLogOut();
		}
	};

	const handleLogOut = async () => {
		try {
			await web3auth.logout();
		} catch (error) {
			console.log({ error });
		} finally {
			setUser(null);
		}
	};

	const getAccounts = async () => {
		if (!provider) {
			console.log("provider not initialized yet");
			return;
		}
		const web3 = new Web3(provider as any);
		const userAccounts = await web3.eth.getAccounts();
		setAccount(userAccounts[0]);
		console.log(userAccounts);
	};

	const getBalance = async () => {
		if (!provider) {
			console.log("provider not initialized yet");
			return;
		}
		const web3 = new Web3(provider as any);
		const accounts = await web3.eth.getAccounts();
		const balance = await web3.eth.getBalance(accounts[0]);
		setBalance(web3.utils.fromWei(balance));
		console.log(web3.utils.fromWei(balance));
	};

	const sendTransaction = async () => {
		if (!provider) {
			console.log("provider not initialized yet");
			return;
		}
		const web3 = new Web3(provider as any);
		const accounts = await web3.eth.getAccounts();

		const txRes = await web3.eth.sendTransaction({
			from: accounts[0],
			to: accounts[0],
			value: web3.utils.toWei("0.0001"),
		});
		console.log({ txRes: txRes });
	};

	useEffect(() => {
		if (provider) {
			getAccounts();
		}
	}, [provider]);

	return (
		<div className="App">
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src="/vite.svg" className="logo" alt="Vite logo" />
				</a>
			</div>
			<h1>Mural Web3Auth Test</h1>
			{user && (
				<div className="card">
					<p>{user.name}</p>
					<p>{user.email}</p>
					<p>ETH account address: {account}</p>
					<p>Balance: {balance}</p>
				</div>
			)}
			<div className="card">
				<button onClick={handleConnect} disabled={!!user}>
					Connect
				</button>
			</div>
			<div className="card">
				<button onClick={sendTransaction} disabled={!user}>
					Send 0.0001
				</button>
				<button onClick={getBalance} disabled={!user}>
					Get Balance
				</button>
			</div>
			<div className="card">
				<button onClick={handleLogOut} disabled={!user}>
					Log Out
				</button>
			</div>
		</div>
	);
}

export default App;
