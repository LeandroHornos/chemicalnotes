
/*-------- EDITOR (COMPOSER)----------- */
var composer = new Kekule.Editor.Composer(document.getElementById('composer-container'));

//configuracion:

var appConfig = {
    commonButtons: ['newDoc', 'loadData', 'undo', 'copy', 'cut', 'paste',
    'zoomIn', 'reset', 'zoomOut'],
    chemToolButtons: ['manipulate', 'erase', 'bond', 'atom', 'glyph','formula',
    'ring', 'charge', 'textAndImage']
};

//Estado, aquí se almacena la info generada:

var appState = {
    docBlocks: 0,
    entries: [],
    molecules: []
};

composer.setCommonToolButtons(appConfig.commonButtons);
composer.setChemToolButtons(appConfig.chemToolButtons);


/*---Funciones del Editor--------------------------------*/

// Obtener la info en el editor:
function getFullDocument() {
    //devuelve el objeto completo dibujado en el editor
    var chemDoc = composer.getChemObj();
    console.log(chemDoc);
    return chemDoc;
}

function getAllMolecules() {
    //devuelve un array con todas las moleculas
    var molecules = composer.exportObjs(Kekule.Molecule);
    console.log(molecules);
}

// Renderizado:
function painterMolecule2D(mol) {
    //Dibuja una molecula en 2 dimensiones
    var renderType = Kekule.Render.RendererType.R2D;//R3D  // do 2D or 3D drawing
    // parent element, we will draw inside it
    var mainContainer = document.getElementById('viewer');
    //Creo un nuevo bloque contenedor, y le asigno un id
    var contBlock = createChemBlock();
    var idNumber = appState.docBlocks;
    var idString = "render-cont-"+idNumber.toString();
    appState.docBlocks = idNumber+1
    contBlock.setAttribute("id", idString)
    mainContainer.appendChild(contBlock)
    var parentElem = document.getElementById(idString);
    // Esta linea limpia el contenido previo. 
    //Dejar comentada si se quiere renderizar mas de una molecula
    //Kekule.DomUtils.clearChildContent(parentElem);

    // create painter, bind with molecule
    var painter = new Kekule.Render.ChemObjPainter(renderType, mol);

    // create context inside parentElem
    var dim = Kekule.HtmlElementUtils.getElemOffsetDimension(parentElem); // get width/height of parent element
    console.log(dim);
    var context = painter.createContext(parentElem, dim.width, dim.height); // create context fulfill parent element

    // at last, draw the molecule at the center of context
    painter.draw(context, {'x': dim.width / 2, 'y': dim.height /2});
    //guardo la info de la entrada
    var entryInfo = {
        type: "chem",
        idNumber: idNumber,
        idString: idString,
        content: mol
    }
    console.log(entryInfo)
    //guardo la entrada en appState
    appState.entries.push(entryInfo);
    console.log(appState.entries);
}

function renderMolecule2D(mol) {
    var renderType = Kekule.Render.RendererType.R2D;//R3D  // do 2D or 3D drawing
    var is3D = (renderType === Kekule.Render.RendererType.R3D);

    // parent HTML element, we will draw inside it
    var parentElem = document.getElementById('render');
    // clear parent elem
    //Kekule.DomUtils.clearChildContent(parentElem);

    // Get suitable draw bridge for 2D or 3D drawing
    var drawBridgeManager = is3D? Kekule.Render.DrawBridge3DMananger:
    Kekule.Render.DrawBridge2DMananger;
    var drawBridge = drawBridgeManager.getPreferredBridgeInstance();

    // then create render context by drawBridge first
    var dim = Kekule.HtmlElementUtils.getElemOffsetDimension(parentElem);
    console.log(dim); // get width/height of parent element
    var context = drawBridge.createContext(parentElem, dim.width, dim.height);  // create context fulfill parent element

    // then create suitable renderer to render molecule object
    var rendererClass;
    if (is3D)
        rendererClass = Kekule.Render.get3DRendererClass(mol);
    else
        rendererClass = Kekule.Render.get2DRendererClass(mol);
    var renderer = new rendererClass(mol, drawBridge);  // create concrete renderer object and bind it with mol and draw bridge

    /*
    prepare render options, options is a something like

    var options = {
    atomColor: '#000000',
    bondColor: '#000000',
    defBondLength: 30
    ...
    };
    it is quite complex, so we use some magic here, generate the option object by default configuration of Kekule.js.
    */
    var configObj = is3D? Kekule.Render.Render3DConfigs.getInstance():
    Kekule.Render.Render2DConfigs.getInstance();
    var options = Kekule.Render.RenderOptionUtils.convertConfigsToPlainHash(configObj);
    console.log(options);
    // at last, draw the molecule to the center of context
    renderer.draw(context, {'x': dim.width / 2, 'y': dim.height / 2}, options);
}

function createChemBlock() {
    //var container = document.getElementById("viewer");
    var renderDiv = document.createElement("div");
    renderDiv.setAttribute("class", "molecule-container");
    return renderDiv;
    //container.appendChild(renderDiv);
}

function createTextBlock() {
    //var container = document.getElementById("viewer");
    var renderDiv = document.createElement("div");
    renderDiv.setAttribute("class", "text-container");
    return renderDiv;
    //container.appendChild(renderDiv);
}



// Funciones de botones:

function createTextEntry() {
    //Creo un nuevo bloque contenedor, y le asigno un id
    var mainContainer = document.getElementById('viewer');
    var contBlock = createTextBlock();
    var idNumber = appState.docBlocks;
    var idString = "render-cont-"+idNumber.toString();
    appState.docBlocks = idNumber+1;
    contBlock.setAttribute("id", idString);
    mainContainer.appendChild(contBlock);

    var text = document.getElementById("textInput").value;
    var container = document.getElementById(idString);
    container.innerHTML = "<p>"+text+"</p>";
    //guardo la info de la entrada
    var entryInfo = {
        type: "text",
        idNumber: idNumber,
        idString: idString,
        content: text
    }
    console.log(entryInfo)
    //guardo la entrada en appState
    appState.entries.push(entryInfo);
    console.log(appState.entries);
}

function renderEditorContent() {
    var obj = getFullDocument();
    painterMolecule2D(obj);
    
}