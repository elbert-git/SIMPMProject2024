import dotenv from 'dotenv'
dotenv.config()

const constants = {
    jwt_secret: process.env.JWT_SECRET,
    mongoose_password: process.env.MONGOOSE_PASSWORD
}

export default constants