"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
let currentPanel = undefined;
function activate(context) {
    console.log('Unify DevEx Studio VS Code Extension is active!');
    const disposable = vscode.commands.registerCommand('unify.openWalkthrough', () => {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If panel already exists, reveal it
        if (currentPanel) {
            currentPanel.reveal(column);
            sendActiveFileContext(currentPanel);
            return;
        }
        // Create a new webview panel
        currentPanel = vscode.window.createWebviewPanel('unifyWalkthrough', 'Unify DevEx Studio Workspace', column || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        });
        currentPanel.webview.html = getWebviewContent();
        // Send initial active file context when webview is ready
        setTimeout(() => {
            if (currentPanel) {
                sendActiveFileContext(currentPanel);
            }
        }, 1500);
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        }, null, context.subscriptions);
    });
    // Listen for editor selection changes to auto-sync active file context
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && currentPanel) {
            sendActiveFileContext(currentPanel);
        }
    });
    context.subscriptions.push(disposable, editorChangeListener);
}
function sendActiveFileContext(panel) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor)
        return;
    const fullPath = activeEditor.document.fileName;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const relativePath = workspaceFolder
        ? path.relative(workspaceFolder, fullPath)
        : path.basename(fullPath);
    // Post message to Webview iframe
    panel.webview.postMessage({
        type: 'FOCUS_FILE',
        file: relativePath,
        fullPath: fullPath
    });
}
function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unify DevEx Studio</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #050507;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <iframe id="unifyFrame" src="http://localhost:3000/workspace" allow="clipboard-read; clipboard-write; cross-origin-isolated"></iframe>
    <script>
        const vscode = acquireVsCodeApi();
        const iframe = document.getElementById('unifyFrame');

        // Relay messages from VS Code extension to Next.js iframe
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message && iframe.contentWindow) {
                iframe.contentWindow.postMessage(message, '*');
            }
        });
    </script>
</body>
</html>`;
}
function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }
}
//# sourceMappingURL=extension.js.map