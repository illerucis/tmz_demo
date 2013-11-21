function initializeGrid()
{
    var grid = {
        "imp0"    : 377.0,
        "sizeX"   : 51,
        "sizeY"   : 41,
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
        "cezh"    : new Array()
    };

    // initialize data
    for (var i = 0; i < grid.sizeX; i++) {

        grid.hy[i] = new Array();
        grid.chyh[i] = new Array();
        grid.chye[i] = new Array();

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

function deepCopy(array)
{
    newArray = new Array();
    for (var i = 0; i < array.length; i++) {
        newArray[i] = new Array();
        for (var j = 0; j < array[i].length; j++) {
            newArray[i][j] = array[i][j];
        }
    }
    return newArray;
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
    }, 0);

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
        
        // re draw the grid
        if (time >= startTime && (time - startTime) % temporalStride == 0) {
            copiedGrid = deepCopy(grid.ez);
            snapshots.push(copiedGrid);
        }
    }

    return snapshots;
}
