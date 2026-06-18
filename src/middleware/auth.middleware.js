const userModel = require("../models/user.model")
const jwt=require("jsonwebtoken")
const tokenBlackListModel=require("../models/blackList.model")

async function authMiddleware(req, res, next) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token) {
        return res.status(401).redirect('/login')  // also change this from json to redirect
    }
    
    const isBlacklisted = await tokenBlackListModel.findOne({
        token
    })
    if(isBlacklisted) {
        return res.status(401).redirect('/login')
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        req.user=user
        return next()
    } catch(err) {
        return res.status(401).redirect('/login')
    }
}

async function authSystemUserMiddleware(req,res,next) {
    const token = req.cookies.systemToken || req.headers.authorization?.split(" ")[1]
    if(!token) {
        return res.status(401).redirect('/login')
    }

    const isBlacklisted = await tokenBlackListModel.findOne({
        token
    })
    if(isBlacklisted) {
        return res.status(401).redirect('/login')
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }
        req.user = user
        return next()
    }
    catch(err) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}