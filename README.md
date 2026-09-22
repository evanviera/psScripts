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

## Install

Keep `vieraLibrary.jsx` beside the other scripts. Copy the collection into Photoshop's `Presets/Scripts` folder and restart Photoshop, or run any entry script with **File > Scripts > Browse**.

These scripts use Photoshop's legacy ExtendScript runtime and avoid modern JavaScript syntax for compatibility.

## Verification

Run the local structural tests with:

```sh
node tests/run-tests.js
```

The tests cover traversal, clipping-stack targeting, reference matching, filename handling, and JavaScript parsing. Destructive pixel operations still require final verification in Photoshop because its document model and Action Manager are not available in Node.js.
