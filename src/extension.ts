'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var crypto = require('crypto');

var AllHashes = crypto.getHashes();
AllHashes.push('base64:encoded');
AllHashes.push('base64:decoded');
AllHashes = AllHashes.sort();
const CommandDefinitions = [];

for (var index = 0; index < AllHashes.length; index++) {
    var CommandLabel = AllHashes[index].replace(/[^a-zA-Z0-9-]/, '-');
    var CommandDescription = 'Generates ' + ((['a', 'e', 'i', 'o', 'u'].indexOf(CommandLabel[0]) != -1) ? 'an' : 'a') + ' ' + CommandLabel + ' string.';
    CommandDefinitions.push({ label: CommandLabel, description: CommandDescription })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    vscode.commands.registerCommand('extension.cryptnow.commands', CryptoCommands);

    for (var index = 0; index < AllHashes.length; index++) {
        var CommandLabel = AllHashes[index].replace(/[^a-zA-Z0-9-]/, '-');
        vscode.commands.registerCommand('extension.cryptnow.' + CommandLabel, () => RunCommand(CommandLabel));
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.cryptnow', () => {
        // The code you place here will be executed every time your command is executed

        vscode.commands.executeCommand('extension.cryptnow.commands');
    });

    context.subscriptions.push(disposable);
}

function CryptoCommands() {
    const opts: vscode.QuickPickOptions = { matchOnDescription: true, placeHolder: 'Select hash or encoding method?' };
    const items: vscode.QuickPickItem[] = CommandDefinitions.map(c => ({
        label: c.label,
        description: c.description
    }));

    vscode.window.showQuickPick(items)
        .then(command => RunCommand(command.label));
}

function RunCommand(CommandLabel: string) {
    var Editor = vscode.window.activeTextEditor;

    if (!Editor) return;

    var Selection = Editor.selection;
    if (Selection.isEmpty) return;

    var SelectedText = Editor.document.getText(Selection);

    var Output = null;

    if (/^base64.*$/.test(CommandLabel)) {
        if (CommandLabel[7] == 'e') Output = (new Buffer(SelectedText).toString('base64'));
        else Output = (new Buffer(SelectedText, 'base64').toString('ascii'));
    }
    else Output = crypto.createHash(CommandLabel).update(SelectedText).digest('hex');

    Editor.edit(editBuilder => {
        editBuilder.replace(Selection, SelectedText + " : " + Output);
    });

}

// this method is called when your extension is deactivated
export function deactivate() {
}