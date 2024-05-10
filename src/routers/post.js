const express = require('express')
const Post=require('../models/post')
const router=new express.Router()
const auth = require('../middleware/auth')

router.post('/posts/',auth, async (req,res) => {
//const post = new post(req.body)
const post = new Post({
    ...req.body,
    owner: req.user._id
})

    try{
        await post.save()
        res.status(201).send(post)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Dashboard
router.get('/dashboard/active', async (req,res) => {
   try{
    const posts = await Post.find({active: true})
    if(!posts)
        return res.status(404).send("No active positions.")
    const count = posts.length;
    res.status(200).send( { count, posts});
   } catch(e){
    res.status(500).send();
   }
})
router.get('/dashboard/inactive', async (req,res) => {
    try{
     const posts = await Post.find({active: false})
     if(!posts)
         return res.status(404).send("No active positions.")
     const count = posts.length;
     res.status(200).send({count, posts});
    } catch(e){
     res.status(500).send();
    }
 })

// GET /posts?limit=10&skip=0
router.get('/posts', auth, async (req,res) => {
    const match ={}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'? -1 : 1
    }
    try{
    await req.user.populate([{
        path: 'posts',
        match,
        // per documentation options need a default value
       options: {
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null,
        sort
       }
      }])
        res.status(200).send(req.user.posts)
    } catch(e) {
        res.send(500).send(e)
    }
})

router.get('/posts/:id', auth, async (req,res) => {
    const _id=req.params.id

    try{
        const post = await Post.findOne({_id, owner: req.user._id})
        if(!post)
        {
            return res.status(404).send()
        }
        res.send(post)
    } catch(e) {
        res.status(500).send(e)
    }
})

//Fetch by geolocation
router.get('/geoposts/', auth, async (req,res) => {
    

    try{
        const posts = await Post.find({ geolocation: req.body.geolocation})
        if(!posts)
        {
            console.log(posts)
            return res.status(404).send()
        }
        res.send(posts)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/posts/:id', auth, async (req,res) => {
    const allowedUpdates = ['title', 'body', 'active','geolocation']
    const updates=Object.keys(req.body)
    const isValidOperation=updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation)
    {
        return res.status(400).send({error: "Invalid update operation."})
    }
    try{
        const post = await Post.findOne({_id: req.params.id, owner: req.user._id})
        updates.forEach((update)=>post[update]=req.body[update])
        await Post.save()
    //const post = await post.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true})
    if(!post){
        return res.status(404).send()
    }
    res.send(post)
    } catch(e) {
        res.status(500).send(e)
    }
})


router.delete('/posts/:id', auth, async (req,res)=> {
    try{
    const post = await Post.findOneAndDelete({ _id:req.params.id, owner: req.user._id})

    
    if(!post){
        return res.status(404).send()
    }
    res.send(post)
} catch(e) {
    res.status(500).send(e)
}
})

module.exports=router