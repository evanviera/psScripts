# Viera Photoshop Scripts

A refactored collection of Photoshop ExtendScript (`.jsx`) utilities for layer-heavy illustration and compositing work.

## Scripts

- **Bake Selected Layer** bakes the selected layer into visible pixel layers below it. A clipped source is baked through its clipping stack, including the base layer. A hidden `PROOF` layer preserves the original visible composite.
- **Convert RGB to Mask** isolates the selected layer and converts the union of its red, green, and blue intensities into a user mask.
- **Crop Layers to Group Mask** permanently clears pixels outside a selected group's layer mask on every nested pixel layer.
- **Cryptomatte to Layered PSD** converts EXR-IO unpacked `Crypto` layers into masked copies of the top-level `Combined.RGBA` layer.
- **Organize Folders** applies repeating label colors to nested groups.
- **Organize Folders and Rename** also assigns `GRP_0`, `GRP_1`, and per-parent `LYR_0`, `LYR_1` names. Branches beginning with `_REF_` are preserved.
- **Export Top-level Layer Sets** exports masked top-level groups to `PNG/<document name>/`. Groups beginning with `_REF_` are ignored.
- **Inspect Current Layer** displays useful diagnostic information about the current layer.
- **Toggle Current Layer** toggles the selected layer.
- **Toggle Reference Layers** recursively hides all visible `_REF_` layers, or shows them all when none are visible.

## Install and use

The whole repository is linked into Photoshop 2026's Scripts directory on this Mac:

```sh
sudo ln -s /Volumes/Drive/Github/psScripts '/Applications/Adobe Photoshop 2026/Presets/Scripts/psScripts'
```

The folder link is already installed. Restart Photoshop to discover added scripts or changes to their menu metadata. Edits to script behavior are read directly from this repository when the command runs. The ten commands appear together near the bottom of **Filter** in a `Viera` category group. Photoshop's legacy category groups commands in the menu but does not create a submenu. `vieraLibrary.jsxinc` is a shared include, not a runnable command. A Photoshop upgrade may require recreating the link for that version's `Presets/Scripts` folder.

When adding a script, place its `.jsx` file at the repository root and give it the same `<javascriptresource>` header and shared-library include as the existing scripts. Set `<menu>filter</menu>` and `<category>Viera</category>` in its header, then restart Photoshop.

To run a script without installing menu entries, choose **File > Scripts > Browse** and select an entry script from this repository.

These scripts use Photoshop's legacy ExtendScript runtime and avoid modern JavaScript syntax for compatibility.

## Verification

Run the local structural tests with:

```sh
node tests/run-tests.js
```

The tests cover traversal, clipping-stack targeting, reference matching, filenames, menu resource syntax, and JavaScript parsing. Photoshop 2026 has been checked to show all ten entries in Filter, and **Inspect Current Layer** ran on a disposable RGB document. Destructive pixel operations still require verification in Photoshop because its document model and Action Manager are not available in Node.js.
