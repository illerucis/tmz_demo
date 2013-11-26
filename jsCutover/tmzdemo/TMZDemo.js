function initializeGrid()
{
    var grid = {
        "imp0"    : 377.0,
        "sizeX"   : 51,
        "sizeY"   : 41,
        "maxTime" : 500,
        "cutOff"  : 300,
        "cdtds"   : 1.0 / Math.sqrt(2.0),
        "hx"      : new Array(),
        "chxh"    : new Array(),
        "chxe"    : new Array(),
        "hy"      : new Array(),
        "chyh"    : new Array(),
        "chye"    : new Array(),
        "ez"      : new Array(),
        "ceze"    : new Array(),
        "cezh"    : new Array(),
        "gol"     : null
    };

    // initialize data
    for (var i = 0; i < grid.sizeX; i++) {

        grid.hx[i] = new Array();
        grid.chxh[i] = new Array();
        grid.chxe[i] = new Array();

        grid.hy[i] = new Array();
        grid.chyh[i] = new Array();
        grid.chye[i] = new Array();

        grid.ez[i] = new Array();
        grid.ceze[i] = new Array();
        grid.cezh[i] = new Array();
        
        // JEFF get rid of the 2D arrays for constants
        for (var j = 0; j < grid.sizeY; j++) {

            // x data
            grid.hx[i][j] = 0.0;
            if (j < grid.sizeY - 1) {
                grid.chxh[i][j] = 1.0;
                grid.chxe[i][j] = (grid.cdtds / grid.imp0);
            }
            
            // y data
            grid.hy[i][j] = 0.0;
            if (i < grid.sizeX - 1) {
                grid.chyh[i][j] = 1.0;
                grid.chye[i][j] = (grid.cdtds / grid.imp0);
            }

            // z data
            grid.ez[i][j] = 0.0;
            grid.ceze[i][j] = 1.0;
            grid.cezh[i][j] = grid.cdtds * grid.imp0;
            
        }
    }
    grid.gol = initializeGOL(grid);
    return grid;
}

function calcSource(source, time)
{
    var arg = Math.PI*( (source.cdtds*time) / source.ppw - 1.0 );
    arg = arg * arg;
    return (1.0 - 2.0 * arg) * Math.exp( -1 * arg );
}

function initializeSource(g)
{
    return {
        "ppw"      : 20,
        "cdtds"    : g.cdtds,
        "x"        : Math.floor(g.sizeX / 2), 
        "y"        : Math.floor(g.sizeY / 2)
    }
}

function updateEField(g)
{
    // only update the z component of the electric field
    for (var i = 1; i < g.sizeX - 1; i++) {
        for (var j = 1; j < g.sizeY - 1; j++) {
            g.ez[i][j] = g.ceze[i][j] * g.ez[i][j] + g.cezh[i][j] *
                ( (g.hy[i][j] - g.hy[i - 1][j]) - (g.hx[i][j] - g.hx[i][j -1]) );
        }
    }
}

function updateHField(g)
{
    for (var i = 0; i < g.sizeX; i++) {
        for (var j = 0; j < g.sizeY - 1; j++) {
            // update the x component of the magnetic field
            if (j < g.sizeY - 1) {
                g.hx[i][j]  = g.chxh[i][j] * g.hx[i][j] - g.chxe[i][j] *
                    ( g.ez[i][j + 1] - g.ez[i][j] );
            }
            // update the y component of the magnetic field
            if (i < g.sizeX - 1) {
                g.hy[i][j] = g.chyh[i][j] * g.hy[i][j] + g.chye[i][j] *
                    ( g.ez[i + 1][j] - g.ez[i][j] );
            }
        }
    }
}


function initializeGOL(grid)
{
    gol = new Array();
    for (var i = 0; i < grid.sizeX; i++) {
        gol[i] = new Array();
        for (var j = 0; j < grid.sizeY; j++) {
            var x = Math.random();
            if (x > 0.80) { gol[i][j] = [1, 0]; }
            else { gol[i][j] = [0, 0]; }
        }
    }
    return gol
}

function determineNewState(newEz, gol, newGol, i, j, neighbors)
{

    // get the new eZ field
    var newValue = gol[i][j][1] + Math.abs(newEz) - 0.01*gol[i][j][1];
    
    newGol[i][j] = [gol[i][j][0], newValue];

    // if the cell is alive
    if (newGol[i][j][0] == 1) {
        // if fewer than 2 neighbors or greater than 3
        if ((newGol[i][j][1] < 5.5) && (neighbors < 2 || neighbors > 3)) {
            newGol[i][j] = [0, gol[i][j][1]];
        }
        // potentially other living rules go here
    }

    // if the cell is dead and if it has more than 2 neighbors, the cell becomes liave
    else if (neighbors == 3) {
        newGol[i][j][0] = 1;
    }
}

function getNeighbor(gol, i, j) {
    if (i < 0 || j < 0) { return 0; }
    else if (i > gol.length - 1 || j > gol[0].length - 1) { return 0; }
    else if (gol[i][j][0] == 1) { return 1; }
    else return 0;
}

function calcNewGeneration(ez, gol, sizeX, sizeY)
{
    newGol = new Array();
    for (var i = 0; i < sizeX; i++) {
        newGol[i] = new Array();
        for (var j = 0; j < sizeY; j++) {

	    var neighbors = 0;

	    for (var k = -1; k < 2; k++) {
		for (var l = -1; l < 2; l++) {
		    if (!(k == 0 && l == 0)) {
			neighbors += getNeighbor(gol, i + k, j + l);
		    }
		}
	    }

            determineNewState(ez[i][j], gol, newGol, i, j, neighbors);
        }
    }

    return newGol;
}

function zeroFields(grid)
{
    for (var i = 0; i < grid.sizeX; i++) {
        for (var j = 0; j < grid.sizeY; j++) {
            grid.ez[i][j] = 0.0;
            grid.hx[i][j] = 0.0;
            grid.hy[i][j] = 0.0;
        }
    }
}

function runSimulation(snapshots, d3Grid)
{
    var iteration = snapshots.data.length - 1, count = 0;
    var timer = setInterval(function(){
        count++;
        if(count > iteration){
            clearInterval(timer);
            return;
        }
        updated3Grid(snapshots.data[count], d3Grid);
    }, 50);
}

function buildNodes(g)
{
    nodes = [];
    data = g.ez;
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[0].length; j++) {
            if (g.gol[i][j][0] == 1) {
                var node = {
                    x     : i,
                    y     : j,
                    value : Math.log(Math.abs(g.gol[i][j][1]) + Number.MIN_VALUE),
                    gol   : true
                };
            }
            else {
                var node = {
                    x     : i, 
                    y     : j,
                    gol   : false,
                    value : Math.log(Math.abs(data[i][j] + Number.MIN_VALUE) / 0.5)
                };

            }
            nodes.push(node);
        }
    }
    return nodes;
}


function initializeSimulation(grid)
{
    // get a source, located in the middle of the grid
    source = initializeSource(grid);

    snapshots = {"data": []};

    var startTime = 10;
    var temporalStride = 10;

    for (var time = 0; time < grid.maxTime; time++) {

        // update the magnetic field
        updateHField(grid);
        
        // update the electric field
        updateEField(grid);

        if (time == grid.cutOff) { zeroFields(grid); }
        
        // update the value of the source
        grid.ez[source.x][source.y] = calcSource(source, time);

        // update cell positions and drop energy level
        grid.gol = calcNewGeneration(grid.ez, grid.gol, grid.sizeX, grid.sizeY);

        snapshots.data.push(buildNodes(grid));
    }
    
    return snapshots;
}
