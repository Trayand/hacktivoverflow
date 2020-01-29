const User = require('../models/user')
const { genToken } = require('../helpers/jwt')
const { dehash } = require('../helpers/bcrypt')

class Controller {

    static getAllUser(req, res, next) {
        User.find()
            .then((user) => {
                res.status(200).json(user)
            }).catch(next);
    }

    static register(req, res, next) {
        const { email, password, photo, name } = req.body

        User.create({ email, password, photo, name })
            .then((user) => {
                let token = genToken({ id: user._id })
                res.status(201).json(token)
            }).catch(next);
    }

    static login(req, res, next) {
        const { input, password } = req.body

        User.findOne({ $or: [{ email: input }, { name: input }] })
            .then((user) => {
                if (!user || !dehash(password, user.password)) throw ({ status: 400, msg: "username/email or password incorrect" })

                let token = genToken({ id: user._id })
                res.status(200).json(token)
            }).catch(next);
    }

    static addTags(req, res, next) {
        console.log(req.body.tags);
        const { tags } = req.body
        // tags = ['ayam', 'goreng']
        User.findByIdAndUpdate(req.decoded.id, {
            $addToSet: { watched_tags: { $each: tags } }
        }, { new: true }).select('watched_tags -_id')
            .then((user) => {
                res.status(200).json(user)
            }).catch(next);
    }

    static removeTag(req, res, next) {
        User.findByIdAndUpdate(req.decoded.id, {
            $pull: { watched_tags: req.params.tag }
        }, { new: true }).select('watched_tags -_id')
            .then((user) => {
                res.status(200).json(user)
            }).catch(next);
    }

}

module.exports = Controller