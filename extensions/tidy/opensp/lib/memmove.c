#include "config.h"
#include <stddef.h>

#ifndef HAVE_MEMMOVE

void *memmove(void *p1, const void *p2, size_t n)
{
  bcopy(p2, p1, n);
  return p1;
}

#endif
