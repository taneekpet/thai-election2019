//alert("JS file loaded...");

const listOfParty = [];
const listOfDistrict = [];

const partylistRepresentativeNum = 3;

const usedPartyName = {};
const usedDistrictName = {};

const novote = createNewParty('NO VOTE', 0);

//=================================================================================

function Party(name, partylistAppliedNum) {
  if(usedPartyName[name]) throw 'Duplicate party name';
  usedPartyName[name] = true;
  this.id = listOfParty.length.toString();
  this.name = name;
  this.districtAppliedList = {};
  this.partylistAppliedNum = partylistAppliedNum;
  this.partylistWonNum = 0;

  this.partyListByScore = 0;
  this.sumScore = 0;

  this.applyForDistrict = function(id) {
    if(this.districtAppliedList[id]) return false; //already applied
    if(listOfDistrict[id] == null) throw 'District not found'
    this.districtAppliedList[id] = {
      won: false,
    }
  }

  this.countLocalWon = function() {
    this.localWonNum = 0;
    for(let districtId in this.districtAppliedList) {
      if(this.districtAppliedList[districtId].won) this.localWonNum++;
    }
  }
}

function District(name) {
  if(usedDistrictName[name]) throw 'Duplicate district name';
  usedDistrictName[name] = true;
  this.id = listOfDistrict.length.toString();
  this.name = name;
  this.partyWon = null;
  this.score = { 0: 0 };

  this.addParty = function(id) {
    if(this.score[id]) return; //already applied
    if(listOfParty[id] == null) throw 'Party not found';
    this.score[id] = 0;
  }

  this.triggerWon = function() {
    let winnerId = 0;
    let winnerScore = 0;
    for(let id in this.score) {
      listOfParty[id].districtAppliedList[this.id].won = false;
      if(this.score[id] > winnerScore) {
        winnerScore = this.score[id];
        winner = id;
      }
    }
    let wonParty = listOfParty[winnerId];
    wonParty.districtAppliedList[this.id].won = true;
    wonParty.countLocalWon();
    this.partyWon = winnerId;
  }
}

function triggerCalculate() {
  let numCandidate = listOfDistrict.length + partylistRepresentativeNum;
  let sumScore = 0;
  let partyToConsider = [];
  let sumPartyListNeed = 0;
  let partylistAssignedNum = 0;

  let decimalHandle = [];

  listOfDistrict.forEach((district) => {
    //no vote
    if(district.partyWon === 0) {
      //this district's score is void
      return;
    }
    for(let partyId in district.score) {
      sumScore += district.score[partyId];
    }
  });

  listOfParty.forEach((party) => {
    let candidateByScore = (party.sumScore*numCandidate)/sumScore;
    if(party.localWonNum >= candidateByScore) {
      party.partyListByScore = 0;
      party.partylistWonNum = 0;
    } else {
      partyToConsider.push(party);
      party.partyListByScore = parseInt(Math.floor(candidateByScore - party.localWonNum));
      sumPartyListNeed += party.partyListByScore;

      decimalHandle.push({
        party: party,
        decimal: candidateByScore - party.localWonNum - this.partyListByScore,
        avgScore: party.sumScore/(candidateByScore - party.localWonNum - this.partyListByScore),
        random: Date.now()%1000,
      });
    }
  });

  if(sumPartyListNeed > partylistRepresentativeNum) {
    partyToConsider.forEach((party) => {
      party.partyListByScore = parseInt(Math.floor(
        party.partyListByScore*partylistRepresentativeNum/sumPartyListNeed)
      );
    });
  }
  partyToConsider.forEach((party) => {
    party.partylistWonNum = party.partyListByScore;
    partylistAssignedNum += party.partyListByScore;
  });

  decimalHandle.sort((a,b) => {
    if(a.decimal !== b.decimal) return a.decimal - b.decimal;
    if(a.avgScore !== b.avgScore) return a.avgScore - b.avgScore;
    return a.random - b.random;
  })

  //handle decimal
  let indexDecimal = 0;
  while(partylistAssignedNum < partylistRepresentativeNum) {
    decimalHandle[indexDecimal].party.partylistWonNum++;
    partylistAssignedNum++;
    indexDecimal++;
    indexDecimal %= decimalHandle.length;
  }
}

//=================================================================================

function createNewParty(name, partylistAppliedNum) {
  let newParty = new Party(name, partylistAppliedNum);
  listOfParty.push(newParty);
  return newParty;
}

function createNewDistrict(name) {
  let newDistrict = new District(name);
  listOfDistrict.push(newDistrict);
  applyPartyAtDistrict(novote, newDistrict);
  return newDistrict;
}

function applyPartyAtDistrict(party, district) {
  party.applyForDistrict(district.id);
  district.addParty(party.id);
}

function setScore(party, district, score) {
  if(district.score[party.id] == null) throw 'Party did not apply at this district';
  //old score
  party.sumScore -= district.score[party.id];
  //new score
  party.sumScore += score; 
  district.score[party.id] = score;
  district.triggerWon();
  triggerCalculate();
}

//=================================================================================

//each district has 100 score

let tiger = createNewParty('Tiger', partylistRepresentativeNum);
let lion = createNewParty('Lion', partylistRepresentativeNum);
let gorilla = createNewParty('Gorilla', partylistRepresentativeNum);

//console.log(listOfParty);

let one = createNewDistrict('one');
let two = createNewDistrict('two');
let three = createNewDistrict('three');

//console.log(listOfDistrict);

listOfParty.forEach((party, index) => {
  if(index === 0) return;
  listOfDistrict.forEach((district) => {
    applyPartyAtDistrict(party, district);
  });
});

//console.log(listOfParty, listOfDistrict)

setScore(tiger,   one, 98);
setScore(lion,    one, 1);
setScore(gorilla, one, 1);

setScore(tiger,   two, 51);
setScore(lion,    two, 24);
setScore(gorilla, two, 25);

setScore(tiger,   three, 51);
setScore(lion,    three, 25);
setScore(gorilla, three, 24);

console.log(JSON.stringify(listOfParty,null,2), '\n', JSON.stringify(listOfDistrict,null,2))
/*console.log(tiger.districtAppliedList,    tiger.partylistWonNum);
console.log(lion.districtAppliedList,     lion.partylistWonNum);
console.log(gorilla.districtAppliedList,  gorilla.partylistWonNum);*/