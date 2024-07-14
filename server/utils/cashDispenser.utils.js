const dispenseCash = (amount, denomination, atm) => {
  let remainingAmount = amount;
  let notesToDispense = {};

  const denominations = [1000, 500, 200, 100, 50, 20, 10];

  // Insert denomination at the beginning of the array if provided
  if (denomination) {
    denominations.unshift(denomination);
  }

  // Iterate through each denomination to dispense cash
  for (let denom of denominations) {
    if (remainingAmount === 0) break; 

    let availableNotes = atm.notes[denom]; 
    let neededNotes = Math.floor(remainingAmount / denom); 

    // If neededNotes and availableNotes are greater than zero, dispense cash
    if (neededNotes > 0 && availableNotes > 0) {
      let dispenseCount = Math.min(neededNotes, availableNotes); // Determine number of notes to dispense
      notesToDispense[denom] = dispenseCount; // Record dispensed notes for current denomination
      remainingAmount -= dispenseCount * denom; // Update remaining amount
      atm.notes[denom] -= dispenseCount; // Update ATM inventory for current denomination
    }
  }

  // Return remaining amount and notes dispensed
  return { remainingAmount, notesToDispense };
};

module.exports = { dispenseCash };
