// packages
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

// Utiles
import connectDB from './config/db.js'

dotenv.config()

connectDB();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// use Helmet to set various HTTP headers for securities
app.use(helmet())

// Apply CSRF protection middleware
// app.use(csrfMiddleware)



import userRoutes from './routes/userRoutes.js'

app.use('/api/users', userRoutes)

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port: ${port}`))