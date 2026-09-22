/*
<javascriptresource>
<name>Toggle Current Layer</name>
<about>Toggles the visibility of the selected layer. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Toggle Current Layer", function (documentRef) {
    documentRef.activeLayer.visible = !documentRef.activeLayer.visible;
});
