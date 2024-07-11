const dispenseCash = (amount, denomination, atm) => {
  let remainingAmount = amount;
  let notesToDispense = {};

  const denominations = [1000, 500, 200, 100, 50, 20, 10];
  if (denomination) {
    denominations.unshift(denomination);
  }

  for (let denom of denominations) {
    if (remainingAmount === 0) break;

    let availableNotes = atm.notes[denom];
    let neededNotes = Math.floor(remainingAmount / denom);

    if (neededNotes > 0 && availableNotes > 0) {
      let dispenseCount = Math.min(neededNotes, availableNotes);
      notesToDispense[denom] = dispenseCount;
      remainingAmount -= dispenseCount * denom;
      atm.notes[denom] -= dispenseCount;
    }
  }
  return { remainingAmount, notesToDispense };
};

module.exports = { dispenseCash };
