/*global ShortcutManager, describe, it, expect, beforeEach, jasmine*/
describe("shortcuts - manager", function () {
	"use strict";

	var handlers = jasmine.createSpyObj("handlers", ["one", "two", "three", "four"]),
		context1 = {context: 1},
		context2 = {context: 2},
		shortcutManagerOne = ShortcutManager.create(context1),
		shortcutManagerTwo = ShortcutManager.create(context2),
		shortcuts = {
			"Ctrl+B": event(66, true),
			"Ctrl+C": event(67, true)
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
		manager.handleByKeyEvent(shortcut);
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
});