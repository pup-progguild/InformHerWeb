/**
 * Created by Temoto-kun on 14/01/02.
 */

(function(w, $) {
	var panelOption = $("#panel-option"),
		panelAsk = $("#panel-ask"),
		panelRelate = $("#panel-relate"),
		panelShoutout = $("#panel-shoutout"),

		btnAsk = $("#btn-ask"),
		btnRelate = $("#btn-relate"),
		btnShoutout = $("#btn-shoutout"),
		lnkBackToOption = $(".informher-lnk-back-to-option");

	function setTitle(t) {
		$("title").html(t);
	}

	function setVisible(panel, b) {
		panel[!b ? "addClass" : "removeClass"]("hide");
		$(w).trigger("resize");
	}

	function prepareAsk() {
		setVisible(panelOption, false);
		setVisible(panelAsk, true);
		setVisible(panelRelate, false);
		setVisible(panelShoutout, false);
		setTitle("InformHer &mdash; Ask");
	}

	function prepareRelate() {
		setVisible(panelOption, false);
		setVisible(panelAsk, false);
		setVisible(panelRelate, true);
		setVisible(panelShoutout, false);
		setTitle("InformHer &mdash; Relate");
	}

	function prepareShoutout() {
		setVisible(panelOption, false);
		setVisible(panelAsk, false);
		setVisible(panelRelate, false);
		setVisible(panelShoutout, true);
		setTitle("InformHer &mdash; Shout Out");
	}

	function prepareOptionMenu() {
		setVisible(panelOption, true);
		setVisible(panelAsk, false);
		setVisible(panelRelate, false);
		setVisible(panelShoutout, false);
		setTitle("InformHer &mdash; Dashboard");
	}

	(function() {
		btnAsk.click(prepareAsk);
		btnRelate.click(prepareRelate);
		btnShoutout.click(prepareShoutout);
		lnkBackToOption.click(prepareOptionMenu);
	})();
})(window, window.$);
