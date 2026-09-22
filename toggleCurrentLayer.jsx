<javascriptresource>
<name>Toggle Current Layer</name>
<about>Toggles the visibility of the selected layer. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<type>automate</type>
<enableinfo>true</enableinfo>
</javascriptresource>

#target photoshop
#include "vieraLibrary.jsx"

VieraPS.run("Toggle Current Layer", function (documentRef) {
    documentRef.activeLayer.visible = !documentRef.activeLayer.visible;
});
