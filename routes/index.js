const router = require('express').Router();

const userRouter = require('./users');
const clothingItemsRouter = require('./clothingItems');

router.use('/items', clothingItemsRouter);

router.use('/users', userRouter);

module.exports = router;