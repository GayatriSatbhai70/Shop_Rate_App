const express = require('express');
const router = express.Router();
const { getPublicStats, listStoresPublic, getStoreDetails } = require('../controllers/public.controller');

router.get('/stats', getPublicStats);
router.get('/stores', listStoresPublic);
router.get('/stores/:id', getStoreDetails);

module.exports = router;
