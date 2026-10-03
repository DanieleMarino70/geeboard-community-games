# Geeboard community games

Manifests for [Geeboard](https://github.com/DanieleMarino70/Geeboard) community games:
a game that nobody on the Geeboard team wrote, written down as one JSON file that names
a container image and says how the panel is to run it.

**A manifest being here is not an approval, and this repository is not a catalogue the
panel reads.** Geeboard never fetches a manifest from an address. You download the file,
and an owner of your panel pastes it in, reads what it would run, and approves it with a
fresh code from their authenticator. What an approved image can do on a node is described,
measured, on
[the Community games page of the documentation](https://github.com/DanieleMarino70/Geeboard/blob/main/docs/community-games.md#what-an-image-can-do).
Read it before approving anything from anywhere, including from here.

## Use one

1. Download `games/<name>/manifest.json`.
2. In your panel: **Games → Community games**, paste it or choose the file. The panel checks
   it and, if it passes, keeps it as a waiting revision. Nothing runs yet.
3. As an owner, open the revision, read it, and approve it with a code. Read the game's own
   `README.md` here too: it says what was tested and what was not.
4. The game is now in the create wizard, labelled *community*, and can be placed **only on a
   node whose machine said it will take one**: `--community-games` on the Linux installer,
   `-CommunityGames` on the Windows one. See
   [Community games → The node](https://github.com/DanieleMarino70/Geeboard/blob/main/docs/community-games.md#the-node).

The digest in a manifest is that of a particular image. When the image's author publishes a
new one, nothing here changes by itself and nothing on your node does either: someone sends
a new manifest with a new digest, and it is a new revision for an owner to read.

## What is here

| Game | Image | Tested | |
| --- | --- | --- | --- |
| [Factorio](games/factorio/) | `docker.io/factoriotools/factorio` | run through a panel to the ready line, console, backup, a crash; no client joined | `community-factorio` |

`template/manifest.json` is a manifest to start from. It passes the checker with a
placeholder image, so it cannot be approved by mistake: its digest is all zeros.

## Add one

[CONTRIBUTING.md](CONTRIBUTING.md) says how, and what is asked of a manifest before it is merged.
In short: an existing public image, its digest, a manifest, the checker, and a real run.

## Check what is here

The checker is Geeboard's own, run on files; it needs a checkout of Geeboard next to this one,
or `GEEBOARD_DIR` pointing at it, with `npm install` run once in its `web` folder:

```bash
node scripts/check.mjs
```

It checks every manifest with the panel's rules and this repository's own: a game's folder is
its id without `community-`, and holds `manifest.json` and a `README.md`; no id is used twice.
CI runs the same, against the Geeboard release named in
[`.github/workflows/check.yml`](.github/workflows/check.yml).
