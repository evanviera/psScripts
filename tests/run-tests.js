"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function stripExtendScriptDirectives(source) {
    return source
        .replace(/^\s*#(?:target|include).*$/gm, "");
}

function parseAllScripts() {
    const files = fs.readdirSync(root).filter((name) => /\.jsx$/i.test(name));
    files.forEach((name) => {
        const source = fs.readFileSync(path.join(root, name), "utf8");
        assert(!/\b(?:const|let)\b|=>|`/.test(source), `${name} should remain ExtendScript ES3 compatible`);
        assert(/\/\*[\s\S]*?<javascriptresource>[\s\S]*?<\/javascriptresource>[\s\S]*?\*\//.test(source), `${name} should contain a commented Photoshop resource`);
        assert(source.includes("<menu>filter</menu>"), `${name} should register in Photoshop's Filter menu`);
        assert(source.includes("<category>Viera</category>"), `${name} should use the Viera category`);
        assert(source.includes('#include "vieraLibrary.jsxinc"'), `${name} should include the shared library`);
        assert.doesNotThrow(
            () => new Function(stripExtendScriptDirectives(source)),
            `${name} should contain valid JavaScript after ExtendScript directives are removed`
        );
    });
    assert.strictEqual(files.length, 10, "expected ten runnable entry scripts");
    assert(fs.existsSync(path.join(root, "vieraLibrary.jsxinc")), "expected the shared include file");
    assert(!fs.existsSync(path.join(root, "Boarding")), "the retired Boarding folder should stay removed");
}

function loadLibrary() {
    const source = stripExtendScriptDirectives(
        fs.readFileSync(path.join(root, "vieraLibrary.jsxinc"), "utf8")
    );
    const context = {
        LayerKind: { NORMAL: "normal", TEXT: "text" },
        console
    };
    vm.createContext(context);
    vm.runInContext(source, context, { filename: "vieraLibrary.jsx" });
    return context.VieraPS;
}

function documentWith(layers) {
    const documentRef = { typename: "Document", name: "Mock.psd", layers };

    function attach(parent) {
        parent.layers.forEach((layer) => {
            layer.parent = parent;
            if (layer.typename === "LayerSet") {
                attach(layer);
            }
        });
    }

    attach(documentRef);
    return documentRef;
}

function pixel(name, options = {}) {
    return Object.assign({
        name,
        typename: "ArtLayer",
        kind: "normal",
        visible: true,
        grouped: false
    }, options);
}

function group(name, layers, options = {}) {
    return Object.assign({
        name,
        typename: "LayerSet",
        layers,
        visible: true,
        grouped: false
    }, options);
}

function testTraversal(VieraPS) {
    const top = pixel("top");
    const nested = pixel("nested");
    const hiddenPixel = pixel("hidden pixel", { visible: false });
    const hiddenGroupPixel = pixel("inside hidden group");
    const hiddenGroup = group("hidden group", [hiddenGroupPixel], { visible: false });
    const visibleGroup = group("visible group", [nested, hiddenPixel]);
    const doc = documentWith([top, visibleGroup, hiddenGroup]);

    assert.deepStrictEqual(
        Array.from(VieraPS.collectPixelLayers(doc, 0, [], false), (layer) => layer.name),
        ["top", "nested"]
    );
    assert.deepStrictEqual(
        Array.from(VieraPS.collectPixelLayers(doc, 0, [], true), (layer) => layer.name),
        ["top", "nested", "hidden pixel", "inside hidden group"]
    );
}

function testClippingTargets(VieraPS) {
    const source = pixel("adjustment", { kind: "adjustment", grouped: true });
    const clipped = pixel("clipped", { grouped: true });
    const baseNested = pixel("base nested");
    const base = group("base", [baseNested]);
    const unrelated = pixel("unrelated");
    documentWith([source, clipped, base, unrelated]);

    assert.deepStrictEqual(
        Array.from(VieraPS.collectClippingTargets(source), (layer) => layer.name),
        ["clipped", "base nested"],
        "the clipping base should be included and traversal should stop after it"
    );
}

function testReferences(VieraPS) {
    const exact = pixel("_REF_pose");
    const embedded = pixel("paint_REF_backup");
    const nested = pixel("_ref_nested");
    const doc = documentWith([exact, embedded, group("work", [nested])]);

    assert.strictEqual(VieraPS.isReferenceLayer(exact), true);
    assert.strictEqual(VieraPS.isReferenceLayer(embedded), false);
    assert.deepStrictEqual(
        Array.from(VieraPS.collectReferenceLayers(doc, []), (layer) => layer.name),
        ["_REF_pose", "_ref_nested"]
    );
}

function testNames(VieraPS) {
    assert.strictEqual(VieraPS.getDocumentBaseName("painting.final.psd"), "painting.final");
    assert.strictEqual(VieraPS.getDocumentBaseName("untitled"), "untitled");
    assert.strictEqual(VieraPS.stripGroupPrefix("GRP_12"), "12");
    assert.strictEqual(VieraPS.stripGroupPrefix("Character"), "Character");
    assert.strictEqual(VieraPS.sanitizeFileName(" face:front? "), "face_front_");
}

function testBakeClippingRestoration() {
    const source = pixel("Color Balance 1", { kind: "adjustment" });
    const clipped = pixel("clipped", { grouped: true });
    const base = pixel("base");
    const nestedClipped = pixel("nested clipped", { grouped: true });
    const nestedBase = pixel("nested base");
    const doc = documentWith([source, clipped, base, group("nested", [nestedClipped, nestedBase])]);
    const context = { VieraPS: { run() {} } };
    vm.createContext(context);
    vm.runInContext(
        stripExtendScriptDirectives(fs.readFileSync(path.join(root, "BakeSelectedLayer.jsx"), "utf8")),
        context
    );

    const snapshot = [];
    context.captureBakeClipping(doc, [source], snapshot);
    assert.strictEqual(snapshot.length, 4, "selected sources should not be part of the clipping snapshot");
    const replacement = pixel("clipped replacement");
    context.replaceBakeClippingLayer(snapshot, clipped, replacement);
    nestedClipped.grouped = false;
    context.restoreBakeClipping(snapshot);

    assert.strictEqual(replacement.grouped, true);
    assert.strictEqual(nestedClipped.grouped, true);
    assert.strictEqual(base.grouped, false);
    assert.strictEqual(nestedBase.grouped, false);
}

function testBakeSelectionAndPlans(VieraPS) {
    const upper = pixel("upper adjustment", { kind: "adjustment", id: 1 });
    const middle = pixel("middle pixels", { id: 2 });
    const lower = pixel("lower adjustment", { kind: "adjustment", id: 3 });
    const bottom = pixel("bottom pixels", { id: 4 });
    const doc = documentWith([upper, middle, lower, bottom]);
    doc.activeLayer = lower;
    const selectedIds = [3, 1];
    const context = {
        VieraPS: Object.assign({}, VieraPS, { run() {} }),
        ActionReference: function () {
            this.putProperty = function () {};
            this.putEnumerated = function () {};
        },
        charIDToTypeID: (value) => value,
        stringIDToTypeID: (value) => value,
        executeActionGet: () => ({
            getList: () => ({
                count: selectedIds.length,
                getReference: (index) => ({ getIdentifier: () => selectedIds[index] })
            })
        })
    };
    vm.createContext(context);
    vm.runInContext(
        stripExtendScriptDirectives(fs.readFileSync(path.join(root, "BakeSelectedLayer.jsx"), "utf8")),
        context
    );

    const sources = context.getSelectedBakeLayers(doc);
    assert.deepStrictEqual(Array.from(sources, (layer) => layer.name), ["upper adjustment", "lower adjustment"]);
    const plans = context.createBakePlans(doc, sources);
    assert.deepStrictEqual(Array.from(plans, (plan) => plan.target.name), ["bottom pixels", "middle pixels"]);
    assert.deepStrictEqual(Array.from(plans[0].sources, (layer) => layer.name), ["upper adjustment", "lower adjustment"]);
    assert.deepStrictEqual(Array.from(plans[1].sources, (layer) => layer.name), ["upper adjustment"]);
}

function main() {
    parseAllScripts();
    const VieraPS = loadLibrary();
    testTraversal(VieraPS);
    testClippingTargets(VieraPS);
    testReferences(VieraPS);
    testNames(VieraPS);
    testBakeClippingRestoration();
    testBakeSelectionAndPlans(VieraPS);
    console.log("All Photoshop script tests passed.");
}

try {
    main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
