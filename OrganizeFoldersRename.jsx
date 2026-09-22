<javascriptresource>
<name>Organize Folders and Rename</name>
<about>Colors groups and assigns predictable GRP_ and LYR_ names, while preserving _REF_ branches. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>
<enableinfo>true</enableinfo>
</javascriptresource>

#target photoshop
#include "vieraLibrary.jsx"

VieraPS.run("Organize Folders and Rename", function (documentRef) {
    var colors = ["Rd  ", "Orng", "Ylw ", "Grn ", "Bl  ", "Vlt ", "Gry "];
    var colorIndex = 0;
    var groupIndex = 0;
    var originalLayer = documentRef.activeLayer;

    function organize(parent) {
        var layerIndex = 0;
        var index;
        var layer;
        for (index = 0; index < parent.layers.length; index += 1) {
            layer = parent.layers[index];
            if (VieraPS.isReferenceLayer(layer)) {
                continue;
            }
            if (VieraPS.isGroup(layer)) {
                VieraPS.setLabelColor(documentRef, layer, colors[colorIndex]);
                colorIndex = (colorIndex + 1) % colors.length;
                layer.name = "GRP_" + groupIndex;
                groupIndex += 1;
                organize(layer);
            } else {
                layer.name = "LYR_" + layerIndex;
                layerIndex += 1;
            }
        }
    }

    VieraPS.withHistory(documentRef, "Organize Folders and Rename", function () {
        organize(documentRef);
        VieraPS.restoreActiveLayer(documentRef, originalLayer);
    });
});
