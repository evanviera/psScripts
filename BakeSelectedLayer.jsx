/*
<javascriptresource>
<name>Bake Selected Layer</name>
<about>Bakes the selected layer into the visible pixel layers below it while preserving the layer structure. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

function captureBakeClipping(parent, selectedLayer, output) {
    var index;
    var layer;
    for (index = 0; index < parent.layers.length; index += 1) {
        layer = parent.layers[index];
        if (layer.typename === "LayerSet") {
            captureBakeClipping(layer, selectedLayer, output);
        } else if (layer !== selectedLayer) {
            output.push({ layer: layer, grouped: layer.grouped });
        }
    }
}

function replaceBakeClippingLayer(snapshot, original, replacement) {
    var index;
    for (index = 0; index < snapshot.length; index += 1) {
        if (snapshot[index].layer === original) {
            snapshot[index].layer = replacement;
            return;
        }
    }
    throw new Error("Could not track the baked replacement for " + original.name + ".");
}

function restoreBakeClipping(snapshot) {
    var index;
    var entry;
    for (index = snapshot.length - 1; index >= 0; index -= 1) {
        entry = snapshot[index];
        if (!entry.grouped && entry.layer.grouped) {
            entry.layer.grouped = false;
        }
    }
    for (index = snapshot.length - 1; index >= 0; index -= 1) {
        entry = snapshot[index];
        if (entry.grouped && !entry.layer.grouped) {
            entry.layer.grouped = true;
        }
    }
    for (index = 0; index < snapshot.length; index += 1) {
        entry = snapshot[index];
        if (entry.layer.grouped !== entry.grouped) {
            throw new Error("Could not restore the clipping mask for " + entry.layer.name + ".");
        }
    }
}

VieraPS.run("Bake Selected Layer", function (documentRef) {
    var source = documentRef.activeLayer;
    var sourceIndex = VieraPS.getLayerIndex(source);
    var targets;
    var clippingSnapshot = [];

    if (!source.visible) {
        throw new Error("The selected layer must be visible before it can be baked.");
    }
    if (sourceIndex < 0) {
        throw new Error("Photoshop could not locate the selected layer in its parent.");
    }

    targets = (source.typename === "ArtLayer" && source.grouped) ?
        VieraPS.collectClippingTargets(source) :
        VieraPS.collectPixelLayers(source.parent, sourceIndex + 1, [], false);

    if (!targets.length) {
        throw new Error("No visible pixel layers were found below the selected layer.");
    }
    captureBakeClipping(documentRef, source, clippingSnapshot);

    VieraPS.withHistory(documentRef, "Bake Selected Layer", function () {
        var mergedLayers = [];
        var index;
        var target;
        var targetName;
        var wasGrouped;
        var wasVisible;
        var locks;
        var duplicate;
        var merged;

        // Merge from the bottom so earlier merges do not disrupt lower clipping stacks.
        for (index = targets.length - 1; index >= 0; index -= 1) {
            target = targets[index];
            targetName = target.name;
            wasGrouped = target.grouped;
            wasVisible = target.visible;
            locks = VieraPS.captureLocks(target);
            VieraPS.unlockLayer(target);
            merged = null;
            try {
                duplicate = source.duplicate(target, ElementPlacement.PLACEBEFORE);
                duplicate.visible = true;
                duplicate.grouped = true;
                documentRef.activeLayer = duplicate;
                merged = duplicate.merge();
                merged.name = targetName;
                merged.visible = wasVisible;
                // Photoshop errors if asked to release an already ungrouped layer.
                if (merged.grouped !== wasGrouped) {
                    merged.grouped = wasGrouped;
                }
                replaceBakeClippingLayer(clippingSnapshot, target, merged);
            } finally {
                VieraPS.restoreLocks(merged || target, locks);
            }
            mergedLayers.push(merged);
        }

        source.remove();
        restoreBakeClipping(clippingSnapshot);
        documentRef.activeLayer = mergedLayers[mergedLayers.length - 1];
    });
});
