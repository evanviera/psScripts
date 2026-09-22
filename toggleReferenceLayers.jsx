/*
<javascriptresource>
<name>Toggle Reference Layers</name>
<about>Shows or hides every layer whose name begins with _REF_, including nested reference layers. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Toggle Reference Layers", function (documentRef) {
    var layers = VieraPS.collectReferenceLayers(documentRef, []);
    var shouldShow = true;
    var index;

    if (!layers.length) {
        throw new Error("No layers beginning with '_REF_' were found.");
    }

    for (index = 0; index < layers.length; index += 1) {
        if (layers[index].visible) {
            shouldShow = false;
            break;
        }
    }

    VieraPS.withHistory(documentRef, "Toggle Reference Layers", function () {
        for (index = 0; index < layers.length; index += 1) {
            layers[index].visible = shouldShow;
        }
    });
});
