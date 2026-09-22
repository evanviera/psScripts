#target photoshop

/* Shared, ES3-compatible helpers for the Viera Photoshop scripts. */
var VieraPS = (function () {
    var historyCallback = null;

    function formatError(error) {
        var message = error && error.message ? error.message : String(error);
        if (error && error.line) {
            message += "\nLine: " + error.line;
        }
        return message;
    }

    function requireDocument() {
        if (!app.documents.length) {
            throw new Error("Open a Photoshop document before running this script.");
        }
        return app.activeDocument;
    }

    function run(scriptName, callback) {
        try {
            return callback(requireDocument());
        } catch (error) {
            alert(scriptName + " failed.\n\n" + formatError(error));
            return null;
        }
    }

    function withHistory(documentRef, historyName, callback) {
        if (!documentRef.suspendHistory) {
            return callback();
        }
        historyCallback = callback;
        try {
            documentRef.suspendHistory(historyName, "VieraPS.__executeHistoryCallback()");
        } finally {
            historyCallback = null;
        }
    }

    function executeHistoryCallback() {
        if (!historyCallback) {
            throw new Error("No Photoshop history operation is pending.");
        }
        return historyCallback();
    }

    function getLayerIndex(layer) {
        var layers = layer.parent.layers;
        var index;
        for (index = 0; index < layers.length; index += 1) {
            if (layers[index] === layer) {
                return index;
            }
        }
        return -1;
    }

    function isGroup(layer) {
        return layer && layer.typename === "LayerSet";
    }

    function isPixelLayer(layer) {
        return layer && layer.typename === "ArtLayer" && layer.kind === LayerKind.NORMAL;
    }

    function isReferenceLayer(layer) {
        return layer && /^_REF_/i.test(layer.name);
    }

    function isClipped(layer) {
        try {
            return layer.grouped === true;
        } catch (ignored) {
            return false;
        }
    }

    function appendPixelLayers(layer, output, includeHidden) {
        if (isGroup(layer)) {
            if (includeHidden || layer.visible) {
                collectPixelLayers(layer, 0, output, includeHidden);
            }
        } else if (isPixelLayer(layer) && (includeHidden || layer.visible)) {
            output.push(layer);
        }
    }

    function collectPixelLayers(parent, startIndex, output, includeHidden) {
        var result = output || [];
        var first = typeof startIndex === "number" ? startIndex : 0;
        var index;
        for (index = first; index < parent.layers.length; index += 1) {
            appendPixelLayers(parent.layers[index], result, includeHidden === true);
        }
        return result;
    }

    function collectClippingTargets(selectedLayer) {
        var result = [];
        var parent = selectedLayer.parent;
        var index = getLayerIndex(selectedLayer) + 1;
        var current;
        for (; index > 0 && index < parent.layers.length; index += 1) {
            current = parent.layers[index];
            appendPixelLayers(current, result, false);
            if (!isClipped(current)) {
                break;
            }
        }
        return result;
    }

    function collectReferenceLayers(parent, output) {
        var result = output || [];
        var index;
        var layer;
        for (index = 0; index < parent.layers.length; index += 1) {
            layer = parent.layers[index];
            if (isReferenceLayer(layer)) {
                result.push(layer);
            }
            if (isGroup(layer)) {
                collectReferenceLayers(layer, result);
            }
        }
        return result;
    }

    function snapshotVisibility(parent, output) {
        var result = output || [];
        var index;
        var layer;
        for (index = 0; index < parent.layers.length; index += 1) {
            layer = parent.layers[index];
            result.push({ layer: layer, visible: layer.visible });
            if (isGroup(layer)) {
                snapshotVisibility(layer, result);
            }
        }
        return result;
    }

    function restoreVisibility(snapshot) {
        var index;
        for (index = 0; index < snapshot.length; index += 1) {
            try { snapshot[index].layer.visible = snapshot[index].visible; } catch (ignored) {}
        }
    }

    function hideAll(snapshot) {
        var index;
        for (index = snapshot.length - 1; index >= 0; index -= 1) {
            try { snapshot[index].layer.visible = false; } catch (ignored) {}
        }
    }

    function showLayerPath(layer) {
        var current = layer;
        while (current && current.typename !== "Document") {
            current.visible = true;
            current = current.parent;
        }
    }

    function restoreLayerSubtree(snapshot, rootLayer) {
        var index;
        var current;
        var parent;
        for (index = 0; index < snapshot.length; index += 1) {
            current = snapshot[index].layer;
            parent = current;
            while (parent && parent.typename !== "Document") {
                if (parent === rootLayer) {
                    current.visible = snapshot[index].visible;
                    break;
                }
                parent = parent.parent;
            }
        }
        rootLayer.visible = true;
        showLayerPath(rootLayer.parent);
    }

    function restoreActiveLayer(documentRef, layer) {
        if (!layer) { return; }
        try { documentRef.activeLayer = layer; } catch (ignored) {}
    }

    function withActiveLayer(documentRef, layer, callback) {
        var previous = documentRef.activeLayer;
        documentRef.activeLayer = layer;
        try {
            return callback();
        } finally {
            restoreActiveLayer(documentRef, previous);
        }
    }

    function hasLayerMask(documentRef, layer) {
        return withActiveLayer(documentRef, layer, function () {
            var reference = new ActionReference();
            var descriptor;
            var maskKey = charIDToTypeID("Usrs");
            reference.putEnumerated(
                charIDToTypeID("Lyr "),
                charIDToTypeID("Ordn"),
                charIDToTypeID("Trgt")
            );
            descriptor = executeActionGet(reference);
            return descriptor.hasKey(maskKey) && descriptor.getBoolean(maskKey);
        });
    }

    function loadLayerMaskSelection(documentRef, layer) {
        return withActiveLayer(documentRef, layer, function () {
            var descriptor = new ActionDescriptor();
            var selectionReference = new ActionReference();
            var maskReference = new ActionReference();
            selectionReference.putProperty(charIDToTypeID("Chnl"), charIDToTypeID("fsel"));
            descriptor.putReference(charIDToTypeID("null"), selectionReference);
            maskReference.putEnumerated(
                charIDToTypeID("Chnl"),
                charIDToTypeID("Chnl"),
                charIDToTypeID("Msk ")
            );
            descriptor.putReference(charIDToTypeID("T   "), maskReference);
            executeAction(charIDToTypeID("setd"), descriptor, DialogModes.NO);
        });
    }

    function selectionExists(documentRef) {
        try {
            documentRef.selection.bounds;
            return true;
        } catch (ignored) {
            return false;
        }
    }

    function createUserMask(documentRef, layer, revealSelection) {
        return withActiveLayer(documentRef, layer, function () {
            var descriptor = new ActionDescriptor();
            var maskReference = new ActionReference();
            descriptor.putClass(charIDToTypeID("Nw  "), charIDToTypeID("Chnl"));
            maskReference.putEnumerated(
                charIDToTypeID("Chnl"),
                charIDToTypeID("Chnl"),
                charIDToTypeID("Msk ")
            );
            descriptor.putReference(charIDToTypeID("At  "), maskReference);
            descriptor.putEnumerated(
                charIDToTypeID("Usng"),
                charIDToTypeID("UsrM"),
                revealSelection ? charIDToTypeID("RvlS") : charIDToTypeID("HdAl")
            );
            executeAction(charIDToTypeID("Mk  "), descriptor, DialogModes.NO);
        });
    }

    function selectRgbUnionFromComposite(documentRef) {
        var components;
        var index;
        components = documentRef.componentChannels;
        if (!components || components.length < 3) {
            throw new Error("The active document must contain RGB component channels.");
        }
        documentRef.selection.load(components[0], SelectionType.REPLACE);
        for (index = 1; index < 3; index += 1) {
            documentRef.selection.load(components[index], SelectionType.EXTEND);
        }
    }

    function selectRgbUnionForLayer(documentRef, layer) {
        var visibility = snapshotVisibility(documentRef);
        try {
            hideAll(visibility);
            restoreLayerSubtree(visibility, layer);
            selectRgbUnionFromComposite(documentRef);
        } finally {
            restoreVisibility(visibility);
        }
    }

    function convertRgbToMask(documentRef, layer, isolateLayer) {
        if (documentRef.mode !== DocumentMode.RGB) {
            throw new Error("Convert RGB to Mask requires an RGB document.");
        }
        if (hasLayerMask(documentRef, layer)) {
            throw new Error("The selected layer already has a layer mask.");
        }
        try {
            if (isolateLayer === false) {
                selectRgbUnionFromComposite(documentRef);
            } else {
                selectRgbUnionForLayer(documentRef, layer);
            }
            createUserMask(documentRef, layer, selectionExists(documentRef));
        } finally {
            try { documentRef.selection.deselect(); } catch (ignored) {}
        }
        documentRef.activeLayer = layer;
        return layer;
    }

    function captureLocks(layer) {
        var locks = {};
        try { locks.allLocked = layer.allLocked; } catch (ignored1) {}
        try { locks.pixelsLocked = layer.pixelsLocked; } catch (ignored2) {}
        try { locks.positionLocked = layer.positionLocked; } catch (ignored3) {}
        try { locks.transparentPixelsLocked = layer.transparentPixelsLocked; } catch (ignored4) {}
        return locks;
    }

    function unlockLayer(layer) {
        try { layer.allLocked = false; } catch (ignored1) {}
        try { layer.pixelsLocked = false; } catch (ignored2) {}
        try { layer.positionLocked = false; } catch (ignored3) {}
        try { layer.transparentPixelsLocked = false; } catch (ignored4) {}
    }

    function restoreLocks(layer, locks) {
        try { if (typeof locks.transparentPixelsLocked !== "undefined") { layer.transparentPixelsLocked = locks.transparentPixelsLocked; } } catch (ignored1) {}
        try { if (typeof locks.pixelsLocked !== "undefined") { layer.pixelsLocked = locks.pixelsLocked; } } catch (ignored2) {}
        try { if (typeof locks.positionLocked !== "undefined") { layer.positionLocked = locks.positionLocked; } } catch (ignored3) {}
        try { if (typeof locks.allLocked !== "undefined") { layer.allLocked = locks.allLocked; } } catch (ignored4) {}
    }

    function setLabelColor(documentRef, layer, colorId) {
        return withActiveLayer(documentRef, layer, function () {
            var descriptor = new ActionDescriptor();
            var targetReference = new ActionReference();
            var layerDescriptor = new ActionDescriptor();
            targetReference.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            descriptor.putReference(charIDToTypeID("null"), targetReference);
            layerDescriptor.putEnumerated(charIDToTypeID("Clr "), charIDToTypeID("Clr "), charIDToTypeID(colorId));
            descriptor.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), layerDescriptor);
            executeAction(charIDToTypeID("setd"), descriptor, DialogModes.NO);
        });
    }

    function unitPixels(value) {
        return value && value.as ? value.as("px") : Number(value);
    }

    function selectionPixelBounds(documentRef) {
        var bounds = documentRef.selection.bounds;
        var left = unitPixels(bounds[0]);
        var top = unitPixels(bounds[1]);
        var right = unitPixels(bounds[2]);
        var bottom = unitPixels(bounds[3]);
        return { left: left, top: top, right: right, bottom: bottom, width: right - left, height: bottom - top };
    }

    function getDocumentBaseName(name) {
        var lastDot = name.lastIndexOf(".");
        return lastDot > 0 ? name.substring(0, lastDot) : name;
    }

    function stripGroupPrefix(name) {
        return String(name).replace(/^GRP_/i, "");
    }

    function sanitizeFileName(name) {
        var clean = String(name)
            .replace(/[\\\/:*?"<>|]/g, "_")
            .replace(/^\s+|\s+$/g, "")
            .replace(/[. ]+$/g, "");
        return clean || "untitled";
    }

    return {
        __executeHistoryCallback: executeHistoryCallback,
        run: run,
        withHistory: withHistory,
        withActiveLayer: withActiveLayer,
        restoreActiveLayer: restoreActiveLayer,
        getLayerIndex: getLayerIndex,
        isGroup: isGroup,
        isPixelLayer: isPixelLayer,
        isReferenceLayer: isReferenceLayer,
        collectPixelLayers: collectPixelLayers,
        collectClippingTargets: collectClippingTargets,
        collectReferenceLayers: collectReferenceLayers,
        snapshotVisibility: snapshotVisibility,
        restoreVisibility: restoreVisibility,
        hideAll: hideAll,
        showLayerPath: showLayerPath,
        hasLayerMask: hasLayerMask,
        loadLayerMaskSelection: loadLayerMaskSelection,
        selectionExists: selectionExists,
        convertRgbToMask: convertRgbToMask,
        captureLocks: captureLocks,
        unlockLayer: unlockLayer,
        restoreLocks: restoreLocks,
        setLabelColor: setLabelColor,
        unitPixels: unitPixels,
        selectionPixelBounds: selectionPixelBounds,
        getDocumentBaseName: getDocumentBaseName,
        stripGroupPrefix: stripGroupPrefix,
        sanitizeFileName: sanitizeFileName
    };
}());
