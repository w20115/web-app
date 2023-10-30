const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000
const template = require('./lib/template.js')
const qs = require('querystring')

app.get('/', (req, res)=>{
    // const q = req.query
    // const name = q.name
    let {name} = req.query
    fs.readdir('page', (err, files) => {
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err, data)=>{
            let control = `<a href="/create">create</a> <a href="/update?name=${name}">update</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${name}">
                <button type="submit">delete</button>
            </form>
            `
            if(name === undefined){
                name = '영단어 암기장'
                data = '영단어를 외어봅시다...'
                control = `<a href="/create">create</a>`
            }
            const html = template.HTML(name, list, `<h2>${name}</h2> <p>${data}</p>`, control)
        res.send(html)
        })
    })
})

app.get('/create',(req,res)=>{
    fs.readdir('page',(err,files) => {
        const name = 'create'
        const list = template.list(files)
        const data = template.create()
        const html = template.HTML(name, list, data,'') // body=data
        res.send(html)
    })
})
app.get('/update', (req, res) => {
    let {name} = req.query
    fs.readdir('page', (err, files) => {
        let list = template.list(files)
        fs.readFile(`page/${name}`, 'utf8', (err, content) => {
            let control = `<a href="/create">create</a> <a href="/update?name=${name}">update</a>
            <form action ="delete_process" method="post">   
                <input type='hidden' name ='id' value='${name}'>
                <button type="submit">delete</button>
            </form>
            `
            const data = template.update(name, content)
            const html = template.HTML(name, list, `<h2>${name} 페이지</h2><p>${data}</p>`, control)
            res.send(html);
        })
    })
})

app.post('/delete_process', (req,res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body + data
    }) 
    req.on('end', ()=>{
        const post = qs.parse(body)
        const id = post.id
        fs.unlink(`page/${id}`,(err)=>{
            res.redirect(302,'/')
        })
    })
})



app.post('/create_process',(req, res) =>{//res.send('성공')
    let body = ''
    req.on('data',(data) =>{
        body= body + data
    })
    req.on('end', () =>{
        const post = qs.parse(body)//console.log(post)
        const title = post.title
        const description = post.description
        fs.writeFile(`page/${title}`, description, 'utf8', (err)=>{//res.send('성공')
            res.redirect(302, `/?name=${title}`)//처리 후 다른 page 이동
        })
        
    })
})
app.post('/update_process', (req,res)=>{
    let body = ''
    req.on('data', (data)=>{
        body = body+data
    }) 
    req.on('end', ()=>{
        const post = qs.parse(body)
        const id = post.id
        const title = post.title
        const description = post.description
        fs.rename(`page/${id}`,`page/${title}`,(err)=>{
            fs.writeFile(`page/${title}`, description, 'utf8', (err)=>{//res.send('성공')
                res.redirect(302, `/?name=${title}`)//처리 후 다른 page 이동
            })
        })
    }) 
})

app.listen(port, ()=>{
    console.log(`sever running on port ${port}`)
})