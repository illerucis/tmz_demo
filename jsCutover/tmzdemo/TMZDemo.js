function initializeGrid()
{
    var grid = {
        "imp0"    : 377.0,
        "sizeX"   : 101,
        "sizeY"   : 81,
        "maxTime" : 500,
        "cdtds"   : 1.0 / Math.sqrt(2.0),
        "ezMin"   : 0.0,
        "ezMax"   : 0.0,
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
            var val = g.ceze[i][j] * g.ez[i][j] + g.cezh[i][j] *
                ( (g.hy[i][j] - g.hy[i - 1][j]) - (g.hx[i][j] - g.hx[i][j -1]) );
            g.ez[i][j] = val;
            if (val < g.ezMin) { 
                g.ezMin = val;
            }
            if (val > g.ezMax) {
                g.ezMax = val;
            }
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

function deepCopy(grid)
{
    newGrid = {ez: new Array(), gol: new Array()};
    for (var i = 0; i < grid.ez.length; i++) {
        newGrid.ez[i] = new Array();
        newGrid.gol[i] = new Array();
        for (var j = 0; j < grid.ez[0].length; j++) {
            newGrid.ez[i][j] = grid.ez[i][j];
            newGrid.gol[i][j] = [grid.gol[i][j][0], grid.gol[i][j][1]];
        }
    }
    return newGrid;
}

function runSimulation(snapshots, d3Grid)
{
    var iteration = snapshots.length - 1, count = 0;
    var timer = setInterval(function(){
        count++;
        if(count > iteration){
            clearInterval(timer);
            return;
        }
        grid2Draw = snapshots[count];
        updated3Grid(grid2Draw, d3Grid);
    }, 100);
}

function initializeGOL(grid)
{
    gol = new Array();
    for (var i = 0; i < grid.sizeX; i++) {
        gol[i] = new Array();
        for (var j = 0; j < grid.sizeY; j++) {
            var x = Math.random();
            if (x > 0.5) { gol[i][j] = [1, 0]; }
            else { gol[i][j] = [0, 0]; }
        }
    }
    return gol
}

function getNeighbor(gol, i, j) {
    if (i < 0 || j < 0) { return 0; }
    else if (i > gol.length - 1 || j > gol[0].length - 1) { return 0; }
    else if (gol[i][j][0] == 1) { return 1; }
    else return 0;
}

function determineNewState(newEz, gol, newGol, i, j, neighbors)
{

    // get the new eZ field
    var newValue = gol[i][j][1] + Math.abs(newEz) - 0.01;
    newGol[i][j] = [gol[i][j][0], newValue];

    // if the cell is alive
    if (newGol[i][j][0] == 1) {
        // if fewer than 2 neighbors or greater than 3
        if ((newGol[i][j][1] < 10.0) && (neighbors < 2 || neighbors > 3)) {
            newGol[i][j] = [0, gol[i][j][1]];
        }
    }

    // if the cell is dead and if it has more than 2 neighbors, the cell becomes liave
    else if (neighbors == 3) {
        newGol[i][j][0] = 1;
    }
}

function calcNewGeneration(ez, gol, sizeX, sizeY)
{
    newGol = new Array();
    for (var i = 0; i < sizeX; i++) {
        newGol[i] = new Array();
        for (var j = 0; j < sizeY; j++) {

            var neighbors = 0;

            // right side
            neighbors += getNeighbor(gol, i+1, j+1);
            neighbors += getNeighbor(gol, i+1, j);
            neighbors += getNeighbor(gol, i+1, j-1);

            // bottom
            neighbors += getNeighbor(gol, i, j-1);
            // top
            neighbors += getNeighbor(gol, i, j+1);

            // left side
            neighbors += getNeighbor(gol, i-1, j+1);
            neighbors += getNeighbor(gol, i-1, j);
            neighbors += getNeighbor(gol, i-1, j-1);

            determineNewState(ez[i][j], gol, newGol, i, j, neighbors);
        }
    }

    return newGol;
}

function initializeSimulation(grid)
{
    // get a source, located in the middle of the grid
    source = initializeSource(grid);

    snapshots = [];

    var startTime = 10;
    var temporalStride = 10;

    for (var time = 0; time < grid.maxTime; time++) {

        // update the magnetic field
        updateHField(grid);
        
        // update the electric field
        updateEField(grid);

        // update the value of the source
        grid.ez[source.x][source.y] = calcSource(source, time);

        // update cell positions and drop energy level
        grid.gol = calcNewGeneration(grid.ez, grid.gol, 
                                     grid.sizeX, grid.sizeY);

        // re draw the grid
        if (time >= startTime && (time - startTime) % temporalStride == 0) {
            copiedGrid = deepCopy(grid);
            snapshots.push(copiedGrid);
        }
    }

    return snapshots;
}
