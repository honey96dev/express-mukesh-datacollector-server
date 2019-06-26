import express from 'express';
const router = express.Router();

const loginProc = (req, res, next) => {
  res.send('respond with a resource');
};

router.get('/', loginProc);

router.get('/login', loginProc);

router.get('/signup', () => {

});

module.exports = router;
