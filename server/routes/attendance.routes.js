const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance } = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/', getAttendance);

module.exports = router;