/*
<javascriptresource>
<name>Bake Selected Layer</name>
<about>Bakes the selected layer into the visible pixel layers below it and keeps a hidden proof of the original composite. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Bake Selected Layer", function (documentRef) {
    var source = documentRef.activeLayer;
    var sourceIndex = VieraPS.getLayerIndex(source);
    var targets;

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
        var proof;

        try {
            documentRef.selection.selectAll();
            documentRef.selection.copy(true);
        } finally {
            documentRef.selection.deselect();
        }

        for (index = 0; index < targets.length; index += 1) {
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
                merged = duplicate.merge();
                merged.name = targetName;
                merged.visible = wasVisible;
                merged.grouped = wasGrouped;
            } finally {
                VieraPS.restoreLocks(merged || target, locks);
            }
            mergedLayers.push(merged);
        }

        source.remove();
        documentRef.activeLayer = documentRef.layers[0];
        proof = documentRef.paste();
        proof.name = "PROOF";
        proof.visible = false;
        documentRef.activeLayer = mergedLayers[0];
    });
});
