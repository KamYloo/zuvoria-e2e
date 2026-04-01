import * as fs from 'fs';
import * as path from 'path';

export function pickNextAvatar(): string {
    const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');
    const stateFile = path.join(fixturesDir, '.last-avatar.txt');

    const avatars = [
        path.join(fixturesDir, 'avatar-test-1.png'),
        path.join(fixturesDir, 'avatar-test-2.png'),
    ];

    const lastUsed = fs.existsSync(stateFile)
        ? fs.readFileSync(stateFile, 'utf-8').trim()
        : '';

    const nextAvatar = lastUsed === avatars[0] ? avatars[1] : avatars[0];

    fs.writeFileSync(stateFile, nextAvatar, 'utf-8');

    return nextAvatar;
}