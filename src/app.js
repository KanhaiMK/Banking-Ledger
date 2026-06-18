const express = require("express");
const app = express();
const path=require('path');

const cookieParser = require("cookie-parser")

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())


const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")
const fundRequestRoutes = require("./routes/fundRequest.routes")
const systemRoutes = require("./routes/system.routes")
const profileRoutes = require("./routes/profile.routes")

// Signup route - opens signup tab
app.get('/', (req, res) => {
    res.render('app', {
        title: 'Banking app',
        activeTab: 'signup',
        query: req.query
    })
})
// Login route - opens login tab
app.get('/login', (req, res) => {
    res.render('app', {
        title: 'Banking app',
        activeTab: 'login',
        query: req.query
    })
})

app.use("/auth", authRouter)
app.use("/accounts", accountRouter)
app.use("/transactions",transactionRoutes)
app.use("/funds", fundRequestRoutes)
app.use("/system", systemRoutes)
app.use("/profile", profileRoutes)

module.exports = app