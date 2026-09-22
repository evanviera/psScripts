<javascriptresource>
<name>Inspect Current Layer</name>
<about>Shows diagnostic information for the currently selected Photoshop layer. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>
<enableinfo>true</enableinfo>
</javascriptresource>

#target photoshop
#include "vieraLibrary.jsx"

VieraPS.run("Inspect Current Layer", function (documentRef) {
    var layer = documentRef.activeLayer;
    var details = [
        "Name: " + layer.name,
        "Type: " + layer.typename,
        "Parent: " + (layer.parent.name || "Document"),
        "Index: " + VieraPS.getLayerIndex(layer),
        "Visible: " + layer.visible,
        "Opacity: " + layer.opacity + "%"
    ];

    if (layer.typename === "ArtLayer") {
        details.push("Kind: " + layer.kind);
        details.push("Clipped: " + layer.grouped);
    }
    details.push("Layer mask: " + VieraPS.hasLayerMask(documentRef, layer));
    alert(details.join("\n"));
});
