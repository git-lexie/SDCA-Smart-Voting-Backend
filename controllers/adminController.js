const Election = require('../models/election.model');
const EligibleVoter = require('../models/eligibleVoter.model');
const Candidate = require('../models/candidatesModel');
const csv = require('csv-parser');
const HttpError = require('../models/errorModel');
const sendEmail = require('../utils/sendEmail');
const { bucket } = require('../utils/firebaseAdmin');
const stream = require('stream');

// Upload eligible voters CSV
exports.uploadEligibleCsv = async (req, res, next) => {
try {
if (!req.file) return next(new HttpError('No file uploaded', 400));


const rows = [];
const bufferStream = new stream.PassThrough();
bufferStream.end(req.file.buffer);

bufferStream
  .pipe(csv())
  .on('data', (row) => {
    if (row.email && row.studentID) {
      rows.push({
        email: row.email.toLowerCase().trim(),
        studentID: row.studentID.trim(),
        fullName: row.fullName?.trim() || '',
        department: row.department?.trim() || 'General',
        course: row.course?.trim() || 'N/A',
      });
    }
  })
  .on('end', async () => {
    await EligibleVoter.deleteMany({});
    const inserted = await EligibleVoter.insertMany(rows);
    res.json({ success: true, count: inserted.length, message: 'Eligible voters uploaded' });
  });


} catch (err) {
console.error(err);
next(new HttpError('Upload failed', 500));
}
};

// Create a new election
exports.createElection = async (req, res, next) => {
try {
const { title, description, startDate, endDate } = req.body;
if (!title || !startDate || !endDate) return next(new HttpError('Missing required fields', 422));


const data = {
  title,
  description: description?.trim() || '',
  startDate: new Date(startDate),
  endDate: new Date(endDate),
  createdBy: req.user._id,
};

// Handle banner upload to Firebase
if (req.file && bucket) {
  const filename = `elections/${Date.now()}-${req.file.originalname}`;
  const file = bucket.file(filename);
  await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
  await file.makePublic();
  data.bannerUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}

const election = await Election.create(data);

// Attach all eligible voters to election
const eligible = await EligibleVoter.find({});
election.eligibleVoters = eligible.map((e) => e._id);
await election.save();

// Notify voters via email
const sendPromises = eligible.map((ev) => {
  const html = `
    <h3>Upcoming election: ${election.title}</h3>
    <p>${election.description || ''}</p>
    <p>Starts: ${new Date(election.startDate).toLocaleString()}</p>
    <p>Ends: ${new Date(election.endDate).toLocaleString()}</p>
    <p><a href="${process.env.FRONTEND_URL}">Open Voting Portal</a></p>
  `;
  return sendEmail(ev.email, `Upcoming Election: ${election.title}`, html).catch((err) => {
    console.error('Email failed:', ev.email, err);
  });
});

await Promise.all(sendPromises);

res.status(201).json({ success: true, election, notified: eligible.length });


} catch (err) {
console.error(err);
next(new HttpError('Create election failed', 500));
}
};
