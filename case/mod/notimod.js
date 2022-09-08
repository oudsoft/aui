/* notimod.js */

const publicVapidKey = 'BLR1KlwGuN0G6p9dGk7dAXXQyntqZzZO0LKcPsh2MNsd79DBcOAR4EDHuJdXHUC1rHhfSRtLXAIXO7N0OioNUjg';

async function doPushNotification(username, msg) {
	const subscription = await swreg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: utilMod.urlBase64ToUint8Array(publicVapidKey),
	});
	const subendpoint = JSON.stringify(subscription);
	let pushTitle = 'Open Stream Call Center';
	let reqBody = {subscription: subendpoint, username: username, msg: msg, title: pushTitle};
	await fetch('/callcenter/messages', {
		method: 'POST',
		body: JSON.stringify(reqBody),
		headers: {
			'Content-Type': 'application/json',
			'subscription': JSON.stringify(subendpoint)
		},
	});
}

async function triggerPushNotification() {
	const subscription = await swreg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: utilMod.urlBase64ToUint8Array(publicVapidKey),
	});
	const subendpoint = JSON.stringify(subscription);
	let pushTitle = 'Open Stream';
	let msg = 'ขอบคุณที่ยอมรับการแจ้งเตือนจาก Open Stream';
	let reqBody = {subscription: subendpoint, msg: msg, title: pushTitle};
	await fetch('/callcenter/subscribe', {
		method: 'POST',
		body: JSON.stringify(reqBody),
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

module.exports = function ( swReg ) {
	const sw = swReg;
	
	const push = function(message){
		var username = 'openstream';      
		doPushNotification(username, message);
	}

	const triggerPush = function() {
		triggerPushNotification().catch(error => console.error(error));
	}

	return {
		/* const */
		sw,
		/*method*/
		push,
		triggerPush
	}
}