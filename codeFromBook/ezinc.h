#ifndef _EZINC2_H
#define _EZINC2_H

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "fdtd-macro-tmz.h"

void ezIncInit(Grid *g);
double ezInc(double time, double location);

#endif
