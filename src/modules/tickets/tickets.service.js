const seatsReposetory = require("./seats.reposetory");

async function getSeatsCapacity_service() {
  const rawCapacity = await seatsReposetory.getSeatsCapacity();

  const result = {
    gamer: { total: 0, available: 0, reservedOrSold: 0 },
    vip: { total: 0, available: 0, reservedOrSold: 0 },
    regular: { total: 0, available: 0, reservedOrSold: 0 }
  };

  rawCapacity.forEach(item => {
    const total = Number(item.total);
    const available = Number(item.available_count);

    if (result[item.type]) {
      result[item.type] = {
        total: total,
        available: available,
        reservedOrSold: total - available
      };
    }
  });

  return result;
}

module.exports.getSeatsCapacity_service = getSeatsCapacity_service;
