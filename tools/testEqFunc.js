function objsAreEquivalent (obj1, obj2) {
  if (Object.keys(obj1).length != Object.keys(obj2).length) {
    return false;
  }

  return Object.keys(obj1).every(function (key) {
    return obj1[key] === obj2[key]
  });
}

var bert = {
    species: "cat",
    dryFood: "unlimited",
    numLegs: 4
}

var snoot = {
    species: "cat",
    dryFood: "unlimited",
    numLegs: 4
}

var pog = {
    species: "chancellor",
    dryFood: "unlimited",
    numLegs: 4
}

console.log("bert ?= snoot: " + objsAreEquivalent(bert, snoot) + " <-- expected true");
console.log("bert ?= pog: " + objsAreEquivalent(bert, pog) + " <-- expected false");
console.log("snoot ?= bert: " + objsAreEquivalent(snoot, bert) + " <-- expected true");
console.log("snoot ?= snoot: " + objsAreEquivalent(snoot, snoot) + " <-- expected true");
console.log("snoot ?= pog: " + objsAreEquivalent(snoot, pog) + " <-- expected false");