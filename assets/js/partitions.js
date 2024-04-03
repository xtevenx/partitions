// Generate partitions
function partitions(n) {
  if (!n) return [[]];

  let s = [];
  for (let p of partitions(n - 1)) {
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
  for (let i = k; i < n + k; ++i) {
    let j = Math.floor(Math.random() * i);
    if (j < k - 1) a[j] = i - 1;
  }

  a.sort((x, y) => x - y).push(n + k - 1);
  for (let i = k - 1; i >= 1; --i) a[i] -= a[i - 1] + 1;
  return a;

  // let a = [...Array(n + k - 1).keys()];
  // for (let i = 1; i < k; ++i) {
  //   let j = Math.floor(Math.random() * (n + k - i));
  //   let t = a[a.length - i];
  //   a[a.length - i] = a[j];
  //   a[j] = t;
  // }
  //
  // a = a.slice(-k + 1);
  // a.sort((x, y) => x - y).push(n + k - 1);
  // for (let i = k - 1; i >= 1; --i) a[i] -= a[i - 1] + 1;
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
  for (let i = 1; i < n; ++i) {
    a[i].fill(0)[0] = 1;
    for (let j = 1; j <= i; ++j)
      a[i][j] = a[i - 1][j - 1] + (i - j - 1 >= 0 ? a[i - j - 1][j] : 0);
  }

  let r = Math.floor(Math.random() * a[n - 1].reduce((s, x) => s + x, 0));
  for (let j = 0; ; ++j) if ((r -= a[n - 1][j]) < 0) return j + 1;
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
  if (n == 0) return 1; // NOTE undocumented in the paper
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
  for (let i = 0; ; ++i) if ((r -= a[i]) <= 0) return i; // should be < instead of <= but buggy
}

function partition_nwilf(n) {
  // Copied from _get_bars(n) to calculate p(n).
  let a = [...Array(n)].map((_) => Array(n));

  a[0].fill(0)[0] = 1;
  for (let i = 1; i < n; ++i) {
    a[i].fill(0)[0] = 1;
    for (let j = 1; j <= i; ++j)
      a[i][j] = a[i - 1][j - 1] + (i - j - 1 >= 0 ? a[i - j - 1][j] : 0);
  }

  a = a.map((r) => r.reduce((s, x) => s + x, 0));
  a.unshift(1);

  // Remainder of the algorithm.
  let p = [];
  while (n) {
    let m = _get_random(
      [...Array(n).keys()].map((m) => (sigma(n - m) * a[m]) / n / a[n]),
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

let ALGORITHMS = {
  Naive: partition_naive,
  'Bins & Balls': partition_stars,
  'Bins & Balls [Adjusted]': partition_bars,
  Fristedt: partition_frist,
  'Nijenhuis-Wilf': partition_nwilf,
};

// Testing
for (let [k, v] of Object.entries(ALGORITHMS)) {
  let s = performance.now();
  console.log(
    k,
    'returned',
    v(7),
    'in',
    performance.now() - s,
    'milliseconds.',
  );
}
