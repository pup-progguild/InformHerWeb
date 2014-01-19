/**
 * Created by Temoto-kun on 14/01/02.
 */

(function(w) {
	w.$(document).foundation();
	var main = $("#main"),
		spacer = $(".spacer");

	function verticalAlignCenter() {
		spacer.css({ height: (innerHeight -main.height()) / 2 + "px" });
	}

	$(w).on("resize", verticalAlignCenter);
	$(w).on("load", verticalAlignCenter);
})(window);
