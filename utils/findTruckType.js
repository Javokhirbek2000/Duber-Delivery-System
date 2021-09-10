const trucks = [
  {
    width: 300,
    length: 250,
    height: 170,
    payload: 1700,
    name: 'SPRINTER',
  },
  {
    width: 500,
    length: 250,
    height: 170,
    payload: 2500,
    name: 'SMALL STRAIGHT',
  },
  {
    width: 700,
    length: 350,
    height: 200,
    payload: 4000,
    name: 'LARGE STRAIGHT',
  },
];

module.exports = function ({ width, length, height, payload }) {
  // eslint-disable-next-line no-restricted-syntax
  for (const truck of trucks) {
    if (
      truck.width >= width &&
      truck.length >= length &&
      truck.height >= height &&
      truck.payload >= payload
    ) {
      return truck.name;
    }
  }
};
