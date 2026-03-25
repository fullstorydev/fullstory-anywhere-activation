import { execFile } from 'node:child_process';
import { platform } from 'node:os';

const SERVICE = 'com.fullstory.anywhere.cli';

let _available: boolean | undefined;

function exec(cmd: string, args: string[]): Promise<{ code: number; stderr: string; stdout: string }> {
  return new Promise(resolve => {
    execFile(cmd, args, { timeout: 5000 }, (err, stdout, stderr) => {
      resolve({ code: err ? ((err as any).exitCode ?? 1) : 0, stdout, stderr });
    });
  });
}

// ── macOS: `security` CLI ──────────────────────────────────────────────

async function macGet(account: string): Promise<string | null> {
  const { code, stdout } = await exec('security', [
    'find-generic-password', '-s', SERVICE, '-a', account, '-w',
  ]);
  return code === 0 ? stdout.trim() : null;
}

async function macSet(account: string, secret: string): Promise<boolean> {
  // Delete first to avoid "duplicate item" errors, ignore failures
  await exec('security', ['delete-generic-password', '-s', SERVICE, '-a', account]);
  const { code } = await exec('security', [
    'add-generic-password', '-s', SERVICE, '-a', account, '-w', secret, '-U',
  ]);
  return code === 0;
}

async function macDelete(account: string): Promise<boolean> {
  const { code } = await exec('security', ['delete-generic-password', '-s', SERVICE, '-a', account]);
  return code === 0;
}

// ── Linux: `secret-tool` (freedesktop Secret Service) ──────────────────

async function linuxGet(account: string): Promise<string | null> {
  const { code, stdout } = await exec('secret-tool', [
    'lookup', 'service', SERVICE, 'account', account,
  ]);
  return code === 0 && stdout ? stdout.trim() : null;
}

async function linuxSet(account: string, secret: string): Promise<boolean> {
  // secret-tool store reads from stdin
  return new Promise(resolve => {
    const child = execFile('secret-tool', [
      'store', '--label', `${SERVICE}:${account}`, 'service', SERVICE, 'account', account,
    ], { timeout: 5000 }, err => resolve(!err));
    child.stdin?.end(secret);
  });
}

async function linuxDelete(account: string): Promise<boolean> {
  const { code } = await exec('secret-tool', ['clear', 'service', SERVICE, 'account', account]);
  return code === 0;
}

// ── Windows: PowerShell + Credential Manager ───────────────────────────

function psEscape(s: string): string {
  return s.replace(/'/g, "''");
}

async function winGet(account: string): Promise<string | null> {
  const target = `${SERVICE}:${account}`;
  const script = `
    $ErrorActionPreference='Stop'
    $cred=[System.Net.NetworkCredential]::new('',(Get-StoredCredential -Target '${psEscape(target)}').Password)
    $cred.Password
  `.trim();
  const { code, stdout } = await exec('powershell', ['-NoProfile', '-Command', script]);
  return code === 0 && stdout ? stdout.trim() : null;
}

async function winSet(account: string, secret: string): Promise<boolean> {
  const target = `${SERVICE}:${account}`;
  const script = `
    $ErrorActionPreference='Stop'
    if(Get-Module -ListAvailable -Name CredentialManager){Import-Module CredentialManager}else{Install-Module CredentialManager -Scope CurrentUser -Force;Import-Module CredentialManager}
    New-StoredCredential -Target '${psEscape(target)}' -UserName '${psEscape(account)}' -Password '${psEscape(secret)}' -Type Generic -Persist LocalMachine | Out-Null
  `.trim();
  const { code } = await exec('powershell', ['-NoProfile', '-Command', script]);
  return code === 0;
}

async function winDelete(account: string): Promise<boolean> {
  const target = `${SERVICE}:${account}`;
  const script = `Remove-StoredCredential -Target '${psEscape(target)}' -ErrorAction SilentlyContinue`;
  const { code } = await exec('powershell', ['-NoProfile', '-Command', script]);
  return code === 0;
}

// ── Public API ─────────────────────────────────────────────────────────

const os = platform();

/**
 * Returns `true` if the OS keychain is available and responsive.
 * The result is cached after the first probe.
 */
export async function isAvailable(): Promise<boolean> {
  if (_available !== undefined) return _available;

  try {
    // Probe: attempt a read with a key that won't exist — we just care that
    // the command executes without error (exit 0 or "not found" is fine).
    if (os === 'darwin') {
      // Exit code 44 = "item not found" (errSecItemNotFound); some macOS versions return 1
      const { code } = await exec('security', ['find-generic-password', '-s', SERVICE, '-a', '__probe__']);
      _available = code === 0 || code === 44 || code === 1;
    } else if (os === 'linux') {
      const { code } = await exec('which', ['secret-tool']);
      _available = code === 0;
    } else if (os === 'win32') {
      const { code } = await exec('powershell', ['-NoProfile', '-Command', 'Get-Module -ListAvailable -Name CredentialManager']);
      _available = code === 0;
    } else {
      _available = false;
    }
  } catch {
    _available = false;
  }

  return _available;
}

export async function getApiKey(orgId: string): Promise<string | null> {
  if (os === 'darwin') return macGet(orgId);
  if (os === 'linux') return linuxGet(orgId);
  if (os === 'win32') return winGet(orgId);
  return null;
}

export async function setApiKey(orgId: string, apiKey: string): Promise<void> {
  if (os === 'darwin') { await macSet(orgId, apiKey); return; }
  if (os === 'linux') { await linuxSet(orgId, apiKey); return; }
  if (os === 'win32') { await winSet(orgId, apiKey); return; }
}

export async function deleteApiKey(orgId: string): Promise<void> {
  if (os === 'darwin') { await macDelete(orgId); return; }
  if (os === 'linux') { await linuxDelete(orgId); return; }
  if (os === 'win32') { await winDelete(orgId); return; }
}
