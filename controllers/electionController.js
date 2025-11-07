
//add new election (only by admin)
const addElection = (req, res, next) => {
    res.json("Add Election");
}

//get all election 
const getElections = (req, res, next) => {
    res.json("Get all Elections");
}

//get single election
const getElection = (req, res, next) => {
    res.json("Get single Election");
}

//get election candidates
const getCandidatesElection = (req, res, next) => {
    res.json("get candidates of election");
}

//get election voters
const getElectionVoters = (req, res, next) => {
    res.json("get election voters");
}

//delete election (only by admin)
const removeElection = (req, res, next) => {
    res.json("delete election");
}

//update election (only by admin)
const updateElection = (req, res, next) => {
    res.json("edit election");
}

module.exports = {addElection, getElection, getElections, updateElection, removeElection, getCandidatesElection, getElectionVoters}