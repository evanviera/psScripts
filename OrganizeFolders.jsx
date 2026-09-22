<javascriptresource>
<name>Organize Folders</name>
<about>Applies repeating Photoshop label colors to nested layer groups. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>
<enableinfo>true</enableinfo>
</javascriptresource>

#target photoshop
#include "vieraLibrary.jsx"

VieraPS.run("Organize Folders", function (documentRef) {
    var colors = ["Rd  ", "Orng", "Ylw ", "Grn ", "Bl  ", "Vlt ", "Gry "];
    var colorIndex = 0;
    var originalLayer = documentRef.activeLayer;

    function colorGroups(parent) {
        var index;
        var layer;
        for (index = 0; index < parent.layers.length; index += 1) {
            layer = parent.layers[index];
            if (VieraPS.isGroup(layer)) {
                VieraPS.setLabelColor(documentRef, layer, colors[colorIndex]);
                colorIndex = (colorIndex + 1) % colors.length;
                colorGroups(layer);
            }
        }
    }

    VieraPS.withHistory(documentRef, "Organize Folders", function () {
        colorGroups(documentRef);
        VieraPS.restoreActiveLayer(documentRef, originalLayer);
    });
});
