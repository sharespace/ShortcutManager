declare module SC {
	class Manager {
		context: IShortcutContext;

		create(context: Object, layer?: Window|Document|Element|string): SC.Manager;

		on(shortcut: string, handler: () => boolean, isDefault?: boolean): void;

		activate(): void;

		deactivate(): void;

		remove(shortcut?: string, handler?: () => void): void;

		debugMode(state: boolean): void;

		event(keyboardEvent: KeyboardEvent): boolean;

		exists(keyboardEvent: string|KeyboardEvent): boolean;

		destroy(): void;
	}
}
// shortcut manager class type shortcut
declare type ShortcutManager = SC.Manager;
// global variable
declare var ShortcutManager: ShortcutManager;