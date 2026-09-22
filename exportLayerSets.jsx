/*
<javascriptresource>
<name>Export Top-level Layer Sets</name>
<about>Exports each masked top-level group, except _REF_ groups, to a tightly cropped PNG. Evan Viera.</about>
<menu>filter</menu>
<category>Viera</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
#include "vieraLibrary.jsxinc"

VieraPS.run("Export Top-level Layer Sets", function (documentRef) {
    var originalDialogs = app.displayDialogs;
    var originalLayer = documentRef.activeLayer;
    var documentName = VieraPS.getDocumentBaseName(documentRef.name);
    var documentPath;
    var pngFolder;
    var outputFolder;
    var groups = [];
    var skipped = [];
    var index;
    var layer;

    try {
        documentPath = documentRef.path.fsName;
    } catch (pathError) {
        throw new Error("Save the Photoshop document once before exporting PNG files.");
    }

    pngFolder = new Folder(documentPath + "/PNG");
    if (!pngFolder.exists && !pngFolder.create()) {
        throw new Error("Could not create the PNG export folder.");
    }
    outputFolder = new Folder(pngFolder.fsName + "/" + VieraPS.sanitizeFileName(documentName));
    if (!outputFolder.exists && !outputFolder.create()) {
        throw new Error("Could not create the document's PNG export folder.");
    }

    for (index = 0; index < documentRef.layers.length; index += 1) {
        layer = documentRef.layers[index];
        if (VieraPS.isGroup(layer) && !VieraPS.isReferenceLayer(layer)) {
            groups.push(layer);
        }
    }
    if (!groups.length) {
        throw new Error("No exportable top-level layer groups were found.");
    }

    function exportGroup(group) {
        var topLevelVisibility = [];
        var bounds;
        var groupName = VieraPS.stripGroupPrefix(group.name);
        var baseName = VieraPS.sanitizeFileName(documentName + "_" + groupName);
        var outputFile = new File(outputFolder.fsName + "/" + baseName + ".png");
        var temporaryDocument = null;
        var options = new PNGSaveOptions();
        var layerIndex;

        for (layerIndex = 0; layerIndex < documentRef.layers.length; layerIndex += 1) {
            topLevelVisibility.push({
                layer: documentRef.layers[layerIndex],
                visible: documentRef.layers[layerIndex].visible
            });
        }

        try {
            for (layerIndex = 0; layerIndex < topLevelVisibility.length; layerIndex += 1) {
                topLevelVisibility[layerIndex].layer.visible = false;
            }
            group.visible = true;
            VieraPS.loadLayerMaskSelection(documentRef, group);
            if (!VieraPS.selectionExists(documentRef)) {
                throw new Error("Group '" + group.name + "' has an empty mask.");
            }
            bounds = VieraPS.selectionPixelBounds(documentRef);
            if (bounds.width < 1 || bounds.height < 1) {
                throw new Error("Group '" + group.name + "' has an empty export area.");
            }
            documentRef.selection.copy(true);
        } finally {
            VieraPS.restoreVisibility(topLevelVisibility);
            documentRef.selection.deselect();
        }

        try {
            temporaryDocument = app.documents.add(
                bounds.width,
                bounds.height,
                documentRef.resolution,
                baseName,
                NewDocumentMode.RGB,
                DocumentFill.TRANSPARENT,
                1,
                BitsPerChannelType.EIGHT
            );
            temporaryDocument.paste();
            temporaryDocument.trim(TrimType.TRANSPARENT, true, true, true, true);
            options.compression = 2;
            options.interlaced = false;
            temporaryDocument.saveAs(outputFile, options, true, Extension.LOWERCASE);
        } finally {
            if (temporaryDocument) {
                temporaryDocument.close(SaveOptions.DONOTSAVECHANGES);
            }
            app.activeDocument = documentRef;
        }
    }

    try {
        app.displayDialogs = DialogModes.NO;
        for (index = groups.length - 1; index >= 0; index -= 1) {
            if (!VieraPS.hasLayerMask(documentRef, groups[index])) {
                skipped.push(groups[index].name + " (no layer mask)");
                continue;
            }
            try {
                exportGroup(groups[index]);
            } catch (error) {
                skipped.push(groups[index].name + " (" + error.message + ")");
            }
        }
    } finally {
        app.displayDialogs = originalDialogs;
        VieraPS.restoreActiveLayer(documentRef, originalLayer);
    }

    if (skipped.length) {
        alert("Export completed with skipped groups:\n\n" + skipped.join("\n"));
    }
});
