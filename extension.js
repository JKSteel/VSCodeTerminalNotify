const vscode = require('vscode');
const { execFile } = require('child_process');

function escapePs(str) {
  return str.replace(/'/g, "''");
}

function notify(title, body) {
  const script = `Import-Module BurntToast; New-BurntToastNotification -Text '${escapePs(title)}','${escapePs(body)}'`;
  execFile('pwsh', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', script], () => {});
}

function activate(context) {
  const output = vscode.window.createOutputChannel('Terminal Notify');
  output.appendLine('Terminal Notify activated.');

  const disposable = vscode.window.onDidEndTerminalShellExecution((event) => {
    output.appendLine(`Shell execution ended. focused=${vscode.window.state.focused}, exitCode=${event.exitCode}, command=${event.execution.commandLine.value}`);

    if (vscode.window.state.focused) {
      return;
    }

    const commandLine = event.execution.commandLine.value.trim();
    if (!commandLine) {
      return;
    }

    const shortCommand = commandLine.length > 60 ? commandLine.slice(0, 60) + '…' : commandLine;
    const status = event.exitCode === 0 ? 'Finished' : `Failed (exit ${event.exitCode})`;
    notify(status, shortCommand);
  });

  context.subscriptions.push(disposable, output);
}

function deactivate() {}

module.exports = { activate, deactivate };
