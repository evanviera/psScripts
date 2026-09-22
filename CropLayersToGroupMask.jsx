/*
<javascriptresource>
<name>Crop Layers to Group Mask</name>
<about>Clears pixels outside the selected group's layer mask on every pixel layer inside the group. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Crop Layers to Group Mask", function (documentRef) {
    var group = documentRef.activeLayer;
    var layers;

    if (!VieraPS.isGroup(group)) {
        throw new Error("Select a layer group before running this script.");
    }
    if (!VieraPS.hasLayerMask(documentRef, group)) {
        throw new Error("The selected group does not have a layer mask.");
    }

    layers = VieraPS.collectPixelLayers(group, 0, [], true);
    if (!layers.length) {
        throw new Error("The selected group does not contain any pixel layers.");
    }

    VieraPS.withHistory(documentRef, "Crop Layers to Group Mask", function () {
        var index;
        var layer;
        var locks;

        try {
            VieraPS.loadLayerMaskSelection(documentRef, group);
            if (VieraPS.selectionExists(documentRef)) {
                documentRef.selection.invert();
            } else {
                documentRef.selection.selectAll();
            }

            // A fully white mask leaves no outside area, so there is nothing to clear.
            if (VieraPS.selectionExists(documentRef)) {
                for (index = 0; index < layers.length; index += 1) {
                    layer = layers[index];
                    locks = VieraPS.captureLocks(layer);
                    VieraPS.unlockLayer(layer);
                    try {
                        documentRef.activeLayer = layer;
                        documentRef.selection.clear();
                    } finally {
                        VieraPS.restoreLocks(layer, locks);
                    }
                }
            }
        } finally {
            documentRef.selection.deselect();
            documentRef.activeLayer = group;
        }
    });
});
