/*
<javascriptresource>
<name>Cryptomatte to Layered PSD</name>
<about>Uses EXR-IO's unpacked Crypto layers to create masked copies of the Combined.RGBA render. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Cryptomatte to Layered PSD", function (documentRef) {
    var cryptoLayers = [];
    var rgbLayer = null;
    var originalVisibility = VieraPS.snapshotVisibility(documentRef);
    var index;
    var layer;

    if (documentRef.mode !== DocumentMode.RGB) {
        throw new Error("The unpacked EXR must be open as an RGB document.");
    }

    for (index = 0; index < documentRef.layers.length; index += 1) {
        layer = documentRef.layers[index];
        if (/Combined[._ ]RGBA/i.test(layer.name)) {
            rgbLayer = layer;
        } else if (/Crypto/i.test(layer.name)) {
            cryptoLayers.push(layer);
        }
    }

    if (!rgbLayer) {
        throw new Error("No top-level layer containing 'Combined.RGBA' was found.");
    }
    if (!cryptoLayers.length) {
        throw new Error("No top-level layers containing 'Crypto' were found.");
    }

    VieraPS.withHistory(documentRef, "Cryptomatte to Layered PSD", function () {
        var outputs = [];
        var cryptoLayer;
        var cryptoName;
        var rgbDuplicate;
        var result;

        try {
            VieraPS.hideAll(originalVisibility);
            for (index = 0; index < cryptoLayers.length; index += 1) {
                cryptoLayer = cryptoLayers[index];
                cryptoName = cryptoLayer.name;
                cryptoLayer.visible = true;
                VieraPS.convertRgbToMask(documentRef, cryptoLayer, false);

                rgbDuplicate = rgbLayer.duplicate(cryptoLayer, ElementPlacement.PLACEBEFORE);
                rgbDuplicate.visible = true;
                rgbDuplicate.grouped = true;
                result = rgbDuplicate.merge();
                result.name = cryptoName;
                result.visible = false;
                outputs.push(result);
            }
        } finally {
            VieraPS.restoreVisibility(originalVisibility);
        }
        for (index = 0; index < outputs.length; index += 1) {
            outputs[index].visible = true;
        }
        documentRef.activeLayer = outputs[0];
    });
});
