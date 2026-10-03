# Adding a game

A game here is a folder, `games/<name>/`, with a `manifest.json` and a `README.md`.
`<name>` is the manifest's `id` without `community-`: the id `community-factorio` lives in
`games/factorio/`.

## 1. Find the image

You need an image that **already exists**, on `docker.io` or `ghcr.io` (the registries a
Geeboard workspace allows to begin with). Prefer one that:

- is made by the game's own publisher or by a maintainer who is active and public about how it is built;
- has a published Dockerfile or build, so somebody can read what is in it;
- runs the game server and nothing else, and says where it keeps its world and which ports it opens.

You do not have to host an image. If there is none worth using and you build one, publish it
somewhere public with its source, and say so in the README.

## 2. Get the digest

Use the digest of the image **index**, so a node of any platform pulls what it needs:

```bash
docker buildx imagetools inspect factoriotools/factorio:stable
```

The `Digest: sha256:…` at the top is the one. Write the image as
`docker.io/factoriotools/factorio:stable@sha256:…`: the tag is for reading, the digest is what
runs. Without a digest the checker refuses the manifest, on purpose.

## 3. Write the manifest

Copy `template/manifest.json` to `games/<name>/manifest.json`, or start from a game that is
close to yours, and change it. What each field means, and every rule the checker holds a
manifest to and why, is in
[Geeboard's documentation](https://github.com/DanieleMarino70/Geeboard/blob/main/docs/community-games.md#the-manifest).
The ones that need care:

- **`ports`** — the port the *game* listens on inside the image (`container`), with its protocol.
  Only list what players need; a second port that is only for administration should have `"public": false`.
- **`dataPath`** — where the image keeps the world. The panel backs this folder up, so a world kept anywhere else is not.
- **`config`** — each setting says where it lands: an environment variable, a line in a `properties` or `ini` file, a command-line flag.
  A setting that would be a password has `"secret": true`. **A JSON settings file cannot be written yet**, so
  say in the README how somebody changes one by hand in the server's Files tab.
- **`health`** — the line the game prints when it is ready, and one that means it crashed. Take them from the
  game's real output, not from its documentation.
- **`console`** — how the game is stopped and saved from its console, if it can be, and the lines that say a
  player joined or left. If you have not seen a real client join, say so in the README.

## 4. Check it

```bash
node scripts/check.mjs
```

It runs Geeboard's checker, with the registries a workspace starts with, on every manifest, and
adds this repository's rules. It names a field by its path, `versions[0].image`, and says what is wrong with it.

**Passing is the minimum, not the evidence.** It means the manifest is well formed and safe to put in front
of an owner. It does not mean the digest is of the image you mean, that the image exists, or that the game runs.

## 5. Run it for real

Before asking anybody to merge it:

1. Propose it in a panel, read the approval page as the owner would, and approve it.
2. Create a server from it on a node that declared `community-games`.
3. Watch it reach its ready line. Type a command in the console. Take a backup. Stop it and start it again.
4. If you can, join it with a real client.

## 6. Write the README

`games/<name>/README.md` says, in plain sentences:

- which image, which tag, and the date the digest was taken;
- what was run, on what, and **what was not** (no client joined, never tried on arm64, and so on);
- anything a person has to do by hand;
- what the image is known to do beyond hosting the game — it contacts an account server, it opens a second port, it writes outside its folder.

An honest README is worth more than a long one.

## 7. Open the pull request

The template asks for the above. A maintainer reads the manifest the way an owner would on the
approval page: the image and who makes it, the ports, the environment, what is typed at the console, the
files written, every expression. Two things are asked of every change:

- **A new digest is a new manifest.** Change the folder's `manifest.json` in a pull request of its own, say what
  the new image changes, and update the date in the README. Owners who approved the old one see a new revision.
- **Nothing is removed silently.** A game whose image has gone or turned bad is marked in its README first, and
  the manifest stays until the pull request that removes it says why.

CI runs the same check as `node scripts/check.mjs`. It cannot run the game.
