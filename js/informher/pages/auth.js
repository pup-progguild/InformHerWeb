/**
 * Created by Temoto-kun on 14/01/02.
 */

(function(w, $) {
	var panelAuth = $("#panel-auth"),
		panelLogin = $("#panel-login"),
		panelRegister = $("#panel-register"),

		btnLogin = $("#btn-login"),
		btnRegister = $("#btn-register"),
		lnkBackToAuth = $(".informher-lnk-back-to-auth");

	function setVisible(panel, b) {
		panel[!b ? "addClass" : "removeClass"]("hide");
		$(w).trigger("resize");
	}

	function prepareLoginMenu() {
		setVisible(panelAuth, false);
		setVisible(panelLogin, true);
		setVisible(panelRegister, false);
	}

	function prepareRegisterMenu() {
		setVisible(panelAuth, false);
		setVisible(panelLogin, false);
		setVisible(panelRegister, true);
	}

	function prepareAuthMenu() {
		setVisible(panelAuth, true);
		setVisible(panelLogin, false);
		setVisible(panelRegister, false);
	}

	(function() {
		btnLogin.click(prepareLoginMenu);
		btnRegister.click(prepareRegisterMenu);
		lnkBackToAuth.click(prepareAuthMenu);
	})();
})(window, window.$);
