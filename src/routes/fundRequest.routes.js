const router = require('express').Router()
const authMiddleware = require('../middleware/auth.middleware')

const fundRequestController = require('../controllers/fundRequest.controller')

// Normal user sends request
router.post('/:accountId/request-funds', authMiddleware.authMiddleware, fundRequestController.createFundRequest)

// System user fetches pending requests
router.get('/pending', authMiddleware.authSystemUserMiddleware, fundRequestController.getPendingFundRequests)

router.patch('/:requestId/approve', authMiddleware.authSystemUserMiddleware, fundRequestController.approveFundRequest)
router.patch('/:requestId/reject', authMiddleware.authSystemUserMiddleware, fundRequestController.rejectFundRequest)

router.get('/:accountId/history', authMiddleware.authMiddleware, fundRequestController.getFundRequestHistory)

module.exports = router