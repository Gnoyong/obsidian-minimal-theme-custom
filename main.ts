import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	terminal: boolean;
	selection: boolean;
	embed: string;
	tag: string;
	blockquote: string;
	noWordWrap: boolean;
	blockquoteLang: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	terminal: false,
	selection: false,
	embed: "0",
	tag: "0",
	blockquote: "0",
	noWordWrap: false,
	blockquoteLang: false,
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateStyle() {
		document.body.removeClasses(["mtc-embed-1"]);
		document.body.removeClasses(["mtc-tag-1"]);
		document.body.removeClasses(["mtc-blockquote-1"]);


		document.body.classList.toggle('mtc-code-terminal', this.settings.terminal);
		document.body.classList.toggle('mtc-selection-1', this.settings.selection);
		document.body.classList.toggle('mtc-embed-' + this.settings.embed, this.settings.embed != "0");
		document.body.classList.toggle('mtc-tag-' + this.settings.tag, this.settings.tag != "0");
		document.body.classList.toggle('mtc-blockquote-' + this.settings.blockquote, this.settings.blockquote != "0");
		document.body.classList.toggle('mtc-nowordwrap', this.settings.noWordWrap);
		document.body.classList.toggle('mtc-blockquote-language', this.settings.blockquoteLang);

	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// containerEl.createEl('h2', { text: 'Minimal Theme Custom' });

		new Setting(containerEl)
			.setName('蓝底白字选取样式')
			// .setDesc('开启 bash 代码块的控制台样式')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.selection)
				.onChange(async (value) => {
					this.plugin.settings.selection = value;
					await this.plugin.saveSettings();
					this.plugin.updateStyle();
				}));

		new Setting(containerEl)
			.setName('embed')
			.addDropdown(dropdown => dropdown
				.addOptions({ "0": "默认", "1": "蓝色虚线边框" })
				.setValue(this.plugin.settings.embed)
				.onChange(async (value) => {
					this.plugin.settings.embed = value;
					await this.plugin.saveSettings();
					this.plugin.updateStyle();
				}));

		new Setting(containerEl)
			.setName('标签')
			.addDropdown(dropdown => dropdown
				.addOptions({ "0": "默认", "1": "Github" })
				.setValue(this.plugin.settings.tag)
				.onChange(async (value) => {
					this.plugin.settings.tag = value;
					await this.plugin.saveSettings();
					this.plugin.updateStyle();
				}));

		new Setting(containerEl)
			.setName('引用块')
			.addDropdown(dropdown => dropdown
				.addOptions({ "0": "默认", "1": "样式一" })
				.setValue(this.plugin.settings.blockquote)
				.onChange(async (value) => {
					this.plugin.settings.blockquote = value;
					await this.plugin.saveSettings();
					this.plugin.updateStyle();
				}));

		containerEl.createEl('h3', { text: 'Blockquote' })

		new Setting(containerEl)
			.setName('控制台样式')
			.setDesc('开启 bash 代码块的控制台样式，只在浅色模式下生效')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.terminal)
				.onChange(async (value) => {
					this.plugin.settings.terminal = value;
					this.plugin.updateStyle();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('关闭代码块自动换行')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.noWordWrap)
				.onChange(async (value) => {
					this.plugin.settings.noWordWrap = value;
					this.plugin.updateStyle();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('显示类型')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.blockquoteLang)
				.onChange(async (value) => {
					this.plugin.settings.blockquoteLang = value;
					this.plugin.updateStyle();
					await this.plugin.saveSettings();
				}));
	}
}
