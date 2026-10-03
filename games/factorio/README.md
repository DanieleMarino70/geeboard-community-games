# Factorio

Factorio's headless server, from the `factoriotools/factorio` image
([source](https://github.com/factoriotools/factorio-docker)).

| | |
| --- | --- |
| Image | `docker.io/factoriotools/factorio:stable` |
| Digest | `sha256:b4951bbde08f83dbe578b9276eeb350d19ce7263b8427f0acb77dbfe70f0e321`, the image index |
| Game version | 2.0.77 (the image was built 2026-09-22) |
| Digest taken | 2026-10-03 |
| Port | 34197/udp, the game |
| Folder | `/factorio`: saves, configuration, mods |

## What was run

Through a Geeboard 0.6.0 panel, on a node that declared `community-games`, on Docker Desktop (Windows, x64):

- the manifest proposed, read and approved; a server created from it through the wizard;
- the container started, and the game printed `Hosting game at …`, about a second and a half after;
- a command typed in the panel's console (`/players`) answered;
- a backup completed (the manifest asks the panel to type `/server-save` first; whether that command was what
  finished the save was not separately observed);
- the game process killed with a segmentation fault: the panel read it as a crash, restarted the server and sent a webhook;
- the game retired while its server was running: it went on running and could be stopped.

## What was not

- **No client joined**, so the lines that say a player joined or left
  (`[JOIN] … joined the game`, `[LEAVE] … left the game`, the game's documented log format) were never seen
  and the player count is only as good as that format.
- Not run on `arm64`, though the digest is of the index and so holds an `arm64` image.
- Not run on a Linux node, only on Docker Desktop.

## What to know

- **On its first start the game makes a map** called `_autosave1` by itself. **The map preset is read only then**:
  changing *Map preset* later does nothing to a map that exists.
- **Server settings are not in the panel.** Factorio keeps them in `config/server-settings.json`, which Geeboard cannot
  write yet. Edit it in the server's Files tab, with the server stopped: the name, the description, the player limit,
  the game password and whether it is listed.
- **Listing.** The image's default `server-settings.json` asks to be listed publicly. Without a Factorio account
  token the game prints an `Error … Missing token` line about that and goes on hosting; it is not a crash, and the
  manifest's crash pattern is `Factorio crashed`, not `Error`.
- **It stops on `SIGTERM`, saving.** There is no stop command in the manifest for that reason.
- **It talks to the Internet.** On start it contacts `auth.factorio.com` and Factorio's address-discovery servers.
  RCON is opened on 27015 inside the container; the manifest does not publish it.
- Like every container Docker runs, it is root inside its container and reaches what the node's network reaches. See
  [what an image can do](https://github.com/DanieleMarino70/Geeboard/blob/main/docs/community-games.md#what-an-image-can-do).
