const express=require('express')
const User = require('../models/user')
const router=new express.Router()
const auth = require('../middleware/auth')

//Registration
router.post('/registration', async (req, res) => {
    const user =new User(req.body)

    try {
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
   
})

//Login
router.post('/users/login', async (req,res) => {
    try {
        const user= await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch(e){
        res.status(400).send()
    }
})

//Logout
router.post('/users/logout', auth, async (req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try{
        req.user.tokens= []
        await req.user.save()
        res.status(200).send()
    } catch(e) {
        res.status(500).send()
    }
})

//Profile
router.get('/users/me', auth ,async (req,res) => {
    res.send(req.user)
})

//Update
router.patch('/users/me', auth, async (req,res) => {
    const allowedUpdates = ['name','email','password', 'age']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        // const user = await User.findById(req.params.id)

        updates.forEach((update)=> req.user[update]=req.body[update])
        await req.user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        res.send(req.user)
    } catch(e)
    {
        res.status(400).send(e)
    }
})


router.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        // {
        //     return res.status(404).send()
        // }

       await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})



module.exports=router