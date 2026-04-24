import * as path from 'jsr:@std/path';

const outDir = 'releases';
const targets = [
	{ target: 'x86_64-pc-windows-msvc', output: 'ask-x86_64-pc-windows-msvc.exe' },
	{ target: 'x86_64-unknown-linux-gnu', output: 'ask-x86_64-unknown-linux-gnu' },
	{ target: 'aarch64-unknown-linux-gnu', output: 'ask-aarch64-unknown-linux-gnu' },
	{ target: 'x86_64-apple-darwin', output: 'ask-x86_64-apple-darwin' },
	{ target: 'aarch64-apple-darwin', output: 'ask-aarch64-apple-darwin' },
];

await Deno.remove(outDir, { recursive: true }).catch((err) => {
	if (!(err instanceof Deno.errors.NotFound)) {
		throw err;
	}
});
await Deno.mkdir(outDir, { recursive: true });

for (const { target, output } of targets) {
	const command = new Deno.Command(Deno.execPath(), {
		args: [
			'compile',
			'--allow-net',
			'--allow-env',
			'--allow-read',
			'--allow-write',
			'--target',
			target,
			'--output',
			path.join(outDir, output),
			'src/index.ts',
		],
		stdout: 'inherit',
		stderr: 'inherit',
	});
	const { code } = await command.output();
	if (code !== 0) {
		Deno.exit(code);
	}
}

await Deno.copyFile('install.sh', path.join(outDir, 'install.sh'));
await Deno.copyFile('uninstall.sh', path.join(outDir, 'uninstall.sh'));
