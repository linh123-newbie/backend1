/* eslint-env node */
const ApiError = require("./app/api-error");
const express = require("express")
const cors = require("cors");
const contactsRouters = require("./app/routes/contact.route")
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactsRouters)

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to backend1" });
});

module.exports = app;
