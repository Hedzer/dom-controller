DomController.registerController(class Test1 {
	attach() { this.element.setAttribute('attach-status', 'attached'); }
	detach() { this.element.setAttribute('attach-status', 'detached'); }
}, 'attach-on-load-no-alias')