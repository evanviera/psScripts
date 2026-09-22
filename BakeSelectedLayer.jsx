/*
<javascriptresource>
<name>Bake Selected Layer</name>
<about>Bakes the selected layers into visible pixel layers below them and adds a hidden proof of the original composite. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

function bakeContainsLayer(layers, candidate) {
    var index;
    for (index = 0; index < layers.length; index += 1) {
        if (layers[index] === candidate) {
            return true;
        }
    }
    return false;
}

function collectBakeArtLayers(parent, output) {
    var index;
    var layer;
    for (index = 0; index < parent.layers.length; index += 1) {
        layer = parent.layers[index];
        if (layer.typename === "LayerSet") {
            collectBakeArtLayers(layer, output);
        } else {
            output.push(layer);
        }
    }
}

function getSelectedBakeLayers(documentRef) {
    var ids = [];
    var selected = [];
    var ordered = [];
    var reference;
    var descriptor;
    var list;
    var index;
    var idIndex;

    try {
        reference = new ActionReference();
        reference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayersIDs"));
        reference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        descriptor = executeActionGet(reference);
        list = descriptor.getList(stringIDToTypeID("targetLayersIDs"));
        for (index = 0; index < list.count; index += 1) {
            ids.push(list.getReference(index).getIdentifier());
        }
        if (!ids.length) {
            ids.push(documentRef.activeLayer.id);
        }
    } catch (ignored) {
        ids.push(documentRef.activeLayer.id);
    }

    collectBakeArtLayers(documentRef, ordered);
    for (index = 0; index < ordered.length; index += 1) {
        for (idIndex = 0; idIndex < ids.length; idIndex += 1) {
            if (ordered[index].id === ids[idIndex]) {
                selected.push(ordered[index]);
                break;
            }
        }
    }
    if (selected.length !== ids.length) {
        throw new Error("Could not resolve every selected layer. Select only individual layers, not groups.");
    }
    return selected;
}

function createBakePlans(documentRef, sources) {
    var ordered = [];
    var plans = [];
    var sourceIndex;
    var targetIndex;
    var orderIndex;
    var targets;
    var target;
    var plan;

    collectBakeArtLayers(documentRef, ordered);
    for (sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
        targets = sources[sourceIndex].grouped ?
            VieraPS.collectClippingTargets(sources[sourceIndex]) :
            VieraPS.collectPixelLayers(sources[sourceIndex].parent, VieraPS.getLayerIndex(sources[sourceIndex]) + 1, [], false);
        for (targetIndex = 0; targetIndex < targets.length; targetIndex += 1) {
            target = targets[targetIndex];
            if (bakeContainsLayer(sources, target)) {
                continue;
            }
            plan = null;
            for (orderIndex = 0; orderIndex < plans.length; orderIndex += 1) {
                if (plans[orderIndex].target === target) {
                    plan = plans[orderIndex];
                    break;
                }
            }
            if (!plan) {
                plan = { target: target, sources: [], order: -1 };
                for (orderIndex = 0; orderIndex < ordered.length; orderIndex += 1) {
                    if (ordered[orderIndex] === target) {
                        plan.order = orderIndex;
                        break;
                    }
                }
                plans.push(plan);
            }
            plan.sources.push(sources[sourceIndex]);
        }
    }
    plans.sort(function (left, right) { return right.order - left.order; });
    return plans;
}

function captureBakeClipping(parent, selectedLayers, output) {
    var index;
    var layer;
    for (index = 0; index < parent.layers.length; index += 1) {
        layer = parent.layers[index];
        if (layer.typename === "LayerSet") {
            captureBakeClipping(layer, selectedLayers, output);
        } else if (!bakeContainsLayer(selectedLayers, layer)) {
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

function createBakeProof(documentRef) {
    var composite = documentRef.duplicate("Bake Selected Layer proof capture", true);
    var proof;
    try {
        proof = composite.activeLayer.duplicate(documentRef, ElementPlacement.PLACEATBEGINNING);
    } finally {
        composite.close(SaveOptions.DONOTSAVECHANGES);
    }
    proof.name = "PROOF";
    proof.visible = false;
    return proof;
}

VieraPS.run("Bake Selected Layer", function (documentRef) {
    var sources = getSelectedBakeLayers(documentRef);
    var plans;
    var clippingSnapshot = [];
    var sourceIndex;

    for (sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
        if (!sources[sourceIndex].visible) {
            throw new Error("Every selected layer must be visible before it can be baked.");
        }
        if (VieraPS.getLayerIndex(sources[sourceIndex]) < 0) {
            throw new Error("Photoshop could not locate " + sources[sourceIndex].name + " in its parent.");
        }
    }

    plans = createBakePlans(documentRef, sources);
    if (!plans.length) {
        throw new Error("No visible pixel layers were found below the selected layers.");
    }
    captureBakeClipping(documentRef, sources, clippingSnapshot);

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
        var plan;
        var appliedSource;

        createBakeProof(documentRef);

        // Merge from the bottom so earlier merges do not disrupt lower clipping stacks.
        for (index = 0; index < plans.length; index += 1) {
            plan = plans[index];
            target = plan.target;
            targetName = target.name;
            wasGrouped = target.grouped;
            wasVisible = target.visible;
            locks = VieraPS.captureLocks(target);
            VieraPS.unlockLayer(target);
            merged = null;
            try {
                for (sourceIndex = plan.sources.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
                    appliedSource = plan.sources[sourceIndex];
                    duplicate = appliedSource.duplicate(target, ElementPlacement.PLACEBEFORE);
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
                    target = merged;
                }
            } finally {
                VieraPS.restoreLocks(merged || target, locks);
            }
            mergedLayers.push(merged);
        }

        for (sourceIndex = sources.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
            sources[sourceIndex].remove();
        }
        restoreBakeClipping(clippingSnapshot);
        documentRef.activeLayer = mergedLayers[mergedLayers.length - 1];
    });
});
