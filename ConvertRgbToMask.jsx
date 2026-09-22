<javascriptresource>
<name>Convert RGB to Mask</name>
<about>Converts the selected layer's RGB intensity into a layer mask. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>
<enableinfo>true</enableinfo>
</javascriptresource>

#target photoshop
#include "vieraLibrary.jsx"

VieraPS.run("Convert RGB to Mask", function (documentRef) {
    var layer = documentRef.activeLayer;
    VieraPS.withHistory(documentRef, "Convert RGB to Mask", function () {
        VieraPS.convertRgbToMask(documentRef, layer);
    });
});
