
//add candidate
//POST: api/candidates 
const addCandidate = (req, res, next) => {
    res.json("Add Candidate");
}

//get candidate 
//GET: api/candidates/:id
const getCandidate = (req, res, next) => {
    res.json("Get Candidate");
}

//delete candidate 
const removeCandidate = (req, res, next) => {
    res.json("Delete Candidate");
}

//Vote candidate 
const voteCandidate = (req, res, next) => {
    res.json("Vote Candidate");
}

module.exports = {addCandidate, getCandidate, removeCandidate, voteCandidate}