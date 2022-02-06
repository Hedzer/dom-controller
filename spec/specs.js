
const ATTACHED = 'attached';
const DETACHED = 'detached';
const STATUS_ATTR = 'attach-status';
const SLEEP_TIME = 20;

// utility function are at the bottom, hoisted

describe('controller', function() {

	it('should attach controllers on load using an aliased registration', async function() {
		await sleep(SLEEP_TIME);
		expect(statusOf('attach-on-load')).toEqual(ATTACHED);
	});

	it('should attach controllers on load using default registered name', async function() {
		await sleep(SLEEP_TIME);
		expect(statusOf('attach-on-load-no-alias')).toEqual(ATTACHED);
	});

	it('should attach when added after load', async function() {
		const el = document.createElement('div');
		el.setAttribute('controller', 'attach-on-insert');
		document.body.appendChild(el);
		await sleep(SLEEP_TIME);
		expect(statusOf('attach-on-insert')).toEqual(ATTACHED);
	});

	it('should detach when removed', async function() {
		const el = document.createElement('div');
		el.setAttribute('controller', 'detach-when-removed');
		document.body.appendChild(el);
		await sleep(SLEEP_TIME);
		document.body.removeChild(el);
		await sleep(SLEEP_TIME);
		expect(el.getAttribute(STATUS_ATTR)).toEqual(DETACHED);
	});
	
	it('should attach even when using innerHTML to add to an empty element', async function() {
		const main = document.body.querySelector('main');
		main.innerHTML = /* html */`<div controller="attach-on-inner-html"></div>`;
		await sleep(SLEEP_TIME);
		expect(statusOf('attach-on-inner-html')).toEqual(ATTACHED);
	});

	it('should attach even when using innerHTML to swap one element for another', async function() {
		const main = document.body.querySelector('main');
		main.innerHTML = /* html */`<div controller="attach-on-inner-html"></div>`;
		await sleep(SLEEP_TIME);
		main.innerHTML = /* html */`<span controller="attach-on-inner-html"></span>`;
		await sleep(SLEEP_TIME);
		expect(statusOf('attach-on-inner-html')).toEqual(ATTACHED);
	});

	it('should detach even when using innerHTML to swap one element for another', async function() {
		const main = document.body.querySelector('main');
		main.innerHTML = /* html */`<div id="added" controller="attach-on-inner-html"></div>`;
		const added = main.querySelector('#added');
		await sleep(SLEEP_TIME);
		main.innerHTML = /* html */`<span controller="attach-on-inner-html"></span>`;
		await sleep(SLEEP_TIME);
		expect(statusOf(added)).toEqual(DETACHED);
	});

	it('should trigger addition and removal events', async function() {
		let resolvedAttach;
		let errorAttach;
		let addPromise = new Promise((res, rej) => {
			resolvedAttach = res;
			errorAttach = rej;
		});
		
		const main = document.body.querySelector('main');
		setTimeout(() => errorAttach(new Error('Timed out waiting for attach event to trigger')), 100);
		const added = document.createElement('div');
		added.setAttribute('controller', 'attach-on-inner-html');
		added.addEventListener(DomController.EVENT_ATTACHED, (e) => resolvedAttach(e.target));
		main.appendChild(added);
		const addResult = await addPromise;
		expect(statusOf(added)).toEqual(statusOf(addResult));
		
		let resolvedDetach;
		let errorDetach;
		let removePromise = new Promise((res, rej) => {
			resolvedDetach = res;
			errorDetach = rej;
		});
		setTimeout(() => errorDetach(new Error('Timed out waiting for detach event to trigger')), 100);
		added.addEventListener(DomController.EVENT_DETACHED, (e) => resolvedDetach(e.target));
		main.removeChild(added);
		const detachResult = await removePromise;
		expect(statusOf(added)).toEqual(statusOf(detachResult));
	});
	
});


function $(selector) {
	return Array.from(document.querySelectorAll(selector));
}

function $0(selector) {
	return $(selector).at(0);
}

function statusOf(controllerName) {
	const el = typeof controllerName == 'object' ? controllerName : $0(`[controller=${controllerName}]`);
	if (!el) { return; }
	return el.getAttribute(STATUS_ATTR);
}

async function sleep(ms) {
	return new Promise((res, rej) => {
		setTimeout(res, ms);
	});
}