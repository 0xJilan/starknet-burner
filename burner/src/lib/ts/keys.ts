import { ec } from 'starknet';
import { toBN } from 'starknet/utils/number';
import type { Txn } from '$lib/ts/txns';
import { wallet, renewSessionKey } from '$lib/stores/wallet';
import { burner, setState } from '$lib/stores/burner';
export const loadKeys = () => {
	let sessPrivateKey = localStorage.getItem('bwpk');
	if (!sessPrivateKey || sessPrivateKey === '') {
		renewSessionKey();
		setState('keys');
		burner.update((data) => ({
			...data,
			isLoggedIn: true
		}));
		return;
	}
	let keypair = ec.getKeyPair(toBN(sessPrivateKey));
	let sessPublicKey = ec.getStarkKey(keypair);
	let bwtk = localStorage.getItem('bwtk');
	if (!bwtk || bwtk === '') {
		wallet.update((data) => {
			let token = {
				sessionkey: sessPublicKey as string,
				expires: 0,
				token: ['', ''],
				account: ''
			};
			return {
				...data,
				token
			};
		});
		burner.update((data) => ({
			...data,
			isLoggedIn: true
		}));
		return;
	}
	let tokenData = JSON.parse(bwtk);
	let bwtx = localStorage.getItem('bwtx');
	let history: Txn[] = [];
	if (bwtx && bwtx !== '') {
		let historyData: string[] = JSON.parse(bwtx);
		history = historyData.map((data) => ({ hash: data, status: 'unknown', block: 0 }));
	}
	wallet.update((data) => {
		let token = {
			sessionkey: sessPublicKey as string,
			account: tokenData.account,
			expires: tokenData.expires,
			token: tokenData.token
		};
		return {
			...data,
			token,
			history
		};
	});
	burner.update((data) => ({
		...data,
		isLoggedIn: true
	}));
	return;
};

export const genKey = () => {
	const keypair = ec.genKeyPair();
	const privateKey = keypair.getPrivate();
	const publicKey = ec.getStarkKey(keypair);
	return [privateKey, publicKey];
};
