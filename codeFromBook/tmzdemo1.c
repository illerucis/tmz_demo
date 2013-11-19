/*TMz simulation with Ricker source at center of grid.*/

#include "fdtd-alloc1.h"
#include "fdtd-macro-tmz.h"
#include "fdtd-proto1.h"
#include "ezinc.h"

int main()
{
    Grid *g;

    // allocate memory for Grid
    ALLOC_1D(g, 1, Grid);

    // initialize the grid
    gridInit(g);
    ezIncInit(g);

    // initialize snapshots
    snapshotInit2d(g);

    /* do time stepping MaxTime */
    for (Time = 0; Time < 30; Time++) {
        // update magnetic field
        updateH2d(g);
        // update electric field
        updateE2d(g);

        // add a source
        Ez(SizeX / 2, SizeY / 2) = ezInc(Time, 0.0);

        // take a snapshot (if appropriate)
        snapshot2d(g);

        if (Time % 10 == 0) {
            printf("%f ", Ez(SizeX / 2, SizeY / 2));
        }

    }
    
    return 0;

}
