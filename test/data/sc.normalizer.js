/*global SC, describe, it, expect*/
describe("shortcuts - normalizer", function () {
	"use strict";
	var normalizer = new SC.Normalizer();

	/**
	 * Create fake event object.
	 * @param {number} code
	 * @param {boolean=} ctrl
	 * @param {boolean=} alt
	 * @param {boolean=} shift
	 * @returns {Event}
	 */
	function event(code, ctrl, alt, shift) {
		return /** @type {Event}*/{
			ctrlKey: ctrl,
			altKey: alt,
			shiftKey: shift,
			keyCode: code
		};
	}

	it("normalize shortcut string", function () {
		expect(normalizer.normalize("Ctrl+B")).toBe("ctrl+b");
		expect(normalizer.normalize("Ctrl+Space")).toBe("ctrl+space");
		expect(normalizer.normalize("Alt+Ctrl+B")).toBe("ctrl+alt+b");
		expect(normalizer.normalize("Alt+SHIFT+Ctrl+B")).toBe("ctrl+alt+shift+b");
		expect(normalizer.normalize("+")).toBe("+");
		expect(normalizer.normalize("-")).toBe("-");
		expect(normalizer.normalize("Ctrl+Enter")).toBe("ctrl+return");
		expect(normalizer.normalize("Ctrl+Return")).toBe("ctrl+return");
	});

	it("normalize from event object", function () {
		expect(normalizer.fromEvent(event(32, true))).toBe("ctrl+space");
		expect(normalizer.fromEvent(event(27, true))).toBe("ctrl+esc");
		expect(normalizer.fromEvent(event(66, true))).toBe("ctrl+b");
		expect(normalizer.fromEvent(event(32, true, true))).toBe("ctrl+alt+space");
		expect(normalizer.fromEvent(event(32, true, true, true))).toBe("ctrl+alt+shift+space");
		expect(normalizer.fromEvent(event(107))).toBe("+");
		expect(normalizer.fromEvent(event(187, false, false, true))).toBe("+");
		expect(normalizer.fromEvent(event(109))).toBe("-");
		expect(normalizer.fromEvent(event(189))).toBe("-");
		expect(normalizer.fromEvent(event(188, true))).toBe("ctrl+,");
		expect(normalizer.fromEvent(event(190, true))).toBe("ctrl+.");
		expect(normalizer.fromEvent(event(191, true))).toBe("ctrl+/");
	});
});