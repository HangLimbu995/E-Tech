import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from 'bcryptjs'
import createToken from '../utils/createToken.js'


const getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find({}).sort({id: -1});
    res.status(200).json(users)

})


const createUser = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body
    console.log(req.body)
    if (!username || !email || !password) {
        throw new Error('Please fill all the inputs ?')
    }

    const userExists = await User.findOne({ email })

    if (userExists) return res.status(400).send('User already exists !')

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    if (!hashedPassword) throw new Error('bcrypt failed')

    const newUser = new User({ username, email, password: hashedPassword })

    try {
        await newUser.save()
        createToken(res, newUser._id)

        res.status(201)
            .json({
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin
            })
    } catch (error) {
        res.status(400)
        throw new Error('Invalid user data')
    }

})

const userLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const isexistingUser = await User.findOne({ email })
    if (!isexistingUser) return res.status(400).send('User does not exist !')
    const isMatch = await bcrypt.compare(password, isexistingUser.password)
    if (!isMatch) return res.status(400).send('Invalid credentials !')
    createToken(res, isexistingUser._id)
    res.status(201).json({
        _id: isexistingUser._id,
        username: isexistingUser.username,
        email: isexistingUser.email,
        isAdmin: isexistingUser.isAdmin,
    })
    return
})


const logoutCurrentUser = asyncHandler(async (req, res, nect) => {
    res.cookie('jwt', '', {
        htmlOnly: true,
        expires: new Date(0),
    })
    res.status(200).json({ message: 'User Logged out sucessfully' })
})

const getCurrentUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user) {
        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})

const updateCurrentUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (user) {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            user.password = hashedPassword
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })
    } else {
        res.status(404)
        throw new Error('User not found')
    }
})


// ADMIN ROUTES
const deleteUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (user) {
        if (user.isAdmin) {
            res.status(404)
            throw new Error('cannot delete Admin user.')
        }

        await user.deleteOne({ _id: user._id })
        res.status(200).json({ message: 'User deleted' })
    } else {
        res.status(404)
        throw new Error('User not found.')
    }
})

const getUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (user) res.status(200).json(user)
    res.status(404)
    throw new Error('User not found.')
})

const updateUserById = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (user) {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email
        user.isAdmin = Boolean(req.body.isAdmin) || user.isAdmin

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        })

    } else {
        res.status(404)
        throw new Error('User not found.')
    }
})

export {
    createUser,
    userLogin,
    getUsers,
    logoutCurrentUser,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUserById,
    getUserById,
    updateUserById
}