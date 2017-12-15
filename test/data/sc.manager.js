/*global ShortcutManager, describe, it, expect, beforeEach, jasmine*/
describe("shortcuts - manager", function () {
	"use strict";

	var handlers = jasmine.createSpyObj("handlers", ["one", "two", "three", "four"]),
		context1 = {context: 1},
		context2 = {context: 2},
		context3 = {context: 3},
		shortcutManagerOne = ShortcutManager.create(context1),
		shortcutManagerTwo = ShortcutManager.create(context2),
		shortcutManagerLayer = ShortcutManager.create(context3, "testLayer"),
		shortcuts = {
			"Ctrl+B": event(66, true),
			"Ctrl+C": event(67, true),
			"Ctrl+0": event(48, true),
			"Ctrl+1": event(49, true),
			"Ctrl+2": event(50, true),
			"Ctrl+3": event(51, true),
			"Ctrl+4": event(52, true),
			"Ctrl+5": event(53, true)
		};

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

	/**
	 * Simulate fire event
	 * @param {*} manager
	 * @param {Event} shortcut
	 */
	function simulateFire(manager, shortcut) {
		manager.event(shortcut);
	}

	beforeEach(function () {
		//reset calls for spy functions
		/** @namespace handlers.one */
		handlers.one.calls.reset();
		/** @namespace handlers.two */
		handlers.two.calls.reset();
		/** @namespace handlers.three */
		handlers.three.calls.reset();
		/** @namespace handlers.four */
		handlers.four.calls.reset();

		//remove all shortcuts (called on static instance)
		ShortcutManager.destroy();
	});

	it("register and fire shortcut", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one).toHaveBeenCalled();
	});

	it("register and fire regex shortcut", function () {
		shortcutManagerOne.on("Ctrl+[0..3]", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+2"]);
		expect(handlers.one).toHaveBeenCalledTimes(1);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+2", 2, 0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+0"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+0", 0, 0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+4"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
	});

	it("register and fire multiple shortcut", function () {
		shortcutManagerOne.on("Ctrl+B, Ctrl+C", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one).toHaveBeenCalledTimes(1);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+b", -1, -1);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+C"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+c", -1, -1);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+0"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
	});

	it("register and fire multiple shortcut with regex", function () {
		shortcutManagerOne.on("Ctrl+B, Ctrl+[0..2]", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+C"]);
		expect(handlers.one).not.toHaveBeenCalled();

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one).toHaveBeenCalledTimes(1);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+b", -1, -1);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+0"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+0", 0, 0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+2"]);
		expect(handlers.one).toHaveBeenCalledTimes(3);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+2", 2, 0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+5"]);
		expect(handlers.one).toHaveBeenCalledTimes(3);
	});

	it("register and fire regex shortcut not from zero", function () {
		shortcutManagerOne.on("Ctrl+[2..4]", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+2"]);
		expect(handlers.one).toHaveBeenCalledTimes(1);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+2", 2, 2);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+3"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
		expect(handlers.one).toHaveBeenCalledWith("ctrl+3", 3, 2);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+5"]);
		expect(handlers.one).toHaveBeenCalledTimes(2);
	});

	it("register and fire different shortcut", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+C"]);
		expect(handlers.one).not.toHaveBeenCalled();
	});

	it("un register and fire shortcut", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerOne.remove("Ctrl+B", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one).not.toHaveBeenCalled();
	});

	it("un register and fire regex shortcut", function () {
		shortcutManagerOne.on("Ctrl+[0..3]", handlers.one);
		shortcutManagerOne.remove("Ctrl+[0..3]", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+0"]);
		simulateFire(shortcutManagerOne, shortcuts["Ctrl+1"]);
		simulateFire(shortcutManagerOne, shortcuts["Ctrl+2"]);
		simulateFire(shortcutManagerOne, shortcuts["Ctrl+3"]);
		expect(handlers.one).not.toHaveBeenCalled();
	});

	it("register two handlers on same shortcut and fire", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerOne.on("Ctrl+B", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one).toHaveBeenCalled();
		expect(handlers.two).toHaveBeenCalled();
	});

	it("register two handlers on different shortcut and fire", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerOne.on("Ctrl+C", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+C"]);
		expect(handlers.one.calls.count()).toEqual(1); //still one call
		expect(handlers.two.calls.count()).toEqual(1); //one more call
	});

	it("remove shortcut by name and handler", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerOne.on("Ctrl+B", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);

		shortcutManagerOne.remove("Ctrl+B", handlers.one);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1); //still one call
		expect(handlers.two.calls.count()).toEqual(2); //one more call
	});

	it("remove shortcut by name", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerOne.on("Ctrl+B", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);

		shortcutManagerOne.remove("Ctrl+B");

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1); //still one call
		expect(handlers.two.calls.count()).toEqual(1); //still one call
	});

	it("call shortcuts from different contexts", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerTwo.on("Ctrl+B", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);
	});

	it("call different shortcuts from different contexts", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerTwo.on("Ctrl+C", handlers.two);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(0);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+C"]);
		expect(handlers.one.calls.count()).toEqual(1); //still one call
		expect(handlers.two.calls.count()).toEqual(1); //one more call
	});

	it("remove shortcuts by context (destroy)", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerTwo.on("Ctrl+B", handlers.two);
		shortcutManagerOne.on("Ctrl+B", handlers.three);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);
		expect(handlers.three.calls.count()).toEqual(1);

		shortcutManagerOne.destroy();

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(2); //one more call
		expect(handlers.three.calls.count()).toEqual(1);
	});

	it("remove shortcuts by context (empty remove)", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerTwo.on("Ctrl+B", handlers.two);
		shortcutManagerOne.on("Ctrl+B", handlers.three);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);
		expect(handlers.three.calls.count()).toEqual(1);

		shortcutManagerOne.remove();

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(2); //one more call
		expect(handlers.three.calls.count()).toEqual(1);
	});

	it("remove all shortcuts in all contexts", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);
		shortcutManagerTwo.on("Ctrl+B", handlers.two);
		shortcutManagerOne.on("Ctrl+B", handlers.three);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1);
		expect(handlers.three.calls.count()).toEqual(1);

		ShortcutManager.destroy();

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		expect(handlers.one.calls.count()).toEqual(1);
		expect(handlers.two.calls.count()).toEqual(1); //one more call
		expect(handlers.three.calls.count()).toEqual(1);
	});

	it("call handler order without default", function () {
		var handlerOne = /** @type {Function}*/jasmine.createSpy("handlerOne"),
			handlerTwo = /** @type {Function}*/jasmine.createSpy("handlertwo"),
			order = [];

		handlerOne.and.callFake(function () {
			order.push(handlerOne);
		});

		handlerTwo.and.callFake(function () {
			order.push(handlerTwo);
		});

		shortcutManagerOne.on("Ctrl+B", handlerOne);
		shortcutManagerOne.on("Ctrl+B", handlerTwo);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);

		expect(order[0]).toEqual(handlerTwo);
		expect(order[1]).toEqual(handlerOne);
	});

	it("call handler order with default", function () {
		var handlerOne = /** @type {Function}*/jasmine.createSpy("handlerOne"),
			handlerTwo = /** @type {Function}*/jasmine.createSpy("handlertwo"),
			handlerThree = /** @type {Function}*/jasmine.createSpy("handlerthree"),
			order = [];

		handlerOne.and.callFake(function () {
			order.push(handlerOne);
		});

		handlerTwo.and.callFake(function () {
			order.push(handlerTwo);
		});

		handlerThree.and.callFake(function () {
			order.push(handlerThree);
		});

		shortcutManagerOne.on("Ctrl+B", handlerOne);
		shortcutManagerOne.on("Ctrl+B", handlerTwo, true); //default
		shortcutManagerOne.on("Ctrl+B", handlerThree);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);

		expect(order[0]).toEqual(handlerThree);
		expect(order[1]).toEqual(handlerOne);
		expect(order[2]).toEqual(handlerTwo); //defalt is the last one
	});

	it("stop call handler queue when handler returns true", function () {
		var handlerOne = /** @type {Function}*/jasmine.createSpy("handlerOne"),
			handlerTwo = /** @type {Function}*/jasmine.createSpy("handlertwo"),
			handlerThree = /** @type {Function}*/jasmine.createSpy("handlerthree");

		handlerTwo.and.callFake(function () {
			return true;
		});

		shortcutManagerOne.on("Ctrl+B", handlerOne);
		shortcutManagerOne.on("Ctrl+B", handlerTwo);
		shortcutManagerOne.on("Ctrl+B", handlerThree);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);

		expect(handlerOne.calls.count()).toEqual(0); //first handler does not called, bcs of second returned true value
		expect(handlerTwo.calls.count()).toEqual(1);
		expect(handlerThree.calls.count()).toEqual(1);
	});

	it("try if registered shortcut exists", function () {
		shortcutManagerOne.on("Ctrl+B", handlers.one);

		expect(shortcutManagerOne.exists("ctrl+b")).toBe(true); //already normalized
		expect(shortcutManagerOne.exists("Ctrl+B")).toBe(true); //not normalized
		expect(shortcutManagerOne.exists("Ctrl+C")).toBe(false);
	});

	it("usage of layers - create scm with layer", function () {
		expect(function () {
			ShortcutManager.create("ctx1", "layer1");
		}).not.toThrow();
		expect(function () {
			ShortcutManager.create("ctx3", document);
		}).not.toThrow();
		expect(function () {
			ShortcutManager.create("ctx4", window);
		}).not.toThrow();
		expect(function () {
			ShortcutManager.create("ctx2", document.body);
		}).not.toThrow();
		expect(function () {
			ShortcutManager.create("ctx5", document.createElement("div"));
		}).not.toThrow();
	});

	it("usage of layers - shortcuts", function () {
		var handlerOne = /** @type {Function}*/jasmine.createSpy("handlerOne"),
			handlerTwo = /** @type {Function}*/jasmine.createSpy("handlerTwo"),
			order = [];

		handlerOne.and.callFake(function () {
			order.push(handlerOne);
		});

		handlerTwo.and.callFake(function () {
			order.push(handlerTwo);
		});

		shortcutManagerOne.on("Ctrl+B", handlerOne);
		shortcutManagerLayer.on("Ctrl+B", handlerTwo);

		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		shortcutManagerLayer.activate();
		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);
		shortcutManagerLayer.deactivate();
		simulateFire(shortcutManagerOne, shortcuts["Ctrl+B"]);

		expect(order.length).toBe(3);
		expect(order[0]).toBe(handlerOne);
		expect(order[1]).toBe(handlerTwo);
		expect(order[2]).toBe(handlerOne);
	});

	it("usage of layers - error states", function () {
		var errors = [];

		try {
			shortcutManagerOne.deactivate();
		} catch (ex) {
			errors.push(ex);
		}

		try {
			shortcutManagerLayer.deactivate();
		} catch (ex) {
			errors.push(ex);
		}

		expect(errors.length).toBe(2);
		expect(errors[0]).toBe("ShortcutManager: Can not deactivate main layer. This is invalid call of deactivate method.");
		expect(errors[1]).toBe("ShortcutManager: Can not deactivate layer because is not an active layer.");
	});
});