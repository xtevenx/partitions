// Generate partitions
function partitions(n) {
  if (!n) return [[]];

  let s = [];
  for (p of partitions(n - 1)) {
    let l = p.length;
    if (l == 1 || p[l - 2] > p[l - 1]) (s[s.length] = [...p])[l - 1]++;
    (s[s.length] = p)[l] = 1;
  }

  return s;
}

// Naive partition
function partition_naive(n) {
  let s = partitions(n);
  return s[Math.floor(Math.random() * s.length)];
}

// Stars and bars partitions
function _solve_stars(n, k) {
  let a = [...Array(k - 1).keys()];
  for (i = k; i < n + k; ++i) {
    let j = Math.floor(Math.random() * i);
    if (j < k - 1) a[j] = i - 1;
  }

  a.sort((x, y) => x - y).push(n + k - 1);
  for (i = k - 1; i >= 1; --i) a[i] -= a[i - 1] + 1;
  return a;

  // let a = [...Array(n + k - 1).keys()];
  // for (i = 1; i < k; ++i) {
  //   let j = Math.floor(Math.random() * (n + k - i));
  //   let t = a[a.length - i];
  //   a[a.length - i] = a[j];
  //   a[j] = t;
  // }
  //
  // a = a.slice(-k + 1);
  // a.sort((x, y) => x - y).push(n + k - 1);
  // for (i = k - 1; i >= 1; --i) a[i] -= a[i - 1] + 1;
  // return a;
}

function partition_stars(n) {
  let k = Math.floor(Math.random() * n) + 1;
  let p = _solve_stars(n - k, k);
  return p.map((x) => x + 1);
}

function _get_bars(n) {
  let a = [...Array(n)].map((_) => Array(n));

  a[0].fill(0)[0] = 1;
  for (i = 1; i < n; ++i) {
    a[i].fill(0)[0] = 1;
    for (j = 1; j <= i; ++j)
      a[i][j] = a[i - 1][j - 1] + (i - j - 1 >= 0 ? a[i - j - 1][j] : 0);
  }

  let r = Math.floor(Math.random() * a[n - 1].reduce((s, x) => s + x, 0));
  for (j = 0; ; ++j) if ((r -= a[n - 1][j]) < 0) return j + 1;
}

function partition_bars(n) {
  let k = _get_bars(n);
  let p = _solve_stars(n - k, k);
  return p.map((x) => x + 1);
}

// Fristedt partitions [https://doi.org/10.2307/2154239]

function _get_exp(p) {
  return -Math.log(Math.random()) / p;
}

function _get_geo(p) {
  return Math.floor(_get_exp(-Math.log(1 - p)));
}

function partition_frist(n) {
  let x = Math.exp(-Math.PI / Math.sqrt(6 * n));

  while (true) {
    // let p = [...Array(n).keys()].reduce(
    //   (p, i) =>
    //     p.concat(
    //       Array(
    //         Math.floor(
    //           -Math.log(Math.random()) / -Math.log(Math.pow(x, i + 1)),
    //         ),
    //       ).fill(i + 1),
    //     ),
    //   [],
    // );
    let p = [...Array(n).keys()].reduce(
      (p, i) => p.concat(Array(_get_geo(1 - Math.pow(x, i + 1))).fill(i + 1)),
      [],
    );
    if (p.reduce((s, x) => s + x, 0) == n) return p;
  }
}

// Nijenhuis-Wilf partitions [https://doi.org/10.1016/0097-3165(75)90013-8]
function sigma(n) {
  let x = Math.floor(Math.sqrt(n));
  return (
    [...Array(x).keys()]
      .map((i) => i + 1)
      .reduce((s, d) => s + (d + Math.round(n / d)) * (n % d == 0), 0) -
    x * (x * x == n)
  );
}

function _get_random(a) {
  let r = Math.random() * a.reduce((s, x) => s + x, 0);
  for (i = 0; ; ++i) if ((r -= a[i]) <= 0) return i; // should be < instead of <= but buggy
}

function partition_nwilf(n) {
  let p = [];
  while (n) {
    let m = _get_random(
      [...Array(n).keys()].map((m) => (sigma(n - m) * sigma(m)) / n / sigma(n)),
    );

    let x = sigma(n - m);
    let d =
      1 +
      _get_random(
        [...Array(n - m).keys()]
          .map((i) => i + 1)
          .map((d) => (d / x) * ((n - m) % d == 0)),
      );

    p = p.concat(Array(Math.round((n - m) / d)).fill(d));
    n = m;
  }

  return p;
}

// Testing
let n = 2000;

// s = performance.now();
// console.log('naive:', partition_naive(n));
// console.log('time:', performance.now() - s);

s = performance.now();
console.log('stars:', partition_stars(n));
console.log('time:', performance.now() - s);

s = performance.now();
console.log('bars:', partition_bars(n));
console.log('time:', performance.now() - s);

s = performance.now();
console.log('frist:', partition_frist(n));
console.log('time:', performance.now() - s);

s = performance.now();
console.log('nwilf:', partition_nwilf(n));
console.log('time:', performance.now() - s);
