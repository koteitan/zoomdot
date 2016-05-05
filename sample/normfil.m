function B=normfil(A)
maxA=max(max(A));
minA=min(min(A));
B  = (A-minA)./(maxA-minA);
