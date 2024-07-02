import express from 'express'
import { createUser, deleteUserById, getCurrentUserProfile, getUserById, getUsers, logoutCurrentUser, updateCurrentUserProfile, updateUserById, userLogin } from '../controllers/userControllers.js';
import { authorizeUser, authorizedAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router()

router.route('/')
    .post(createUser)
    .get(authorizeUser, authorizedAdmin, getUsers)

router.post('/auth', userLogin)
router.post('/logout', logoutCurrentUser)

router.route('/profile')
    .get(authorizeUser, getCurrentUserProfile)
    .put(authorizeUser, updateCurrentUserProfile)

// ADMIN ROUTES
//  '/:id'
// deleteUserById
// getUserById
// updateUserById
router.route('/:id')
    .delete(authorizeUser, authorizedAdmin, deleteUserById)
    .get(authorizeUser, authorizedAdmin, getUserById)
    .put(authorizeUser, authorizedAdmin, updateUserById)

export default router;